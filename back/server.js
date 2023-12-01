const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();

// CORS
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next()
});

app.use(bodyParser.json());

const port = 3000;

let connection;

async function initDatabase() {
  const pool = mysql.createPool({
    host: 'mariadb-service',
    user: 'user',
    password: 'password',
    database: 'grocery_database',
    port: 3306,
  });

  // some logs to verify that everything is working as it should
  console.log('Attempting to connect to the database...');
  connection = await pool.getConnection();
  console.log('Connection successful!');

  try {
    // execute the SQL script
    await connection.query("CREATE DATABASE IF NOT EXISTS grocery_database;");
    await connection.query("USE grocery_database;");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS GroceryProduct (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productName VARCHAR(255),
        quantity INT,
        pickedUp TINYINT(1) DEFAULT 0
      );
    `);
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM GroceryProduct');

    // insert data only if the table is empty
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO GroceryProduct(productName, quantity, pickedUp) VALUES
        ('Banana', 2, 0),
        ('Tomato', 5, 0);
      `);

      console.log('Database initialized successfully.');
    } else {
      console.log('Database already contains data. Skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    setTimeout(initDatabase, 5000); // if error, retry in 5 seconds
  } finally {
    connection.release(); // release the connection back to the pool
  }
}

initDatabase();

// call of GET to the database
app.get('/groceryProducts', async (req, res) => {
  try {
    const [results] = await connection.query('SELECT * FROM GroceryProduct');
    res.json(results);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// call of POST to the database
app.post('/groceryProducts', async (req, res) => {
  try {
    const { productName, quantity } = req.body;

    if (!productName || !quantity) {
      return res.status(400).json({ error: 'productName and quantity are required fields' });
    }

    const newProduct = {
      productName,
      quantity,
      pickedUp: 0,  // by default, set to 0
    };

    const [result] = await connection.query('INSERT INTO GroceryProduct SET ?', newProduct);

    res.status(201).json({ message: 'New product added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// call of PUT to the database
app.put('/groceryProducts/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { productName, quantity, pickedUp } = req.body;

    if (!productName || !quantity || pickedUp === undefined) {
      return res.status(400).json({ error: 'productName, quantity, and pickedUp are required fields' });
    }

    const updatedProduct = {
      productName,
      quantity,
      pickedUp,
    };

    const [result] = await connection.query('UPDATE GroceryProduct SET ? WHERE id = ?', [updatedProduct, productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// call of DELETE to the database
app.delete('/groceryProducts/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await connection.query('DELETE FROM GroceryProduct WHERE id = ?', productId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});