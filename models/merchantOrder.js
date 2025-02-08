class MerchantOrder extends Model {}

MerchantOrder.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mp_id: {
        type: DataTypes.STRING,
        unique: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    store_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pos_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    esp_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'devices',
            key: 'id'
        }
    },
    mqtt_topic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }
    // ... outros campos existentes
}, {
    sequelize,
    modelName: 'MerchantOrder'
});