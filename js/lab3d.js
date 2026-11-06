/* =========================================================
   LABORATÓRIOS PRÁTICOS 3D · EcoBike SP
   Cena realista em Three.js (hospedado em js/vendor, funciona offline).
   O código do aluno recebe dois objetos: console e cena.
   API disponível para o aluno:
     cena.adicionarBike(tipo)            -> índice da bike na doca
     cena.status(indice, status)          'livre' | 'ocupada' | 'manutencao'
     cena.semaforo(cor, segundo)          'verde' | 'amarelo' | 'vermelho'
     cena.corrida([{ tipo, distancia }])  distância em km (pista = 15 km)
     cena.barras(valores, rotulos, indiceDestaque)
   Prof. Johnny Braga de Oliveira · SENAI Morvan Figueiredo
   ========================================================= */

const q = (s, c = document) => c.querySelector(s);
const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- carrega o Three.js (se falhar, os labs funcionam sem a cena) ---------- */
let THREE = null, OrbitControls = null, RoomEnvironment = null;
try {
  THREE = await import('three');
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
  ({ RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js'));
} catch (e) {
  console.warn('Three.js não carregou:', e);
  THREE = null;
}

const CORES_TIPO = { urbana: 0x16a34a, eletrica: 0x2563eb, cargo: 0xea580c };
const CORES_STATUS = { livre: '#22c55e', ocupada: '#ef4444', manutencao: '#f59e0b' };
const CAMERAS = {
  geral:    [[0, 13, 24],   [0, 1, 0]],
  doca:     [[0, 5.5, 11.5], [0, 0.8, 0]],
  totem:    [[-4.6, 3.1, 6.4], [-8.2, 1.5, 0.2]],
  semaforo: [[6.5, 4.2, 12], [11.8, 2.4, 3.8]],
  corrida:  [[0, 9, 19],    [0, 0.5, 6]],
  grafico:  [[0, 6.8, 5.8], [0, 2.2, -6.5]]
};
const PISTA = { inicio: -12, fim: 12, km: 15, faixas: [5.25, 6.0, 6.75] };

/* =========================================================
   MUNDO 3D
   ========================================================= */
class Mundo {
  constructor(el) {
    this.el = el;
    this.anims = [];
    this.dinamicos = [];
    this.bikesDoca = [];
    this.visivel = true;
    this.avisos = [];

    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    el.appendChild(r.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    this.camera.position.set(...CAMERAS.geral[0]);

    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 45;
    this.controls.target.set(...CAMERAS.geral[1]);

    this.construirCenario();
    this.redimensionar();
    new ResizeObserver(() => this.redimensionar()).observe(el);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => { this.visivel = e.isIntersecting; }).observe(el);
    }
    this.relogio = new THREE.Clock();
    r.setAnimationLoop(() => this.quadro());
  }

  redimensionar() {
    const w = this.el.clientWidth, h = this.el.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  quadro() {
    const dt = Math.min(this.relogio.getDelta(), 0.05);
    this.anims = this.anims.filter((a) => {
      a.t += dt;
      if (a.t < a.delay) return true;
      const p = Math.min((a.t - a.delay) / a.dur, 1);
      a.update(a.ease(p), p);
      if (p >= 1) { a.fim && a.fim(); return false; }
      return true;
    });
    this.controls.update();
    if (this.visivel) this.renderer.render(this.scene, this.camera);
  }

  animar({ dur = 1, delay = 0, ease = easeOutCubic, update, fim }) {
    this.anims.push({ t: 0, dur, delay, ease, update, fim });
  }

  focar(area) {
    const [pos, alvo] = CAMERAS[area] || CAMERAS.geral;
    const p0 = this.camera.position.clone(), a0 = this.controls.target.clone();
    const a1 = new THREE.Vector3(...alvo);
    // cenas largas: afasta a câmera quando a tela é estreita (celular, palco quadrado)
    const largura = { doca: 1.3, corrida: 2.3, grafico: 1.45, geral: 1.6 }[area] || 1;
    const fator = Math.min(2.4, Math.max(1, largura / this.camera.aspect));
    const p1 = new THREE.Vector3(...pos).sub(a1).multiplyScalar(fator).add(a1);
    this.animar({
      dur: 1.4, ease: easeInOutCubic,
      update: (k) => { this.camera.position.lerpVectors(p0, p1, k); this.controls.target.lerpVectors(a0, a1, k); }
    });
  }

  /* ---------------- cenário ---------------- */
  construirCenario() {
    const s = this.scene;
    s.background = texGradiente(['#7fb3ec', '#cfe3f7', '#eef3f8']);
    s.fog = new THREE.Fog(0xe3ecf5, 38, 95);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    s.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    s.environmentIntensity = 0.55;

    s.add(new THREE.HemisphereLight(0xcfe3ff, 0x6b5f50, 0.55));
    const sol = new THREE.DirectionalLight(0xfff0d8, 2.4);
    sol.position.set(14, 24, 13);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    Object.assign(sol.shadow.camera, { left: -26, right: 26, top: 22, bottom: -22, near: 1, far: 80 });
    sol.shadow.bias = -0.0004;
    sol.shadow.normalBias = 0.02;
    s.add(sol);

    // chão de concreto (calçada)
    const concreto = texRuido('#c9c4bb', 18, (ctx, w) => {
      ctx.strokeStyle = 'rgba(90,85,78,.35)'; ctx.lineWidth = 3;
      for (let i = 0; i <= w; i += w / 2) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, w); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
    });
    concreto.repeat.set(40, 40);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ map: concreto, roughness: 0.95 }));
    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    s.add(chao);

    // rua de asfalto
    const asfalto = texRuido('#3b3b3f', 26);
    asfalto.repeat.set(30, 3);
    const rua = new THREE.Mesh(new THREE.PlaneGeometry(160, 9), new THREE.MeshStandardMaterial({ map: asfalto, roughness: 0.9 }));
    rua.rotation.x = -Math.PI / 2;
    rua.position.set(0, 0.006, 12.2);
    rua.receiveShadow = true;
    s.add(rua);
    for (let x = -78; x < 78; x += 4) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(2, 0.15), new THREE.MeshStandardMaterial({ color: 0xf5c518, roughness: 0.6 }));
      f.rotation.x = -Math.PI / 2; f.position.set(x, 0.012, 12.2); s.add(f);
    }

    // ciclovia vermelha (padrão de São Paulo)
    const vermelha = texRuido('#a8372f', 22);
    vermelha.repeat.set(20, 2);
    const ciclovia = new THREE.Mesh(new THREE.PlaneGeometry(160, 2.6), new THREE.MeshStandardMaterial({ map: vermelha, roughness: 0.85 }));
    ciclovia.rotation.x = -Math.PI / 2;
    ciclovia.position.set(0, 0.01, 6);
    ciclovia.receiveShadow = true;
    s.add(ciclovia);
    const tinta = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    [4.72, 7.28].forEach((z) => {
      const l = new THREE.Mesh(new THREE.PlaneGeometry(160, 0.08), tinta);
      l.rotation.x = -Math.PI / 2; l.position.set(0, 0.014, z); s.add(l);
    });
    // largada e chegada quadriculadas + marcos de km
    [PISTA.inicio, PISTA.fim].forEach((x) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.6), new THREE.MeshStandardMaterial({ map: texXadrez(), roughness: 0.6 }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, 0.016, 6); s.add(m);
    });
    for (let km = 0; km <= PISTA.km; km += 5) {
      const x = PISTA.inicio + (km / PISTA.km) * (PISTA.fim - PISTA.inicio);
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 10), metal(0x9ca3af));
      poste.position.set(x, 0.45, 7.65); poste.castShadow = true; s.add(poste);
      const r = rotulo(km + ' km', { tamanho: 0.32 });
      r.position.set(x, 1.1, 7.65); s.add(r);
    }

    this.construirDoca();
    this.construirTotem();
    this.construirSemaforo();
    this.construirPalcoGrafico();
    this.construirCidade();
  }

  construirDoca() {
    const s = this.scene;
    const piso = new THREE.Mesh(new THREE.BoxGeometry(16, 0.08, 3), new THREE.MeshStandardMaterial({ map: texDoca(), roughness: 0.8 }));
    piso.position.set(0, 0.04, 0.1);
    piso.receiveShadow = true;
    s.add(piso);
    const aco = metal(0xb8bec7, 0.3);
    const barra = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 15.6, 16), aco);
    barra.rotation.z = Math.PI / 2; barra.position.set(0, 0.78, -0.95); barra.castShadow = true; s.add(barra);
    for (let x = -7.6; x <= 7.7; x += 3.8) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.78, 12), aco);
      p.position.set(x, 0.39, -0.95); p.castShadow = true; s.add(p);
    }
    this.vagas = [];
    for (let i = 0; i < 8; i++) {
      const x = -6.65 + i * 1.9;
      this.vagas.push(x);
      [-0.13, 0.13].forEach((dx) => {
        const u = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), aco);
        u.position.set(x + dx, 0.36, -0.82); u.castShadow = true; s.add(u);
      });
    }
  }

  construirTotem() {
    const s = this.scene;
    const g = new THREE.Group();
    g.position.set(-10, 0, 0.4);
    g.rotation.y = 0.45;
    const verde = new THREE.MeshPhysicalMaterial({ color: 0x15803d, roughness: 0.35, metalness: 0.2, clearcoat: 0.8 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.18, 0.8), metal(0x52525b, 0.5));
    base.position.y = 0.09;
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.45, 2.7, 0.38), verde);
    corpo.position.y = 1.53;
    const moldura = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.86, 0.04), new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.3 }));
    moldura.position.set(0, 1.85, 0.2);
    this.telaCanvas = document.createElement('canvas');
    this.telaCanvas.width = 1024; this.telaCanvas.height = 640;
    this.telaTex = new THREE.CanvasTexture(this.telaCanvas);
    this.telaTex.colorSpace = THREE.SRGBColorSpace;
    this.telaTex.anisotropy = 8;
    const tela = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.75), new THREE.MeshBasicMaterial({ map: this.telaTex, toneMapped: false }));
    tela.position.set(0, 1.85, 0.225);
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: texLogo(), toneMapped: false, transparent: true }));
    logo.position.set(0, 2.62, 0.195);
    [base, corpo, moldura].forEach((m) => { m.castShadow = true; m.receiveShadow = true; });
    g.add(base, corpo, moldura, tela, logo);
    s.add(g);
    this.escreverConsole([], null, 'aguardando execução…');
  }

  construirSemaforo() {
    const s = this.scene;
    const g = new THREE.Group();
    g.position.set(13.4, 0, 3.7);
    g.rotation.y = -0.35;
    const cinza = metal(0x374151, 0.45);
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3, 16), cinza);
    poste.position.y = 1.5;
    const caixa = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.35, 0.36), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.55 }));
    caixa.position.y = 3.55;
    [poste, caixa].forEach((m) => { m.castShadow = true; });
    g.add(poste, caixa);
    this.lentes = {};
    [['vermelho', 0xff2d2d, 3.97], ['amarelo', 0xffb400, 3.55], ['verde', 0x22e36b, 3.13]].forEach(([nome, cor, y]) => {
      const mat = new THREE.MeshStandardMaterial({ color: 0x1f2937, emissive: cor, emissiveIntensity: 0.06, roughness: 0.2 });
      const lente = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      lente.rotation.x = Math.PI / 2; lente.position.set(0, y, 0.18);
      const pala = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.18, 20, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x111827, side: THREE.DoubleSide }));
      pala.rotation.x = Math.PI / 2; pala.position.set(0, y + 0.02, 0.27);
      const luz = new THREE.PointLight(cor, 0, 6, 2);
      luz.position.set(0, y, 0.6);
      g.add(lente, pala, luz);
      this.lentes[nome] = { mat, luz };
    });
    s.add(g);
    this.semaforoGrupo = g;
  }

  acender(cor) {
    Object.entries(this.lentes).forEach(([nome, { mat, luz }]) => {
      const on = nome === cor;
      mat.emissiveIntensity = on ? 4.5 : 0.06;
      mat.color.set(on ? 0xffffff : 0x1f2937);
      luz.intensity = on ? 6 : 0;
    });
  }

  construirPalcoGrafico() {
    const plinto = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.22, 2.6), new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.3, clearcoat: 1 }));
    plinto.position.set(0, 0.11, -6.6);
    plinto.receiveShadow = true; plinto.castShadow = true;
    this.scene.add(plinto);
  }

  construirCidade() {
    const s = this.scene;
    const predios = [[-26, -24, 7, 14], [-17, -26, 6, 22], [-8, -27, 8, 17], [2, -25, 6, 26], [11, -27, 7, 19], [20, -24, 6, 13], [29, -26, 8, 24], [-34, -28, 7, 18], [37, -22, 6, 11]];
    predios.forEach(([x, z, w, h], i) => {
      const tex = texJanelas(i);
      tex.repeat.set(Math.max(1, Math.round(w / 3)), Math.round(h / 3));
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 6), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75, metalness: 0.1 }));
      m.position.set(x, h / 2, z);
      m.receiveShadow = true;
      s.add(m);
    });
    const arvores = [[-16.5, -3.5], [16.5, -3.5], [-14, -11], [14, -11], [-6, -12.5], [6, -12.5], [-20, 2.5], [20, 1.5], [-24, -6], [24, -7]];
    arvores.forEach(([x, z], i) => s.add(arvore(x, z, i)));
  }

  /* ---------------- bike modelada ---------------- */
  criarBike(tipo) {
    const g = new THREE.Group();
    const valido = tipo in CORES_TIPO;
    const quadro = new THREE.MeshPhysicalMaterial({ color: valido ? CORES_TIPO[tipo] : 0x9ca3af, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, transparent: !valido, opacity: valido ? 1 : 0.45 });
    const preto = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
    const cromo = metal(0xd4d4d8, 0.18);
    const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

    const R = 0.34, Rf = tipo === 'cargo' ? 0.27 : R;
    const tras = V(-0.52, R), frente = V(tipo === 'cargo' ? 0.8 : 0.52, Rf);
    const mov = V(-0.06, 0.3), selim = V(-0.24, 0.9), cabT = V(0.4, 0.93), cabB = V(0.45, 0.72);

    const rodas = [roda(R), roda(Rf)];
    rodas[0].position.copy(tras); rodas[1].position.copy(frente);
    g.add(...rodas);

    const tubo = (a, b, r, mat = quadro) => g.add(tuboEntre(a, b, r, mat));
    tubo(mov, selim, 0.022);
    tubo(mov, cabB, 0.027);
    tubo(cabB, cabT, 0.03);
    if (tipo === 'urbana') tubo(V(-0.17, 0.58), V(0.43, 0.8), 0.021); // quadro rebaixado
    else tubo(V(-0.22, 0.84), cabT, 0.021);
    [-0.05, 0.05].forEach((z) => {
      tubo(V(mov.x, mov.y, z), V(tras.x, tras.y, z), 0.013);
      tubo(V(-0.22, 0.83, z * 0.6), V(tras.x, tras.y, z), 0.012);
      tubo(V(cabB.x, cabB.y, z * 0.9), V(frente.x, frente.y, z), 0.014, cromo);
    });
    tubo(selim, V(-0.27, 1.0), 0.016, cromo);
    const banco = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.2, 4, 12), preto);
    banco.rotation.z = Math.PI / 2; banco.scale.set(1, 1, 1.4); banco.position.set(-0.28, 1.04, 0);
    tubo(cabT, V(0.37, 1.07), 0.018, cromo);
    const guidao = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.58, 12), cromo);
    guidao.rotation.x = Math.PI / 2; guidao.position.set(0.36, 1.07, 0);
    [-0.27, 0.27].forEach((z) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 12), preto);
      m.rotation.x = Math.PI / 2; m.position.set(0.36, 1.07, z); g.add(m);
    });
    const coroa = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 28), cromo);
    coroa.rotation.x = Math.PI / 2; coroa.position.set(mov.x, mov.y, 0.07);
    const pedivela = tuboEntre(V(mov.x, mov.y, 0.08), V(mov.x + 0.08, mov.y - 0.15, 0.08), 0.012, cromo);
    const pedal = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.08), preto);
    pedal.position.set(mov.x + 0.08, mov.y - 0.16, 0.13);
    const farol = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6d0, emissiveIntensity: 2 }));
    farol.position.set(0.45, 0.98, 0);
    g.add(banco, guidao, coroa, pedivela, pedal, farol);

    if (tipo === 'eletrica') {
      const dir = cabB.clone().sub(mov);
      const bat = new THREE.Mesh(new THREE.BoxGeometry(dir.length() * 0.62, 0.085, 0.085), new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.4, metalness: 0.4 }));
      bat.position.copy(mov.clone().add(dir.clone().multiplyScalar(0.48))).add(V(0, 0.06, 0));
      bat.rotation.z = Math.atan2(dir.y, dir.x);
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.087), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 3 }));
      led.position.copy(bat.position).add(V(0, 0.045, 0)); led.rotation.z = bat.rotation.z;
      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.07, 20), new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.7, roughness: 0.3 }));
      motor.rotation.x = Math.PI / 2; motor.position.copy(tras);
      g.add(bat, led, motor);
    }
    if (tipo === 'cargo') {
      const madeira = new THREE.MeshStandardMaterial({ color: 0xb7834f, roughness: 0.75 });
      const caixa = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.3, 0.44), madeira);
      caixa.position.set(0.8, 0.68, 0);
      const suporte = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.025, 0.4), cromo);
      suporte.position.set(0.8, 0.52, 0);
      tubo(cabB, V(0.62, 0.52), 0.016, cromo);
      g.add(caixa, suporte);
    }
    if (tipo === 'urbana') {
      const cesta = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: 0xd6c08a, roughness: 0.9 }));
      cesta.position.set(0.53, 1.0, 0);
      g.add(cesta);
    }
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
    g.userData = { rodas, R };
    return g;
  }

  /* ---------------- helpers de limpeza ---------------- */
  adicionar(obj) { this.scene.add(obj); this.dinamicos.push(obj); return obj; }

  limpar() {
    this.dinamicos.forEach((o) => {
      this.scene.remove(o);
      o.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) { if (c.material.map) c.material.map.dispose(); c.material.dispose(); }
      });
    });
    this.dinamicos = [];
    this.bikesDoca = [];
    this.anims = this.anims.filter((a) => a.camera);
    this.passosSemaforo = 0;
    this.acender(null);
    this.avisos = [];
  }

  /* =========================================================
     API USADA PELO CÓDIGO DO ALUNO
     ========================================================= */
  adicionarBike(tipo) {
    if (this.bikesDoca.length >= 8) { this.avisos.push('A doca só tem 8 vagas — bike ignorada.'); return -1; }
    const i = this.bikesDoca.length;
    const bike = this.criarBike(tipo);
    bike.rotation.y = Math.PI / 2;
    bike.position.set(this.vagas[i], 3, 0.15);
    this.adicionar(bike);
    this.bikesDoca.push(bike);
    const num = rotulo(String(i + 1), { tamanho: 0.28, fundo: 'rgba(15,23,42,.75)' });
    num.position.set(this.vagas[i], 0.25, 1.35);
    this.adicionar(num);
    if (!(tipo in CORES_TIPO)) {
      this.avisos.push(`Bike ${i + 1}: tipo inválido (${tipo}). Use 'urbana', 'eletrica' ou 'cargo'.`);
      const r = rotulo('tipo inválido: ' + tipo, { cor: '#fecaca', fundo: 'rgba(127,29,29,.9)', tamanho: 0.26 });
      r.position.set(this.vagas[i], 1.55, 0.15);
      this.adicionar(r);
    }
    this.animar({ dur: 0.9, delay: i * 0.18, ease: easeOutBounce, update: (k) => { bike.position.y = 3 * (1 - k); } });
    return i;
  }

  status(i, status) {
    const bike = this.bikesDoca[i];
    if (!bike) { this.avisos.push(`cena.status(${i}, …): não existe bike nesse índice.`); return; }
    const cor = CORES_STATUS[status];
    if (!cor) this.avisos.push(`Bike ${i + 1}: status inválido (${status}).`);
    const c = new THREE.Color(cor || '#94a3b8');
    const anel = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.95, toneMapped: false }));
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.95, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22, depthWrite: false, toneMapped: false }));
    [anel, halo].forEach((m) => { m.rotation.x = -Math.PI / 2; m.position.set(this.vagas[i], 0.09 + (m === anel ? 0.002 : 0), 0.15); m.scale.setScalar(0.001); this.adicionar(m); });
    const r = rotulo(status || '?', { cor: '#fff', fundo: (cor || '#64748b') + 'e6', tamanho: 0.3 });
    r.position.set(this.vagas[i], 1.6, 0.15); r.visible = false;
    this.adicionar(r);
    this.animar({ dur: 0.5, delay: 0.9 + i * 0.18, ease: easeOutBack, update: (k) => { anel.scale.setScalar(Math.max(k, 0.001)); halo.scale.setScalar(Math.max(k, 0.001)); r.visible = true; } });
  }

  semaforo(cor, segundo) {
    if (!['verde', 'amarelo', 'vermelho'].includes(cor)) this.avisos.push(`semáforo: cor inválida (${cor}).`);
    const passo = (this.passosSemaforo = (this.passosSemaforo || 0) + 1) - 1;
    this.animar({
      dur: 0.01, delay: 0.9 + passo * 1.5,
      update: () => {},
      fim: () => {
        this.acender(cor);
        if (this.rotuloSemaforo) { this.scene.remove(this.rotuloSemaforo); this.rotuloSemaforo.material.map.dispose(); }
        const hex = { verde: '#16a34a', amarelo: '#d97706', vermelho: '#dc2626' }[cor] || '#475569';
        this.rotuloSemaforo = rotulo((segundo ?? '?') + 's → ' + cor, { fundo: hex + 'ee', tamanho: 0.38 });
        this.rotuloSemaforo.position.set(13.2, 4.75, 3.9);
        this.adicionar(this.rotuloSemaforo);
      }
    });
  }

  corrida(lista) {
    if (!Array.isArray(lista)) { this.avisos.push('cena.corrida espera um array de { tipo, distancia }.'); return; }
    const unid = (PISTA.fim - PISTA.inicio) / PISTA.km;
    const maior = Math.max(...lista.map((c) => (Number.isFinite(c.distancia) ? c.distancia : -Infinity)));
    lista.slice(0, 3).forEach((c, i) => {
      const bike = this.criarBike(c.tipo);
      bike.position.set(PISTA.inicio, 0, PISTA.faixas[i]);
      this.adicionar(bike);
      const d = Number(c.distancia);
      if (!Number.isFinite(d)) { this.avisos.push(`${c.tipo}: distância inválida (${c.distancia}).`); return; }
      const fora = d > PISTA.km * 1.25;
      const alvo = fora ? PISTA.fim + 1.2 : PISTA.inicio + d * unid;
      const texto = fora ? `${d} km?! saiu da pista` : (d === maior ? '🏆 ' : '') + d + ' km';
      const r = rotulo(c.tipo, { tamanho: 0.55 });
      r.position.set(0, 1.75, 0); bike.add(r);
      let xAnt = PISTA.inicio;
      this.animar({
        dur: 4.2, delay: 0.6, ease: easeInOutSine,
        update: (k) => {
          const x = PISTA.inicio + (alvo - PISTA.inicio) * k;
          bike.userData.rodas.forEach((w) => { w.rotation.z -= (x - xAnt) / bike.userData.R; });
          xAnt = x; bike.position.x = x;
        },
        fim: () => {
          bike.remove(r); r.material.map.dispose();
          const fim = rotulo(texto, { tamanho: 0.6, fundo: fora ? 'rgba(185,28,28,.92)' : d === maior ? 'rgba(180,120,0,.95)' : 'rgba(15,23,42,.88)' });
          fim.position.set(0, 1.4 + i * 0.55, 0); bike.add(fim);
        }
      });
    });
  }

  barras(valores, rotulos = [], destaque = -1) {
    if (!Array.isArray(valores) || !valores.every((v) => typeof v === 'number')) { this.avisos.push('cena.barras espera um array de números.'); return; }
    if (!(destaque >= 0 && destaque < valores.length)) this.avisos.push(`Índice de destaque inválido (${destaque}).`);
    const max = Math.max(...valores, 1);
    const passo = Math.min(1.8, 12.4 / valores.length);
    valores.forEach((v, i) => {
      const x = -((valores.length - 1) * passo) / 2 + i * passo;
      const h = Math.max(0.05, (v / max) * 4.6);
      const ouro = i === destaque;
      const geo = new THREE.BoxGeometry(passo * 0.62, 1, 1.1);
      geo.translate(0, 0.5, 0);
      const mat = new THREE.MeshPhysicalMaterial({ color: ouro ? 0xf5b301 : 0x0ea5e9, metalness: ouro ? 0.9 : 0.1, roughness: ouro ? 0.22 : 0.18, clearcoat: 1, emissive: ouro ? 0x4a3000 : 0x000000 });
      const barra = new THREE.Mesh(geo, mat);
      barra.position.set(x, 0.22, -6.6); barra.scale.y = 0.001; barra.castShadow = true; barra.receiveShadow = true;
      this.adicionar(barra);
      const rv = rotulo(String(v), { tamanho: 0.32, fundo: ouro ? 'rgba(180,120,0,.95)' : 'rgba(15,23,42,.85)' });
      rv.visible = false; this.adicionar(rv);
      const rd = rotulo(String(rotulos[i] ?? i), { tamanho: 0.3 });
      rd.position.set(x, 0.55, -5.05); this.adicionar(rd);
      this.animar({
        dur: 1.1, delay: 0.5 + i * 0.12, ease: easeOutBack,
        update: (k) => { barra.scale.y = Math.max(0.001, h * k); rv.position.set(x, 0.22 + h * k + 0.35, -6.6); rv.visible = true; }
      });
    });
  }

  escreverConsole(linhas, erro, vazio = '(nenhuma saída)') {
    const c = this.telaCanvas, ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, '#04101f'); grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#15803d'; ctx.fillRect(0, 0, c.width, 70);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 34px system-ui, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('EcoBike SP · console', 28, 36);
    ctx.font = '44px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'alphabetic';
    const todas = linhas.length ? linhas.map((l) => ['› ' + l, '#86efac']) : [[vazio, '#64748b']];
    if (erro) todas.push(['✖ ' + erro, '#fca5a5']);
    todas.slice(-9).forEach(([t, cor], i) => {
      ctx.fillStyle = cor;
      ctx.fillText(t.length > 36 ? t.slice(0, 35) + '…' : t, 28, 128 + i * 56);
    });
    this.telaTex.needsUpdate = true;
  }
}

