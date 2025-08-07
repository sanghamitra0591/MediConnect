const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const Admin = require('../models/Admin');
const { isEmailUnique } = require('./adminController');

const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, specialization } = req.body;
    if (!await isEmailUnique(email)) {
      return res.status(400).json({ error: 'Email already in use by another user.' });
    }
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
    const token = generateToken(doctor._id, 'doctor');
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
    const doctor = req.user;
    const previousStatus = doctor.isOnline;
    doctor.isOnline = !doctor.isOnline;
    
    console.log(`Toggling doctor availability: doctorId=${doctor._id}, isOnline changing from ${previousStatus} to ${doctor.isOnline}`);
    
    await doctor.save();

    // Verify the doctor was updated correctly
    const updatedDoctor = await Doctor.findById(doctor._id);
    console.log(`Doctor after save: doctorId=${updatedDoctor._id}, isOnline=${updatedDoctor.isOnline}, status=${updatedDoctor.status}`);

    // Emit socket event for doctor status update using the global function
    if (global.emitDoctorStatus) {
      global.emitDoctorStatus(updatedDoctor._id, updatedDoctor.isOnline, updatedDoctor.status);
    } else {
      // Fallback to the old method if global function is not available
      const io = req.app.get('io');
      console.log(`Emitting doctorStatus event via req.app.get('io'): doctorId=${updatedDoctor._id}`);
      io.emit('doctorStatus', { 
        doctorId: updatedDoctor._id, 
        isOnline: updatedDoctor.isOnline, 
        status: updatedDoctor.status 
      });
    }

    logger.info(`Doctor availability toggled: ${doctor.email}, isOnline: ${doctor.isOnline}`);
    res.json({ 
      message: 'Availability toggled successfully', 
      isOnline: updatedDoctor.isOnline 
    });
  } catch (err) {
    console.error('Error toggling doctor availability:', err);
    logger.error('Doctor availability toggle error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password');
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-password');
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, email, specialization, isOnline } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    if (email && email !== doctor.email) {
      // Check for unique email
      const exists = await Doctor.findOne({ email });
      if (exists) return res.status(400).json({ error: 'Email already in use' });
      doctor.email = email;
    }
    if (name) doctor.name = name;
    if (specialization) doctor.specialization = specialization;
    if (typeof isOnline === 'boolean') doctor.isOnline = isOnline;
    await doctor.save();
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ doctor: req.user });
};

exports.getAvailable = async (req, res) => {
  try {
    // Doctors with status 'available', isOnline true, and not in an active session
    const availableDoctors = await Doctor.find({ status: 'available', isOnline: true });
    const sessions = await require('../models/Session').find({ status: 'active' });
    const busyDoctorIds = sessions.map(s => s.doctor.toString());
    const filteredDoctors = availableDoctors.filter(d => !busyDoctorIds.includes(d._id.toString()));
    res.json({ doctors: filteredDoctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
