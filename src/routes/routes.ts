import express, { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { createWalletWithLog, withdrawFromWallet, depositToWallet, getTransactionsForPlayer, createSession } from "../controllers/index";

const router = express.Router();
const currentTime: Date = new Date();

router.post("/api/wallet/create/:playerid/:amount/", (req: Request, res: Response, next: NextFunction) => {
  void createWalletWithLog(req, res, next);
  // Log the request
  logger.log({
    level: "info",
    message: `Path: ${req.path}`,
    playerID: req.params.id,
    amount: req.params.amount,
    time: currentTime,
  });
});

router.get("/api/wallet/withdraw/:playerid/:amount/:sessionid/", (req: Request, res: Response, next: NextFunction) => {
  void withdrawFromWallet(req, res, next);
  // Log the request
  logger.log({
    level: "info",
    message: `Path: ${req.path}`,
    playerID: req.params.id,
    sessionID: req.params.sessionid,
    amount: req.params.amount,
    time: currentTime,
  });
});

router.post("/api/wallet/deposit/:playerid/:amount/:sessionid", (req: Request, res: Response, next: NextFunction) => {
  void depositToWallet(req, res, next);
  // Log the request
  logger.log({
    level: "info",
    message: `Path: ${req.path}`,
    playerID: req.params.playerid,
    sesionID: req.params.sessionid,
    amount: req.params.amount,
    time: currentTime,
  });
});

router.get("/api/wallet/history/:playerid/", (req: Request, res: Response, next: NextFunction) => {
  void getTransactionsForPlayer(req, res, next);
  // Log the request
  logger.log({
    level: "info",
    message: `Path: ${req.path}`,
    playerID: req.params.id,
    time: currentTime,
  });
});

router.post("/api/session/:playerid/", (req: Request, res: Response, next: NextFunction) => {
  void createSession(req, res, next);
  // Log the request
  logger.log({
    level: "info",
    message: `Path: ${req.path}`,
    playerID: req.params.id,
    time: currentTime,
  });
});

export default router;
