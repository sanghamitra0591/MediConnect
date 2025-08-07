const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String },
  status: { type: String, default: 'active' },
  gps: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
