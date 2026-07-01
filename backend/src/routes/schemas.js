// Schemas Zod: definem o formato EXATO que a API aceita. Tudo que não bate é
// rejeitado antes de chegar nas regras de negócio.
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  senha: z.string().min(1, 'Informe a senha.'),
});

const variacaoSchema = z.object({
  tamanho: z.string().min(1, 'Tamanho obrigatório.'),
  cor: z.string().min(1, 'Cor obrigatória.'),
  estoque: z.number().int().min(0).default(0),
  estoque_min: z.number().int().min(0).default(1),
});

export const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório.'),
  colecao: z.string().optional(),
  tecido: z.string().optional(),
  tipo: z.string().optional(),
  medidas: z.string().optional(),
  lavagem: z.string().optional(),
  foto_url: z.string().optional(),
  preco_custo: z.number().min(0, 'Custo inválido.'),
  preco_venda: z.number().min(0, 'Preço inválido.'),
  fornecedor_id: z.number().int().optional(),
  variacoes: z.array(variacaoSchema).min(1, 'Adicione ao menos uma variação.'),
});

export const clienteSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório.'),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  documento: z.string().optional(),
  nascimento: z.string().optional(), // YYYY-MM-DD
});

export const vendaSchema = z.object({
  clienteId: z.number().int().optional(),
  pagamento: z.enum(['dinheiro', 'pix', 'debito', 'credito']),
  parcelas: z.number().int().min(1).max(12).default(1),
  desconto: z.number().min(0).default(0),
  itens: z.array(z.object({
    variacaoId: z.number().int(),
    quantidade: z.number().int().min(1),
  })).min(1, 'Adicione ao menos um item.'),
});
