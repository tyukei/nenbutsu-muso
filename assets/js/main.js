// ==========================================
// main.js — 初期化・起動処理
// ==========================================

// ボタンイベントリスナー登録
startBtn.addEventListener('click', () => {
    playSound('start');
    startTitleTransition();
});
restartBtn.addEventListener('click', showLevelSelect);
rankingBtn.addEventListener('click', showRanking);
backToTitleBtn.addEventListener('click', showTitle);
toTitleBtn.addEventListener('click', showTitle);

// メニュー内のアナリティクス設定
menuSettingsBtn.addEventListener('click', () => {
    sendAnalyticsEvent('feature_usage', { feature_name: 'settings' });
});
menuTutorialBtn.addEventListener('click', () => {
    sendAnalyticsEvent('feature_usage', { feature_name: 'tutorial' });
});

// X (Twitter) シェアボタン
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', shareToTwitter);

// レベル選択ボタン
document.getElementById('levelEasy').addEventListener('click', () => {
    playSound('level1');
    sendAnalyticsEvent('game_start', { level: 'easy', control_mode: GS.settings?.mode || 'pc', lang: GS.lang });
    startLevelTransition('easy');
});
document.getElementById('levelNormal').addEventListener('click', () => {
    playSound('level2');
    sendAnalyticsEvent('game_start', { level: 'normal', control_mode: GS.settings?.mode || 'pc', lang: GS.lang });
    startLevelTransition('normal');
});
document.getElementById('levelHard').addEventListener('click', () => {
    playSound('level3');
    sendAnalyticsEvent('game_start', { level: 'hard', control_mode: GS.settings?.mode || 'pc', lang: GS.lang });
    startLevelTransition('hard');
});
document.getElementById('levelDemon').addEventListener('click', () => {
    playSound('level4');
    sendAnalyticsEvent('game_start', { level: 'demon', control_mode: GS.settings?.mode || 'pc', lang: GS.lang });
    startLevelTransition('demon');
});
document.getElementById('backFromLevelBtn').addEventListener('click', showTitle);

// バージョン表示
const version = document.querySelector('meta[name="version"]').content;
versionDisplay.textContent = `v${version}`;

// 初期化実行
initSettings();
GS.loadPersistentStats(); // 累計データをロード
Renderer.preCacheEnemies(); // 煩悩画像を事前キャッシュ
fetchAndDisplayVisitorCount(); // 訪問者数を取得・表示


// キャンバスリサイズ処理
function resizeCanvas() {
    // 常に固定解像度 (レターボックス方式)
    canvas.width = 480;
    canvas.height = 640;

    if (typeof player !== 'undefined') {
        player.y = canvas.height - 80;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // 初回実行
