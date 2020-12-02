DROP DATABASE IF EXISTS test;
CREATE DATABASE test;

\c test;

CREATE TABLE wallet
(
    id SERIAL PRIMARY KEY,
    player_id integer,
    balance integer,
    created timestamp without time zone,
    updated timestamp without time zone,
    CONSTRAINT "WAL_UK1" UNIQUE (player_id)
);

CREATE INDEX WAL_IND1
ON wallet (player_id);

COMMENT ON CONSTRAINT "WAL_UK1" ON wallet
    IS 'Each player can only have one wallet.';
 

CREATE TABLE session
(   
    id SERIAL PRIMARY KEY,
    player_id integer,
    started timestamp without time zone,
    concluded timestamp without time zone
);

CREATE INDEX SSN_IND1
ON session(player_id);

CREATE TABLE transactiontype
(
    id SERIAL PRIMARY KEY,
    transaction_type varchar(10)
);

INSERT INTO transactiontype(transaction_type)
values ('WITHDRAW');

INSERT INTO transactiontype(transaction_type)
values ('DEPOSIT');

CREATE TABLE transactionhistory
(
    id SERIAL PRIMARY KEY,
    player_id integer,
    amount integer,
    balance_before integer,
    transaction_type_id integer,
    created timestamp without time zone,
    session_id integer
);

ALTER TABLE transactionhistory
    ADD CONSTRAINT fk_transaction_type FOREIGN KEY (transaction_type_id)
    REFERENCES transactiontype (id) MATCH SIMPLE
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;


ALTER TABLE transactionhistory
    ADD CONSTRAINT fk_session_id FOREIGN KEY (session_id)
    REFERENCES session (id) MATCH SIMPLE
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;


CREATE INDEX THY_IND1
ON transactionhistory (player_id, session_id);

COMMENT ON COLUMN transactionhistory.created
    IS 'Time of creation';