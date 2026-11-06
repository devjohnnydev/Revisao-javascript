/* =========================================================
   APP · Revisão de Semestre (DS · SENAI Morvan Figueiredo)
   Prof. Johnny Braga de Oliveira
   Tudo roda no navegador: ideal para GitHub Pages.
   ========================================================= */

/* ---------- Utilitários ---------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function esc(txt) {
  return String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function criar(tag, attrs = {}, html = '') {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  });
  if (html) el.innerHTML = html;
  return el;
}

let timerToast;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('visivel');
  clearTimeout(timerToast);
  timerToast = setTimeout(() => t.classList.remove('visivel'), 2200);
}

/* ---------- Realce de sintaxe (simples) ---------- */
const RE_JS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|of|in|while|new|true|false|null|undefined|typeof|this)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\s*\()/g;

function realcar(codigo, lang = 'js') {
  if (lang === 'html') {
    // um único passe, para não realçar o HTML que nós mesmos inserimos
    return esc(codigo).replace(/(&lt;!--[\s\S]*?--&gt;)|(&lt;\/?)([\w-]+)|("[^"\n]*")/g, (m, com, abre, tag, str) => {
      if (com) return `<span class="tk-com">${com}</span>`;
      if (tag) return `${abre}<span class="tk-kw">${tag}</span>`;
      return `<span class="tk-str">${str}</span>`;
    });
  }
  if (lang === 'css') {
    return esc(codigo)
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="tk-com">$1</span>')
      .replace(/(--[\w-]+)/g, '<span class="tk-fn">$1</span>')
      .replace(/(#[0-9a-fA-F]{3,6}\b)/g, '<span class="tk-num">$1</span>');
  }
  let saida = '', ultimo = 0, m;
  RE_JS.lastIndex = 0;
  while ((m = RE_JS.exec(codigo))) {
    saida += esc(codigo.slice(ultimo, m.index));
    const classe = m[1] ? 'tk-com' : m[2] ? 'tk-str' : m[3] ? 'tk-kw' : m[4] ? 'tk-num' : 'tk-fn';
    saida += `<span class="${classe}">${esc(m[0])}</span>`;
    ultimo = RE_JS.lastIndex;
  }
  return saida + esc(codigo.slice(ultimo));
}

/* ---------- Estado salvo no navegador ---------- */
const CHAVE = 'revisaoDS_morvan_v1';
const padrao = () => ({ lab3d: {}, missoes: {}, quiz: {}, saidas: {}, respostas: {}, funcoes: {}, dom: {}, codigos: {}, aluno: {}, tema: 'escuro' });

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    return Object.assign(padrao(), salvo || {});
  } catch (e) {
    return padrao();
  }
}
let estado = carregar();

function salvar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* modo privado: segue sem salvar */ }
  atualizarProgresso();
}

/* ---------- Tema (o próprio site usa classList.toggle!) ---------- */
function aplicarTema() {
  document.body.classList.toggle('claro', estado.tema === 'claro');
}
$('#btnTema').addEventListener('click', () => {
  estado.tema = estado.tema === 'claro' ? 'escuro' : 'claro';
  aplicarTema();
  salvar();
});

/* ---------- Textareas: Tab insere 2 espaços ---------- */
document.addEventListener('keydown', (e) => {
  const ta = e.target;
  if (e.key !== 'Tab' || ta.tagName !== 'TEXTAREA' || ta.dataset.codigo === undefined) return;
  e.preventDefault();
  const ini = ta.selectionStart, fim = ta.selectionEnd;
  ta.value = ta.value.slice(0, ini) + '  ' + ta.value.slice(fim);
  ta.selectionStart = ta.selectionEnd = ini + 2;
  ta.dispatchEvent(new Event('input'));
});

/* =========================================================
   MISSÕES
   ========================================================= */
