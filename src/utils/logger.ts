import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({
      filename: "logs/error.json",
      level: "error",
      silent: true,
    }),
    new winston.transports.File({
      filename: "logs/info.json",
      level: "info",
      silent: true,
    }),
  ],
});

export default logger;
