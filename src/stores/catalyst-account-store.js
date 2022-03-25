const AccountView = require("./sequelize-orm").models.AccountView;
const AccountRoleAssignmentView = require("./sequelize-orm").models.ViewAccountRoleAssignmentModel;
const BusinessUnitTable = require("./sequelize-orm").models.BusinessUnitTableModel;
const { Op } = require("sequelize");

class CatalystAccountStore {
    async findAll() {
        return await AccountView.findAll({
            where: {
                focus_status: {
                    [Op.in]: ["BASE", "TOP_LEVEL", "NON_BASE"]
                },
                active: true
            }
        });
    }

    async getAllBusinessUnit() {
        return await BusinessUnitTable.findAll({
            where: {
                account_cd: {
                    [Op.notLike]: '%MGMT_DEC_ACC%'
                }
            }
        });
    }

    async getAllRolesByAccount(accountCode, roleIds) {
        return await AccountRoleAssignmentView.findAll({
            where: {
                account_code: accountCode,
                role_id: {
                    [Op.in]: roleIds
                }
            }
        });
    }

    async getAllRolesByRoleIds(roleIds) {
        return await AccountRoleAssignmentView.findAll({
            where: {
                role_id: {
                    [Op.in]: roleIds
                }
            }
        });
    }
}

module.exports = CatalystAccountStore;
