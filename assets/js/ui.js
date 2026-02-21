// ==========================================
// ui.js — 画面遷移・UI更新・設定・ToS・チュートリアル
// ==========================================

// 煩悩メッセージ表示
function showBonnouMessage(bonnouText) {
    const description = bonnouDescriptions[bonnouText] || '心を乱す煩悩';
    const messageItem = document.createElement('div');
    messageItem.className = 'bonnou-message-item';
    messageItem.innerHTML = `
                <div class="bonnou-title">「${bonnouText}」</div>
                <div class="bonnou-desc">${description}</div>
            `;

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

// ハートブリーチ関連
function triggerHeartBreach(x) {
    const now = performance.now();
    const { play, effects } = GS;

    effects.heartFlashUntil = now + 260;
    effects.heartImpactUntil = now + 260;

    const safeMaxSpirit = Math.max(1, play.maxSpirit);
    const dangerRatio = 1 - Math.max(0, play.spirit) / safeMaxSpirit;
    effects.heartStains.push({
        x: Math.max(0, Math.min(canvas.width, x)),
        width: 42 + Math.random() * 34,
        createdAt: now,
        duration: 2600 + dangerRatio * 2200,
        maxAlpha: 0.28 + dangerRatio * 0.25
    });

    if (effects.heartStains.length > 18) effects.heartStains.shift();
}

function triggerHeartPurify() {
    GS.effects.heartPurifyUntil = performance.now() + 800;
}

function triggerRoppaBanner() {
    GS.effects.ropparamitsuBannerUntil = performance.now() + 1100;
}

// Base64エンコード・デコード（マルチバイト対応）
function encodeBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
function decodeBase64(str) {
    return decodeURIComponent(escape(atob(str)));
}

// 修行の軌跡データ
function loadRankings() {
    try {
        const saved = localStorage.getItem('nenbunRankings');
        return saved ? JSON.parse(decodeBase64(saved)) : [];
    } catch (e) {
        return [];
    }
}

function saveRanking(scoreVal, comboVal) {
    const rankings = loadRankings();
    const now = new Date();
    rankings.push({
        score: scoreVal,
        combo: comboVal,
        level: GS.level.current,
        levelName: levelSettings[GS.level.current].name,
        target: GS.level.targetScore,
        date: now.toLocaleDateString('ja-JP')
    });
    rankings.sort((a, b) => b.score - a.score);
    rankings.splice(10);
    localStorage.setItem('nenbunRankings', encodeBase64(JSON.stringify(rankings)));
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
        const levelLabel = escapeHtml(String(rank.levelName || '中級'));
        const score = escapeHtml(String(rank.score));
        const combo = escapeHtml(String(rank.combo));
        const date = escapeHtml(String(rank.date));
        html += `
                    <div class="rank-item ${isTop3 ? 'top3' : ''}">
                        <span class="rank-number">${index + 1}位</span>
                        <span class="rank-score">
                            [${levelLabel}] ${score}体撃破<br>
                            <span style="font-size: 0.85em; opacity: 0.8;">(最大連鎖×${combo})</span>
                        </span>
                        <span class="rank-date">${date}</span>
                    </div>
                `;
    });
    rankingList.innerHTML = html;
}

// 累計データの計算と表示
function displayCumulativeStats() {
    const cumulativeStats = document.getElementById('cumulativeStats');
    if (!cumulativeStats) return;

    // 累計撃破数の計算
    const rankings = loadRankings();
    const totalDestroyed = rankings.reduce((sum, rank) => sum + parseInt(rank.score || 0, 10), 0);

    // 累計功徳の計算 (全レベルの合計 + 旧フォーマット分)
    let totalKudoku = 0;

    // 旧フォーマットの分
    const oldKudoku = localStorage.getItem('nenbunTotalKudoku');
    if (oldKudoku) totalKudoku += parseInt(oldKudoku, 10);

    // 累計プレイ回数の計算 (全レベルの合計)
    let totalPlays = 0;

    // 各レベルの分
    ['easy', 'normal', 'hard', 'demon'].forEach(level => {
        const levelKudoku = localStorage.getItem('nenbunTotalKudoku_' + level);
        if (levelKudoku) totalKudoku += parseInt(levelKudoku, 10);

        const levelPlays = localStorage.getItem('nenbunTotalPlays_' + level);
        if (levelPlays) totalPlays += parseInt(levelPlays, 10);
    });

    cumulativeStats.innerHTML = `
        <div class="cumulative-stat">
            <div class="cumulative-stat-label">プレイ回数</div>
            <div class="cumulative-stat-value">${totalPlays}</div>
        </div>
        <div class="cumulative-stat">
            <div class="cumulative-stat-label">累計撃破数</div>
            <div class="cumulative-stat-value">${totalDestroyed}</div>
        </div>
        <div class="cumulative-stat">
            <div class="cumulative-stat-label">累計功徳</div>
            <div class="cumulative-stat-value">${totalKudoku}</div>
        </div>
    `;
}

