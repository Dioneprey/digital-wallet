# 📄 Digital Wallet — Documentação Técnica

## 🔹 Visão Geral

**digital-wallet** é uma aplicação composta por **API em NestJS** e uma **interface web em Next.js**, permitindo que usuários realizem operações de **cadastro, autenticação, transferência de saldo, depósitos e reversões de transferências**.

---

## 📌 Requisitos do Sistema

- Node.js >= 20
- npm >= 10
- Docker e Docker Compose

---

## 📌 Tecnologias Utilizadas

### **Backend – NestJS**

- NestJS
- TypeScript
- Clean Architecture + DDD
- Princípios SOLID
- PostgreSQL + Prisma ORM
- Redis – Cache e filas
- BullMQ – Gestão de filas para tarefas assíncronas.
- JWT + Bcrypt – autenticação e segurança
- Zod / Class-Validator – validação de dados
- Testes unitários e E2E (Vitest + Supertest)
- Docker
- OpenTelemetry (OTel) com Jaeger.
- Sentry – monitoramento e logs
- GitHub Actions – CI/CD + execução de testes automatizados

### **Frontend – Next.js**

- Next.js 15 (App Router)
- Server Actions
- TanStack Query
- TailwindCSS
- WebSockets - (Notificações e atualização de lista de transações)

---

## 🧩 Funcionalidades Implementadas

### 🔐 Autenticação e Cadastro

- Cadastro de usuário
- Login e logout (cookies HttpOnly + refresh token)
- Recuperação de perfil via token

### 💰 Operações da Carteira

- Depósito e saque de saldo
- Transferência entre usuários
- Reversão de transferência

> **Observação:** Todas as operações são processadas em filas para garantir consistência e permitir tentativas automáticas (retry).

### 🔄 Reversão de Transações

- Transferências podem ser revertidas:
  - por inconsistência
  - por solicitação do usuário

> **Observação:** Na reversão de uma transferência, o valor é descontado do usuário que havia recebido, mesmo que isso o deixe com saldo negativo (como se estivesse em débito).

### 📊 Dashboard (Frontend)

- Tela de login e cadastro
- Visualização do saldo
- Histórico de transações
- Formulário de depósito e saque
- Formulário de transferência
- Ação de reversão dentro do próprio histórico

---

# ▶️ Execução do Projeto

## 🔌 Opção 1: Rodar tudo via Docker

```bash
git clone https://github.com/Dioneprey/digital-wallet.git

cd digital-wallet

cp web/.env.example web/.env && cp api/.env.example api/.env

docker compose --profile app up --build -d
```

## 🔌 Opção 2: Rodar localmente ( serviços continuam no docker )

```bash
git clone https://github.com/Dioneprey/digital-wallet.git
cd digital-wallet

cp web/.env.example web/.env && cp api/.env.example api/.env

docker compose up --build -d

# 🔹 Api - Terminal 1
# digital-wallet/api
cd api
npm install           # Instalar dependências
npm run db:deploy     # Aplicar migrations e gerar Prisma Client
npm run start:dev     # Rodar a API

# 🔹 Web - Terminal 2
# digital-wallet/web
cd web
npm install           # Instalar dependênciasClient
npm run dev     # Rodar o nextjs
```

# 🌐 URLs

## 📘 Front

- Endpoint: [http://localhost:3000](http://localhost:3000)

---

## 📘 API

- Endpoint: [http://localhost:3333/api](http://localhost:3333/api)
- Swagger: [http://localhost:3333/api/docs](http://localhost:3333/api/docs)

---

## 🔍 Observabilidade

- **Jaeger (Tracing):** [http://localhost:16686](http://localhost:16686)
- **Bull Board (Filas):** [http://localhost:3333/api/queues](http://localhost:3333/api/queues)

---
