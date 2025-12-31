const CONFIG = {
    stars: 100,
    snowflakes: 30,
    fireworksPerClick: 5,
    targetDate: new Date('2026-01-01T00:00:00').getTime(),
};

/**
 * CoreEngine: Centralized Animation & State Manager
 * Manages a single requestAnimationFrame loop for all visual components.
 */
class CoreEngine {
    constructor() {
        this.updatables = new Set();
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = this.width / 2;
        this.mouseY = this.height / 2;

        this.initListeners();
        this.start();
    }

    initListeners() {
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        }, { passive: true });

        const updateMouse = (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        };

        document.addEventListener('mousemove', updateMouse, { passive: true });
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        }, { passive: true });
    }

    register(obj) {
        this.updatables.add(obj);
    }

    unregister(obj) {
        this.updatables.delete(obj);
    }

    start() {
        const loop = () => {
            this.updatables.forEach(obj => obj.update?.(this.mouseX, this.mouseY));
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

const engine = new CoreEngine();

class FrostManager {
    constructor() {
        this.overlay = document.getElementById('frostOverlay');
        this.timeout = null;
        this.init();
    }

    init() {
        ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => this.resetTimer());
        });
        this.resetTimer();
    }

    resetTimer() {
        if (!this.overlay) return;
        this.overlay.classList.remove('frost-active');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.overlay.classList.add('frost-active');
        }, 30000);
    }
}

function createStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < CONFIG.stars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        fragment.appendChild(star);
    }
    container.appendChild(fragment);
}

class Snowflake {
    constructor(container) {
        this.container = container;
        this.el = document.createElement('div');
        this.el.className = 'snowflake';
        this.chars = ['❄', '❅', '❆'];
        this.el.textContent = this.chars[Math.floor(Math.random() * this.chars.length)];

        this.reset();
        this.container.appendChild(this.el);
    }

    reset() {
        this.x = Math.random() * engine.width;
        this.y = -20 - Math.random() * 100;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = 0.3 + Math.random() * 0.7; // Ultra-slow snow
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.size = 0.5 + Math.random() * 1.5;
        this.opacity = Math.random() * 0.6 + 0.4;

        this.el.style.fontSize = `${this.size}em`;
        this.el.style.opacity = this.opacity;
    }

    update(mouseX, mouseY) {
        this.y += this.vy;
        this.x += this.vx;
        this.rotation += this.rotationSpeed;

        // Optimized mouse repulsion (Squared distance avoids Math.sqrt)
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distSq = dx * dx + dy * dy;
        const radiusSq = 14400; // 120^2

        if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const force = (120 - dist) / 120;
            this.x += dx * force * 0.25;
            this.y += dy * force * 0.25;
        }

        if (this.y > engine.height + 20) {
            this.reset();
        }
        if (this.x < -50) this.x = engine.width + 50;
        if (this.x > engine.width + 50) this.x = -50;

