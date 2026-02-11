const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 画面要素
const titleScreen = document.getElementById('titleScreen');
const titleIntroOverlay = document.getElementById('titleIntroOverlay');
const titleMainContent = document.getElementById('titleMainContent');
const titlePersistentPray = document.getElementById('titlePersistentPray');
const introMonkHappy = document.getElementById('introMonkHappy');
const introMonkSad = document.getElementById('introMonkSad');
const introMonkPray = document.getElementById('introMonkPray');
const titleIntroMessage = document.getElementById('titleIntroMessage');
const titleIntroMessageTextMain = document.getElementById('titleIntroMessageTextMain');
const titleIntroMessageTextSub = document.getElementById('titleIntroMessageTextSub');
const levelScreen = document.getElementById('levelScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const rankingScreen = document.getElementById('rankingScreen');
const rankingList = document.getElementById('rankingList');
const infoPanel = document.getElementById('info');
const virtualControls = document.getElementById('virtualControls');
const versionDisplay = document.getElementById('version-display');
const scoreDisplay = document.getElementById('score');
const targetScoreDisplay = document.getElementById('targetScore');
const spiritDisplay = document.getElementById('spirit');
const kudokuDisplay = document.getElementById('kudoku');
const comboDisplay = document.getElementById('combo');
const levelDisplay = document.getElementById('levelDisplay');

// ボタン
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const rankingBtn = document.getElementById('rankingBtn');
const backToTitleBtn = document.getElementById('backToTitleBtn');
const toTitleBtn = document.getElementById('toTitleBtn');

// ToS & Tutorial Elements
const tosModal = document.getElementById('tosModal');
const tosAgreeBtn = document.getElementById('tosAgreeBtn');
const tutorialModal = document.getElementById('tutorialModal');
const prevSlideBtn = document.getElementById('prevSlideBtn');
const nextSlideBtn = document.getElementById('nextSlideBtn');
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;

// 仮想コントローラーボタン
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');
const specialBtn = document.getElementById('specialBtn');

// タッチ操作の状態
let touchLeft = false;
let touchRight = false;
let touchSpecial = false;

// スワイプ操作用変数
let dragTouchId = null;
let lastTouchX = 0;

// オートハイド機能用
let lastInputTime = Date.now();
const HIDE_DELAY = 3000; // 3秒で非表示

// 画像リソース
const monkImage = new Image();
monkImage.src = 'images/monk/monk_back.png';

// BGMと効果音
const sounds = {
    bgm: new Audio('sounds/bgm.wav'),
    shoot: new Audio('sounds/shoot.mp3'),
    hit: new Audio('sounds/hit.mp3'),
    hit_bounas: new Audio('sounds/hit_bounas.mp3'),
    damage: new Audio('sounds/damage.mp3'),
    gameover: new Audio('sounds/gameover.mp3'),
    clear: new Audio('sounds/clear.mp3')
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

// ゲーム状態
let gameState = 'title'; // 'title', 'level', 'playing', 'gameover', 'ranking'
let score = 0;
let spirit = 3;      // 精神力（HPシステム）
let maxSpirit = 3;   // 現在難易度での最大精神力
let kudoku = 0;      // 功徳（MPシステム）
const maxKudoku = 6; // 最大功徳
let combo = 0;
let maxCombo = 0;
let frame = 0;
let lastBonnou = ''; // 最後にやられた煩悩
let heartFlashUntil = 0;
let heartImpactUntil = 0;
let heartPurifyUntil = 0;
let heartStains = [];
let ropparamitsuBannerUntil = 0;
let titleIntroPlayed = false;
let titleIntroRunning = false;
let titleIntroTimers = [];
let titleIntroTypingTimer = null;
const titleIntroPhraseMain = '降り注ぐ煩悩の雨……\n迷わず撃て！悟りはその先にある。';
const titleIntroPhraseSub = '究極の徳（ハイスコア）を目指せ！';
const introRedWord = '煩悩';

// 煩悩メッセージ表示
const bonnouMessageContainer = document.getElementById('bonnouMessageContainer');

function showBonnouMessage(bonnouText) {
    // メッセージアイテムを作成
    const description = bonnouDescriptions[bonnouText] || '心を乱す煩悩';
    const messageItem = document.createElement('div');
    messageItem.className = 'bonnou-message-item';
    messageItem.innerHTML = `
                <div class="bonnou-title">「${bonnouText}」</div>
                <div class="bonnou-desc">${description}</div>
            `;

    // コンテナに追加（最新のメッセージが上に来るように）
    bonnouMessageContainer.insertBefore(messageItem, bonnouMessageContainer.firstChild);

    // スマホの場合（mobile-mode）、3秒経ったら消えるようにする
    if (document.body.classList.contains('mobile-mode')) {
        setTimeout(() => {
            messageItem.style.transition = 'opacity 0.5s';
            messageItem.style.opacity = '0';
            setTimeout(() => {
                if (messageItem.parentNode) {
                    messageItem.remove();
                }
            }, 500);
        }, 3000);
    }
}

function triggerHeartBreach(x) {
    const now = performance.now();
    heartFlashUntil = now + 260;
    heartImpactUntil = now + 260;

    const safeMaxSpirit = Math.max(1, maxSpirit);
    const dangerRatio = 1 - Math.max(0, spirit) / safeMaxSpirit;
    heartStains.push({
        x: Math.max(0, Math.min(canvas.width, x)),
        width: 42 + Math.random() * 34,
        createdAt: now,
        duration: 2600 + dangerRatio * 2200,
        maxAlpha: 0.28 + dangerRatio * 0.25
    });

    if (heartStains.length > 18) heartStains.shift();
}

function triggerHeartPurify() {
    heartPurifyUntil = performance.now() + 800;
}

function triggerRoppaBanner() {
    ropparamitsuBannerUntil = performance.now() + 1100;
}


// 難易度設定
let currentLevel = 'normal';
let targetScore = 108; // クリアに必要な撃破数
let baseSpeed = 1; // 基本速度
let spawnRate = 40; // 敵出現間隔（小さいほど頻繁）

const levelSettings = {
    easy: {
        name: '仏性Lev1',
        targetScore: 36,
        baseSpeed: 0.9,
        spawnRate: 34,
        speedIncrease: 0.04,
        nenbutsuRate: 0.5,
        isInfinite: false,
        initialSpirit: 3
    },
    normal: {
        name: '仏性Lev2',
        targetScore: 72,
        baseSpeed: 1.5,
        spawnRate: 25, // Reduced from 40
        speedIncrease: 0.06,
        isInfinite: false,
        initialSpirit: 4
    },
    hard: {
        name: '仏性Lev3',
        targetScore: 108,
        baseSpeed: 2.5,
        spawnRate: 20, // Reduced from 30
        speedIncrease: 0.08,
        isInfinite: false,
        initialSpirit: 5
    },
    demon: {
        name: 'Lev悪魔',
        targetScore: 324,
        baseSpeed: 3.0,
        spawnRate: 15, // Reduced from 25
        speedIncrease: 0.12, // より速く加速
        nenbutsuRate: 0.3,
        isInfinite: false,
        initialSpirit: 5
    }
};

// 煩悩のリスト
const bonnouList = [
    '貪欲', '瞋恚', '愚痴', '慢心', '疑惑', '邪見',
    '怒り', '執着', '嫉妬', '傲慢', '怠惰', '無知',
    '欲望', '憎悪', '迷い', '妄想', '煩悶', '苦悩',
    '渇愛', '我執', '邪念', '雑念', '妄執', '煩い',
    '不安', '恐怖', '後悔', '焦燥', '絶望', '孤独'
];

// 煩悩の説明と対処法
const bonnouDescriptions = {
    '貪欲': '限りない欲望 → 足るを知る心で対処',
    '瞋恚': '激しい怒り → 慈悲の心で鎮める',
    '愚痴': '真理への無知 → 智慧を磨いて克服',
    '慢心': '傲慢な心 → 謙虚さを忘れずに',
    '疑惑': '疑いの心 → 信じる心を持つ',
    '邪見': '誤った見解 → 正しい理解を求める',
    '怒り': '心を乱す感情 → 深呼吸で心を落ち着ける',
    '執着': '手放せない心 → 無常を受け入れる',
    '嫉妬': '他者を妬む心 → 自分の道を歩む',
    '傲慢': '自己を過信 → 他者から学ぶ姿勢を',
    '怠惰': '怠ける心 → 精進の心で克服',
    '無知': '知らないこと → 学び続ける心を',
    '欲望': '際限ない欲求 → 必要十分を知る',
    '憎悪': '憎しみの心 → 許しの心で解放',
    '迷い': '道に迷う心 → 目的を明確に',
    '妄想': '現実離れした思考 → 今ここに集中',
    '煩悶': '心の苦しみ → 受け入れることから',
    '苦悩': '深い悩み → 一つずつ解決を',
    '渇愛': '渇くような欲望 → 感謝の心で満たす',
    '我執': '自我への執着 → 無我の境地へ',
    '邪念': '邪な考え → 正しい思考を保つ',
    '雑念': '散漫な思考 → 瞑想で心を整える',
    '妄執': '誤った執着 → 真実を見極める',
    '煩い': '心の煩わしさ → 静寂の中で休む',
    '不安': '先への恐れ → 今を大切に生きる',
    '恐怖': '恐れの感情 → 勇気を持って向き合う',
    '後悔': '過去への囚われ → 今から始める',
    '焦燥': '焦る心 → ゆっくり着実に',
    '絶望': '希望を失う → 小さな光を見つける',
    '孤独': '孤立感 → つながりを感じる'
};

// プレイヤー
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 12 // Doubled from 6
};

// キー入力
const keys = {};
let canShoot = true;
let shootCooldown = 0;

// ゲームオブジェクト
const bullets = [];
const enemies = [];
const particles = [];

// ランキングデータ
function loadRankings() {
    const saved = localStorage.getItem('nenbunRankings');
    return saved ? JSON.parse(saved) : [];
}

function saveRanking(score, combo) {
    const rankings = loadRankings();
    const now = new Date();
    rankings.push({
        score: score,
        combo: combo,
        level: currentLevel,
        levelName: levelSettings[currentLevel].name,
        target: targetScore,
        date: now.toLocaleDateString('ja-JP')
    });
    rankings.sort((a, b) => b.score - a.score);
    rankings.splice(10); // 上位10件のみ保存
    localStorage.setItem('nenbunRankings', JSON.stringify(rankings));
}

// レベル進行システム
function loadClearedLevels() {
    const saved = localStorage.getItem('nenbunClearedLevels');
    return saved ? JSON.parse(saved) : [];
}

function saveClearedLevel(level) {
    const cleared = loadClearedLevels();
    if (!cleared.includes(level)) {
        cleared.push(level);
        localStorage.setItem('nenbunClearedLevels', JSON.stringify(cleared));
    }
}

function isLevelUnlocked(level) {
    const cleared = loadClearedLevels();
    if (level === 'easy') return true; // 仏性Lev1は常に解放
    if (level === 'normal') return cleared.includes('easy'); // 仏性Lev2はLev1クリアで解放
    if (level === 'hard') return cleared.includes('normal'); // 仏性Lev3はLev2クリアで解放
    if (level === 'demon') return cleared.includes('hard'); // Lev悪魔はLev3クリアで解放
    return false;
}

function displayRankings() {
    const rankings = loadRankings();

    if (rankings.length === 0) {
        rankingList.innerHTML = '<p class="ranking-empty">まだ記録がありません</p>';
        return;
    }

    let html = '';
    rankings.forEach((rank, index) => {
        const isTop3 = index < 3;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        const levelLabel = rank.levelName || '中級';
        html += `
                    <div class="rank-item ${isTop3 ? 'top3' : ''}">
                        <span class="rank-number">${medal} ${index + 1}位</span>
                        <span class="rank-score">[${levelLabel}] ${rank.score}体撃破 (連鎖×${rank.combo})</span>
                        <span class="rank-date">${rank.date}</span>
                    </div>
                `;
    });
    rankingList.innerHTML = html;
}

// ユーザー入力でタイマーリセット
function resetInputTimer() {
    // プレイ中以外は処理しない（ただしスタート時などはリセットしたいかも？とりあえずプレイ中のみでOK）
    lastInputTime = Date.now();
    if (virtualControls.classList.contains('inactive')) {
        virtualControls.classList.remove('inactive');
    }
}

window.addEventListener('touchstart', resetInputTimer, { passive: true });
window.addEventListener('mousedown', resetInputTimer);
window.addEventListener('keydown', resetInputTimer);

// イベントリスナー
document.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        if (e.key === 'ArrowLeft') keys['ArrowLeft'] = true;
        if (e.key === 'ArrowRight') keys['ArrowRight'] = true;
        if (e.key === ' ' && canShoot) {
            e.preventDefault(); // Prevent default spacebar action (scrolling)
            shootBullet();
            canShoot = false;
            shootCooldown = 10;
        }
        // Special attack with Z key
        if ((e.key === 'z' || e.key === 'Z') && kudoku >= maxKudoku) {
            activateSpecialAttack();
        }
    } else {
        keys[e.key] = true; // Keep general key tracking for non-playing states if needed
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

titleIntroOverlay.addEventListener('click', skipTitleIntro);
titleIntroOverlay.addEventListener('touchstart', skipTitleIntro, { passive: true });
document.addEventListener('keydown', () => {
    if (titleIntroRunning) {
        skipTitleIntro();
    }
});

startBtn.addEventListener('click', showLevelSelect);
restartBtn.addEventListener('click', showLevelSelect);
rankingBtn.addEventListener('click', showRanking);
backToTitleBtn.addEventListener('click', showTitle);
toTitleBtn.addEventListener('click', showTitle);

// X (Twitter) シェアボタン
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', shareToTwitter);

// デバイス・OS・ブラウザ判定機能
function detectDeviceInfo() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    const result = {
        os: 'unknown',          // OS種別: android, ios, windows, macos, linux
        device: 'desktop',      // デバイス種別: mobile, tablet, desktop
        browser: 'unknown',     // ブラウザ種別: chrome, safari, firefox, edge
        isTouch: false          // タッチデバイスかどうか
    };

    // OS判定
    if (/android/i.test(userAgent)) {
        result.os = 'android';
        result.device = 'mobile';
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        result.os = 'ios';
        result.device = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    } else if (/Win/.test(userAgent)) {
        result.os = 'windows';
    } else if (/Mac/.test(userAgent)) {
        result.os = 'macos';
    } else if (/Linux/.test(userAgent)) {
        result.os = 'linux';
    }

    // タブレット判定（Android）
    if (result.os === 'android' && !/mobile/i.test(userAgent)) {
        result.device = 'tablet';
    }

    // ブラウザ判定
    if (/Edg/.test(userAgent)) {
        result.browser = 'edge';
    } else if (/Chrome/.test(userAgent)) {
        result.browser = 'chrome';
    } else if (/Safari/.test(userAgent)) {
        result.browser = 'safari';
    } else if (/Firefox/.test(userAgent)) {
        result.browser = 'firefox';
    }

    // タッチデバイス判定
    result.isTouch = ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);

    // iPadOS 13+ detection (MacIntel + TouchPoints)
    if (result.os === 'macos' && result.isTouch && navigator.maxTouchPoints > 1) {
        result.os = 'ios';
        result.device = 'tablet';
    }

    return result;
}