// レベル進行システム
function loadClearedLevels() {
    try {
        const saved = localStorage.getItem('nenbunClearedLevels');
        return saved ? JSON.parse(decodeBase64(saved)) : [];
    } catch (e) {
        return [];
    }
}

function saveClearedLevel(level) {
    const cleared = loadClearedLevels();
    if (!cleared.includes(level)) {
        cleared.push(level);
        localStorage.setItem('nenbunClearedLevels', encodeBase64(JSON.stringify(cleared)));
    }
}

function isLevelUnlocked(level) {
    const cleared = loadClearedLevels();
    if (level === 'easy') return true;
    if (level === 'normal') return cleared.includes('easy');
    if (level === 'hard') return cleared.includes('normal');
    if (level === 'demon') return cleared.includes('hard');
    return false;
}

// タイトルイントロ関連
function clearTitleIntroTimers() {
    GS.intro.timers.forEach(timer => clearTimeout(timer));
    GS.intro.timers = [];
    if (GS.intro.typingTimer) {
        clearInterval(GS.intro.typingTimer);
        GS.intro.typingTimer = null;
    }
}

function queueTitleIntro(callback, delay) {
    const timer = setTimeout(callback, delay);
    GS.intro.timers.push(timer);
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
    const redStart = TITLE_INTRO_PHRASE_MAIN.indexOf(INTRO_RED_WORD);
    const redEnd = redStart + INTRO_RED_WORD.length;

    if (redStart < 0) {
        titleIntroMessageTextMain.innerHTML = escapeHtml(typedText);
        return;
    }

    let html = '';
    if (typedText.length <= redStart) {
        html = escapeHtml(typedText);
    } else {
        html += escapeHtml(typedText.slice(0, redStart));
        const redTypedLength = Math.min(typedText.length - redStart, INTRO_RED_WORD.length);
        if (redTypedLength > 0) {
            html += `<span class="text-bonnou-red">${escapeHtml(INTRO_RED_WORD.slice(0, redTypedLength))}</span>`;
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
    GS.intro.running = false;
    GS.intro.played = true;

    introMonkHappy.classList.add('intro-active');
    introMonkSad.classList.add('intro-active');
    introMonkPray.classList.add('intro-active');
    titleIntroMessage.classList.add('intro-active');
    renderIntroMainText(TITLE_INTRO_PHRASE_MAIN);
    titleIntroMessageTextSub.textContent = TITLE_INTRO_PHRASE_SUB;
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
    if (!GS.intro.running) return;
    finishTitleIntro();
}

function startTitleIntro() {
    clearTitleIntroTimers();
    GS.intro.running = true;
    resetTitleIntroVisualState();
    alignIntroMessageToInstruction();
    titleIntroMessage.classList.add('intro-active');

    let charIndex = 0;
    const fullText = `${TITLE_INTRO_PHRASE_MAIN}\n${TITLE_INTRO_PHRASE_SUB}`;
    const threshold = TITLE_INTRO_PHRASE_MAIN.length;
    GS.intro.typingTimer = setInterval(() => {
        if (!GS.intro.running) return;
        charIndex += 1;
        if (charIndex <= threshold) {
            renderIntroMainText(TITLE_INTRO_PHRASE_MAIN.slice(0, charIndex));
            titleIntroMessageTextSub.textContent = '';
        } else {
            renderIntroMainText(TITLE_INTRO_PHRASE_MAIN);
            titleIntroMessageTextSub.textContent = TITLE_INTRO_PHRASE_SUB.slice(0, charIndex - threshold - 1);
        }
        if (charIndex >= fullText.length) {
            clearInterval(GS.intro.typingTimer);
            GS.intro.typingTimer = null;

            queueTitleIntro(() => introMonkHappy.classList.add('intro-active'), 300);
            queueTitleIntro(() => introMonkSad.classList.add('intro-active'), 800);
            queueTitleIntro(() => introMonkPray.classList.add('intro-active'), 1300);
            queueTitleIntro(() => titleMainContent.classList.add('intro-visible'), 1900);
            queueTitleIntro(() => finishTitleIntro(), 2300);
        }
    }, 110);
}

// 画面遷移フェード
function startLevelTransition(level) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#000';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease-in-out';
    overlay.style.pointerEvents = 'all'; // 画面操作をブロック
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        startGame(level);

        overlay.style.opacity = '0';
        // クリックブロックを解除
        overlay.style.pointerEvents = 'none';

        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 500);
    }, 3000); // 3秒ほど暗転
}

