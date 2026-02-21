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
    gameover: new Audio('sounds/mika/gemover.mp4'),
    clear: new Audio('sounds/mika/clear.mp4'),
    start: new Audio('sounds/mika/start.mp4'),
    rokuharamitsu: new Audio('sounds/mika/rokuharamitsu.mp4'),
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
function unlockAudio() {
    if (audioUnlocked) return;

    // 全ての音声を無音で一瞬再生してアンロック
    Object.keys(sounds).forEach(key => {
        const audio = sounds[key];

        // 既に再生中の音声（startSoundなど）を止めないようにする
        if (!audio.paused) return;

        audio.muted = true;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // playSound()等でミュートが解除された・あるいは再生が意図的に開始された場合はpauseしない
                if (audio.muted) {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = false;
                }
            }).catch(e => {
                // console.log('Audio unlock failed:', e);
                audio.muted = false;
            });
        }
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
