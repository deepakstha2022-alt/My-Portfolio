/* =============================
   Secure Cyber Portfolio — JS
   Animations, typing, particles,
   scan-lines, scroll reveal, form
   ============================= */

(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // ----- Splash / Loading: "Access Granted" -----
  const splash = $('#splash');
  const accessLine = $('#splashAccess');
  const bar = $('#splashBar');

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  async function runSplash(){
    if(!splash) return;
    // Ensure bar starts from 0
    if(bar) bar.style.width = '0%';

    // Simulated init sequence
    await sleep(650);
    await sleep(900);

    const line = $('#splashLine');
    if(line){
      const phrases = [
        'Initializing Secure Connection...',
        'Verifying identity & handshake...',
        'Deploying terminal subsystems...',
        'Establishing encrypted channel...',
      ];
      let i = 0;
      for(const p of phrases){
        line.textContent = p;
        if(bar) bar.style.width = `${Math.min(100, (i+1)*25)}%`;
        i++;
        await sleep(520);
      }
    }

    await sleep(300);
    if(accessLine) accessLine.style.opacity = 1;

    await sleep(450);
    splash.classList.add('fade-out');
    splash.style.transition = 'opacity .55s ease, transform .55s ease';
    splash.style.opacity = '0';
    splash.style.transform = 'scale(1.02)';
    await sleep(600);
    splash.remove();
  }

  // ----- Scroll reveal -----
  const revealEls = $$('[data-reveal]');
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    }
  }, {threshold: 0.15});
  revealEls.forEach(el => io.observe(el));

  // ----- Typing animations -----
  function typeWriter(el, text, opts={}){
    const {
      speed=32,
      caret=true,
      onDone=()=>{}
    } = opts;

    if(!el) return;
    el.textContent = '';
    let i = 0;

    // Keep caret separately (already exists in HTML)
    const tick = ()=>{
      if(i >= text.length){
        onDone();
        return;
      }
      el.textContent += text.charAt(i);
      i++;
      setTimeout(tick, speed);
    };
    tick();
  }

  function applyTyping(){
    // Hero headings
    // We will rebuild them by extracting their text from aria-label
    const hero1 = $('#heroTyping');
    const hero1Label = hero1?.getAttribute('aria-label') || '';
    if(hero1Label){
      // First remove caret span
      const caret = hero1.querySelector('.typing-caret');
      if(caret) caret.remove();
      // Then type
      typeWriter(hero1, hero1Label.replace('█','').trim(), {speed: 26});
      // Restore caret after typing
      setTimeout(()=>{
        if(hero1){
          const c = document.createElement('span');
          c.className = 'typing-caret';
          c.textContent = '█';
          hero1.appendChild(c);
        }
      }, Math.max(600, hero1Label.length * 26));
    }

    const hero2 = $('#heroTyping2');
    const hero2Label = hero2?.getAttribute('aria-label') || '';
    if(hero2Label){
      const caret = hero2.querySelector('.typing-caret');
      if(caret) caret.remove();
      // type
      setTimeout(()=>{
        typeWriter(hero2, hero2Label.trim(), {speed: 20});
        setTimeout(()=>{
          if(hero2){
            const c = document.createElement('span');
            c.className = 'typing-caret';
            c.textContent = '█';
            hero2.appendChild(c);
          }
        }, Math.max(500, hero2Label.length * 20));
      }, 720);
    }
  }

  // ----- Terminal background typing + scan output -----
  const bgTerminalOut = $('#bgTerminalOut');
  const terminalOutput = $('#terminalOutput');

  const commands = [
    {prefix:'info', text:'Initializing lab environment...'},
    {prefix:'ok', text:'Module load: netmon.sys'},
    {prefix:'warn', text:'Firewall policy: default deny (simulated)'},
    {prefix:'info', text:'Probing hosts...'},
    {prefix:'ok', text:'Ports scanned: 20 (top) / 127.0.0.1 (simulated)'},
    {prefix:'ok', text:'Snort rules loaded: 12 (custom + baseline)'},
    {prefix:'info', text:'Logging to /var/log/secure (simulated)'},
    {prefix:'ok', text:'Session ready ✅'}
  ];

  function appendOut(container, line, cls){
    if(!container) return;
    const div = document.createElement('div');
    div.className = `out-line ${cls || ''}`.trim();
    div.textContent = line;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function runBgTerminal(){
    if(!bgTerminalOut) return;
    bgTerminalOut.innerHTML = '';
    let idx = 0;

    const loop = ()=>{
      if(idx < commands.length){
        const c = commands[idx];
        appendOut(bgTerminalOut, c.text, c.prefix);
        idx++;
        setTimeout(loop, 540);
      } else {
        // keep alive with small noise
        const noise = [
          'tcpdump: captured 14 packets',
          'IDS: alert threshold not reached',
          'syslog: forwarding enabled (sim)',
          'nmap: host seems up (sim)'
        ];
        setInterval(()=>{
          const n = noise[Math.floor(Math.random()*noise.length)];
          const c = Math.random() < .35 ? 'dim' : '';
          appendOut(bgTerminalOut, n, c);
        }, 5200);
      }
    };
    loop();
  }

  function runFrontTerminal(){
    if(!terminalOutput) return;
    terminalOutput.innerHTML = '';
    const script = [
      {t:'deepak@lab:~$ sudo ufw status', cls:'info'},
      {t:'Status: active (simulated)', cls:'ok'},
      {t:'deepak@lab:~$ sudo snort -T -c /etc/snort/snort.conf', cls:'info'},
      {t:'Snort test rules: PASS (simulated)', cls:'ok'},
      {t:'deepak@lab:~$ nmap -sV --top-ports 50 192.168.1.10', cls:'info'},
      {t:'Service enumeration completed (simulated)', cls:'ok'}
    ];

    let i = 0;
    const tick = ()=>{
      if(i >= script.length) return;
      const s = script[i];
      const line = document.createElement('div');
      line.className = `out-line ${s.cls||''}`;
      line.textContent = s.t;
      terminalOutput.appendChild(line);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
      i++;
      setTimeout(tick, 260);
    };

    setTimeout(tick, 750);
  }

  // ----- Particles canvas -----
  const particlesCanvas = $('#particles');
  function setupParticles(){
    if(!particlesCanvas) return;
    const ctx = particlesCanvas.getContext('2d');
    let w=0,h=0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let particles=[];
    const rand = (a,b)=> a + Math.random()*(b-a);

    function resize(){
      w = particlesCanvas.clientWidth;
      h = particlesCanvas.clientHeight;
      particlesCanvas.width = Math.floor(w*dpr);
      particlesCanvas.height = Math.floor(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      const count = Math.round(Math.min(130, Math.max(55, w/10)));
      particles = new Array(count).fill(0).map(()=>({
        x: rand(0,w),
        y: rand(0,h),
        r: rand(1.1,2.6),
        vx: rand(-0.28,0.28),
        vy: rand(-0.12,0.22),
        a: rand(0.25,0.85),
        hue: Math.random() < .5 ? 165 : 192
      }));
    }

    function draw(){
      ctx.clearRect(0,0,w,h);

      // connections
      for(let i=0;i<particles.length;i++){
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if(p.x< -20) p.x = w+20;
        if(p.x> w+20) p.x = -20;
        if(p.y< -20) p.y = h+20;
        if(p.y> h+20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(0,255,168,${0.22*p.a})`;
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(0,255,168,.25)';
        ctx.fill();

        for(let j=i+1;j<particles.length;j++){
          const q = particles[j];
          const dx = p.x-q.x;
          const dy = p.y-q.y;
          const dist = Math.hypot(dx,dy);
          if(dist < 150){
            const t = 1 - dist/150;
            ctx.lineWidth = 1;
            ctx.strokeStyle = `rgba(0,212,255,${0.22*t})`;
            ctx.beginPath();
            ctx.moveTo(p.x,p.y);
            ctx.lineTo(q.x,q.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize, {passive:true});
  }

  // ----- Matrix canvas (falling code) -----
  const matrixCanvas = $('#matrix');
  function setupMatrix(){
    if(!matrixCanvas) return;
    const ctx = matrixCanvas.getContext('2d');
    let w=0,h=0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    let cols=0;
    let drops=[];
    const fontSize = 14;

    function resize(){
      w = matrixCanvas.clientWidth;
      h = matrixCanvas.clientHeight;
      matrixCanvas.width = Math.floor(w*dpr);
      matrixCanvas.height = Math.floor(h*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);

      cols = Math.floor(w / fontSize);
      drops = new Array(cols).fill(0).map(()=>Math.floor(Math.random()*h/fontSize));
    }

    function draw(){
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(0,0,w,h);

      ctx.font = `${fontSize}px ${getComputedStyle(document.body).fontFamily.includes('Orbitron')?'Orbitron':'ui-monospace'}`;

      const chars = '01abcdef0123456789';
      for(let i=0;i<drops.length;i++){
        const text = chars[Math.floor(Math.random()*chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() < .06 ? 'rgba(0,255,168,0.95)' : 'rgba(0,255,168,0.55)';
        ctx.fillText(text, x, y);

        if(y > h && Math.random() > .975) drops[i] = 0;
        else drops[i] += 1;
      }

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize, {passive:true});
  }

  // ----- Floating bits in hero -----
  function initFloatingBits(){
    const wrap = $('#floatBits');
    if(!wrap) return;
    const bits = [
      '0101','1010','1100','0011','0110','1001','0x3F','0xA7','0xFF','root','admin','kali'
    ];
    const count = 10;
    const frag = document.createDocumentFragment();
    for(let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'bit';
      el.textContent = bits[Math.floor(Math.random()*bits.length)];
      el.style.left = `${Math.random()*70}%`;
      el.style.top = `${Math.random()*70}%`;
      el.style.animationDelay = `${Math.random()*2.4}s`;
      frag.appendChild(el);
    }
    wrap.appendChild(frag);
  }

  // ----- Heatmap (contribution-style) -----
  function buildHeatmap(){
    const heatmap = $('#heatmap');
    if(!heatmap) return;
    heatmap.innerHTML = '';
    const cells = 14*7; // 98
    // Create 98 cells as a contribution-like grid
    for(let i=0;i<cells;i++){
      const cell = document.createElement('div');
      cell.className = 'heat-cell';

      // Deterministic-ish pseudo intensity using i
      const r = (Math.sin(i*0.73)*0.5+0.5);
      const bump = (Math.cos(i*0.12)*0.5+0.5);
      const intensity = Math.min(1, (r*0.65 + bump*0.35));

      let level = 0;
      if(intensity > 0.82) level = 4;
      else if(intensity > 0.68) level = 3;
      else if(intensity > 0.52) level = 2;
      else if(intensity > 0.36) level = 1;

      const opacity = [0.06,0.12,0.18,0.28,0.42][level];
      cell.style.background = `rgba(0,212,255,${opacity})`;
      cell.style.borderColor = `rgba(0,255,168,${0.08 + level*0.06})`;
      cell.title = 'Learning activity (simulated)';

      heatmap.appendChild(cell);
    }
  }

  // ----- Animate skill bars widths -----
  function populateSkills(){
    const skills = {
      skillsNetworking: [
        ['TCP/IP', 92],['OSI Model', 82],['Subnetting', 78],['DHCP', 86],['VLANs', 80],['Inter-VLAN Routing', 74],['OSPF Basics', 68]
      ],
      skillsSys: [
        ['Linux', 86],['Windows Server 2022', 76],['Active Directory', 82],['Group Policy', 74],['DHCP Server', 78]
      ],
      skillsVirt: [
        ['VirtualBox', 72],['Virtual Lab Environments', 80]
      ],
      skillsSec: [
        ['ACLs', 78],['NAT', 68],['Network Segmentation', 74],['Port Security', 66],['UFW Firewall', 82]
      ],
      skillsTools: [
        ['Wireshark', 86],['Nmap', 84],['Syslog', 70],['Snort IDS', 80],['Traffic Analysis', 72],['Log Monitoring', 76]
      ]
    };

    const map = [
      {id:'skillsNetworking', list: skills.skillsNetworking},
      {id:'skillsSys', list: skills.skillsSys},
      {id:'skillsVirt', list: skills.skillsVirt},
      {id:'skillsSec', list: skills.skillsSec},
      {id:'skillsTools', list: skills.skillsTools},
    ];

    for(const group of map){
      const el = $('#'+group.id);
      if(!el) continue;
      el.innerHTML='';

      for(const [name,val] of group.list){
        const item = document.createElement('div');
        item.className='skill-item';

        const title = document.createElement('div');
        title.className='skill-name';
        title.innerHTML = `<span>${name}</span><span>${val}%</span>`;

        const barWrap = document.createElement('div');
        barWrap.className='bar-wrap';
        const bar = document.createElement('div');
        bar.className='bar';
        const i = document.createElement('i');
        i.style.width = '0%';
        bar.appendChild(i);
        barWrap.appendChild(bar);

        item.appendChild(title);
        item.appendChild(barWrap);
        el.appendChild(item);

        // animate on hover too (css) + initial fill
        setTimeout(()=>{ i.style.width = `${val}%`; }, 240);
      }
    }
  }

  // ----- Nav toggle -----
  function initNav(){
    const toggle = $('#navToggle');
    const links = $('#navLinks');
    if(!toggle || !links) return;
    toggle.addEventListener('click', ()=>{
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // close on click
    $$('#navLinks a').forEach(a=>{
      a.addEventListener('click', ()=>{
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    });
  }

  // ----- Sound toggle for typing effect (optional) -----
  function initSoundToggle(){
    const btn = $('#soundToggle');
    if(!btn) return;
    let enabled = false;

    // lightweight click sound using WebAudio (no external assets)
    function blip(){
      if(!enabled) return;
      try{
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = 620;
        g.gain.value = 0.04;
        o.connect(g); g.connect(ctx.destination);
        o.start();
        setTimeout(()=>{ o.stop(); ctx.close(); }, 55);
      }catch(e){}
    }

    btn.addEventListener('click', ()=>{
      enabled = !enabled;
      btn.querySelector('.sound-text')?.textContent && (btn.querySelector('.sound-text').textContent = enabled ? 'Sound: On' : 'Sound');
    });

    // Use for typing cursor by lightly listening (no heavy)
    const heroTyping = $('#heroTyping');
    if(heroTyping){
      const obs = new MutationObserver(()=>blip());
      obs.observe(heroTyping, {childList:true, characterData:true, subtree:true});
    }
  }

  // ----- Custom cursor & magnet effect -----
  function initCursor(){
    const cur = $('#cursor');
    const ring = $('#cursorRing');
    if(!cur || !ring) return;

    let tx=0,ty=0, rx=0,ry=0;
    const prefersCoarse = window.matchMedia('(pointer:coarse)').matches;
    if(prefersCoarse) return;

    window.addEventListener('mousemove', (e)=>{
      tx = e.clientX; ty = e.clientY;
      rx = e.clientX; ry = e.clientY;
      cur.style.left = `${tx}px`;
      cur.style.top = `${ty}px`;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
    }, {passive:true});
  }

  // ----- Particle-ish net lines (DOM) -----
  function initNetLines(){
    const wrap = $('#netLines');
    if(!wrap) return;
    const count = 10;
    const frag = document.createDocumentFragment();

    for(let i=0;i<count;i++){
      const line = document.createElement('div');
      line.style.position='absolute';
      line.style.left = `${Math.random()*100}%`;
      line.style.top = `${Math.random()*100}%`;
      line.style.width = `${rand(40,180)}px`;
      line.style.height = '2px';
      line.style.background = 'linear-gradient(90deg, rgba(0,212,255,0), rgba(0,212,255,.55), rgba(0,255,168,.35), rgba(0,212,255,0))';
      line.style.opacity = '0';
      line.style.filter = 'blur(.3px)';
      line.style.transform = 'translateY(-10px)';
      line.style.animation = `netPulse ${rand(1.2,2.6)}s ease-in-out infinite`;
      line.style.animationDelay = `${Math.random()*2.2}s`;
      frag.appendChild(line);
    }

    function rand(a,b){ return a + Math.random()*(b-a); }

    const styleId = 'netPulseStyle';
    if(!document.getElementById(styleId)){
      const st = document.createElement('style');
      st.id = styleId;
      st.textContent = `@keyframes netPulse{0%{opacity:0;transform:translateY(-10px)}30%{opacity:.55}60%{opacity:.18}100%{opacity:0;transform:translateY(18px)}}`;
      document.head.appendChild(st);
    }

    wrap.style.position='relative';
    wrap.style.overflow='hidden';
    wrap.appendChild(frag);
  }

  // ----- Project / contact scan line triggers -----
  function initProjectScan(){
    // already CSS hover scanline; nothing more
  }

  // ----- Contact form simulation -----
  function initContact(){
    const form = $('#contactForm');
    if(!form) return;

    const status = $('#formStatus');
    const cmd = $('#formCommand');
    const btn = $('#sendBtn');
    const spinner = btn?.querySelector('.btn-spinner');

    function setCmd(text){
      if(!cmd) return;
      cmd.textContent = text;
      cmd.style.opacity = 1;
      cmd.animate([{opacity:0, transform:'translateY(6px)'},{opacity:1, transform:'translateY(0)'}], {duration:220, easing:'ease-out'});
    }

    form.addEventListener('submit', async (e)=>{
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());
      const name = (data.name||'').toString().trim();
      const email = (data.email||'').toString().trim();
      const message = (data.message||'').toString().trim();

      status.textContent = '';
      if(spinner) spinner.style.display = 'inline-block';
      if(btn) btn.disabled = true;

      setCmd(`$ queue-message --to deepak --from ${name||'operator'} --email ${email||'unknown'} `);
      await sleep(520);
      setCmd(`$ encrypt --channel neon-cipher --mode sim `);
      await sleep(520);
      setCmd(`$ send --destination contact/terminal `);
      await sleep(720);

      const success = Math.random() < 0.92;
      if(success){
        status.textContent = 'Message queued successfully. (Simulated)';
        status.style.color = 'rgba(0,255,168,.95)';
      } else {
        status.textContent = 'Queue overflow. Retry in a moment. (Simulated)';
        status.style.color = 'rgba(255,209,102,.95)';
      }

      await sleep(1200);
      if(spinner) spinner.style.display = 'none';
      if(btn) btn.disabled = false;

      form.reset();
      setCmd('');
    });
  }

  // ----- Animations: count stats -----
  function animateStats(){
    // animate stat-num values from 0 to their data-count (stored in HTML)
    const statNums = $$('[data-count]');
    for(const el of statNums){
      const target = parseInt(el.getAttribute('data-count')||'0',10);
      el.textContent = '0';

      const start = performance.now();
      const dur = 850;
      const run = (now)=>{
        const t = Math.min(1, (now-start)/dur);
        const v = Math.round(target * (1 - Math.pow(1-t, 3)));
        el.textContent = String(v);
        if(t<1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }
  }

  // ----- Make cursor magnet-ish for buttons -----
  function initButtonMagnet(){
    const buttons = $$('.btn, .soc, .nav-links a');
    buttons.forEach(b=>{
      b.addEventListener('mousemove', (e)=>{
        const rect = b.getBoundingClientRect();
        const mx = ((e.clientX - rect.left) / rect.width) * 100;
        const my = ((e.clientY - rect.top) / rect.height) * 100;
        b.style.setProperty('--mx', `${mx}%`);
        b.style.setProperty('--my', `${my}%`);
      }, {passive:true});
      b.addEventListener('mouseleave', ()=>{
        b.style.setProperty('--mx','50%');
        b.style.setProperty('--my','50%');
      });
    });
  }

  // ----- Init all -----
  document.addEventListener('DOMContentLoaded', ()=>{
    // Set year
    const year = $('#year');
    if(year) year.textContent = new Date().getFullYear();

    // splash then main animations
    runSplash().then(()=>{
      applyTyping();
      runBgTerminal();
      runFrontTerminal();
      populateSkills();
      buildHeatmap();
      initFloatingBits();
      animateStats();

      initNav();
      initSoundToggle();
      initCursor();
      initNetLines();
      initProjectScan();
      initButtonMagnet();
      initContact();

      setupParticles();
      setupMatrix();
    }).catch(()=>{
      // fallback
      applyTyping();
      populateSkills();
      buildHeatmap();
      animateStats();
      initNav();
      initContact();
      setupParticles();
      setupMatrix();
      runBgTerminal();
      runFrontTerminal();
      initFloatingBits();
      initCursor();
      initNetLines();
      initButtonMagnet();
      initSoundToggle();
    });
  });

})();