function renderMissoes() {
  const box = $('#listaMissoes');
  box.innerHTML = '';
  MISSOES.forEach((m) => {
    const card = criar('article', { class: 'cartao missao' });
    const feitos = m.itens.filter(([id]) => estado.missoes[id]).length;
    card.innerHTML = `
      <div class="missao__topo"><h3>${m.titulo}</h3><span class="missao__nivel">${m.nivel}</span></div>
      <p class="missao__desc">${m.descricao}</p>
      <ul class="missao__itens">
        ${m.itens.map(([id, txt]) => `
          <li><label><input type="checkbox" data-id="${id}" ${estado.missoes[id] ? 'checked' : ''}><span>${txt}</span></label></li>`).join('')}
      </ul>
      <div class="mini-barra"><span style="width:${(feitos / m.itens.length) * 100}%"></span></div>`;
    box.appendChild(card);
  });
  $$('input[type=checkbox]', box).forEach((cb) => {
    cb.addEventListener('change', () => {
      estado.missoes[cb.dataset.id] = cb.checked;
      salvar();
      const card = cb.closest('.missao');
      const todos = $$('input', card);
      $('.mini-barra span', card).style.width = (todos.filter((c) => c.checked).length / todos.length) * 100 + '%';
    });
  });
}

/* =========================================================
   STARTER
   ========================================================= */
let arquivoAtual = 'index.html';
function linguagemDe(nome) {
  return nome.endsWith('.html') ? 'html' : nome.endsWith('.css') ? 'css' : 'js';
}
function renderStarter() {
  const abas = $('#abasStarter');
  abas.innerHTML = '';
  Object.keys(STARTER).forEach((nome) => {
    const b = criar('button', { type: 'button', role: 'tab', 'aria-selected': String(nome === arquivoAtual) }, nome);
    b.addEventListener('click', () => { arquivoAtual = nome; renderStarter(); });
    abas.appendChild(b);
  });
  $('#codigoStarter').innerHTML = realcar(STARTER[arquivoAtual], linguagemDe(arquivoAtual));
}
$('#btnCopiarStarter').addEventListener('click', () => copiar(STARTER[arquivoAtual], arquivoAtual + ' copiado!'));
$('#btnBaixarStarter').addEventListener('click', () => {
  const tipos = { html: 'text/html', css: 'text/css', js: 'text/javascript' };
  const blob = new Blob([STARTER[arquivoAtual]], { type: tipos[linguagemDe(arquivoAtual)] + ';charset=utf-8' });
  const a = criar('a', { href: URL.createObjectURL(blob), download: arquivoAtual });
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('Baixando ' + arquivoAtual);
});

function copiar(texto, msg = 'Copiado!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(() => toast(msg), () => copiarFallback(texto, msg));
  } else {
    copiarFallback(texto, msg);
  }
}
function copiarFallback(texto, msg) {
  const ta = criar('textarea');
  ta.value = texto;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast(msg); } catch (e) { toast('Não foi possível copiar'); }
  ta.remove();
}

/* =========================================================
   QUIZ
   ========================================================= */
let filtroQuiz = 'Todos';
let ordemQuiz = QUIZ.map((q) => q.id);
let ordemOpcoes = {}; // id -> array de índices

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderFiltros() {
  const cats = ['Todos', ...new Set(QUIZ.map((q) => q.cat))];
  const box = $('#filtrosQuiz');
  box.innerHTML = '';
  cats.forEach((c) => {
    const b = criar('button', { type: 'button', class: c === filtroQuiz ? 'ativo' : '' }, c);
    b.addEventListener('click', () => { filtroQuiz = c; renderFiltros(); renderQuiz(); });
    box.appendChild(b);
  });
}

function renderQuiz() {
  const box = $('#listaQuiz');
  box.innerHTML = '';
  const mapa = Object.fromEntries(QUIZ.map((q) => [q.id, q]));
  const lista = ordemQuiz.map((id) => mapa[id]).filter((q) => filtroQuiz === 'Todos' || q.cat === filtroQuiz);

  lista.forEach((q, n) => {
    const card = criar('article', { class: 'cartao questao' });
    const ordem = ordemOpcoes[q.id] || q.opts.map((_, i) => i);
    card.innerHTML = `
      <div class="questao__meta"><span class="questao__cat">${q.cat}</span><span>#${n + 1}</span></div>
      <p class="questao__enunciado">${q.q}</p>
      ${q.code ? `<pre class="codigo"><code>${realcar(q.code, q.lang || 'js')}</code></pre>` : ''}
      <div class="opcoes"></div>
      <div class="feedback-box"></div>`;
    const opcoes = $('.opcoes', card);
    ordem.forEach((i) => {
      const b = criar('button', { type: 'button', class: 'opcao', 'data-i': i }, q.opts[i]);
      b.addEventListener('click', () => responder(q, i, card));
      opcoes.appendChild(b);
    });
    box.appendChild(card);
    if (estado.quiz[q.id]) mostrarResposta(q, estado.quiz[q.id].escolha, card);
  });
  atualizarPlacarQuiz();
}

