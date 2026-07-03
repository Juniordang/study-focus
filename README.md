# Study Focus

Study Focus e uma aplicacao web para organizacao de estudos com foco em produtividade academica. O projeto combina agenda de sessoes, Pomodoro, disciplinas, assuntos, flashcards, revisao espacada, historico de desempenho e um assistente de IA para apoiar duvidas e gerar materiais de estudo.

O repositorio esta dividido em dois modulos principais:

- `study-focus`: frontend em React, TypeScript, Vite e Tailwind CSS.
- `study-focus-api`: backend em Go com Gin, GORM, SQLite, JWT e integracao com IA generativa via Gemini e Groq.

## Funcionalidades

- Cadastro e login de usuarios com autenticacao JWT.
- Dashboard com resumo de estudos, flashcards e desempenho.
- Cadastro, edicao, listagem e remocao de disciplinas.
- Organizacao de assuntos por disciplina.
- Criacao manual e em lote de flashcards.
- Revisao de flashcards com historico e proxima data de revisao.
- Planejamento de sessoes de estudo por data, prioridade e assunto.
- Registro de ciclos Pomodoro associados a sessoes de estudo.
- Assistente de IA para perguntas gerais e perguntas vinculadas a disciplinas.
- Configuracao de chaves de API de IA pelo proprio usuario.

## Tecnologias

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS
- Radix UI
- Lucide React
- Sonner
- Recharts

### Backend

- Go 1.25.3
- Gin
- GORM
- SQLite
- JWT
- godotenv
- Google Generative AI SDK
- Groq API

## Estrutura do Projeto

```text
.
├── study-focus
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── lib
│   │   └── pages
│   ├── package.json
│   └── vite.config.ts
│
└── study-focus-api
    ├── cmd
    │   ├── api
    │   └── config
    ├── internal
    │   ├── data
    │   └── web
    ├── go.mod
    └── main.db
```

## Requisitos

Antes de rodar o projeto, instale:

- Node.js 20 ou superior.
- npm.
- Go 1.25.3 ou versao compativel com o `go.mod`.
- Git, opcional para clonar o projeto.

## Configuracao do Backend

Entre na pasta da API:

```bash
cd study-focus-api
```

Crie ou ajuste o arquivo `.env` com as variaveis abaixo. O arquivo `.exemple.env` existe como base, mas os valores de `PORT` e `DB_PATH` devem ser preenchidos antes de iniciar a API:

```bash
cp .exemple.env .env
```

```env
JWT_SECRET=sua_chave_secreta_para_assinar_tokens
PORT=8080
DB_PATH=main.db
```

Descricao das variaveis:

- `JWT_SECRET`: segredo usado para assinar e validar tokens JWT. Use um valor forte em ambiente real.
- `PORT`: porta onde a API sera executada.
- `DB_PATH`: caminho do arquivo SQLite. Com `main.db`, o banco fica em `study-focus-api/main.db`.

A API executa as migracoes automaticamente ao iniciar, criando ou atualizando as tabelas no SQLite via GORM.

Instale as dependencias Go:

```bash
go mod download
```

Execute a API:

```bash
go run ./cmd/api
```

Com a configuracao acima, a API ficara disponivel em:

```text
http://localhost:8080/api/v1
```

## Configuracao do Frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd study-focus
```

Instale as dependencias:

```bash
npm install
```

Opcionalmente, crie um arquivo `.env` para informar a URL da API:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

Se `VITE_API_URL` nao for definido, o frontend usa automaticamente:

```text
http://localhost:8080/api/v1
```

Execute o frontend:

```bash
npm run dev
```

Por padrao, o Vite abrira a aplicacao em:

```text
http://localhost:5173
```

A API ja permite requisicoes CORS vindas de `localhost` nas portas `5173`, `5174` e `5175`.

## Como Usar

1. Inicie o backend com `go run ./cmd/api`.
2. Inicie o frontend com `npm run dev`.
3. Acesse `http://localhost:5173`.
4. Crie uma conta em `/cadastro` ou faca login em `/login`.
5. Cadastre disciplinas e assuntos.
6. Crie flashcards manualmente ou com apoio da IA.
7. Planeje sessoes de estudo.
8. Use o Pomodoro para registrar ciclos de foco.
9. Revise flashcards na tela de revisao.
10. Acompanhe estatisticas e historico no dashboard.

## Assistente de IA

O assistente usa chaves configuradas pelo proprio usuario na tela de configuracoes da aplicacao. No frontend, acesse:

```text
/configuracoes
```

Na tela de configuracoes, cadastre sua chave do Google Gemini ou da Groq. O backend possui provedor para Gemini usando o modelo `gemini-2.5-flash` e provedor para Groq usando o modelo `llama-3.1-8b-instant`.

Importante: nao coloque chaves de API diretamente no codigo-fonte ou em repositorios publicos.

## Principais Rotas da API

Todas as rotas abaixo usam o prefixo:

```text
/api/v1
```

### Autenticacao e Usuario

- `POST /usuarios`: cria um usuario.
- `POST /usuarios/login`: autentica um usuario.
- `PATCH /usuarios/me/config`: atualiza configuracoes do usuario autenticado.

