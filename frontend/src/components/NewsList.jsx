import React, { useState } from 'react'
import { useNews } from '../contexts/NewsContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

function formatDate(iso) {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
  } catch {
    return iso
  }
}

export function NewsList() {
  const { articles, status, totalResults, page, pageSize, nextPage, prevPage, error, saveArticle, mode, removeSavedArticle } = useNews()
  const { isAuthenticated } = useAuth()
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})
  const [removing, setRemoving] = useState({})
  const isLoading = status === 'loading'
  const isIdle = status === 'idle'
  const isFailed = status === 'failed'
  const isSucceeded = status === 'succeeded'
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize || 1))
  const canPrev = page > 1 && !isLoading
  const canNext = page < totalPages && !isLoading && mode === 'search'

  async function onSave(a) {
    if (!isAuthenticated) return
    setSaving((s) => ({ ...s, [a.url]: true }))
    try {
      await saveArticle(a)
      setSaved((s) => ({ ...s, [a.url]: true }))
    } catch (e) {
      alert(e.message || 'Falha ao salvar artigo')
    } finally {
      setSaving((s) => ({ ...s, [a.url]: false }))
    }
  }

  async function onRemove(a) {
    if (!a.id) return
    setRemoving((r) => ({ ...r, [a.id]: true }))
    try {
      await removeSavedArticle(a.id)
    } catch (e) {
      alert(e.message || 'Falha ao remover artigo')
    } finally {
      setRemoving((r) => ({ ...r, [a.id]: false }))
    }
  }

  const isSavedMode = mode === 'saved'

  return (
    <div className="news-list">
      <div className="list-header">
        {isIdle && !isSavedMode && <p>Use o formulário acima para buscar notícias.</p>}
        {isIdle && isSavedMode && <p>Clique em "Ver artigos salvos" para carregar seus artigos.</p>}
        {isLoading && <p>{isSavedMode ? 'Carregando artigos salvos…' : 'Carregando notícias…'}</p>}
        {isSucceeded && (
          <p>
            {isSavedMode
              ? `${totalResults} artigo(s) salvo(s) encontrado(s)`
              : <>Exibindo página {page} de {totalPages} — {totalResults} resultado(s)</>}
          </p>
        )}
      </div>

      {isFailed && error && (
        <div className="alert alert-error" role="alert" aria-live="assertive">{error}</div>
      )}

      {isSucceeded && articles.length === 0 && (
        <div className="empty">
          {isSavedMode
            ? 'Você ainda não salvou nenhum artigo.'
            : 'Nenhum resultado encontrado. Tente outros termos ou filtros.'}
        </div>
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
              <article className="card" key={a.id || a.url}>
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
                    <span className="source">{a.source?.name || a.source || 'Fonte desconhecida'}</span>
                    <span className="dot">•</span>
                    {a.publishedAt && (
                      <time dateTime={a.publishedAt}>{formatDate(a.publishedAt)}</time>
                    )}
                  </p>
                  {a.description && <p className="desc">{a.description}</p>}
                  {isAuthenticated && !isSavedMode && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => onSave(a)} disabled={saving[a.url] || saved[a.url]}>
                        {saved[a.url] ? 'Salvo' : (saving[a.url] ? 'Salvando…' : 'Salvar')}
                      </button>
                    </div>
                  )}
                  {isAuthenticated && isSavedMode && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <button className="btn btn-danger" onClick={() => onRemove(a)} disabled={removing[a.id]}>
                        {removing[a.id] ? 'Removendo…' : 'Remover'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
      </div>

      <div className="paginator">
        <button className="btn" onClick={prevPage} disabled={!canPrev || isSavedMode}>← Anterior</button>
        <span className="page-indicator">
          {isSavedMode ? 'Artigos salvos' : `Página ${page} / ${totalPages}`}
        </span>
        <button className="btn" onClick={nextPage} disabled={!canNext}>Próxima →</button>
      </div>
    </div>
  )
}