function responder(q, escolha, card) {
  if (estado.quiz[q.id]) return;
  estado.quiz[q.id] = { escolha, acerto: escolha === q.ans };
  mostrarResposta(q, escolha, card);
  salvar();
  atualizarPlacarQuiz();
}

function mostrarResposta(q, escolha, card) {
  $$('.opcao', card).forEach((b) => {
    const i = Number(b.dataset.i);
    b.disabled = true;
    if (i === q.ans) b.classList.add('certa');
    else if (i === escolha) b.classList.add('errada');
  });
  const ok = escolha === q.ans;
  $('.feedback-box', card).innerHTML = `
    <div class="feedback ${ok ? 'feedback--ok' : 'feedback--erro'}">
      <b>${ok ? '✔ Correto!' : '✘ Não foi dessa vez.'}</b>${q.exp}
    </div>`;
}

function atualizarPlacarQuiz() {
  const acertos = Object.values(estado.quiz).filter((r) => r.acerto).length;
  const resp = Object.keys(estado.quiz).length;
  $('#placarQuiz').textContent = `${acertos} / ${QUIZ.length}` + (resp < QUIZ.length ? ` (respondidas: ${resp})` : '');
}

$('#btnEmbaralhar').addEventListener('click', () => {
  ordemQuiz = embaralhar(QUIZ.map((q) => q.id));
  ordemOpcoes = Object.fromEntries(QUIZ.map((q) => [q.id, embaralhar(q.opts.map((_, i) => i))]));
  renderQuiz();
  toast('Questões e alternativas embaralhadas');
});
$('#btnReiniciarQuiz').addEventListener('click', () => {
  if (!confirm('Apagar suas respostas do quiz?')) return;
  estado.quiz = {};
  salvar();
  renderQuiz();
});

/* =========================================================
   QUAL A SAÍDA?
   ========================================================= */
function formatarLog(v) {
  if (typeof v === 'string') return v;
  if (typeof v === 'function') return '[Function]';
  if (v === undefined) return 'undefined';
  if (typeof v === 'number' || typeof v === 'boolean' || v === null) return String(v);
  try { return JSON.stringify(v); } catch (e) { return String(v); }
}

// executa um trecho de código com um console "falso" que captura as linhas
function executarTrecho(codigo) {
  const linhas = [];
  const falso = {
    log: (...a) => linhas.push(a.map(formatarLog).join(' ')),
    error: (...a) => linhas.push(a.map(formatarLog).join(' ')),
    warn: (...a) => linhas.push(a.map(formatarLog).join(' '))
  };
  let erro = null;
  try {
    new Function('console', codigo)(falso);
  } catch (e) {
    erro = e.name + ': ' + e.message;
  }
  return { linhas, erro };
}

const normalizar = (txt) => txt.split('\n').map((l) => l.trim()).filter((l) => l !== '').join('\n');

