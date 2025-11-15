import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import apicache from 'apicache'
import jwt from 'jsonwebtoken'
import { ensureSchema, db } from './config/db.js'
import { isTokenJtiBlacklisted } from './config/tokens.js'
import authRoutes from './routes/auth.js'
import newsRoutes from './routes/news.js'
import articlesRoutes from './routes/articles.js'

dotenv.config()

const app = express()
app.enable('trust proxy')

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })
app.use(limiter)
app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('combined'))

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto']
    if (proto && proto !== 'https') return res.redirect('https://' + req.headers.host + req.url)
    next()
  })
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Não autorizado.' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret')
    if (decoded?.jti && isTokenJtiBlacklisted(decoded.jti)) {
      return res.status(401).json({ error: 'Token inválido.' })
    }
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido.' })
  }
}

const cache = apicache.options({ respectCacheControl: true }).middleware

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/news', authenticate, cache('5 minutes'), newsRoutes)
app.use('/api/articles', authenticate, articlesRoutes)

const port = process.env.PORT || 3000

ensureSchema().then(async () => {
  if (process.env.SEED_DEFAULT_USER === 'true') {
    const exists = await db('users').where({ email: 'admin@example.com' }).first()
    if (!exists) {
      const { createUser } = await import('./models/User.js')
      await createUser({ email: 'admin@example.com', password: 'admin123', name: 'Admin' })
    }
  }
  app.listen(port, () => console.log(`API on http://localhost:${port}`))
})
