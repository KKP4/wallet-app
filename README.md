
# wallet-app

A simple CRUD app written in Typescript, Node.js, Express.js with PostgreSQL for the database.

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

```
touch setup/.env
```
- DB_HOST=localhost
- DB_PORT=5432
- DB_NAME=test
- DB_USER=your_user_name
- DB_PASS=your_password

## Create the database tables:

```
cd setup && sudo -u your_user_name psql -f db_init.sql
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
###### Returns an error if the player already has a wallet
- http://localhost:8080/api/wallet/create/:player_id/:amount

Creates a play session
- http://localhost:8080/api/session/:playerid/

Withdraw the specified amount (in a session)
###### Returns an error if the session expired
- http://localhost:8080/api/wallet/withdraw/:playerid/:amount/:sessionid

Deposits a specified amount (in a session)
###### Returns an error if the session expired

- http://localhost:8080/api/wallet/deposit/:playerid/:amount/:sessionid

Returns a player's transaction history
- http://localhost:8080/api/wallet/history/:playerid

# Additional notes
The application uses pg-promise for it's database interface. Read more: https://github.com/vitaly-t/pg-promise

It also comes with a pre-configured logger. Read more: https://github.com/winstonjs/winston

It logs all endpoint requests and potential errors to .json files in ./logs.
You can turn this feature off by setting the "silent = false" property in .utils/logger.ts.
