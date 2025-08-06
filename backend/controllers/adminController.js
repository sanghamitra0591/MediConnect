const Doctor = require('../models/Doctor');
const Session = require('../models/Session');
const Device = require('../models/Device');

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