function renderSaidas() {
  const box = $('#listaSaidas');
  box.innerHTML = '';
  SAIDAS.forEach((s, i) => {
    const card = criar('article', { class: 'cartao saida' });
    const feito = estado.saidas[i];
    card.innerHTML = `
      <div class="questao__meta">
        <span class="questao__cat">#${i + 1} · ${s.titulo}</span>
        <span class="selo ${feito ? 'selo--ok' : 'selo--pend'}">${feito ? '✔ acertou' : s.nivel}</span>
      </div>
      <pre class="codigo"><code>${realcar(s.code)}</code></pre>
      <label for="resp${i}">Sua resposta (uma linha por console.log, sem aspas):</label>
      <textarea id="resp${i}" rows="${s.esperado.split('\n').length + 1}" spellcheck="false" placeholder="digite a saída aqui"></textarea>
      <div class="acoes-linha">
        <button type="button" class="btn btn--mini btn--primario" data-acao="conferir">Conferir</button>
        <button type="button" class="btn btn--mini" data-acao="executar">▶ Executar</button>
        <button type="button" class="btn btn--mini btn--fantasma" data-acao="dica">Dica</button>
      </div>
      <div class="retorno"></div>`;
    const ta = $('textarea', card);
    ta.value = estado.respostas[i] || '';
    ta.addEventListener('input', () => { estado.respostas[i] = ta.value; salvar(); });
    const retorno = $('.retorno', card);

    $('[data-acao=conferir]', card).addEventListener('click', () => {
      if (!ta.value.trim()) { toast('Escreva sua resposta primeiro'); return; }
      const ok = normalizar(ta.value) === normalizar(s.esperado);
      if (ok) {
        estado.saidas[i] = true;
        salvar();
        const selo = $('.selo', card);
        selo.className = 'selo selo--ok';
        selo.textContent = '✔ acertou';
      }
      retorno.innerHTML = ok
        ? '<div class="feedback feedback--ok"><b>✔ Exato!</b>Agora clique em Executar para confirmar.</div>'
        : '<div class="feedback feedback--erro"><b>✘ Ainda não.</b>Releia o código linha a linha. Você pode tentar de novo ou usar a dica.</div>';
    });

    $('[data-acao=executar]', card).addEventListener('click', () => {
      const r = executarTrecho(s.code);
      retorno.innerHTML = `<div class="console">${r.linhas.map(esc).join('\n')}${r.erro ? `\n<span class="err">${esc(r.erro)}</span>` : ''}</div>`;
    });

    $('[data-acao=dica]', card).addEventListener('click', () => {
      retorno.innerHTML = `<div class="feedback feedback--ok"><b>💡 Dica</b>${esc(s.dica)}</div>`;
    });

    box.appendChild(card);
  });
  atualizarPlacarSaidas();
}

function atualizarPlacarSaidas() {
  $('#placarSaidas').textContent = `${Object.values(estado.saidas).filter(Boolean).length} / ${SAIDAS.length}`;
}

/* =========================================================
   LAB DE FUNCTIONS
   ========================================================= */
let funcaoAtual = FUNCOES[0].id;

function clonar(v) {
  return typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));
}
function iguais(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9;
  return JSON.stringify(a) === JSON.stringify(b);
}
function mostrarValor(v) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'number' && Number.isNaN(v)) return 'NaN';
  return JSON.stringify(v);
}

function renderListaLab(caixa, desafios, atual, aprovados, aoEscolher) {
  caixa.innerHTML = '';
  desafios.forEach((d, i) => {
    const b = criar('button', { type: 'button', class: 'lab__item' + (d.id === atual ? ' ativo' : '') },
      `<span>${i + 1}. ${d.titulo}</span>${aprovados[d.id] ? '<span class="ok">✔</span>' : `<small class="selo selo--pend">${d.nivel}</small>`}`);
    b.addEventListener('click', () => aoEscolher(d.id));
    caixa.appendChild(b);
  });
}

function renderFuncoes() {
  renderListaLab($('#listaFuncoes'), FUNCOES, funcaoAtual, estado.funcoes, (id) => { funcaoAtual = id; renderFuncoes(); });
  const d = FUNCOES.find((f) => f.id === funcaoAtual);
  const area = $('#areaFuncao');
  area.innerHTML = `
    <div class="cartao">
      <div class="questao__meta"><span class="questao__cat">function ${d.nome}()</span><span class="selo selo--pend">${d.testes.length} testes</span></div>
      <h3>${d.titulo}</h3>
      <div class="lab__enunciado">${d.enunciado}</div>
      <textarea data-codigo spellcheck="false" aria-label="Editor de código"></textarea>
      <div class="acoes-linha">
        <button type="button" class="btn btn--mini btn--primario" id="btnRodarFn">▶ Rodar testes</button>
        <button type="button" class="btn btn--mini btn--fantasma" id="btnResetFn">Restaurar código inicial</button>
      </div>
      <details class="dica"><summary>Preciso de uma dica</summary><p>${d.dica}</p></details>
      <div id="resultadoFn"></div>
    </div>`;
  const ta = $('textarea', area);
  ta.value = estado.codigos[d.id] ?? d.starter;
  ta.addEventListener('input', () => { estado.codigos[d.id] = ta.value; salvar(); });
  $('#btnResetFn').addEventListener('click', () => {
    ta.value = d.starter;
    delete estado.codigos[d.id];
    salvar();
  });
  $('#btnRodarFn').addEventListener('click', () => rodarTestesFuncao(d, ta.value));
}

