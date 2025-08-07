const Session = require('../models/Session');
const Doctor = require('../models/Doctor');
const Device = require('../models/Device');
const logger = require('../utils/logger');

// Initiate a session from a pharmacy device (match available doctor)
exports.initiate = async (req, res) => {
  try {
    const { deviceId, doctorId, patientName } = req.body;
    
    logger.info(`Session initiation request: deviceId=${deviceId}, doctorId=${doctorId || 'not specified'}, patientName=${patientName}`);
    
    if (!deviceId || !patientName) {
      logger.warn('Session initiation failed: Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const device = await Device.findOne({ deviceId });
    if (!device) {
      logger.warn(`Session initiation failed: Device not found - deviceId=${deviceId}`);
      return res.status(404).json({ error: 'Device not found' });
    }
    
    logger.info(`Device found: deviceId=${device.deviceId}, status=${device.status}`);
    
    if (device.status !== 'active') {
      logger.warn(`Session initiation failed: Device not available - deviceId=${device.deviceId}, status=${device.status}`);
      return res.status(400).json({ error: 'Device is not available' });
    }
    
    // Check if device is already in an active session
    const deviceBusy = await Session.findOne({ device: device._id, status: 'active' });
    if (deviceBusy) {
      logger.warn(`Session initiation failed: Device already in active session - deviceId=${device.deviceId}`);
      return res.status(400).json({ error: 'Device is already in an active session' });
    }
    
    // Find doctor by ID or find available doctor if not specified
    let doctor;
    if (doctorId) {
      doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        logger.warn(`Session initiation failed: Doctor not found - doctorId=${doctorId}`);
        return res.status(404).json({ error: 'Doctor not found' });
      }
      
      logger.info(`Doctor found by ID: doctorId=${doctor._id}, name=${doctor.name}, status=${doctor.status}, isOnline=${doctor.isOnline}`);
      
      if (doctor.status !== 'available' || !doctor.isOnline) {
        logger.warn(`Session initiation failed: Doctor not available - doctorId=${doctor._id}, status=${doctor.status}, isOnline=${doctor.isOnline}`);
        return res.status(400).json({ error: 'Doctor is not available' });
      }
    } else {
      doctor = await Doctor.findOne({ status: 'available', isOnline: true });
      if (!doctor) {
        logger.warn('Session initiation failed: No available doctors found');
        return res.status(404).json({ error: 'No available doctors found' });
      }
      
      logger.info(`Available doctor found: doctorId=${doctor._id}, name=${doctor.name}, status=${doctor.status}, isOnline=${doctor.isOnline}`);
    }
    
    const doctorBusy = await Session.findOne({ doctor: doctor._id, status: 'active' });
    if (doctorBusy) {
      logger.warn(`Session initiation failed: Doctor already in active session - doctorId=${doctor._id}`);
      return res.status(400).json({ error: 'Doctor is already in an active session' });
    }
    
    // Set both to busy
    logger.info(`Setting device status to busy: deviceId=${device.deviceId}`);
    device.status = 'busy';
    
    logger.info(`Setting doctor status to busy: doctorId=${doctor._id}, previous status=${doctor.status}, isOnline=${doctor.isOnline}`);
    doctor.status = 'busy';
    
    // Save both changes in parallel for efficiency
    await Promise.all([device.save(), doctor.save()]);
    
    // Verify doctor status was updated
    const updatedDoctor = await Doctor.findById(doctor._id);
    logger.info(`Doctor status after update: doctorId=${updatedDoctor._id}, status=${updatedDoctor.status}, isOnline=${updatedDoctor.isOnline}`);
    
    // Double-check if status was properly updated
    if (updatedDoctor.status !== 'busy') {
      logger.warn(`Doctor status not properly updated: doctorId=${updatedDoctor._id}, expected=busy, actual=${updatedDoctor.status}`);
      // Force update again if needed
      updatedDoctor.status = 'busy';
      await updatedDoctor.save();
      logger.info(`Doctor status forcefully updated: doctorId=${updatedDoctor._id}, status=${updatedDoctor.status}`);
    }
    
    const session = await Session.create({ device: device._id, doctor: doctor._id, patientName });
    logger.info(`Session created: sessionId=${session._id}`);
    
    // Emit session update and doctor status update
    const io = req.app.get('io');
    if (!io) {
      logger.error('Socket.IO instance not found on app object');
    } else {
      logger.info(`Emitting sessionUpdate event: type=initiated, sessionId=${session._id}`);
      io.emit('sessionUpdate', { type: 'initiated', session });
      
      logger.info(`Emitting doctorStatus event: doctorId=${updatedDoctor._id}, status=busy, isOnline=${updatedDoctor.isOnline}`);
      io.emit('doctorStatus', { doctorId: updatedDoctor._id, status: 'busy', isOnline: updatedDoctor.isOnline });
      
      // Send a second status update after a short delay to ensure clients receive it
      setTimeout(() => {
        logger.info(`Emitting delayed doctorStatus event: doctorId=${updatedDoctor._id}, status=busy`);
        io.emit('doctorStatus', { doctorId: updatedDoctor._id, status: 'busy', isOnline: updatedDoctor.isOnline });
      }, 500);
    }
    
    logger.info(`Session initiated successfully: sessionId=${session._id}, deviceId=${device.deviceId}, doctorId=${updatedDoctor._id}`);
    res.status(201).json({ message: 'Session initiated', session });
  } catch (err) {
    logger.error('Session initiation error', { error: err.message, stack: err.stack });
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
    logger.info(`Session completion request: sessionId=${sessionId}`);
    
    const session = await Session.findById(sessionId).populate('doctor device');
    if (!session) {
      logger.warn(`Session completion failed: Session not found - sessionId=${sessionId}`);
      return res.status(404).json({ error: 'Session not found' });
    }
    
    logger.info(`Session found: sessionId=${session._id}, status=${session.status}, doctorId=${session.doctor?._id}, deviceId=${session.device?._id}`);
    
    if (session.status !== 'active') {
      logger.warn(`Session completion failed: Session not active - sessionId=${session._id}, status=${session.status}`);
      return res.status(400).json({ error: 'Session is not active' });
    }
    
    session.status = 'completed';
    session.endedAt = Date.now();
    await session.save();
    logger.info(`Session status updated to completed: sessionId=${session._id}`);
    
    // Set doctor/device status back
    const doctor = await Doctor.findById(session.doctor);
    if (doctor) {
      logger.info(`Updating doctor status: doctorId=${doctor._id}, current status=${doctor.status}, setting to=available`);
      doctor.status = 'available';
      await doctor.save();
      
      // Verify doctor status was updated
      const updatedDoctor = await Doctor.findById(doctor._id);
      logger.info(`Doctor status after update: doctorId=${updatedDoctor._id}, status=${updatedDoctor.status}, isOnline=${updatedDoctor.isOnline}`);
    } else {
      logger.warn(`Doctor not found for session: sessionId=${session._id}, doctorId=${session.doctor?._id}`);
    }
    
    const device = await Device.findById(session.device);
    if (device) {
      logger.info(`Updating device status: deviceId=${device.deviceId}, current status=${device.status}, setting to=active`);
      device.status = 'active';
      await device.save();
    } else {
      logger.warn(`Device not found for session: sessionId=${session._id}, deviceId=${session.device?._id}`);
    }
    
    // Emit session update
    const io = req.app.get('io');
    if (!io) {
      logger.error('Socket.IO instance not found on app object');
    } else {
      logger.info(`Emitting sessionUpdate event: type=completed, sessionId=${session._id}`);
      io.emit('sessionUpdate', { type: 'completed', session });
      
      logger.info(`Emitting doctorStatus event: doctorId=${session.doctor._id}, status=available`);
      io.emit('doctorStatus', { doctorId: session.doctor._id, status: 'available' });
    }
    
    logger.info(`Session completed successfully: sessionId=${session._id}`);
    res.json({ message: 'Session completed', session });
  } catch (err) {
    logger.error('Session completion error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
};

// Cancel a session
exports.cancel = async (req, res) => {
  try {
    const { sessionId } = req.params;
    logger.info(`Session cancellation request: sessionId=${sessionId}`);
    
    const session = await Session.findById(sessionId).populate('doctor device');
    if (!session) {
      logger.warn(`Session cancellation failed: Session not found - sessionId=${sessionId}`);
      return res.status(404).json({ error: 'Session not found' });
    }
    
    logger.info(`Session found: sessionId=${session._id}, status=${session.status}, doctorId=${session.doctor?._id}, deviceId=${session.device?._id}`);
    
    if (session.status !== 'active') {
      logger.warn(`Session cancellation failed: Session not active - sessionId=${session._id}, status=${session.status}`);
      return res.status(400).json({ error: 'Session is not active' });
    }
    
    session.status = 'cancelled';
    session.endedAt = Date.now();
    await session.save();
    logger.info(`Session status updated to cancelled: sessionId=${session._id}`);
    
    // Set doctor/device status back
    const doctor = await Doctor.findById(session.doctor);
    if (doctor) {
      logger.info(`Updating doctor status: doctorId=${doctor._id}, current status=${doctor.status}, setting to=available`);
      doctor.status = 'available';
      await doctor.save();
      
      // Verify doctor status was updated
      const updatedDoctor = await Doctor.findById(doctor._id);
      logger.info(`Doctor status after update: doctorId=${updatedDoctor._id}, status=${updatedDoctor.status}, isOnline=${updatedDoctor.isOnline}`);
    } else {
      logger.warn(`Doctor not found for session: sessionId=${session._id}, doctorId=${session.doctor?._id}`);
    }
    
    const device = await Device.findById(session.device);
    if (device) {
      logger.info(`Updating device status: deviceId=${device.deviceId}, current status=${device.status}, setting to=active`);
      device.status = 'active';
      await device.save();
    } else {
      logger.warn(`Device not found for session: sessionId=${session._id}, deviceId=${session.device?._id}`);
    }
    
    // Emit session update and doctor status update
    const io = req.app.get('io');
    if (!io) {
      logger.error('Socket.IO instance not found on app object');
    } else {
      // Emit doctor status update separately to ensure it's received
      logger.info(`Emitting doctorStatus event: doctorId=${session.doctor._id}, status=available`);
      io.emit('doctorStatus', { doctorId: session.doctor._id, status: 'available' });
      
      // Emit session update
      logger.info(`Emitting sessionUpdate event: type=cancelled, sessionId=${session._id}`);
      io.emit('sessionUpdate', { type: 'cancelled', session });
    }
    
    logger.info(`Session cancelled successfully: sessionId=${session._id}`);
    res.json({ message: 'Session cancelled', session });
  } catch (err) {
    logger.error('Session cancellation error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const sessions = await Session.find().populate('doctor device');
    res.json({ sessions });
  } catch (err) {
    logger.error('Get session history error', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};
