import React from 'react'
import { useForm } from 'react-hook-form'
import { useNews } from '../contexts/NewsContext.jsx'

export function SearchForm() {
  const { setFilters, search, status, error, q, language, from, sortBy, pageSize } = useNews()
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    defaultValues: { q: q || '', language: language || 'pt', from: from || undefined, sortBy: sortBy || 'publishedAt', pageSize: pageSize || 10 },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const LANG_OPTIONS = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'Inglês' },
    { value: 'es', label: 'Espanhol' },
    { value: 'fr', label: 'Francês' },
    { value: 'de', label: 'Alemão' },
  ]

  const SORT_OPTIONS = [
    { value: 'publishedAt', label: 'Mais recentes' },
    { value: 'relevancy', label: 'Mais relevantes' },
    { value: 'popularity', label: 'Mais populares' },
  ]

  const onSubmit = handleSubmit(async (values) => {
    if (!values.q || values.q.trim().length < 2) { setError('q', { type: 'manual', message: 'Informe ao menos 2 caracteres.' }); return }
    if (!values.language) { setError('language', { type: 'manual', message: 'Selecione um idioma.' }); return }
    setFilters(values)
    await search({ page: 1, override: values })
  })

  return (
    <form className="search-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="q">Termo</label>
          <input id="q" type="text" placeholder="Ex.: tecnologia, esportes, economia..."
            {...register('q', { required: 'Campo obrigatório.', minLength: { value: 2, message: 'Mínimo de 2 caracteres.' } })}
            aria-invalid={!!errors.q} />
          {errors.q && <span className="error">{errors.q.message}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="language">Idioma</label>
          <select id="language" {...register('language', { required: 'Selecione um idioma.' })} aria-invalid={!!errors.language}>
            {LANG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.language && <span className="error">{errors.language.message}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="from">A partir de</label>
          <input id="from" type="date" {...register('from')} max={new Date().toISOString().slice(0, 10)} />
          {errors.from && <span className="error">{errors.from.message}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="sortBy">Ordenação</label>
          <select id="sortBy" {...register('sortBy', { required: 'Selecione a ordenação.' })} aria-invalid={!!errors.sortBy}>
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors.sortBy && <span className="error">{errors.sortBy.message}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="pageSize">Por página</label>
          <input id="pageSize" type="number" min={5} max={100} step={5}
            {...register('pageSize', { required: 'Informe a quantidade por página.', valueAsNumber: true, min: { value: 5, message: 'Mínimo de 5.' }, max: { value: 100, message: 'Máximo de 100.' } })} />
          {errors.pageSize && <span className="error">{errors.pageSize.message}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
            {status === 'loading' ? 'Buscando…' : 'Buscar Notícias'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert" aria-live="assertive">{error}</div>}
    </form>
  )
}

