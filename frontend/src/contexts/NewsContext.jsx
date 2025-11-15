import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react'
import { useAuth } from './AuthContext.jsx'

const initialState = {
  q: '',
  language: 'pt',
  from: undefined,
  sortBy: 'publishedAt',
  page: 1,
  pageSize: 10,
  status: 'idle',
  error: null,
  totalResults: 0,
  articles: [],
  // novo: modo de visualização ("search" | "saved")
  mode: 'search',
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILTERS': {
      const merged = { ...state, ...action.payload }
      return { ...merged, page: 1 }
    }
    case 'REQUEST_START':
      // sempre que iniciamos uma busca normal, garantimos que o modo seja 'search'
      if (action.payload?.mode === 'search') {
        return { ...state, status: 'loading', error: null, page: action.payload?.page ?? state.page, mode: 'search' }
      }
      return { ...state, status: 'loading', error: null, page: action.payload?.page ?? state.page }
    case 'REQUEST_SUCCESS':
      return { ...state, status: 'succeeded', articles: action.payload.articles, totalResults: action.payload.totalResults, error: null }
    case 'REQUEST_FAILURE':
      return { ...state, status: 'failed', error: action.payload.error, articles: [], totalResults: 0 }
    // novo: alternar modo de exibição
    case 'SET_MODE':
      return { ...state, mode: action.payload.mode }
    // novo: remover artigo do estado
    case 'REMOVE_ARTICLE':
      return {
        ...state,
        articles: state.articles.filter((a) => a.id !== action.payload.id),
        totalResults: Math.max(0, state.totalResults - 1),
      }
    default:
      return state
  }
}

const NewsContext = createContext(undefined)

export function NewsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { token } = useAuth()

  const buildUrl = useCallback((overrides) => {
    const snapshot = { ...state, ...(overrides || {}) }
    const url = new URL('/api/news', window.location.origin)
    const { q, language, from, sortBy, page, pageSize } = snapshot
    if (q && q.trim().length > 0) url.searchParams.set('q', q.trim())
    url.searchParams.set('language', language)
    if (from) url.searchParams.set('from', from)
    url.searchParams.set('sortBy', sortBy)
    url.searchParams.set('page', String(page))
    url.searchParams.set('pageSize', String(pageSize))
    return url.toString()
  }, [state])

  const search = useCallback(async (opts) => {
    const desiredPage = opts?.page ?? state.page
    const overrides = { ...(opts?.override || {}), page: desiredPage }
    const qValue = (opts?.override?.q ?? state.q)
    if (!qValue || qValue.trim().length < 2) {
      dispatch({ type: 'REQUEST_FAILURE', payload: { error: 'Informe um termo de busca com ao menos 2 caracteres.' } })
      return
    }
    // ao iniciar uma busca, voltamos explicitamente para modo 'search'
    dispatch({ type: 'REQUEST_START', payload: { page: desiredPage, mode: 'search' } })
    dispatch({ type: 'SET_MODE', payload: { mode: 'search' } })
    try {
      const url = buildUrl(overrides)
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok || data.status === 'error') {
        const message = data.error || data.message || `Erro na API (HTTP ${res.status}).`
        throw new Error(message)
      }
      dispatch({ type: 'REQUEST_SUCCESS', payload: { articles: (data.articles || []), totalResults: data.totalResults || 0 } })
    } catch (err) {
      const msg = err?.message || 'Erro desconhecido ao buscar notícias.'
      dispatch({ type: 'REQUEST_FAILURE', payload: { error: msg } })
    }
  }, [state.page, state.q, buildUrl, token])

  const saveArticle = useCallback(async (article) => {
    const payload = {
      title: article.title,
      url: article.url,
      source: article.source?.name || null,
      urlToImage: article.urlToImage || null,
      description: article.description || null,
      publishedAt: article.publishedAt || null,
    }
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || 'Falha ao salvar artigo.')
    return data
  }, [token])

  // novo: carregar artigos salvos do backend
  const loadSavedArticles = useCallback(async () => {
    dispatch({ type: 'SET_MODE', payload: { mode: 'saved' } })
    dispatch({ type: 'REQUEST_START', payload: { page: 1 } })
    try {
      const res = await fetch('/api/articles', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Falha ao carregar artigos salvos.')
      }
      const items = Array.isArray(data) ? data : (data.items || data.articles || [])
      dispatch({
        type: 'REQUEST_SUCCESS',
        payload: { articles: items, totalResults: items.length },
      })
    } catch (err) {
      const msg = err?.message || 'Erro desconhecido ao carregar artigos salvos.'
      dispatch({ type: 'REQUEST_FAILURE', payload: { error: msg } })
    }
  }, [token])

  const removeSavedArticle = useCallback(async (id) => {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data?.error || 'Falha ao remover artigo.')
    }
    dispatch({ type: 'REMOVE_ARTICLE', payload: { id } })
  }, [token])

  const setFilters = useCallback((f) => { dispatch({ type: 'SET_FILTERS', payload: f }) }, [])
  const nextPage = useCallback(async () => { const next = state.page + 1; await search({ page: next }) }, [state.page, search])
  const prevPage = useCallback(async () => { const prev = Math.max(1, state.page - 1); await search({ page: prev }) }, [state.page, search])

  const value = useMemo(
    () => ({
      ...state,
      setFilters,
      search,
      nextPage,
      prevPage,
      saveArticle,
      loadSavedArticles,
      removeSavedArticle,
    }),
    [state, setFilters, search, nextPage, prevPage, saveArticle, loadSavedArticles, removeSavedArticle]
  )

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>
}

export function useNews() {
  const ctx = useContext(NewsContext)
  if (!ctx) throw new Error('useNews deve ser usado dentro de <NewsProvider>')
  return ctx
}
