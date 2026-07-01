// Lógica da interface. Apenas EXIBE dados e captura ações — toda regra de
// negócio (estoque, preço, lucro) acontece no backend.
import { api, auth } from './api.js';

const $ = (sel) => document.querySelector(sel);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const telaLogin = $('#tela-login');
const telaApp = $('#tela-app');
const view = $('#view');

// ---------- Login ----------
$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const erro = $('#login-erro');
  erro.classList.add('oculto');
  try {
    const { token } = await api.login($('#login-email').value, $('#login-senha').value);
    auth.token = token;
    iniciar();
  } catch (err) {
    erro.textContent = err.message;
    erro.classList.remove('oculto');
  }
});

$('#btn-sair').addEventListener('click', () => { auth.sair(); mostrarLogin(); });

function mostrarLogin() { telaApp.classList.add('oculto'); telaLogin.classList.remove('oculto'); }
function mostrarApp() { telaLogin.classList.add('oculto'); telaApp.classList.remove('oculto'); }

// ---------- Navegação ----------
const paginas = {
  dashboard: renderDashboard,
  produtos: renderProdutos,
  vendas: renderVendas,
  clientes: renderClientes,
  relatorios: renderRelatorios,
};

document.querySelectorAll('nav button').forEach((b) => {
  b.addEventListener('click', () => irPara(b.dataset.pg));
});

async function irPara(pg) {
  document.querySelectorAll('nav button').forEach((b) => b.classList.toggle('ativo', b.dataset.pg === pg));
  view.innerHTML = '<p>Carregando...</p>';
  try { await paginas[pg](); }
  catch (err) { view.innerHTML = `<div class="msg erro">${esc(err.message)}</div>`; }
}

// ---------- Dashboard ----------
async function renderDashboard() {
  const d = await api.dashboard();
  view.innerHTML = '';
  view.append(el(`<h2>Painel de hoje</h2>`));
  const cards = el('<div class="cards"></div>');
  cards.append(
    el(`<div class="box"><h3>Vendas hoje</h3><div class="metric">${d.hoje.qtd_vendas}</div></div>`),
    el(`<div class="box"><h3>Faturamento</h3><div class="metric">${brl(d.hoje.faturamento)}</div></div>`),
    el(`<div class="box"><h3>Lucro</h3><div class="metric">${brl(d.hoje.lucro)}</div></div>`),
    el(`<div class="box"><h3>Alertas de estoque</h3><div class="metric">${d.alertasEstoque.length}</div></div>`),
  );
  view.append(cards);
  if (d.alertasEstoque.length) {
    view.append(el('<h2 style="margin-top:1.5rem">Estoque baixo / esgotado</h2>'));
    const linhas = d.alertasEstoque.map((a) =>
      `<tr><td>${esc(a.produto_nome)}</td><td>${esc(a.tamanho)}/${esc(a.cor)}</td><td class="alerta">${a.estoque}</td></tr>`).join('');
    view.append(el(`<table><thead><tr><th>Produto</th><th>Variação</th><th>Estoque</th></tr></thead><tbody>${linhas}</tbody></table>`));
  }
}

// ---------- Produtos ----------
async function renderProdutos() {
  const produtos = await api.produtos();
  view.innerHTML = '';
  view.append(el('<h2>Produtos e estoque</h2>'));
  view.append(botaoNovoProduto());
  if (!produtos.length) { view.append(el('<p>Nenhum produto cadastrado ainda.</p>')); return; }

  const linhas = produtos.map((p) => {
    const vars = p.variacoes.map((v) =>
      `<span class="tag">${esc(v.tamanho)}/${esc(v.cor)}: ${v.estoque <= v.estoque_min ? `<span class="alerta">${v.estoque}</span>` : v.estoque}</span>`).join(' ');
    return `<tr><td>${esc(p.nome)}<br><small>${esc(p.colecao || '')}</small></td>
      <td>${vars}</td><td>${brl(p.preco_venda)}</td><td>${brl(p.preco_venda - p.preco_custo)}</td></tr>`;
  }).join('');
  view.append(el(`<table><thead><tr><th>Produto</th><th>Variações (estoque)</th><th>Preço</th><th>Margem</th></tr></thead><tbody>${linhas}</tbody></table>`));
}