function rodarTestesFuncao(d, codigo) {
  const out = $('#resultadoFn');
  let fn;
  try {
    fn = new Function(`${codigo}\n;return (typeof ${d.nome} === 'function') ? ${d.nome} : undefined;`)();
  } catch (e) {
    out.innerHTML = `<p class="resumo-testes falha">Erro no código: ${esc(e.name + ': ' + e.message)}</p>`;
    return;
  }
  if (!fn) {
    out.innerHTML = `<p class="resumo-testes falha">Não encontrei a função <code>${d.nome}</code>. Confira o nome — maiúsculas e minúsculas importam!</p>`;
    return;
  }
  const resultados = d.testes.map(([args, esperado]) => {
    let obtido, erro = null;
    try { obtido = fn(...clonar(args)); } catch (e) { erro = e.message; }
    return { args, esperado, obtido, erro, ok: !erro && iguais(obtido, esperado) };
  });
  const passou = resultados.filter((r) => r.ok).length;
  const tudo = passou === resultados.length;
  if (tudo) { estado.funcoes[d.id] = true; salvar(); renderListaLab($('#listaFuncoes'), FUNCOES, funcaoAtual, estado.funcoes, (id) => { funcaoAtual = id; renderFuncoes(); }); }

  out.innerHTML = `
    <ul class="testes">
      ${resultados.map((r) => `
        <li class="${r.ok ? 'ok' : 'falha'}">
          ${r.ok ? '✔' : '✘'} ${d.nome}(${r.args.map(mostrarValor).map(esc).join(', ')})
          <small>esperado: ${esc(mostrarValor(r.esperado))} · obtido: ${r.erro ? 'ERRO — ' + esc(r.erro) : esc(mostrarValor(r.obtido))}</small>
        </li>`).join('')}
    </ul>
    <p class="resumo-testes ${tudo ? 'ok' : 'falha'}">${passou}/${resultados.length} testes passaram${tudo ? ' — mandou bem! 🚲' : ''}</p>
    ${resultados.some((r) => !r.erro && r.obtido === undefined) ? '<p class="lab__enunciado">⚠ Sua função retornou <code>undefined</code>. Esqueceu o <code>return</code>?</p>' : ''}`;
}

/* =========================================================
   LAB DE DOM
   ========================================================= */
let domAtual = DOM_DESAFIOS[0].id;

