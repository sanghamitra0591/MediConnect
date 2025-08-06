const Device = require('../models/Device');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
  try {
    const { deviceId, gps } = req.body;
    let device = await Device.findOne({ deviceId });
    if (device) {
      device.gps = gps;
      device.lastActive = Date.now();
      await device.save();
      logger.info(`Device updated: ${deviceId}`);
      return res.json({ message: 'Device updated', device });
    }
    device = await Device.create({ deviceId, gps });
    logger.info(`Device registered: ${deviceId}`);
    res.status(201).json({ message: 'Device registered', device });
  } catch (err) {
    logger.error('Device registration error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
