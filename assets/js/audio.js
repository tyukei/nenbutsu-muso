// ==========================================
// audio.js — 音声管理
// ==========================================

// BGMと効果音
const sounds = {
    bgm: new Audio('sounds/bgm.wav'),
    shoot: new Audio('sounds/shoot.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    hit_bounas: new Audio('sounds/hit_bounas.mp3'),
    damage: new Audio('sounds/damage.mp3'),
    gameover: new Audio('sounds/gameover.mp3'),
    clear: new Audio('sounds/clear.mp3'),
    level1: new Audio('sounds/mika/level1.mp4'),
    level2: new Audio('sounds/mika/level2.mp4'),
    level3: new Audio('sounds/mika/level3.mp4'),
    level4: new Audio('sounds/mika/level4.mp4')
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
    if (sounds[soundName]) {
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
function unlockAudio() {
    if (audioUnlocked) return;

    // 全ての音声を無音で一瞬再生してアンロック
    Object.values(sounds).forEach(audio => {
        audio.muted = true;
        audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
        }).catch(e => {
            console.log('Audio unlock failed:', e);
            audio.muted = false;
        });
    });

    audioUnlocked = true;

    // イベントリスナー削除
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
}

document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);