/* ---------------- fábrica de peças ---------------- */
function metal(cor, rough = 0.25) {
  return new THREE.MeshStandardMaterial({ color: cor, metalness: 1, roughness: rough });
}
function tuboEntre(a, b, r, mat) {
  const dir = b.clone().sub(a);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 12), mat);
  m.position.copy(a).add(dir.clone().multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}
function roda(R) {
  const g = new THREE.Group();
  const pneu = new THREE.Mesh(new THREE.TorusGeometry(R, 0.034, 14, 48), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 }));
  const aro = new THREE.Mesh(new THREE.TorusGeometry(R - 0.035, 0.012, 8, 48), metal(0xc7cbd1, 0.2));
  const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 12), metal(0x9ca3af, 0.3));
  cubo.rotation.x = Math.PI / 2;
  g.add(pneu, aro, cubo);
  const raioMat = metal(0xe5e7eb, 0.25);
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const raio = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, R - 0.05, 4), raioMat);
    raio.position.set(Math.cos(a) * (R - 0.05) / 2, Math.sin(a) * (R - 0.05) / 2, (i % 2 ? 0.02 : -0.02));
    raio.rotation.z = a - Math.PI / 2;
    g.add(raio);
  }
  return g;
}
function arvore(x, z, semente) {
  const g = new THREE.Group();
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0x6b4f3a, roughness: 0.95 }));
  tronco.position.y = 1.1;
  const vaso = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.9 }));
  vaso.position.y = 0.2;
  g.add(tronco, vaso);
  const verdes = [0x2f7d32, 0x3a8f3e, 0x276b2b];
  [[0, 2.7, 0, 1.05], [0.45, 2.35, 0.2, 0.75], [-0.4, 2.45, -0.25, 0.8]].forEach(([dx, y, dz, r], i) => {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), new THREE.MeshStandardMaterial({ color: verdes[(i + semente) % 3], roughness: 0.85, flatShading: true }));
    f.position.set(dx, y, dz); g.add(f);
  });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.position.set(x, 0, z);
  g.rotation.y = semente;
  return g;
}

