// ==========================================
// input.js — キー・タッチ・スワイプ入力処理
// ==========================================

// ユーザー入力でタイマーリセット
function resetInputTimer() {
    lastInputTime = Date.now();
    if (virtualControls.classList.contains('inactive')) {
        virtualControls.classList.remove('inactive');
    }
}

window.addEventListener('touchstart', resetInputTimer, { passive: true });
window.addEventListener('mousedown', resetInputTimer);
window.addEventListener('keydown', resetInputTimer);

// キーボードイベント
document.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        if (e.key === 'ArrowLeft') keys['ArrowLeft'] = true;
        if (e.key === 'ArrowRight') keys['ArrowRight'] = true;
        if (e.key === ' ' && canShoot) {
            e.preventDefault();
            shootBullet();
            canShoot = false;
            shootCooldown = 10;
        }
        if ((e.key === 'z' || e.key === 'Z') && kudoku >= maxKudoku) {
            activateSpecialAttack();
        }
    } else {
        keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// タイトルイントロスキップ
titleIntroOverlay.addEventListener('click', skipTitleIntro);
titleIntroOverlay.addEventListener('touchstart', skipTitleIntro, { passive: true });
document.addEventListener('keydown', () => {
    if (titleIntroRunning) {
        skipTitleIntro();
    }
});

// 仮想コントローラーのイベント
// 左ボタン
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchLeft = true;
});
leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchLeft = false;
});
leftBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    touchLeft = true;
});
leftBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    touchLeft = false;
});

// 右ボタン
rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchRight = true;
});
rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchRight = false;
});
rightBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    touchRight = true;
});
rightBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    touchRight = false;
});

// 念仏ボタン
shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing' && canShoot) {
        shootBullet();
        canShoot = false;
        shootCooldown = 10;
    }
});
shootBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (gameState === 'playing' && canShoot) {
        shootBullet();
        canShoot = false;
        shootCooldown = 10;
    }
});

// Special attack button
specialBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (kudoku >= maxKudoku) {
        touchSpecial = true;
        activateSpecialAttack();
    }
});

specialBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchSpecial = false;
});

specialBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (kudoku >= maxKudoku) {
        activateSpecialAttack();
    }
});

// スワイプ操作の実装
window.addEventListener('touchstart', (e) => {
    if (dragTouchId !== null) return;
    if (gameState !== 'playing') return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target;

        if (target.closest('.control-btn') ||
            target.closest('.title-button') ||
            target.closest('.level-btn') ||
            target.closest('.modal') ||
            target.closest('#settingsModal')) {
            continue;
        }

        dragTouchId = touch.identifier;
        lastTouchX = touch.clientX;
        break;
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (dragTouchId === null) return;
    if (gameState !== 'playing') return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === dragTouchId) {
            e.preventDefault();

            const deltaX = touch.clientX - lastTouchX;
            player.x += deltaX;

            if (player.x < 0) player.x = 0;
            if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

            lastTouchX = touch.clientX;
            break;
        }
    }
}, { passive: false });

window.addEventListener('touchend', (e) => {
    if (dragTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === dragTouchId) {
            dragTouchId = null;
            break;
        }
    }
});

window.addEventListener('touchcancel', (e) => {
    if (dragTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === dragTouchId) {
            dragTouchId = null;
            break;
        }
    }
});