function botaoNovoProduto() {
  const wrap = el('<div style="margin-bottom:1rem"></div>');
  const btn = el('<button class="btn">+ Novo produto</button>');
  btn.addEventListener('click', () => wrap.append(formProduto()));
  wrap.append(btn);
  return wrap;
}

function formProduto() {
  const form = el(`
    <div class="box" style="margin-top:1rem">
      <div class="linha"><div style="flex:2"><label>Nome</label><input id="p-nome"></div>
        <div style="flex:1"><label>Coleção</label><input id="p-colecao"></div></div>
      <div class="linha"><div style="flex:1"><label>Preço custo</label><input id="p-custo" type="number" step="0.01"></div>
        <div style="flex:1"><label>Preço venda</label><input id="p-venda" type="number" step="0.01"></div></div>
      <div class="linha"><div style="flex:1"><label>Tecido</label><input id="p-tecido"></div>
        <div style="flex:1"><label>Tipo</label><input id="p-tipo"></div></div>
      <label>Medidas</label><input id="p-medidas">
      <label>Instruções de lavagem</label><input id="p-lavagem">
      <label>Variações</label>
      <div id="p-vars"></div>
      <button class="btn-sec btn" id="p-add-var" type="button">+ Variação</button>
      <div id="p-msg"></div>
      <div style="margin-top:.8rem"><button class="btn" id="p-salvar">Salvar produto</button></div>
    </div>`);

  const vars = form.querySelector('#p-vars');
  const addVar = () => vars.append(el(`<div class="linha" style="margin-bottom:.5rem">
    <input placeholder="Tamanho (P/M/G)" class="v-tam"><input placeholder="Cor" class="v-cor">
    <input placeholder="Estoque" type="number" class="v-est" style="max-width:90px"></div>`));
  addVar();
  form.querySelector('#p-add-var').addEventListener('click', addVar);

  form.querySelector('#p-salvar').addEventListener('click', async () => {
    const msg = form.querySelector('#p-msg');
    const variacoes = [...vars.querySelectorAll('.linha')].map((l) => ({
      tamanho: l.querySelector('.v-tam').value.trim(),
      cor: l.querySelector('.v-cor').value.trim(),
      estoque: Number(l.querySelector('.v-est').value || 0),
    })).filter((v) => v.tamanho && v.cor);
    try {
      await api.criarProduto({
        nome: form.querySelector('#p-nome').value.trim(),
        colecao: form.querySelector('#p-colecao').value.trim(),
        tecido: form.querySelector('#p-tecido').value.trim(),
        tipo: form.querySelector('#p-tipo').value.trim(),
        medidas: form.querySelector('#p-medidas').value.trim(),
        lavagem: form.querySelector('#p-lavagem').value.trim(),
        preco_custo: Number(form.querySelector('#p-custo').value || 0),
        preco_venda: Number(form.querySelector('#p-venda').value || 0),
        variacoes,
      });
      irPara('produtos');
    } catch (err) { msg.innerHTML = `<div class="msg erro">${esc(err.message)}</div>`; }
  });
  return form;
}

