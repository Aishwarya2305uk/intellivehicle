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

// Verify a Bearer token and return its decoded payload, or null if missing/invalid.
function verifyAuth(req) {
  const auth = req.headers.authorization || ''
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  try {
    return jwt.verify(parts[1], JWT_SECRET)
  } catch {
    return null
  }
}

// Build a partial-update SET clause from the allowed fields present in the body.
function buildUpdates(allowed, body) {
  const updates = []
  const params = []
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      updates.push(`${key} = ?`)
      params.push(body[key])
    }
  }
  return { updates, params }
}

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
    // Look up the email in users first, then drivers. The table it's found in
    // determines the account role, which is baked into the token.
    let role = 'user'
    let [rows] = await pool.query('SELECT id, name, email, phone, dob, gender, city, pincode, state, password FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      role = 'driver'
      ;[rows] = await pool.query('SELECT id, name, email, phone, address, password FROM drivers WHERE email = ?', [email])
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const account = rows[0]
    const match = await bcrypt.compare(password, account.password)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const token = jwt.sign({ id: account.id, email: account.email, role }, JWT_SECRET, { expiresIn: '8h' })
    const { password: _pwd, ...publicAccount } = account
    return res.json({ message: 'Login successful.', user: { ...publicAccount, role }, token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to verify login.' })
  }
})

app.get(`${apiPrefix}/me`, async (req, res) => {
  try {
    const payload = verifyAuth(req)
    if (!payload) return res.status(401).json({ error: 'Missing or invalid token.' })

    if (payload.role === 'driver') {
      const [rows] = await pool.query('SELECT id, name, phone, email, address, created_at FROM drivers WHERE id = ?', [payload.id])
      if (rows.length === 0) return res.status(404).json({ error: 'Driver not found.' })
      return res.json({ user: { ...rows[0], role: 'driver' } })
    }

    const [rows] = await pool.query('SELECT id, name, phone, email, dob, gender, city, pincode, state, created_at FROM users WHERE id = ?', [payload.id])
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' })

    return res.json({ user: { ...rows[0], role: 'user' } })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Unable to fetch user.' })
  }
})

app.put(`${apiPrefix}/me`, async (req, res) => {
  try {
    const payload = verifyAuth(req)
    if (!payload) return res.status(401).json({ error: 'Missing or invalid token.' })

    if (payload.role === 'driver') {
      const { updates, params } = buildUpdates(['name', 'phone', 'address'], req.body)
      if (updates.length === 0) return res.status(400).json({ error: 'No updatable fields provided.' })

      params.push(payload.id)
      await pool.query(`UPDATE drivers SET ${updates.join(', ')} WHERE id = ?`, params)

      const [rows] = await pool.query('SELECT id, name, phone, email, address, created_at FROM drivers WHERE id = ?', [payload.id])
      return res.json({ user: { ...rows[0], role: 'driver' } })
    }

    const { updates, params } = buildUpdates(['name', 'phone', 'city', 'pincode', 'state', 'dob', 'gender'], req.body)
    if (updates.length === 0) return res.status(400).json({ error: 'No updatable fields provided.' })

    params.push(payload.id)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)

    const [rows] = await pool.query('SELECT id, name, phone, email, dob, gender, city, pincode, state, created_at FROM users WHERE id = ?', [payload.id])
    return res.json({ user: { ...rows[0], role: 'user' } })
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
