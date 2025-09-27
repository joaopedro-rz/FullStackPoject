import React from 'react'
import { NewsProvider } from '../contexts/NewsContext.jsx'
import { SearchForm } from './SearchForm.jsx'
import { NewsList } from './NewsList.jsx'

export function App() {
  return (
    <NewsProvider>
      <div className="app">
        <header className="header">
          <div className="container">
            <h1 className="brand">NewsFinder</h1>
            <p className="subtitle">Busque notícias atuais com filtros avançados</p>
          </div>
        </header>
        <main className="container main">
          <section className="panel">
            <SearchForm />
          </section>
          <section className="results">
            <NewsList />
          </section>
        </main>
        <footer className="footer">
          <div className="container small">
            <p>
              Dados fornecidos por <a href="https://newsapi.org/" target="_blank" rel="noreferrer">NewsAPI</a>.
              Este site é apenas demonstrativo para fins acadêmicos.
            </p>
          </div>
        </footer>
      </div>
    </NewsProvider>
  )
}
