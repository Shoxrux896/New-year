
const CONFIG = {
    stars: 100,
    snowflakes: 30,
    fireworksPerClick: 5,
    targetDate: new Date('2026-01-01T00:00:00').getTime()
};

function createStars() {
    const container = document.getElementById('starsContainer');
    for (let i = 0; i < CONFIG.stars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        star.style.animationDuration = `${2 + Math.random() * 3}s`;
        container.appendChild(star);
    }
}

function createSnowflakes() {
    const container = document.getElementById('snowContainer');
    const snowflakeChars = ['❄', '❅', '❆'];
    for (let i = 0; i < CONFIG.snowflakes; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDuration = `${10 + Math.random() * 20}s`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowflake.style.fontSize = `${0.5 + Math.random() * 1.5}em`;
        snowflake.style.opacity = Math.random() * 0.6 + 0.4;
        container.appendChild(snowflake);
    }
}

let celebrationStarted = false;

function updateCountdown() {
    const now = new Date().getTime();
    const distance = CONFIG.targetDate - now;

    if (distance < 0) {
        if (!celebrationStarted) {
            celebrationStarted = true;
            startCelebration();
        }
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

    // High intensity mode for the last minute
    if (distance <= 60000 && distance > 0) {
        document.body.classList.add('last-minute');
    } else {
        document.body.classList.remove('last-minute');
    }
}

function startCelebration() {
    const countdownEl = document.getElementById('countdown');

    countdownEl.style.transform = 'scale(0.9) translateY(-10px)';


    setTimeout(() => {
        const style = window.getComputedStyle(countdownEl);
        const height = countdownEl.offsetHeight;
        const margin = style.margin;


        countdownEl.style.height = height + 'px';
        countdownEl.style.margin = margin;
        countdownEl.style.overflow = 'hidden';


        void countdownEl.offsetHeight;

        countdownEl.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
        countdownEl.style.height = '0';
        countdownEl.style.marginTop = '0';
        countdownEl.style.marginBottom = '0';
        countdownEl.style.paddingTop = '0';
        countdownEl.style.paddingBottom = '0';
    }, 400);

    setTimeout(() => {
        countdownEl.style.display = 'none';
    }, 1500);

    const wishes = document.getElementById('wishes');
    const launchButton = document.getElementById('launchButton');

    setTimeout(() => {
        launchCelebrationFireworks();
    }, 800);

    const yearDisplay = document.getElementById('yearDisplay');
    setTimeout(() => {
        yearDisplay.style.animation = 'celebrate 2s ease-in-out infinite';
    }, 800);
}

function launchCelebrationFireworks() {
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            fireworksManager.launchRandom();
        }, i * 120);
    }

    for (let burst = 0; burst < 5; burst++) {
        setTimeout(() => {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => fireworksManager.launchRandom(), i * 200);
            }
        }, 2000 + burst * 5000);
    }
}

function launchInitialFireworks() {
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                fireworksManager.launchRandom();
            }, i * 150);
        }
    }, 2000);

    for (let burst = 0; burst < 2; burst++) {
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => fireworksManager.launchRandom(), i * 200);
            }
        }, 5000 + burst * 10000);
    }
}

function createInitialConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.id = 'confettiContainer';
    confettiContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(confettiContainer);

    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd', '#00d2d3', '#ff9ff3'];

    setTimeout(() => {
        for (let i = 0; i < 40; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: absolute;
                    width: ${5 + Math.random() * 10}px;
                    height: ${5 + Math.random() * 10}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}%;
                    top: -20px;
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                    opacity: ${0.6 + Math.random() * 0.4};
                    animation: confettiFall ${3 + Math.random() * 4}s linear forwards;
                    transform: rotate(${Math.random() * 360}deg);
                `;
                confettiContainer.appendChild(confetti);
                setTimeout(() => confetti.remove(), 7000);
            }, i * 50);
        }
    }, 2500);
}

class Firework {
    constructor(canvas, x, y) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.y = y;
        this.particles = [];
        this.hue = Math.random() * 360;

        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 100,
                hue: this.hue + Math.random() * 60
            });
        }
    }

    update() {
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 1;
            p.vx *= 0.99;
            p.vy *= 0.99;
        });
    }

    draw() {
        this.particles.forEach(p => {
            const alpha = p.life / 100;
            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
        });
        this.ctx.shadowBlur = 0;
    }

    isDead() {
        return this.particles.length === 0;
    }
}

class FireworksManager {
    constructor() {
        this.canvas = document.getElementById('fireworks');
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launch(x, y) {
        const firework = new Firework(this.canvas, x, y);
        this.fireworks.push(firework);
        if (!this.animationId) {
            this.animate();
        }
    }

    launchRandom() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height * 0.5;
        this.launch(x, y);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.fireworks.forEach((fw, index) => {
            fw.update();
            fw.draw();
            if (fw.isDead()) {
                this.fireworks.splice(index, 1);
            }
        });

        if (this.fireworks.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
        }
    }
}

let fireworksManager;

document.addEventListener('DOMContentLoaded', () => {
    createStars();
    createSnowflakes();
    fireworksManager = new FireworksManager();
    launchInitialFireworks();
    createInitialConfetti();
    updateCountdown();
    setInterval(updateCountdown, 1000);

    initGifts();
    initParallax();

    const launchButton = document.getElementById('launchButton');
    launchButton.addEventListener('click', () => {
        for (let i = 0; i < CONFIG.fireworksPerClick; i++) {
            setTimeout(() => {
                fireworksManager.launchRandom();
                launchButton.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    launchButton.style.transform = '';
                }, 100);
            }, i * 200);
        }
    });

    document.addEventListener('click', (e) => {
        if (e.target !== launchButton) {
            fireworksManager.launch(e.clientX, e.clientY);
        }
    });
});




function initGifts() {
    const container = document.getElementById('giftsContainer');
    const gifts = ['🎁', '🎁', '🎁', '🎁'];
    const wishesList = [
        '✨ Море любви! ✨',
        '💰 Огромного достатка! 💰',
        '🚀 Креативных идей! 🚀',
        '🌈 Ярких моментов! 🌈',
        '🍎 Крепкого здоровья! 🍎',
        '🎮 Времени на игры! 🎮',
        '✈️ Новых путешествий! ✈️',
        '☀️ Ясных дней! ☀️'
    ];

    let availableWishes = [...wishesList];

    function getUniqueWish() {
        if (availableWishes.length === 0) {
            availableWishes = [...wishesList];
        }
        const index = Math.floor(Math.random() * availableWishes.length);
        const wish = availableWishes.splice(index, 1)[0];
        return wish;
    }

    gifts.forEach(giftEmoji => {
        const gift = document.createElement('div');
        gift.className = 'gift';
        gift.textContent = giftEmoji;

        gift.addEventListener('click', (e) => {
            if (gift.classList.contains('open')) return;

            gift.classList.add('open');
            showWish(e.clientX, e.clientY);


            setTimeout(() => {
                gift.remove();
                addRandomGift();
            }, 3000);
        });

        container.appendChild(gift);
    });

    function addRandomGift() {
        const gift = document.createElement('div');
        gift.className = 'gift';
        gift.textContent = '🎁';
        gift.style.opacity = '0';
        gift.style.transition = 'opacity 1s';

        gift.addEventListener('click', (e) => {
            if (gift.classList.contains('open')) return;
            gift.classList.add('open');
            showWish(e.clientX, e.clientY);
            setTimeout(() => {
                gift.remove();
                addRandomGift();
            }, 3000);
        });

        container.appendChild(gift);
        setTimeout(() => gift.style.opacity = '1', 100);
    }

    function showWish(x, y) {
        const wish = document.createElement('div');
        wish.className = 'wish-popup';
        wish.textContent = getUniqueWish();


        let left = x;
        const screenWidth = window.innerWidth;
        if (screenWidth < 600) {
            left = screenWidth / 2;
        }

        wish.style.left = `${left}px`;
        wish.style.top = `${y}px`;
        document.body.appendChild(wish);

        setTimeout(() => wish.remove(), 3000);
    }
}

function initParallax() {
    const content = document.querySelector('.content');
    const snow = document.getElementById('snowContainer');
    let ticking = false;

    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;

                if (content) content.style.transform = `translate(${x}px, ${y}px)`;
                if (snow) snow.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });
}
