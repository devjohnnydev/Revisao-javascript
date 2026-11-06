# Revisão de Semestre · HTML, CSS, JavaScript DOM e Labs 3D

**Escola SENAI Morvan Figueiredo** · Curso Técnico em Desenvolvimento de Sistemas
Prof. Johnny Braga de Oliveira

Atividade de revisão contextualizada: os alunos (Morvan Dev Studio) constroem a landing page da startup fictícia **EcoBike SP** e treinam com 5 autotestes, incluindo **laboratórios práticos em 3D** em que a cena reage ao código e o aluno precisa **prever as saídas** antes de executar.

---

## 🚂 Publicar no Railway (recomendado)

O projeto já vem pronto: `server.js` (Node puro, **zero dependências**), `package.json` e `railway.json`.

### Opção A — pelo GitHub (deploy automático a cada push)
1. Suba **o conteúdo desta pasta** para um repositório no GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: revisão de semestre DS com labs 3D"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/revisao-ds.git
   git push -u origin main
   ```
2. Em <https://railway.com> → **New Project → Deploy from GitHub repo** → escolha o repositório.
3. O Railway detecta o Node, roda `node server.js` e usa a variável `PORT` automaticamente.
4. Em **Settings → Networking → Generate Domain** para ganhar a URL pública (`https://revisao-ds-xxxx.up.railway.app`).

### Opção B — pela CLI
```bash
npm i -g @railway/cli
railway login
railway init        # cria o projeto
railway up          # envia esta pasta e faz o deploy
railway domain      # gera a URL pública
```

### O que o servidor faz
| Recurso | Detalhe |
|---|---|
| Porta | lê `process.env.PORT` (definida pelo Railway), escuta em `0.0.0.0` |
| Healthcheck | `GET /healthz` → `200 ok` (configurado no `railway.json`) |
| MIME correto | `.js` como `text/javascript` — necessário para os módulos ES do Three.js |
| Desempenho | gzip em memória + `Cache-Control` (HTML sem cache, assets 1h) |
| Segurança | bloqueia `server.js`, `package.json`, `railway.json`, `README.md`, dotfiles e `../` |
| Reinício | `restartPolicyType: ON_FAILURE` + encerramento limpo no `SIGTERM` |

Testar localmente: `npm start` → <http://localhost:3000>

> Também funciona no **GitHub Pages** sem mudar nada (o `server.js` só é usado no Railway).

---

## O que tem no site
| Seção | Conteúdo |
|---|---|
| Contexto | Briefing do cliente (e-mail da CEO) e papel do aluno |
| Missões | 18 requisitos com checklist salvo no navegador |
| Código base | `index.html`, `style.css`, `script.js` com TODOs (copiar/baixar) |
| Quiz | 35 questões com explicação, filtro e embaralhar |
| Qual a saída? | 18 trechos: prever o console e depois executar |
| Lab de Functions | 10 funções com testes automáticos |
| Lab de DOM | 8 desafios com prévia ao vivo e verificador automático |
| **Labs 3D** | 6 laboratórios na estação EcoBike em 3D (ver abaixo) |
| Avaliação | Rubrica de 10 pontos + bônus |
| Meu progresso | Medidores + relatório com as **saídas registradas** de cada lab 3D |

### Laboratórios práticos 3D
Fluxo obrigatório em 3 passos: **1) registrar a previsão** das saídas (o botão Executar só libera depois) → **2) corrigir o bug e executar** → **3) conferir** a tabela *previsão × saída real × esperado*. O relatório final mostra, para cada lab, acertos de previsão, nº de tentativas e a saída real — você acompanha se está tudo certo.

| Lab | Conceito | O que a cena 3D mostra | Bug/TODO |
|---|---|---|---|
| 1 Montador de bikes | `for`, arrays, `%` | bikes caindo na doca | índice começa errado |
| 2 Totem de preços | functions, `return` | totem digital com o console + bikes | falta o desconto |
| 3 Doca inteligente | objetos, `if/else` | anéis livre/ocupada/manutenção | pegadinha `null < 20` |
| 4 Semáforo | `else if`, `%` | semáforo acendendo segundo a segundo | ciclo não reinicia |
| 5 Corrida | parâmetros, `map`, `sort` | corrida na ciclovia (15 km) | minutos × horas: bikes “saem da pista” |
| 6 Gráfico 3D | `reduce`, índices | barras 3D, melhor dia dourado | total/média/índice |

API disponível no código do aluno: `cena.adicionarBike(tipo)`, `cena.status(i, status)`, `cena.semaforo(cor, segundo)`, `cena.corrida(lista)`, `cena.barras(valores, rotulos, destaque)`.

O Three.js (r169, licença MIT) está em `js/vendor/` — **funciona mesmo se a rede da escola bloquear CDNs**. Se o computador não tiver WebGL, os labs continuam funcionando (a conferência das saídas não depende da cena).

## Como editar o conteúdo
- `js/dados.js` — `QUIZ`, `SAIDAS`, `FUNCOES`, `DOM_DESAFIOS`, `MISSOES`, `STARTER`
- `js/labs3d-dados.js` — `LABS3D`: `{ id, titulo, conceito, area, enunciado, starter, esperado[], dica }`
  (`area`: `doca`, `totem`, `semaforo`, `corrida` ou `grafico` — define onde a câmera foca)

> O gabarito fica em `gabarito-professor/`, **fora** do site. Não publique essa pasta.
