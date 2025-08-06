const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    const exists = await Doctor.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Doctor already exists' });
    const doctor = await Doctor.create({ name, email, password, specialization });
    logger.info(`Doctor registered: ${doctor.email}`);
    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (err) {
    logger.error('Doctor registration error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ error: 'Invalid credentials' });
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    doctor.isOnline = true;
    await doctor.save();
    // Emit doctor status update
    const io = req.app.get('io');
    io.emit('doctorStatus', { doctorId: doctor._id, isOnline: true });
    logger.info(`Doctor logged in: ${doctor.email}`);
    const token = generateToken(doctor._id);
    res.json({ token, doctor: { id: doctor._id, name: doctor.name, email: doctor.email, specialization: doctor.specialization, isOnline: doctor.isOnline } });
  } catch (err) {
    logger.error('Doctor login error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    req.user.isOnline = false;
    await req.user.save();
    // Emit doctor status update
    const io = req.app.get('io');
    io.emit('doctorStatus', { doctorId: req.user._id, isOnline: false });
    logger.info(`Doctor logged out: ${req.user.email}`);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    logger.error('Doctor logout error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    req.user.isOnline = !req.user.isOnline;
    await req.user.save();
    // Emit doctor status update
    const io = req.app.get('io');
    io.emit('doctorStatus', { doctorId: req.user._id, isOnline: req.user.isOnline });
    logger.info(`Doctor availability toggled: ${req.user.email}, isOnline: ${req.user.isOnline}`);
    res.json({ isOnline: req.user.isOnline });
  } catch (err) {
    logger.error('Doctor availability toggle error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