function montarDocumento(d, codigo) {
  const seguro = codigo.replace(/<\/script/gi, '<\\/script');
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>body{font-family:system-ui,sans-serif;padding:14px;color:#111;line-height:1.5}button{cursor:pointer;padding:.35rem .7rem}input,select{padding:.3rem;margin:.2rem}${d.css || ''}</style>
<script>window.__erros=[];window.addEventListener('error',function(e){window.__erros.push(e.message);});<\/script>
</head><body>
${d.html}
<script>${seguro}<\/script>
</body></html>`;
}

function renderDom() {
  renderListaLab($('#listaDom'), DOM_DESAFIOS, domAtual, estado.dom, (id) => { domAtual = id; renderDom(); });
  const d = DOM_DESAFIOS.find((x) => x.id === domAtual);
  const chave = 'dom_' + d.id;
  const area = $('#areaDom');
  area.innerHTML = `
    <div class="cartao">
      <div class="questao__meta"><span class="questao__cat">DOM · ${d.nivel}</span></div>
      <h3>${d.titulo}</h3>
      <div class="lab__enunciado">${d.enunciado}</div>
      <div class="lab__duplo">
        <div>
          <span class="rotulo">HTML (já está na página)</span>
          <pre class="codigo"><code>${realcar(d.html, 'html')}</code></pre>
          <span class="rotulo">Seu JavaScript</span>
          <textarea data-codigo spellcheck="false" aria-label="Seu JavaScript"></textarea>
        </div>
        <div>
          <span class="rotulo">Prévia ao vivo (interaja!)</span>
          <iframe class="preview" title="Prévia do desafio"></iframe>
          <iframe class="preview-teste" title="Verificação" hidden></iframe>
        </div>
      </div>
      <div class="acoes-linha">
        <button type="button" class="btn btn--mini btn--primario" id="btnRodarDom">▶ Executar e verificar</button>
        <button type="button" class="btn btn--mini btn--fantasma" id="btnResetDom">Restaurar código inicial</button>
      </div>
      <div id="resultadoDom"></div>
    </div>`;
  const ta = $('textarea', area);
  ta.value = estado.codigos[chave] ?? d.starter;
  ta.addEventListener('input', () => { estado.codigos[chave] = ta.value; salvar(); });
  $('#btnResetDom').addEventListener('click', () => { ta.value = d.starter; delete estado.codigos[chave]; salvar(); });
  $('#btnRodarDom').addEventListener('click', () => rodarDom(d, ta.value));
  $('.preview', area).srcdoc = montarDocumento(d, ''); // prévia do HTML puro
}

function rodarDom(d, codigo) {
  const out = $('#resultadoDom');
  const preview = $('#areaDom .preview');
  const teste = $('#areaDom .preview-teste');
  const doc = montarDocumento(d, codigo);
  out.innerHTML = '<p class="lab__enunciado">Verificando…</p>';

  preview.srcdoc = doc; // prévia limpa para o aluno brincar

  teste.onload = () => {
    let resultados;
    try {
      resultados = d.verificar(teste.contentDocument);
    } catch (e) {
      resultados = [{ ok: false, msg: 'O verificador quebrou: ' + e.message }];
    }
    // erros do script do aluno (inclusive os que aparecem durante os cliques do verificador)
    const erros = (teste.contentWindow && teste.contentWindow.__erros) ? teste.contentWindow.__erros.slice() : [];
    const passou = resultados.filter((r) => r.ok).length;
    const tudo = passou === resultados.length && erros.length === 0;
    if (tudo) { estado.dom[d.id] = true; salvar(); renderListaLab($('#listaDom'), DOM_DESAFIOS, domAtual, estado.dom, (id) => { domAtual = id; renderDom(); }); }
    out.innerHTML = `
      ${erros.length ? `<div class="console"><span class="err">${erros.map(esc).join('\n')}</span></div>` : ''}
      <ul class="testes">${resultados.map((r) => `<li class="${r.ok ? 'ok' : 'falha'}">${r.ok ? '✔' : '✘'} ${esc(r.msg)}</li>`).join('')}</ul>
      <p class="resumo-testes ${tudo ? 'ok' : 'falha'}">${passou}/${resultados.length} verificações${erros.length ? ' · há erros no console' : ''}${tudo ? ' — DOM dominado! 🎯' : ''}</p>`;
  };
  teste.srcdoc = doc;
}

/* =========================================================
   PROGRESSO + RELATÓRIO
   ========================================================= */
function calcularProgresso() {
  const totalMissoes = MISSOES.reduce((s, m) => s + m.itens.length, 0);
  return [
    { nome: 'Missões do projeto', feito: Object.values(estado.missoes).filter(Boolean).length, total: totalMissoes },
    { nome: 'Quiz (acertos)', feito: Object.values(estado.quiz).filter((r) => r.acerto).length, total: QUIZ.length },
    { nome: 'Qual a saída?', feito: Object.values(estado.saidas).filter(Boolean).length, total: SAIDAS.length },
    { nome: 'Lab de Functions', feito: FUNCOES.filter((f) => estado.funcoes[f.id]).length, total: FUNCOES.length },
    { nome: 'Lab de DOM', feito: DOM_DESAFIOS.filter((d) => estado.dom[d.id]).length, total: DOM_DESAFIOS.length },
    { nome: 'Labs 3D', feito: LABS3D.filter((l) => estado.lab3d[l.id] && estado.lab3d[l.id].ok).length, total: LABS3D.length }
  ];
}

function atualizarProgresso() {
  const itens = calcularProgresso();
  const geral = Math.round(itens.reduce((s, i) => s + i.feito / i.total, 0) / itens.length * 100);
  $('#barraGlobal').style.width = geral + '%';
  $('#medidores').innerHTML = itens.map((i) => `
    <div class="medidor">
      <div class="medidor__topo"><span>${i.nome}</span><b>${i.feito}/${i.total}</b></div>
      <div class="mini-barra"><span style="width:${(i.feito / i.total) * 100}%"></span></div>
    </div>`).join('') + `
    <div class="medidor medidor--total">
      <div class="medidor__topo"><span><strong>Progresso geral</strong></span><b>${geral}%</b></div>
      <div class="mini-barra"><span style="width:${geral}%"></span></div>
    </div>`;
  return geral;
}

function preencherAluno() {
  $('#alunoNome').value = estado.aluno.nome || '';
  $('#alunoTurma').value = estado.aluno.turma || '';
  $('#alunoLink').value = estado.aluno.link || '';
}

$('#formAluno').addEventListener('submit', (e) => {
  e.preventDefault();
  estado.aluno = { nome: $('#alunoNome').value.trim(), turma: $('#alunoTurma').value.trim(), link: $('#alunoLink').value.trim() };
  if (!estado.aluno.nome) { toast('Preencha seu nome'); $('#alunoNome').focus(); return; }
  salvar();
  const geral = atualizarProgresso();
  const itens = calcularProgresso();
  const texto = [
    'REVISÃO DE SEMESTRE · DESENVOLVIMENTO DE SISTEMAS',
    'Escola SENAI Morvan Figueiredo · Prof. Johnny Braga de Oliveira',
    '-----------------------------------------------------------',
    'Aluno(a): ' + estado.aluno.nome,
    'Turma: ' + (estado.aluno.turma || '—'),
    'GitHub Pages: ' + (estado.aluno.link || '—'),
    'Gerado em: ' + new Date().toLocaleString('pt-BR'),
    '',
    ...itens.map((i) => `${i.nome.padEnd(22, '.')} ${i.feito}/${i.total}`),
    '',
    'Functions aprovadas: ' + (FUNCOES.filter((f) => estado.funcoes[f.id]).map((f) => f.nome).join(', ') || '—'),
    'Desafios DOM aprovados: ' + (DOM_DESAFIOS.filter((d) => estado.dom[d.id]).map((d) => d.titulo).join(', ') || '—'),
    '',
    'LABS 3D · SAÍDAS REGISTRADAS',
    ...LABS3D.map((l) => {
      const r = estado.lab3d[l.id];
      if (!r || !r.saida) return `[ ] ${l.titulo}: não executado`;
      return `[${r.ok ? 'x' : ' '}] ${l.titulo} · previsão ${r.acertosPrevisao || 0}/${l.esperado.length} · tentativas ${r.tentativas}\n      saída: ${r.erro ? 'ERRO ' + r.erro : r.saida.join(' | ')}`;
    }),
    '',
    'PROGRESSO GERAL: ' + geral + '%'
  ].join('\n');
  $('#relatorioTexto').textContent = texto;
  $('#relatorio').hidden = false;
  $('#relatorio').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#btnCopiarRelatorio').addEventListener('click', () => copiar($('#relatorioTexto').textContent, 'Relatório copiado!'));
$('#btnZerar').addEventListener('click', () => {
  if (!confirm('Isso apaga TODO o seu progresso (missões, quiz, códigos). Continuar?')) return;
  const tema = estado.tema;
  estado = padrao();
  estado.tema = tema;
  salvar();
  iniciar();
  toast('Progresso zerado');
});

/* ---------- Menu ativo conforme a rolagem ---------- */
function observarSecoes() {
  if (!('IntersectionObserver' in window)) return;
  const links = $$('.menu a');
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((a) => a.classList.toggle('ativo', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => obs.observe(s));
}

/* ---------- Início ---------- */
function iniciar() {
  aplicarTema();
  $('#heroCode').innerHTML = realcar($('#heroCode').textContent);
  $('#statQuiz').textContent = QUIZ.length;
  $('#statSaidas').textContent = SAIDAS.length;
  $('#statFuncoes').textContent = FUNCOES.length;
  $('#statDom').textContent = DOM_DESAFIOS.length;
  $('#stat3d').textContent = LABS3D.length;
  renderMissoes();
  renderStarter();
  renderFiltros();
  renderQuiz();
  renderSaidas();
  renderFuncoes();
  renderDom();
  preencherAluno();
  if (window.renderLab3d) window.renderLab3d();
  $('#relatorio').hidden = true;
  atualizarProgresso();
}

iniciar();
observarSecoes();
