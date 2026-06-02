// ========== DOB CONFIG ==========
const CORRECT_DOB = { day: '03', month: '06', year: '2005' };
let dobInput = '';
let bgMusic = null;
let musicStarted = false;

// ========== WEB AUDIO BIRTHDAY TUNE ==========
function createBirthdayMusic() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  // Happy Birthday notes: C C D C F E | C C D C G F | C C C5 A F E D | Bb Bb A F G F
  const notes = [
    261.63, 261.63, 293.66, 261.63, 349.23, 329.63, // Happy Birth-day to you
    0,
    261.63, 261.63, 293.66, 261.63, 392.00, 349.23, // Happy Birth-day to you
    0,
    261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66, // Happy Birth-day dear Aastha
    0,
    466.16, 466.16, 440.00, 349.23, 392.00, 349.23  // Happy Birth-day to you
  ];
  const durations = [
    0.3,0.1,0.4,0.4,0.4,0.8,
    0.3,
    0.3,0.1,0.4,0.4,0.4,0.8,
    0.3,
    0.3,0.1,0.4,0.4,0.4,0.4,0.8,
    0.3,
    0.3,0.1,0.4,0.4,0.4,0.9
  ];

  function playTune(startTime) {
    let t = startTime;
    notes.forEach((freq, i) => {
      if (freq === 0) { t += durations[i]; return; }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
      gain.gain.linearRampToValueAtTime(0.25, t + durations[i] - 0.05);
      gain.gain.linearRampToValueAtTime(0, t + durations[i]);
      osc.start(t);
      osc.stop(t + durations[i]);
      t += durations[i];
    });
    return t - startTime;
  }

  const totalDuration = playTune(ctx.currentTime + 0.1);
  // Loop it
  setTimeout(() => {
    if (musicStarted) playTune(ctx.currentTime + 0.1);
  }, (totalDuration + 0.5) * 1000);

  bgMusic = ctx;
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  createBirthdayMusic();
}

// ========== KEYBOARD BUILD ==========
function buildKeyboard() {
  const grid = document.getElementById('keyboard');
  const nums = ['1','2','3','4','5','6','7','8','9','','0',''];
  nums.forEach((n) => {
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    if (n === '') {
      btn.style.visibility = 'hidden';
    } else {
      btn.textContent = n;
      btn.onclick = () => addDigit(n);
    }
    grid.appendChild(btn);
  });
}

function addDigit(d) {
  if (dobInput.length >= 8) return;
  dobInput += d;
  updateDobDisplay();
  hideWrong();
}

function clearDob() {
  dobInput = '';
  updateDobDisplay();
  hideWrong();
}

function updateDobDisplay() {
  const el = document.getElementById('dob-display-text');
  let raw = dobInput.padEnd(8, '_');
  let day = raw.slice(0,2);
  let mon = raw.slice(2,4);
  let yr  = raw.slice(4,8);
  el.textContent = `${day} / ${mon} / ${yr}`;
}

function checkDob() {
  if (dobInput.length < 8) { showWrong(); return; }
  const day  = dobInput.slice(0,2);
  const mon  = dobInput.slice(2,4);
  const year = dobInput.slice(4,8);
  if (day === CORRECT_DOB.day && mon === CORRECT_DOB.month && year === CORRECT_DOB.year) {
    startMusic();
    goToScreen(2);
  } else {
    showWrong();
    shakeDob();
  }
}

function showWrong() { document.getElementById('wrongMsg').classList.add('show'); }
function hideWrong() { document.getElementById('wrongMsg').classList.remove('show'); }

function shakeDob() {
  const disp = document.querySelector('.dob-display');
  disp.style.transform = 'translateX(-8px)';
  setTimeout(() => disp.style.transform = 'translateX(8px)', 80);
  setTimeout(() => disp.style.transform = 'translateX(-6px)', 160);
  setTimeout(() => disp.style.transform = 'translateX(6px)', 240);
  setTimeout(() => disp.style.transform = 'translateX(0)', 320);
}

