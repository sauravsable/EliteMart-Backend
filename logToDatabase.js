const Log = require('./models/logModel');

const logToDatabase = async (logObject) => {
  try {
    const logEntry = new Log(logObject);
    await logEntry.save();
  } catch (error) {
    console.error('Failed to save log to database:', error);
  }
};

module.exports = logToDatabase;
