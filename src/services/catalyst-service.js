const CatalystAccountStore = require("../stores/catalyst-account-store");

class CatalystService {
    async findAll() {
        return await new CatalystAccountStore().findAll();
    }

    async getAllBusinessUnit() {
        return await new CatalystAccountStore().getAllBusinessUnit();
    }

    async getAllRolesByAccount(accountCode, roleIds) {
        return await new CatalystAccountStore().getAllRolesByAccount(accountCode, roleIds);
    }

    async getAllRolesByRoleIds(roleIds) {
        return await new CatalystAccountStore().getAllRolesByRoleIds(roleIds);
    }
}

module.exports = CatalystService;
