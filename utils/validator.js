const { ValidationError } = require('./errors');
const logger = require('./logger');

class Validator {
  static validate(data, schema) {
    const errors = [];
    const timestamp = new Date().toISOString();

    try {
      for (const [field, rules] of Object.entries(schema)) {
        // Verificar campo obrigatório
        if (rules.required && !data[field]) {
          errors.push(`Field '${field}' is required`);
          continue;
        }

        if (data[field]) {
          // Validar tipo
          if (rules.type && typeof data[field] !== rules.type) {
            errors.push(`Field '${field}' must be of type ${rules.type}`);
          }

          // Validar comprimento mínimo
          if (rules.min && data[field].length < rules.min) {
            errors.push(`Field '${field}' must be at least ${rules.min} characters long`);
          }

          // Validar comprimento máximo
          if (rules.max && data[field].length > rules.max) {
            errors.push(`Field '${field}' must be at most ${rules.max} characters long`);
          }

          // Validar padrão regex
          if (rules.pattern && !rules.pattern.test(data[field])) {
            errors.push(`Field '${field}' has invalid format`);
          }

          // Validar enum
          if (rules.enum && !rules.enum.includes(data[field])) {
            errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
          }

          // Validar funções customizadas
          if (rules.validate) {
            try {
              const valid = rules.validate(data[field]);
              if (!valid) {
                errors.push(`Field '${field}' validation failed`);
              }
            } catch (error) {
              errors.push(`Field '${field}' validation error: ${error.message}`);
            }
          }
        }
      }

      if (errors.length > 0) {
        logger.warn('Validation errors:', {
          errors,
          data,
          timestamp,
          user: process.env.CURRENT_USER
        });

        throw new ValidationError('Validation failed', errors);
      }

      return true;

    } catch (error) {
      logger.error('Validation error:', {
        error: error.message,
        stack: error.stack,
        timestamp,
        user: process.env.CURRENT_USER
      });

      throw error;
    }
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
  }

  static isValidCPF(cpf) {
    const cpfRegex = /^\d{11}$/;
    return cpfRegex.test(cpf);
  }

  static isValidCNPJ(cnpj) {
    const cnpjRegex = /^\d{14}$/;
    return cnpjRegex.test(cnpj);
  }

  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = Validator;