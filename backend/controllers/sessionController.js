const Session = require('../models/Session');
const Doctor = require('../models/Doctor');
const Device = require('../models/Device');
const logger = require('../utils/logger');

// Initiate a session from a pharmacy device (match available doctor)
exports.initiate = async (req, res) => {
  try {
    const { deviceId, patientName } = req.body;
    const device = await Device.findOne({ deviceId });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    // Find an available doctor
    const doctor = await Doctor.findOne({ isOnline: true });
    if (!doctor) return res.status(404).json({ error: 'No available doctor' });
    const session = await Session.create({ device: device._id, doctor: doctor._id, patientName });
    // Emit session update
    const io = req.app.get('io');
    io.emit('sessionUpdate', { type: 'initiated', session });
    logger.info(`Session initiated: sessionId=${session._id}, deviceId=${device.deviceId}, doctorId=${doctor._id}`);
    res.status(201).json({ message: 'Session initiated', session });
  } catch (err) {
    logger.error('Session initiation error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Get all active sessions
exports.getActive = async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'active' }).populate('doctor device');
    res.json({ sessions });
  } catch (err) {
    logger.error('Get active sessions error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Complete a session
exports.complete = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.status = 'completed';
    session.endedAt = Date.now();
    await session.save();
    // Emit session update
    const io = req.app.get('io');
    io.emit('sessionUpdate', { type: 'completed', session });
    logger.info(`Session completed: sessionId=${session._id}`);
    res.json({ message: 'Session completed', session });
  } catch (err) {
    logger.error('Session completion error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

// Cancel a session
exports.cancel = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.status = 'cancelled';
    session.endedAt = Date.now();
    await session.save();
    // Emit session update
    const io = req.app.get('io');
    io.emit('sessionUpdate', { type: 'cancelled', session });
    logger.info(`Session cancelled: sessionId=${session._id}`);
    res.json({ message: 'Session cancelled', session });
  } catch (err) {
    logger.error('Session cancellation error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