// ---------- Vendas ----------
async function renderVendas() {
  const [produtos, clientes] = await Promise.all([api.produtos(), api.clientes()]);
  view.innerHTML = '';
  view.append(el('<h2>Nova venda</h2>'));

  const carrinho = [];
  const variacoesFlat = produtos.flatMap((p) =>
    p.variacoes.map((v) => ({ id: v.id, label: `${p.nome} ${v.tamanho}/${v.cor} (estoque ${v.estoque}) - ${brl(p.preco_venda)}`, preco: p.preco_venda, estoque: v.estoque })));

  const opcoes = variacoesFlat.map((v) => `<option value="${v.id}" ${v.estoque <= 0 ? 'disabled' : ''}>${esc(v.label)}${v.estoque <= 0 ? ' — ESGOTADO' : ''}</option>`).join('');
  const optClientes = clientes.map((c) => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');

  const box = el(`<div class="box">
    <label>Cliente (opcional)</label><select id="v-cliente"><option value="">Sem cadastro</option>${optClientes}</select>
    <div class="linha"><div style="flex:3"><label>Peça</label><select id="v-var">${opcoes}</select></div>
      <div style="flex:1"><label>Qtd</label><input id="v-qtd" type="number" value="1" min="1"></div>
      <button class="btn-sec btn" id="v-add" type="button" style="align-self:end">Adicionar</button></div>
    <table><thead><tr><th>Item</th><th>Qtd</th><th>Subtotal</th></tr></thead><tbody id="v-itens"></tbody></table>
    <div class="linha" style="margin-top:.8rem"><div style="flex:1"><label>Pagamento</label>
      <select id="v-pag"><option value="dinheiro">Dinheiro</option><option value="pix">PIX</option><option value="debito">Débito</option><option value="credito">Crédito</option></select></div>
      <div style="flex:1"><label>Desconto (R$)</label><input id="v-desc" type="number" value="0" step="0.01"></div></div>
    <h3 id="v-total" style="margin:.5rem 0">Total: R$ 0,00</h3>
    <div id="v-msg"></div>
    <button class="btn" id="v-finalizar">Finalizar venda</button>
  </div>`);
  view.append(box);

  const tbody = box.querySelector('#v-itens');
  const atualizar = () => {
    tbody.innerHTML = carrinho.map((i, idx) =>
      `<tr><td>${esc(i.label)}</td><td>${i.qtd}</td><td>${brl(i.preco * i.qtd)}</td><td><button data-i="${idx}" class="rm">✕</button></td></tr>`).join('');
    const desc = Number(box.querySelector('#v-desc').value || 0);
    const total = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0) - desc;
    box.querySelector('#v-total').textContent = `Total: ${brl(Math.max(total, 0))}`;
    tbody.querySelectorAll('.rm').forEach((b) => b.addEventListener('click', () => { carrinho.splice(Number(b.dataset.i), 1); atualizar(); }));
  };
  box.querySelector('#v-desc').addEventListener('input', atualizar);

  box.querySelector('#v-add').addEventListener('click', () => {
    const id = Number(box.querySelector('#v-var').value);
    const qtd = Number(box.querySelector('#v-qtd').value || 1);
    const v = variacoesFlat.find((x) => x.id === id);
    if (v && qtd > 0) { carrinho.push({ variacaoId: id, qtd, preco: v.preco, label: v.label.split(' (')[0] }); atualizar(); }
  });

  box.querySelector('#v-finalizar').addEventListener('click', async () => {
    const msg = box.querySelector('#v-msg');
    if (!carrinho.length) { msg.innerHTML = '<div class="msg erro">Adicione itens.</div>'; return; }
    try {
      const venda = await api.registrarVenda({
        clienteId: box.querySelector('#v-cliente').value ? Number(box.querySelector('#v-cliente').value) : undefined,
        pagamento: box.querySelector('#v-pag').value,
        desconto: Number(box.querySelector('#v-desc').value || 0),
        itens: carrinho.map((i) => ({ variacaoId: i.variacaoId, quantidade: i.qtd })),
      });
      msg.innerHTML = `<div class="msg ok">Venda registrada! Total ${brl(venda.total)} — lucro ${brl(venda.lucro)}.</div>`;
      carrinho.length = 0;
      setTimeout(() => irPara('vendas'), 1200);
    } catch (err) { msg.innerHTML = `<div class="msg erro">${esc(err.message)}</div>`; }
  });
}

