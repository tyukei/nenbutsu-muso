// ==========================================
// state.js — ゲーム状態の一元管理 (GameState)
// ==========================================

const GS = {
    // 画面状態
    screen: 'title', // 'title' | 'level' | 'playing' | 'gameover' | 'ranking'

    // プレイ中のゲーム状態
    play: {
        score: 0,
        spirit: 3,
        maxSpirit: 3,
        kudoku: 0,
        totalKudoku: 0, // 累計功徳
        totalPlays: 0, // 累計プレイ回数
        sessionKudoku: 0, // 1プレイでの獲得功徳
        combo: 0,
        maxCombo: 0,
        frame: 0,
        lastBonnou: '',
        specialActiveUntil: 0,
        specialEnemies: []
    },

    // 入力状態
    input: {
        keys: {},
        canShoot: true,
        shootCooldown: 0,
        touchLeft: false,
        touchRight: false,
        touchSpecial: false,
        dragTouchId: null,
        lastTouchX: 0,
        lastInputTime: Date.now(),
    },

    // 難易度状態
    level: {
        current: 'normal',
        targetScore: 108,
        baseSpeed: 1,
        spawnRate: 40,
    },

    // エフェクト状態
    effects: {
        heartFlashUntil: 0,
        heartImpactUntil: 0,
        heartPurifyUntil: 0,
        heartStains: [],
        ropparamitsuBannerUntil: 0,
        bonnouSokuBodaiBannerUntil: 0,
    },

    // タイトルイントロ状態
    intro: {
        played: false,
        running: false,
        timers: [],
        typingTimer: null,
    },

    // ゲームオブジェクト
    entities: {
        bullets: [],
        enemies: [],
        particles: [],
    },

    pools: {
        bullets: [],
        enemies: [],
        particles: [],
    },

    // 時間管理
    time: {
        lastTime: 0,
    },

    // UI状態
    ui: {
        currentSlide: 0,
        visitorCount: null,
    },

    /**
     * ゲーム開始時に状態をリセット
     * @param {string} level - 難易度キー
     */
    reset(level) {
        const s = levelSettings[level];

        // 難易度
        this.level.current = level;
        this.level.targetScore = s.targetScore;
        this.level.baseSpeed = s.baseSpeed;
        this.level.spawnRate = s.spawnRate;

        // 画面
        this.screen = 'playing';

        // プレイ状態
        this.play.score = 0;
        this.play.spirit = s.initialSpirit;
        this.play.maxSpirit = s.initialSpirit;
        this.play.kudoku = 0;
        this.play.sessionKudoku = 0;
        this.play.combo = 0;
        this.play.maxCombo = 0;
        this.play.frame = 0;
        this.play.lastBonnou = '';
        this.play.specialActiveUntil = 0;
        this.play.specialEnemies = [];

        // エフェクト
        this.effects.heartFlashUntil = 0;
        this.effects.heartImpactUntil = 0;
        this.effects.heartPurifyUntil = 0;
        this.effects.heartStains = [];
        this.effects.ropparamitsuBannerUntil = 0;
        this.effects.bonnouSokuBodaiBannerUntil = 0;

        // エンティティ
        this.entities.bullets.length = 0;
        this.entities.enemies.length = 0;
        this.entities.particles.length = 0;

        // 入力
        this.input.touchLeft = false;
        this.input.touchRight = false;
        this.input.touchSpecial = false;

        this.loadPersistentStats();
    },

    /**
     * 累計功徳とプレイ回数をロード
     */
    loadPersistentStats() {
        const levelKey = this.level.current || 'normal';
        const savedKudoku = localStorage.getItem('nenbunTotalKudoku_' + levelKey);
        const savedPlays = localStorage.getItem('nenbunTotalPlays_' + levelKey);

        // 旧データがある場合のフォールバック
        if (!savedKudoku && localStorage.getItem('nenbunTotalKudoku')) {
            this.play.totalKudoku = parseInt(localStorage.getItem('nenbunTotalKudoku'), 10) || 0;
            localStorage.setItem('nenbunTotalKudoku_' + levelKey, this.play.totalKudoku);
        } else {
            this.play.totalKudoku = savedKudoku ? parseInt(savedKudoku, 10) : 0;
        }

        this.play.totalPlays = savedPlays ? parseInt(savedPlays, 10) : 0;
    },

    /**
     * 累計功徳とプレイ回数をセーブ
     */
    savePersistentStats() {
        const levelKey = this.level.current || 'normal';
        localStorage.setItem('nenbunTotalKudoku_' + levelKey, this.play.totalKudoku);
        localStorage.setItem('nenbunTotalPlays_' + levelKey, this.play.totalPlays);
    }
};