        // Use 3D transform for hardware acceleration
        this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg)`;
    }
}

class SnowManager {
    constructor() {
        this.container = document.getElementById('snowContainer');
        if (!this.container) return;
        this.snowflakes = Array.from({ length: CONFIG.snowflakes }, () => new Snowflake(this.container));
        engine.register(this);
    }

    update(mouseX, mouseY) {
        for (let i = 0; i < this.snowflakes.length; i++) {
            this.snowflakes[i].update(mouseX, mouseY);
        }
    }
}

class GarlandManager {
    constructor() {
        this.container = document.getElementById('garland-container');
        if (!this.container) return;
        this.init();
    }

    init() {
        const count = Math.floor(engine.width / 55);
        const colors = ['gold', 'red', 'blue', 'green'];
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const bulb = document.createElement('div');
            bulb.className = `bulb ${colors[i % colors.length]} active`;
            bulb.style.animationDelay = `${Math.random() * 2}s`;

            bulb.addEventListener('mouseenter', () => {
                bulb.style.transform = `rotate(${(Math.random() - 0.5) * 60}deg) scale(1.2)`;
                setTimeout(() => bulb.style.transform = '', 1200);
            });

            fragment.appendChild(bulb);
        }
        this.container.appendChild(fragment);
    }
}

class Firework {
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.particles = [];
        const hue = Math.random() * 360;
        const count = 70 + Math.floor(Math.random() * 40); // Increased particle count

        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this.ctx, x, y, hue));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].alpha <= 0) this.particles.splice(i, 1);
        }
    }

    draw() {
        this.ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
        }
        this.ctx.globalCompositeOperation = 'source-over';
    }
}

class Particle {
    constructor(ctx, x, y, hue) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.hue = hue + (Math.random() * 40 - 20);
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.2 + 0.3; // Ultra-slow graceful motion
        this.friction = 0.96;
        this.gravity = 0.12;
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.01;
        this.size = Math.random() * 2.5 + 1.0; // Bigger particles
        this.twinkle = Math.random() > 0.7;
    }

    update() {
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const b = this.twinkle && Math.random() > 0.5 ? 95 : 65;
        this.ctx.fillStyle = `hsla(${this.hue}, 100%, ${b}%, ${this.alpha})`;
        this.ctx.fill();
    }
}

class FireworksManager {
    constructor() {
        this.canvas = document.getElementById('fireworks');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.fireworks = [];
        this.dpr = window.devicePixelRatio || 1;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        engine.register(this);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }

    launch(x, y) {
        this.fireworks.push(new Firework(this.ctx, x, y));
    }

    launchRandom() {
        this.launch(Math.random() * this.width, Math.random() * this.height * 0.4);
    }

    update() {
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.4)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = 'source-over';

        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            this.fireworks[i].update();
            this.fireworks[i].draw();
            if (this.fireworks[i].particles.length === 0) this.fireworks.splice(i, 1);
        }
    }
}

class ParallaxManager {
    constructor() {
        this.content = document.querySelector('.content');
        this.snow = document.getElementById('snowContainer');
        if (this.content || this.snow) engine.register(this);
    }

    update(mouseX, mouseY) {
        // Stabilize mouse coordinates (don't shift if very close to center)
        const x = ((mouseX / engine.width) - 0.5) * 15;
        const y = ((mouseY / engine.height) - 0.5) * 15;

        if (this.content) {
            // Apply transform to parent content to keep alignment stable
            this.content.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        if (this.snow) {
            this.snow.style.transform = `translate3d(${x * 0.4}px, ${y * 0.4}px, 0)`;
        }
    }
}

let celebrationStarted = false;
let fireworksManager, snowManager, garlandManager, frostManager, parallaxManager;

function updateCountdown() {
    const now = Date.now();
    const distance = CONFIG.targetDate - now;

    if (distance <= 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';

        if (!celebrationStarted) {
            celebrationStarted = true;
            startCelebration();
        }
        return;
    }

    const t = {
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance % 86400000) / 3600000),
        minutes: Math.floor((distance % 3600000) / 60000),
        seconds: Math.floor((distance % 60000) / 1000)
    };

    Object.keys(t).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.textContent = String(t[key]).padStart(2, '0');
    });
}

function startCelebration() {
    const countdownEl = document.getElementById('countdown');
    if (countdownEl) {
        countdownEl.style.maxHeight = '0';
        countdownEl.style.opacity = '0';
        countdownEl.style.margin = '0';
        countdownEl.style.padding = '0';
        countdownEl.style.transform = 'scale(0.95) translateY(-10px)';
        setTimeout(() => countdownEl.style.display = 'none', 1000);
    }

    setTimeout(() => {
        launchCelebrationFireworks();
        const yearDisplay = document.getElementById('yearDisplay');
        if (yearDisplay) yearDisplay.style.animation = 'celebrate 2s ease-in-out infinite';
    }, 500);
}

function launchCelebrationFireworks() {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => fireworksManager.launchRandom(), i * 150);
    }
}

function launchInitialFireworks() {
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => fireworksManager.launchRandom(), i * 300);
        }
    }, 1500);
}

function createInitialConfetti() {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(container);

    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731'];
    setTimeout(() => {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 40; i++) {
            const c = document.createElement('div');
            const size = 5 + Math.random() * 8;
            c.style.cssText = `
                position:absolute;width:${size}px;height:${size}px;
                background:${colors[Math.floor(Math.random() * colors.length)]};
                left:${Math.random() * 100}%;top:-20px;
                border-radius:${Math.random() > 0.5 ? '50%' : '0'};
                opacity:${0.6 + Math.random() * 0.4};
                animation:confettiFall ${3 + Math.random() * 3}s linear forwards;
                transform:rotate(${Math.random() * 360}deg);
            `;
            fragment.appendChild(c);
            setTimeout(() => c.remove(), 6000);
        }
        container.appendChild(fragment);
    }, 2000);
}

function initGifts() {
    const container = document.getElementById('giftsContainer');
    if (!container) return;

    const wishes = [
        '✨ Любовь и гармония',
        '💰 Изобилие и достаток',
        '🚀 Вдохновение и идеи',
        '🌈 Радостные моменты',
        '🍎 Крепкое здоровье',
        '✈️ Новые открытия',
        '🍀 Мир и спокойствие',
        '🏡 Уют и душевное тепло'
    ];

    let availableWishes = [...wishes];

    const createGift = () => {
        const gift = document.createElement('div');
        gift.className = 'gift';
        gift.textContent = '🎁';
        gift.addEventListener('click', (e) => {
            if (gift.classList.contains('open')) return;
            gift.classList.add('open');

            if (availableWishes.length === 0) {
                availableWishes = [...wishes];
            }

            const randomIndex = Math.floor(Math.random() * availableWishes.length);
            const chosenWish = availableWishes.splice(randomIndex, 1)[0];

            const popup = document.createElement('div');
            popup.className = 'wish-popup';
            popup.textContent = chosenWish;

            // Unified positioning at the bottom for all devices
            popup.style.left = '50%';
            popup.style.bottom = '20px';
            popup.style.top = 'auto';
            popup.style.transform = 'translateX(-50%) scale(0)';

            document.body.appendChild(popup);

            setTimeout(() => {
                popup.classList.add('fade-out');
                setTimeout(() => {
                    popup.remove();
                    gift.remove();
                    createGift();
                }, 500);
            }, 3000);
        });
        container.appendChild(gift);
    };

    for (let i = 0; i < 4; i++) createGift();
}

document.addEventListener('DOMContentLoaded', () => {
    createStars();
    snowManager = new SnowManager();
    fireworksManager = new FireworksManager();
    parallaxManager = new ParallaxManager();
    garlandManager = new GarlandManager();
    frostManager = new FrostManager();

    launchInitialFireworks();
    createInitialConfetti();
    initGifts();

    updateCountdown();
    const countdownTimer = setInterval(() => {
        updateCountdown();
        if (celebrationStarted) clearInterval(countdownTimer);
    }, 1000);

    const launchButton = document.getElementById('launchButton');
    if (launchButton) {
        launchButton.addEventListener('click', () => {
            for (let i = 0; i < CONFIG.fireworksPerClick; i++) {
                setTimeout(() => fireworksManager.launchRandom(), i * 180);
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#launchButton') && !e.target.closest('.gift') && !e.target.closest('.bulb')) {
            fireworksManager.launch(e.clientX, e.clientY);
        }
    });
});
