const Device = require('../models/Device');
const logger = require('../utils/logger');
const Session = require('../models/Session'); // Added import for Session

exports.register = async (req, res) => {
  try {
    const { deviceId, gps, name, status } = req.body;
    let device = await Device.findOne({ deviceId });
    if (device) {
      device.gps = gps;
      if (name) device.name = name;
      if (status) device.status = status;
      device.lastActive = Date.now();
      await device.save();
      logger.info(`Device updated: ${deviceId}`);
      return res.json({ message: 'Device updated', device });
    }
    device = await Device.create({ deviceId, gps, name, status });
    logger.info(`Device registered: ${deviceId}`);
    res.status(201).json({ message: 'Device registered', device });
  } catch (err) {
    logger.error('Device registration error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const devices = await Device.find();
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json({ device });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { deviceId, gps, status, name } = req.body;
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (deviceId && deviceId !== device.deviceId) {
      // Check for unique deviceId
      const exists = await Device.findOne({ deviceId });
      if (exists) return res.status(400).json({ error: 'Device ID already in use' });
      device.deviceId = deviceId;
    }
    if (gps) device.gps = gps;
    if (status) device.status = status;
    if (name) device.name = name;
    await device.save();
    res.json({ device });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json({ message: 'Device deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAvailable = async (req, res) => {
  try {
    // Devices with status 'active' and not in an active session
    const activeDevices = await Device.find({ status: 'active' });
    const sessions = await Session.find({ status: 'active' });
    const busyDeviceIds = sessions.map(s => s.device.toString());
    const availableDevices = activeDevices.filter(d => !busyDeviceIds.includes(d._id.toString()));
    res.json({ devices: availableDevices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
