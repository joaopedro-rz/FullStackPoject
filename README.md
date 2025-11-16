# NewsFinder – Projeto  (Frontend)

Aplicação SPA em React + Vite que busca notícias da NewsAPI com filtros, validação e estado global via Context API + useReducer.

Tecnologias principais
- API: NewsAPI (https://newsapi.org/)
- Hook React: useReducer (gestão de estado global e transições de requisição)
- Biblioteca externa: React Hook Form (validação de formulário)

Funcionalidades
- Busca com parâmetros: termo (q), idioma (language), data inicial (from), ordenação (sortBy) e tamanho da página (pageSize)
- Validação de campos obrigatórios e regras: termo mínimo 2 caracteres, idioma obrigatório, pageSize entre 5 e 100
- Mensagens de erro antes da requisição (validação cliente) e depois (erros retornados pela API tratados) 
- Paginação (próxima/anterior) com cálculo de total de páginas
- Estado global com Context API + useReducer (status, erro, artigos, filtros, paginação)
- Skeleton loading e indicadores de status (idle, loading, failed, succeeded)
- Tratamento de erros específicos da NewsAPI (ex.: bloqueio de requisições pelo browser)
- Interface responsiva e foco em legibilidade
- Acessibilidade básica (aria-live em mensagens de erro)
- SEO básico com meta tags em index.html

Configuração da chave da NewsAPI
A aplicação inclui uma chave padrão hard-coded em src/contexts/NewsContext.jsx (API_KEY_HARD_CODED). Para usar sua própria chave sem expor no código:
1. Crie arquivo .env na raiz
2. Defina: VITE_NEWSAPI_KEY="SUA_CHAVE"
3. Reinicie o servidor de desenvolvimento

Estrutura
- src/components: App.jsx, main.jsx, SearchForm.jsx, NewsList.jsx, styles.css
- src/contexts: NewsContext.jsx

Requisitos de build/execução
- Node 18+ (recomendado)

Scripts
- Desenvolvimento: npm run dev
- Build produção: npm run build
- Preview do build: npm run preview

Notas
- Uso acadêmico. Chaves expostas no frontend podem ser copiadas. Considere proxy/backend se necessário.
- Caso a API retorne bloqueio a requisições do navegador, utilize plano adequado ou um servidor intermediário.

# NewsFinder – Projeto Fullstack (Entrega 2)

Aplicação SPA (Frontend React) + Backend Express + Banco SQLite (Knex). Implementa Login, Busca e Inserção de artigos salvos.

Tecnologias principais
- Frontend: React, Vite, useReducer, React Hook Form
- Backend: Express, SQLite (Knex), JWT, bcrypt, helmet, rate-limit, express-validator, sanitize-html, apicache, compression, morgan

Funcionalidades Frontend
- Login (email/senha) e manutenção de sessão JWT
- Busca autenticada de notícias (q, language, from, sortBy, page, pageSize)
- Inserção (salvar artigo) autenticada
- Validação client + exibição de erros da API
- Paginação e loading skeleton
- Estado global via Context + useReducer
- Salvar artigo com feedback de status

Backend (REST)
- POST /api/auth/login: autenticação (JWT)
- POST /api/auth/seed: semear usuário (opcional)
- GET /api/news: busca proxy NewsAPI (autenticado, cache 5 min)
- GET /api/articles: lista artigos salvos (autenticado)
- POST /api/articles: insere artigo (autenticado)

Segurança
- Senhas com bcrypt
- JWT com expiração (2h)
- helmet, rate limiting, CORS
- Validação e sanitização (express-validator, sanitize-html)
- Proteção contra XSS/Injection via sanitização e validação
- Logs com morgan

Performance
- Cache de respostas de notícias (apicache)
- Compressão gzip (compression)
- Pool de conexões SQLite (Knex pool min 1 max 5)

Variáveis de ambiente (backend .env)
- PORT=3000
- JWT_SECRET=chave_segura
- NEWSAPI_KEY=sua_chave_newsapi
- SEED_DEFAULT_USER=true (opcional para criar admin@example.com)

Execução
Frontend:
1. npm install
2. npm run dev

Backend:
1. cd backend
2. npm install
3. Criar .env conforme acima
4. npm run dev

Estrutura
- frontend/src/components: App.jsx, LoginForm.jsx, SearchForm.jsx, NewsList.jsx
- frontend/src/contexts: AuthContext.jsx, NewsContext.jsx
- backend/src/config: db.js
- backend/src/models: User.js, Article.js
- backend/src/routes: auth.js, news.js, articles.js
- backend/src/server.js

Notas
- Apenas usuários autenticados podem buscar e salvar.
- Validações de campos no frontend e backend com retorno de mensagens JSON.
