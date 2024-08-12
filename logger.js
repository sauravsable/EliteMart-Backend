const { createLogger, format, transports } = require('winston');
const logToDatabase = require('./logToDatabase');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
  ],
});

// Custom stream object for morgan to use
logger.stream = {
  write: async (message) => {
    const parts = message.trim().split(' ');
    const logObject = {
      level: 'info',
      method: parts[0],
      url: parts[1],
      status: parts[2],
      responseTime: `${parts[3]} ${parts[4]}`,
    };

    // Log to console
    // console.log('Request Log:', logObject);

    // Save log to database
    await logToDatabase(logObject);
  },
};

// Log errors to both console and database
logger.errorLogger = async (err, req, res, next) => {
  const errorLog = {
    level: 'error',
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    message: err.message,
  };

  // Log to console
  console.error('Error Log:', errorLog);

  // Save error log to database
  await logToDatabase(errorLog);

  next(err);
};

module.exports = logger;
