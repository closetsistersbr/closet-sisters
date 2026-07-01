# Escopo do Sistema — levantamento com a cliente

Loja **online**, iniciando agora, **3 sócias** (todas com acesso total, mas
cada uma com login próprio), **custo zero de software**, acesso por **PC e
celular via navegador**, entrega o quanto antes.

## Módulos

### 1. Produtos e catálogo
- ~50 itens hoje, crescente.
- Cada peça: nome, **coleção**, **foto**, ficha técnica (medidas, tipo, tecido,
  instruções de lavagem), **preço de custo** e **preço de venda**.
- Variações por **modelo + tamanho + cor**, cada uma com **estoque próprio**.
- Sem código de barras/etiqueta por enquanto.

### 2. Estoque
- Entrada por compra de fornecedor (sem nota fiscal por ora).
- Baixa automática na venda.
- **Alerta de esgotado / estoque baixo.**
- **Estoque em tempo real compartilhado** entre as 3 sócias (não vender peça
  esgotada — garantido no backend).
- Sem consignação; sem transferência entre lojas (loja única).

### 3. Fornecedores
- Cadastro com contato, Instagram, site, peças fornecidas.

### 4. Vendas
- Pagamentos: dinheiro (presencial), PIX, débito, crédito (link/maquininha).
- Parcelamento no cartão — nº de vezes e juros **configuráveis** (a definir).
- Sem fiado/crediário.
- Trocas em **15 dias**, com etiqueta fixada e peça em perfeito estado →
  registro de troca + **vale-troca**.
- Descontos pontuais + **cupom** (ex.: queima de estoque).
- Sem comissão.
- **Reserva de peças.**
- Nota fiscal: emitir **em breve** (Fase 3) — cadastro já preparado.

### 5. Clientes
- Cadastro + **histórico de compras** (o quê, quanto, quando).
- **Pontos / fidelidade.**
- **Mensagens em ocasiões** (ex.: desconto no mês de aniversário).
- Relatórios de preferência (tamanho/cor/peça mais vendidos) p/ orientar compras.

### 6. Financeiro (completo)
- Contas a pagar e a receber.
- **Fluxo de caixa** (entradas e saídas diárias).
- Controle de **despesas**.
- **Controle de cartão** (taxas, prazos de recebimento, parcelas a receber).
- **Metas** de venda (semanal/mensal).

### 7. Relatórios e gestão
- Fechamento **semanal e mensal**: faturamento, custo, **lucro**.
- **Margem de lucro por produto.**
- **Produtos parados** (não vendem).
- Mais vendidos por tamanho/cor/peça.
- Clientes que mais compram.

### 8. Painel inicial (dashboard)
- Resumo do dia: vendas, caixa, alertas de estoque, metas.

### 9. Integrações (Fase 3)
- Marketplaces: Shopee, Mercado Livre, Instagram Shopping.
- WhatsApp (atendimento/vendas).
- Correios e transportadora (frete/envio).
- Cada integração com chave **somente no backend**.

## Fases de entrega
- **Fase 1:** Produtos + Estoque (tempo real) + Vendas + Clientes + Painel + lucro.
- **Fase 2:** Financeiro completo + Fornecedores + Fidelidade + campanhas de aniversário.
- **Fase 3:** Nota fiscal + integrações (marketplace, WhatsApp, Correios).
