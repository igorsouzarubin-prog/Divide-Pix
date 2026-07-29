const pessoas = document.querySelector('#pessoas');
const template = document.querySelector('#pessoa-template');
const total = document.querySelector('#total');
const descricao = document.querySelector('#descricao');
const aviso = document.querySelector('#aviso');
const resumo = document.querySelector('#resumo');
const copiar = document.querySelector('#copiar');

function numero(valor) {
  const semSimbolos = valor.replace(/[^\d,.-]/g, '');
  const limpo = semSimbolos.includes(',')
    ? semSimbolos.replace(/\./g, '').replace(',', '.')
    : semSimbolos;
  return Number(limpo) || 0;
}
function moeda(valor) { return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function adicionar(nome = '') {
  const item = template.content.cloneNode(true);
  item.querySelector('.nome').value = nome;
  pessoas.append(item);
  atualizar();
}
function dados() {
  return [...pessoas.querySelectorAll('.pessoa')].map((linha, i) => ({
    nome: linha.querySelector('.nome').value.trim() || `Pessoa ${i + 1}`,
    pago: numero(linha.querySelector('.pago').value)
  }));
}
function atualizar() {
  const valor = numero(total.value); const lista = dados();
  if (valor <= 0 || lista.length === 0) { resumo.innerHTML = ''; aviso.textContent = 'Adicione o valor e pelo menos uma pessoa.'; copiar.disabled = true; return; }
  const parte = valor / lista.length;
  aviso.textContent = `${lista.length} pessoa${lista.length > 1 ? 's' : ''} · ${moeda(parte)} por pessoa`;
  resumo.innerHTML = lista.map(p => {
    const saldo = parte - p.pago;
    const texto = saldo > .004 ? `deve ${moeda(saldo)}` : saldo < -.004 ? `recebe ${moeda(-saldo)}` : 'já acertou';
    return `<div class="linha"><strong>${escapeHtml(p.nome)}</strong><span class="${saldo > .004 ? 'negativo' : 'positivo'}">${texto}</span></div>`;
  }).join('');
  copiar.disabled = false;
}
function escapeHtml(texto) { const el = document.createElement('span'); el.textContent = texto; return el.innerHTML; }
document.querySelector('#adicionar').addEventListener('click', () => adicionar());
pessoas.addEventListener('input', atualizar);
pessoas.addEventListener('click', e => { if (e.target.classList.contains('remover')) { e.target.closest('.pessoa').remove(); atualizar(); } });
total.addEventListener('input', atualizar); descricao.addEventListener('input', atualizar);
copiar.addEventListener('click', async () => {
  const valor = numero(total.value); const lista = dados(); const titulo = descricao.value.trim() ? `*${descricao.value.trim()}*\n` : '*Divisão de despesa*\n';
  const linhas = lista.map(p => { const saldo = valor / lista.length - p.pago; return `• ${p.nome}: ${saldo > .004 ? `deve ${moeda(saldo)}` : saldo < -.004 ? `recebe ${moeda(-saldo)}` : 'já acertou'}`; });
  await navigator.clipboard.writeText(`${titulo}Total: ${moeda(valor)}\n${linhas.join('\n')}`);
  copiar.textContent = 'Copiado!'; setTimeout(() => copiar.textContent = 'Copiar resumo para WhatsApp', 1800);
});
adicionar('Você'); adicionar('Amigo(a)');