### Chaves de IA

- `GET /usuarios/me/chave-api`: lista chaves de IA cadastradas.
- `POST /usuarios/me/chave-api`: cadastra uma chave.
- `PUT /usuarios/me/chave-api`: atualiza uma chave.

### Disciplinas

- `GET /usuarios/me/disciplinas`: lista disciplinas.
- `POST /usuarios/me/disciplinas`: cria uma disciplina.
- `PUT /usuarios/me/disciplinas/:id`: atualiza uma disciplina.
- `DELETE /usuarios/me/disciplinas/:id`: remove uma disciplina.

### Flashcards

- `GET /usuarios/me/disciplinas/:id/flashcards`: lista flashcards de uma disciplina.
- `POST /usuarios/me/disciplinas/:id/flashcards`: cria um flashcard.
- `POST /usuarios/me/flashcards/lote`: cria flashcards em lote.
- `GET /usuarios/me/flashcards/revisar`: lista flashcards pendentes de revisao.
- `PATCH /usuarios/me/flashcards/:id/revisar`: registra uma revisao.
- `PUT /usuarios/me/flashcards/:id`: atualiza um flashcard.
- `DELETE /usuarios/me/flashcards/:id`: remove um flashcard.
- `GET /usuarios/me/historico_revisoes`: lista o historico de revisoes.

### Agenda e Pomodoro

- `GET /usuarios/me/sessao`: lista sessoes de estudo.
- `POST /usuarios/me/sessao/validar`: valida uma sessao antes do cadastro.
- `POST /usuarios/me/sessao`: cria uma sessao de estudo.
- `DELETE /usuarios/me/sessao/:id`: remove uma sessao de estudo.
- `POST /usuarios/me/pomodoro`: registra uma execucao Pomodoro.

### IA e Dashboard

- `POST /usuarios/me/historico_ia`: envia uma pergunta ao assistente.
- `POST /usuarios/me/ia/disciplina`: envia uma pergunta vinculada a disciplina e assunto.
- `GET /usuarios/me/historico_ia`: lista historico de perguntas da IA.
- `GET /usuarios/me/dashboard`: retorna estatisticas do dashboard.

As rotas protegidas exigem o cabecalho:

```http
Authorization: Bearer <token>
```

O frontend gerencia esse token automaticamente apos login ou cadastro.

## Scripts Disponiveis

No frontend:

```bash
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # gera build de producao
npm run lint     # executa o ESLint
npm run preview  # serve localmente o build gerado
```

No backend:

```bash
go run ./cmd/api     # inicia a API
go test ./...        # executa os testes Go, se existirem
go mod download      # baixa as dependencias
```

## Build de Producao

Para gerar o build do frontend:

```bash
cd study-focus
npm run build
```

Os arquivos finais serao gerados em:

```text
study-focus/dist
```

Para validar o build localmente:

```bash
npm run preview
```

Para executar a API em producao, configure variaveis de ambiente seguras e rode o binario Go:

```bash
cd study-focus-api
go build -o study-focus-api ./cmd/api
./study-focus-api
```

## Banco de Dados

O projeto usa SQLite. O arquivo padrao do banco e `study-focus-api/main.db`, definido por `DB_PATH=main.db`.

As entidades principais sao:

- `Usuario`
- `Disciplina`
- `Assunto`
- `Flashcard`
- `HistoricoRevisoes`
- `SessaoEstudo`
- `Pomodoro`
- `ChaveIA`
- `HistoricoIA`

Ao iniciar, o backend chama `AutoMigrate`, portanto as tabelas sao criadas automaticamente quando ainda nao existem.

## Solucao de Problemas

### O frontend nao conecta na API

Verifique se a API esta rodando em `http://localhost:8080/api/v1` e se o `VITE_API_URL` aponta para essa URL.

### Erro de CORS

Confirme se o frontend esta rodando em uma das portas liberadas pela API: `5173`, `5174` ou `5175`.

### Token invalido ou usuario redirecionado para login

O frontend remove o token local quando a API retorna `401`. Faca login novamente. Se o problema persistir, confira se o `JWT_SECRET` nao mudou entre a geracao e a validacao do token.

### Banco nao foi criado

Confira se `DB_PATH` esta definido e se a API tem permissao para criar arquivos dentro de `study-focus-api`.

### Assistente de IA nao responde

Verifique se ao menos uma chave de IA foi cadastrada em `/configuracoes` e se ela esta valida no provedor correspondente, como Google AI Studio para Gemini ou Groq Console para Groq.

## Observacoes de Seguranca

- Nao versionar arquivos `.env` com segredos reais.
- Usar um `JWT_SECRET` forte fora do ambiente local.
- Tratar chaves de IA como credenciais sensiveis.
- Em producao, revisar CORS, HTTPS, expiracao de tokens e armazenamento seguro de segredos.

## Licenca

Este projeto foi desenvolvido como parte de um trabalho academico. Caso deseje distribuir ou reutilizar o codigo, defina uma licenca apropriada para o repositorio.
