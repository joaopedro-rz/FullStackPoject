import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { findUserByEmail, verifyPassword, createUser } from '../models/User.js'
import { addTokenJtiToBlacklist } from '../config/tokens.js'

const router = Router()

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { email, password } = req.body
    const user = await findUserByEmail(email)
    if (!user) {
      console.warn('[auth] falha login: usuario nao encontrado', { email })
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }
    const ok = await verifyPassword(user, password)
    if (!ok) {
      console.warn('[auth] falha login: senha incorreta', { email })
      return res.status(401).json({ error: 'Credenciais inválidas.' })
    }
    const jti = crypto.randomUUID()
    const payload = { sub: user.id, email: user.email, name: user.name }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '2h', jwtid: jti })
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  }
)

router.post('/logout', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(400).json({ error: 'Token ausente.' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    addTokenJtiToBlacklist(decoded.jti)
    return res.json({ ok: true })
  } catch {
    return res.status(400).json({ error: 'Token inválido.' })
  }
})

router.post('/seed', async (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password || !name) return res.status(400).json({ error: 'Dados inválidos.' })
  const exists = await findUserByEmail(email)
  if (exists) return res.status(200).json({ message: 'Usuário já existe.' })
  const created = await createUser({ email, password, name })
  return res.status(201).json({ id: created.id, email: created.email, name: created.name })
})

export default router
