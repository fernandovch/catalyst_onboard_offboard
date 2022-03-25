const RESOURCE_MAPPER = Object.freeze({
    ACCOUNT_RESOURCE: {
        serviceName: "acct-mgmt",
        resourceType: "account"
    },
    GEO_RESOURCE: {
        serviceName: "catalyst",
        resourceType: "geo"
    },
    MARKET_RESOURCE: {
        serviceName: "catalyst",
        resourceType: "market"
    },
    CLIENT_UNIT_RESOURCE: {
        serviceName: "catalyst",
        resourceType: "client-unit"
    },
    SUB_CLIENT_UNIT_RESOURCE: {
        serviceName: "catalyst",
        resourceType: "sub-client-unit"
    }
});

const CLOUD_RESOURCE_ID_KEY = "ibm:cloud-resource-id";
const CATALYST_SUPER_TENANT = "super-tenant/ibm-catalyst";

module.exports = { RESOURCE_MAPPER, CLOUD_RESOURCE_ID_KEY, CATALYST_SUPER_TENANT }