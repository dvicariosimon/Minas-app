// app.js — versión remota para el loader
// Debe definir window.__mines_boot(root)

(function(){
  // 1) Inyecta CSS necesario
  const CSS = `
    :root{
      --bg:#0f1220;--card:#171a2b;--muted:#8b93b0;--text:#e7eafa;--accent:#6ee7b7;--warn:#facc15;--danger:#f87171;--safe:#1f2937;--border:#242842;
    }
    *{box-sizing:border-box}
    body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial; background:linear-gradient(180deg,#0e1020,#0b0d1a 40%);color:var(--text);} 
    .container{max-width:1080px;margin:24px auto;padding:16px}
    .app{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.35)}
    header{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.02);backdrop-filter:blur(6px)}
    header h1{font-size:18px;margin:0;letter-spacing:0.3px}
    header .pill{font-size:12px;color:#0b1320;background:var(--accent);padding:6px 10px;border-radius:999px;font-weight:700}
    .wrap{display:grid;grid-template-columns:380px 1fr;gap:16px;padding:16px}
    @media (max-width: 900px){.wrap{grid-template-columns:1fr}}
    .card{background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:14px;padding:14px}
    .card h2{margin:0 0 8px 0;font-size:16px;color:#cfd5ff}
    .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .row + .row{margin-top:10px}
    label{font-size:12px;color:var(--muted)}
    input[type="number"], input[type="text"]{width:100%;padding:10px 12px;background:#0c1022;border:1px solid var(--border);border-radius:10px;color:var(--text);outline:none}
    input[type="range"]{width:100%}
    .btn{appearance:none;border:1px solid var(--border);background:#0d132a;color:#fff;padding:10px 14px;border-radius:12px;font-weight:600;cursor:pointer;transition:.2s transform,.2s background}
    .btn:hover{transform:translateY(-1px);background:#101737}
    .btn.primary{background:var(--accent);color:#08111a;border:none}
    .btn.danger{background:#2a0f13;border-color:#681d24;color:#ffdada}
    .btn.warning{background:#2a210f;border-color:#5a1a1a;color:#fff1c2}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .stat{background:#0c1022;border:1px solid var(--border);padding:10px;border-radius:12px}
    .stat .v{font-size:18px;font-weight:700}
    .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;user-select:none}
    .cell{position:relative;aspect-ratio:1/1;border-radius:12px;border:1px solid var(--border);display:grid;place-items:center;background:#0c1022;font-weight:700;letter-spacing:0.4px;cursor:pointer;transition:.15s transform,.15s background}
    .cell:hover{transform:translateY(-1px)}
    .cell.revealed.safe{background:#0f1a2e}
    .cell.revealed.mine{background:#2a0f13;border-color:#5a1a21}
    .cell.disabled{opacity:.5;cursor:not-allowed}
    .badge{position:absolute;inset:auto 8px 8px auto;font-size:10px;color:#0c1220;background:#c7d2fe;border-radius:999px;padding:3px 6px;font-weight:800}
    .msg{margin-top:10px;color:var(--muted);font-size:13px;min-height:20px}
    .sep{height:1px;background:var(--border);margin:14px 0}
    footer{padding:12px 16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:12px}
    .radio{display:flex;gap:10px;align-items:center}
    .radio input{accent-color:#93c5fd}
    @media (hover:hover){ .cell:hover{ transform:translateY(-1px) } }
    @media (hover:none){ .cell:hover{ transform:none } }
    .cell{ touch-action:manipulation }
    @media (max-width: 600px){
      header h1{font-size:16px}
      .wrap{grid-template-columns:1fr}
      .grid{gap:6px}
      .cell{border-radius:14px}
      .card{padding:12px}
      .btn{width:100%}
      .stats{grid-template-columns:1fr}
    }
    body.compact .grid{gap:4px}
    body.compact .cell{border-radius:10px}
    body.compact .badge{display:none}
    body.compact .card{padding:10px}
    #resetBalance{ display:none !important; }
  `;
  function injectCSSOnce(){
    if (document.getElementById('__mines_css')) return;
    const style = document.createElement('style');
    style.id = '__mines_css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // 2) HTML interno (solo el contenido del <body>)
  const HTML = `
  <div class="container">
    <div class="app">
      <header>
        <h1>Minas anti ludopatas <span class="pill">Web</span></h1>
        <button type="button" id="resetBalance" class="btn danger" hidden aria-hidden="true" tabindex="-1">Reset saldo</button>
      </header>
      <div class="wrap">
        <div class="card">
          <h2>Controles</h2>
          <div class="row">
            <div style="flex:1">
              <label>Saldo</label>
              <div class="stats">
                <div class="stat"><div class="v" id="balance">$ 0.00</div><div class="k">Saldo</div></div>
                <div class="stat"><div class="v" id="potential">$ 0.00</div><div class="k">Cashout posible</div></div>
                <div class="stat"><div class="v" id="mult">x1.0000</div><div class="k">Multiplicador</div></div>
              </div>
            </div>
          </div>
          <div class="row">
            <div style="flex:1;min-width:160px">
              <label>Apuesta</label>
              <input id="bet" type="number" min="0.01" step="0.01" value="10" />
            </div>
            <div style="width:120px">
              <label>Minas</label>
              <input id="mines" type="number" min="1" max="24" value="3" />
            </div>
            <div style="width:120px">
              <label>House Edge (%) — fijo</label>
              <input id="edge" type="number" value="2" disabled aria-disabled="true" title="Fijo al 2%" />
            </div>
          </div>
          <div class="row">
            <button type="button" id="newGame" class="btn primary">Apostar $ 10.00</button>
            <button type="button" id="cashout" class="btn warning">Cobrar (Cashout)</button>
          </div>
          <div class="sep"></div>
          <div class="row">
            <div class="radio"><input type="checkbox" id="showCoords" checked><label for="showCoords">Mostrar coordenadas</label></div>
            <div class="radio"><input type="checkbox" id="confirmClicks" checked><label for="confirmClicks">Confirmar cashout</label></div>
            <div class="radio"><input type="checkbox" id="compactMode"><label for="compactMode">Modo compacto (móvil)</label></div>
            <div class="radio"><input type="checkbox" id="haptics" checked><label for="haptics">Vibración al revelar</label></div>
          </div>
          <div class="msg" id="message"></div>
        </div>
        <div class="card">
          <h2>Tablero 5×5</h2>
          <div id="board" class="grid" aria-label="Tablero"></div>
        </div>
      </div>
      <footer>
        <div>Tip: puedes usar el teclado (A–E,1–5) para revelar una celda, por ejemplo: <b>A1</b>, <b>C3</b>.</div>
        <div id="verTag" style="user-select:none;cursor:default">v2.1 (remoto)</div>
      </footer>
    </div>
  </div>
  <template id="cellTemplate">
    <button class="cell" data-r="0" data-c="0" aria-label="Celda"></button>
  </template>
  `;

  // 3) Lógica del juego (idéntica a tu v2.1 local)
  function bootGame(){
    const GRID_SIZE = 5;
    const els = {
      board: document.getElementById('board'),
      balance: document.getElementById('balance'),
      potential: document.getElementById('potential'),
      mult: document.getElementById('mult'),
      bet: document.getElementById('bet'),
      mines: document.getElementById('mines'),
      edge: document.getElementById('edge'),
      newGame: document.getElementById('newGame'),
      cashout: document.getElementById('cashout'),
      message: document.getElementById('message'),
      showCoords: document.getElementById('showCoords'),
      confirmClicks: document.getElementById('confirmClicks'),
      resetBalance: document.getElementById('resetBalance'),
      compactMode: document.getElementById('compactMode'),
      haptics: document.getElementById('haptics'),
      verTag: document.getElementById('verTag'),
    };

    const state = {
      balance: 100.00,
      bet: 10.00,
      mines: 3,
      edge: 0.02,
      revealed: new Set(),
      mineCells: new Set(),
      finished: true,
      busted: false,
    };

    const LS_KEY = 'mines_apuestas_balance_v1';
    const LS_PREFS = 'mines_apuestas_prefs_v1';
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch {}
    if (saved != null && !isNaN(parseFloat(saved))) state.balance = parseFloat(saved);
    else { state.balance = 100.00; try { localStorage.setItem(LS_KEY, String(state.balance.toFixed(2))); } catch {} }

    function saveBalance(){ try{ localStorage.setItem(LS_KEY, String(state.balance.toFixed(2))); }catch{} }
    function savePrefs(){ try{ localStorage.setItem(LS_PREFS, JSON.stringify({
      showCoords: els.showCoords.checked,
      confirm: els.confirmClicks.checked,
      compact: els.compactMode.checked,
      haptics: els.haptics.checked
    })); }catch{} }

    function indexToCoord(r,c){ return String.fromCharCode('A'.charCodeAt(0)+c) + (r+1); }
    function coordToIndex(coord){
      const t = String(coord||'').trim().toUpperCase();
      if (t.length < 2) throw new Error('Coordenada inválida');
      const col = t.charCodeAt(0)-'A'.charCodeAt(0);
      const row = parseInt(t.slice(1),10)-1;
      if (isNaN(row)||row<0||row>=GRID_SIZE||col<0||col>=GRID_SIZE) throw new Error('Coordenada fuera de rango');
      return [row,col];
    }
    function fairMultiplierAfterXPicks(totalCells, mines, x, houseEdge){
      const N = totalCells; const S = N - mines; if (x<0||x>S) return 0;
      let prod = 1.0; for (let i=0;i<x;i++){ prod *= (N - i) / (S - i); }
      return prod * (1.0 - houseEdge);
    }
    function formatMoney(n){ return `$ ${Number(n).toFixed(2)}`; }

    function updateHUD(){
      const x = state.revealed.size;
      const mult = fairMultiplierAfterXPicks(GRID_SIZE*GRID_SIZE, state.mines, x, state.edge);
      els.mult.textContent = `x${mult.toFixed(4)}`;
      const potential = (state.finished?0:(state.bet * mult));
      els.potential.textContent = formatMoney(potential);
      els.balance.textContent = formatMoney(state.balance);

      const betVal = parseFloat(els.bet.value);
      const betSafe = isNaN(betVal) ? 0 : Math.max(0, betVal);
      els.bet.value = isNaN(betVal) ? '' : betSafe.toFixed(2);
      els.mines.value = state.mines;
      els.edge.value = (state.edge*100).toFixed(1);

      if (!state.finished && !state.busted) {
        els.cashout.textContent = `Cobrar ${formatMoney(potential)}`;
        els.cashout.setAttribute('aria-label', `Cobrar ${formatMoney(potential)}`);
      } else {
        els.cashout.textContent = 'Cobrar (Cashout)';
        els.cashout.setAttribute('aria-label', 'Cobrar (Cashout)');
      }

      els.newGame.textContent = `Apostar ${formatMoney(betSafe)}`;
      const betValid = (betSafe > 0 && betSafe <= state.balance) && state.finished;
      els.newGame.disabled = !betValid;
      els.newGame.setAttribute('aria-disabled', String(!betValid));
    }

    function buildBoard(){
      els.board.innerHTML = '';
      for (let r=0;r<GRID_SIZE;r++){
        for (let c=0;c<GRID_SIZE;c++){
          const btn = document.getElementById('cellTemplate').content.firstElementChild.cloneNode(true);
          btn.dataset.r = String(r); btn.dataset.c = String(c);
          btn.addEventListener('click',()=>onCellClick(r,c));
          els.board.appendChild(btn);
        }
      }
      paintBoard();
    }
    function paintBoard(revealAll=false){
      const children = els.board.children;
      for (let i=0;i<children.length;i++){
        const btn = children[i];
        const r = parseInt(btn.dataset.r,10); const c = parseInt(btn.dataset.c,10);
        const key = `${r},${c}`;
        btn.className = 'cell';
        btn.disabled = state.finished || state.busted || state.revealed.has(key);
        if (state.revealed.has(key)){
          const isMine = state.mineCells.has(key);
          btn.classList.add('revealed', isMine? 'mine':'safe');
          btn.textContent = isMine? '💥':'💎';
        } else {
          btn.textContent = '';
          if (revealAll && state.mineCells.has(key)) btn.textContent = '💣';
        }
        if (els.showCoords.checked){
          const lab = indexToCoord(r,c);
          const badge = document.createElement('div');
          badge.className='badge'; badge.textContent = lab;
          btn.appendChild(badge);
        }
      }
    }
    function message(txt, type='info'){
      els.message.textContent = txt;
      if (type==='error') els.message.style.color = 'var(--danger)';
      else if (type==='warn') els.message.style.color = 'var(--warn)';
      else els.message.style.color = 'var(--muted)';
    }
    function haptic(kind){
      if (!els.haptics.checked) return;
      if (!('vibrate' in navigator)) return;
      if (kind==='mine') navigator.vibrate([80,30,80]);
      else if (kind==='safe') navigator.vibrate(20);
      else if (kind==='cash') navigator.vibrate([30,30,60]);
    }
    function randomMines(count){
      const positions = [];
      for (let r=0;r<GRID_SIZE;r++) for (let c=0;c<GRID_SIZE;c++) positions.push([r,c]);
      for (let i=positions.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [positions[i],positions[j]]=[positions[j],positions[i]];
      }
      const set = new Set();
      for (let i=0;i<count;i++){ const [r,c]=positions[i]; set.add(`${r},${c}`);} 
      return set;
    }

    function newGame(){
      if (!state.finished) { message('Ya hay una partida activa. Cobra o finaliza antes de iniciar otra.', 'warn'); return; }
      const raw = els.bet.value;
      const bet = parseFloat(String(raw).replace(',','.'));
      const mines = parseInt(els.mines.value,10);
      if (!(bet>0)) return message('La apuesta debe ser mayor que 0', 'error');
      if (bet>state.balance) return message('Saldo insuficiente para esa apuesta', 'error');
      if (!(mines>=1 && mines <= (GRID_SIZE*GRID_SIZE-1))) return message('Número de minas inválido', 'error');
      state.bet = parseFloat(bet.toFixed(2));
      state.mines = mines;
      state.edge = 0.02;
      state.balance = +(state.balance - state.bet).toFixed(2);
      saveBalance();

      state.revealed = new Set();
      state.mineCells = randomMines(state.mines);
      state.finished = false; state.busted = false;
      message('Partida iniciada. Haz clic en una casilla para revelar.');
      updateHUD();
      paintBoard();
    }
    function reveal(r,c){
      if (state.finished) return;
      const key = `${r},${c}`; if (state.revealed.has(key)) return;
      state.revealed.add(key);
      if (state.mineCells.has(key)){
        state.busted = true; state.finished = true;
        paintBoard(true);
        message(`💥 Bomba en ${indexToCoord(r,c)}. Perdiste la apuesta.`, 'error');
        haptic('mine');
      } else {
        paintBoard();
        const leftSafe = GRID_SIZE*GRID_SIZE - state.mines - state.revealed.size;
        const leftTotal = GRID_SIZE*GRID_SIZE - state.revealed.size;
        message(`💎 Seguro en ${indexToCoord(r,c)}. Seguros restantes: ${leftSafe}. Celdas restantes: ${leftTotal}.`);
        haptic('safe');
      }
      updateHUD();
    }
    function onCellClick(r,c){ reveal(r,c); }
    function cashout(){
      if (state.finished) return;
      const x = state.revealed.size;
      const mult = fairMultiplierAfterXPicks(GRID_SIZE*GRID_SIZE, state.mines, x, state.edge);
      const winnings = +(state.bet * mult).toFixed(2);
      const okConfirm = !els.confirmClicks.checked || window.confirm(`Cobrar ${formatMoney(winnings)}?`);
      if (!okConfirm) return;
      state.finished = true;
      state.balance = +(state.balance + winnings).toFixed(2);
      saveBalance();
      paintBoard(true);
      message(`💸 ¡Cobraste ${formatMoney(winnings)}!`);
      haptic('cash');
      updateHUD();
    }

    // Teclado: coordenadas y cashout
    let keyBuffer = '';
    window.addEventListener('keydown', (e)=>{
      if (state.finished) return;
      const k = e.key.toUpperCase();
      if (k>='A' && k<='Z'){ keyBuffer = k; return; }
      if (/[0-9]/.test(k) && keyBuffer){
        keyBuffer += k;
        try { const [r,c] = coordToIndex(keyBuffer); reveal(r,c); keyBuffer=''; } catch {}
      }
      if (k==='ENTER') cashout();
    });

    // Listeners
    els.newGame.addEventListener('click', (e)=>{ e.preventDefault(); newGame(); });
    ['input','change','keyup'].forEach(evt=>{ els.bet.addEventListener(evt, ()=>{ updateHUD(); }); });
    els.cashout.addEventListener('click', (e)=>{
      e.preventDefault();
      if (state.finished){ message('No puedes cobrar: no hay una partida activa.', 'warn'); return; }
      if (state.busted){ message('No puedes cobrar: la partida ya explotó.', 'warn'); return; }
      cashout();
    });
    els.showCoords.addEventListener('change', ()=>{ savePrefs(); paintBoard(); });
    els.confirmClicks.addEventListener('change', ()=> savePrefs());
    els.compactMode.addEventListener('change', ()=>{ document.body.classList.toggle('compact', !!els.compactMode.checked); savePrefs(); paintBoard(); });
    els.haptics.addEventListener('change', ()=> savePrefs());

    // Atajo oculto a $100 (Ctrl/Cmd + Shift + L)
    window.addEventListener('keydown', (e)=>{
      const isModifier = (e.ctrlKey || e.metaKey) && e.shiftKey;
      const isKey = e.key && (e.key.toLowerCase() === 'l');
      if (!isModifier || !isKey) return;
      if (!state.finished) return;
      e.preventDefault();
      const phrase = window.prompt('Passphrase:');
      if (phrase !== 'coquina') return;
      state.balance = 100.00;
      saveBalance();
      updateHUD();
    });

    // Triple tap secreto en versión (ajuste de saldo)
    function normalizeAmount(input){
      if (input == null) return null;
      let s = String(input).trim();
      if (!s) return null;
      s = s.split(' ').join('');
      s = s.replace(',', '.');
      const n = parseFloat(s);
      if (!isFinite(n)) return null;
      return Math.max(0, Math.min(1000000, n));
    }
    const tapTimes = [];
    if (els.verTag){
      els.verTag.addEventListener('click', ()=>{
        const now = Date.now();
        while (tapTimes.length && now - tapTimes[0] > 1500) tapTimes.shift();
        tapTimes.push(now);
        if (tapTimes.length >= 3){
          tapTimes.length = 0;
          if (!state.finished) return;
          const phrase = window.prompt('Passphrase:');
          if (phrase !== 'coquina') return;
          const quick = window.confirm('¿Poner saldo a $100.00 ahora?');
          if (quick) {
            state.balance = 100.00; saveBalance(); updateHUD(); return;
          }
          const amtStr = window.prompt('Nuevo saldo (0 - 1000000):');
          const amt = normalizeAmount(amtStr);
          if (amt == null) return;
          state.balance = +amt.toFixed(2);
          saveBalance();
          updateHUD();
        }
      });
    }

    // Prefs
    try{
      const prefs = JSON.parse(localStorage.getItem(LS_PREFS)||'{}');
      if (typeof prefs.showCoords === 'boolean') els.showCoords.checked = prefs.showCoords;
      if (typeof prefs.confirm === 'boolean') els.confirmClicks.checked = prefs.confirm;
      if (typeof prefs.compact === 'boolean') els.compactMode.checked = prefs.compact;
      if (typeof prefs.haptics === 'boolean') els.haptics.checked = prefs.haptics;
    }catch{}
    document.body.classList.toggle('compact', !!els.compactMode.checked);

    // Init
    buildBoard();
    updateHUD();
    message('Configura tu apuesta y pulsa “Nueva partida”.');

    // Mini-tests
    try {
      for (let r=0;r<5;r++){ for (let c=0;c<5;c++){ const rc = indexToCoord(r,c); const [rr,cc] = coordToIndex(rc); if (rr!==r||cc!==c) throw new Error('roundtrip');}}
      const vals=[]; for(let x=0;x<=22;x++){ vals.push(fairMultiplierAfterXPicks(25,3,x,0.02)); }
      for (let i=0;i<vals.length-1;i++){ if (!(vals[i+1]>vals[i])) throw new Error('mono'); }
    } catch (e){ console.warn('[Mines Remoto] selftests:', e); }
  } // bootGame

  // 4) Punto de entrada para el loader
  window.__mines_boot = function(root){
    injectCSSOnce();
    // Limpiar el root y montar HTML
    root.innerHTML = HTML;
    // Arrancar la app
    bootGame();
  };
})();
