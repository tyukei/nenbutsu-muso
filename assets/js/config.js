// ==========================================
// config.js — 定数・DOM要素・ゲーム状態変数
// ==========================================

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

// 煩悩メッセージ表示
const bonnouMessageContainer = document.getElementById('bonnouMessageContainer');

// 画像リソース
const monkImage = new Image();
monkImage.src = 'images/monk/monk_back.png';

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

// キー入力
const keys = {};
let canShoot = true;
let shootCooldown = 0;

// ゲームオブジェクト
const bullets = [];
const enemies = [];
const particles = [];

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
        spawnRate: 25,
        speedIncrease: 0.06,
        isInfinite: false,
        initialSpirit: 4
    },
    hard: {
        name: '仏性Lev3',
        targetScore: 108,
        baseSpeed: 2.5,
        spawnRate: 20,
        speedIncrease: 0.08,
        isInfinite: false,
        initialSpirit: 5
    },
    demon: {
        name: 'Lev悪魔',
        targetScore: 324,
        baseSpeed: 3.0,
        spawnRate: 15,
        speedIncrease: 0.12,
        nenbutsuRate: 0.3,
        isInfinite: false,
        initialSpirit: 5
    }
};

// 煩悩のリスト
const bonnouList = [
    '貪', '瞋', '痴', '慢', '疑', '見',
    '無明', '随眠', '無慚', '無愧', '嫉', '慳',
    '悪作', '眠', '掉挙', '惛沈', '忿', '覆',
    '執着', '渇愛', '妄想', '恐怖', '懈怠',
    '色欲', '声欲', '香欲', '味欲', '触欲'
];

// 煩悩の説明と対処法
const bonnouDescriptions = {
    '貪': 'とん：むさぼり',
    '瞋': 'じん：怒り',
    '痴': 'ち：ものの道理がわからない',
    '慢': 'まん：おごり',
    '疑': 'ぎ：真理を疑う心',
    '見': 'けん：間違った見解',
    '無明': 'むみょう：根本的な無知',
    '随眠': 'ずいめん：働いていない煩悩',
    '無慚': 'むざん：自分に恥じらいがない',
    '無愧': 'むき：他者に恥じらいがない',
    '嫉': 'しつ：他者を妬む',
    '慳': 'けん：けちで分け与えない',
    '悪作': 'あくさ：後悔',
    '眠': 'めん：視野を狭くする',
    '掉挙': 'じょうこ：浮ついている',
    '惛沈': 'こんじん：心が沈む',
    '忿': 'ふん：短気',
    '覆': 'ふく：自分の過ちを隠す',
    '執着': 'しゅうじゃく：手放せない心',
    '渇愛': 'かつあい：衝動的な欲望',
    '妄想': 'もうぞう：勝手な空想を巡らす',
    '恐怖': 'くふ：恐れの感情',
    '懈怠': 'けたい：なまける',
    '色欲': 'しき：色形や男女の欲望',
    '声欲': 'しょう：声や音楽等への欲望',
    '香欲': 'こう：香りへの欲望',
    '味欲': 'み：一切の食への欲望',
    '触欲': 'そく：男女の肌や服等への欲望'
};

// プレイヤー
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 12
};

// Delta Time Management
let lastTime = 0;
let accumulator = 0;
const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;
