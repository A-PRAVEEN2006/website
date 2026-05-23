// --- Butterfly & Yellow Spider Simulation ---
let butterflies = [];
let yellowSpider = {
    x: window.innerWidth * 0.3,
    y: window.innerHeight * 0.4,
    target: null,
    el: null,
    speed: 3.5,
    state: 'HUNTING', // HUNTING, POUNCING, EATING, PAUSED
    eatingTimer: 0,
    scurryTimer: 0,
    scurryPhase: 'RUNNING' // RUNNING, PAUSED
};

let roamingInsects = [];
let isBurningState = false;

export const setIsBurning = (val) => {
    isBurningState = val;
};
export const getIsBurning = () => {
    return isBurningState;
};

// --- Roaming Insects SVGs ---
const getCentipedeSVG = () => `
  <svg viewBox="0 0 40 120" width="35" height="100">
    <path d="M15,20 Q5,15 2,22 M15,35 Q5,30 2,37 M15,50 Q5,45 2,52 M15,65 Q5,60 2,67 M15,80 Q5,75 2,82 M15,95 Q5,90 2,97" stroke="#e58a27" stroke-width="2.5" fill="none" class="leg-wiggle-1" />
    <path d="M25,20 Q35,15 38,22 M25,35 Q35,30 38,37 M25,50 Q35,45 38,52 M25,65 Q35,60 38,67 M25,80 Q35,75 38,82 M25,95 Q35,90 38,97" stroke="#e58a27" stroke-width="2.5" fill="none" class="leg-wiggle-2" />
    <ellipse cx="20" cy="15" rx="6" ry="8" fill="#782307" stroke="#4e1502" stroke-width="1.2" />
    <circle cx="20" cy="28" r="6" fill="#8e2f0d" stroke="#4e1502" stroke-width="1.2" />
    <circle cx="20" cy="40" r="6" fill="#8e2f0d" stroke="#4e1502" stroke-width="1.2" />
    <circle cx="20" cy="52" r="6" fill="#8e2f0d" stroke="#4e1502" stroke-width="1.2" />
    <circle cx="20" cy="64" r="6" fill="#8e2f0d" stroke="#4e1502" stroke-width="1.2" />
    <circle cx="20" cy="76" r="6" fill="#8e2f0d" stroke="#4e1502" stroke-width="1.2" />
    <circle cx="20" cy="88" r="5" fill="#782307" stroke="#4e1502" stroke-width="1.2" />
    <circle cx="20" cy="100" r="4" fill="#601802" stroke="#4e1502" stroke-width="1.2" />
    <path d="M17,10 Q10,2 5,5 M23,10 Q30,2 35,5" stroke="#8e2f0d" stroke-width="1.5" fill="none" />
    <circle cx="17" cy="14" r="1.2" fill="#000" />
    <circle cx="23" cy="14" r="1.2" fill="#000" />
  </svg>
`;

const getBeetleSVG = () => `
  <svg viewBox="0 0 50 60" width="40" height="50">
    <path d="M18,20 Q5,15 2,22 M18,30 Q5,30 2,35 M18,40 Q5,45 2,47" stroke="#1d1712" stroke-width="2.2" fill="none" class="leg-wiggle-1" />
    <path d="M32,20 Q45,15 48,22 M32,30 Q45,30 48,35 M32,40 Q45,45 48,47" stroke="#1d1712" stroke-width="2.2" fill="none" class="leg-wiggle-2" />
    <path d="M22,10 Q15,0 8,5 M28,10 Q35,0 42,5" stroke="#1d1712" stroke-width="1.2" fill="none" />
    <ellipse cx="25" cy="35" rx="12" ry="16" fill="#1b4d3e" stroke="#0b281f" stroke-width="1.5" />
    <circle cx="25" cy="18" r="7" fill="#113329" stroke="#0b281f" stroke-width="1.5" />
    <line x1="25" y1="20" x2="25" y2="50" stroke="#0b281f" stroke-width="1.2" />
    <circle cx="22" cy="16" r="1.2" fill="#000" />
    <circle cx="28" cy="16" r="1.2" fill="#000" />
  </svg>
`;

const getScorpionSVG = () => `
  <svg viewBox="0 0 60 80" width="45" height="60">
    <path d="M30,45 Q30,65 42,70 Q52,70 50,55 Q48,45 42,48" stroke="#1f1c19" stroke-width="2.5" fill="none" class="tail-wiggle" />
    <path d="M42,48 L38,45" stroke="#8b4513" stroke-width="2" fill="none" />
    <path d="M24,20 Q10,12 8,22 M8,22 L14,24" stroke="#1f1c19" stroke-width="2.2" fill="none" />
    <path d="M36,20 Q50,12 52,22 M52,22 L46,24" stroke="#1f1c19" stroke-width="2.2" fill="none" />
    <ellipse cx="30" cy="30" rx="9" ry="15" fill="#1b1816" stroke="#0a0908" stroke-width="1.5" />
    <path d="M22,25 Q12,24 8,30 M22,32 Q12,33 8,39 M22,39 Q12,42 8,48" stroke="#2b2724" stroke-width="1.8" fill="none" class="leg-wiggle-1" />
    <path d="M38,25 Q48,24 52,30 M38,32 Q48,33 52,39 M38,39 Q48,42 52,48" stroke="#2b2724" stroke-width="1.8" fill="none" class="leg-wiggle-2" />
    <circle cx="28" cy="18" r="1.2" fill="#000" />
    <circle cx="32" cy="18" r="1.2" fill="#000" />
  </svg>
`;

