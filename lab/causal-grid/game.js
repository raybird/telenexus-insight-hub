const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const entropyEl = document.getElementById('entropy');
const startBtn = document.getElementById('start-btn');
const uiOverlay = document.getElementById('ui-overlay');

canvas.width = 400;
canvas.height = 400;

let score = 0;
let entropy = 0;
let gameActive = false;
let targets = [];
const GRID_SIZE = 5;
const CELL_SIZE = canvas.width / GRID_SIZE;

class EntropyPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = CELL_SIZE * 0.4;
        this.life = 1.0;
        this.decay = 0.01 + Math.random() * 0.02;
    }

    update() {
        this.life -= this.decay;
        if (this.radius < this.maxRadius) this.radius += 2;
        return this.life > 0;
    }

    draw() {
        const color = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        ctx.beginPath();
        ctx.arc(this.x * CELL_SIZE + CELL_SIZE/2, this.y * CELL_SIZE + CELL_SIZE/2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = this.life;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function spawnTarget() {
    if (!gameActive) return;
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    if (!targets.some(t => t.x === x && t.y === y)) {
        targets.push(new EntropyPoint(x, y));
    }
    
    setTimeout(spawnTarget, 800 - Math.min(score * 5, 500));
}

function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for(let i=0; i<=GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE); ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }

    targets = targets.filter(t => {
        const alive = t.update();
        if (!alive) {
            entropy += 5;
            updateStatus();
        }
        t.draw();
        return alive;
    });

    if (entropy >= 100) gameOver();

    requestAnimationFrame(gameLoop);
}

function updateStatus() {
    scoreEl.innerText = `Sovereignty: ${score}`;
    entropyEl.innerText = `Entropy: ${entropy}%`;
}

function gameOver() {
    gameActive = false;
    uiOverlay.style.display = 'flex';
    document.getElementById('start-screen').innerHTML = `
        <h2>因果崩潰</h2>
        <p>最終主權分數: ${score}</p>
        <button onclick="location.reload()">重新初始化</button>
    `;
}

canvas.addEventListener('mousedown', (e) => {
    if (!gameActive) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const gx = Math.floor(mx / (rect.width / GRID_SIZE));
    const gy = Math.floor(my / (rect.height / GRID_SIZE));

    const initialLen = targets.length;
    targets = targets.filter(t => t.x !== gx || t.y !== gy);
    
    if (targets.length < initialLen) {
        score += 10;
        if (entropy > 0) entropy -= 2;
        updateStatus();
    }
});

startBtn.addEventListener('click', () => {
    gameActive = true;
    uiOverlay.style.display = 'none';
    spawnTarget();
    gameLoop();
});

window.setTheme = (theme) => {
    if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
};
