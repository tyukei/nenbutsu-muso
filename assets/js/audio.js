// ==========================================
// audio.js — 音声管理
// ==========================================

// BGMと効果音
const sounds = {
    bgm: new Audio('sounds/bgm.mp3'),
    shoot: new Audio('sounds/shoot.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    hit_bounas: new Audio('sounds/hit_bounas.mp3'),
    damage: new Audio('sounds/damage.mp3'),
    gameover: new Audio('sounds/mika/gemover.mp3'),
    clear: new Audio('sounds/mika/clear.mp3'),
    start: new Audio('sounds/mika/start.mp3'),
    rokuharamitsu: new Audio('sounds/mika/rokuharamitsu.mp3'),
    level1: new Audio('sounds/mika/level1.mp3'),
    level2: new Audio('sounds/mika/level2.mp3'),
    level3: new Audio('sounds/mika/level3.mp3'),
    level4: new Audio('sounds/mika/level4.mp3')
};

// BGMの設定
sounds.bgm.loop = true;
sounds.bgm.volume = 0.5;

// 効果音の音量設定
sounds.shoot.volume = 0.3;
sounds.hit.volume = 0.4;
sounds.damage.volume = 0.5;
sounds.gameover.volume = 0.6;
sounds.clear.volume = 0.6;

// 音声再生のヘルパー関数
function playSound(soundName) {
    // 音声アンロックが完了していない場合は再生しない
    if (!audioUnlocked) {
        return;
    }

    if (sounds[soundName]) {
        // 必殺技発動中(3秒間)は、rokuharamitsu 以外の音を鳴らさない
        if (typeof GS !== 'undefined' && GS.play && GS.play.specialActiveUntil > performance.now() && soundName !== 'rokuharamitsu') {
            return;
        }

        sounds[soundName].muted = false;
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Audio play failed:', e));
    }
}

function stopSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].pause();
        sounds[soundName].currentTime = 0;
    }
}

// モバイル等の自動再生制限解除用
let audioUnlocked = false;
let audioUnlocking = false;  // アンロック処理中フラグ
async function unlockAudio() {
    if (audioUnlocked || audioUnlocking) return;
    audioUnlocking = true;

    // 全ての音声を無音で一瞬再生してアンロック
    const promises = [];

    for (const key of Object.keys(sounds)) {
        const audio = sounds[key];

        // 既に再生中の音声（startSoundなど）を止めないようにする
        if (!audio.paused) continue;

        audio.muted = true;
        audio.volume = 0;  // 音量も0にして確実に無音化

        // play() を呼んだ直後に pause() を呼ぶ
        const playPromise = audio.play();
        audio.pause();  // 即座に停止
        audio.currentTime = 0;

        // Promise を収集（エラーは無視）
        if (playPromise !== undefined) {
            promises.push(playPromise.catch(() => { }));
        }
    }

    // すべてのアンロック処理が完了するまで待機
    await Promise.all(promises);

    // 完了後、ミュートと音量を元に戻す
    Object.keys(sounds).forEach(key => {
        const audio = sounds[key];
        audio.muted = false;
        // 各音声の元の音量に戻す
        if (key === 'bgm') audio.volume = 0.5;
        else if (key === 'shoot') audio.volume = 0.3;
        else if (key === 'hit') audio.volume = 0.4;
        else if (key === 'damage') audio.volume = 0.5;
        else if (key === 'gameover') audio.volume = 0.6;
        else if (key === 'clear') audio.volume = 0.6;
        else audio.volume = 1.0;
    });

    audioUnlocked = true;
    audioUnlocking = false;

    // イベントリスナー削除
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
}

document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);