const getSmallSpiderSVG = () => `
  <svg viewBox="0 0 100 100" width="35" height="35">
    <ellipse cx="50" cy="65" rx="14" ry="18" fill="#4d3b30" stroke="#2d221c" stroke-width="1.5" />
    <circle cx="50" cy="45" r="10" fill="#5c473c" stroke="#2d221c" stroke-width="1.5" />
    <g stroke="#4d3b30" stroke-width="2.5" fill="none">
      <path d="M42,45 Q25,25 10,48" class="leg-wiggle-1" />
      <path d="M40,50 Q20,45 10,70" class="leg-wiggle-2" />
      <path d="M40,58 Q20,72 15,86" class="leg-wiggle-1" />
      <path d="M44,66 Q32,84 37,92" class="leg-wiggle-2" />
      <path d="M58,45 Q75,25 90,48" class="leg-wiggle-2" />
      <path d="M60,50 Q80,45 90,70" class="leg-wiggle-1" />
      <path d="M60,58 Q80,72 85,86" class="leg-wiggle-2" />
      <path d="M56,66 Q68,84 63,92" class="leg-wiggle-1" />
    </g>
    <circle cx="47" cy="43" r="1.2" fill="#000" />
    <circle cx="53" cy="43" r="1.2" fill="#000" />
  </svg>
`;

const getMothSVG = () => `
  <svg viewBox="0 0 40 40" width="30" height="30">
    <g class="wings">
      <path d="M20,18 Q5,5 3,22 Q12,30 20,22" fill="#8e7d70" stroke="#52473f" stroke-width="1.2" class="wing-left" />
      <path d="M20,18 Q35,5 37,22 Q28,30 20,22" fill="#8e7d70" stroke="#52473f" stroke-width="1.2" class="wing-right" />
    </g>
    <ellipse cx="20" cy="20" rx="3" ry="10" fill="#3d332d" stroke="#211b17" stroke-width="1.2" />
    <path d="M18,11 Q14,4 10,6 M22,11 Q26,4 30,6" stroke="#3d332d" stroke-width="1" fill="none" />
    <circle cx="18" cy="12" r="0.8" fill="#000" />
    <circle cx="22" cy="12" r="0.8" fill="#000" />
  </svg>
`;

// --- Dynamic Grass & Flowers Spawner ---
const initGrassAndFlowers = (container) => {
    const existing = container.querySelector('.grass-flowers-inner');
    if (existing) existing.remove();

    const inner = document.createElement('div');
    inner.className = 'grass-flowers-inner';
    container.appendChild(inner);

    const screenWidth = window.innerWidth;
    
    // Spawn layered grass blades
    const numGrass = Math.ceil(screenWidth / 25) + 8;
    for (let i = 0; i < numGrass; i++) {
        const x = (i / numGrass) * screenWidth + (Math.random() - 0.5) * 15;
        const height = 75 + Math.random() * 85;
        const width = 12 + Math.random() * 12;
        const blade = document.createElement('div');
        blade.className = 'grass-blade-wrapper';
        blade.style.left = `${x}px`;
        blade.style.width = `${width}px`;
        blade.style.height = `${height}px`;
        blade.style.bottom = '0px';
        blade.style.position = 'absolute';
        blade.style.transformOrigin = 'bottom center';
        
        const delay = -Math.random() * 5;
        const duration = 3.5 + Math.random() * 2.5;
        blade.style.animation = `windSway ${duration}s infinite alternate ease-in-out`;
        blade.style.animationDelay = `${delay}s`;

        blade.innerHTML = `
          <svg viewBox="0 0 20 150" width="100%" height="100%" preserveAspectRatio="none">
            <path d="M10,150 Q2,60 18,0 Q-2,80 10,150 Z" fill="#1b3d14" stroke="#0f260b" stroke-width="0.5" />
          </svg>
        `;
        inner.appendChild(blade);
    }

    // Spawn colorful flowers (12 total)
    const numFlowers = 12;
    for (let i = 0; i < numFlowers; i++) {
        const x = (i / (numFlowers - 1)) * (screenWidth - 100) + 50 + (Math.random() - 0.5) * 35;
        const height = 90 + Math.random() * 65;
        const width = 50 + Math.random() * 25;
        const flower = document.createElement('div');
        flower.className = 'flower-wrapper';
        flower.style.left = `${x}px`;
        flower.style.width = `${width}px`;
        flower.style.height = `${height}px`;
        flower.style.bottom = '0px';
        flower.style.position = 'absolute';
        flower.style.transformOrigin = 'bottom center';
        
        const delay = -Math.random() * 5;
        const duration = 4.0 + Math.random() * 2.5;
        flower.style.animation = `windSway ${duration}s infinite alternate ease-in-out`;
        flower.style.animationDelay = `${delay}s`;

        const type = Math.floor(Math.random() * 3);
        let svg = '';
        if (type === 0) { // Red Spider Lily (Higanbana)
            svg = `
              <svg viewBox="0 0 100 120" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
                <path d="M50,120 Q48,70 50,30" stroke="#223a1a" stroke-width="3" fill="none" />
                <path d="M50,30 Q30,20 15,28" stroke="#ff2200" stroke-width="2.2" fill="none" />
                <path d="M50,30 Q70,20 85,28" stroke="#ff2200" stroke-width="2.2" fill="none" />
                <path d="M50,30 Q25,10 12,5" stroke="#ff2200" stroke-width="2.2" fill="none" />
                <path d="M50,30 Q75,10 88,5" stroke="#ff2200" stroke-width="2.2" fill="none" />
                <path d="M50,30 Q35,-5 32,-25" stroke="#ff2200" stroke-width="2.2" fill="none" />
                <path d="M50,30 Q65,-5 68,-25" stroke="#ff2200" stroke-width="2.2" fill="none" />
                
                <path d="M50,30 Q35,-15 20,-35 Q15,-40 10,-38" stroke="#ff0000" stroke-width="1.2" fill="none" />
                <path d="M50,30 Q65,-15 80,-35 Q85,-40 90,-38" stroke="#ff0000" stroke-width="1.2" fill="none" />
                <path d="M50,30 Q45,-25 40,-45 Q38,-50 35,-48" stroke="#ff0000" stroke-width="1.2" fill="none" />
                <path d="M50,30 Q55,-25 60,-45 Q62,-50 65,-48" stroke="#ff0000" stroke-width="1.2" fill="none" />
              </svg>
            `;
        } else if (type === 1) { // Violet Wildflower
            svg = `
              <svg viewBox="0 0 80 100" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
                <path d="M40,100 Q45,60 40,30" stroke="#2c4c23" stroke-width="2.5" fill="none" />
                <path d="M41,70 Q55,60 62,65 Q50,75 41,75 Z" fill="#325a27" />
                <path d="M39,80 Q25,75 18,80 Q25,88 39,83 Z" fill="#325a27" />
                <g fill="#8a2be2">
                  <circle cx="40" cy="30" r="10" />
                  <circle cx="28" cy="30" r="10" />
                  <circle cx="52" cy="30" r="10" />
                  <circle cx="40" cy="18" r="10" />
                  <circle cx="40" cy="42" r="10" />
                </g>
                <circle cx="40" cy="30" r="6" fill="#ffd700" />
              </svg>
            `;
        } else { // Yellow Cosmos
            svg = `
              <svg viewBox="0 0 80 100" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
                <path d="M40,100 Q35,60 40,35" stroke="#223a1a" stroke-width="2.5" fill="none" />
                <path d="M39,65 Q25,55 18,60 Q25,68 39,68 Z" fill="#2d5224" />
                <path d="M41,75 Q55,70 62,75 Q50,85 41,80 Z" fill="#2d5224" />
                <g fill="#ffb703">
                  <ellipse cx="40" cy="35" rx="5" ry="15" transform="rotate(0 40 35)" />
                  <ellipse cx="40" cy="35" rx="5" ry="15" transform="rotate(30 40 35)" />
                  <ellipse cx="40" cy="35" rx="5" ry="15" transform="rotate(60 40 35)" />
                  <ellipse cx="40" cy="35" rx="5" ry="15" transform="rotate(90 40 35)" />
                  <ellipse cx="40" cy="35" rx="5" ry="15" transform="rotate(120 40 35)" />
                  <ellipse cx="40" cy="35" rx="5" ry="15" transform="rotate(150 40 35)" />
                </g>
                <circle cx="40" cy="35" r="7" fill="#fb8500" />
              </svg>
            `;
        }
        
        flower.innerHTML = svg;
        inner.appendChild(flower);
    }
};