/* ---------------- texturas procedurais ---------------- */
function canvasTex(w, h, desenhar, repetir = false) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function texRuido(base, intensidade, extra) {
  return canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      const v = (Math.random() - 0.5) * intensidade;
      ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v / 100})` : `rgba(0,0,0,${-v / 100})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    if (extra) extra(ctx, w, h);
  }, true);
}
function texGradiente(cores) {
  return canvasTex(4, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    cores.forEach((c, i) => g.addColorStop(i / (cores.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  });
}
function texXadrez() {
  return canvasTex(64, 256, (ctx) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#111' : '#f8fafc'; ctx.fillRect(x * 16, y * 16, 16, 16);
    }
  });
}
function texDoca() {
  return canvasTex(1024, 192, (ctx, w, h) => {
    ctx.fillStyle = '#6b7280'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 4;
    for (let i = 0; i <= 8; i++) { const x = 32 + i * 120; ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, h - 20); ctx.stroke(); }
    ctx.fillStyle = '#16a34a'; ctx.fillRect(0, h - 14, w, 14);
  });
}
function texLogo() {
  return canvasTex(512, 128, (ctx, w, h) => {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 64px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🚲 EcoBike SP', w / 2, h / 2 + 4);
  });
}
function texJanelas(semente) {
  const tons = ['#9aa3ad', '#b6aea3', '#8b96a3', '#c2c7cc', '#a39e96'];
  return canvasTex(128, 128, (ctx, w, h) => {
    ctx.fillStyle = tons[semente % tons.length]; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
      ctx.fillStyle = Math.random() < 0.25 ? '#fde68a' : (Math.random() < 0.5 ? '#334155' : '#475569');
      ctx.fillRect(14 + x * 60, 14 + y * 60, 40, 44);
    }
  }, true);
}
function rotulo(texto, { cor = '#fff', fundo = 'rgba(15,23,42,.85)', tamanho = 0.4 } = {}) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const fonte = 'bold 52px system-ui, -apple-system, sans-serif';
  ctx.font = fonte;
  c.width = Math.ceil(ctx.measureText(texto).width + 56); c.height = 84;
  ctx.font = fonte;
  ctx.fillStyle = fundo;
  const r = 30;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.arcTo(c.width, 0, c.width, c.height, r); ctx.arcTo(c.width, c.height, 0, c.height, r);
  ctx.arcTo(0, c.height, 0, 0, r); ctx.arcTo(0, 0, c.width, 0, r); ctx.fill();
  ctx.fillStyle = cor; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(texto, c.width / 2, c.height / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
  s.scale.set(tamanho * c.width / c.height, tamanho, 1);
  s.renderOrder = 10;
  return s;
}

