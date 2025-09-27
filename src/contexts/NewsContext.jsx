import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

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
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILTERS': {
      const merged = { ...state, ...action.payload }
      return { ...merged, page: 1 }
    }
    case 'REQUEST_START':
      return { ...state, status: 'loading', error: null, page: action.payload?.page ?? state.page }
    case 'REQUEST_SUCCESS':
      return { ...state, status: 'succeeded', articles: action.payload.articles, totalResults: action.payload.totalResults, error: null }
    case 'REQUEST_FAILURE':
      return { ...state, status: 'failed', error: action.payload.error, articles: [], totalResults: 0 }
    default:
      return state
  }
}

const NewsContext = createContext(undefined)

export function NewsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const NEWS_API_BASE = 'https://newsapi.org/v2/everything'
  const API_KEY_HARD_CODED = 'f0eb68f340f2474eb6ead3b7a3acc1a0'
  const API_KEY_ENV = (import.meta?.env?.VITE_NEWSAPI_KEY)
  const API_KEY = API_KEY_HARD_CODED || API_KEY_ENV || ''

  const buildUrl = useCallback((overrides) => {
    const snapshot = { ...state, ...(overrides || {}) }
    const url = new URL(NEWS_API_BASE)
    const { q, language, from, sortBy, page, pageSize } = snapshot
    if (q && q.trim().length > 0) url.searchParams.set('q', q.trim())
    url.searchParams.set('language', language)
    if (from) url.searchParams.set('from', from)
    url.searchParams.set('sortBy', sortBy)
    url.searchParams.set('page', String(page))
    url.searchParams.set('pageSize', String(pageSize))
    url.searchParams.set('apiKey', API_KEY)
    return url.toString()
  }, [state, API_KEY])

  const search = useCallback(async (opts) => {
    const desiredPage = opts?.page ?? state.page
    const overrides = { ...(opts?.override || {}), page: desiredPage }
    const qValue = (opts?.override?.q ?? state.q)
    if (!qValue || qValue.trim().length < 2) {
      dispatch({ type: 'REQUEST_FAILURE', payload: { error: 'Informe um termo de busca com ao menos 2 caracteres.' } })
      return
    }
    if (!API_KEY) {
      dispatch({ type: 'REQUEST_FAILURE', payload: { error: 'Chave da NewsAPI ausente. Defina em NewsContext.jsx ou em VITE_NEWSAPI_KEY.' } })
      return
    }
    dispatch({ type: 'REQUEST_START', payload: { page: desiredPage } })
    try {
      const url = buildUrl(overrides)
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok || data.status === 'error') {
        const message = data.message || `Erro na API (HTTP ${res.status}).`
        throw new Error(message)
      }
      dispatch({ type: 'REQUEST_SUCCESS', payload: { articles: (data.articles || []), totalResults: data.totalResults || 0 } })
    } catch (err) {
      let msg = err?.message || 'Erro desconhecido ao buscar notícias.'
      if (msg.includes('Requests from the browser are not allowed')) {
        msg = 'A NewsAPI pode bloquear requisições diretas do navegador no plano gratuito. Use uma chave válida e/ou um proxy.'
      }
      dispatch({ type: 'REQUEST_FAILURE', payload: { error: msg } })
    }
  }, [state.page, state.q, buildUrl, API_KEY])

  const setFilters = useCallback((f) => { dispatch({ type: 'SET_FILTERS', payload: f }) }, [])
  const nextPage = useCallback(async () => { const next = state.page + 1; await search({ page: next }) }, [state.page, search])
  const prevPage = useCallback(async () => { const prev = Math.max(1, state.page - 1); await search({ page: prev }) }, [state.page, search])

  const value = useMemo(() => ({ ...state, setFilters, search, nextPage, prevPage }), [state, setFilters, search, nextPage, prevPage])

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>
}

export function useNews() {
  const ctx = useContext(NewsContext)
  if (!ctx) throw new Error('useNews deve ser usado dentro de <NewsProvider>')
  return ctx
}

