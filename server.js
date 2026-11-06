/* =========================================================
   Servidor estático para o Railway (Node puro, sem dependências)
   Revisão de Semestre · SENAI Morvan Figueiredo · Prof. Johnny Braga de Oliveira

   - Usa a porta da variável PORT (o Railway define automaticamente)
   - Serve index.html, css/, js/ com o MIME correto (inclui módulos ES do Three.js)
   - Compressão gzip, cache e rota de saúde /healthz
   - Bloqueia arquivos internos (server.js, package.json, dotfiles...)
   ========================================================= */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const RAIZ = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2'
};
const COMPRIMIR = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt']);
const BLOQUEADOS = new Set(['/server.js', '/package.json', '/package-lock.json', '/railway.json', '/nixpacks.toml', '/README.md']);

const cacheGzip = new Map(); // arquivo -> { mtime, buffer }

function enviar(res, status, corpo, cabecalhos = {}) {
  res.writeHead(status, { 'X-Content-Type-Options': 'nosniff', ...cabecalhos });
  res.end(corpo);
}

const servidor = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return enviar(res, 405, 'Método não permitido', { Allow: 'GET, HEAD' });
  }

  let rota;
  try {
    rota = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return enviar(res, 400, 'Requisição inválida');
  }

  if (rota === '/healthz') return enviar(res, 200, 'ok', { 'Content-Type': 'text/plain' });
  if (rota.endsWith('/')) rota += 'index.html';

  // segurança: nada de ../, dotfiles ou arquivos do servidor
  const arquivo = path.normalize(path.join(RAIZ, rota));
  if (!arquivo.startsWith(RAIZ + path.sep) || rota.split('/').some((p) => p.startsWith('.')) || BLOQUEADOS.has(rota) || rota.startsWith('/node_modules')) {
    return enviar(res, 404, 'Não encontrado');
  }

  const ext = path.extname(arquivo).toLowerCase();
  const tipo = MIME[ext];
  fs.stat(arquivo, (erro, info) => {
    if (erro || !info.isFile() || !tipo) {
      // página inexistente: volta para a atividade
      if (!ext) return enviar(res, 302, '', { Location: '/' });
      return enviar(res, 404, 'Não encontrado', { 'Content-Type': 'text/plain; charset=utf-8' });
    }

    const cabecalhos = {
      'Content-Type': tipo,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'Last-Modified': info.mtime.toUTCString()
    };
    if (req.headers['if-modified-since'] && new Date(req.headers['if-modified-since']) >= new Date(info.mtime.toUTCString())) {
      return enviar(res, 304, '', cabecalhos);
    }

    const aceitaGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    if (aceitaGzip && COMPRIMIR.has(ext)) {
      const c = cacheGzip.get(arquivo);
      const entregar = (buf) => enviar(res, 200, req.method === 'HEAD' ? '' : buf, { ...cabecalhos, 'Content-Encoding': 'gzip', 'Content-Length': buf.length, Vary: 'Accept-Encoding' });
      if (c && c.mtime === info.mtimeMs) return entregar(c.buffer);
      return fs.readFile(arquivo, (e, dados) => {
        if (e) return enviar(res, 500, 'Erro ao ler arquivo');
        const buf = zlib.gzipSync(dados, { level: 9 });
        cacheGzip.set(arquivo, { mtime: info.mtimeMs, buffer: buf });
        entregar(buf);
      });
    }

    res.writeHead(200, { ...cabecalhos, 'Content-Length': info.size, 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(arquivo).pipe(res);
  });
});

servidor.listen(PORT, '0.0.0.0', () => {
  console.log(`Revisão DS no ar: http://localhost:${PORT}`);
});

// encerramento limpo quando o Railway reinicia o serviço
process.on('SIGTERM', () => servidor.close(() => process.exit(0)));
