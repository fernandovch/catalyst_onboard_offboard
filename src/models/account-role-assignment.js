const { DataTypes } = require("sequelize");

function accountRoleAssignmentView(sequelize) {
    sequelize.define(
        "ViewAccountRoleAssignmentModel",
        {
            account_code: {
                primaryKey: true,
                type: DataTypes.STRING(20)
            },
            is_top_level: DataTypes.BOOLEAN,
            delegation_state: DataTypes.STRING(50),
            emp_cnum: DataTypes.STRING(20),
            emp_name: DataTypes.STRING(200),
            email: DataTypes.STRING(200),
            role_name: DataTypes.STRING(100),
            role_type: DataTypes.STRING(20),
            role_id: DataTypes.STRING(20),
            focus_status: DataTypes.STRING(30),
            status: DataTypes.STRING(30)
        },
        {
            tableName: "v_account_role_assignment",
            timestamps: false
        }
    );
}
module.exports = accountRoleAssignmentView;
