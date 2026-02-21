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

// 仮想ジョイスティックのイベント
const joystickOuter = document.getElementById('joystickOuter');
const joystickInner = document.getElementById('joystickInner');

let joystickActive = false;
let joystickTouchId = null;
let joystickCenterX = 0;
let joystickCenterY = 0;
const joystickMaxDistance = 35; // ジョイスティックの最大移動距離

function initJoystick() {
    const rect = joystickOuter.getBoundingClientRect();
    joystickCenterX = rect.left + rect.width / 2;
    joystickCenterY = rect.top + rect.height / 2;
}

function handleJoystickStart(e) {
    if (GS.screen !== 'playing') return;

    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;

    joystickActive = true;
    joystickTouchId = e.touches ? touch.identifier : 'mouse';
    joystickInner.classList.add('active');

    initJoystick();
    handleJoystickMove(e);
}

function handleJoystickMove(e) {
    if (!joystickActive) return;

    e.preventDefault();
    const touch = e.touches ? e.touches[0] : e;

    const deltaX = touch.clientX - joystickCenterX;
    const deltaY = touch.clientY - joystickCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let moveX = deltaX;
    let moveY = deltaY;

    if (distance > joystickMaxDistance) {
        moveX = (deltaX / distance) * joystickMaxDistance;
        moveY = (deltaY / distance) * joystickMaxDistance;
    }

    joystickInner.style.transform = `translate(${moveX}px, ${moveY}px)`;

    // プレイヤーの移動
    const normalizedX = moveX / joystickMaxDistance;

    if (Math.abs(normalizedX) > 0.2) {
        GS.input.touchLeft = normalizedX < 0;
        GS.input.touchRight = normalizedX > 0;
    } else {
        GS.input.touchLeft = false;
        GS.input.touchRight = false;
    }
}

function handleJoystickEnd(e) {
    if (!joystickActive) return;

    e.preventDefault();
    joystickActive = false;
    joystickTouchId = null;
    joystickInner.classList.remove('active');
    joystickInner.style.transform = 'translate(0, 0)';

    GS.input.touchLeft = false;
    GS.input.touchRight = false;
}

// タッチイベント
joystickOuter.addEventListener('touchstart', handleJoystickStart, { passive: false });
joystickOuter.addEventListener('touchmove', handleJoystickMove, { passive: false });
joystickOuter.addEventListener('touchend', handleJoystickEnd, { passive: false });
joystickOuter.addEventListener('touchcancel', handleJoystickEnd, { passive: false });

// マウスイベント（デバッグ用）
joystickOuter.addEventListener('mousedown', handleJoystickStart);
document.addEventListener('mousemove', (e) => {
    if (joystickActive && joystickTouchId === 'mouse') {
        handleJoystickMove(e);
    }
});
document.addEventListener('mouseup', (e) => {
    if (joystickActive && joystickTouchId === 'mouse') {
        handleJoystickEnd(e);
    }
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

// スワイプ操作の実装（ジョイスティックがない場合のみ有効）
window.addEventListener('touchstart', (e) => {
    if (GS.input.dragTouchId !== null) return;
    if (GS.screen !== 'playing') return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target;

        if (target.closest('.control-btn') ||
            target.closest('.joystick-container') ||
            target.closest('.title-button') ||
            target.closest('.level-btn') ||
            target.closest('.modal') ||
            target.closest('#settingsModal')) {
            continue;
        }

        // モバイルモードではスワイプを無効化（ジョイスティックを使用）
        if (document.body.classList.contains('mobile-mode')) {
            return;
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