// ---------- Clientes ----------
async function renderClientes() {
  const clientes = await api.clientes();
  view.innerHTML = '';
  view.append(el('<h2>Clientes</h2>'));

  const form = el(`<div class="box" style="margin-bottom:1rem">
    <div class="linha"><div style="flex:2"><label>Nome</label><input id="c-nome"></div>
      <div style="flex:1"><label>Telefone</label><input id="c-tel"></div></div>
    <div class="linha"><div style="flex:2"><label>E-mail</label><input id="c-email"></div>
      <div style="flex:1"><label>Nascimento</label><input id="c-nasc" type="date"></div></div>
    <div id="c-msg"></div><button class="btn" id="c-salvar">Cadastrar cliente</button></div>`);
  view.append(form);
  form.querySelector('#c-salvar').addEventListener('click', async () => {
    try {
      await api.criarCliente({
        nome: form.querySelector('#c-nome').value.trim(),
        telefone: form.querySelector('#c-tel').value.trim(),
        email: form.querySelector('#c-email').value.trim(),
        nascimento: form.querySelector('#c-nasc').value,
      });
      irPara('clientes');
    } catch (err) { form.querySelector('#c-msg').innerHTML = `<div class="msg erro">${esc(err.message)}</div>`; }
  });

  if (clientes.length) {
    const linhas = clientes.map((c) =>
      `<tr><td>${esc(c.nome)}</td><td>${esc(c.telefone || '')}</td><td>${c.pontos} pts</td></tr>`).join('');
    view.append(el(`<table><thead><tr><th>Nome</th><th>Telefone</th><th>Fidelidade</th></tr></thead><tbody>${linhas}</tbody></table>`));
  }
}

// ---------- Relatórios ----------
async function renderRelatorios() {
  const hoje = new Date().toISOString().slice(0, 10);
  const ini = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const [resumo, margem, parados, top] = await Promise.all([
    api.resumo(ini, hoje), api.margem(), api.produtosParados(), api.topClientes(),
  ]);
  view.innerHTML = '';
  view.append(el('<h2>Relatórios (últimos 30 dias)</h2>'));
  const cards = el('<div class="cards"></div>');
  cards.append(
    el(`<div class="box"><h3>Faturamento</h3><div class="metric">${brl(resumo.resumo.faturamento)}</div></div>`),
    el(`<div class="box"><h3>Custo</h3><div class="metric">${brl(resumo.resumo.custo)}</div></div>`),
    el(`<div class="box"><h3>Lucro</h3><div class="metric">${brl(resumo.resumo.lucro)}</div></div>`),
  );
  view.append(cards);

  if (resumo.maisVendidos.length) {
    view.append(el('<h2 style="margin-top:1.5rem">Mais vendidos</h2>'));
    view.append(el(`<table><thead><tr><th>Peça</th><th>Unidades</th><th>Receita</th></tr></thead><tbody>${
      resumo.maisVendidos.map((m) => `<tr><td>${esc(m.descricao)}</td><td>${m.unidades}</td><td>${brl(m.receita)}</td></tr>`).join('')}</tbody></table>`));
  }
  view.append(el('<h2 style="margin-top:1.5rem">Margem por produto</h2>'));
  view.append(el(`<table><thead><tr><th>Produto</th><th>Custo</th><th>Venda</th><th>Margem</th></tr></thead><tbody>${
    margem.map((m) => `<tr><td>${esc(m.nome)}</td><td>${brl(m.preco_custo)}</td><td>${brl(m.preco_venda)}</td><td>${m.margem_pct}%</td></tr>`).join('')}</tbody></table>`));

  if (parados.length) {
    view.append(el('<h2 style="margin-top:1.5rem">Produtos parados (não vendem)</h2>'));
    view.append(el(`<table><tbody>${parados.map((p) => `<tr><td>${esc(p.nome)}</td><td>${esc(p.colecao || '')}</td></tr>`).join('')}</tbody></table>`));
  }
  if (top.length) {
    view.append(el('<h2 style="margin-top:1.5rem">Clientes que mais compram</h2>'));
    view.append(el(`<table><thead><tr><th>Cliente</th><th>Compras</th><th>Total gasto</th></tr></thead><tbody>${
      top.map((c) => `<tr><td>${esc(c.nome)}</td><td>${c.compras}</td><td>${brl(c.total_gasto)}</td></tr>`).join('')}</tbody></table>`));
  }
}

// ---------- Início ----------
function iniciar() { mostrarApp(); irPara('dashboard'); }
if (auth.logado) iniciar(); else mostrarLogin();
