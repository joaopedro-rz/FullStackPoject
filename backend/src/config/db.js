import knex from 'knex'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../data.sqlite')
  },
  useNullAsDefault: true,
  pool: { min: 1, max: 5 }
})

export async function ensureSchema() {
  const hasUsers = await db.schema.hasTable('users')
  if (!hasUsers) {
    await db.schema.createTable('users', (t) => {
      t.increments('id').primary()
      t.string('email').notNullable().unique()
      t.string('password_hash').notNullable()
      t.string('name').notNullable()
      t.timestamps(true, true)
    })
  }
  const hasArticles = await db.schema.hasTable('articles')
  if (!hasArticles) {
    await db.schema.createTable('articles', (t) => {
      t.increments('id').primary()
      t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      t.string('title').notNullable()
      t.string('url').notNullable()
      t.string('source').nullable()
      t.string('urlToImage').nullable()
      t.text('description').nullable()
      t.string('publishedAt').nullable()
      t.timestamps(true, true)
    })
  }
}

