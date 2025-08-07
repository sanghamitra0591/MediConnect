const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Session = require('../models/Session');
const Device = require('../models/Device');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper to check email uniqueness across Admin and Doctor
async function isEmailUnique(email) {
  const admin = await Admin.findOne({ email });
  const doctor = await Doctor.findOne({ email });
  return !admin && !doctor;
}

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!await isEmailUnique(email)) {
      return res.status(400).json({ error: 'Email already in use by another user.' });
    }
    const admin = new Admin({ name, email, password });
    await admin.save();
    const token = generateToken(admin._id, 'admin');
    res.status(201).json({ token, userType: 'admin', admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unifiedLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Try admin first
    let user = await Admin.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
      const token = generateToken(user._id, 'admin');
      return res.json({ token, userType: 'admin', admin: { id: user._id, name: user.name, email: user.email } });
    }
    // Try doctor
    user = await Doctor.findOne({ email });
    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
      user.isOnline = true;
      await user.save();
      // Emit doctor status update if needed
      const io = req.app.get('io');
      if (io) io.emit('doctorStatus', { doctorId: user._id, isOnline: true });
      const token = generateToken(user._id, 'doctor');
      return res.json({ token, userType: 'doctor', doctor: { id: user._id, name: user.name, email: user.email, specialization: user.specialization, isOnline: user.isOnline } });
    }
    return res.status(400).json({ error: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOnlineDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isOnline: true }).select('-password');
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'active' }).populate('doctor device');
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    // Optionally mock GPS data for map
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.isEmailUnique = isEmailUnique;
