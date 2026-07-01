// ⭐ CORAÇÃO DO SISTEMA: a regra de venda.
// Tudo aqui roda no BACKEND. O frontend só pede "venda estes itens"; quem
// confere estoque, calcula preço/lucro e dá baixa é este serviço.
import { withTransaction } from '../config/database.js';
import { produtoRepository } from '../repositories/produtoRepository.js';
import { vendaRepository } from '../repositories/vendaRepository.js';
import { clienteRepository } from '../repositories/clienteRepository.js';
import { AppError, Conflict } from '../utils/errors.js';

export const vendaService = {
  async registrar({ itens, clienteId, usuarioId, pagamento, parcelas = 1, desconto = 0 }) {
    if (!Array.isArray(itens) || itens.length === 0) {
      throw new AppError('A venda precisa de pelo menos um item.');
    }

    // A transação garante: ou TODA a venda acontece, ou NADA acontece.
    // Se faltar estoque de qualquer item, tudo é desfeito (rollback).
    const vendaId = await withTransaction(async (client) => {
      let total = 0;
      let custoTotal = 0;
      const itensPersistir = [];

      for (const item of itens) {
        const variacao = await produtoRepository.buscarVariacao(item.variacaoId, client);
        if (!variacao) throw new AppError(`Variação ${item.variacaoId} não existe.`);

        const produto = await produtoRepository.buscarPorId(variacao.produto_id, client);
        const qtd = Number(item.quantidade);
        if (!Number.isInteger(qtd) || qtd <= 0) {
          throw new AppError('Quantidade inválida.');
        }

        // PREÇO E CUSTO vêm do banco — NUNCA do que o navegador enviou.
        const precoUnit = Number(produto.preco_venda);
        const custoUnit = Number(produto.preco_custo);

        // Baixa atômica: impede vender peça esgotada (concorrência segura).
        const baixou = await vendaRepository.baixarEstoque(variacao.id, qtd, client);
        if (!baixou) {
          throw Conflict(
            `Estoque insuficiente: ${produto.nome} (${variacao.tamanho}/${variacao.cor}). ` +
            `Disponível: ${variacao.estoque}.`,
          );
        }

        total += precoUnit * qtd;
        custoTotal += custoUnit * qtd;
        itensPersistir.push({
          variacao_id: variacao.id,
          quantidade: qtd,
          preco_unitario: precoUnit,
          custo_unitario: custoUnit,
          descricao: `${produto.nome} ${variacao.tamanho}/${variacao.cor}`,
        });
      }

      // Desconto validado (não negativo nem maior que o total).
      const desc = Math.min(Math.max(Number(desconto) || 0, 0), total);
      const totalFinal = total - desc;
      const lucro = totalFinal - custoTotal;

      const novaVendaId = await vendaRepository.inserirVenda({
        cliente_id: clienteId ?? null,
        usuario_id: usuarioId,
        pagamento,
        parcelas,
        desconto: desc,
        total: totalFinal,
        custo_total: custoTotal,
        lucro,
      }, client);

      for (const it of itensPersistir) {
        await vendaRepository.inserirItem({ venda_id: novaVendaId, ...it }, client);
      }

      // Fidelidade: 1 ponto a cada R$ 1 (regra simples, ajustável).
      if (clienteId) {
        await clienteRepository.adicionarPontos(clienteId, Math.floor(totalFinal), client);
      }

      return novaVendaId;
    });

    return vendaRepository.buscarPorId(vendaId);
  },
};
