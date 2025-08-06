const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  gps: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
