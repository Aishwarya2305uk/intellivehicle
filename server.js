import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'intellivehicle',
  PORT = '4000',
  JWT_SECRET = 'change_this_secret',
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
  await pool.query(
    `CREATE TABLE IF NOT EXISTS drivers (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      address TEXT NOT NULL,
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
    const [rows] = await pool.query('SELECT id, name, email, phone, dob, gender, city, pincode, state, password FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' })
    const { password, ...publicUser } = user
    return res.json({ message: 'Login successful.', user: publicUser, token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to verify login.' })
  }
})

app.get(`${apiPrefix}/me`, async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const parts = auth.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Missing or malformed token.' })
    }

    const token = parts[1]
    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' })
    }

    const [rows] = await pool.query('SELECT id, name, phone, email, dob, gender, city, pincode, state, created_at FROM users WHERE id = ?', [payload.id])
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' })

    return res.json({ user: rows[0] })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to fetch user.' })
  }
})

app.put(`${apiPrefix}/me`, async (req, res) => {
  try {
    const auth = req.headers.authorization || ''
    const parts = auth.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Missing or malformed token.' })
    }

    const token = parts[1]
    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' })
    }

    const allowed = ['name', 'phone', 'city', 'pincode', 'state', 'dob', 'gender']
    const updates = []
    const params = []
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates.push(`${key} = ?`)
        params.push(req.body[key])
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No updatable fields provided.' })

    params.push(payload.id)
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    await pool.query(sql, params)

    const [rows] = await pool.query('SELECT id, name, phone, email, dob, gender, city, pincode, state, created_at FROM users WHERE id = ?', [payload.id])
    return res.json({ user: rows[0] })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to update user.' })
  }
})

app.post(`${apiPrefix}/driver-signup`, async (req, res) => {
  const { name, phone, email, password, address } = req.body

  if (!name || !phone || !email || !password || !address) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  try {
    const [existing] = await pool.query('SELECT id FROM drivers WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A driver with that email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      `INSERT INTO drivers (name, phone, email, password, address)
       VALUES (?, ?, ?, ?, ?)`,
      [name, phone, email, hashedPassword, address],
    )

    return res.status(201).json({ message: 'Driver registered successfully.', driverId: result.insertId })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to register driver. Please try again later.' })
  }
})

app.listen(Number(PORT), () => {
  console.log(`Backend server listening on http://localhost:${PORT}`)
})
