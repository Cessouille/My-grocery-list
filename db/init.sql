CREATE DATABASE IF NOT EXISTS grocery_database;

USE grocery_database;

CREATE TABLE IF NOT EXISTS GroceryProduct (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productName VARCHAR(255),
  quantity INT,
  pickedUp TINYINT(1) DEFAULT 0
);

INSERT INTO GroceryProduct(productName, quantity, pickedUp) VALUES
('Banana', 2, 0),
('Tomato', 5, 0);