// ==========================================
// device.js — デバイス・OS・ブラウザ判定
// ==========================================

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
