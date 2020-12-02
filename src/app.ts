import express, { Errback, NextFunction, Request, Response } from "express";
import pgPromise from "pg-promise";
import router from "./routes/routes";
import logger from "./utils/logger";
import { config } from "./config";

const options = {};
const pgp = pgPromise(options);
const { TransactionMode, isolationLevel } = pgp.txMode;
const currentTime: Date = new Date();

// DB Connection properties
const cn = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
};
// Express instance
const expressApp = express();

// PgPromise instance
export const db = pgp(cn);

// Transaction mode property
export const mode = new TransactionMode({
  tiLevel: isolationLevel.readCommitted,
  readOnly: false,
  deferrable: true,
});

expressApp.use(express.json());
expressApp.use(express.urlencoded({ extended: false }));
expressApp.use("/", router);
expressApp.listen(8080);

// error handler
expressApp.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    status: "error",
    message: err.toString(),
  });
  // Log any errors from the handler
  logger.log({
    level: "error",
    message: req.path,
    error: err.toString(),
    time: currentTime,
  });
  next();
});
