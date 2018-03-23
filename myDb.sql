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

INSERT INTO item (name, description) VALUES
('Chair', 'metal folding chair'),
('Table', '6 foot round table with folding legs'),
('Table Cloth', 'round white table cloth to cover a 6 foot table');

INSERT INTO reserveditem (personid, itemid) VALUES
(1,3);

INSERT INTO reservation(reserveditemid, day) VALUES
(1, '2018-03-31');

update item SET description = '5 foot round table with folding legs' WHERE id = 2;

update item SET description = 'round white table cloth to cover a 5 foot table' WHERE id = 3;

ALTER TABLE item ADD COLUMN quantity INT NOT NULL DEFAULT 1;


update item SET quantity = 64 WHERE id = 1;
update item SET quantity = 8 WHERE id = 2;
update item SET quantity = 8 WHERE id = 3;


CREATE TABLE admin
(
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(100) NOT NULL
);