// タイトルからレベル選択への遷移フェード
function startTitleTransition() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#000';
    overlay.style.zIndex = '9999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease-in-out';
    overlay.style.pointerEvents = 'all';
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        showLevelSelect();

        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';

        setTimeout(() => {
            if (overlay.parentNode) overlay.remove();
        }, 500);
    }, 2000); // 2秒暗転
}

// 画面遷移
function showTitle() {
    GS.screen = 'title';
    titleScreen.classList.remove('hidden');
    levelScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    rankingScreen.classList.add('hidden');
    infoPanel.classList.add('hidden');
    virtualControls.classList.add('hidden');
    bonnouMessageContainer.innerHTML = '';

    if (!GS.intro.played) {
        startTitleIntro();
    } else {
        clearTitleIntroTimers();
        GS.intro.running = false;
        titleIntroOverlay.classList.add('hidden');
        titleIntroOverlay.classList.remove('intro-fadeout');
        titlePersistentPray.classList.remove('hidden');
        titlePersistentPray.classList.add('visible');
        titleMainContent.classList.add('intro-visible');
    }
}

function showLevelSelect() {
    GS.screen = 'level';
    titleScreen.classList.add('hidden');
    levelScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    rankingScreen.classList.add('hidden');
    bonnouMessageContainer.innerHTML = '';

    // レベルのロック状態を更新
    const levelEasyBtn = document.getElementById('levelEasy');
    const levelNormalBtn = document.getElementById('levelNormal');
    const levelHardBtn = document.getElementById('levelHard');

    levelEasyBtn.disabled = false;

    const normalUnlocked = isLevelUnlocked('normal');
    levelNormalBtn.disabled = !normalUnlocked;
    const normalLock = levelNormalBtn.querySelector('.level-lock');
    if (normalLock) {
        normalLock.style.display = normalUnlocked ? 'none' : 'block';
    }

    const hardUnlocked = isLevelUnlocked('hard');
    levelHardBtn.disabled = !hardUnlocked;
    const hardLock = levelHardBtn.querySelector('.level-lock');
    if (hardLock) {
        hardLock.style.display = hardUnlocked ? 'none' : 'block';
    }

    const demonUnlocked = isLevelUnlocked('demon');
    const levelDemonBtn = document.getElementById('levelDemon');
    if (demonUnlocked) {
        levelDemonBtn.classList.remove('hidden');
    } else {
        levelDemonBtn.classList.add('hidden');
    }
}

function showRanking() {
    GS.screen = 'ranking';
    titleScreen.classList.add('hidden');
    rankingScreen.classList.remove('hidden');
    displayCumulativeStats();
    displayRankings();
}

// X (Twitter) シェア
function shareToTwitter() {
    const { play, level } = GS;
    const levelName = levelSettings[level.current].name;
    const settings = levelSettings[level.current];
    const targetDisplay = settings.isInfinite ? '∞' : level.targetScore;
    const isWin = play.score >= level.targetScore && !settings.isInfinite;

    let shareText = `煩悩シューティング\n`;
    shareText += `【${levelName}】\n`;

    if (isWin) {
        shareText += `✨仏性が育ちました！✨\n`;
    } else {
        shareText += `煩悩に呑まれた...\n`;
    }

    shareText += `撃破数: ${play.score}/${targetDisplay}\n`;
    shareText += `最大連鎖: ${play.maxCombo}\n`;
    shareText += `\n#煩悩シューティング #般若心経EDM\n#神社仏閣オンライン\n`;
    shareText += `\nhttps://bonno-taisan.jinjabukkaku.online/`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
}

