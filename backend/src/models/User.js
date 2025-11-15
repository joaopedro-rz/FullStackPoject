import { db } from '../config/db.js'
import bcrypt from 'bcryptjs'

export async function findUserByEmail(email) {
  return db('users').where({ email }).first()
}

export async function createUser({ email, password, name }) {
  const password_hash = await bcrypt.hash(password, 10)
  const [id] = await db('users').insert({ email, password_hash, name })
  return { id, email, name }
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash)
}

