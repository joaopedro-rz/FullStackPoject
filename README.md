# NewsFinder – Projeto 1 (Frontend)

Aplicação SPA em React + Vite que busca notícias da NewsAPI com filtros, validação e Context API.

Itens solicitados
- API: NewsAPI (https://newsapi.org/)
- Hook React: useReducer (gestão de estado complexo/global)
- Biblioteca externa: React Hook Form (validação avançada do formulário)

Funcionalidades
- Busca com parâmetros: termo (q), idioma, data inicial (from), ordenação e tamanho da página
- Validações antes e depois das requisições (mensagens de erro claras)
- Context API + useReducer para comunicação entre componentes e estado global
- Loading states, tratamento de erros e paginação
- Interface responsiva e moderna (inspirada em BBC/Google News)
- SEO básico com meta tags em index.html

Configuração da chave da NewsAPI
1) Crie .env a partir do exemplo:
   - Copie .env.example para .env
   - Defina VITE_NEWSAPI_KEY="SUA_CHAVE"

2) Alternativa: edite diretamente src/contexts/NewsContext.tsx e preencha API_KEY_HARD_CODED.
   Observação: chaves no frontend ficam expostas; use apenas para fins acadêmicos.

Requisitos de build/execução
- Node 18+ (recomendado)

Scripts
- Desenvolvimento: npm run dev
- Checagem de tipos: npm run typecheck
- Build de produção: npm run build
- Preview do build: npm run preview

Estrutura
- src/components: SearchForm.tsx, NewsList.tsx
- src/contexts: NewsContext.tsx (useReducer + Context API)

Notas
- A NewsAPI pode limitar/impedir requisições diretas do navegador em alguns planos. Se ocorrer erro "Requests from the browser are not allowed", use uma chave válida e/ou um proxy/backend simples.

