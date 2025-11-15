import { Router } from 'express'
import { body, query, param, validationResult } from 'express-validator'
import sanitizeHtml from 'sanitize-html'
import { createArticle, listArticles, deleteArticle } from '../models/Article.js'

const router = Router()

router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('pageSize').optional().isInt({ min: 5, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const userId = req.user?.sub
    const page = Number(req.query.page || 1)
    const pageSize = Number(req.query.pageSize || 10)
    const data = await listArticles(userId, { page, pageSize })
    return res.json(data)
  }
)

router.post('/',
  body('title').isString().isLength({ min: 2, max: 300 }),
  body('url').isURL({ require_protocol: true }),
  body('source').optional().isString().isLength({ max: 120 }),
  body('urlToImage').optional().isURL().isLength({ max: 500 }).bail().optional({ nullable: true }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('publishedAt').optional().isString().isLength({ max: 50 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const userId = req.user?.sub
    const payload = { ...req.body }
    payload.title = sanitizeHtml(payload.title, { allowedTags: [], allowedAttributes: {} }).trim()
    if (payload.description) payload.description = sanitizeHtml(payload.description, { allowedTags: [], allowedAttributes: {} }).trim()
    try {
      const created = await createArticle(userId, payload)
      return res.status(201).json(created)
    } catch (e) {
      return res.status(500).json({ error: 'Falha ao salvar artigo.' })
    }
  }
)

// novo: remover artigo salvo
router.delete('/:id',
  param('id').isInt({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const userId = req.user?.sub
    const id = Number(req.params.id)
    try {
      const deleted = await deleteArticle(userId, id)
      if (!deleted) return res.status(404).json({ error: 'Artigo não encontrado.' })
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'Falha ao remover artigo.' })
    }
  }
)

export default router
