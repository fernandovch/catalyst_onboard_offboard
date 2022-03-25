const AcctMgmtService = require("./acct-mgmt-service");
const _ = require("underscore");
const __ = require("lodash");
const config = require("config");
const logger = require("log4js")
    .configure(config.get("log4js"))
    .getLogger("sync-up-service");
const mock = config.get("mock_run");
const activate_Accts = require('../data_Local_Check/activate_acct_data_29_Apr_2021.js');
// const deActivate_Accts = require('../data_Local_Check/deactivate_acct_data_22_mar_21');
let activatedAcctCount = 0;
let unchangedAcctCount = 0;
let unchangedAcctList = [];

class ActivateAcctService {
    async startSyncUp() {
        logger.debug(`Process Started at ${new Date().toUTCString()}`);
        logger.info(`Initializing the required components.`);
        const acctMgmt = new AcctMgmtService();

        // Fetch Access Token To Connect Acct Mgmt
        logger.info(`Get Access Token To Communicate To Account Mgmt.`);
        const token = await acctMgmt.getToken();
        if (token.access_token) {
            if (mock) {
                logger.info("=========================");
                logger.info("    Mock Run - Performing Read only and no write operation");
                logger.info("=========================");
            }

            // Get All Catalyst Accounts, Acct Mgmt Accounts, Acct Mgmt Entilements and Acct Mgmt DPE Groups
            logger.info(`Get All Acct Mgmt Catalyst Accounts`);
            Promise.all([
                acctMgmt.getAdminAccount("(Catalyst)")
            ]).then(async function (accounts) {
                logger.info(`Sanitizing and Inititalizing the Response.`);
                //Sanitize and Inititalize the Responses
                const adminAccounts = accounts[0].accounts ? accounts[0].accounts : [];
                 //Log the response
                 logger.debug("Total number of Admin Accounts - " + adminAccounts.length);

                // Check Admin is empty
                if (adminAccounts.length > 0) {
                    //Iterating through Each Admin Account
                    for (const eachAcct of activate_Accts.accts){
                        const need_To_Be_Activated = adminAccounts.find(e => eachAcct == e.attrs['ibm:business-id'])
                        if(need_To_Be_Activated){
                            activatedAcctCount++;
                            console.log(`Need to be Activated Account: ${eachAcct}`);
                            if(!mock){
                                await acctMgmt.activateDeactiveAccount(need_To_Be_Activated.id, need_To_Be_Activated.name, "activate");
                            }                            
                        }
                        else{
                            unchangedAcctCount++;
                            unchangedAcctList.push(eachAcct);
                        }
                    }
                } else {
                    logger.error("Terminating the execution since Admin Account list is empty");                    
                }

                endProcessLogs();
            });
        }
        else{
            logger.error("Account Mgmt Access Token Unavailable To Process The Job. Will Be Retried Again in the Next Scheduled Interval.");
            endProcessLogs();
        }        

        function endProcessLogs(){
            logger.debug(`Process Ended at: ${new Date().toUTCString()}`);
            logger.debug(`Account De-Activated Count: ${activatedAcctCount}`);
            logger.debug(`Account Remain Unchanged Count: ${unchangedAcctCount}`);
            logger.debug(`Account Remain Unchanged Accounts: ${unchangedAcctList.join(',')}`);
        }
    }
}

module.exports = ActivateAcctService;
