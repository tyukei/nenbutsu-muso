// ==========================================
// game.js — ゲームコアロジック
// ==========================================

// ゲーム開始
function startGame(level) {
    currentLevel = level;
    const settings = levelSettings[level];
    targetScore = settings.targetScore;
    baseSpeed = settings.baseSpeed;
    spawnRate = settings.spawnRate;

    gameState = 'playing';
    score = 0;
    spirit = settings.initialSpirit;
    maxSpirit = settings.initialSpirit;
    kudoku = 0;
    combo = 0;
    maxCombo = 0;
    frame = 0;
    lastBonnou = '';
    heartFlashUntil = 0;
    heartImpactUntil = 0;
    heartPurifyUntil = 0;
    heartStains = [];
    ropparamitsuBannerUntil = 0;
    bullets.length = 0;
    enemies.length = 0;
    particles.length = 0;
    player.x = canvas.width / 2;
    touchLeft = false;
    touchRight = false;
    touchSpecial = false;

    titleScreen.classList.add('hidden');
    levelScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    rankingScreen.classList.add('hidden');
    infoPanel.classList.remove('hidden');
    virtualControls.classList.remove('hidden');

    bonnouMessageContainer.innerHTML = '';

    stopSound('gameover');
    stopSound('clear');
    playSound('bgm');

    updateUI();

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// 弾発射
function shootBullet() {
    bullets.push({
        x: player.x,
        y: player.y - 10,
        width: 8,
        height: 20,
        speed: 20,
        color: '#d4af37'
    });
    playSound('shoot');
}

// 敵生成
function spawnEnemy() {
    const settings = levelSettings[currentLevel];
    const nenbutsuRate = settings.nenbutsuRate ?? 0.3;
    const isNenbutsu = Math.random() < nenbutsuRate;
    const ropparamitsuList = ['布施', '持戒', '忍辱', '精進', '禅定', '智慧'];
    const bonnou = isNenbutsu ? ropparamitsuList[Math.floor(Math.random() * ropparamitsuList.length)] : bonnouList[Math.floor(Math.random() * bonnouList.length)];
    const speed = baseSpeed + Math.random() * 1.5 + (score * settings.speedIncrease);

    let hue;
    if (isNenbutsu) {
        hue = null;
    } else {
        const range = Math.random() < 0.2 ? 30 : 300;
        hue = range === 30 ? Math.random() * 30 : 60 + Math.random() * 300;
    }

    enemies.push({
        x: Math.random() * (canvas.width - 60) + 30,
        y: -50,
        width: 60,
        height: 50,
        speed: speed,
        text: bonnou,
        color: isNenbutsu ? '#FFD700' : `hsl(${hue}, 70%, 50%)`,
        hp: 1,
        isNenbutsu: isNenbutsu
    });
}

// パーティクル生成
function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 16,
            life: 40,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

// 衝突判定
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

// 必殺技
function activateSpecialAttack() {
    if (kudoku < maxKudoku || gameState !== 'playing') return;

    let defeatedCount = 0;
    enemies.forEach(enemy => {
        createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
        if (!enemy.isNenbutsu) {
            defeatedCount++;
        }
    });
    enemies.splice(0, enemies.length);

    score += defeatedCount;
    combo += defeatedCount;
    if (combo > maxCombo) maxCombo = combo;

    kudoku = 0;
    updateUI();

    playSound('hit');

    flashScreen();

    if (score >= targetScore) {
        gameOver(true);
    }
}

// ゲームオーバー
function gameOver(win) {
    gameState = 'gameover';
    gameOverScreen.classList.remove('hidden');
    infoPanel.classList.add('hidden');
    virtualControls.classList.add('hidden');

    stopSound('bgm');
    if (win) {
        playSound('clear');
        saveClearedLevel(currentLevel);
    } else {
        playSound('gameover');
        shakeScreen();
    }

    saveRanking(score, maxCombo);

    const settings = levelSettings[currentLevel];
    const targetDisplay = settings.isInfinite ? '∞' : targetScore;
    const levelValue = settings.isInfinite ? '悪魔' : ({
        easy: '1',
        normal: '2',
        hard: '3',
        demon: '悪魔'
    }[currentLevel] || currentLevel);

    if (win) {
        let titleText = '仏性が育ちました!';
        if (currentLevel === 'hard') {
            titleText = '解脱達成';
        }
        document.getElementById('resultTitle').textContent = titleText;
        document.getElementById('resultText').textContent = `${targetScore}の煩悩を全て打ち払いました`;
        document.getElementById('currentScore').innerHTML = `
                    <div class="result-stats-container">
                        <div class="stat-item">
                            <div class="stat-label">仏性Lev</div>
                            <div class="stat-value">${levelValue}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">撃破数</div>
                            <div class="stat-value">${score} / ${targetDisplay}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">最大連鎖</div>
                            <div class="stat-value">${maxCombo}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">獲得功徳</div>
                            <div class="stat-value">${kudoku}</div>
                        </div>
                    </div>`;
    } else {
        document.getElementById('resultTitle').textContent = '煩悩に呑まれた';
        if (settings.isInfinite) {
            document.getElementById('resultText').textContent = `悪魔の煩悩に呑まれてしまいました...`;
        } else {
            document.getElementById('resultText').textContent = `「${lastBonnou}」に心を侵されてしまいました`;
        }
        document.getElementById('currentScore').innerHTML = `
                    <div class="result-stats-container">
                        <div class="stat-item">
                            <div class="stat-label">仏性Lev</div>
                            <div class="stat-value">${levelValue}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">撃破数</div>
                            <div class="stat-value">${score} / ${targetDisplay}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">最大連鎖</div>
                            <div class="stat-value">${maxCombo}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">獲得功徳</div>
                            <div class="stat-value">${kudoku}</div>
                        </div>
                    </div>`;
    }

    const resultImage = document.getElementById('resultImage');
    if (win) {
        resultImage.src = 'images/monk/monk_happy.png';
    } else {
        resultImage.src = 'images/monk/monk_sad.png';
    }
}

// ゲーム更新
function update(timeScale) {
    if (gameState !== 'playing') return;

    // オートハイド判定
    if (!virtualControls.classList.contains('hidden')) {
        if (Date.now() - lastInputTime > HIDE_DELAY) {
            if (!virtualControls.classList.contains('inactive')) {
                virtualControls.classList.add('inactive');
            }
        }
    }

    frame++;

    // クールダウン管理
    if (shootCooldown > 0) {
        shootCooldown -= 1 * timeScale;
        if (shootCooldown <= 0) {
            shootCooldown = 0;
            canShoot = true;
        }
    }

    // プレイヤー移動
    if ((keys['ArrowLeft'] || touchLeft) && player.x > player.width / 2) {
        player.x -= player.speed * timeScale;
    }
    if ((keys['ArrowRight'] || touchRight) && player.x < canvas.width - player.width / 2) {
        player.x += player.speed * timeScale;
    }

    // 弾の更新
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed * timeScale;
        if (bullets[i].y < -20) {
            bullets.splice(i, 1);
        }
    }

    // 敵の生成
    const settings = levelSettings[currentLevel];
    const currentSpawnRate = Math.max(spawnRate - Math.floor(score / 10), settings.isInfinite ? 10 : 15);

    if (frame % Math.floor(currentSpawnRate) === 0 && (settings.isInfinite || score < targetScore)) {
        spawnEnemy();
    }

    // 敵の更新
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed * timeScale;

        if (enemies[i].y > canvas.height) {
            if (enemies[i].isNenbutsu) {
                enemies.splice(i, 1);
            } else {
                const breachX = enemies[i].x + enemies[i].width / 2;
                lastBonnou = enemies[i].text;
                showBonnouMessage(enemies[i].text);
                enemies.splice(i, 1);
                spirit--;
                triggerHeartBreach(breachX);
                combo = 0;
                playSound('damage');
                shakeScreen();
                updateUI();
                if (spirit <= 0) {
                    gameOver(false);
                }
            }
            continue;
        }

        // プレイヤーとの衝突判定（六波羅蜜に触れたらHP回復）
        const playerRect = {
            x: player.x - player.width / 2,
            y: player.y - 30,
            width: player.width,
            height: 50
        };
        if (enemies[i].isNenbutsu && checkCollision(enemies[i], playerRect)) {
            createParticles(enemies[i].x + enemies[i].width / 2,
                enemies[i].y + enemies[i].height / 2,
                enemies[i].color);
            enemies.splice(i, 1);
            const prevKudoku = kudoku;
            kudoku = Math.min(kudoku + 1, maxKudoku);
            if (prevKudoku < maxKudoku && kudoku === maxKudoku) {
                triggerRoppaBanner();
            }
            triggerHeartPurify();
            updateUI();
            playSound('hit_bounas');

            continue;
        }

        // 弾との衝突判定
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (checkCollision(bullets[j], enemies[i])) {
                createParticles(enemies[i].x + enemies[i].width / 2,
                    enemies[i].y + enemies[i].height / 2,
                    enemies[i].color);
                bullets.splice(j, 1);

                if (enemies[i].isNenbutsu) {
                    enemies.splice(i, 1);
                } else {
                    enemies.splice(i, 1);
                    score++;
                    combo++;
                    if (combo > maxCombo) maxCombo = combo;
                    playSound('hit');
                    updateUI();

                    if (score >= targetScore) {
                        gameOver(true);
                    }
                }
                break;
            }
        }
    }

    // パーティクルの更新
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].vx * timeScale;
        particles[i].y += particles[i].vy * timeScale;
        particles[i].vy += 0.2 * timeScale;
        particles[i].life -= 1 * timeScale;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// ゲーム描画