/* ---------------- easings ---------------- */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
function easeOutBack(t) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
function easeOutBounce(x) {
  const n1 = 7.5625, d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  return n1 * (x -= 2.625 / d1) * x + 0.984375;
}

/* =========================================================
   INTERFACE DOS LABORATÓRIOS
   ========================================================= */
let labAtual = LABS3D[0].id;
let mundo = null;

const palco = q('#palco3d');
try {
  if (THREE) {
    mundo = new Mundo(palco);
    q('#carregando3d').hidden = true;
  } else {
    throw new Error('sem Three.js');
  }
} catch (e) {
  console.warn(e);
  q('#carregando3d').innerHTML = '⚠ Não foi possível iniciar a cena 3D neste navegador (WebGL desativado?).<br>Os laboratórios funcionam mesmo assim: a conferência das saídas é feita normalmente.';
}

// API entregue ao código do aluno (funciona mesmo sem 3D)
function criarApi(avisos) {
  const chamar = (nome, args, padrao) => {
    if (!mundo) return padrao;
    const r = mundo[nome](...args);
    avisos.push(...mundo.avisos.splice(0));
    return r;
  };
  let semMundo = 0;
  return Object.freeze({
    adicionarBike: (tipo) => (mundo ? chamar('adicionarBike', [tipo]) : semMundo++),
    status: (...a) => chamar('status', a),
    semaforo: (...a) => chamar('semaforo', a),
    corrida: (...a) => chamar('corrida', a),
    barras: (...a) => chamar('barras', a)
  });
}

