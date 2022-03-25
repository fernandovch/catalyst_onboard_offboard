const { DataTypes } = require("sequelize");

function businessUnitTable(sequelize) {
    sequelize.define(
        "BusinessUnitTableModel",
        {
            geo_cd: DataTypes.STRING(5),
            geo_nm: DataTypes.STRING(20),
            market_eds_cd: DataTypes.STRING(50),
            market_id: DataTypes.INTEGER,
            market_acts_nm: DataTypes.STRING(100),
            market_sts: DataTypes.STRING(10),
            client_unit_id: DataTypes.STRING(50),
            client_unit_nm: DataTypes.STRING(100),
            client_unit_cd: DataTypes.STRING(100),
            sub_client_unit_id: DataTypes.STRING(50),
            sub_client_unit_nm: DataTypes.STRING(50),
            sub_client_unit_cd: DataTypes.STRING(50),
            account_cd: {
                primaryKey: true,
                type: DataTypes.STRING(50)
            },
            account_nm: DataTypes.STRING(100),
            active: DataTypes.BOOLEAN,
            focus_status: DataTypes.STRING(30)
        },
        {
            tableName: "mv_business_unit",
            timestamps: false
        }
    );
}

module.exports = businessUnitTable;
