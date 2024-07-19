const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: { type: String, required: true },
  method: { type: String },
  url: { type: String },
  status: { type: String },
  responseTime: { type: String },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
