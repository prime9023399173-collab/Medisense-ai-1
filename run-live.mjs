import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultNodeExe = path.join(__dirname, '..', 'nodejs', 'node.exe')
const nodeExe = fs.existsSync(defaultNodeExe) ? defaultNodeExe : process.execPath

console.log('=========================================================================')
console.log('   🏥 MEDISENSE AI - LAUNCHING LIVE HEALTHCARE ECOSYSTEM')
console.log('=========================================================================')

const backendDir = path.join(__dirname, 'backend')
const frontendDir = path.join(__dirname, 'frontend')

// 1. Launch Backend API Server (Port 4000)
console.log('⚡ Starting Backend API Server (Hono + PGlite / PostgreSQL) on port 4000...')
const backend = spawn(nodeExe, [
  path.join(backendDir, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
  path.join('src', 'server.ts')
], {
  cwd: backendDir,
  env: { ...process.env, PORT: '4000' },
  stdio: 'inherit'
})

// 2. Launch Frontend Application (Port 3000)
console.log('⚡ Starting Frontend Application (React 19 + Vite 6 + Tailwind) on port 3000...')
const frontend = spawn(nodeExe, [
  path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js'),
  '--port', '3000',
  '--host'
], {
  cwd: frontendDir,
  env: process.env,
  stdio: 'inherit'
})

backend.on('error', (err) => console.error('Backend process error:', err))
frontend.on('error', (err) => console.error('Frontend process error:', err))

backend.on('exit', (code) => {
  if (code !== 0) console.log(`Backend exited with code ${code}`)
})

frontend.on('exit', (code) => {
  if (code !== 0) console.log(`Frontend exited with code ${code}`)
})

process.on('SIGINT', () => {
  console.log('Shutting down Medisense servers...')
  backend.kill()
  frontend.kill()
  process.exit(0)
})

process.on('SIGTERM', () => {
  backend.kill()
  frontend.kill()
  process.exit(0)
})
