Device.addIndex(['account_id', 'store_id', 'pos_id', 'status'], {
    name: 'idx_esp_lookup',
    unique: true,
    where: {
        status: 'active'
    }
});