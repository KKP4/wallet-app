import { db, mode } from "../app";
import { NextFunction, Request, Response } from "express";

// Get the transaction type ID
// based on operation - DEPOSIT / WITHDRAW
async function getTransaction(type: string): Promise<number> {
  try {
    const t = await db.one<{ id: number }>(
      `SELECT id 
       FROM transactiontype 
       WHERE transaction_type = $1`,
      [type]
    );
    return t.id;
  } catch (e) {
    console.log("ERROR", e);
    return -1;
  }
}

// Creates a new play session for a player
export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    console.log("Creating new play session");
    const currentTime: Date = new Date();
    const playerID: number = parseInt(req.params.playerid);
    // Create new session
    const session = await db.one<{ id: number }>(
      `INSERT INTO session (player_id, started)
       VALUES($1, $2)
       RETURNING id`,
      [playerID, currentTime]
    );
    console.log(`Created new play session with id: ${session.id}`);
    res.status(200).json({
      status: "success",
      message: `Created new session`,
      id: session.id,
    });
  } catch (e) {
    console.log("ERROR", e);
    next(e);
  }
}

// Create a wallet for a player
// Deposit the initial balance
// Create a transaction log entry
export async function createWalletWithLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const playerID: number = parseInt(req.params.playerid);
    const deposit: number = parseInt(req.params.amount);
    const currentTime: Date = new Date();
    console.log(`Creating player with id ${playerID} and depositing ${deposit} initial amount`);
    // Get transaction type ID
    const transactionID = await getTransaction("DEPOSIT");
    // Create a new walled with deposit amount
    const wallet = await db.one<{ id: number }>(
      `INSERT INTO wallet (player_id, balance, created, updated) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [playerID, deposit, currentTime, currentTime]
    );
    console.log(transactionID);
    // Create a transaction log entry
    const transactionHistory = await db.one<{ id: number }>(
      `INSERT INTO transactionHistory (player_id,transaction_type_id, amount, balance_before, created) 
       VALUES ($1 , $2 , $3 , $4, $5) 
       RETURNING id`,
      [playerID, transactionID, deposit, deposit, currentTime]
    );
    console.log(`Transaction type: ${transactionID}. Wallet id: ${wallet.id}. Transaction log id: ${transactionHistory.id}`);
    res.status(200).json({
      status: "success",
      message: `Created new wallet with ID: ${wallet.id}`,
      message2: `Created new transaction log with ID: ${transactionHistory.id}`,
    });
  } catch (e) {
    console.log("ERROR:", e);
    return next(e);
  }
}

// Withdraw the specified amount from wallet
// Must be part of a play session
export async function withdrawFromWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const playerID: number = parseInt(req.params.playerid);
    const amount: number = parseInt(req.params.amount);
    const sessionID: number = parseInt(req.params.sessionid);
    const currentTime: Date = new Date();
    // Check if the session is still valid
    const session = await db.any(
      `SELECT *
       FROM session
       WHERE id = $1
       AND player_id = $2
       AND concluded IS NULL`,
      [sessionID, playerID]
    );
    if (session === null) {
      throw "This session has expired.";
    }
    await db.tx({ mode }, async (t) => {
      console.log(`Withdrawing ${amount} from player ${playerID} wallet.`);
      // Get the transaction type ID
      const transactionID: number = await getTransaction("WITHDRAW");
      // Get current player's balance
      const balance = await t.one<{ value: number }>(
        `SELECT balance 
         AS value 
         FROM wallet 
         WHERE player_id = $1`,
        [playerID]
      );
      // Check if the desired withdraw amount
      // exceeds the current balance
      if (balance.value < amount) {
        throw "Cannot withdraw the desired amount. Insufficent funds.";
      }
      // Calculate the new balance
      const newBalance = balance.value - amount;
      console.log(`Player balance: ${balance.value}. Withdrawing amount: ${amount}. New balance: ${newBalance} `);
      // Update wallet with new amount
      void t.none(
        `UPDATE wallet 
         SET balance = $1
           , updated = $2  
         WHERE player_id = $3`,
        [newBalance, currentTime, playerID]
      );
      // Create a transaction log entry
      const transactionhistory = await t.one<{ id: number }>(
        `INSERT INTO transactionHistory (player_id, amount, balance_before, transaction_type_id, created, session_id) 
         VALUES ($1 , $2 , $3 , $4, $5, $6) 
         RETURNING id`,
        [playerID, amount, balance.value, transactionID, currentTime, sessionID]
      );
      res.status(200).json({
        status: "success",
        message: "Successfully withdrew funds",
        message2: `Created new transaction log with ID: ${transactionhistory.id}`,
      });
    });
  } catch (e) {
    console.log("ERROR:", e);
    return next(e);
  }
}

// Deposits a specified amount to the player's wallet
// Must be part of a play session
export async function depositToWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const playerID: number = parseInt(req.params.playerid);
    const amount: number = parseInt(req.params.amount);
    const sessionID: number = parseInt(req.params.sessionid);
    const currentTime: Date = new Date();
    console.log(`Depositing ${amount} to player ${playerID} wallet.`);
    const session = await db.any(
      `SELECT *
       FROM session
       WHERE id = $1
       AND player_id = $2
       AND concluded IS NULL`,
      [sessionID, playerID]
    );
    if (session === null) {
      throw "This session has expired.";
    }
    await db.tx({ mode }, async (t) => {
      // Get the transaction type ID
      const transactionID: number = await getTransaction("DEPOSIT");
      // Get current player's balance
      const balance = await t.one<{ value: number }>(`SELECT balance AS value FROM wallet WHERE player_id = $1`, [playerID]);
      // Calculate the new balance
      const newBalance: number = balance.value + amount;
      // Update wallet with new amount
      void t.none(`UPDATE wallet SET balance = $1, updated = $2 WHERE player_id = $3`, [newBalance, currentTime, playerID]);
      console.log(`Player balance: ${balance.value}. Depositing amount: ${amount}. New balance: ${newBalance} `);
      // Create a transaction log entry
      const transactionhistory = await t.one<{ id: number }>(
        `INSERT INTO transactionHistory (player_id, amount, balance_before, transaction_type_id, created, session_id) 
         VALUES ($1 , $2 , $3 , $4, $5, $6) 
         RETURNING id`,
        [playerID, amount, balance.value, transactionID, currentTime, sessionID]
      );
      res.status(200).json({
        status: "success",
        message: "Successfully deposited funds",
        message2: `Created new transaction log with ID: ${transactionhistory.id}`,
      });
    });
  } catch (e) {
    console.log("ERROR:", e);
    return next(e);
  }
}

// Get all transactions for player
export async function getTransactionsForPlayer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const playerID: number = parseInt(req.params.playerid);
    const history = await db.any(
      `SELECT thy.*
            , tty.transaction_type as type
      FROM transactionhistory thy
         , transactiontype tty
      WHERE thy.player_id = $1 
      AND   tty.id = thy.transaction_type_id 
      ORDER BY created desc`,
      [playerID]
    );
    // Check if query returned 0 rows
    if (history.length < 1) {
      throw `No transaction data found for player with ID: ${playerID}`;
    }
    console.log("DATA:", history);
    res.status(200).json({
      status: "success",
      data: history,
    });
  } catch (e) {
    return next(e);
  }
}
