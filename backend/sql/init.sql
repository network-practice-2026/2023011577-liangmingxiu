CREATE DATABASE IF NOT EXISTS protocol_demo DEFAULT CHARSET utf8mb4;
USE protocol_demo;

CREATE TABLE IF NOT EXISTS test_table (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL
);

INSERT INTO test_table(name) VALUES ('hello'), ('world');

CREATE TABLE IF NOT EXISTS protocol_layer (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64) NOT NULL,
  layer_order INT NOT NULL,
  description VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS field_definition (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  layer_id BIGINT NOT NULL,
  field_name VARCHAR(64) NOT NULL,
  field_type VARCHAR(32) NOT NULL,
  field_order INT NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_field_layer FOREIGN KEY (layer_id) REFERENCES protocol_layer(id)
);
