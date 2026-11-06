/* =========================================================
   DADOS DA ATIVIDADE
   Edite este arquivo para adicionar/alterar questões e desafios.
   Prof. Johnny Braga de Oliveira · SENAI Morvan Figueiredo
   ========================================================= */

// junta linhas de código (evita problemas com crases e ${} dentro de strings)
const L = (...linhas) => linhas.join('\n');

/* ---------------------------------------------------------
   MISSÕES (checklist da entrega)
--------------------------------------------------------- */
const MISSOES = [
  {
    id: 'html', titulo: 'Missão 1 · Estrutura HTML', nivel: 'HTML',
    descricao: 'Monte o esqueleto semântico da landing page da EcoBike SP.',
    itens: [
      ['h1', '<code>header</code> com logo/nome e <code>nav</code> com links âncora (#planos, #simulador, #reservas)'],
      ['h2', 'Seção hero com <code>h1</code>, texto de apresentação e botão de chamada'],
      ['h3', 'Seção <code>#planos</code> com 3 <code>article</code> (Urbana, Elétrica, Cargo) e o preço por hora'],
      ['h4', 'Seção <code>#simulador</code>: <code>input type="number"</code> para horas, <code>select</code> para tipo e botão “Calcular”'],
      ['h5', 'Seção <code>#reservas</code>: input de nome, botão “Adicionar”, <code>ul</code> vazia e contador'],
      ['h6', '<code>footer</code> com contato e todos os inputs com <code>label for</code>']
    ]
  },
  {
    id: 'css', titulo: 'Missão 2 · CSS moderno', nivel: 'CSS',
    descricao: 'Deixe a página com cara de startup — e funcionando no celular.',
    itens: [
      ['c1', 'Cores e fontes em variáveis no <code>:root</code> (ex.: <code>--cor-primaria</code>)'],
      ['c2', 'Menu alinhado com <code>display: flex</code>'],
      ['c3', 'Cards de planos com <code>display: grid</code> e <code>repeat(3, 1fr)</code>'],
      ['c4', 'Efeito <code>:hover</code> com <code>transition</code> nos cards e botões'],
      ['c5', '<code>@media (max-width: 768px)</code> empilhando os cards em 1 coluna'],
      ['c6', 'Classe <code>.dark</code> no <code>body</code> que troca as variáveis de cor']
    ]
  },
  {
    id: 'js', titulo: 'Missão 3 · Functions + DOM', nivel: 'JavaScript',
    descricao: 'Dê vida à página com funções pequenas e eventos.',
    itens: [
      ['j1', '<code>calcularValor(horas, tipo)</code> com <code>return</code> e desconto de 10% acima de 5h'],
      ['j2', '<code>formatarMoeda(valor)</code> retornando <code>"R$ 64,80"</code>'],
      ['j3', '<code>mostrarResultado()</code> lê os inputs, valida e escreve em <code>#resultado</code>'],
      ['j4', '<code>adicionarReserva()</code> cria <code>li</code> com <code>createElement</code> + botão remover'],
      ['j5', '<code>atualizarContador()</code> mostra o total de reservas'],
      ['j6', '<code>alternarTema()</code> com <code>classList.toggle("dark")</code>']
    ]
  }
];

