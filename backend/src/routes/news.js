import { Router } from 'express'
import fetch from 'node-fetch'
import { query, validationResult } from 'express-validator'

const router = Router()

router.get('/',
  query('q').isString().isLength({ min: 2 }),
  query('language').optional().isString().isLength({ min: 2, max: 5 }),
  query('from').optional().isISO8601(),
  query('sortBy').optional().isIn(['publishedAt', 'relevancy', 'popularity']),
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 5, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const apiKey = process.env.NEWSAPI_KEY
    if (!apiKey) return res.status(500).json({ error: 'NEWSAPI_KEY não configurada no backend.' })
    const { q, language = 'pt', from, sortBy = 'publishedAt', page = 1, pageSize = 10 } = req.query
    const url = new URL('https://newsapi.org/v2/everything')
    url.searchParams.set('q', q)
    url.searchParams.set('language', language)
    if (from) url.searchParams.set('from', from)
    url.searchParams.set('sortBy', sortBy)
    url.searchParams.set('page', String(page))
    url.searchParams.set('pageSize', String(pageSize))
    url.searchParams.set('apiKey', apiKey)
    try {
      const r = await fetch(url.toString())
      const data = await r.json()
      if (!r.ok || data.status === 'error') return res.status(502).json({ error: data.message || 'Erro ao consultar a NewsAPI.' })
      return res.json({ status: 'ok', totalResults: data.totalResults || 0, articles: data.articles || [] })
    } catch (e) {
      return res.status(500).json({ error: 'Falha ao buscar notícias.' })
    }
  }
)

export default router

