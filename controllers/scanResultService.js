const ScanResult = require('../models/ScanResult');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { ValidationError } = require('../utils/errors');

class ScanResultService {
  constructor() {
    this.hashFunction = 'sha256';
  }

  /**
   * Valida e processa os resultados do scan
   */
  async processScanResult(data) {
    try {
      // Validar dados de entrada
      this.validateScanData(data);
      
      // Gerar hash único para o resultado
      const resultHash = this.generateResultHash(data);

      // Preparar dados para salvar
      const scanResult = {
        ...data,
        resultHash,
        processedAt: new Date(),
        status: 'processed'
      };

      // Salvar no banco
      const result = await ScanResult.create(scanResult);

      logger.info('Scan result processed successfully', {
        resultId: result.id,
        resultHash,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      logger.error('Error processing scan result:', {
        error: error.message,
        data,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  /**
   * Valida os dados do scan
   */
  validateScanData(data) {
    const requiredFields = ['deviceId', 'scanType', 'scanData'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }

    // Validar deviceId
    if (!/^[A-Z0-9]{8,}$/.test(data.deviceId)) {
      throw new ValidationError('Invalid device ID format');
    }

    // Validar scanType
    const validScanTypes = ['full', 'quick', 'targeted'];
    if (!validScanTypes.includes(data.scanType)) {
      throw new ValidationError('Invalid scan type');
    }

    // Validar scanData
    if (!Array.isArray(data.scanData) || data.scanData.length === 0) {
      throw new ValidationError('Invalid scan data');
    }
  }

  /**
   * Gera hash único para o resultado
   */
  generateResultHash(data) {
    const hash = crypto.createHash(this.hashFunction);
    hash.update(JSON.stringify(data));
    return hash.digest('hex');
  }

  /**
   * Busca resultados por deviceId
   */
  async getResultsByDevice(deviceId, options = {}) {
    const {
      limit = 10,
      offset = 0,
      startDate,
      endDate,
      status
    } = options;

    const query = { deviceId };

    if (startDate || endDate) {
      query.processedAt = {};
      if (startDate) query.processedAt.$gte = new Date(startDate);
      if (endDate) query.processedAt.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    const results = await ScanResult.find(query)
      .sort({ processedAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await ScanResult.countDocuments(query);

    return {
      results,
      pagination: {
        total,
        offset,
        limit
      }
    };
  }

  /**
   * Atualiza status do resultado
   */
  async updateResultStatus(resultId, status) {
    const validStatuses = ['processed', 'failed', 'archived'];
    
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const result = await ScanResult.findByIdAndUpdate(
      resultId,
      {
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!result) {
      throw new ValidationError('Result not found');
    }

    logger.info('Scan result status updated', {
      resultId,
      status,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Apaga resultados antigos
   */
  async cleanupOldResults(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await ScanResult.deleteMany({
      processedAt: { $lt: cutoffDate }
    });

    logger.info('Old scan results cleaned up', {
      deletedCount: result.deletedCount,
      cutoffDate,
      timestamp: new Date().toISOString()
    });

    return result;
  }

  /**
   * Gera relatório de resultados
   */
  async generateReport(options = {}) {
    const {
      startDate,
      endDate,
      groupBy = 'deviceId'
    } = options;

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.processedAt = {};
      if (startDate) matchStage.processedAt.$gte = new Date(startDate);
      if (endDate) matchStage.processedAt.$lte = new Date(endDate);
    }

    const report = await ScanResult.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: `$${groupBy}`,
          totalScans: { $sum: 1 },
          successfulScans: {
            $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] }
          },
          failedScans: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          averageProcessingTime: { $avg: '$processingTime' }
        }
      },
      {
        $project: {
          _id: 0,
          [groupBy]: '$_id',
          totalScans: 1,
          successfulScans: 1,
          failedScans: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successfulScans', '$totalScans'] },
              100
            ]
          },
          averageProcessingTime: 1
        }
      }
    ]);

    return report;
  }
}

module.exports = new ScanResultService();