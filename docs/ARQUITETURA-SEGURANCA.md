# Arquitetura e Cibersegurança — Sistema da Loja

> Documento que define COMO o sistema é separado e protegido.
> Regra de ouro: **o navegador (frontend) nunca confia em si mesmo, nunca
> guarda segredos e nunca decide regras de negócio. Quem manda é o backend.**

---

## 1. Separação brutal: Frontend × Backend

```
┌───────────────────────────┐         HTTPS (JSON)          ┌────────────────────────────┐
│         FRONTEND          │  ───────────────────────────► │          BACKEND           │
│  (navegador — PC/celular) │                               │   (servidor — Node/API)    │
│                           │  ◄─────────────────────────── │                            │
│  • HTML / CSS / JS        │                               │  • Regras de negócio       │
│  • Apenas EXIBE dados     │                               │  • Validação de TUDO       │
│  • Captura cliques        │                               │  • Acesso ao banco         │
│  • NÃO tem segredos       │                               │  • Guarda chaves/segredos  │
│  • NÃO tem regra crítica  │                               │  • Autenticação/permissão  │
└───────────────────────────┘                               └────────────────────────────┘
        PÚBLICO                                                       PRIVADO
   (qualquer um vê o código)                              (ninguém vê; só responde à API)
```

**Por que essa separação é inegociável:** tudo que vai para o navegador é
público — qualquer pessoa abre o "inspecionar" e lê o código e os dados que
chegaram. Por isso, **nenhuma decisão que envolva dinheiro, estoque ou segredo
pode acontecer no frontend.**

### O que vive em cada lado

| Pertence ao **Frontend** (público) | Pertence ao **Backend** (privado) |
|---|---|
| Telas, botões, formulários | Verificar se a peça ainda tem estoque |
| Mostrar produtos e preços | Calcular preço, desconto, lucro e total |
| Validação "de conforto" (campo vazio) | Validação **de verdade** (a que vale) |
| Chamar a API e exibir a resposta | Dar baixa no estoque ao vender |
| — | Chaves de API (WhatsApp, Correios, etc.) |
| — | Senhas, tokens, JWT_SECRET |
| — | Quem pode fazer o quê |

---

## 2. Camadas do backend (cada uma com uma única responsabilidade)

```
routes/        → define os endereços da API (ex.: POST /vendas)
   ↓
middlewares/   → portões: autenticação, validação, limite de requisições
   ↓
controllers/   → recebe o pedido, devolve a resposta (não pensa, organiza)
   ↓
services/      → ⭐ REGRAS DE NEGÓCIO (o coração — preço, estoque, lucro)
   ↓
repositories/  → única porta que fala com o banco de dados
   ↓
[ Banco de dados ]
```

Vantagem: a regra "não vender peça esgotada" mora num único lugar
(`services/`), é testável e não se repete espalhada pelo código.

---

## 3. O problema da "última blusa P amarela" (estoque em tempo real)

O frontend **nunca** decide se há estoque. O fluxo seguro é:

1. Frontend envia: "quero vender a variação #123, quantidade 1".
2. Backend, **dentro de uma transação no banco**, verifica o estoque atual,
   confere se ainda há peça e só então dá a baixa. Se duas sócias clicarem ao
   mesmo tempo, o banco garante que **só uma** consegue — a outra recebe
   "esgotado". Isso se chama controle de concorrência e é feito no servidor,
   nunca no navegador.

---

## 4. Princípios de cibersegurança adotados

1. **Segredos só no backend, via `.env`** — nunca no código, nunca no frontend.
   O `.env` está no `.gitignore`; só existe o `.env.example` (sem valores).
2. **Tudo que o cliente envia é tratado como hostil** — toda entrada é
   validada e sanitizada no backend antes de tocar no banco.
3. **Consultas parametrizadas** (nunca montar SQL com texto do usuário) →
   evita SQL Injection.
4. **Autenticação por senha forte (hash com bcrypt/argon2)** — senhas nunca
   são guardadas em texto puro.
5. **Sessão via token assinado (JWT)** com expiração; segredo no `.env`.
6. **CORS restrito** — só as origens conhecidas chamam a API.
7. **Rate limiting** — limita tentativas (ex.: login) para barrar ataques de
   força bruta.
8. **HTTPS obrigatório** em produção (dados trafegam criptografados).
9. **Headers de segurança** (Helmet) — protege contra ataques comuns no navegador.
10. **Princípio do menor dado exposto** — a API só devolve o necessário; nunca
    envia hash de senha, custo interno indevido, etc.
11. **Logs sem dados sensíveis** — nunca registrar senha, token ou chave.
12. **Backups automáticos** do banco a cada mudança relevante (venda, entrada
    de estoque), guardados fora do versionamento.

> Observação honesta: as três sócias terem "acesso a tudo" simplifica
> permissões, mas **cada uma deve ter seu próprio login e senha** (não uma
> conta compartilhada). Assim dá para auditar quem fez cada venda/alteração e
> revogar um acesso sem trocar a senha de todas.

---

## 5. O que NÃO foi feito ainda (e por quê)

- Integrações (WhatsApp, Correios, marketplaces) → Fase 3; cada uma terá sua
  chave **só no backend**.
- Emissão de nota fiscal → Fase 3.
- Banco online compartilhado → começa em SQLite local; a separação em camadas
  permite migrar para Postgres sem reescrever as regras de negócio.
