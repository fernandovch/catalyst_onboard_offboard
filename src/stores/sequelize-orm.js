const config = require("config");
const { Sequelize } = require("sequelize");
const AccountView = require("../models/account-view");
const AccountRoleAssignmentView = require("../models/account-role-assignment");
const BusinessUnitTable = require("../models/business-unit-table");

const sequelizeConnection = config.get("sequelize");

class SequelizeOrm {

    static loadModels(sequelize) {
        AccountView(sequelize);
        AccountRoleAssignmentView(sequelize);
        BusinessUnitTable(sequelize);

        return sequelize;
    }

    static init() {
        return this.loadModels(new Sequelize(sequelizeConnection));
    }
}

module.exports = SequelizeOrm.init();