// デバイス情報を取得してグローバル変数に保存
const deviceInfo = detectDeviceInfo();

// デバッグ用：コンソールにデバイス情報を表示
console.log('🔍 デバイス情報:', deviceInfo);
console.log(`📱 OS: ${deviceInfo.os}`);
console.log(`💻 デバイス: ${deviceInfo.device}`);
console.log(`🌐 ブラウザ: ${deviceInfo.browser}`);
console.log(`👆 タッチ: ${deviceInfo.isTouch ? '対応' : '非対応'}`);

// Mobile Mode Logic
function checkMobileMode() {
    // 初回ロード時：デバイス情報から自動判定（常に実行）
    let autoMode = 'pc'; // デフォルトはPC

    // モバイル、タブレット、またはタッチ対応デバイスの場合はモバイルモード
    if (deviceInfo.device === 'mobile' || deviceInfo.device === 'tablet' || deviceInfo.isTouch) {
        autoMode = 'mobile';
        document.body.classList.add('mobile-mode');
        console.log('📱 モバイル/タッチデバイスを検出 → モバイルモードに自動設定');
    } else {
        // デスクトップの場合はPCモード
        document.body.classList.remove('mobile-mode');
        console.log('💻 PCデバイスを検出 → PCモードに自動設定');
    }

    // 自動判定した設定をlocalStorageに保存（または更新）
    const savedSettings = localStorage.getItem('nenbunSettings');
    let settings = savedSettings ? JSON.parse(savedSettings) : {};

    // 既存の設定があっても、OSベースの自動判定を優先して上書き
    settings.mode = autoMode;
    settings.bgmEnabled = settings.bgmEnabled !== undefined ? settings.bgmEnabled : true;
    settings.seEnabled = settings.seEnabled !== undefined ? settings.seEnabled : true;

    localStorage.setItem('nenbunSettings', JSON.stringify(settings));
    console.log('💾 OS検出に基づいて設定を更新しました:', settings);
}

