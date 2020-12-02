
# wallet-app

A simple CRUD app written in Typescript, Node.js, Express.js with a PostgreSQL for the database.

## Requirements:
- Node.js
- npm
- PostgreSQL
- Postman (optional)

## Installation:
```
sudo apt install nodejs
sudo apt install npm
git clone https://github.com/KKP4/wallet-app.git
npm install

```
## After the installation create a .env file in ./setup with the following:

- DB_HOST=localhost
- DB_PORT=5432
- DB_NAME=test
- DB_USER=your_user_name
- DB_PASS=your_password

## Create the database tables:

```
sudo -u your_user_name psql -f db_init.sql
```

## Start the development server:
```
npm run dev
```
## or build:

```
npm run-script build
```

## REST API endpoints

Creates a wallet for a player and deposit the initial amount
- http://localhost:8080/api/wallet/create/:player_id/:amount

Creates a play session
- http://localhost:8080/api/session/:playerid/

Withdraw the specified amount
- http://localhost:8080/api/wallet/withdraw/:playerid/:amount/:sessionid

Deposits a specified amount
- http://localhost:8080/api/wallet/deposit/:playerid/:amount/:sessionid

Returns a player's transaction history
- http://localhost:8080/api/wallet/history/:playerid

# Additional notes
The application uses pg-promise for it's database interface. Read more: https://github.com/vitaly-t/pg-promise

It also comes with a pre-configured logger. Read more: https://github.com/winstonjs/winstonwhich

It logs all endpoint requests and potential errors to .json files in ./logs.
You can turn this feature off by setting the "silent = True" property in .utils/logger.ts.