// ========== SCREEN NAVIGATION ==========
function goToScreen(num) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const next = document.getElementById('screen' + num);
  next.style.display = 'flex';
  next.classList.add('active');
  setTimeout(() => {
    const inner = next.querySelector('[class*="-content"], .wish-container, .countdown-wrap, .final-msg, .rawr-card');
    if (inner) { inner.style.animation = 'none'; inner.offsetHeight; inner.style.animation = 'slideUp 0.6s ease'; }
  }, 10);
  if (num === 5) startCountdown();
  if (num === 6) startFinalExplosion();
}

// ========== COUNTDOWN ==========
function startCountdown() {
  let count = 3;
  const numEl = document.getElementById('countdownNum');
  const subEl = document.getElementById('countdownSub');
  const labels = ['', 'Make a wish... 🕯️', '...almost there... ✨', 'Get ready... 🎂'];

  function tick() {
    numEl.style.animation = 'none';
    numEl.offsetHeight;
    numEl.style.animation = 'pulseNum 1s ease infinite';
    numEl.textContent = count;
    subEl.textContent = labels[count] || 'Make a wish! 🕯️';
    if (count > 0) {
      count--;
      setTimeout(tick, 1200);
    } else {
      numEl.textContent = '🎂';
      numEl.style.fontSize = '8rem';
      subEl.textContent = '✨ MAKE A WISH! ✨';
      setTimeout(() => goToScreen(6), 1800);
    }
  }
  setTimeout(tick, 400);
}

// ========== FINAL EXPLOSION ==========
function startFinalExplosion() {
  launchConfetti();
  launchHearts();
  launchEmojiRain();
}

function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  const colors = ['#ff6b9d','#ffd700','#c77dff','#ff4d8d','#fff','#ff9ecb','#ffe066'];
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (6 + Math.random() * 10) + 'px';
      piece.style.height = (6 + Math.random() * 10) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (2 + Math.random() * 3) + 's';
      piece.style.animationDelay = (Math.random() * 2) + 's';
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 6000);
    }, i * 25);
  }
}

function launchHearts() {
  const container = document.getElementById('heartsFloat');
  const emojis = ['💕','💖','💗','💓','❤️','🩷','💝'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'heart-item';
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      heart.style.left = Math.random() * 100 + 'vw';
      heart.style.animationDuration = (4 + Math.random() * 4) + 's';
      heart.style.animationDelay = (Math.random() * 3) + 's';
      heart.style.fontSize = (1 + Math.random() * 2) + 'rem';
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 10000);
    }, i * 300);
  }
  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'heart-item';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (4 + Math.random() * 4) + 's';
    heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 9000);
  }, 600);
}

function launchEmojiRain() {
  const container = document.getElementById('emojiRain');
  const emojis = ['🎉','🎊','🎂','🌸','✨','🥳','🎁','💫','⭐','🌟','🎈'];
  function drop() {
    const el = document.createElement('div');
    el.className = 'emoji-drop';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (3 + Math.random() * 3) + 's';
    el.style.fontSize = (1.2 + Math.random() * 1.5) + 'rem';
    container.appendChild(el);
    setTimeout(() => el.remove(), 7000);
  }
  for (let i = 0; i < 30; i++) setTimeout(drop, i * 150);
  setInterval(drop, 400);
}

// ========== PARTICLES ==========
function createParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const colors = ['#ff6b9d','#c77dff','#ffd700','#ff9ecb','rgba(255,255,255,0.6)'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 4 + Math.random() * 8;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    p.style.animationDelay = (Math.random() * 6) + 's';
    container.appendChild(p);
  }
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  buildKeyboard();
  createParticles('particles1');
  const s1 = document.getElementById('screen1');
  s1.style.display = 'flex';
  s1.classList.add('active');
});