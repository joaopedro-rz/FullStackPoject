import React from 'react'
import { useNews } from '../contexts/NewsContext.jsx'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
  } catch {
    return iso
  }
}

export function NewsList() {
  const { articles, status, totalResults, page, pageSize, nextPage, prevPage, error } = useNews()
  const isLoading = status === 'loading'
  const isIdle = status === 'idle'
  const isFailed = status === 'failed'
  const isSucceeded = status === 'succeeded'
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize))
  const canPrev = page > 1 && !isLoading
  const canNext = page < totalPages && !isLoading

  return (
    <div className="news-list">
      <div className="list-header">
        {isIdle && <p>Use o formulário acima para buscar notícias.</p>}
        {isLoading && <p>Carregando notícias…</p>}
        {isSucceeded && (
          <p>Exibindo página {page} de {totalPages} — {totalResults} resultado(s)</p>
        )}
      </div>

      {isFailed && error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">{error}</div>
      )}

      {isSucceeded && articles.length === 0 && (
        <div className="empty">Nenhum resultado encontrado. Tente outros termos ou filtros.</div>
      )}

      <div className="grid">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div className="card skeleton" key={i}>
                <div className="image" />
                <div className="content">
                  <div className="line w-80" />
                  <div className="line w-60" />
                </div>
              </div>
            ))
          : articles.map((a) => (
              <article className="card" key={a.url}>
                {a.urlToImage ? (
                  <img className="thumb" src={a.urlToImage} alt={a.title} loading="lazy" />
                ) : (
                  <div className="thumb placeholder" aria-label="Sem imagem" />
                )}
                <div className="content">
                  <h3 className="title">
                    <a href={a.url} target="_blank" rel="noreferrer">{a.title}</a>
                  </h3>
                  <p className="meta">
                    <span className="source">{a.source?.name || 'Fonte desconhecida'}</span>
                    <span className="dot">•</span>
                    <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
                  </p>
                  {a.description && <p className="desc">{a.description}</p>}
                </div>
              </article>
            ))}
      </div>

      <div className="paginator">
        <button className="btn" onClick={prevPage} disabled={!canPrev}>← Anterior</button>
        <span className="page-indicator">Página {page} / {totalPages}</span>
        <button className="btn" onClick={nextPage} disabled={!canNext}>Próxima →</button>
      </div>
    </div>
  )
}

