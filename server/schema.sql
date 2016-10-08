-- CREATE DATABASE chat;

USE chat;

CREATE TABLE rooms (
  id int NOT NULL AUTO_INCREMENT,
  roomname varchar(255),
  PRIMARY KEY (id)
);

CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(255),
  PRIMARY KEY (id)
);

CREATE TABLE messages (
  id int NOT NULL AUTO_INCREMENT,
  text varchar(255),
  createdAt DATETIME NOT NULL DEFAULT NOW(),
  user_id int,
  room_id int,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) references users(id), -- shows up as MUL in schema
  FOREIGN KEY (room_id) references rooms(id)
);


/* Create other tables and define schemas for them here! */




/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/