function draw(timestamp) {
    const now = timestamp || performance.now();

    ctx.fillStyle = 'rgba(15, 12, 41, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 背景の星
    if (frame % 5 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 2; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // プレイヤー（修行僧）の描画
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

    // 弾（念仏）の描画
    bullets.forEach(bullet => {
        ctx.save();
        ctx.fillStyle = bullet.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = bullet.color;

        ctx.beginPath();
        ctx.ellipse(bullet.x, bullet.y, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('卍', bullet.x, bullet.y + 5);

        ctx.restore();
    });

    // 敵（煩悩）の描画
    enemies.forEach(enemy => {
        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = enemy.color;

        ctx.beginPath();
        if (enemy.isNenbutsu) {
            ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
                enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
        } else {
            ctx.moveTo(enemy.x, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y);
            ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            ctx.closePath();
        }
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(enemy.text, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

        ctx.restore();
    });

    // パーティクルの描画
    particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 40;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // 「心」を示すボトム境界線
    ctx.save();
    const safeMaxSpirit = Math.max(1, maxSpirit);
    const spiritRatio = Math.max(0, spirit) / safeMaxSpirit;
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
    if (now < heartImpactUntil) {
        const impactProgress = (heartImpactUntil - now) / 260;
        barHeight += Math.ceil(8 * Math.max(0, impactProgress));
    }

    const flashActive = now < heartFlashUntil && Math.floor((heartFlashUntil - now) / 60) % 2 === 0;
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
    for (const stain of heartStains) {
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
    heartStains = activeStains;

    // 六波羅蜜取得時の浄化ライン
    const purifying = now < heartPurifyUntil;
    if (purifying) {
        const purifyHeight = 4 + Math.round(heartbeat * 2);
        ctx.fillStyle = 'rgba(255, 240, 188, 0.62)';
        ctx.fillRect(0, canvas.height - barHeight - purifyHeight, canvas.width, purifyHeight);
    }
    ctx.restore();

    // コンボ表示
    if (combo > 2) {
        ctx.save();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffd700';
        ctx.fillText(`×${combo} COMBO!`, canvas.width / 2, 50);
        ctx.restore();
    }

    if (now < ropparamitsuBannerUntil) {
        const remain = ropparamitsuBannerUntil - now;
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
}

// ゲームループ
function gameLoop(timestamp) {
    if (gameState !== 'playing') return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    let timeScale = deltaTime / STEP;

    if (timeScale > 4) timeScale = 4;

    update(timeScale);
    draw(timestamp);

    requestAnimationFrame(gameLoop);
}
