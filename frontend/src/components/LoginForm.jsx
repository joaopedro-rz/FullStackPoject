import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext.jsx'

export function LoginForm() {
  const { login } = useAuth()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError('')
    try {
      await login(values.email, values.password)
    } catch (e) {
      setServerError(e.message || 'Falha no login')
    }
  })

  return (
    <form className="search-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="seu@email.com"
            {...register('email', { required: 'Informe o email.', pattern: { value: /.+@.+\..+/, message: 'Email inválido.' } })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" placeholder="min. 6 caracteres"
            {...register('password', { required: 'Informe a senha.', minLength: { value: 6, message: 'Mínimo de 6 caracteres.' } })}
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </div>
      {serverError && <div className="alert alert-error" role="alert" aria-live="assertive">{serverError}</div>}
    </form>
  )
}