const registro = (id) => (estado.lab3d[id] ||= { previsao: [], travada: false, ok: false, tentativas: 0 });
const solta = (s) => String(s ?? '').trim().toLowerCase().replace(/["'`]/g, '').replace(/\s+/g, ' ');
const exata = (s) => String(s ?? '').trim();

function renderAbas() {
  const box = q('#abas3d');
  box.innerHTML = '';
  LABS3D.forEach((lab, i) => {
    const r = estado.lab3d[lab.id];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'aba3d' + (lab.id === labAtual ? ' ativa' : '') + (r && r.ok ? ' feita' : '');
    b.innerHTML = `<span class="aba3d__n">${r && r.ok ? '✔' : i + 1}</span><span><b>${lab.titulo}</b><small>${lab.conceito}</small></span>`;
    b.addEventListener('click', () => { labAtual = lab.id; renderAbas(); renderPainel(); prepararCena(); });
    box.appendChild(b);
  });
}

function prepararCena() {
  const lab = LABS3D.find((l) => l.id === labAtual);
  q('#hud3d').textContent = `Lab ${LABS3D.indexOf(lab) + 1} · ${lab.titulo}`;
  if (!mundo) return;
  mundo.limpar();
  mundo.escreverConsole([], null, 'aguardando execução…');
  mundo.focar(lab.area);
}

function renderPainel() {
  const lab = LABS3D.find((l) => l.id === labAtual);
  const reg = registro(lab.id);
  const painel = q('#painel3d');
  painel.innerHTML = `
    <div class="cartao lab3d__cartao">
      <div class="questao__meta"><span class="questao__cat">${lab.conceito}</span><span class="selo ${reg.ok ? 'selo--ok' : 'selo--pend'}">${reg.ok ? '✔ concluído' : 'tentativas: ' + reg.tentativas}</span></div>
      <h3>${lab.titulo}</h3>
      <div class="lab__enunciado">${lab.enunciado}</div>

      <div class="passo"><span class="passo__n">1</span><h4>Preveja as saídas do console</h4></div>
      <p class="passo__txt">Leia o código e escreva o que o console <b>deve</b> mostrar quando estiver <b>correto</b>. Uma linha por campo, sem aspas.</p>
      <ol class="previsoes">
        ${lab.esperado.map((_, i) => `<li><input type="text" data-linha="${i}" value="${escapar(reg.previsao[i] || '')}" ${reg.travada ? 'disabled' : ''} placeholder="saída da linha ${i + 1}" spellcheck="false" aria-label="Previsão da linha ${i + 1}"></li>`).join('')}
      </ol>
      <div class="acoes-linha">
        ${reg.travada
          ? '<span class="trava">🔒 Previsão registrada</span><button type="button" class="btn btn--mini btn--fantasma" id="btnEditarPrev">Editar previsão</button>'
          : '<button type="button" class="btn btn--mini btn--primario" id="btnTravarPrev">🔒 Registrar previsão</button>'}
      </div>

      <div class="passo"><span class="passo__n">2</span><h4>Corrija o código e execute</h4></div>
      <textarea data-codigo spellcheck="false" aria-label="Código do laboratório"></textarea>
      <div class="acoes-linha">
        <button type="button" class="btn btn--mini btn--primario" id="btnExec3d" ${reg.travada ? '' : 'disabled title="Registre a previsão primeiro"'}>▶ Executar no 3D</button>
        <button type="button" class="btn btn--mini btn--fantasma" id="btnReset3d">Restaurar código</button>
      </div>
      ${reg.travada ? '' : '<p class="passo__txt passo__txt--alerta">Registre sua previsão para liberar a execução.</p>'}
      <details class="dica"><summary>Preciso de uma dica</summary><p>${lab.dica}</p></details>

      <div class="passo"><span class="passo__n">3</span><h4>Confira: previsão × saída real × esperado</h4></div>
      <div id="confere3d"><p class="passo__txt">Execute o código para ver a comparação.</p></div>
    </div>`;

  const ta = q('textarea', painel);
  const chave = 'l3d_' + lab.id;
  ta.value = estado.codigos[chave] ?? lab.starter;
  ta.addEventListener('input', () => { estado.codigos[chave] = ta.value; salvar(); });

  painel.querySelectorAll('.previsoes input').forEach((inp) => {
    inp.addEventListener('input', () => { reg.previsao[Number(inp.dataset.linha)] = inp.value; salvar(); });
  });
  const travar = q('#btnTravarPrev');
  if (travar) travar.addEventListener('click', () => {
    const vazias = lab.esperado.filter((_, i) => !(reg.previsao[i] || '').trim()).length;
    if (vazias) { aviso(`Preencha as ${vazias} linha(s) que faltam antes de registrar.`); return; }
    reg.travada = true; salvar(); renderPainel();
  });
  const editar = q('#btnEditarPrev');
  if (editar) editar.addEventListener('click', () => { reg.travada = false; salvar(); renderPainel(); });
  q('#btnReset3d').addEventListener('click', () => { ta.value = lab.starter; delete estado.codigos[chave]; salvar(); });
  q('#btnExec3d').addEventListener('click', () => executar(lab, ta.value));

  if (reg.saida && reg.ultimaExecucao) mostrarComparacao(lab, reg, reg.saida, reg.erro, []);
}

function aviso(msg) {
  const t = q('#toast');
  t.textContent = msg; t.classList.add('visivel');
  setTimeout(() => t.classList.remove('visivel'), 2400);
}

function executar(lab, codigo) {
  const reg = registro(lab.id);
  if (mundo) { mundo.limpar(); mundo.focar(lab.area); }
  const linhas = [], avisos = [];
  const fmt = (v) => (typeof v === 'string' ? v : v === undefined ? 'undefined' : typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v));
  const consoleFalso = { log: (...a) => linhas.push(a.map(fmt).join(' ')), error: (...a) => linhas.push(a.map(fmt).join(' ')), warn: (...a) => linhas.push(a.map(fmt).join(' ')) };
  let erro = null;
  try {
    new Function('console', 'cena', codigo)(consoleFalso, criarApi(avisos));
  } catch (e) {
    erro = e.name + ': ' + e.message;
  }
  if (mundo) { avisos.push(...mundo.avisos.splice(0)); mundo.escreverConsole(linhas, erro); }

  const codigoOk = !erro && linhas.length === lab.esperado.length && lab.esperado.every((e, i) => exata(linhas[i]) === e);
  reg.tentativas++;
  reg.saida = linhas;
  reg.erro = erro;
  reg.ultimaExecucao = new Date().toISOString();
  reg.acertosPrevisao = lab.esperado.filter((e, i) => solta(reg.previsao[i]) === solta(e)).length;
  if (codigoOk) reg.ok = true;
  salvar();
  renderAbas();
  q('.lab3d__cartao .selo').className = 'selo ' + (reg.ok ? 'selo--ok' : 'selo--pend');
  q('.lab3d__cartao .selo').textContent = reg.ok ? '✔ concluído' : 'tentativas: ' + reg.tentativas;
  mostrarComparacao(lab, reg, linhas, erro, avisos);
  if (window.innerWidth < 980) q('#palco3d').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function mostrarComparacao(lab, reg, linhas, erro, avisos) {
  const total = Math.max(lab.esperado.length, linhas.length);
  let codOk = 0, prevOk = 0;
  const linhasHtml = [];
  for (let i = 0; i < total; i++) {
    const esp = lab.esperado[i], real = linhas[i], prev = reg.previsao[i];
    const okReal = esp !== undefined && exata(real) === esp;
    const okPrev = esp !== undefined && solta(prev) === solta(esp);
    if (okReal) codOk++;
    if (okPrev) prevOk++;
    linhasHtml.push(`<tr>
      <td>${i + 1}</td>
      <td class="${okPrev ? 'c-ok' : 'c-erro'}">${prev ? escapar(prev) : '<i>—</i>'} ${esp !== undefined ? (okPrev ? '✔' : '✘') : ''}</td>
      <td class="${okReal ? 'c-ok' : 'c-erro'}">${real !== undefined ? escapar(real) : '<i>sem saída</i>'} ${okReal ? '✔' : '✘'}</td>
      <td>${esp !== undefined ? escapar(esp) : '<i>linha extra</i>'}</td>
    </tr>`);
  }
  const tudo = !erro && codOk === lab.esperado.length && linhas.length === lab.esperado.length;
  let diagnostico;
  if (tudo && prevOk === lab.esperado.length) diagnostico = '🏆 Perfeito: você previu tudo e o código está certo!';
  else if (tudo) diagnostico = '✅ Código corrigido! Compare as linhas em que sua previsão errou: é aí que está o que vale revisar.';
  else if (prevOk === lab.esperado.length) diagnostico = '🎯 Sua previsão está certa — agora faça o código produzir exatamente essa saída.';
  else diagnostico = '🔧 Ainda há diferenças. Olhe a cena 3D: ela mostra o que o seu código realmente fez.';

  q('#confere3d').innerHTML = `
    ${erro ? `<div class="console"><span class="err">${escapar(erro)}</span></div>` : ''}
    ${avisos.length ? `<ul class="avisos3d">${avisos.map((a) => `<li>⚠ ${escapar(a)}</li>`).join('')}</ul>` : ''}
    <div class="tabela-wrap"><table class="tabela tabela--confere">
      <thead><tr><th>#</th><th>Sua previsão</th><th>Saída real</th><th>Esperado</th></tr></thead>
      <tbody>${linhasHtml.join('')}</tbody>
    </table></div>
    <div class="placares3d">
      <span>Código: <b class="${tudo ? 'c-ok' : 'c-erro'}">${codOk}/${lab.esperado.length}</b></span>
      <span>Previsão: <b class="${prevOk === lab.esperado.length ? 'c-ok' : 'c-erro'}">${prevOk}/${lab.esperado.length}</b></span>
    </div>
    <p class="resumo-testes ${tudo ? 'ok' : 'falha'}">${diagnostico}</p>`;
}

q('#btnCamera3d').addEventListener('click', () => { if (mundo) mundo.focar(LABS3D.find((l) => l.id === labAtual).area); });
q('#btnTela3d').addEventListener('click', () => {
  const el = q('.palco');
  if (document.fullscreenElement) document.exitFullscreen();
  else if (el.requestFullscreen) el.requestFullscreen();
});

window.renderLab3d = () => { renderAbas(); renderPainel(); prepararCena(); };
window.__mundo3d = mundo; // útil para depurar no console (F12)
window.renderLab3d();
