import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'intellivehicle',
  PORT = '4000',
} = process.env

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

async function initializeDatabase() {
  await pool.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci', [DB_NAME])
  await pool.query('USE ??', [DB_NAME])
  await pool.query(
    `CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      dob DATE NOT NULL,
      gender ENUM('male','female','others') NOT NULL,
      city VARCHAR(128) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      state VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  )
}

await initializeDatabase()

const app = express()
app.use(cors())
app.use(express.json())

const apiPrefix = '/api'

app.post(`${apiPrefix}/signup`, async (req, res) => {
  const { name, phone, email, password, dob, gender, city, pincode, state } = req.body

  if (!name || !phone || !email || !password || !dob || !gender || !city || !pincode || !state) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A user with that email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      `INSERT INTO users (name, phone, email, password, dob, gender, city, pincode, state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, email, hashedPassword, dob, gender, city, pincode, state],
    )

    return res.status(201).json({ message: 'User created successfully.', userId: result.insertId })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to save user. Please try again later.' })
  }
})

app.post(`${apiPrefix}/login`, async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const [rows] = await pool.query('SELECT id, name, email, password FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    return res.json({ message: 'Login successful.', user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to verify login.' })
  }
})

app.listen(Number(PORT), () => {
  console.log(`Backend server listening on http://localhost:${PORT}`)
})
