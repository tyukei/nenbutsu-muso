// ==========================================
// renderer.js — 描画処理 (View)
// ==========================================

const Renderer = {
    /**
     * 背景の星を描画
     */
    drawStars() {
        if (GS.play.frame % 5 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            for (let i = 0; i < 2; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                ctx.fillRect(x, y, 2, 2);
            }
        }
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
        ctx.shadowBlur = 15;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';

        for (let i = 0; i < len; i++) {
            const bullet = bullets[i];
            ctx.fillStyle = bullet.color;
            ctx.shadowColor = bullet.color;

            ctx.beginPath();
            ctx.ellipse(bullet.x, bullet.y, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // テキストは影なしで描画した方が速いが、元の見た目を維持するため影ありのままにするなら上記でOK
        // 元コードではテキスト描画時に shadowBlur = 0 にしていたため、それに合わせる
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';

        for (let i = 0; i < len; i++) {
            const bullet = bullets[i];
            ctx.fillText('卍', bullet.x, bullet.y + 5);
        }

        ctx.restore();
    },

    /**
     * 敵（煩悩）を描画
     */
    drawEnemies() {
        const enemies = GS.entities.enemies;
        const len = enemies.length;
        if (len === 0) return;

        ctx.save();

        // Pass 1: 敵の本体（影あり）
        ctx.shadowBlur = 20;

        for (let i = 0; i < len; i++) {
            const enemy = enemies[i];
            ctx.fillStyle = enemy.color;
            ctx.shadowColor = enemy.color;

            ctx.beginPath();
            if (enemy.isNenbutsu) {
                ctx.ellipse(enemy.getCenterX(), enemy.getCenterY(),
                    enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
            } else {
                ctx.moveTo(enemy.x, enemy.y);
                ctx.lineTo(enemy.x + enemy.width, enemy.y);
                ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
                ctx.closePath();
            }
            ctx.fill();
        }

        // Pass 2: テキスト（影なし）
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < len; i++) {
            const enemy = enemies[i];
            ctx.fillText(enemy.text, enemy.getCenterX(), enemy.getCenterY());
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
     * 六波羅蜜成就バナーを描画
     */
    drawBanner(now) {
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
     * メイン描画関数
     */
    draw(timestamp) {
        const now = timestamp || performance.now();

        // 背景クリア
        ctx.fillStyle = 'rgba(15, 12, 41, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawStars();
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawParticles();
        this.drawHeartBar(now);
        this.drawCombo();
        this.drawBanner(now);
    }
};
