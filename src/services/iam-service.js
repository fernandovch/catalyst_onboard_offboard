const config = require("config");
const log4js = require("log4js").getLogger("IamService");
const iamClient = require("@cmas/client-dx-iam").new(config.clients["dx-iam"]);
const { v4: uuidv4 }  = require('uuid');

class IamService {
    async createPolicy(authorizationToken, policy) {
        const { resource, subject } = policy;
        let response = {};

        try {
            log4js.info(
                `Creating the missing policy for the user ${subject} and resource id ${resource} with policy: `,
                policy
            );
            // Calling the IAM service to store the policy
            response = await iamClient.createPolicy(authorizationToken, policy);
        } catch (error) {
            log4js.error(`Error saving the policy for the resource id ${resource}`, error);
            response = {
                error: "Policy could not be saved due to an internal error",
                statusCode: error.status || 503,
                policy
            };
        }
        return response;
    }

    async getPoliciesByScope(authorizationToken, scope) {
        let response = {};

        try {
            log4js.info(`Retrieving all the policies for the scope ${scope}`);
            // Calling the IAM service to get the policies
            response = await iamClient.getPoliciesByScope(authorizationToken, scope, null, true);
        } catch (error) {
            log4js.error(`Error retrieving the policies for the scope ${scope}`, error);
            response = { error: "Policy could not be retrieved due to an internal error" };
        }
        return response;
    }

    async deletePolicies(authorizationToken, policy) {
        const { resource, subject, roles } = policy;
        let response = {};

        try {
            log4js.info(
                `Deleting the policies ${JSON.stringify(roles)} for the user ${subject} and the resource ${resource}`
            );
            // Calling the IAM service to get the policies
            response = await iamClient.deletePolicies(authorizationToken, resource, subject, roles);
        } catch (error) {
            log4js.error(
                `Error deleting the policies ${JSON.stringify(
                    roles
                )} for the user ${subject} and the resource ${resource}`,
                error
            );
            response = {
                error: "Policies could not be deleted due to an internal error",
                statusCode: error.status || 503,
                policy
            };
        }
        return response;
    }

    async createResource(authorizationToken, resource) {
        let response = {};
        const requestId = uuidv4();
        try {            
            log4js.info(`[${requestId}] Creating resource for resource-type ${resource.type} and resource id ${resource.crn}`);
            // Calling the IAM service to store the resource
            const result = await iamClient.createResource(authorizationToken, resource, requestId);
            response = { result, status: 200 }

        } catch (error) {
            log4js.error(`[${requestId}] Error creating the resource for resource-type ${resource.type} and resource id ${resource.crn}`, error);

            response = { error: error.message || "Resource could not be created due to an internal error", status: error.status , resource: resource };
        }
        return response;
    }

    async getResourceByCrn(authorizationToken, resourceCrn) {
        let response = {};

        try {
            log4js.info(`Fetching resource for resource id ${resourceCrn}`);
            // Calling the IAM service to store the resource
            response = await iamClient.getResourceByCrn(authorizationToken, resourceCrn);
        } catch (error) {
            log4js.error(`Error fetching resource for the resource id ${resourceCrn}`, error);
            response = {
                error: error.status === 404 ? "Resource not found" : error.message,
                error_status: error.status
            };
        }
        return response;
    }

    async getAllResources(authorizationToken, scope) {
        let response = { result: [] };
        let resources = {};
        const requestId = uuidv4();
        try {
            // Calling the IAM service to get the resources
            log4js.info(`[${requestId}] Retrieving all resources from IAM for scope ${scope}`);
            do {
                resources = await iamClient._getResources(authorizationToken, scope, [], [], 5000, response.result.length, requestId);            
                if(resources.total_count == undefined || resources.result == undefined ){
                    throw new Error(`[${requestId}] Error fetching resources from IAM in blocks`);
                }

                response.result.push(...resources.result);
            } while(response.result.length < resources.total_count)

        } catch (error) {
            log4js.error(`[${requestId}] Error retrieving the resources for the scope ${scope}`, error);
            response = { error: "Resources could not be retrieved due to an internal error" };
        }
        return response;
    }
}

module.exports = IamService;
