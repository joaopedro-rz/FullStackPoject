import { db } from '../config/db.js'

export async function createArticle(userId, payload) {
  const data = { ...payload, user_id: userId }
  const [id] = await db('articles').insert(data)
  return { id, ...data }
}

export async function listArticles(userId, { page = 1, pageSize = 10 } = {}) {
  const offset = (page - 1) * pageSize
  const rows = await db('articles').where({ user_id: userId }).orderBy('created_at', 'desc').limit(pageSize).offset(offset)
  const [{ count }] = await db('articles').where({ user_id: userId }).count({ count: '*' })
  return { items: rows, total: Number(count) }
}

export async function getArticle(userId, id) {
  return db('articles').where({ user_id: userId, id }).first()
}

export async function deleteArticle(userId, id) {
  return db('articles').where({ user_id: userId, id }).del()
}

