const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors')
const app = express();

app.use(express.json()); // Parse incoming JSON requests
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);  // Allow the request if the origin is in the allowed list
    } else {
      callback(new Error('Not allowed by CORS'));  // Block the request if the origin is not allowed
    }
  }
}));
// PostgreSQL settings
const pool = new Pool({
    user: '',         // Replace with your PostgreSQL username
    host: '',             // Database host
    database: '',     // Replace with your PostgreSQL database
    password: '',     // Replace with your PostgreSQL password
    port: 5432                     // PostgreSQL port
});

// Vault API settings
const vaultUrl = ''; // Vault encryption endpoint
const decryptVaultUrl ='';  // Vault decryption endpoint
const vaultToken = '';  // Replace with your Vault token

// Function to encrypt data using Vault
async function encryptPassword(password) {
    try {
        const response = await axios.post(vaultUrl, {
            plaintext: Buffer.from(password).toString('base64')  // Vault expects base64 encoding
        }, {
            headers: {
                'X-Vault-Token': vaultToken
            }
        });
        return response.data.data.ciphertext;
    } catch (error) {
        console.error('Error encrypting password:', error);
        throw error;
    }
}

// Function to decrypt data using Vault
async function decryptPassword(ciphertext) {
    try {
        const response = await axios.post(decryptVaultUrl, {
            ciphertext: ciphertext
        }, {
            headers: {
                'X-Vault-Token': vaultToken
            }
        });
        const decrypted = Buffer.from(response.data.data.plaintext, 'base64').toString('utf8');
        return decrypted;
    } catch (error) {
        console.error('Error decrypting password:', error);
        throw error;
    }
}

// Function to store encrypted password in PostgreSQL
async function storeEncryptedPassword(username, encryptedPassword) {
    try {
        const query = 'INSERT INTO users (username,encrypted_password) VALUES ($1, $2) RETURNING id';
        const values = [username, encryptedPassword];
        const result = await pool.query(query, values);
        return result.rows[0].id;
    } catch (error) {
        console.error('Error storing encrypted password in database:', error);
        throw error;
    }
}

// Function to retrieve encrypted password from PostgreSQL
async function getEncryptedPassword(username) {
    try {
        const query = 'SELECT encrypted_password FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        if (result.rows.length > 0) {
            return result.rows[0].encrypted_password;
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error retrieving encrypted password from database:', error);
        throw error;
    }
}

// Store password route (POST /store-secret)
 // Middleware to parse incoming JSON requests

// Store password route (POST /store-secret)
app.post('/store-secret', async (req, res) => {

    const { username, password } = req.body;

    // Check if username and password are present
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Encrypt the password using Vault (Assume this function is implemented)
        const encryptedPassword = await encryptPassword(password);

        // Store encrypted password in PostgreSQL (Assume this function is implemented)
        const userId = await storeEncryptedPassword(username, encryptedPassword);

        // Respond with success
        res.status(200).json({ message: 'Password stored successfully', userId });
    } catch (error) {
        console.error('Error storing secret:', error);
        res.status(500).json({ error: 'Failed to store secret' });
    }
});

// Retrieve password route (POST /retrieve-secret)
app.post('/retrieve-secret', async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Get encrypted password from PostgreSQL
        const encryptedPassword = await getEncryptedPassword(username);

        // Decrypt the password using Vault
        const decryptedPassword = await decryptPassword(encryptedPassword);

        res.status(200).json({ username, password: decryptedPassword });
    } catch (error) {
        console.error('Error retrieving secret:', error);
        res.status(500).json({ error: 'Failed to retrieve secret' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

// Define route for root path
app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the HTML file
    res.send('Hello World!');
});

// Your other routes and middleware
