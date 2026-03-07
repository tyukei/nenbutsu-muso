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

const soundVolumes = {
    bgm: 0.5,
    shoot: 0.3,
    hit: 0.4,
    hit_bounas: 0.5,
    damage: 0.5,
    gameover: 0.6,
    clear: 0.6,
    start: 1.0,
    rokuharamitsu: 1.0,
    level1: 1.0,
    level2: 1.0,
    level3: 1.0,
    level4: 1.0
};

const pooledSoundSizes = {
    shoot: 3,
    hit: 4,
    hit_bounas: 2,
    damage: 2
};

const soundPools = {};
const soundPoolIndexes = {};
const soundLastPlayAt = {};
const mobileSoundMinIntervalMs = {
    hit: 35,
    shoot: 25
};

function initSoundPools() {
    Object.entries(pooledSoundSizes).forEach(([name, size]) => {
        const base = sounds[name];
        if (!base) return;

        soundPools[name] = [];
        soundPoolIndexes[name] = 0;
        for (let i = 0; i < size; i++) {
            const clone = base.cloneNode();
            clone.volume = soundVolumes[name] ?? 1.0;
            clone.preload = 'auto';
            soundPools[name].push(clone);
        }
    });
}

function getAllAudioElements() {
    const all = [...Object.values(sounds)];
    Object.values(soundPools).forEach(pool => all.push(...pool));
    return all;
}

// BGMの設定
sounds.bgm.loop = true;
sounds.bgm.volume = soundVolumes.bgm;

// 効果音の音量設定
sounds.shoot.volume = soundVolumes.shoot;
sounds.hit.volume = soundVolumes.hit;
sounds.damage.volume = soundVolumes.damage;
sounds.gameover.volume = soundVolumes.gameover;
sounds.clear.volume = soundVolumes.clear;

initSoundPools();

// 音声再生のヘルパー関数
function playSound(soundName) {
    // 音声アンロックが完了していない場合は再生しない
    if (!audioUnlocked) {
        return;
    }

    if (!sounds[soundName]) return;

    // 必殺技発動中(3秒間)は、rokuharamitsu 以外の音を鳴らさない
    if (typeof GS !== 'undefined' && GS.play && GS.play.specialActiveUntil > performance.now() && soundName !== 'rokuharamitsu') {
        return;
    }

    if (document.body.classList.contains('mobile-mode')) {
        const minInterval = mobileSoundMinIntervalMs[soundName] || 0;
        if (minInterval > 0) {
            const now = performance.now();
            const last = soundLastPlayAt[soundName] || 0;
            if (now - last < minInterval) return;
            soundLastPlayAt[soundName] = now;
        }
    }

    // 連打される効果音は再生プールを使って、モバイルでの currentTime 巻き戻し負荷を避ける
    if (soundPools[soundName] && soundPools[soundName].length > 0) {
        const pool = soundPools[soundName];
        const idx = soundPoolIndexes[soundName] % pool.length;
        soundPoolIndexes[soundName] = idx + 1;
        const audio = pool[idx];
        audio.muted = false;
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
        return;
    }

    const audio = sounds[soundName];
    audio.muted = false;
    if (soundName !== 'bgm') {
        audio.currentTime = 0;
    }
    audio.play().catch(e => console.log('Audio play failed:', e));
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
function unlockAudio() {
    if (audioUnlocked || audioUnlocking) return;
    audioUnlocking = true;

    // 全ての音声を無音で一瞬再生してアンロック
    const allAudios = getAllAudioElements();
    for (const audio of allAudios) {

        // 既に再生中の音声（startSoundなど）を止めないようにする
        if (!audio.paused) continue;

        audio.muted = true;
        audio.volume = 0;  // 音量も0にして確実に無音化

        // play() を呼んだ直後に pause() を呼ぶ
        const playPromise = audio.play();
        audio.pause();  // 即座に停止
        audio.currentTime = 0;

        // Promise のエラーを無視
        if (playPromise !== undefined) {
            playPromise.catch(() => { });
        }
    }

    // 即座にアンロック完了とする
    audioUnlocked = true;
    audioUnlocking = false;

    // 少し待ってから音量を元に戻す（音が鳴らないように）
    setTimeout(() => {
        Object.keys(sounds).forEach(key => {
            const audio = sounds[key];
            audio.muted = false;
            audio.volume = soundVolumes[key] ?? 1.0;
        });
        Object.entries(soundPools).forEach(([key, pool]) => {
            for (const audio of pool) {
                audio.muted = false;
                audio.volume = soundVolumes[key] ?? 1.0;
            }
        });
    }, 200);  // 200ms 待機してから音量を復元

    // イベントリスナー削除
    document.removeEventListener('touchstart', unlockAudio);
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
}

document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('click', unlockAudio);
document.addEventListener('keydown', unlockAudio);