// Run initial check
checkMobileMode();

function shareToTwitter() {
    const levelName = levelSettings[currentLevel].name;
    const settings = levelSettings[currentLevel];
    const targetDisplay = settings.isInfinite ? '∞' : targetScore;
    const isWin = score >= targetScore && !settings.isInfinite;

    // シェアテキストを作成
    let shareText = `煩悩退散〜修行僧の葛藤〜\n`;
    shareText += `【${levelName}】\n`;

    if (isWin) {
        shareText += `✨仏性が育ちました！✨\n`;
    } else {
        shareText += `煩悩に呑まれた...\n`;
    }

    shareText += `撃破数: ${score}/${targetDisplay}\n`;
    shareText += `最大連鎖: ${maxCombo}\n`;

    // ハッシュタグを追加
    shareText += `\n#煩悩退散 #般若心経EDM\n`;
    shareText += `\nhttps://tyukei.github.io/nenbutsu-muso/`;

    // X (Twitter) のシェアURLを作成
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

    // 新しいウィンドウで開く
    window.open(twitterUrl, '_blank', 'width=550,height=420');
}


// レベル選択ボタン
document.getElementById('levelEasy').addEventListener('click', () => {
    playSound('hit');
    startGame('easy');
});
document.getElementById('levelNormal').addEventListener('click', () => {
    playSound('hit');
    startGame('normal');
});
document.getElementById('levelHard').addEventListener('click', () => {
    playSound('hit');
    startGame('hard');
});
document.getElementById('levelDemon').addEventListener('click', () => {
    playSound('hit');
    startGame('demon');
});
document.getElementById('backFromLevelBtn').addEventListener('click', showTitle);

