const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')
require('dotenv').config()

const DB_URL = process.env.DATABASE_URL || 'postgres://pg_user:pg_secret@localhost:5432/pulseguard'

// Parse the DATABASE_URL to extract components
function parseDbUrl(url) {
  const parsed = new URL(url)
  return {
    user: parsed.username,
    password: parsed.password,
    host: parsed.hostname,
    port: parsed.port || 5432,
    database: parsed.pathname.replace('/', ''),
  }
}

async function ensureDatabase() {
  const config = parseDbUrl(DB_URL)
  const dbName = config.database

  // Connect to 'postgres' default database to create our target DB
  const adminPool = new Pool({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    database: 'postgres',
  })

  try {
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    )

    if (result.rows.length === 0) {
      console.log(`📦 Database "${dbName}" not found. Creating...`)
      await adminPool.query(`CREATE DATABASE "${dbName}"`)
      console.log(`✅ Database "${dbName}" created.`)
    } else {
      console.log(`✅ Database "${dbName}" already exists.`)
    }
  } finally {
    await adminPool.end()
  }
}

async function migrate() {
  // Step 1: Ensure database exists
  try {
    await ensureDatabase()
  } catch (err) {
    console.error(`❌ Could not create database: ${err.message}`)
    console.error('')
    console.error('💡 Troubleshooting:')
    console.error('   1. Make sure PostgreSQL is running')
    console.error('   2. Check your DATABASE_URL in backend/.env')
    console.error(`   3. Current: ${DB_URL.replace(/:[^:@]+@/, ':****@')}`)
    console.error('   4. If using default postgres superuser, set:')
    console.error('      DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/pulseguard')
    process.exit(1)
  }

  // Step 2: Connect to the target database and run schema
  const pool = new Pool({ connectionString: DB_URL })
  const client = await pool.connect()

  try {
    console.log('🔄 Running schema migration...')
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    await client.query(schema)
    console.log('✅ Schema migration complete.')

    if (process.argv.includes('--seed')) {
      console.log('🌱 Running seed data...')
      const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8')
      await client.query(seed)
      console.log('✅ Seed data inserted.')
    }

    console.log('')
    console.log('🎉 Database is ready! You can now start the server:')
    console.log('   npm run dev')
  } catch (err) {
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
