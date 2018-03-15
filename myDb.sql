CREATE DATABASE rentals;

CREATE TABLE item
(
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	description TEXT NOT NULL
);

CREATE TABLE person
(
	id SERIAL NOT NULL PRIMARY KEY,
	firstname VARCHAR(100) NOT NULL,
	lastname VARCHAR(100) NOT NULL,
	email TEXT NOT NULL,
	phone INT NOT NULL
);

CREATE TABLE reserveditem
(
	id SERIAL NOT NULL PRIMARY KEY,
	personid INT NOT NULL REFERENCES person(id),
	itemid INT NOT NULL REFERENCES item(id)
);

CREATE TABLE reservation
(
	id SERIAL NOT NULL PRIMARY KEY,
	reserveditemid INT NOT NULL REFERENCES reserveditem(id),
	day DATE NOT NULL,
	UNIQUE (day, reserveditemid)
);

CREATE USER rentaluser WITH PASSWORD 'IsaacsonR';
GRANT ALL ON ALL TABLES IN SCHEMA public TO rentaluser;

INSERT INTO person (firstname, lastname, email, phone) VALUES
('Taylor', 'Isaacson', 'taylorhisaacson@gmail.com', 2083698723);