// Global state check (shared from main.js or checked from window/DOM)
const isDomainActive = () => {
    return document.body.classList.contains('domain-active');
};

const getButterflySVG = (species, uniqueId) => {
    let grad = '';
    let wingPathsLeft = '';
    let wingPathsRight = '';

    if (species.name === 'Monarch') {
        grad = `
          <linearGradient id="wing-grad-${uniqueId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ff9900" />
            <stop offset="60%" stop-color="#ff4400" />
            <stop offset="100%" stop-color="#990000" />
          </linearGradient>
        `;
        wingPathsLeft = `
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q10,25 8,32 Q10,38 16,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q10,25 8,32 Q10,38 16,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,18 C15,12 8,14 3,15 M20,18 C16,16 10,19 6,21 M20,18 C16,19 12,24 10,27 M20,20 C15,24 11,28 9,30" stroke="#000" stroke-width="0.8" fill="none" />
          <circle cx="4" cy="8" r="0.6" fill="#fff" />
          <circle cx="3" cy="12" r="0.6" fill="#fff" />
          <circle cx="4" cy="18" r="0.6" fill="#fff" />
          <circle cx="7" cy="24" r="0.6" fill="#fff" />
        `;
        wingPathsRight = `
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q30,25 32,32 Q30,38 24,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q30,25 32,32 Q30,38 24,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,18 C25,12 32,14 37,15 M20,18 C24,16 30,19 34,21 M20,18 C24,19 28,24 30,27 M20,20 C25,24 29,28 31,30" stroke="#000" stroke-width="0.8" fill="none" />
          <circle cx="36" cy="8" r="0.6" fill="#fff" />
          <circle cx="37" cy="12" r="0.6" fill="#fff" />
          <circle cx="36" cy="18" r="0.6" fill="#fff" />
          <circle cx="33" cy="24" r="0.6" fill="#fff" />
        `;
    } else if (species.name === 'Blue Morpho') {
        grad = `
          <linearGradient id="wing-grad-${uniqueId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#00f0ff" />
            <stop offset="60%" stop-color="#0055ff" />
            <stop offset="100%" stop-color="#0000aa" />
          </linearGradient>
        `;
        wingPathsLeft = `
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q10,25 8,32 Q10,38 16,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q10,25 8,32 Q10,38 16,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,18 L6,14 M20,18 L8,20 M20,18 L12,24 M20,20 L12,30" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none" />
          <circle cx="5" cy="10" r="0.7" fill="#fff" />
          <circle cx="4" cy="15" r="0.7" fill="#fff" />
        `;
        wingPathsRight = `
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q30,25 32,32 Q30,38 24,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q30,25 32,32 Q30,38 24,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,18 L34,14 M20,18 L32,20 M20,18 L28,24 M20,20 L28,30" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" fill="none" />
          <circle cx="35" cy="10" r="0.7" fill="#fff" />
          <circle cx="36" cy="15" r="0.7" fill="#fff" />
        `;
    } else if (species.name === 'Tiger Swallowtail') {
        grad = `
          <linearGradient id="wing-grad-${uniqueId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#ffff44" />
            <stop offset="60%" stop-color="#ffbf00" />
            <stop offset="100%" stop-color="#d48800" />
          </linearGradient>
        `;
        wingPathsLeft = `
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q10,25 8,32 L4,42 L9,38 Q12,41 16,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q10,25 8,32 L4,42 L9,38 Q12,41 16,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M6,10 Q14,13 18,17 M4,16 Q12,18 16,21 M7,22 Q12,23 15,25" stroke="#000" stroke-width="1.3" fill="none" />
        `;
        wingPathsRight = `
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q30,25 32,32 L36,42 L31,38 Q28,41 24,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q30,25 32,32 L36,42 L31,38 Q28,41 24,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M34,10 Q26,13 22,17 M36,16 Q28,18 24,21 M33,22 Q28,23 25,25" stroke="#000" stroke-width="1.3" fill="none" />
        `;
    } else { // Emerald Swallowtail
        grad = `
          <linearGradient id="wing-grad-${uniqueId}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#00ff88" />
            <stop offset="60%" stop-color="#00aa50" />
            <stop offset="100%" stop-color="#004d1a" />
          </linearGradient>
        `;
        wingPathsLeft = `
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q10,25 8,32 Q10,38 16,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q5,2 2,15 Q2,26 12,28 Q18,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q10,25 8,32 Q10,38 16,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <circle cx="10" cy="15" r="2.5" fill="#ffd700" stroke="#000" stroke-width="0.5" />
          <circle cx="10" cy="15" r="1" fill="#ff0055" />
        `;
        wingPathsRight = `
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,20 Q30,25 32,32 Q30,38 24,36 Q20,32 20,22 Z" fill="url(#wing-grad-${uniqueId})" />
          <path d="M20,18 Q35,2 38,15 Q38,26 28,28 Q22,28 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <path d="M20,20 Q30,25 32,32 Q30,38 24,36 Q20,32 20,22 Z" fill="none" stroke="#000" stroke-width="2" />
          <circle cx="30" cy="15" r="2.5" fill="#ffd700" stroke="#000" stroke-width="0.5" />
          <circle cx="30" cy="15" r="1" fill="#ff0055" />
        `;
    }

    return `
      <svg viewBox="0 0 40 40" width="38" height="38" style="filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4))">
        <defs>${grad}</defs>
        <g class="wing-left">${wingPathsLeft}</g>
        <g class="wing-right">${wingPathsRight}</g>
        <ellipse cx="20" cy="20" rx="1.5" ry="9" fill="#111" />
        <path d="M18,11 Q14,4 10,6 M22,11 Q26,4 30,6" stroke="#111" stroke-width="0.8" fill="none" />
        <circle cx="18" cy="12" r="0.6" fill="#000" />
        <circle cx="22" cy="12" r="0.6" fill="#000" />
      </svg>
    `;
};

