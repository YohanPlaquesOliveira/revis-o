const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class Store extends Model {
  static async hashSecret(secret) {
    return await bcrypt.hash(secret, 10);
  }

  async validateSecret(secret) {
    return await bcrypt.compare(secret, this.api_secret);
  }

  async generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}

Store.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  document: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
    validate: {
      isValidDocument(value) {
        // Implementar validação de CNPJ/CPF
        if (!/^\d{11}$|^\d{14}$/.test(value)) {
          throw new Error('Invalid document number');
        }
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true,
      len: [5, 100]
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    validate: {
      is: /^\+?[\d\s-()]+$/
    }
  },
  address: {
    type: DataTypes.STRING(200),
    validate: {
      len: [0, 200]
    }
  },
  city: {
    type: DataTypes.STRING(100),
    validate: {
      len: [0, 100]
    }
  },
  state: {
    type: DataTypes.STRING(2),
    validate: {
      isIn: [['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']]
    }
  },
  zip_code: {
    type: DataTypes.STRING(8),
    validate: {
      is: /^\d{8}$/
    }
  },
  integration_type: {
    type: DataTypes.ENUM('POS', 'PDV', 'ECOMMERCE'),
    allowNull: false,
    defaultValue: 'POS'
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {},
    validate: {
      isValidSettings(value) {
        // Validar estrutura do JSON
        const requiredFields = ['notifications', 'timezone', 'currency'];
        for (const field of requiredFields) {
          if (!(field in value)) {
            throw new Error(`Missing required setting: ${field}`);
          }
        }
      }
    }
  },
  api_key: {
    type: DataTypes.STRING(64),
    unique: true
  },
  api_secret: {
    type: DataTypes.STRING(60)  // Para hash bcrypt
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'blocked'),
    defaultValue: 'pending',
    allowNull: false
  },
  created_by: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  updated_by: {
    type: DataTypes.STRING(50)
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
  },
  last_activity: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Store',
  tableName: 'stores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  hooks: {
    beforeValidate: (store) => {
      if (store.isNewRecord) {
        store.created_at = new Date();
      }
      store.updated_at = new Date();
    },
    
    beforeCreate: async (store) => {
      // Gerar API key e secret para nova loja
      store.api_key = await store.generateApiKey();
      store.api_secret = await Store.hashSecret(crypto.randomBytes(32).toString('base64'));
    },
    
    afterCreate: async (store) => {
      // Criar configurações padrão
      await store.update({
        settings: {
          notifications: true,
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          retry_attempts: 3,
          webhook_timeout: 5000
        }
      });
    }
  },
  
  indexes: [
    {
      unique: true,
      fields: ['document']
    },
    {
      unique: true,
      fields: ['api_key']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Store;