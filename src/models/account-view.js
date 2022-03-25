const { DataTypes } = require("sequelize");

function accountView(sequelize) {
    sequelize.define(
        "AccountView",
        {
            id: {
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            gbg_id: DataTypes.STRING(20),
            gbg_name: DataTypes.STRING(50),
            acts_acct_name: DataTypes.STRING(100),
            acts_acct_id: DataTypes.INTEGER,
            acts_business_id: DataTypes.STRING(20),
            geo_cd: DataTypes.STRING(5),
            market_cd: DataTypes.STRING(5),
            market_id: DataTypes.INTEGER,
            tram_account: DataTypes.STRING(300),
            rdms_market_id: DataTypes.INTEGER,
            ippf_geo_cd: DataTypes.STRING(5),
            ippf_entity_id: DataTypes.STRING(100),
            tram_market: DataTypes.STRING(128),
            focus_status: DataTypes.STRING(30),
            shrt_imt_nm: DataTypes.STRING(5),
            active: DataTypes.BOOLEAN,
            eds_geo_cd: DataTypes.STRING(3),
            eds_market_cd: DataTypes.STRING(3),
            client_unit_id: DataTypes.INTEGER,
            client_subunit_id: DataTypes.INTEGER,
        },
        {
            tableName: "v_account",
            timestamps: false
        }
    );
}

module.exports = accountView;