export const spawnNewButterfly = (container, fromEdge = false) => {
    if (isDomainActive()) return;
    
    const speciesList = [
        { name: 'Monarch' },
        { name: 'Blue Morpho' },
        { name: 'Tiger Swallowtail' },
        { name: 'Emerald' }
    ];
    const species = speciesList[Math.floor(Math.random() * speciesList.length)];
    const el = document.createElement('div');
    el.className = 'insect butterfly';
    
    let x, y;
    if (fromEdge) {
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -40 : window.innerWidth + 40;
            y = Math.random() * window.innerHeight * 0.7;
        } else {
            x = Math.random() * window.innerWidth;
            y = Math.random() < 0.5 ? -40 : window.innerHeight * 0.7 + 40;
        }
    } else {
        x = Math.random() * (window.innerWidth - 100) + 50;
        y = Math.random() * (window.innerHeight * 0.6) + 50;
    }

    el.style.left = '0px';
    el.style.top = '0px';
    el.style.transform = `translate(${x}px, ${y}px)`;
    
    const uniqueId = `bf-${Math.floor(Math.random() * 1000000)}`;
    el.innerHTML = getButterflySVG(species, uniqueId);
    
    container.appendChild(el);
    
    butterflies.push({
        el: el,
        x: x,
        y: y,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight * 0.7,
        speed: 1.8 + Math.random() * 2.2,
        offset: Math.random() * 1000,
        isEaten: false
    });
};

const spawnDebris = (container, x, y) => {
    if (!container) return;
    const debris = document.createElement('div');
    debris.className = 'debris-particle';
    debris.style.left = `${x}px`;
    debris.style.top = `${y}px`;
    container.appendChild(debris);
    
    let vy = 0.5;
    let dy = 0;
    let opacity = 0.9;
    let angle = Math.random() * 360;
    
    const animateDebris = () => {
        vy += 0.12; 
        dy += vy;
        opacity -= 0.015;
        debris.style.transform = `translateY(${dy}px) rotate(${angle}deg)`;
        debris.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animateDebris);
        } else {
            debris.remove();
        }
    };
    requestAnimationFrame(animateDebris);
};