// パスワード解放ボタン
const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const passwordMessage = document.getElementById('passwordMessage');

const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
const passwordCancelBtn = document.getElementById('passwordCancelBtn');



passwordCancelBtn.addEventListener('click', () => {
    passwordModal.classList.add('hidden');
});

passwordSubmitBtn.addEventListener('click', checkPassword);

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

function checkPassword() {
    const password = passwordInput.value.trim();
    const cleared = loadClearedLevels();
    let unlocked = false;
    let message = '';

    // パスワードごとに異なるレベルを解放
    if (password === 'nenbutsu-mashimashi1') {
        // 仏性Lev2を解放（easyをクリア済みにする）
        if (!cleared.includes('easy')) {
            cleared.push('easy');
        }
        localStorage.setItem('nenbunClearedLevels', JSON.stringify(cleared));
        message = '✓ 仏性Lev2を解放しました！';
        unlocked = true;
    } else if (password === 'nenbutsu-mashimashi2') {
        // 仏性Lev3を解放（easy, normalをクリア済みにする）
        if (!cleared.includes('easy')) {
            cleared.push('easy');
        }
        if (!cleared.includes('normal')) {
            cleared.push('normal');
        }
        localStorage.setItem('nenbunClearedLevels', JSON.stringify(cleared));
        message = '✓ 仏性Lev3を解放しました！';
        unlocked = true;
    } else if (password === 'nenbutsu-mashimashi3') {
        // Lev悪魔を解放（easy, normal, hardをクリア済みにする）
        if (!cleared.includes('easy')) {
            cleared.push('easy');
        }
        if (!cleared.includes('normal')) {
            cleared.push('normal');
        }
        if (!cleared.includes('hard')) {
            cleared.push('hard');
        }
        localStorage.setItem('nenbunClearedLevels', JSON.stringify(cleared));
        message = '✓ Lev悪魔を解放しました！';
        unlocked = true;
    }

    if (unlocked) {
        passwordMessage.textContent = message;
        passwordMessage.className = 'success';

        setTimeout(() => {
            passwordModal.classList.add('hidden');
            showLevelSelect(); // レベル選択画面を更新
        }, 1500);
    } else {
        passwordMessage.textContent = '✗ パスワードが違います';
        passwordMessage.className = 'error';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

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
    // 既にドラッグ中なら無視
    if (dragTouchId !== null) return;

    // ゲーム中以外は無視
    if (gameState !== 'playing') return;

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target;

        // ボタン類へのタッチは除外
        if (target.closest('.control-btn') ||
            target.closest('.title-button') ||
            target.closest('.level-btn') ||
            target.closest('.modal') ||
            target.closest('#settingsModal')) {
            continue;
        }

        // 有効なドラッグ開始
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
            // スクロール防止
            e.preventDefault();

            const deltaX = touch.clientX - lastTouchX;
            player.x += deltaX;

            // 画面外に出ないように制限
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

function clearTitleIntroTimers() {
    titleIntroTimers.forEach(timer => clearTimeout(timer));
    titleIntroTimers = [];
    if (titleIntroTypingTimer) {
        clearInterval(titleIntroTypingTimer);
        titleIntroTypingTimer = null;
    }
}

function queueTitleIntro(callback, delay) {
    const timer = setTimeout(callback, delay);
    titleIntroTimers.push(timer);
}

function resetTitleIntroVisualState() {
    titleIntroOverlay.classList.remove('hidden', 'intro-fadeout');
    introMonkHappy.classList.remove('intro-active');
    introMonkSad.classList.remove('intro-active');
    introMonkPray.classList.remove('intro-active');
    titleIntroMessage.classList.remove('intro-active');
    titleIntroMessageTextMain.innerHTML = '';
    titleIntroMessageTextSub.textContent = '';
    titleMainContent.classList.remove('intro-visible');
    titlePersistentPray.classList.remove('visible');
    titlePersistentPray.classList.add('hidden');
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderIntroMainText(typedText) {
    const redStart = titleIntroPhraseMain.indexOf(introRedWord);
    const redEnd = redStart + introRedWord.length;

    if (redStart < 0) {
        titleIntroMessageTextMain.innerHTML = escapeHtml(typedText);
        return;
    }

    let html = '';
    if (typedText.length <= redStart) {
        html = escapeHtml(typedText);
    } else {
        html += escapeHtml(typedText.slice(0, redStart));
        const redTypedLength = Math.min(typedText.length - redStart, introRedWord.length);
        if (redTypedLength > 0) {
            html += `<span class="text-bonnou-red">${escapeHtml(introRedWord.slice(0, redTypedLength))}</span>`;
        }
        if (typedText.length > redEnd) {
            html += escapeHtml(typedText.slice(redEnd));
        }
    }
    titleIntroMessageTextMain.innerHTML = html;
}

function alignIntroMessageToInstruction() {
    const instruction = titleMainContent.querySelector('.instruction');
    if (!instruction) return;
    const screenRect = titleScreen.getBoundingClientRect();
    const instructionRect = instruction.getBoundingClientRect();
    titleIntroMessage.style.left = `${instructionRect.left - screenRect.left}px`;
    titleIntroMessage.style.top = `${instructionRect.top - screenRect.top}px`;
    titleIntroMessage.style.width = `${instructionRect.width}px`;
    titleIntroMessage.style.maxWidth = `${instructionRect.width}px`;
}

function finishTitleIntro() {
    clearTitleIntroTimers();
    titleIntroRunning = false;
    titleIntroPlayed = true;

    introMonkHappy.classList.add('intro-active');
    introMonkSad.classList.add('intro-active');
    introMonkPray.classList.add('intro-active');
    titleIntroMessage.classList.add('intro-active');
    renderIntroMainText(titleIntroPhraseMain);
    titleIntroMessageTextSub.textContent = titleIntroPhraseSub;
    titlePersistentPray.classList.remove('hidden');
    titlePersistentPray.classList.add('visible');
    titleMainContent.classList.add('intro-visible');
    titleIntroOverlay.classList.add('intro-fadeout');

    queueTitleIntro(() => {
        titleIntroOverlay.classList.add('hidden');
        titleIntroOverlay.classList.remove('intro-fadeout');
    }, 220);
}

function skipTitleIntro() {
    if (!titleIntroRunning) return;
    finishTitleIntro();
}

function startTitleIntro() {
    clearTitleIntroTimers();
    titleIntroRunning = true;
    resetTitleIntroVisualState();
    alignIntroMessageToInstruction();
    titleIntroMessage.classList.add('intro-active');

    let charIndex = 0;
    const fullText = `${titleIntroPhraseMain}\n${titleIntroPhraseSub}`;
    const threshold = titleIntroPhraseMain.length;
    titleIntroTypingTimer = setInterval(() => {
        if (!titleIntroRunning) return;
        charIndex += 1;
        if (charIndex <= threshold) {
            renderIntroMainText(titleIntroPhraseMain.slice(0, charIndex));
            titleIntroMessageTextSub.textContent = '';
        } else {
            renderIntroMainText(titleIntroPhraseMain);
            titleIntroMessageTextSub.textContent = titleIntroPhraseSub.slice(0, charIndex - threshold - 1);
        }
        if (charIndex >= fullText.length) {
            clearInterval(titleIntroTypingTimer);
            titleIntroTypingTimer = null;

            queueTitleIntro(() => introMonkHappy.classList.add('intro-active'), 300);
            queueTitleIntro(() => introMonkSad.classList.add('intro-active'), 800);
            queueTitleIntro(() => introMonkPray.classList.add('intro-active'), 1300);
            queueTitleIntro(() => titleMainContent.classList.add('intro-visible'), 1900);
            queueTitleIntro(() => finishTitleIntro(), 2300);
        }
    }, 110);
}

function showTitle() {
    gameState = 'title';
    titleScreen.classList.remove('hidden');
    levelScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    rankingScreen.classList.add('hidden');
    infoPanel.classList.add('hidden');
    virtualControls.classList.add('hidden');
    bonnouMessageContainer.innerHTML = ''; // Added: clear bonnou messages

    if (!titleIntroPlayed) {
        startTitleIntro();
    } else {
        clearTitleIntroTimers();
        titleIntroRunning = false;
        titleIntroOverlay.classList.add('hidden');
        titleIntroOverlay.classList.remove('intro-fadeout');
        titlePersistentPray.classList.remove('hidden');
        titlePersistentPray.classList.add('visible');
        titleMainContent.classList.add('intro-visible');
    }
}

function showLevelSelect() {
    gameState = 'level';
    titleScreen.classList.add('hidden');
    levelScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    rankingScreen.classList.add('hidden');
    bonnouMessageContainer.innerHTML = ''; // Added: clear bonnou messages

    // レベルのロック状態を更新
    const levelEasyBtn = document.getElementById('levelEasy');
    const levelNormalBtn = document.getElementById('levelNormal');
    const levelHardBtn = document.getElementById('levelHard');

    // 仏性Lev1は常に解放
    levelEasyBtn.disabled = false;

    // 仏性Lev2の解放状態
    const normalUnlocked = isLevelUnlocked('normal');
    levelNormalBtn.disabled = !normalUnlocked;
    const normalLock = levelNormalBtn.querySelector('.level-lock');
    if (normalLock) {
        normalLock.style.display = normalUnlocked ? 'none' : 'block';
    }

    // 仏性Lev3の解放状態
    const hardUnlocked = isLevelUnlocked('hard');
    levelHardBtn.disabled = !hardUnlocked;
    const hardLock = levelHardBtn.querySelector('.level-lock');
    if (hardLock) {
        hardLock.style.display = hardUnlocked ? 'none' : 'block';
    }

    // Lev悪魔の表示/非表示
    const demonUnlocked = isLevelUnlocked('demon');
    const levelDemonBtn = document.getElementById('levelDemon');
    if (demonUnlocked) {
        levelDemonBtn.classList.remove('hidden');
    } else {
        levelDemonBtn.classList.add('hidden');
    }
}

function showRanking() {
    gameState = 'ranking';
    titleScreen.classList.add('hidden');
    rankingScreen.classList.remove('hidden');
    displayRankings();
}

function startGame(level) {
    // 難易度設定を適用
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

    // 煩悩メッセージをクリア
    bonnouMessageContainer.innerHTML = '';


    // BGM開始
    stopSound('gameover');
    stopSound('clear');
    playSound('bgm');

    updateUI();

    // Delta Time setup
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function shootBullet() {
    bullets.push({
        x: player.x,
        y: player.y - 10,
        width: 8,
        height: 20,
        speed: 20, // Doubled from 10
        color: '#d4af37'
    });
    playSound('shoot');
}

function spawnEnemy() {
    const settings = levelSettings[currentLevel];
    // レベルごとの確率で六波羅蜜（布施・持戒・忍辱・精進・禅定・智慧）が出現
    const nenbutsuRate = settings.nenbutsuRate ?? 0.3;
    const isNenbutsu = Math.random() < nenbutsuRate;
    const ropparamitsuList = ['布施', '持戒', '忍辱', '精進', '禅定', '智慧'];
    const bonnou = isNenbutsu ? ropparamitsuList[Math.floor(Math.random() * ropparamitsuList.length)] : bonnouList[Math.floor(Math.random() * bonnouList.length)];
    // スピード = 基本速度 + ランダム + 進行に応じて加速
    const speed = baseSpeed + Math.random() * 1.5 + (score * settings.speedIncrease); // Random variance reduced from 3.0

    // 金色・黄色系（30-60度）を避けた色を生成
    let hue;
    if (isNenbutsu) {
        hue = null; // 六波羅蜜（布施・持戒・忍辱・精進・禅定・智慧）は固定色（金色）
    } else {
        // 0-30度（赤～オレンジ）または 60-360度（緑～青～紫～赤）からランダム選択
        const range = Math.random() < 0.2 ? 30 : 300; // 0-30の範囲が20%、60-360の範囲が80%
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

function createParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 16, // Doubled speed
            vy: (Math.random() - 0.5) * 16, // Doubled speed
            life: 40,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}



function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

function updateUI() {
    const settings = levelSettings[currentLevel];
    scoreDisplay.textContent = score;
    targetScoreDisplay.textContent = settings.isInfinite ? '∞' : targetScore;
    spiritDisplay.textContent = spirit;

    kudokuDisplay.textContent = kudoku;
    kudokuDisplay.style.color = kudoku >= maxKudoku ? '#ff0000' : '#fff';

    comboDisplay.textContent = combo;
    levelDisplay.textContent = settings.name;

    updateSpecialButton();
}

function updateSpecialButton() {
    if (kudoku >= maxKudoku) {
        specialBtn.classList.add('ready');
        specialBtn.classList.remove('disabled');
    } else {
        specialBtn.classList.remove('ready');
        specialBtn.classList.add('disabled');
    }
}

function activateSpecialAttack() {
    if (kudoku < maxKudoku || gameState !== 'playing') return;

    // Count and clear all enemies with particles
    let defeatedCount = 0;
    enemies.forEach(enemy => {
        createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
        // Only count bonnou (non-nenbutsu enemies) toward score
        if (!enemy.isNenbutsu) {
            defeatedCount++;
        }
    });
    enemies.splice(0, enemies.length); // Properly clear the array

    // Add defeated enemies to score and combo
    score += defeatedCount;
    combo += defeatedCount;
    if (combo > maxCombo) maxCombo = combo;

    // Reset kudoku
    kudoku = 0;
    updateUI();

    // Play sound effect
    playSound('hit');

    // Visual flash effect
    flashScreen();

    // Check if game is won
    if (score >= targetScore) {
        gameOver(true);
    }
}

function flashScreen() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(255, 215, 0, 0.8)';
    flash.style.zIndex = '50';
    flash.style.pointerEvents = 'none';
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.style.transition = 'opacity 0.5s';
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 500);
    }, 100);
}

function shakeScreen() {
    const container = document.getElementById('gameContainer');
    // アニメーションをリセットするためにクラスを一度削除
    container.classList.remove('shake');
    // リフローを強制
    void container.offsetWidth;
    container.classList.add('shake');

    // アニメーション終了後にクラスを削除
    setTimeout(() => {
        container.classList.remove('shake');
    }, 500);
}

function gameOver(win) {
    gameState = 'gameover';
    gameOverScreen.classList.remove('hidden');
    infoPanel.classList.add('hidden');
    virtualControls.classList.add('hidden');

    // BGM停止と結果音
    stopSound('bgm');
    if (win) {
        playSound('clear');
        // レベルクリア時に進行状況を保存
        saveClearedLevel(currentLevel);
    } else {
        playSound('gameover');
        shakeScreen(); // ゲームオーバー時も揺らす
    }

    // ランキング保存
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

    // Set Result Image
    const resultImage = document.getElementById('resultImage');
    if (win) {
        resultImage.src = 'images/monk/monk_happy.png';
    } else {
        resultImage.src = 'images/monk/monk_sad.png';
    }
}

// Delta Time Management
let lastTime = 0;
let accumulator = 0;
const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;

function update(timeScale) {
    if (gameState !== 'playing') return;

    // オートハイド判定（スマホ表示の時のみ有効にするか、常時動かしても害はないが、クラス付与はDOM操作なので頻度を下げる）
    // virtualControlsが表示されている（hiddenがない）場合のみ判定
    if (!virtualControls.classList.contains('hidden')) {
        if (Date.now() - lastInputTime > HIDE_DELAY) {
            if (!virtualControls.classList.contains('inactive')) {
                virtualControls.classList.add('inactive');
            }
        }
    }

    frame++;

    // クールダウン管理 (Frame-based to Time-based conversion: 1 unit ~ 1 frame)
    if (shootCooldown > 0) {
        shootCooldown -= 1 * timeScale;
        if (shootCooldown <= 0) {
            shootCooldown = 0;
            canShoot = true;
        }
    }

    // プレイヤー移動（キーボード + 仮想コントローラー）
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

    // 敵の生成（難易度に応じた間隔）
    const settings = levelSettings[currentLevel];
    // Adjust spawn calculations for delta time - using frame accumulation
    // Originally based on frames, so we keep logic but spawn checks happen per frame update equivalent
    const currentSpawnRate = Math.max(spawnRate - Math.floor(score / 10), settings.isInfinite ? 10 : 15);

    // Using a separate counter for spawning which scales with time
    if (frame % Math.floor(currentSpawnRate) === 0 && (settings.isInfinite || score < targetScore)) {
        spawnEnemy();
    }



    // 敵の更新
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed * timeScale;

        // 画面外に出たら削除
        if (enemies[i].y > canvas.height) {
            if (enemies[i].isNenbutsu) {
                // 六波羅蜜（布施・持戒・忍辱・精進・禅定・智慧）は画面外に出てもOK（むしろ良い）
                enemies.splice(i, 1);
            } else {
                // 煩悩は画面外に出たらダメージ
                const breachX = enemies[i].x + enemies[i].width / 2;
                lastBonnou = enemies[i].text; // やられた煩悩を記録
                showBonnouMessage(enemies[i].text); // 煩悩メッセージを3秒表示
                enemies.splice(i, 1);
                spirit--;
                triggerHeartBreach(breachX);
                combo = 0;
                playSound('damage');
                shakeScreen(); // ダメージ時に画面を揺らす
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
                    // 六波羅蜜を撃った（HPは減らない）
                    enemies.splice(i, 1);
                } else {
                    // 煩悩を撃破
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

function draw(timestamp) {
    const now = timestamp || performance.now();

    // 背景をクリア
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
        // 画像を描画（中心に合わせて調整）
        // 少し大きくし、表示位置を下げる（下にはみ出し許容）
        const imgSize = 108;
        const yOffset = 6;
        ctx.drawImage(monkImage, -imgSize / 2, -imgSize / 2 + yOffset, imgSize, imgSize);
    } else {
        // 画像読み込み前のフォールバック（元の描画ロジック）
        // 体（袈裟）
        ctx.fillStyle = '#ff6f00';
        ctx.fillRect(-player.width / 2, -10, player.width, 30);

        // 頭
        ctx.fillStyle = '#ffb74d';
        ctx.beginPath();
        ctx.arc(0, -20, 15, 0, Math.PI * 2);
        ctx.fill();

        // 合掌
        ctx.fillStyle = '#ffe0b2';
        ctx.fillRect(-5, 0, 10, 15);

        // 光背
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

        // 光る弾
        ctx.beginPath();
        ctx.ellipse(bullet.x, bullet.y, bullet.width / 2, bullet.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 卍マーク
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

        // 煩悩の形
        ctx.beginPath();
        if (enemy.isNenbutsu) {
            // 六波羅蜜は丸（楕円）のまま
            ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
                enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
        } else {
            // 煩悩は逆三角（🔽）
            ctx.moveTo(enemy.x, enemy.y);
            ctx.lineTo(enemy.x + enemy.width, enemy.y);
            ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            ctx.closePath();
        }
        ctx.fill();

        ctx.shadowBlur = 0;

        // テキスト
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

    // 「心」を示すボトム境界線（煩悩より前面）
    ctx.save();
    const safeMaxSpirit = Math.max(1, maxSpirit);
    const spiritRatio = Math.max(0, spirit) / safeMaxSpirit;
    const heartbeat = (Math.sin(now * 0.012) + 1) / 2;
    let barRGB = '255, 105, 180';  // 安定: ピンク
    let glowRGB = '255, 105, 180';
    if (spiritRatio <= 0.34) {
        barRGB = '255, 59, 92';    // 瀕死: 赤
        glowRGB = '255, 45, 85';
    } else if (spiritRatio <= 0.67) {
        barRGB = '211, 70, 154';   // 危険: 赤紫
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

    // バー全体の脈動ハイライト（横いっぱい）
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

    // 六波羅蜜取得時の浄化ライン（全幅）
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

function gameLoop(timestamp) {
    if (gameState !== 'playing') return;

    // Calculate delta time
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Calculate scale based on target 60 FPS
    // If delta is 16.6ms (60fps), scale is 1
    // If delta is 33.3ms (30fps), scale is 2
    // If delta is 8.3ms (120fps), scale is 0.5
    let timeScale = deltaTime / STEP;

    // Cap to avoid huge jumps on lags
    if (timeScale > 4) timeScale = 4;

    update(timeScale);
    draw(timestamp);

    requestAnimationFrame(gameLoop);
}

// バージョン表示
const version = document.querySelector('meta[name="version"]').content;
versionDisplay.textContent = `v${version}`;

// Initialize Settings
const settingsModal = document.getElementById('settingsModal');
const settingsSubmitBtn = document.getElementById('settingsSubmitBtn');
const menuBtn = document.getElementById('menuBtn');
const menuModal = document.getElementById('menuModal');

const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuSettingsBtn = document.getElementById('menuSettingsBtn');
const menuTosBtn = document.getElementById('menuTosBtn');
const menuTutorialBtn = document.getElementById('menuTutorialBtn');


const toggleBtns = document.querySelectorAll('.toggle-btn');

// Default temporary settings for the modal
let tempSettings = {
    sound: 'on',
    mode: 'pc'
};

function loadTempSettingsFromStorage() {
    const savedSettings = localStorage.getItem('nenbunSettings');
    if (savedSettings) {
        tempSettings = JSON.parse(savedSettings);
    } else {
        // Defaults
        tempSettings = {
            sound: 'on',
            mode: 'pc'
        };
    }
}

function initSettings() {
    const savedSettings = localStorage.getItem('nenbunSettings');

    if (!savedSettings) {
        // No settings saved, show modal
        loadTempSettingsFromStorage(); // Load defaults
        settingsModal.classList.remove('hidden');
        updateToggleButtons();
    } else {
        // Settings exist, apply them
        const settings = JSON.parse(savedSettings);
        applySettings(settings);
        showTitle();
    }
}

function applySettings(settings) {
    // Apply Mode
    if (settings.mode === 'mobile') {
        document.body.classList.add('mobile-mode');
    } else {
        document.body.classList.remove('mobile-mode');
    }

    // Apply Sound (Set volume globally)
    if (settings.sound === 'off') {
        Object.values(sounds).forEach(audio => {
            audio.volume = 0;
        });
        // Disable unlockAudio if sound is off
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    } else {
        // Restore default volumes if needed (re-run init logic or just set specific volumes)
        // For simplicity, we just leave them as initialized or unlocked
        // If we implemented a mute toggle during gameplay, we'd need more robust volume management
        sounds.bgm.volume = 0.5;
        sounds.shoot.volume = 0.3;
        sounds.hit.volume = 0.4;
        sounds.damage.volume = 0.5;
        sounds.gameover.volume = 0.6;
        sounds.clear.volume = 0.6;
    }
}

function updateToggleButtons() {
    toggleBtns.forEach(btn => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        if (tempSettings[group] === value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Event Listeners for Settings Modal
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        tempSettings[group] = value;
        updateToggleButtons();
    });
});

settingsSubmitBtn.addEventListener('click', () => {
    // Save settings
    localStorage.setItem('nenbunSettings', JSON.stringify(tempSettings));

    // Apply settings
    applySettings(tempSettings);

    // Hide settings modal
    settingsModal.classList.add('hidden');

    // Check if ToS AGREED
    const tosAgreed = localStorage.getItem('nenbunTosAgreed');
    if (!tosAgreed) {
        // Determine flow: Settings -> ToS -> Tutorial -> Title
        tosModal.classList.remove('hidden');
    } else {
        if (gameState === 'title') {
            showTitle();
        }
    }

    // Attempt to unlock audio immediately if sound is ON (since user clicked a button)
    if (tempSettings.sound === 'on') {
        unlockAudio();
    }
});

// Menu Interactions
menuBtn.addEventListener('click', () => {
    // playSound('select');
    menuModal.classList.remove('hidden');
});

closeMenuBtn.addEventListener('click', () => {
    menuModal.classList.add('hidden');
});

menuSettingsBtn.addEventListener('click', () => {
    menuModal.classList.add('hidden');
    loadTempSettingsFromStorage();
    updateToggleButtons();
    settingsModal.classList.remove('hidden');
});

menuTosBtn.addEventListener('click', () => {
    menuModal.classList.add('hidden');
    tosModal.classList.remove('hidden');
});

menuTutorialBtn.addEventListener('click', () => {
    menuModal.classList.add('hidden');
    openTutorial();
});

const menuDeveloperBtn = document.getElementById('menuDeveloperBtn');
menuDeveloperBtn.addEventListener('click', () => {
    menuModal.classList.add('hidden');
    passwordModal.classList.remove('hidden');
    passwordInput.value = '';
    passwordMessage.textContent = '';
    passwordInput.focus();
});

// Initialize
initSettings();

// ToS Logic
tosAgreeBtn.addEventListener('click', () => {
    localStorage.setItem('nenbunTosAgreed', 'true');
    tosModal.classList.add('hidden');

    // Removed automatic tutorial open
    // openTutorial();

    if (gameState === 'title') {
        showTitle();
    }
});

// Tutorial Logic
function openTutorial() {
    currentSlide = 0;
    updateSlides();
    tutorialModal.classList.remove('hidden');
}

function updateSlides() {
    slides.forEach((slide, index) => {
        if (index === currentSlide) {
            slide.style.display = 'flex'; // Changed to flex for centering
            slide.classList.add('active');
        } else {
            slide.style.display = 'none';
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
    });

    prevSlideBtn.disabled = currentSlide === 0;
    prevSlideBtn.style.opacity = currentSlide === 0 ? 0.3 : 1;

    if (currentSlide === slides.length - 1) {
        nextSlideBtn.textContent = '閉じる';
    } else {
        nextSlideBtn.textContent = '次へ';
    }
}

prevSlideBtn.addEventListener('click', () => {
    if (currentSlide > 0) {
        currentSlide--;
        updateSlides();
    }
});

nextSlideBtn.addEventListener('click', () => {
    if (currentSlide < slides.length - 1) {
        currentSlide++;
        updateSlides();
    } else {
        // Close tutorial
        tutorialModal.classList.add('hidden');
        // Ensure audio is unlocked if just starting
        if (tempSettings.sound === 'on') unlockAudio();

        showTitle();
    }
});
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        updateSlides();
    });
});