// パスワード解放
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

// 簡単な文字列ハッシュ関数
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function checkPassword() {
    const password = passwordInput.value.trim();
    const cleared = loadClearedLevels();
    let unlocked = false;
    let message = '';

    const hashed = simpleHash(password);

    if (hashed === -1116238380) { // nenbutsu-mashimashi1
        if (!cleared.includes('easy')) {
            cleared.push('easy');
        }
        localStorage.setItem('nenbunClearedLevels', encodeBase64(JSON.stringify(cleared)));
        message = '✓ 仏性Lev2を解放しました！';
        unlocked = true;
    } else if (hashed === -1116238379) { // nenbutsu-mashimashi2
        if (!cleared.includes('easy')) {
            cleared.push('easy');
        }
        if (!cleared.includes('normal')) {
            cleared.push('normal');
        }
        localStorage.setItem('nenbunClearedLevels', encodeBase64(JSON.stringify(cleared)));
        message = '✓ 仏性Lev3を解放しました！';
        unlocked = true;
    } else if (hashed === -1116238378) { // nenbutsu-mashimashi3
        if (!cleared.includes('easy')) {
            cleared.push('easy');
        }
        if (!cleared.includes('normal')) {
            cleared.push('normal');
        }
        if (!cleared.includes('hard')) {
            cleared.push('hard');
        }
        localStorage.setItem('nenbunClearedLevels', encodeBase64(JSON.stringify(cleared)));
        message = '✓ Lev悪魔を解放しました！';
        unlocked = true;
    }

    if (unlocked) {
        passwordMessage.textContent = message;
        passwordMessage.className = 'success';

        setTimeout(() => {
            passwordModal.classList.add('hidden');
            showLevelSelect();
        }, 1500);
    } else {
        passwordMessage.textContent = '✗ パスワードが違います';
        passwordMessage.className = 'error';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// UI更新
function updateUI() {
    const { play, level } = GS;
    const settings = levelSettings[level.current];

    scoreDisplay.textContent = play.score;
    targetScoreDisplay.textContent = settings.isInfinite ? '∞' : level.targetScore;
    spiritDisplay.textContent = play.spirit;

    kudokuDisplay.textContent = play.kudoku;
    kudokuDisplay.style.color = play.kudoku >= MAX_KUDOKU ? '#ff0000' : '#fff';

    comboDisplay.textContent = play.combo;
    levelDisplay.textContent = settings.name;

    // モバイルステータスの更新
    if (mobileScoreDisplay) mobileScoreDisplay.textContent = play.score;
    if (mobileSpiritDisplay) mobileSpiritDisplay.textContent = play.spirit;
    if (mobileKudokuDisplay) {
        mobileKudokuDisplay.textContent = `${play.kudoku}/${MAX_KUDOKU}`;
        mobileKudokuDisplay.style.color = play.kudoku >= MAX_KUDOKU ? '#ff0000' : '#fff';
    }
    if (mobileComboDisplay) mobileComboDisplay.textContent = play.combo;

    updateSpecialButton();
}

function updateSpecialButton() {
    if (GS.play.kudoku >= MAX_KUDOKU) {
        specialBtn.classList.add('ready');
        specialBtn.classList.remove('disabled');
    } else {
        specialBtn.classList.remove('ready');
        specialBtn.classList.add('disabled');
    }
}

// エフェクト
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
    container.classList.remove('shake');
    void container.offsetWidth;
    container.classList.add('shake');

    setTimeout(() => {
        container.classList.remove('shake');
    }, 500);
}

// 設定モーダル
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
        tempSettings = {
            sound: 'on',
            mode: 'pc'
        };
    }
}

function initSettings() {
    const savedSettings = localStorage.getItem('nenbunSettings');

    if (!savedSettings) {
        loadTempSettingsFromStorage();
        settingsModal.classList.remove('hidden');
        updateToggleButtons();
    } else {
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
    resizeCanvas();

    // Apply Sound
    if (settings.sound === 'off') {
        Object.values(sounds).forEach(audio => {
            audio.volume = 0;
        });
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    } else {
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

// 設定モーダルイベント
toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;
        tempSettings[group] = value;
        updateToggleButtons();
    });
});