export const initInsectSimulation = () => {
    const container = document.getElementById('spider-container');
    if (!container) return;

    // Reset burning state
    isBurningState = false;

    // Clean any remnants first
    butterflies.forEach(b => b.el.remove());
    butterflies = [];
    if (yellowSpider.el) {
        yellowSpider.el.remove();
        yellowSpider.el = null;
    }
    roamingInsects.forEach(ins => ins.el.remove());
    roamingInsects = [];
    
    const oldGf = container.querySelector('.grass-flowers-inner');
    if (oldGf) oldGf.remove();

    // Initialize Grass and Flowers
    const grassContainer = container.querySelector('.intro-grass-flowers');
    if (grassContainer) {
        initGrassAndFlowers(grassContainer);
    }

    // Spawn 10 butterflies
    for (let i = 0; i < 10; i++) {
        spawnNewButterfly(container, false);
    }

    // Spawn Yellow Spider
    const spiderEl = document.createElement('div');
    spiderEl.className = 'insect yellow-spider';
    spiderEl.innerHTML = `
      <svg viewBox="0 0 100 100" width="55" height="55">
        <path d="M44,32 Q46,24 43,22 M56,32 Q54,24 57,22" stroke="#5a4107" stroke-width="1.5" fill="none" />
        <g stroke="#000" stroke-width="2.5" fill="none" class="yellow-legs">
          <path d="M42,42 L25,25 L10,38" stroke="#e5a910" class="leg-wiggle-1" />
          <path d="M25,25 L10,38" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-1" />
          
          <path d="M38,47 L18,40 L6,55" stroke="#e5a910" class="leg-wiggle-2" />
          <path d="M18,40 L6,55" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-2" />

          <path d="M38,55 L16,62 L8,78" stroke="#e5a910" class="leg-wiggle-1" />
          <path d="M16,62 L8,78" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-1" />

          <path d="M42,65 L24,78 L30,92" stroke="#e5a910" class="leg-wiggle-2" />
          <path d="M24,78 L30,92" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-2" />
          
          <path d="M58,42 L75,25 L90,38" stroke="#e5a910" class="leg-wiggle-2" />
          <path d="M75,25 L90,38" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-2" />

          <path d="M62,47 L82,40 L94,55" stroke="#e5a910" class="leg-wiggle-1" />
          <path d="M82,40 L94,55" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-1" />

          <path d="M62,55 L84,62 L92,78" stroke="#e5a910" class="leg-wiggle-2" />
          <path d="M84,62 L92,78" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-2" />

          <path d="M58,65 L76,78 L70,92" stroke="#e5a910" class="leg-wiggle-1" />
          <path d="M76,78 L70,92" stroke="#1c160a" stroke-dasharray="3,3" class="leg-wiggle-1" />
        </g>
        <circle cx="50" cy="42" r="10" fill="#ffd700" stroke="#4a3b0a" stroke-width="1.5" />
        <circle cx="50" cy="42" r="7" fill="#ffea00" />
        <circle cx="47" cy="38" r="1" fill="#000" />
        <circle cx="53" cy="38" r="1" fill="#000" />
        <circle cx="45" cy="42" r="0.8" fill="#000" />
        <circle cx="55" cy="42" r="0.8" fill="#000" />
        <circle cx="48" cy="45" r="1.2" fill="#000" />
        <circle cx="52" cy="45" r="1.2" fill="#000" />
        <ellipse cx="50" cy="67" rx="17" ry="22" fill="#ffd700" stroke="#4a3b0a" stroke-width="1.5" />
        <path d="M36,55 Q50,60 64,55 M34,62 Q50,68 66,62 M33,70 Q50,76 67,70 M35,78 Q50,84 65,78 M38,85 Q50,90 62,85" stroke="#1c160a" stroke-width="2" fill="none" />
        <path d="M50,48 L50,88" stroke="#1c160a" stroke-width="2" fill="none" />
      </svg>
    `;
    container.appendChild(spiderEl);
    yellowSpider.x = window.innerWidth * 0.3;
    yellowSpider.y = window.innerHeight * 0.4;
    yellowSpider.target = null;
    yellowSpider.state = 'HUNTING';
    yellowSpider.eatingTimer = 0;
    yellowSpider.scurryTimer = 0;
    yellowSpider.scurryPhase = 'RUNNING';
    yellowSpider.scale = 1;
    yellowSpider.el = spiderEl;

    // Spawn 1 Centipede, 1 Beetle, 1 Scorpion, 1 Small Spider, 3 Moths
    const types = [
        { type: 'centipede', class: 'centipede', getSVG: getCentipedeSVG, speed: 1.0 },
        { type: 'beetle', class: 'beetle', getSVG: getBeetleSVG, speed: 1.4 },
        { type: 'scorpion', class: 'scorpion', getSVG: getScorpionSVG, speed: 1.1 },
        { type: 'spider-small', class: 'spider-small', getSVG: getSmallSpiderSVG, speed: 1.6 },
        { type: 'moth', class: 'moth moth-1', getSVG: getMothSVG, speed: 2.5 },
        { type: 'moth', class: 'moth moth-2', getSVG: getMothSVG, speed: 2.2 },
        { type: 'moth', class: 'moth moth-3', getSVG: getMothSVG, speed: 2.8 }
    ];

    types.forEach(t => {
        const el = document.createElement('div');
        el.className = `insect ${t.class}`;
        
        let x = Math.random() * window.innerWidth;
        let y;
        let targetY;
        if (t.type === 'moth') {
            y = Math.random() * window.innerHeight * 0.6;
            targetY = Math.random() * window.innerHeight * 0.7;
        } else if (t.type === 'centipede' || t.type === 'beetle' || t.type === 'scorpion') {
            // Earth insects stay on the ground (bottom 18%)
            y = window.innerHeight * 0.82 + Math.random() * (window.innerHeight * 0.12);
            targetY = window.innerHeight * 0.82 + Math.random() * (window.innerHeight * 0.12);
        } else {
            // Spider small
            y = window.innerHeight * 0.35 + Math.random() * window.innerHeight * 0.45;
            targetY = window.innerHeight * 0.35 + Math.random() * window.innerHeight * 0.45;
        }

        el.style.left = '0px';
        el.style.top = '0px';
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.innerHTML = t.getSVG();
        
        container.appendChild(el);

        let silkEl = null;
        if (t.type === 'spider-small') {
            silkEl = document.createElement('div');
            silkEl.className = 'small-spider-silk';
            silkEl.style.position = 'absolute';
            silkEl.style.width = '1px';
            silkEl.style.background = 'rgba(255, 255, 255, 0.4)';
            silkEl.style.transformOrigin = 'top center';
            silkEl.style.top = '0px';
            silkEl.style.left = '0px';
            silkEl.style.zIndex = '99996';
            container.appendChild(silkEl);
        }
        
        roamingInsects.push({
            el: el,
            type: t.type,
            x: x,
            y: y,
            targetX: Math.random() * window.innerWidth,
            targetY: targetY,
            speed: t.speed,
            offset: Math.random() * 1000,
            scurryTimer: Math.random() * 1000,
            scurryPhase: 'RUNNING',
            scale: 1,
            silkEl: silkEl
        });
    });

    // Start Simulation Loop
    if (insectLoopId) cancelAnimationFrame(insectLoopId);
    updateSimulation();
};

let insectLoopId = null;

