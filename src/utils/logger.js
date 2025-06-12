const winston = require("winston");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file");

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

// Create a Winston logger
const logger = winston.createLogger({
    level: "info", // Log levels: error, warn, info, http, verbose, debug, silly
    format: logFormat,
    transports: [
        // Log errors to a separate file
        new winston.transports.File({
            filename: path.join(__dirname, "../logs/error.log"),
            level: "error",
        }),
        // Log all activities to a general log file
        new winston.transports.File({
            filename: path.join(__dirname, "../logs/app.log"),
        }),
    ],
});

// Also log to the console in development mode
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new DailyRotateFile({
            filename: "logs/application-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "10m", // Max file size
            maxFiles: "1d", // Keep logs for 14 days
        })
    );
}

module.exports = logger;