/* ---------------------------------------------------------
   CÓDIGO BASE (starter) — o aluno baixa e completa
--------------------------------------------------------- */
const STARTER = {
  'index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EcoBike SP · Aluguel de bikes por hora</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <!-- TODO 1: header com o nome/logo e um nav com links para #planos, #simulador e #reservas -->
  <header>
    <a href="#" class="logo">EcoBike SP</a>
    <nav>
      <!-- seus links aqui -->
    </nav>
    <button id="btnTema" type="button">🌙 Modo escuro</button>
  </header>

  <main>
    <!-- TODO 2: seção hero com h1, parágrafo e botão "Simular agora" -->
    <section class="hero">

    </section>

    <!-- TODO 3: três article.card (Urbana R$ 12/h, Elétrica R$ 20/h, Cargo R$ 25/h) -->
    <section id="planos">
      <h2>Nossos planos</h2>
      <div class="cards">

      </div>
    </section>

    <!-- Simulador: NÃO mude os ids, o JavaScript depende deles -->
    <section id="simulador">
      <h2>Simule o seu passeio</h2>
      <label for="horas">Quantas horas?</label>
      <input type="number" id="horas" min="1" max="24">

      <label for="tipo">Tipo de bike</label>
      <select id="tipo">
        <option value="urbana">Urbana</option>
        <option value="eletrica">Elétrica</option>
        <option value="cargo">Cargo</option>
      </select>

      <button id="calcular" type="button">Calcular</button>
      <p id="resultado"></p>
    </section>

    <!-- Reservas -->
    <section id="reservas">
      <h2>Pré-reserva</h2>
      <label for="nome">Seu nome</label>
      <input type="text" id="nome">
      <button id="adicionar" type="button">Adicionar</button>
      <p>Total de reservas: <span id="total">0</span></p>
      <ul id="lista"></ul>
    </section>
  </main>

  <!-- TODO 4: footer com contato -->
  <footer>

  </footer>

  <script src="script.js"></script>
</body>
</html>
`,
  'style.css': `/* ===== EcoBike SP · style.css ===== */

/* TODO 1: variáveis de cor e fonte */
:root {
  --cor-primaria: #16a34a;
  --cor-fundo: #ffffff;
  --cor-texto: #1f2937;
  --raio: 12px;
}

/* TODO 6: o modo escuro só troca as variáveis! */
body.dark {
  --cor-fundo: #0f172a;
  --cor-texto: #e2e8f0;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: var(--cor-fundo);
  color: var(--cor-texto);
  transition: background .3s, color .3s;
}

/* TODO 2: header e nav com flexbox (space-between, align-items) */
header {

}

/* TODO 3: cards em grid de 3 colunas */
.cards {

}

.card {
  border-radius: var(--raio);
  padding: 1.5rem;
  /* TODO 4: transition + :hover (ex.: translateY(-4px)) */
}

/* TODO 5: responsivo */
@media (max-width: 768px) {

}
`,
  'script.js': `// ===== EcoBike SP · script.js =====
// Regra: cada function faz UMA coisa. Teste no console (F12)!

// ---------- 1) Funções de regra de negócio (não mexem no DOM) ----------

// TODO: retornar o valor total do aluguel
// urbana = 12/h, eletrica = 20/h, cargo = 25/h
// acima de 5 horas: 10% de desconto
function calcularValor(horas, tipo) {

}

// TODO: 64.8 -> "R$ 64,80"   (dica: toFixed e replace)
function formatarMoeda(valor) {

}

// ---------- 2) Funções que mexem no DOM ----------

// selecionando os elementos UMA vez
const inputHoras = document.querySelector('#horas');
const selectTipo = document.querySelector('#tipo');
const btnCalcular = document.querySelector('#calcular');
const resultado = document.querySelector('#resultado');

const inputNome = document.querySelector('#nome');
const btnAdicionar = document.querySelector('#adicionar');
const lista = document.querySelector('#lista');
const total = document.querySelector('#total');

const btnTema = document.querySelector('#btnTema');

function mostrarResultado() {
  const horas = Number(inputHoras.value);
  const tipo = selectTipo.value;

  // TODO: se horas for inválida (<= 0 ou NaN), escrever
  // "Informe um número de horas válido" e parar (return)

  // TODO: calcular, formatar e escrever em resultado.textContent
}

function atualizarContador() {
  // TODO: total.textContent = quantidade de <li> dentro da lista
}

function adicionarReserva() {
  const nome = inputNome.value.trim();
  if (nome === '') return;

  // TODO: criar <li> com o nome
  // TODO: criar <button>Remover</button> que remove o li e atualiza o contador
  // TODO: colocar o li dentro da lista, limpar o input e atualizar o contador
}

function alternarTema() {
  // TODO: classList.toggle no body
}

// ---------- 3) Eventos ----------
btnCalcular.addEventListener('click', mostrarResultado);
btnAdicionar.addEventListener('click', adicionarReserva);
btnTema.addEventListener('click', alternarTema);
`
};

/* ---------------------------------------------------------
   QUIZ CONCEITUAL
   ans = índice da opção correta (0, 1, 2, 3)
--------------------------------------------------------- */
const QUIZ = [
  // ----- HTML -----
  { id: 'q1', cat: 'HTML', q: 'Qual tag semântica deve envolver o menu principal de links da página?',
    opts: ['<code>&lt;div class="menu"&gt;</code>', '<code>&lt;nav&gt;</code>', '<code>&lt;menu-bar&gt;</code>', '<code>&lt;section&gt;</code>'], ans: 1,
    exp: '<code>&lt;nav&gt;</code> indica um bloco de navegação. Leitores de tela e buscadores entendem esse significado; uma <code>div</code> não diz nada.' },
  { id: 'q2', cat: 'HTML', q: 'Para que serve o atributo <code>alt</code> em uma imagem?',
    opts: ['Define o tamanho alternativo da imagem', 'É o título que aparece ao passar o mouse', 'Descreve a imagem para leitores de tela e aparece se ela não carregar', 'Troca a imagem no modo escuro'], ans: 2,
    exp: 'O <code>alt</code> é o texto alternativo: essencial para acessibilidade e exibido quando a imagem falha.' },
  { id: 'q3', cat: 'HTML', q: 'Como ligar corretamente um <code>label</code> a um <code>input</code>?',
    code: '<label ____="horas">Horas</label>\n<input type="number" id="horas">', lang: 'html',
    opts: ['<code>name</code>', '<code>for</code>', '<code>id</code>', '<code>href</code>'], ans: 1,
    exp: 'O atributo <code>for</code> do label recebe o <code>id</code> do input. Clicar no texto passa a focar o campo.' },
  { id: 'q4', cat: 'HTML', q: 'Qual a diferença entre <code>id</code> e <code>class</code>?',
    opts: ['Não há diferença', '<code>id</code> deve ser único na página; <code>class</code> pode se repetir', '<code>class</code> é só para CSS e <code>id</code> só para JS', '<code>id</code> pode se repetir; <code>class</code> não'], ans: 1,
    exp: 'Um <code>id</code> identifica um único elemento (ótimo para <code>getElementById</code>). Classes agrupam vários elementos.' },
  { id: 'q5', cat: 'HTML', q: 'Onde é recomendado carregar o <code>&lt;script src="script.js"&gt;</code> para que o JS encontre os elementos do HTML?',
    opts: ['No início do <code>&lt;head&gt;</code>, sem atributos', 'No final do <code>&lt;body&gt;</code> (ou no head com <code>defer</code>)', 'Dentro do <code>&lt;title&gt;</code>', 'Tanto faz, o navegador espera sempre'], ans: 1,
    exp: 'O HTML é lido de cima para baixo. Se o script roda antes dos elementos existirem, <code>querySelector</code> retorna <code>null</code>.' },
  { id: 'q6', cat: 'HTML', q: 'Qual <code>type</code> de input é mais adequado para o campo “quantidade de horas”?',
    opts: ['<code>text</code>', '<code>number</code>', '<code>range</code> obrigatoriamente', '<code>hours</code>'], ans: 1,
    exp: '<code>type="number"</code> abre o teclado numérico no celular e aceita <code>min</code>/<code>max</code>. Mas atenção: o <code>.value</code> continua sendo string!' },
  { id: 'q7', cat: 'HTML', q: 'Qual estrutura representa melhor um card de plano, que faz sentido sozinho?',
    opts: ['<code>&lt;article&gt;</code>', '<code>&lt;aside&gt;</code>', '<code>&lt;span&gt;</code>', '<code>&lt;br&gt;</code>'], ans: 0,
    exp: '<code>&lt;article&gt;</code> é um conteúdo independente e reutilizável — como um card de produto ou post.' },

  // ----- CSS -----
  { id: 'q8', cat: 'CSS', q: 'Como declarar e usar uma variável CSS?',
    opts: ['<code>$cor: red;</code> e <code>color: $cor;</code>', '<code>:root { --cor: red; }</code> e <code>color: var(--cor);</code>', '<code>let cor = red;</code> no CSS', '<code>@cor = red</code> e <code>color: @cor;</code>'], ans: 1,
    exp: 'Custom properties começam com <code>--</code> e são lidas com <code>var()</code>. Declarar no <code>:root</code> deixa disponível para a página toda.' },
  { id: 'q9', cat: 'CSS', q: 'Em um container com <code>display: flex</code>, o que faz <code>justify-content: space-between</code>?',
    opts: ['Alinha os itens no eixo vertical', 'Distribui os itens no eixo principal, com o espaço sobrando entre eles', 'Quebra os itens em várias linhas', 'Cria um espaço fixo de 10px'], ans: 1,
    exp: 'É o clássico do header: logo na ponta esquerda, menu na ponta direita.' },
  { id: 'q10', cat: 'CSS', q: 'O que <code>grid-template-columns: repeat(3, 1fr)</code> cria?',
    opts: ['3 linhas de mesma altura', '3 colunas de mesma largura', '1 coluna com 3 frações de padding', 'Um grid de 3 pixels'], ans: 1,
    exp: '<code>1fr</code> é uma fração do espaço livre. Três <code>1fr</code> = três colunas iguais — perfeito para os 3 planos.' },
  { id: 'q11', cat: 'CSS', q: 'Qual cor o título terá?', lang: 'html',
    code: '<h1 id="titulo" class="titulo">EcoBike</h1>\n\n<style>\n  h1       { color: green; }\n  .titulo  { color: blue; }\n  #titulo  { color: red; }\n</style>',
    opts: ['green', 'blue', 'red', 'A última regra do arquivo, seja ela qual for'], ans: 2,
    exp: 'Especificidade: id (1,0,0) vence classe (0,1,0), que vence tag (0,0,1). A ordem só desempata quando a especificidade é igual.' },
  { id: 'q12', cat: 'CSS', q: 'Quando as regras de <code>@media (max-width: 768px) { ... }</code> são aplicadas?',
    opts: ['Quando a tela tem mais de 768px', 'Quando a tela tem até 768px de largura', 'Apenas em impressoras', 'Sempre, mas com prioridade menor'], ans: 1,
    exp: '<code>max-width: 768px</code> = “até 768px”. É assim que se adapta o layout para tablets e celulares.' },
  { id: 'q13', cat: 'CSS', q: 'O que muda com <code>box-sizing: border-box</code>?',
    opts: ['A borda fica arredondada', 'O <code>width</code> passa a incluir padding e borda', 'Os elementos viram flex', 'A caixa ganha sombra'], ans: 1,
    exp: 'Sem ele, <code>width: 300px</code> + <code>padding: 20px</code> = 340px na tela. Com ele, fica 300px mesmo.' },
  { id: 'q14', cat: 'CSS', q: 'Qual regra faz o card subir suavemente quando o mouse passa por cima?',
    code: '.card { transition: transform .3s; }\n/* ??? */', lang: 'css',
    opts: ['<code>.card:hover { transform: translateY(-6px); }</code>', '<code>.card:click { top: -6px; }</code>', '<code>.card.hover { margin: -6px; }</code>', '<code>.card { hover: up; }</code>'], ans: 0,
    exp: 'A pseudo-classe <code>:hover</code> ativa o estado e o <code>transition</code> no estado normal anima a mudança.' },
  { id: 'q15', cat: 'CSS', q: 'Qual é a forma mais limpa de implementar o modo escuro?',
    opts: ['Reescrever todas as regras com <code>!important</code>', 'Uma classe <code>.dark</code> no <code>body</code> que redefine as variáveis de cor', 'Criar um segundo arquivo HTML', 'Usar <code>style=""</code> em cada elemento'], ans: 1,
    exp: 'Se todas as cores vêm de variáveis, basta redefini-las em <code>body.dark</code>. O JS só precisa fazer <code>classList.toggle("dark")</code>.' },

  // ----- JavaScript -----
  { id: 'q16', cat: 'JavaScript', q: 'O que uma function retorna quando não tem <code>return</code>?',
    opts: ['<code>0</code>', '<code>null</code>', '<code>undefined</code>', 'Um erro'], ans: 2,
    exp: 'Toda função retorna algo. Sem <code>return</code> (ou com <code>return;</code> vazio), o retorno é <code>undefined</code>.' },
  { id: 'q17', cat: 'JavaScript', q: 'Em <code>function calcularValor(horas, tipo)</code> e na chamada <code>calcularValor(3, "cargo")</code>, o que são <code>horas</code> e <code>3</code>?',
    opts: ['Os dois são argumentos', '<code>horas</code> é parâmetro; <code>3</code> é argumento', '<code>horas</code> é argumento; <code>3</code> é parâmetro', 'Os dois são variáveis globais'], ans: 1,
    exp: 'Parâmetro é o “nome da caixa” na declaração; argumento é o valor que você coloca nela ao chamar.' },
  { id: 'q18', cat: 'JavaScript', q: 'Qual arrow function é equivalente a <code>function dobro(n) { return n * 2; }</code>?',
    opts: ['<code>const dobro = n => n * 2;</code>', '<code>const dobro = (n) => { n * 2 };</code>', '<code>dobro => (n * 2);</code>', '<code>const dobro = n -> n * 2;</code>'], ans: 0,
    exp: 'Com corpo de uma expressão só, o retorno é implícito. A opção com <code>{ }</code> sem <code>return</code> retorna <code>undefined</code>!' },
  { id: 'q19', cat: 'JavaScript', q: 'Qual o resultado de <code>"5" + 3</code> e de <code>"5" * 3</code>?',
    opts: ['<code>8</code> e <code>15</code>', '<code>"53"</code> e <code>15</code>', '<code>"53"</code> e <code>"555"</code>', 'Erro e <code>15</code>'], ans: 1,
    exp: 'O <code>+</code> com string concatena. O <code>*</code> converte para número. Por isso usamos <code>Number(input.value)</code>.' },
  { id: 'q20', cat: 'JavaScript', q: 'Por que fazemos <code>Number(inputHoras.value)</code>?',
    opts: ['Porque <code>.value</code> sempre retorna uma string', 'Para arredondar o valor', 'Porque inputs number já retornam número, é só costume', 'Para converter em moeda'], ans: 0,
    exp: 'Mesmo em <code>type="number"</code>, <code>.value</code> é string. <code>"3" + 2</code> daria <code>"32"</code>.' },
  { id: 'q21', cat: 'JavaScript', q: 'Qual a diferença entre <code>==</code> e <code>===</code>?',
    opts: ['Nenhuma', '<code>===</code> compara valor e tipo; <code>==</code> converte os tipos antes', '<code>==</code> é atribuição', '<code>===</code> só funciona com números'], ans: 1,
    exp: '<code>5 == "5"</code> é <code>true</code>, <code>5 === "5"</code> é <code>false</code>. Prefira sempre <code>===</code>.' },
  { id: 'q22', cat: 'JavaScript', q: 'Qual a diferença entre <code>const</code> e <code>let</code>?',
    opts: ['<code>const</code> não pode ser reatribuída; <code>let</code> pode', '<code>let</code> é global e <code>const</code> é local', '<code>const</code> só guarda números', 'São iguais, só muda o estilo'], ans: 0,
    exp: 'Use <code>const</code> por padrão (elementos do DOM, funções) e <code>let</code> quando o valor muda (ex.: <code>total</code> que recebe desconto).' },
  { id: 'q23', cat: 'JavaScript', q: 'O que <code>(64.8).toFixed(2)</code> retorna?',
    opts: ['O número <code>64.80</code>', 'A string <code>"64.80"</code>', 'A string <code>"R$ 64,80"</code>', '<code>65</code>'], ans: 1,
    exp: '<code>toFixed</code> retorna <b>string</b> com casas decimais fixas. Para trocar ponto por vírgula: <code>.replace(".", ",")</code>.' },
  { id: 'q24', cat: 'JavaScript', q: 'Qual a forma correta de registrar a função no evento?',
    code: 'function mostrarResultado() { /* ... */ }', lang: 'js',
    opts: ['<code>btn.addEventListener("click", mostrarResultado());</code>', '<code>btn.addEventListener("click", mostrarResultado);</code>', '<code>btn.addEventListener(click, "mostrarResultado");</code>', '<code>btn.onClick = mostrarResultado();</code>'], ans: 1,
    exp: 'Passamos a <b>referência</b> da função (callback), sem parênteses. Com <code>()</code> ela executaria na hora e passaria o retorno (<code>undefined</code>).' },
  { id: 'q25', cat: 'JavaScript', q: 'Qual método retorna um <b>novo array</b> só com os itens que passam no teste?',
    opts: ['<code>map</code>', '<code>filter</code>', '<code>forEach</code>', '<code>push</code>'], ans: 1,
    exp: '<code>filter</code> mantém os itens cuja callback retorna <code>true</code>. <code>map</code> transforma; <code>forEach</code> só percorre.' },

  // ----- DOM -----
  { id: 'q26', cat: 'DOM', q: 'O que <code>document.querySelector(".card")</code> retorna?',
    opts: ['Todos os elementos com a classe card', 'O primeiro elemento com a classe card (ou <code>null</code>)', 'Um array de strings', 'O CSS da classe card'], ans: 1,
    exp: 'Para todos, use <code>querySelectorAll</code>, que retorna uma <code>NodeList</code>.' },
  { id: 'q27', cat: 'DOM', q: 'Qual a diferença entre <code>textContent</code> e <code>innerHTML</code>?',
    opts: ['Nenhuma', '<code>textContent</code> trata tudo como texto; <code>innerHTML</code> interpreta tags HTML', '<code>innerHTML</code> é mais seguro', '<code>textContent</code> só lê, não altera'], ans: 1,
    exp: 'Para escrever dados digitados pelo usuário, prefira <code>textContent</code>: evita que alguém injete HTML/scripts.' },
  { id: 'q28', cat: 'DOM', q: 'Qual linha liga/desliga o modo escuro a cada clique?',
    opts: ['<code>document.body.classList.toggle("dark");</code>', '<code>document.body.class = "dark";</code>', '<code>document.body.style.dark = true;</code>', '<code>document.body.classList.add("dark");</code>'], ans: 0,
    exp: '<code>toggle</code> adiciona se não tem e remove se tem. <code>add</code> só liga — nunca desligaria.' },
  { id: 'q29', cat: 'DOM', q: 'Complete para adicionar um item na lista:', lang: 'js',
    code: 'const li = document.createElement("li");\nli.textContent = "Ana";\nlista.______(li);',
    opts: ['<code>appendChild</code>', '<code>createChild</code>', '<code>push</code>', '<code>innerText</code>'], ans: 0,
    exp: '<code>createElement</code> cria o nó na memória; ele só aparece na tela depois de <code>appendChild</code> (ou <code>append</code>).' },
  { id: 'q30', cat: 'DOM', q: 'Em um <code>form</code>, por que usamos <code>evento.preventDefault()</code> no <code>submit</code>?',
    opts: ['Para validar o e-mail automaticamente', 'Para impedir o recarregamento da página', 'Para limpar os inputs', 'Para enviar mais rápido'], ans: 1,
    exp: 'O comportamento padrão do submit é recarregar/enviar a página. Sem <code>preventDefault</code>, seu resultado some na hora.' },
  { id: 'q31', cat: 'DOM', q: 'Dentro do botão “Remover” de cada <code>li</code>, qual código remove só aquele item?', lang: 'js',
    code: 'btnRemover.addEventListener("click", function () {\n  // ???\n});',
    opts: ['<code>lista.remove();</code>', '<code>li.remove();</code>', '<code>document.body.innerHTML = "";</code>', '<code>btnRemover = null;</code>'], ans: 1,
    exp: 'A função lembra da variável <code>li</code> criada no mesmo escopo (closure). <code>lista.remove()</code> apagaria a lista inteira!' },
  { id: 'q32', cat: 'DOM', q: 'Como saber quantos itens existem na lista <code>#lista</code>?',
    opts: ['<code>lista.length</code>', '<code>lista.children.length</code>', '<code>lista.count()</code>', '<code>lista.textContent.length</code>'], ans: 1,
    exp: '<code>children</code> é a coleção de elementos filhos. Também funciona <code>lista.querySelectorAll("li").length</code>.' },
  { id: 'q33', cat: 'DOM', q: 'Como ler a opção escolhida em <code>&lt;select id="tipo"&gt;</code>?',
    opts: ['<code>document.querySelector("#tipo").value</code>', '<code>document.querySelector("#tipo").selected</code>', '<code>document.querySelector("#tipo").option</code>', '<code>document.querySelector("#tipo").text</code>'], ans: 0,
    exp: 'O <code>.value</code> do select é o <code>value</code> da option selecionada (ex.: <code>"eletrica"</code>).' },
  { id: 'q34', cat: 'DOM', q: 'Em um listener, o que é <code>evento.target</code>?',
    code: 'botao.addEventListener("click", function (evento) {\n  console.log(evento.target);\n});', lang: 'js',
    opts: ['O elemento que originou o evento', 'A página inteira', 'O próximo elemento da lista', 'O nome da função'], ans: 0,
    exp: '<code>target</code> é quem disparou o evento — útil quando um único listener cuida de vários botões.' },
  { id: 'q35', cat: 'DOM', q: 'O script mostra <code>Cannot read properties of null (reading \'addEventListener\')</code>. Causa mais provável?',
    opts: ['O navegador está desatualizado', 'O seletor não encontrou o elemento (id errado ou script rodou antes do HTML)', 'Faltou ponto e vírgula', 'O CSS não carregou'], ans: 1,
    exp: '<code>querySelector</code> retornou <code>null</code>. Confira o id/classe (com <code>#</code> ou <code>.</code>) e a posição do <code>&lt;script&gt;</code>.' }
];

/* ---------------------------------------------------------
   QUAL A SAÍDA? (cada console.log = uma linha)
--------------------------------------------------------- */
const SAIDAS = [
  { titulo: 'Soma com string', nivel: 'fácil',
    code: L(
      'function soma(a, b) {',
      '  return a + b;',
      '}',
      'console.log(soma(2, 3));',
      "console.log(soma('2', 3));"),
    esperado: '5\n23',
    dica: 'Com uma string envolvida, o + concatena.' },
  { titulo: 'Função sem return', nivel: 'fácil',
    code: L(
      'function saudar(nome) {',
      "  console.log('Olá, ' + nome);",
      '}',
      "const r = saudar('Ana');",
      'console.log(r);'),
    esperado: 'Olá, Ana\nundefined',
    dica: 'A função imprime, mas o que ela retorna?' },
  { titulo: 'Parâmetro padrão', nivel: 'fácil',
    code: L(
      'function preco(valor, desconto = 0) {',
      '  return valor - valor * desconto;',
      '}',
      'console.log(preco(100));',
      'console.log(preco(100, 0.1));'),
    esperado: '100\n90',
    dica: 'Quando o argumento não é enviado, o valor padrão entra no lugar.' },
  { titulo: 'Escopo de variáveis', nivel: 'médio',
    code: L(
      'let x = 10;',
      'function teste() {',
      '  let x = 20;',
      '  console.log(x);',
      '}',
      'teste();',
      'console.log(x);'),
    esperado: '20\n10',
    dica: 'O let dentro da função cria uma NOVA variável, só dela.' },
  { titulo: 'Chamando antes de declarar', nivel: 'médio',
    code: L(
      'console.log(dobro(4));',
      '',
      'function dobro(n) {',
      '  return n * 2;',
      '}'),
    esperado: '8',
    dica: 'Function declarations sofrem hoisting (são “içadas” para o topo).' },
  { titulo: 'O return interrompe', nivel: 'fácil',
    code: L(
      'function verificar(n) {',
      '  if (n > 10) {',
      "    return 'grande';",
      '  }',
      "  return 'pequeno';",
      "  console.log('fim');",
      '}',
      'console.log(verificar(15));',
      'console.log(verificar(3));'),
    esperado: 'grande\npequeno',
    dica: 'Depois do return, nada mais da função é executado.' },
  { titulo: 'Arrow + template string', nivel: 'fácil',
    code: L(
      'const formatar = (v) => `R$ ${v.toFixed(2)}`;',
      'console.log(formatar(12.5));',
      'console.log(formatar(7));'),
    esperado: 'R$ 12.50\nR$ 7.00',
    dica: 'toFixed usa PONTO como separador decimal.' },
  { titulo: 'Simulador EcoBike', nivel: 'médio',
    code: L(
      'const preco = { urbana: 12, eletrica: 20 };',
      '',
      'function calcular(horas, tipo) {',
      '  let total = horas * preco[tipo];',
      '  if (horas > 5) total = total * 0.9;',
      '  return total;',
      '}',
      "console.log(calcular(3, 'eletrica'));",
      "console.log(calcular(10, 'urbana'));",
      "console.log(calcular(5, 'urbana'));"),
    esperado: '60\n108\n60',
    dica: '5 NÃO é maior que 5.' },
  { titulo: 'Contando com for...of', nivel: 'médio',
    code: L(
      'function contar(lista) {',
      '  let c = 0;',
      '  for (const item of lista) {',
      '    if (item.length > 3) c++;',
      '  }',
      '  return c;',
      '}',
      "console.log(contar(['bike', 'rua', 'pedal', 'sol']));"),
    esperado: '2',
    dica: 'Conte as letras de cada palavra.' },
  { titulo: 'Closure: o contador', nivel: 'difícil',
    code: L(
      'function criarContador() {',
      '  let n = 0;',
      '  return function () {',
      '    n++;',
      '    return n;',
      '  };',
      '}',
      'const c1 = criarContador();',
      'c1();',
      'c1();',
      'console.log(c1());',
      '',
      'const c2 = criarContador();',
      'console.log(c2());'),
    esperado: '3\n1',
    dica: 'Cada chamada de criarContador cria um n novo e independente.' },
  { titulo: 'typeof', nivel: 'fácil',
    code: L(
      'console.log(typeof 42);',
      "console.log(typeof '42');",
      'console.log(typeof function () {});',
      'console.log(typeof undefined);'),
    esperado: 'number\nstring\nfunction\nundefined',
    dica: 'Funções têm um typeof só delas.' },
  { titulo: '== ou ===?', nivel: 'médio',
    code: L(
      "console.log(5 == '5');",
      "console.log(5 === '5');",
      'console.log(null == undefined);'),
    esperado: 'true\nfalse\ntrue',
    dica: '== converte os tipos antes de comparar.' },
  { titulo: 'map com desconto', nivel: 'médio',
    code: L(
      'const precos = [10, 20, 30];',
      'const comDesconto = precos.map(p => p * 0.9);',
      "console.log(comDesconto.join(' | '));",
      'console.log(precos[0]);'),
    esperado: '9 | 18 | 27\n10',
    dica: 'map cria um array NOVO; o original não muda.' },
  { titulo: 'filter de bikes livres', nivel: 'médio',
    code: L(
      'const bikes = [',
      "  { nome: 'Urbana', livre: true },",
      "  { nome: 'Cargo', livre: false },",
      "  { nome: 'Elétrica', livre: true }",
      '];',
      'const livres = bikes.filter(b => b.livre);',
      'console.log(livres.length);',
      'console.log(livres[1].nome);'),
    esperado: '2\nElétrica',
    dica: 'Depois do filter, os índices do novo array começam em 0.' },
  { titulo: 'Callback: ordem de execução', nivel: 'médio',
    code: L(
      'function executar(acao) {',
      "  console.log('antes');",
      '  acao();',
      "  console.log('depois');",
      '}',
      "executar(() => console.log('durante'));"),
    esperado: 'antes\ndurante\ndepois',
    dica: 'A função recebida só roda quando é chamada com ().' },
  { titulo: 'Métodos de string', nivel: 'fácil',
    code: L(
      "const nome = '  ecobike sp  ';",
      'console.log(nome.trim().toUpperCase());',
      'console.log(nome.trim().length);'),
    esperado: 'ECOBIKE SP\n10',
    dica: 'O espaço do meio também conta como caractere.' },
  { titulo: 'Validando entrada', nivel: 'médio',
    code: L(
      "const horas = Number('três');",
      'console.log(horas);',
      "console.log(isNaN(horas) ? 'inválido' : 'ok');",
      "console.log(Number(''));"),
    esperado: 'NaN\ninválido\n0',
    dica: 'Cuidado: string vazia vira 0, não NaN! Por isso validamos horas <= 0.' },
  { titulo: 'Variável no loop', nivel: 'difícil',
    code: L(
      'let total = 0;',
      'function adicionar(valor) {',
      '  total = total + valor;',
      '  return total;',
      '}',
      'adicionar(10);',
      'adicionar(5);',
      'console.log(adicionar(1));',
      'console.log(total);'),
    esperado: '16\n16',
    dica: 'Aqui não há let dentro da função: ela altera a variável de fora.' }
];

/* ---------------------------------------------------------
   LAB DE FUNCTIONS (testes automáticos)
--------------------------------------------------------- */
const FUNCOES = [
  { id: 'f1', nome: 'dobro', titulo: 'Aquecimento: dobro', nivel: 'fácil',
    enunciado: '<p>Crie <code>dobro(n)</code> que <b>retorna</b> o dobro do número recebido.</p>',
    starter: 'function dobro(n) {\n  // seu código aqui\n}\n',
    testes: [[[2], 4], [[0], 0], [[-3], -6], [[2.5], 5]],
    dica: 'Não use console.log: use <code>return n * 2;</code>' },
  { id: 'f2', nome: 'formatarMoeda', titulo: 'formatarMoeda', nivel: 'fácil',
    enunciado: '<p>Receba um número e retorne uma string no formato brasileiro: <code>formatarMoeda(64.8)</code> → <code>"R$ 64,80"</code>.</p><p>Sempre com 2 casas e vírgula.</p>',
    starter: 'function formatarMoeda(valor) {\n  \n}\n',
    testes: [[[64.8], 'R$ 64,80'], [[60], 'R$ 60,00'], [[12.5], 'R$ 12,50'], [[0], 'R$ 0,00'], [[1234.5], 'R$ 1234,50']],
    dica: '<code>"R$ " + valor.toFixed(2).replace(".", ",")</code>' },
  { id: 'f3', nome: 'aplicarDesconto', titulo: 'aplicarDesconto', nivel: 'fácil',
    enunciado: '<p><code>aplicarDesconto(valor, percentual)</code> retorna o valor com o desconto aplicado. Ex.: <code>aplicarDesconto(200, 25)</code> → <code>150</code>.</p>',
    starter: 'function aplicarDesconto(valor, percentual) {\n  \n}\n',
    testes: [[[100, 10], 90], [[200, 25], 150], [[50, 0], 50], [[72, 10], 64.8]],
    dica: 'O desconto é <code>valor * percentual / 100</code>.' },
  { id: 'f4', nome: 'calcularValor', titulo: 'calcularValor (EcoBike)', nivel: 'médio',
    enunciado: '<p>Regra do cliente: Urbana <b>12</b>/h, Elétrica <b>20</b>/h, Cargo <b>25</b>/h. <b>Acima</b> de 5 horas, 10% de desconto.</p><p>O <code>tipo</code> chega como <code>"urbana"</code>, <code>"eletrica"</code> ou <code>"cargo"</code>.</p>',
    starter: 'function calcularValor(horas, tipo) {\n  \n}\n',
    testes: [[[3, 'eletrica'], 60], [[6, 'urbana'], 64.8], [[5, 'cargo'], 125], [[10, 'eletrica'], 180], [[1, 'cargo'], 25], [[2, 'urbana'], 24]],
    dica: 'Use um objeto: <code>const precos = { urbana: 12, eletrica: 20, cargo: 25 };</code> e acesse com <code>precos[tipo]</code>. Você pode reaproveitar <code>aplicarDesconto</code>!' },
  { id: 'f5', nome: 'validarHoras', titulo: 'validarHoras', nivel: 'médio',
    enunciado: '<p>O valor chega como <b>string</b> (vem do input). Retorne <code>true</code> se for um número entre 1 e 24 (inclusive) e <code>false</code> caso contrário.</p>',
    starter: 'function validarHoras(texto) {\n  \n}\n',
    testes: [[['3'], true], [['24'], true], [['0'], false], [[''], false], [['abc'], false], [['25'], false], [['-2'], false]],
    dica: 'Converta com <code>Number()</code>. Lembre que <code>Number("")</code> é 0 e <code>Number("abc")</code> é NaN.' },
  { id: 'f6', nome: 'classificarNota', titulo: 'classificarNota', nivel: 'fácil',
    enunciado: '<p>Retorne <code>"Aprovado"</code> para nota ≥ 7, <code>"Recuperação"</code> para nota ≥ 5 e <code>"Reprovado"</code> abaixo disso.</p>',
    starter: 'function classificarNota(nota) {\n  \n}\n',
    testes: [[[10], 'Aprovado'], [[7], 'Aprovado'], [[6.9], 'Recuperação'], [[5], 'Recuperação'], [[4.9], 'Reprovado'], [[0], 'Reprovado']],
    dica: 'Teste da maior faixa para a menor com <code>if / else if / else</code>.' },
  { id: 'f7', nome: 'gerarSaudacao', titulo: 'gerarSaudacao', nivel: 'médio',
    enunciado: '<p><code>gerarSaudacao(nome, hora)</code>: antes das 12h → <code>"Bom dia, Ana!"</code>; antes das 18h → <code>"Boa tarde, Ana!"</code>; senão → <code>"Boa noite, Ana!"</code>.</p>',
    starter: 'function gerarSaudacao(nome, hora) {\n  \n}\n',
    testes: [[['Ana', 8], 'Bom dia, Ana!'], [['Bruno', 12], 'Boa tarde, Bruno!'], [['Caio', 17], 'Boa tarde, Caio!'], [['Duda', 18], 'Boa noite, Duda!'], [['Eva', 0], 'Bom dia, Eva!']],
    dica: 'Template string: <code>`Bom dia, ${nome}!`</code>' },
  { id: 'f8', nome: 'maiorValor', titulo: 'maiorValor', nivel: 'médio',
    enunciado: '<p>Receba um array de números e retorne o maior. <b>Sem</b> usar <code>Math.max</code> — use um laço.</p>',
    starter: 'function maiorValor(lista) {\n  \n}\n',
    testes: [[[[3, 9, 2]], 9], [[[-5, -1, -9]], -1], [[[7]], 7], [[[1, 2, 3, 4, 50, 6]], 50]],
    dica: 'Comece com <code>let maior = lista[0];</code> e compare com cada item.' },
  { id: 'f9', nome: 'contarPalavras', titulo: 'contarPalavras', nivel: 'médio',
    enunciado: '<p>Retorne quantas palavras tem a frase. Espaços extras não contam como palavra; frase vazia retorna 0.</p>',
    starter: 'function contarPalavras(frase) {\n  \n}\n',
    testes: [[['Eu amo pedalar'], 3], [['  EcoBike   SP  '], 2], [[''], 0], [['SENAI'], 1]],
    dica: '<code>frase.trim().split(" ")</code> gera pedaços vazios com espaços duplos. Experimente <code>.filter(p => p !== "")</code>.' },
  { id: 'f10', nome: 'filtrarDisponiveis', titulo: 'filtrarDisponiveis', nivel: 'difícil',
    enunciado: '<p>Receba um array de objetos <code>{ nome, disponivel }</code> e retorne um array só com os <b>nomes</b> das bikes disponíveis.</p>',
    starter: 'function filtrarDisponiveis(bikes) {\n  \n}\n',
    testes: [
      [[[{ nome: 'Urbana', disponivel: true }, { nome: 'Cargo', disponivel: false }, { nome: 'Elétrica', disponivel: true }]], ['Urbana', 'Elétrica']],
      [[[{ nome: 'Cargo', disponivel: false }]], []],
      [[[]], []]
    ],
    dica: 'Encadeie: <code>bikes.filter(...).map(...)</code>.' }
];

/* ---------------------------------------------------------
   LAB DE DOM (o verificador roda dentro de um iframe)
   verificar(doc) deve retornar [{ ok: boolean, msg: string }]
--------------------------------------------------------- */
const DOM_DESAFIOS = [
  { id: 'd1', titulo: 'Trocar o texto', nivel: 'fácil',
    enunciado: '<p>Selecione o <code>h1#titulo</code> e troque o texto para <b>EcoBike SP</b>.</p>',
    html: '<h1 id="titulo">Título antigo</h1>\n<p>Aluguel de bikes por hora.</p>',
    starter: '// selecione o elemento e altere o textContent\n',
    verificar(doc) {
      const h1 = doc.getElementById('titulo');
      return [
        { ok: !!h1, msg: 'O h1#titulo ainda existe' },
        { ok: !!h1 && h1.textContent.trim() === 'EcoBike SP', msg: 'O texto do h1 é "EcoBike SP"' }
      ];
    } },
  { id: 'd2', titulo: 'Adicionar classe', nivel: 'fácil',
    enunciado: '<p>Adicione a classe <code>destaque</code> ao card <code>#plano-eletrica</code> <b>sem remover</b> a classe <code>card</code>.</p>',
    html: '<article id="plano-eletrica" class="card">\n  <h2>Elétrica</h2>\n  <p>R$ 20/h</p>\n</article>',
    css: '.card{border:2px solid #ccc;padding:1rem;border-radius:10px;font-family:sans-serif}.destaque{border-color:#16a34a;background:#dcfce7}',
    starter: '',
    verificar(doc) {
      const c = doc.getElementById('plano-eletrica');
      return [
        { ok: !!c && c.classList.contains('destaque'), msg: 'O card tem a classe destaque' },
        { ok: !!c && c.classList.contains('card'), msg: 'A classe card continua lá (use classList.add)' }
      ];
    } },
  { id: 'd3', titulo: 'Botão de curtir', nivel: 'fácil',
    enunciado: '<p>A cada clique no <code>#btnCurtir</code>, o número em <code>#curtidas</code> deve aumentar 1.</p>',
    html: '<button id="btnCurtir">👍 Curtir</button>\n<span id="curtidas">0</span>',
    starter: 'const btn = document.querySelector("#btnCurtir");\nconst span = document.querySelector("#curtidas");\nlet curtidas = 0;\n\n// crie uma função e registre no evento de clique\n',
    verificar(doc) {
      const b = doc.getElementById('btnCurtir'), s = doc.getElementById('curtidas');
      if (!b || !s) return [{ ok: false, msg: 'Os elementos #btnCurtir e #curtidas existem' }];
      const ini = Number(s.textContent);
      b.click(); b.click(); b.click();
      const fim = Number(s.textContent);
      return [
        { ok: ini === 0, msg: 'Começa em 0' },
        { ok: fim === ini + 3, msg: 'Após 3 cliques mostra ' + (ini + 3) + ' (mostrou ' + s.textContent + ')' }
      ];
    } },
  { id: 'd4', titulo: 'Lista a partir de array', nivel: 'médio',
    enunciado: '<p>Para cada item do array <code>bikes</code>, crie um <code>&lt;li&gt;</code> com <code>createElement</code> e adicione em <code>#lista</code>.</p>',
    html: '<h2>Modelos</h2>\n<ul id="lista"></ul>',
    starter: 'const bikes = ["Urbana", "Elétrica", "Cargo"];\nconst lista = document.querySelector("#lista");\n\n// percorra o array (for...of ou forEach)\n',
    verificar(doc) {
      const ul = doc.getElementById('lista');
      const itens = ul ? [...ul.querySelectorAll('li')].map(li => li.textContent.trim()) : [];
      return [
        { ok: itens.length === 3, msg: 'A lista tem 3 <li> (tem ' + itens.length + ')' },
        { ok: itens.join() === 'Urbana,Elétrica,Cargo', msg: 'Os textos são Urbana, Elétrica e Cargo, nessa ordem' }
      ];
    } },
  { id: 'd5', titulo: 'Formulário com validação', nivel: 'médio',
    enunciado: '<p>Ao clicar em <code>#enviar</code>: se o nome estiver vazio, escreva <b>Preencha o nome</b> em <code>#msg</code>; senão, escreva <b>Olá, NOME!</b> (ex.: <code>Olá, Ana!</code>). Ignore espaços nas pontas.</p>',
    html: '<label for="nome">Nome</label>\n<input id="nome">\n<button id="enviar">Enviar</button>\n<p id="msg"></p>',
    starter: '',
    verificar(doc) {
      const i = doc.getElementById('nome'), b = doc.getElementById('enviar'), m = doc.getElementById('msg');
      if (!i || !b || !m) return [{ ok: false, msg: 'Os elementos #nome, #enviar e #msg existem' }];
      i.value = '   '; b.click(); const r1 = m.textContent.trim();
      i.value = ' Ana '; b.click(); const r2 = m.textContent.trim();
      return [
        { ok: r1 === 'Preencha o nome', msg: 'Nome vazio → "Preencha o nome" (mostrou "' + r1 + '")' },
        { ok: r2 === 'Olá, Ana!', msg: 'Nome " Ana " → "Olá, Ana!" (mostrou "' + r2 + '")' }
      ];
    } },
  { id: 'd6', titulo: 'Modo escuro', nivel: 'fácil',
    enunciado: '<p>O botão <code>#btnTema</code> deve ligar e desligar a classe <code>dark</code> no <code>body</code>.</p>',
    html: '<button id="btnTema">🌙 Alternar tema</button>\n<p>Pedale também à noite.</p>',
    css: 'body{font-family:sans-serif;transition:.3s}body.dark{background:#0f172a;color:#e2e8f0}',
    starter: '',
    verificar(doc) {
      const b = doc.getElementById('btnTema');
      if (!b) return [{ ok: false, msg: 'O #btnTema existe' }];
      const antes = doc.body.classList.contains('dark');
      b.click(); const um = doc.body.classList.contains('dark');
      b.click(); const dois = doc.body.classList.contains('dark');
      return [
        { ok: !antes, msg: 'Começa sem a classe dark' },
        { ok: um, msg: '1º clique adiciona dark' },
        { ok: !dois, msg: '2º clique remove dark (use toggle)' }
      ];
    } },
  { id: 'd7', titulo: 'Simulador completo', nivel: 'difícil',
    enunciado: '<p>Ao clicar em <code>#calcular</code>, mostre em <code>#resultado</code> o valor formatado (ex.: <b>R$ 60,00</b>). Use as regras da EcoBike (12/20/25 por hora, 10% acima de 5h). Se as horas forem inválidas (vazio, 0 ou negativo), mostre uma mensagem contendo <b>válido</b>.</p>',
    html: '<label for="horas">Horas</label>\n<input type="number" id="horas">\n<select id="tipo">\n  <option value="urbana">Urbana</option>\n  <option value="eletrica">Elétrica</option>\n  <option value="cargo">Cargo</option>\n</select>\n<button id="calcular">Calcular</button>\n<p id="resultado"></p>',
    starter: '// reaproveite calcularValor e formatarMoeda do Lab de Functions!\n',
    verificar(doc) {
      const h = doc.getElementById('horas'), t = doc.getElementById('tipo'), b = doc.getElementById('calcular'), r = doc.getElementById('resultado');
      if (!h || !t || !b || !r) return [{ ok: false, msg: 'Os elementos do simulador existem' }];
      const teste = (horas, tipo) => { h.value = horas; t.value = tipo; b.click(); return r.textContent.trim(); };
      const a = teste('3', 'eletrica'), c = teste('6', 'urbana'), d = teste('5', 'cargo'), e = teste('', 'urbana'), f = teste('0', 'cargo');
      return [
        { ok: a.includes('R$ 60,00'), msg: '3h Elétrica → R$ 60,00 (mostrou "' + a + '")' },
        { ok: c.includes('R$ 64,80'), msg: '6h Urbana → R$ 64,80 (mostrou "' + c + '")' },
        { ok: d.includes('R$ 125,00'), msg: '5h Cargo → R$ 125,00, sem desconto (mostrou "' + d + '")' },
        { ok: /válid/i.test(e), msg: 'Horas vazias → mensagem de erro (mostrou "' + e + '")' },
        { ok: /válid/i.test(f), msg: '0 horas → mensagem de erro (mostrou "' + f + '")' }
      ];
    } },
  { id: 'd8', titulo: 'Reservas com remover', nivel: 'difícil',
    enunciado: '<p>Ao clicar em <code>#adicionar</code>, crie um <code>&lt;li&gt;</code> em <code>#lista</code> com o nome digitado e um <code>&lt;button&gt;</code> “Remover” dentro dele. Nome vazio não entra. Limpe o input. Mantenha <code>#total</code> sempre com a quantidade de itens (inclusive ao remover).</p>',
    html: '<input id="nome" placeholder="Seu nome">\n<button id="adicionar">Adicionar</button>\n<p>Total: <span id="total">0</span></p>\n<ul id="lista"></ul>',
    starter: '',
    verificar(doc) {
      const i = doc.getElementById('nome'), b = doc.getElementById('adicionar'), ul = doc.getElementById('lista'), tot = doc.getElementById('total');
      if (!i || !b || !ul || !tot) return [{ ok: false, msg: 'Os elementos #nome, #adicionar, #lista e #total existem' }];
      i.value = 'Ana'; b.click();
      i.value = 'Bruno'; b.click();
      const limpo = i.value === '';
      i.value = '  '; b.click();
      const qtd = ul.querySelectorAll('li').length;
      const t1 = tot.textContent.trim();
      const primeiro = ul.querySelector('li');
      const btnRem = primeiro && primeiro.querySelector('button');
      if (btnRem) btnRem.click();
      const qtd2 = ul.querySelectorAll('li').length;
      const t2 = tot.textContent.trim();
      return [
        { ok: qtd === 2, msg: '2 nomes válidos + 1 vazio → 2 itens na lista (tem ' + qtd + ')' },
        { ok: t1 === '2', msg: 'Total mostra 2 (mostrou "' + t1 + '")' },
        { ok: !!primeiro && primeiro.textContent.includes('Ana'), msg: 'O primeiro li contém "Ana"' },
        { ok: !!btnRem, msg: 'Cada li tem um botão Remover' },
        { ok: qtd2 === 1, msg: 'Clicar em Remover tira o item (restaram ' + qtd2 + ')' },
        { ok: t2 === '1', msg: 'Total atualiza para 1 após remover (mostrou "' + t2 + '")' },
        { ok: limpo, msg: 'O input é limpo após adicionar' }
      ];
    } }
];