const updateSimulation = () => {
    if (isDomainActive()) {
        butterflies.forEach(b => b.el.remove());
        butterflies = [];
        if (yellowSpider.el) {
            yellowSpider.el.remove();
            yellowSpider.el = null;
        }
        roamingInsects.forEach(ins => ins.el.remove());
        roamingInsects = [];
        document.querySelectorAll('.silk-wrap').forEach(w => w.remove());
        document.querySelectorAll('.small-spider-silk').forEach(s => s.remove());
        const gf = document.querySelector('.grass-flowers-inner');
        if (gf) gf.remove();
        return;
    }

    const container = document.getElementById('spider-container');

    if (isBurningState) {
        // Frantic burning & shrinking animations inside update loop
        butterflies.forEach(b => {
            b.x += Math.sin(Date.now() * 0.15 + b.offset) * 3;
            b.y += -1.2 + Math.cos(Date.now() * 0.1 + b.offset) * 0.8;
            b.scale = (b.scale === undefined ? 1 : b.scale) - 0.015;
            if (b.scale < 0) b.scale = 0;
            b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${Math.random() * 360}deg) scale(${b.scale})`;
            b.el.style.opacity = b.scale;
            b.el.style.filter = 'brightness(0.2) sepia(1) hue-rotate(-50deg) saturate(10) drop-shadow(0 0 8px #ff4500)';
        });

        if (yellowSpider.el) {
            yellowSpider.scale = (yellowSpider.scale === undefined ? 1 : yellowSpider.scale) - 0.012;
            if (yellowSpider.scale < 0) yellowSpider.scale = 0;
            const shake = (Math.random() - 0.5) * 4;
            yellowSpider.el.style.transform = `translate(${yellowSpider.x + shake}px, ${yellowSpider.y + shake}px) rotate(${Date.now() * 0.08}deg) scale(${yellowSpider.scale})`;
            yellowSpider.el.style.opacity = yellowSpider.scale;
            yellowSpider.el.style.filter = 'brightness(0.1) sepia(1) hue-rotate(-50deg) saturate(10) drop-shadow(0 0 10px #ff4500)';
        }

        roamingInsects.forEach(ins => {
            ins.scale = (ins.scale === undefined ? 1 : ins.scale) - 0.015;
            if (ins.scale < 0) ins.scale = 0;
            const shake = (Math.random() - 0.5) * 3;
            ins.el.style.transform = `translate(${ins.x + shake}px, ${ins.y + shake}px) rotate(${Date.now() * 0.1}deg) scale(${ins.scale})`;
            ins.el.style.opacity = ins.scale;
            ins.el.style.filter = 'brightness(0.1) sepia(1) hue-rotate(-50deg) saturate(10) drop-shadow(0 0 8px #ff4500)';

            // Burn small spider silk
            if (ins.type === 'spider-small' && ins.silkEl) {
                ins.silkEl.style.height = `${ins.y}px`;
                ins.silkEl.style.transform = `translate(${ins.x + 17}px, 0px)`;
                ins.silkEl.style.opacity = ins.scale;
                ins.silkEl.style.filter = 'brightness(0.2) sepia(1) hue-rotate(-50deg) saturate(10) drop-shadow(0 0 4px #ff4500)';
            }
        });

        const foliage = document.querySelectorAll('.grass-blade-wrapper, .flower-wrapper');
        foliage.forEach(f => {
            let scale = f.dataset.scale === undefined ? 1 : parseFloat(f.dataset.scale);
            scale -= 0.015;
            if (scale < 0) scale = 0;
            f.dataset.scale = scale;
            f.style.transform = `scaleY(${scale}) scaleX(${scale * 0.9})`;
            f.style.opacity = scale;
            f.style.filter = 'brightness(0) sepia(1) hue-rotate(-50deg) saturate(12) drop-shadow(0 0 8px #ff4500)';
        });
    } else {
        // --- Normal Simulation ---

        // 1. Update Butterflies
        butterflies.forEach(b => {
            if (b.isEaten) return;

            let dx = b.targetX - b.x;
            let dy = b.targetY - b.y;
            let dist = Math.hypot(dx, dy);

            if (dist < 15) {
                b.targetX = Math.random() * window.innerWidth;
                b.targetY = Math.random() * window.innerHeight * 0.7;
            } else {
                b.x += (dx / dist) * b.speed + Math.sin(Date.now() * 0.05 + b.offset) * 1.8;
                b.y += (dy / dist) * b.speed + Math.cos(Date.now() * 0.03 + b.offset) * 1.5;
            }

            b.x = Math.max(10, Math.min(window.innerWidth - 45, b.x));
            b.y = Math.max(10, Math.min(window.innerHeight * 0.8, b.y));

            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${angle + 90}deg)`;
        });

        // 2. Update Yellow Spider
        if (yellowSpider.el) {
            if (yellowSpider.state === 'EATING') {
                yellowSpider.eatingTimer -= 16.7;
                
                let chewingRotation = Math.sin(Date.now() * 0.08) * 8;
                if (yellowSpider.targetAngle !== undefined) {
                    yellowSpider.el.style.transform = `translate(${yellowSpider.x}px, ${yellowSpider.y}px) rotate(${yellowSpider.targetAngle + 90 + chewingRotation}deg)`;
                }

                if (yellowSpider.eatingTimer <= 0) {
                    yellowSpider.state = 'HUNTING';
                    yellowSpider.target = null;
                }
            } else {
                yellowSpider.scurryTimer -= 16.7;
                if (yellowSpider.scurryTimer <= 0) {
                    if (yellowSpider.scurryPhase === 'RUNNING') {
                        yellowSpider.scurryPhase = 'PAUSED';
                        yellowSpider.scurryTimer = 300 + Math.random() * 400;
                    } else {
                        yellowSpider.scurryPhase = 'RUNNING';
                        yellowSpider.scurryTimer = 800 + Math.random() * 1000;
                    }
                }

                if (!yellowSpider.target || yellowSpider.target.isEaten) {
                    let nearest = null;
                    let minDist = Infinity;
                    butterflies.forEach(b => {
                        if (b.isEaten) return;
                        let d = Math.hypot(b.x - yellowSpider.x, b.y - yellowSpider.y);
                        if (d < minDist) {
                            minDist = d;
                            nearest = b;
                        }
                    });
                    yellowSpider.target = nearest;
                }

                if (yellowSpider.target) {
                    let dx = yellowSpider.target.x - yellowSpider.x;
                    let dy = yellowSpider.target.y - yellowSpider.y;
                    let dist = Math.hypot(dx, dy);

                    let speed = yellowSpider.speed;
                    if (dist < 85) {
                        speed = 7.0; // Pounce!
                    }

                    if (dist < 28) {
                        yellowSpider.state = 'EATING';
                        yellowSpider.eatingTimer = 1600;
                        yellowSpider.targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;

                        const eatenTarget = yellowSpider.target;
                        eatenTarget.isEaten = true;
                        eatenTarget.el.classList.add('struggling');

                        if (container) {
                            const cocoon = document.createElement('div');
                            cocoon.className = 'silk-wrap';
                            cocoon.style.left = '0px';
                            cocoon.style.top = '0px';
                            cocoon.style.transform = `translate(${eatenTarget.x}px, ${eatenTarget.y}px)`;
                            cocoon.innerHTML = `
                              <svg viewBox="0 0 40 40" width="42" height="42">
                                <path d="M5,20 Q20,2 35,20 M10,10 Q20,35 30,10 M20,2 L20,38 M2,20 L38,20 M5,5 L35,35 M5,35 L35,5" stroke="rgba(255,255,255,0.85)" stroke-width="0.8" fill="none" stroke-dasharray="2,2" />
                                <ellipse cx="20" cy="20" rx="13" ry="17" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.9)" stroke-width="0.8" />
                              </svg>
                            `;
                            container.appendChild(cocoon);

                            setTimeout(() => {
                                cocoon.style.transition = 'transform 1.2s ease-out, opacity 1.2s ease-out';
                                cocoon.style.transform += ' scale(0)';
                                cocoon.style.opacity = '0';
                            }, 200);

                            setTimeout(() => {
                                cocoon.remove();
                                eatenTarget.el.remove();
                                butterflies = butterflies.filter(item => item !== eatenTarget);
                                spawnDebris(container, eatenTarget.x + 10, eatenTarget.y + 10);
                                spawnNewButterfly(container, true);
                            }, 1450);
                        }

                    } else {
                        if (yellowSpider.scurryPhase === 'RUNNING') {
                            yellowSpider.x += (dx / dist) * speed;
                            yellowSpider.y += (dy / dist) * speed;
                        }
                    }

                    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    if (yellowSpider.state !== 'EATING') {
                        yellowSpider.el.style.transform = `translate(${yellowSpider.x}px, ${yellowSpider.y}px) rotate(${angle + 90}deg)`;
                    }
                } else {
                    let dx = (window.innerWidth / 2) - yellowSpider.x;
                    let dy = (window.innerHeight / 2) - yellowSpider.y;
                    let dist = Math.hypot(dx, dy);
                    if (dist > 10) {
                        if (yellowSpider.scurryPhase === 'RUNNING') {
                            yellowSpider.x += (dx / dist) * 1;
                            yellowSpider.y += (dy / dist) * 1;
                        }
                        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                        yellowSpider.el.style.transform = `translate(${yellowSpider.x}px, ${yellowSpider.y}px) rotate(${angle + 90}deg)`;
                    }
                }
            }
        }

        // 3. Update Roaming Insects
        roamingInsects.forEach(ins => {
            let dx = ins.targetX - ins.x;
            let dy = ins.targetY - ins.y;
            let dist = Math.hypot(dx, dy);

            if (ins.type !== 'moth') {
                ins.scurryTimer -= 16.7;
                if (ins.scurryTimer <= 0) {
                    if (ins.scurryPhase === 'RUNNING') {
                        ins.scurryPhase = 'PAUSED';
                        ins.scurryTimer = 500 + Math.random() * 1200;
                    } else {
                        ins.scurryPhase = 'RUNNING';
                        ins.scurryTimer = 1000 + Math.random() * 2000;
                        ins.targetX = Math.random() * window.innerWidth;
                        if (ins.type === 'centipede' || ins.type === 'beetle' || ins.type === 'scorpion') {
                            ins.targetY = window.innerHeight * 0.82 + Math.random() * (window.innerHeight * 0.12);
                        } else {
                            ins.targetY = window.innerHeight * 0.35 + Math.random() * window.innerHeight * 0.45;
                        }
                    }
                }
            }

            if (dist < 20) {
                ins.targetX = Math.random() * window.innerWidth;
                if (ins.type === 'centipede' || ins.type === 'beetle' || ins.type === 'scorpion') {
                    ins.targetY = window.innerHeight * 0.82 + Math.random() * (window.innerHeight * 0.12);
                } else {
                    ins.targetY = ins.type === 'moth' ? (Math.random() * window.innerHeight * 0.7) : (window.innerHeight * 0.35 + Math.random() * window.innerHeight * 0.45);
                }
            } else if (ins.type === 'moth' || ins.scurryPhase === 'RUNNING') {
                let step = ins.speed;
                if (ins.type === 'moth') {
                    ins.x += (dx / dist) * step + Math.sin(Date.now() * 0.04 + ins.offset) * 1.5;
                    ins.y += (dy / dist) * step + Math.cos(Date.now() * 0.03 + ins.offset) * 1.2;
                } else {
                    ins.x += (dx / dist) * step;
                    ins.y += (dy / dist) * step;
                }
            }

            ins.x = Math.max(10, Math.min(window.innerWidth - 45, ins.x));
            if (ins.type === 'centipede' || ins.type === 'beetle' || ins.type === 'scorpion') {
                ins.y = Math.max(window.innerHeight * 0.82, Math.min(window.innerHeight - 30, ins.y));
            } else {
                ins.y = Math.max(10, Math.min(window.innerHeight * 0.9 - 40, ins.y));
            }

            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            ins.el.style.transform = `translate(${ins.x}px, ${ins.y}px) rotate(${angle + 90}deg)`;

            // Update dynamic silk line for small spider
            if (ins.type === 'spider-small' && ins.silkEl) {
                ins.silkEl.style.height = `${ins.y}px`;
                ins.silkEl.style.transform = `translate(${ins.x + 17}px, 0px)`;
            }
        });
    }

    insectLoopId = requestAnimationFrame(updateSimulation);
};

