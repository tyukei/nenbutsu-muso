// ==========================================
// input.js — キー・タッチ・スワイプ入力処理
// ==========================================

// ユーザー入力でタイマーリセット
function resetInputTimer() {
    GS.input.lastInputTime = Date.now();
    if (virtualControls.classList.contains('inactive')) {
        virtualControls.classList.remove('inactive');
    }
}

window.addEventListener('touchstart', resetInputTimer, { passive: true });
window.addEventListener('mousedown', resetInputTimer);
window.addEventListener('keydown', resetInputTimer);

// キーボードイベント
document.addEventListener('keydown', (e) => {
    if (GS.screen === 'playing') {
        if (e.key === 'ArrowLeft') GS.input.keys['ArrowLeft'] = true;
        if (e.key === 'ArrowRight') GS.input.keys['ArrowRight'] = true;
        if (e.key === ' ' && GS.input.canShoot) {
            e.preventDefault();
            shootBullet();
            GS.input.canShoot = false;
            GS.input.shootCooldown = 10;
        }
        if ((e.key === 'z' || e.key === 'Z') && GS.play.kudoku >= MAX_KUDOKU) {
            activateSpecialAttack();
        }
    } else {
        GS.input.keys[e.key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    GS.input.keys[e.key] = false;
});

// タイトルイントロスキップ
titleIntroOverlay.addEventListener('click', skipTitleIntro);
titleIntroOverlay.addEventListener('touchstart', skipTitleIntro, { passive: true });
document.addEventListener('keydown', () => {
    if (GS.intro.running) {
        skipTitleIntro();
    }
});

// 仮想コントローラーのイベント
// 左ボタン
leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    GS.input.touchLeft = true;
});
leftBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    GS.input.touchLeft = false;
});
leftBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    GS.input.touchLeft = true;
});
leftBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    GS.input.touchLeft = false;
});

// 右ボタン
rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    GS.input.touchRight = true;
});
rightBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    GS.input.touchRight = false;
});
rightBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    GS.input.touchRight = true;
});
rightBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    GS.input.touchRight = false;
});

// 念仏ボタン
shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (GS.screen === 'playing' && GS.input.canShoot) {
        shootBullet();
        GS.input.canShoot = false;
        GS.input.shootCooldown = 10;
    }
});
shootBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (GS.screen === 'playing' && GS.input.canShoot) {
        shootBullet();
        GS.input.canShoot = false;
        GS.input.shootCooldown = 10;
    }
});

// Special attack button
specialBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (GS.play.kudoku >= MAX_KUDOKU) {
        GS.input.touchSpecial = true;
        activateSpecialAttack();
    }
});

specialBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    GS.input.touchSpecial = false;
});

specialBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (GS.play.kudoku >= MAX_KUDOKU) {
        activateSpecialAttack();
    }
});

// スワイプ操作の実装
window.addEventListener('touchstart', (e) => {
    if (GS.input.dragTouchId !== null) return;
    if (GS.screen !== 'playing') return;

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

        GS.input.dragTouchId = touch.identifier;
        GS.input.lastTouchX = touch.clientX;
        break;
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    if (GS.input.dragTouchId === null) return;
    if (GS.screen !== 'playing') return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === GS.input.dragTouchId) {
            e.preventDefault();

            const scaleFactor = canvas.width / canvas.clientWidth;
            const deltaX = (touch.clientX - GS.input.lastTouchX) * scaleFactor;
            player.x += deltaX;

            if (player.x < 0) player.x = 0;
            if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

            GS.input.lastTouchX = touch.clientX;
            break;
        }
    }
}, { passive: false });

window.addEventListener('touchend', (e) => {
    if (GS.input.dragTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === GS.input.dragTouchId) {
            GS.input.dragTouchId = null;
            break;
        }
    }
});

window.addEventListener('touchcancel', (e) => {
    if (GS.input.dragTouchId === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === GS.input.dragTouchId) {
            GS.input.dragTouchId = null;
            break;
        }
    }
});
