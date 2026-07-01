# Closet Sisters — Sistema da Loja (Vestuário Feminino)

Sistema de gestão para loja online: produtos com variações, estoque em tempo
real, vendas, clientes, financeiro e relatórios. Construído com **separação
total entre frontend e backend** e foco em cibersegurança.

> ⚠️ **Pasta isolada.** Este projeto vive somente dentro de
> `CLOSET SISTERS`. Nada fora desta pasta é tocado.

---

## Estrutura

```
SISTEMA-LOJA-VESTUARIO/
├── README.md                 ← este arquivo
├── .gitignore                ← protege segredos e dados de clientes
├── docs/
│   ├── ARQUITETURA-SEGURANCA.md   ← como o sistema é separado e protegido
│   └── ESCOPO.md                  ← tudo que foi levantado com a cliente
├── backend/                  ← PRIVADO: regras de negócio, banco, segredos
│   ├── .env.example          ← modelo (o .env real nunca é versionado)
│   └── src/
│       ├── config/           ← configuração (lê o .env)
│       ├── routes/           ← endereços da API
│       ├── middlewares/      ← autenticação, validação, limites
│       ├── controllers/      ← organiza pedido → resposta
│       ├── services/         ← ⭐ regras de negócio (estoque, lucro, etc.)
│       ├── repositories/     ← único acesso ao banco de dados
│       └── utils/            ← apoio
└── frontend/                 ← PÚBLICO: só telas; nenhum segredo
    ├── css/  ├── js/  └── assets/
```

## Princípio central

O **frontend só exibe**. Toda regra que envolve dinheiro, estoque ou segredo
acontece no **backend**. Nenhuma chave de API aparece no navegador.
Detalhes em [docs/ARQUITETURA-SEGURANCA.md](docs/ARQUITETURA-SEGURANCA.md).

## Status

🟢 **Fase 1 implementada**: login seguro, Produtos+Estoque, Vendas (com baixa
de estoque atômica), Clientes, Painel e Relatórios (lucro, margem, mais
vendidos, produtos parados, top clientes).

⚠️ **Ainda não foi executado/testado** porque o Node.js não estava instalado na
máquina. Para rodar e validar, siga [docs/COMO-RODAR.md](docs/COMO-RODAR.md).