// --- High Fidelity Canvas Fire Particle System ---
let fireParticles = [];
let fireCanvas = null;
let fireCtx = null;
let fireAnimationId = null;

class FireParticle {
    constructor(x, y, vx, vy, size, maxLife) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.life = maxLife;
        this.maxLife = maxLife;
        
        const rand = Math.random();
        if (rand < 0.25) {
            this.color = { r: 255, g: 235, b: 120 }; // Bright Yellow-White center
        } else if (rand < 0.7) {
            this.color = { r: 255, g: 110, b: 0 };   // Intense Orange
        } else {
            this.color = { r: 215, g: 25, b: 0 };    // Crimson Red edges
        }
    }

    update() {
        this.x += this.vx + Math.sin(this.life * 0.08) * 0.7;
        this.y += this.vy;
        this.life--;
        this.size = Math.max(0.1, (this.life / this.maxLife) * this.size * 1.03);
    }

    draw(ctx) {
        const ratio = this.life / this.maxLife;
        ctx.beginPath();
        
        const radGrad = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        
        const r = this.color.r;
        const g = Math.max(0, this.color.g * ratio);
        const a = ratio * 0.85;

        radGrad.addColorStop(0, `rgba(${r}, ${g}, 0, ${a})`);
        radGrad.addColorStop(0.35, `rgba(${r}, ${g * 0.4}, 0, ${a * 0.55})`);
        radGrad.addColorStop(1, `rgba(${r}, 0, 0, 0)`);

        ctx.fillStyle = radGrad;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const updateFire = () => {
    if (!fireCanvas || !fireCtx) return;
    
    fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
    fireCtx.globalCompositeOperation = 'lighter';
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Spawn fire particles at the bottom foliage
    for (let i = 0; i < 15; i++) {
        const px = Math.random() * screenWidth;
        const py = screenHeight - Math.random() * 50;
        const vx = (Math.random() - 0.5) * 1.6;
        const vy = -1.8 - Math.random() * 3.5;
        const size = 15 + Math.random() * 35;
        const life = 35 + Math.random() * 30;
        fireParticles.push(new FireParticle(px, py, vx, vy, size, life));
    }
    
    // Fire from butterflies
    butterflies.forEach(b => {
        if (b.isEaten) return;
        for (let i = 0; i < 2; i++) {
            const px = b.x + (Math.random() - 0.5) * 15;
            const py = b.y + (Math.random() - 0.5) * 15;
            const vx = (Math.random() - 0.5) * 0.8;
            const vy = -0.6 - Math.random() * 1.5;
            const size = 8 + Math.random() * 14;
            const life = 20 + Math.random() * 15;
            fireParticles.push(new FireParticle(px, py, vx, vy, size, life));
        }
    });

    // Fire from yellow spider
    if (yellowSpider.el) {
        for (let i = 0; i < 3; i++) {
            const px = yellowSpider.x + (Math.random() - 0.5) * 25;
            const py = yellowSpider.y + (Math.random() - 0.5) * 25;
            const vx = (Math.random() - 0.5) * 1.0;
            const vy = -0.8 - Math.random() * 2.0;
            const size = 10 + Math.random() * 18;
            const life = 25 + Math.random() * 15;
            fireParticles.push(new FireParticle(px, py, vx, vy, size, life));
        }
    }

    // Fire from roaming insects
    roamingInsects.forEach(ins => {
        for (let i = 0; i < 2; i++) {
            const px = ins.x + (Math.random() - 0.5) * 20;
            const py = ins.y + (Math.random() - 0.5) * 20;
            const vx = (Math.random() - 0.5) * 0.8;
            const vy = -0.6 - Math.random() * 1.6;
            const size = 9 + Math.random() * 15;
            const life = 22 + Math.random() * 15;
            fireParticles.push(new FireParticle(px, py, vx, vy, size, life));
        }
    });

    // Fire from main black spider
    const mainSpiderEl = document.querySelector('.spider');
    if (mainSpiderEl) {
        const rect = mainSpiderEl.getBoundingClientRect();
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;
        for (let i = 0; i < 3; i++) {
            const spx = px + (Math.random() - 0.5) * 35;
            const spy = py + (Math.random() - 0.5) * 35;
            const vx = (Math.random() - 0.5) * 1.0;
            const vy = -0.8 - Math.random() * 1.8;
            const size = 11 + Math.random() * 18;
            const life = 24 + Math.random() * 15;
            fireParticles.push(new FireParticle(spx, spy, vx, vy, size, life));
        }
    }

    // Fire from rope cursed-eye
    const ropeContainer = document.querySelector('.pull-rope-container');
    if (ropeContainer) {
        const rect = ropeContainer.getBoundingClientRect();
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;
        for (let i = 0; i < 3; i++) {
            const rpx = px + (Math.random() - 0.5) * 25;
            const rpy = py + (Math.random() - 0.5) * 25;
            const vx = (Math.random() - 0.5) * 0.8;
            const vy = -0.6 - Math.random() * 1.5;
            const size = 9 + Math.random() * 16;
            const life = 20 + Math.random() * 18;
            fireParticles.push(new FireParticle(rpx, rpy, vx, vy, size, life));
        }
    }

    // Update and Draw particles
    for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.update();
        if (p.life <= 0) {
            fireParticles.splice(i, 1);
        } else {
            p.draw(fireCtx);
        }
    }

    fireAnimationId = requestAnimationFrame(updateFire);
};