settingsSubmitBtn.addEventListener('click', () => {
    localStorage.setItem('nenbunSettings', JSON.stringify(tempSettings));
    applySettings(tempSettings);
    settingsModal.classList.add('hidden');

    const tosAgreed = localStorage.getItem('nenbunTosAgreed');
    if (!tosAgreed) {
        tosModal.classList.remove('hidden');
    } else {
        if (GS.screen === 'title') {
            showTitle();
        }
    }

    if (tempSettings.sound === 'on') {
        unlockAudio();
    }
});

// メニューインタラクション
menuBtn.addEventListener('click', () => {
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

// ToS ロジック
tosAgreeBtn.addEventListener('click', () => {
    localStorage.setItem('nenbunTosAgreed', 'true');
    tosModal.classList.add('hidden');

    if (GS.screen === 'title') {
        showTitle();
    }
});

// チュートリアルロジック
function openTutorial() {
    GS.ui.currentSlide = 0;
    updateSlides();
    tutorialModal.classList.remove('hidden');
}

function updateSlides() {
    slides.forEach((slide, index) => {
        if (index === GS.ui.currentSlide) {
            slide.style.display = 'flex';
            slide.classList.add('active');
        } else {
            slide.style.display = 'none';
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, index) => {
        if (index === GS.ui.currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
    });

    prevSlideBtn.disabled = GS.ui.currentSlide === 0;
    prevSlideBtn.style.opacity = GS.ui.currentSlide === 0 ? 0.3 : 1;

    if (GS.ui.currentSlide === slides.length - 1) {
        nextSlideBtn.textContent = '閉じる';
    } else {
        nextSlideBtn.textContent = '次へ';
    }
}

prevSlideBtn.addEventListener('click', () => {
    if (GS.ui.currentSlide > 0) {
        GS.ui.currentSlide--;
        updateSlides();
    }
});

nextSlideBtn.addEventListener('click', () => {
    if (GS.ui.currentSlide < slides.length - 1) {
        GS.ui.currentSlide++;
        updateSlides();
    } else {
        tutorialModal.classList.add('hidden');
        if (tempSettings.sound === 'on') unlockAudio();
        showTitle();
    }
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        GS.ui.currentSlide = index;
        updateSlides();
    });
});

// 訪問者数取得 (CountAPI)
function fetchAndDisplayVisitorCount() {
    const visitorCountDisplay = document.getElementById('visitorCountDisplay');

    // 既に取得済みの場合は表示のみ更新
    if (GS.ui.visitorCount !== null) {
        visitorCountDisplay.textContent = `あなたは ${GS.ui.visitorCount} 人目の修行者です`;
        visitorCountDisplay.classList.remove('hidden');
        return;
    }

    const namespace = 'bonno-taisan-game';
    const key = 'visits';
    const url = `https://api.counterapi.dev/v1/${namespace}/${key}/up`;
    const infoUrl = `https://api.counterapi.dev/v1/${namespace}/${key}/`; // 取得のみのURL（末尾のスラッシュが必須）

    // セッション内で既にカウントアップしたか確認
    const hasCountedInSession = sessionStorage.getItem('nenbunVisitorCounted');
    const fetchUrl = hasCountedInSession ? infoUrl : url;

    fetch(fetchUrl)
        .then(response => {
            if (!response.ok) {
                // 初回アクセス等でキーがない場合などを考慮
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // counterapi.dev は `/up` 時は `{"id":...,"name":"visits","count":195,...}` のような構成で返す
            // もしくは、ただの `{"count":123}` を返す可能性があるため、適切に取得する。
            const currentCount = data.count !== undefined ? data.count : (data.value !== undefined ? data.value : 0);

            GS.ui.visitorCount = currentCount;
            visitorCountDisplay.textContent = `あなたは ${GS.ui.visitorCount} 人目の修行者です`;
            visitorCountDisplay.classList.remove('hidden');

            if (!hasCountedInSession) {
                sessionStorage.setItem('nenbunVisitorCounted', 'true');
            }
        })
        .catch(error => {
            console.error('Visitor count fetch failed:', error);
            // エラー時は非表示のままにするが、デバッグ用にログを出す
            // 必要であればフォールバック表示を行う
        });
}
