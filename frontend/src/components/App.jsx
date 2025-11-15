import React from 'react'
import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx'
import { NewsProvider } from '../contexts/NewsContext.jsx'
import { SearchForm } from './SearchForm.jsx'
import { NewsList } from './NewsList.jsx'
import { LoginForm } from './LoginForm.jsx'

function AppInner() {
  const { isAuthenticated, user, logout } = useAuth()
  return (
    <NewsProvider>
      <div className="app">
        <header className="header">
          <div className="container">
            <h1 className="brand">NewsFinder</h1>
            <p className="subtitle">Busque notícias atuais com filtros avançados</p>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  <span className="small">Olá, {user?.name}</span>
                  <button className="btn" onClick={logout}>Sair</button>
                </>
              ) : (
                <span className="small">Faça login para usar a busca e salvar artigos</span>
              )}
            </div>
          </div>
        </header>
        <main className="container main">
          {!isAuthenticated ? (
            <section className="panel"><LoginForm /></section>
          ) : (
            <>
              <section className="panel"><SearchForm /></section>
              <section className="results"><NewsList /></section>
            </>
          )}
        </main>
        <footer className="footer">
          <div className="container small">
            <p>
              Dados fornecidos por <a href="https://newsapi.org/" target="_blank" rel="noreferrer">NewsAPI</a>. Este site é demonstrativo para fins acadêmicos.
            </p>
          </div>
        </footer>
      </div>
    </NewsProvider>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