const resizeFireCanvas = () => {
    if (fireCanvas) {
        fireCanvas.width = window.innerWidth;
        fireCanvas.height = window.innerHeight;
    }
};

export const startFireBurn = () => {
    isBurningState = true;

    fireCanvas = document.getElementById('fire-canvas');
    if (fireCanvas) {
        fireCanvas.style.display = 'block';
        fireCanvas.width = window.innerWidth;
        fireCanvas.height = window.innerHeight;
        fireCtx = fireCanvas.getContext('2d');
        fireParticles = [];
        
        window.addEventListener('resize', resizeFireCanvas);
        updateFire();
    }
};

export const stopFireBurn = () => {
    isBurningState = false;
    if (fireAnimationId) {
        cancelAnimationFrame(fireAnimationId);
        fireAnimationId = null;
    }
    window.removeEventListener('resize', resizeFireCanvas);
    if (fireCanvas) {
        fireCanvas.style.display = 'none';
        const ctx = fireCanvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
    }
    
    // Remove all simulation DOM elements
    butterflies.forEach(b => b.el.remove());
    butterflies = [];
    if (yellowSpider.el) {
        yellowSpider.el.remove();
        yellowSpider.el = null;
    }
    roamingInsects.forEach(ins => ins.el.remove());
    roamingInsects = [];
    document.querySelectorAll('.small-spider-silk').forEach(s => s.remove());
    
    const gf = document.querySelector('.grass-flowers-inner');
    if (gf) gf.remove();
};
