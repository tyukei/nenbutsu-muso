// ==========================================
// game.js — ゲームコアロジック (Controller)
// ==========================================

// ゲーム開始
function startGame(level) {
    GS.reset(level);
    player.x = canvas.width / 2;
    player.y = canvas.height - 80;

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

    GS.time.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

// 弾発射
function shootBullet() {
    const pool = GS.pools.bullets;
    let b;
    if (pool.length > 0) {
        b = pool.pop();
        b.reset(player.x, player.y - 10);
    } else {
        b = new Bullet(player.x, player.y - 10);
    }
    GS.entities.bullets.push(b);
    playSound('shoot');
}

// 敵生成
function spawnEnemy() {
    // 同時に出現する敵の数を制限（「波」のサイズを制限）
    // 画面上部(y < 50)にいる敵が2体以上なら、生成をスキップ
    const freshEnemies = GS.entities.enemies.filter(e => e.y < 50).length;
    if (freshEnemies >= 2) return;

    const settings = levelSettings[GS.level.current];
    const nenbutsuRate = settings.nenbutsuRate ?? 0.3;
    const isNenbutsu = Math.random() < nenbutsuRate;
    const text = isNenbutsu
        ? ROPPARAMITSU_LIST[Math.floor(Math.random() * ROPPARAMITSU_LIST.length)]
        : bonnouList[Math.floor(Math.random() * bonnouList.length)];
    const speed = GS.level.baseSpeed + Math.random() * 1.5 + (GS.play.score * settings.speedIncrease);

    let color;
    if (isNenbutsu) {
        color = '#FFD700';
    } else {
        const range = Math.random() < 0.2 ? 30 : 300;
        const hue = range === 30 ? Math.random() * 30 : 60 + Math.random() * 300;
        color = `hsl(${hue}, 70%, 50%)`;
    }

    const pool = GS.pools.enemies;
    let e;
    if (pool.length > 0) {
        e = pool.pop();
        e.reset(
            Math.random() * (canvas.width - 60) + 30,
            -50, 60, 50, speed, text, color, isNenbutsu
        );
    } else {
        e = new Enemy(
            Math.random() * (canvas.width - 60) + 30,
            -50, 60, 50, speed, text, color, isNenbutsu
        );
    }
    GS.entities.enemies.push(e);
}

// 必殺技
function activateSpecialAttack() {
    if (GS.play.kudoku < MAX_KUDOKU || GS.screen !== 'playing') return;

    const { play, entities } = GS;

    play.kudoku = 0;
    updateUI();

    playSound('rokuharamitsu');

    // BGMの音量を0にする
    if (sounds.bgm) {
        sounds.bgm.volume = 0;
    }

    const now = performance.now();
    play.specialActiveUntil = now + 3000;
    play.specialStartTime = now;

    // バナー表示トリガー (3秒)
    GS.effects.bonnouSokuBodaiBannerUntil = now + 3000;

    // 画面上の敵のうち、煩悩（!isNenbutsu）のみY座標順（上から下）にソートして待機リストへ
    play.specialEnemies = entities.enemies
        .filter(e => !e.isNenbutsu)
        .sort((a, b) => a.y - b.y);

    flashScreen();
}

// ゲームオーバー
function gameOver(win) {
    const { play, level } = GS;
    GS.screen = 'gameover';

    gameOverScreen.classList.remove('hidden');
    infoPanel.classList.add('hidden');
    virtualControls.classList.add('hidden');

    stopSound('bgm');
    if (win) {
        playSound('clear');
        saveClearedLevel(level.current);
    } else {
        playSound('gameover');
        shakeScreen();
    }

    saveRanking(play.score, play.maxCombo);

    const settings = levelSettings[level.current];
    const targetDisplay = settings.isInfinite ? '∞' : level.targetScore;
    const levelValue = settings.isInfinite ? '悪魔' : ({
        easy: '1',
        normal: '2',
        hard: '3',
        demon: '悪魔'
    }[level.current] || level.current);

    if (win) {
        let titleText = '仏性が育ちました!';
        if (level.current === 'hard') {
            titleText = '解脱達成';
        }
        document.getElementById('resultTitle').textContent = titleText;
        document.getElementById('resultText').textContent = `${level.targetScore}の煩悩を全て打ち払いました`;
        document.getElementById('currentScore').innerHTML = `
                    <div class="result-stats-container">
                        <div class="stat-item">
                            <div class="stat-label">仏性Lev</div>
                            <div class="stat-value">${levelValue}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">撃破数</div>
                            <div class="stat-value">${play.score} / ${targetDisplay}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">最大連鎖</div>
                            <div class="stat-value">${play.maxCombo}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">累計功徳</div>
                            <div class="stat-value">${play.totalKudoku}</div>
                        </div>
                    </div>`;
    } else {
        document.getElementById('resultTitle').textContent = '煩悩に呑まれた';
        if (settings.isInfinite) {
            document.getElementById('resultText').textContent = `悪魔の煩悩に呑まれてしまいました...`;
        } else {
            document.getElementById('resultText').textContent = `「${play.lastBonnou}」に心を侵されてしまいました`;
        }
        document.getElementById('currentScore').innerHTML = `
                    <div class="result-stats-container">
                        <div class="stat-item">
                            <div class="stat-label">仏性Lev</div>
                            <div class="stat-value">${levelValue}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">撃破数</div>
                            <div class="stat-value">${play.score} / ${targetDisplay}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">最大連鎖</div>
                            <div class="stat-value">${play.maxCombo}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">累計功徳</div>
                            <div class="stat-value">${play.totalKudoku}</div>
                        </div>
                    </div>`;
    }

    const resultImage = document.getElementById('resultImage');
    resultImage.src = win ? 'images/monk/monk_happy.png' : 'images/monk/monk_sad.png';
}

// ゲーム更新
function update(timeScale) {
    if (GS.screen !== 'playing') return;

    const { play, input, entities, level, effects } = GS;
    const now = performance.now();

    play.frame++;

    // クールダウン管理
    if (input.shootCooldown > 0) {
        input.shootCooldown -= 1 * timeScale;
        if (input.shootCooldown <= 0) {
            input.shootCooldown = 0;
            input.canShoot = true;
        }
    }

    // プレイヤー移動は必殺技中も許可
    if ((input.keys['ArrowLeft'] || input.touchLeft) && player.x > player.width / 2) {
        player.x -= player.speed * timeScale;
    }
    if ((input.keys['ArrowRight'] || input.touchRight) && player.x < canvas.width - player.width / 2) {
        player.x += player.speed * timeScale;
    }

    // 弾の更新は必殺技中も許可
    for (let i = entities.bullets.length - 1; i >= 0; i--) {
        entities.bullets[i].update(timeScale);
        if (entities.bullets[i].isOffScreen()) {
            GS.pools.bullets.push(entities.bullets[i]);
            entities.bullets.splice(i, 1);
        }
    }

    // 必殺技演出中 (時を止める＆順次破壊)
    if (play.specialActiveUntil > now) {
        const elapsed = now - play.specialStartTime;
        const progress = elapsed / 3000; // 0.0 to 1.0

        if (play.specialEnemies && play.specialEnemies.length > 0) {
            const totalToDestroy = play.specialEnemies.length;
            const targetDestroyed = Math.floor(progress * totalToDestroy);

            while (play.specialEnemies.length > 0 && (totalToDestroy - play.specialEnemies.length) < targetDestroyed) {
                const enemy = play.specialEnemies.shift(); // 上から取得

                createParticles(enemy.getCenterX(), enemy.getCenterY(), enemy.color);
                if (!enemy.isNenbutsu) {
                    play.score++;
                    play.combo++;
                    if (play.combo > play.maxCombo) play.maxCombo = play.combo;
                    playSound('hit');
                }

                // entities.enemies から削除
                const idx = entities.enemies.indexOf(enemy);
                if (idx !== -1) {
                    entities.enemies.splice(idx, 1);
                }
                GS.pools.enemies.push(enemy); // プールに戻す
            }
            updateUI();
            if (play.score >= level.targetScore) {
                gameOver(true);
            }
        }

        // パーティクルの更新のみ行って敵の更新/発生をスキップ
        for (let i = entities.particles.length - 1; i >= 0; i--) {
            entities.particles[i].update(timeScale);
            if (entities.particles[i].isDead()) {
                GS.pools.particles.push(entities.particles[i]);
                entities.particles.splice(i, 1);
            }
        }
        return;
    } else {
        // 特別演出が終わったらBGMの音量を戻す (settingsからの取得が理想だが一旦0.5)
        if (sounds.bgm && sounds.bgm.volume < 0.5) {
            let volumeSetting = 0.5;
            try {
                const settings = JSON.parse(localStorage.getItem('nenbunSettings'));
                if (settings && settings.bgm !== undefined) {
                    volumeSetting = settings.bgm;
                }
            } catch (e) { }
            sounds.bgm.volume = volumeSetting;
        }

        if (play.specialEnemies && play.specialEnemies.length > 0) {
            // 万が一時間が過ぎても残っていたら一気に全部倒す
            while (play.specialEnemies.length > 0) {
                const enemy = play.specialEnemies.shift();
                createParticles(enemy.getCenterX(), enemy.getCenterY(), enemy.color);
                if (!enemy.isNenbutsu) {
                    play.score++;
                    play.combo++;
                    if (play.combo > play.maxCombo) play.maxCombo = play.combo;
                }
                const idx = entities.enemies.indexOf(enemy);
                if (idx !== -1) {
                    entities.enemies.splice(idx, 1);
                }
                GS.pools.enemies.push(enemy);
            }
            updateUI();
            if (play.score >= level.targetScore) {
                gameOver(true);
            }
        }
    }

    // 敵の生成
    const settings = levelSettings[level.current];
    const maxEnemies = settings.maxEnemies || 15;

    if (entities.enemies.length < maxEnemies) {
        const currentSpawnRate = Math.max(level.spawnRate - Math.floor(play.score / 10), settings.isInfinite ? 10 : 15);

        if (play.frame % Math.floor(currentSpawnRate) === 0 && (settings.isInfinite || play.score < level.targetScore)) {
            spawnEnemy();
        }
    }

    // 敵の更新
    for (let i = entities.enemies.length - 1; i >= 0; i--) {
        entities.enemies[i].update(timeScale);

        if (entities.enemies[i].isOffScreen()) {
            GS.pools.enemies.push(entities.enemies[i]);
            if (entities.enemies[i].isNenbutsu) {
                entities.enemies.splice(i, 1);
            } else {
                const breachX = entities.enemies[i].getCenterX();
                play.lastBonnou = entities.enemies[i].text;
                showBonnouMessage(entities.enemies[i].text);
                entities.enemies.splice(i, 1);
                play.spirit--;
                triggerHeartBreach(breachX);
                play.combo = 0;
                playSound('damage');
                shakeScreen();
                updateUI();
                if (play.spirit <= 0) {
                    gameOver(false);
                }
            }
            continue;
        }

        // プレイヤーとの衝突判定（六波羅蜜に触れたら功徳回復）
        // 当たり判定を少し小さくして「避けやすく」する（ストレス軽減）
        const hitMarginX = 5;
        const hitMarginY = 5;
        const playerRect = {
            x: player.x - player.width / 2 + hitMarginX,
            y: player.y - 30 + hitMarginY,
            width: player.width - (hitMarginX * 2),
            height: 50 - (hitMarginY * 2)
        };
        if (entities.enemies[i].isNenbutsu && checkCollision(entities.enemies[i], playerRect)) {
            createParticles(entities.enemies[i].getCenterX(),
                entities.enemies[i].getCenterY(),
                entities.enemies[i].color);

            GS.pools.enemies.push(entities.enemies[i]); // Pool return
            entities.enemies.splice(i, 1);

            const prevKudoku = play.kudoku;
            play.kudoku = Math.min(play.kudoku + 1, MAX_KUDOKU);

            // 累計功徳を加算して保存
            play.totalKudoku++;
            GS.saveTotalKudoku();

            if (prevKudoku < MAX_KUDOKU && play.kudoku === MAX_KUDOKU) {
                triggerRoppaBanner();
            }
            triggerHeartPurify();
            updateUI();
            playSound('hit_bounas');
            continue;
        }

        // 弾との衝突判定
        for (let j = entities.bullets.length - 1; j >= 0; j--) {
            // 当たり判定を大きくする（弾を当てやすくする）
            const hitBuffer = 20;
            const enemyRect = {
                x: entities.enemies[i].x - hitBuffer / 2,
                y: entities.enemies[i].y - hitBuffer / 2,
                width: entities.enemies[i].width + hitBuffer,
                height: entities.enemies[i].height + hitBuffer
            };

            if (checkCollision(entities.bullets[j], enemyRect)) {
                createParticles(entities.enemies[i].getCenterX(),
                    entities.enemies[i].getCenterY(),
                    entities.enemies[i].color);

                GS.pools.bullets.push(entities.bullets[j]); // Pool return
                entities.bullets.splice(j, 1);

                GS.pools.enemies.push(entities.enemies[i]); // Pool return (will be spliced below)

                if (entities.enemies[i].isNenbutsu) {
                    entities.enemies.splice(i, 1);
                } else {
                    entities.enemies.splice(i, 1);
                    play.score++;
                    play.combo++;
                    if (play.combo > play.maxCombo) play.maxCombo = play.combo;
                    playSound('hit');
                    updateUI();

                    if (play.score >= level.targetScore) {
                        gameOver(true);
                    }
                }
                break;
            }
        }
    }

    // パーティクルの更新
    for (let i = entities.particles.length - 1; i >= 0; i--) {
        entities.particles[i].update(timeScale);
        if (entities.particles[i].isDead()) {
            GS.pools.particles.push(entities.particles[i]);
            entities.particles.splice(i, 1);
        }
    }
}

// ゲームループ
function gameLoop(timestamp) {
    if (GS.screen !== 'playing') return;

    const deltaTime = timestamp - GS.time.lastTime;
    GS.time.lastTime = timestamp;

    let timeScale = deltaTime / STEP;
    // 60FPS付近の微妙なブレを補正してカクつき(微小な座標ズレ)を防ぐ
    if (timeScale > 0.85 && timeScale < 1.15) {
        timeScale = 1.0;
    } else if (timeScale > 4) {
        timeScale = 4;
    }

    update(timeScale);
    Renderer.draw(timestamp);

    requestAnimationFrame(gameLoop);
}
