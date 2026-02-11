// ==========================================
// entities.js — ゲームエンティティのクラス定義
// ==========================================

/**
 * 弾（念仏）クラス
 */
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 20;
        this.speed = 20;
        this.color = '#d4af37';
    }

    update(timeScale) {
        this.y -= this.speed * timeScale;
    }

    isOffScreen() {
        return this.y < -20;
    }
}

/**
 * 敵（煩悩 / 六波羅蜜）クラス
 */
class Enemy {
    constructor(x, y, width, height, speed, text, color, isNenbutsu) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.text = text;
        this.color = color;
        this.hp = 1;
        this.isNenbutsu = isNenbutsu;
    }

    update(timeScale) {
        this.y += this.speed * timeScale;
    }

    isOffScreen() {
        return this.y > canvas.height;
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }
}

/**
 * パーティクルクラス
 */
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 16;
        this.vy = (Math.random() - 0.5) * 16;
        this.life = 40;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }

    update(timeScale) {
        this.x += this.vx * timeScale;
        this.y += this.vy * timeScale;
        this.vy += 0.2 * timeScale;
        this.life -= 1 * timeScale;
    }

    isDead() {
        return this.life <= 0;
    }
}

/**
 * パーティクル生成ヘルパー
 */
function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        GS.entities.particles.push(new Particle(x, y, color));
    }
}

/**
 * 矩形の衝突判定
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}
