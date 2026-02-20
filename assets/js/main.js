// ==========================================
// main.js — 初期化・起動処理
// ==========================================

// ボタンイベントリスナー登録
startBtn.addEventListener('click', showLevelSelect);
restartBtn.addEventListener('click', showLevelSelect);
rankingBtn.addEventListener('click', showRanking);
backToTitleBtn.addEventListener('click', showTitle);
toTitleBtn.addEventListener('click', showTitle);

// X (Twitter) シェアボタン
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', shareToTwitter);

// レベル選択ボタン
document.getElementById('levelEasy').addEventListener('click', () => {
    playSound('level1');
    startLevelTransition('easy');
});
document.getElementById('levelNormal').addEventListener('click', () => {
    playSound('level2');
    startLevelTransition('normal');
});
document.getElementById('levelHard').addEventListener('click', () => {
    playSound('level3');
    startLevelTransition('hard');
});
document.getElementById('levelDemon').addEventListener('click', () => {
    playSound('level4');
    startLevelTransition('demon');
});
document.getElementById('backFromLevelBtn').addEventListener('click', showTitle);

// バージョン表示
const version = document.querySelector('meta[name="version"]').content;
versionDisplay.textContent = `v${version}`;

// 初期化実行
initSettings();
GS.loadTotalKudoku(); // 累計功徳をロード
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
