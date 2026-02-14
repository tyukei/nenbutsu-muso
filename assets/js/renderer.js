// ==========================================
// renderer.js — 描画処理 (View)
// ==========================================

const Renderer = {
    stars: [],

    /**
     * 星の初期化
     */
    initStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                alpha: Math.random()
            });
        }
    },

    /**
     * 背景の星を描画
     */
    drawStars() {
        if (this.stars.length === 0) {
            this.initStars();
        }

        ctx.save();
        for (const star of this.stars) {
            // 星の瞬き
            if (Math.random() < 0.05) {
                star.alpha = Math.random();
            }
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        ctx.restore();
    },

    /**
     * プレイヤー（修行僧）を描画
     */
    drawPlayer() {
        ctx.save();
        ctx.translate(player.x, player.y);

        if (monkImage.complete && monkImage.naturalWidth !== 0) {
            const imgSize = 108;
            const yOffset = 6;
            ctx.drawImage(monkImage, -imgSize / 2, -imgSize / 2 + yOffset, imgSize, imgSize);
        } else {
            ctx.fillStyle = '#ff6f00';
            ctx.fillRect(-player.width / 2, -10, player.width, 30);

            ctx.fillStyle = '#ffb74d';
            ctx.beginPath();
            ctx.arc(0, -20, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffe0b2';
            ctx.fillRect(-5, 0, 10, 15);

            ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -10, 30, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    },

    /**
     * 弾（念仏）を描画
     */
    drawBullets() {
        const bullets = GS.entities.bullets;
        const len = bullets.length;
        if (len === 0) return;

        ctx.save();

        if (bulletImage.complete && bulletImage.naturalWidth !== 0) {
            // 画像描画 (2048px -> 28px)
            const size = 28;
            for (let i = 0; i < len; i++) {
                const bullet = bullets[i];
                // 中心に描画
                ctx.drawImage(bulletImage, bullet.x - size / 2, bullet.y - size / 2, size, size);
            }
        } else {
            // フォールバック描画
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#d4af37';
            ctx.shadowColor = '#d4af37';

            for (let i = 0; i < len; i++) {
                const bullet = bullets[i];
                ctx.beginPath();
                ctx.ellipse(bullet.x, bullet.y, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // テキストは画像がない場合だけ描画（あるいはオミット）
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            for (let i = 0; i < len; i++) {
                ctx.fillText('卍', bullets[i].x, bullets[i].y + 5);
            }
        }

        ctx.restore();
    },

    /**
     * テキストの画像キャッシュ
     * key: `text_color`
     * value: HTMLCanvasElement
     */
    textCache: {},

    /**
     * テキスト画像を生成または取得
     */
    getTextImage(text, color) {
        const key = `${text}_${color}`;
        if (this.textCache[key]) {
            return this.textCache[key];
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const fontSize = 24; // 視認性向上のため少し大きく
        const strokeWidth = 2;

        ctx.font = `bold ${fontSize}px "Noto Sans JP", sans-serif`;
        const metrics = ctx.measureText(text);

        // 余白を含めたサイズ
        const padding = 10;
        canvas.width = Math.ceil(metrics.width + strokeWidth * 2 + padding);
        canvas.height = Math.ceil(fontSize + strokeWidth * 2 + padding);

        // 描画設定
        ctx.font = `bold ${fontSize}px "Noto Sans JP", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // 1. 縁取り (視認性向上のため暗い色で)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, cx, cy);

        // 2. メイン文字
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(text, cx, cy);

        this.textCache[key] = canvas;
        return canvas;
    },

    /**
     * 煩悩リストを事前にキャッシュ（初回スポーン時のプチフリーズ防止）
     */
    preCacheEnemies() {
        const colors = ['#FF4081', '#FFD700', '#00E676', '#2979FF', '#FF9100'];
        // 最も一般的な組み合わせをいくつか先に作る
        bonnouList.slice(0, 10).forEach(text => {
            colors.forEach(color => this.getTextImage(text, color));
        });
        ROPPARAMITSU_LIST.forEach(text => this.getTextImage(text, '#FFD700'));
    },

    /**
     * 敵（煩悩）を描画
     */
    drawEnemies() {
        const enemies = GS.entities.enemies;
        const len = enemies.length;
        if (len === 0) return;

        ctx.save();

        // 共通設定
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < len; i++) {
            const enemy = enemies[i];

            // 1. 敵の本体（単純な図形）
            ctx.fillStyle = enemy.color;
            ctx.shadowBlur = 0; // 毎フレームのShadowBlurは重いのでオフ

            ctx.beginPath();
            if (enemy.isNenbutsu) {
                // 円形
                ctx.arc(enemy.getCenterX(), enemy.getCenterY(), enemy.width / 2, 0, Math.PI * 2);
            } else {
                // 逆三角形
                ctx.moveTo(enemy.x, enemy.y);
                ctx.lineTo(enemy.x + enemy.width, enemy.y);
                ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
                ctx.closePath();
            }
            ctx.fill();

            // 2. テキスト（キャッシュ済み画像を使用）
            const textImg = this.getTextImage(enemy.text, enemy.color);
            // 画像の中心を描画位置に合わせる
            ctx.drawImage(textImg,
                enemy.getCenterX() - textImg.width / 2,
                enemy.getCenterY() - textImg.height / 2
            );
        }

        ctx.restore();
    },

    /**
     * パーティクルを描画
     */
    drawParticles() {
        const particles = GS.entities.particles;
        const len = particles.length;
        if (len === 0) return;

        for (let i = 0; i < len; i++) {
            const particle = particles[i];
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life / 40;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },

    /**
     * 「心」を示すボトム境界線（精神力バー）を描画
     */
    drawHeartBar(now) {
        const { play, effects } = GS;

        ctx.save();
        const safeMaxSpirit = Math.max(1, play.maxSpirit);
        const spiritRatio = Math.max(0, play.spirit) / safeMaxSpirit;
        const heartbeat = (Math.sin(now * 0.012) + 1) / 2;
        let barRGB = '255, 105, 180';
        let glowRGB = '255, 105, 180';
        if (spiritRatio <= 0.34) {
            barRGB = '255, 59, 92';
            glowRGB = '255, 45, 85';
        } else if (spiritRatio <= 0.67) {
            barRGB = '211, 70, 154';
            glowRGB = '214, 51, 132';
        }

        let barHeight = 12 + Math.round(heartbeat * 4);
        if (now < effects.heartImpactUntil) {
            const impactProgress = (effects.heartImpactUntil - now) / 260;
            barHeight += Math.ceil(8 * Math.max(0, impactProgress));
        }

        const flashActive = now < effects.heartFlashUntil && Math.floor((effects.heartFlashUntil - now) / 60) % 2 === 0;
        let barAlpha = 0.78 + heartbeat * 0.18;
        let glowAlpha = 0.88 + heartbeat * 0.12;
        let glowBlur = 10 + heartbeat * 8;
        if (flashActive) {
            barRGB = '255, 209, 234';
            glowRGB = '255, 143, 200';
            barAlpha = 0.96;
            glowAlpha = 1.0;
            glowBlur = 16;
        }

        ctx.fillStyle = `rgba(${barRGB}, ${barAlpha.toFixed(3)})`;
        ctx.shadowBlur = glowBlur;
        ctx.shadowColor = `rgba(${glowRGB}, ${glowAlpha.toFixed(3)})`;
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);
        ctx.shadowBlur = 0;

        const highlightHeight = Math.max(2, Math.round(barHeight * 0.35));
        ctx.fillStyle = `rgba(255, 235, 246, ${(0.12 + heartbeat * 0.16).toFixed(3)})`;
        ctx.fillRect(0, canvas.height - barHeight, canvas.width, highlightHeight);

        // 侵入痕（黒い染み）
        const activeStains = [];
        for (const stain of effects.heartStains) {
            const age = now - stain.createdAt;
            if (age >= stain.duration) continue;
            activeStains.push(stain);

            const life = 1 - age / stain.duration;
            const alpha = stain.maxAlpha * life;
            const centerY = canvas.height - barHeight / 2;

            ctx.fillStyle = `rgba(40, 0, 30, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.ellipse(stain.x, centerY, stain.width / 2, Math.max(5, barHeight * 0.95), 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = `rgba(15, 0, 12, ${(alpha * 0.8).toFixed(3)})`;
            ctx.beginPath();
            ctx.ellipse(stain.x, centerY, stain.width * 0.28, Math.max(3, barHeight * 0.6), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        effects.heartStains = activeStains;

        // 六波羅蜜取得時の浄化ライン
        if (now < effects.heartPurifyUntil) {
            const purifyHeight = 4 + Math.round(heartbeat * 2);
            ctx.fillStyle = 'rgba(255, 240, 188, 0.62)';
            ctx.fillRect(0, canvas.height - barHeight - purifyHeight, canvas.width, purifyHeight);
        }
        ctx.restore();
    },

    /**
     * コンボ表示を描画
     */
    drawCombo() {
        if (GS.play.combo > 2) {
            ctx.save();
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 32px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ffd700';
            ctx.fillText(`×${GS.play.combo} COMBO!`, canvas.width / 2, 50);
            ctx.restore();
        }
    },

    /**
     * 六波羅蜜成就・煩悩即菩提バナーを描画
     */
    drawBanner(now) {
        // 煩悩即菩提バナー
        if (now < GS.effects.bonnouSokuBodaiBannerUntil) {
            const remain = GS.effects.bonnouSokuBodaiBannerUntil - now;
            const fadeIn = Math.min(1, (3000 - remain) / 300);
            const fadeOut = Math.min(1, remain / 500);
            const alpha = Math.min(fadeIn, fadeOut);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 25;
            ctx.shadowColor = `rgba(255, 64, 129, ${alpha.toFixed(3)})`;
            ctx.fillStyle = `rgba(255, 200, 220, ${alpha.toFixed(3)})`;
            ctx.font = 'bold 48px "MS Mincho", serif';
            ctx.fillText('煩悩即菩提', canvas.width / 2, canvas.height * 0.4);
            ctx.restore();
            return; // 優先表示
        }

        // 六波羅蜜バナー
        if (now < GS.effects.ropparamitsuBannerUntil) {
            const remain = GS.effects.ropparamitsuBannerUntil - now;
            const fadeIn = Math.min(1, (1100 - remain) / 180);
            const fadeOut = Math.min(1, remain / 260);
            const alpha = Math.min(fadeIn, fadeOut);

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 18;
            ctx.shadowColor = `rgba(255, 215, 90, ${alpha.toFixed(3)})`;
            ctx.fillStyle = `rgba(255, 236, 166, ${alpha.toFixed(3)})`;
            ctx.font = 'bold 44px sans-serif';
            ctx.fillText('六波羅蜜成就', canvas.width / 2, canvas.height * 0.34);
            ctx.restore();
        }
    },

    /**
     * 「Zを押して」プロンプトを描画
     */
    drawPrompt(now) {
        if (document.body.classList.contains('mobile-mode')) return;

        // 必殺技発動可能な場合かつ、必殺技演出中でない場合
        if (GS.play.kudoku >= MAX_KUDOKU && now >= GS.effects.bonnouSokuBodaiBannerUntil) {
            const blink = (Math.sin(now * 0.01) + 1) / 2; // 0.0~1.0
            const alpha = 0.5 + blink * 0.5; // 0.5~1.0

            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(255, 64, 129, ${alpha.toFixed(3)})`;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText('Zを押して必殺技', canvas.width / 2, canvas.height - 100);
            ctx.restore();
        }
    },

    /**
     * メイン描画関数
     */
    draw(timestamp) {
        const now = timestamp || performance.now();

        // 背景クリア（トレイルを消すために不透明度1で塗りつぶし）
        ctx.fillStyle = 'rgb(15, 12, 41)'; // rgba(..., 1)と同じ
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawStars();
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawParticles();
        this.drawHeartBar(now);
        this.drawCombo();
        this.drawBanner(now);
        this.drawPrompt(now);
    }
};
