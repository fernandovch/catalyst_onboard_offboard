const request = require("request");
const config = require("config");
const adminHost = config.clients["acct-mgmt"].uri;
let adminBearerToken = null;
let adminJsonWebToken = null;
const logger = require("log4js").getLogger("acct-mgmt-service");
const { v4: uuidv4 }  = require("uuid");
const acctMgmtClient = require("@cmas/client-acct-mgmt").new(config.clients["acct-mgmt"]);
class AcctMgmtService {
    SendRequest(InputParams, callback) {
        request(
            {
                url: InputParams.url,
                method: InputParams.method,
                headers: {
                    "Content-Type": "application/json",
                    json: true,
                    authorization: InputParams.token
                },
                body: JSON.stringify(InputParams.data)
            },
            function (error, response, body) {
                if (error) callback(error);
                else {
                    try {
                        callback(null, response, body);
                    } catch (e) {
                        callback(e);
                    }
                }
            }
        );
    }

    accountCreation(account) {
        const { accountName, accountCode } = account;
        const inputData = {
            name: accountName,
            entitlements: [],
            access_code: {
                expires_date: "",
                created_date: "",
                used_date: ""
            },
            settings: {
                support: { includeExtCRFields: false }
            },
            attrs: {
                "service-now:model": "csm",
                "serviceNow-acct": [],
                Testacct: false,
                "ibm:business-id": accountCode,
                "ibm:super-tenant-id": "ibm-catalyst"
            },
            json: true
        };

        const InputParams = {
            url: adminHost + "/v1/consolidated-acct",
            method: "post",
            data: inputData,
            token: adminBearerToken
        };

        logger.info("Account Creation input payload  : " + JSON.stringify(inputData));

        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error(accountName + " - Account creation fails : Error Message - " + error);
                    resolve(null);
                } else {
                    try {
                        if (response.statusCode === 201) {
                            const result = JSON.parse(body);
                            logger.info(result.name + " - Account Created");
                            resolve(result);
                        } else {
                            logger.error(accountName + " - Account creation fails : Error Message - " + response.body);
                            resolve({
                                error: body,
                                statusCode: response.statusCode,
                                payload: account
                            });
                        }
                    } catch (e) {
                        logger.error(accountName + " - Account creation fails : Error Message - " + e);
                        resolve(null);
                    }
                }
            });
        });
        return promise;
    }

    updateAccount(acctName, payload, consolidatedId) {
        const InputParams = {
            url: adminHost + `/v1/consolidated-acct/${consolidatedId}`,
            method: "put",
            data: payload,
            token: adminBearerToken
        };

        logger.info("Account Update input payload  : " + JSON.stringify(payload));

        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error(acctName + " - Account update fails : Error Message - " + error);
                    resolve(null);
                } else {
                    try {
                        if (response.statusCode === 200) {
                            const result = JSON.parse(body);
                            logger.info(result.name + " - Account updated");
                            resolve(result.id);
                        } else {
                            logger.error(acctName + " - Account update fails : Error Message - " + response.body);
                            resolve(null);
                        }
                    } catch (e) {
                        logger.error(acctName + " - Account update fails : Error Message - " + e);
                        resolve(null);
                    }
                }
            });
        });
        return promise;
    }

    dpeGroupsCreation(dpeGroup) {
        const { accountId, accountName, dpeName, emailId } = dpeGroup;
        const data = {
            name: dpeName,
            user_mails: emailId,
            consolidated_accounts: accountId,
            json: true
        };

        const InputParams = {
            url: adminHost + "/v1/acct-group",
            method: "post",
            data: data,
            token: adminBearerToken
        };

        logger.info("DPE Creation input payload  : " + JSON.stringify(data));

        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error(accountName + " - Failed adding DPE Group : Error Message - " + error);
                    resolve(true);
                } else {
                    try {
                        if (response.statusCode === 201) {
                            logger.info(accountName + " - Added DPE Group -" + dpeName);
                            resolve(JSON.parse(body));
                        } else {
                            logger.error(accountName + " - Failed adding DPE Group : Error Message - " + response.body);
                            resolve({
                                error: response.body,
                                statusCode: response.statusCode,
                                payload: dpeGroup
                            });
                        }
                    } catch (e) {
                        logger.error(accountName + " - Failed adding DPE Group : Error Message - " + e);
                        resolve(true);
                    }
                }
            });
        });
        return promise;
    }

    deleteDPEGroup(consolidatedId, name) {
        const InputParams = {
            url: adminHost + "/v1/acct-group/" + consolidatedId,
            method: "delete",
            token: adminBearerToken
        };

        logger.info("DPE Group delete input payload  : " + JSON.stringify(InputParams));

        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error(name + " - Deleting DPE Group : Error Message - " + error);
                    resolve(true);
                } else {
                    try {
                        if (response.statusCode === 200) {
                            logger.info(name + " - Deleted DPE Group - ");
                            resolve(true);
                        } else {
                            logger.error(name + " - Failed deleting DPE Group : Error Message - " + response.body);
                            resolve(true);
                        }
                    } catch (e) {
                        logger.error(name + " - Failed deleting DPE Group : Error Message - " + e);
                        resolve(true);
                    }
                }
            });
        });
        return promise;
    }

    getEntitlements() {
        const InputParams = {
            url: adminHost + "/v1/entitlements",
            method: "get",
            token: adminBearerToken
        };

        logger.info(`Payload to get Entitlements: ${JSON.stringify(InputParams)}`);
        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error("Entitlement list call - Failed" + ": Error Message - " + error);
                    resolve({});
                } else {
                    try {
                        if (response.statusCode === 200) {
                            logger.info("Entitlement list call - Success");
                            resolve(JSON.parse(body));
                        } else {
                            logger.error("Entitlement list call - Failed : Error Message - " + response.body);

                            resolve({});
                        }
                    } catch (e) {
                        logger.error("Entitlement list call - Failed : Error Message - " + e);
                        resolve({});
                    }
                }
            });
        });
        return promise;
    }

    async mapEntitlements(entitlementInformation) {
        const { accountId, accountName, entitlement } = entitlementInformation;
        const InputParams = {
            url: adminHost + "/v1/consolidated-acct/" + accountId + "/entitlements?" + accountId,
            method: "put",
            token: adminBearerToken,
            data: {
                id: accountId,
                entitlements: entitlement,
                json: true
            }
        };
        logger.info("Map Entitlement input payload  : " + JSON.stringify(InputParams.data));

        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error(accountName + "Failed mapping entitlement : Error Message - " + error);
                    resolve(true);
                } else {
                    try {
                        if (response.statusCode === 200) {
                            logger.info(accountName + " - Mapped Entitlement");
                            resolve({
                                statusCode: response.statusCode,
                                payload: entitlementInformation
                            });
                        } else {
                            logger.error(accountName + "Failed mapping entitlement : Error Message - " + response.body);
                            resolve({
                                error: body,
                                statusCode: response.statusCode,
                                payload: entitlementInformation
                            });
                        }
                    } catch (e) {
                        logger.error(accountName + "Failed mapping entitlement : Error Message - " + e);
                        resolve({
                            error: e,
                            statusCode: 500,
                            payload: entitlementInformation
                        });
                    }
                }
            });
        });
        return promise;
    }

    async getDPEGroups() {
        const InputParams = {
            url: adminHost + "/v1/acct-group",
            token: adminBearerToken,
            method: "get"
        };

        logger.info(`Payload to get DPE Groups: ${JSON.stringify(InputParams)}`);
        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error("DPE Groups Search - Failed" + ": Error Message - " + error);
                    resolve([]);
                } else {
                    try {
                        if (response.statusCode === 200) {
                            logger.info("DPE Groups Search call - Success");
                            resolve(JSON.parse(body));
                        } else {
                            logger.error("DPE Groups Search call - Failed : Error Message - " + response.body);
                            resolve([]);
                        }
                    } catch (e) {
                        logger.error("DPE Groups Search call - Failed : Error Message - " + e);
                        resolve([]);
                    }
                }
            });
        });
        return promise;
    }

    async DPEGroupsUpdate(dpeGroup) {
        const { id, name, consAccId, dpeEmailIds } = dpeGroup;
        const data = {
            id: id,
            name: name,
            user_mails: dpeEmailIds,
            consolidated_accounts: consAccId,
            json: true
        };

        const InputParams = {
            url: adminHost + "/v1/acct-group/" + id,
            method: "put",
            token: adminBearerToken,
            data: data
        };

        logger.info("DPE Group update input payload  : " + JSON.stringify(data));

        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error(name + " - Updating DPE Group : Error Message - " + error);
                    resolve(true);
                } else {
                    try {
                        if (response.statusCode === 200) {
                            logger.info(name + " - Updated DPE Group - ");
                            resolve(JSON.parse(body));
                        } else {
                            logger.error(name + " - Failed adding DPE Group : Error Message - " + response.body);
                            resolve({
                                error: body,
                                statusCode: response.statusCode,
                                payload: dpeGroup
                            });
                        }
                    } catch (e) {
                        logger.error(name + " - Failed adding DPE Group : Error Message - " + e);
                        resolve(true);
                    }
                }
            });
        });
        return promise;
    }

    async getToken() {
        const data = {
            api_key: config.auth_token.api_key,
            json: true
        };

        const InputParams = {
            url: config.auth_token.url,
            method: "post",
            data: data
        };

        logger.info(`Payload to get acct mgmt access token: ${JSON.stringify(InputParams)}`);
        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error("Failed to get Token : Error block - " + error);
                    resolve(true);
                } else {
                    try {
                        if (response.statusCode === 200) {
                            logger.info(" - Token success - ");
                            body = JSON.parse(body);
                            adminBearerToken = "bearer " + body.access_token;
                            adminJsonWebToken = body.access_token;
                            resolve(body);
                        } else {
                            logger.error("Failed to get Token : else Error Message - " + response.body);
                            resolve(true);
                        }
                    } catch (e) {
                        logger.error("Failed to get Token: catch Error Message - " + e);
                        resolve(true);
                    }
                }
            });
        });
        return promise;
    }

    async activateDeactivateAccount(account) {
        const { accountId, accountName, action } = account;
        const InputParams = {
            url: adminHost + "/v1/consolidated-acct/" + accountId + "/" + action,
            method: "patch",
            token: adminBearerToken
        };
        const promise = new Promise((resolve) => {
            this.SendRequest(InputParams, function (error, response, body) {
                if (error) {
                    logger.error(accountName + " : " + action + " fails : Error Message - " + error);
                    resolve(null);
                } else {
                    try {
                        if (response.statusCode === 200) {
                            logger.info(accountName + " : " + action + " - Success ");
                            resolve(JSON.parse(body));
                        } else {
                            logger.error(accountName + " : " + action + " - fails : Error Message - " + response.body);
                            resolve({
                                error: body,
                                statusCode: response.statusCode,
                                payload: account
                            });
                        }
                    } catch (e) {
                        logger.error(accountName + " : " + action + " - fails : Error Message - " + e);
                        resolve(null);
                    }
                }
            });
        });
        return promise;
    }

    async getAllAccounts(accountName) {
        let response = { accounts: [], total_count: 0 };
        let result = {};
        const limit = 5000;

        try {
            // Calling the acct mgmt service to get all the accounts
            do {
                result = await acctMgmtClient.getConsolidatedAccountsLike(adminJsonWebToken, limit, response.accounts.length, accountName);
                if(result.accounts === undefined || result.total_count === undefined){
                    throw new Error("Error fetching accounts from account-mgmt in blocks");
                }

                response.accounts.push(...result.accounts);
                response.total_count = result.total_count;
            } while(result.total_count > response.accounts.length);
        } catch (error) {
            logger.error("Error retrieving the accounts", error);
            response = { error: "Error retrieving the accounts" };
        }
        return response;
    }

    async createMissingResource(account) {
        let response = {};
        const requestId = uuidv4();
        try {
            logger.info(`[${requestId}] Creating the missing resource for the account ${account.name} with payload: ${JSON.stringify(account)}`);
            // Calling the update account just to execute the creation of the missing resource
            const result = await acctMgmtClient.updateConsolidatedAccount(adminJsonWebToken, account, requestId);
            response = { result, status: 200 };
        } catch (error) {
            logger.error(`[${requestId}] Error On Create Missing Resource For Account: ${account.name}. Error: `, error);
            response = { error: error.message || "Error updating the account", status: error.status , account: account };
        }
        return response;
    }
}

module.exports = AcctMgmtService;
