const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');
const logger = require('../middlewares/logger');

class Refund extends Model {
  static async createRefund(data) {
    const transaction = await sequelize.transaction();
    try {
      const refund = await this.create({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      await transaction.commit();
      return refund;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  async processRefund() {
    if (this.status === 'approved') {
      this.processed_at = new Date();
      await this.save();
    }
  }
}

Refund.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  payment_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 50]
    }
  },
  mp_refund_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [10, 50]
    }
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true,
      min: 0.01,
      max: 999999.99
    }
  },
  reason: {
    type: DataTypes.STRING(200),
    validate: {
      len: [0, 200]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: [['pending', 'approved', 'rejected', 'cancelled']]
    }
  },
  processed_at: {
    type: DataTypes.DATE
  },
  created_by: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  updated_by: {
    type: DataTypes.STRING(50),
    validate: {
      len: [0, 50]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Refund',
  tableName: 'refunds',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  hooks: {
    beforeValidate: (refund) => {
      if (refund.isNewRecord) {
        refund.created_at = new Date();
      }
      refund.updated_at = new Date();
    },
    
    afterCreate: async (refund) => {
      logger.info('New refund created:', {
        refundId: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount,
        status: refund.status,
        timestamp: new Date().toISOString()
      });
    },
    
    beforeUpdate: async (refund) => {
      if (refund.changed('status') && refund.status === 'approved') {
        refund.processed_at = new Date();
      }
    },
    
    afterUpdate: async (refund) => {
      if (refund.changed('status')) {
        logger.info('Refund status updated:', {
          refundId: refund.id,
          oldStatus: refund.previous('status'),
          newStatus: refund.status,
          timestamp: new Date().toISOString()
        });
      }
    }
  },
  
  indexes: [
    {
      unique: true,
      fields: ['mp_refund_id']
    },
    {
      fields: ['payment_id']
    },
    {
      fields: ['account_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Refund;