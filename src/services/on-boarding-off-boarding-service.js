
const AcctMgmtService = require("./acct-mgmt-service");
const config = require("config");
const logger = require("log4js").configure(config.get("log4js")).getLogger("onboarding-offboarding-service");
const mock = config.get("mock_run");
const xlsx = require("node-xlsx");
const excel = require("excel4node");
const workbook = new excel.Workbook();
const style = workbook.createStyle({ font: { color: "#0101FF", size: 11 } });
const worksheet = workbook.addWorksheet("Onboard Offboard");
const dupAcctWorksheet = workbook.addWorksheet("Duplicate Accounts");
let onBoardAccountCount = 0;
let offBoardAccountCount = 0;

class OnboardingOffBoardingAccountService {
    async startSyncUp() {
        logger.debug(`Process Started at ${new Date().toUTCString()}`);
        logger.info("Initializing the required components.");
        const acctMgmt = new AcctMgmtService();
        // Fetch Access Token To Connect Acct Mgmt
        logger.info("Get Access Token To Communicate To Account Mgmt.");
        const token = await acctMgmt.getToken();

        // Set Column Names for Onboard Offboard Sheet
        worksheet.cell(1, 1).string("Account Code").style(style);
        worksheet.cell(1, 2).string('Account Name').style(style);
        worksheet.cell(1, 3).string('Focus Status').style(style);
        worksheet.cell(1, 4).string('Market Name').style(style);
        worksheet.cell(1, 5).string('Geo').style(style);
        worksheet.cell(1, 6).string('ACTS Status').style(style);
        worksheet.cell(1, 7).string('Action').style(style);
        worksheet.cell(1, 8).string('Focus Status Changed From').style(style);
        worksheet.cell(1, 9).string('Consolidated Id').style(style);

        // Set Column Names for duplicate Account Sheet        
        dupAcctWorksheet.cell(1, 1).string('Account Code').style(style);
        dupAcctWorksheet.cell(1, 2).string('Account Name').style(style);
        dupAcctWorksheet.cell(1, 3).string('State').style(style);
        dupAcctWorksheet.cell(1, 4).string('Consolidated Id').style(style);
        

        if (token.access_token) {
            if (mock) {
                logger.info("=========================");
                logger.info("    Mock Run - Performing Read only and no write operation");
                logger.info("=========================");
            }            

            logger.info(`Read Prod "mv_business_unit" and "v_account" Excel Data `);
            const businessUnitMVProdData = xlsx.parse('./src/files/mv_business_unit.csv');
            
            const accountViewProdData = xlsx.parse('./src/files/account.csv');

            // Map Business Unit Data and Market
            let catalystBusinessUnit = new Map();
            let catalystMarketMap = new Map();
            businessUnitMVProdData[0].data.forEach((e, index) => {
                if(index > 0){
                    let data = {
                        geo_cd: e[0] || '',
                        geo_nm: e[1] || '',
                        market_eds_cd: e[2] || '',
                        market_eds_nm: e[3] || '',
                        market_acts_id: e[4] || '',
                        market_id: e[5] || '',
                        market_acts_nm: e[6] || '',
                        mkt_leader_cnum: e[7] || '',
                        mkt_leader_nm: e[8] || '',
                        client_unit_cd: e[9] || '',
                        client_unit_id: e[10] || '',
                        client_unit_nm: e[11] || '',
                        cu_leader_cnum: e[12] || '',
                        cu_leader_nm: e[13] || '',
                        sub_client_unit_cd: e[14] || '',
                        sub_client_unit_id: e[15] || '',
                        sub_client_unit_nm: e[16] || '',
                        scu_leader_cnum: e[17] || '',
                        scu_leader_nm: e[18] || '',
                        account_cd: e[19] || '',
                        account_nm: e[20] || '',
                        acc_pe_cnum: e[21] || '',
                        acc_pe_nm: e[22] || '',
                        market_sts: e[23] || '',
                        client_unit_sts: e[24] || '',
                        sub_client_unit_sts: e[25] || '',
                        account_sts: e[26] || '',
                        acts_flg: e[27] || '',
                        md_flg: e[28] || '',
                        na_flg: e[29] || '',
                        u_flg: e[30] || '',
                        focus_status: e[31] || '',
                        active: e[32] || ''
                    };
                    catalystBusinessUnit.set(data.account_cd, data);

                    // Mapping the Market Names
                    if(e[5]){
                        catalystMarketMap.set(e[5], e[6]);
                    }
                }
            });

            // Map Account View Data
            let catalystAccountView = new Map();
            accountViewProdData[0].data.forEach((e, index) => {
                if(index > 0){
                    let data = {
                        id: e[0] || '',
                        acts_acct_name: e[1] || '',
                        acts_acct_id: e[2] || '',
                        acts_business_id: e[3] || '',
                        geo_cd: e[4] || '',
                        market_cd: e[5] || '',
                        global_account_id: e[6] || '',
                        delegation_state: e[7] || '',
                        is_top_level: e[8] || '',
                        focus_status: e[9] || '',
                        active: e[10] || '',
                        updated_ts: e[11] || '',
                        client_unit_id: e[12] || '',
                        market_id: e[13] || '',
                        eds_market_cd: e[14] || '',
                        eds_geo_cd: e[15] || '',
                        client_subunit_id: e[16] || '',
                        status: e[17] || '',
                        prev_focus_status: e[18] || '',
                        prev_acts_business_id: e[19] || '',
                        focus_status_updated_at: e[20] || ''
                    };

                    catalystAccountView.set(data.acts_business_id, data);
                }
            });                

            // Get All Catalyst Accounts, Acct Mgmt Accounts, Acct Mgmt Entilements and Acct Mgmt DPE Groups
            logger.info("Get All Acct Mgmt Catalyst Accounts");
            const accounts = await acctMgmt.getAllAccounts("(Catalyst)");            

            // Sanitize and Inititalize the Responses
            logger.info("Sanitizing and Inititalizing the Response.");
            const adminAccounts = accounts.accounts || [];
            logger.debug("Total number of Admin Accounts - " + adminAccounts.length);

            // Check Admin is empty
            if (adminAccounts.length > 0) {
                let duplicateAccountInAdminPortal = new Map();
                let iteratingAccountMap = new Map();                
                let execelRowIndex = 2;
                let dupAcctSheetRowIndex = 2;

                adminAccounts.forEach((iteratingAdminAccount) => {
                    let action = '';
                    const iteratingAccountCode = iteratingAdminAccount.attrs && iteratingAdminAccount.attrs['ibm:business-id'] ? iteratingAdminAccount.attrs['ibm:business-id'] : '';

                    // Skip if Account Code is not present
                    if(iteratingAccountCode){
                        logger.info(`Iterating Account with Account Code: ${iteratingAccountCode}`);
                        // Fetch Business Unit data
                        const businessUnitData = catalystBusinessUnit.get(iteratingAccountCode);
                        // Fetch Account View data
                        const accountViewData = catalystAccountView.get(iteratingAccountCode);

                        // If account not exists in Business unit it should be off-boarded
                        if(!businessUnitData && iteratingAdminAccount.state == 'active'){
                            logger.info(`Account: ${iteratingAdminAccount.name} with Account Code: ${iteratingAccountCode} is to be Off-Boarded`);

                            // Add to off-boarding list
                            action = 'off-board';
                            offBoardAccountCount++;
                        }

                        // If account exists in Business Unit and is not active in Admin-Portal, On-board it
                        else if(businessUnitData && iteratingAdminAccount.state == 'inactive'){
                            logger.info(`Account: ${iteratingAdminAccount.name} with Account Code: ${iteratingAccountCode} is to be On-Boarded`);

                            // Add to on-boarding list
                            action = 'on-board';
                            onBoardAccountCount++;
                        }

                        // Focus Status changed Accounts
                        else if(businessUnitData && accountViewData && accountViewData.prev_focus_status && accountViewData.prev_focus_status != accountViewData.focus_status){
                            logger.info(`Account: ${iteratingAdminAccount.name} with Account Code: ${iteratingAccountCode} is changed in Focus Status from ${accountViewData.prev_focus_status} to ${accountViewData.focus_status}`);

                            // Add to focus status change list
                            action = 'focus-changed'
                        }

                        let acct_name = '';
                        let focus_status = '';
                        let market_name = '';                        
                        let geo_name = '';
                        let account_status = '';
                        let focus_status_change = '';

                        if(businessUnitData){
                            acct_name = businessUnitData.account_nm;
                            focus_status = businessUnitData.focus_status;
                            market_name = businessUnitData.market_acts_nm;
                            geo_name = businessUnitData.geo_cd;
                            account_status = businessUnitData.account_sts
                        }
                        else if(accountViewData){
                            acct_name = accountViewData.acts_acct_name;
                            focus_status = accountViewData.focus_status;
                            market_name = accountViewData.market_id ? catalystMarketMap.get(accountViewData.market_id) || '' : '';
                            geo_name = accountViewData.geo_cd;
                            account_status = accountViewData.status;
                            focus_status_change = action == 'focus-changed' ? accountViewData.prev_focus_status : '';
                        }

                        // Generate report
                        if(action){
                            worksheet.cell(execelRowIndex, 1).string(iteratingAccountCode).style(style);
                            worksheet.cell(execelRowIndex, 2).string(acct_name).style(style);
                            worksheet.cell(execelRowIndex, 3).string(focus_status).style(style);
                            worksheet.cell(execelRowIndex, 4).string(market_name).style(style);
                            worksheet.cell(execelRowIndex, 5).string(geo_name).style(style);
                            worksheet.cell(execelRowIndex, 6).string(account_status).style(style);
                            worksheet.cell(execelRowIndex, 7).string(action).style(style);
                            worksheet.cell(execelRowIndex, 8).string(focus_status_change).style(style);
                            worksheet.cell(execelRowIndex, 9).string(iteratingAdminAccount.id).style(style);
                            execelRowIndex++;
                        }

                        // Check for duplicates
                        const acctData = { account_code: iteratingAccountCode, account_name: acct_name, state: iteratingAdminAccount.state, consolidated_id: iteratingAdminAccount.id };
                        const consolidatedAccounts = iteratingAccountMap.get(iteratingAccountCode);
                        if(consolidatedAccounts){
                            consolidatedAccounts.push(acctData);
                            duplicateAccountInAdminPortal.set(iteratingAccountCode, consolidatedAccounts);
                            iteratingAccountMap.set(iteratingAccountCode, consolidatedAccounts);
                        }
                        else {
                            // Add consolidated-id in the iterating record                        
                            iteratingAccountMap.set(iteratingAccountCode, [acctData]);
                        }                        
                    }
                });

                // Generate report for duplicate records
                const duplicateAccounts = Array.from(duplicateAccountInAdminPortal.keys());
                duplicateAccounts.forEach((eachAccountCode) => {
                    const consolidatedAccount = duplicateAccountInAdminPortal.get(eachAccountCode);
                    consolidatedAccount.forEach((eachConsolidatedAccount) => {
                        dupAcctWorksheet.cell(dupAcctSheetRowIndex, 1).string(eachConsolidatedAccount.account_code).style(style);
                        dupAcctWorksheet.cell(dupAcctSheetRowIndex, 2).string(eachConsolidatedAccount.account_name).style(style);
                        dupAcctWorksheet.cell(dupAcctSheetRowIndex, 3).string(eachConsolidatedAccount.state).style(style);
                        dupAcctWorksheet.cell(dupAcctSheetRowIndex, 4).string(eachConsolidatedAccount.consolidated_id).style(style);
                        dupAcctSheetRowIndex++;
                    });
                });
                
                // Write in the excel
                workbook.write("Production_Accounts_03.09.22.xlsx");

            } else {
                logger.error("Terminating the execution since Admin Account list is empty");                    
            }

            endProcessLogs();
        }
        else{
            logger.error("Account Mgmt Access Token Unavailable To Process The Job.");
            endProcessLogs();
        }        

        function endProcessLogs(){
            logger.debug(`Process Ended at: ${new Date().toUTCString()}`);
            logger.debug(`On Board Account Count: ${onBoardAccountCount}`);
            logger.debug(`Off Account Count: ${offBoardAccountCount}`);
        }
    }
}

module.exports = OnboardingOffBoardingAccountService;
