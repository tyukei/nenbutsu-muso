// ==========================================
// ui.js — 画面遷移・UI更新・設定・ToS・チュートリアル
// ==========================================

// 煩悩メッセージ表示
function showBonnouMessage(bonnouText) {
    const isEn = GS.lang === 'en';
    const textToDisplay = isEn ? (bonnouDescriptionsEn[bonnouText] || bonnouText) : bonnouText;
    const description = isEn ? '' : (bonnouDescriptionsJa[bonnouText] || '心を乱す煩悩');

    const messageItem = document.createElement('div');
    messageItem.className = 'bonnou-message-item';

    if (isEn) {
        messageItem.innerHTML = `
            <div class="bonnou-title font-en">"${bonnouText}"</div>
            <div class="bonnou-desc">${textToDisplay}</div>
        `;
    } else {
        messageItem.innerHTML = `
            <div class="bonnou-title">「${textToDisplay}」</div>
            <div class="bonnou-desc">${description}</div>
        `;
    }

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

// 修行の記録データ
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

    const t = translations[GS.lang] || translations['ja'];

    if (rankings.length === 0) {
        rankingList.innerHTML = `<p class="ranking-empty">${t.noRecord}</p>`;
        return;
    }

    let html = '';
    rankings.forEach((rank, index) => {
        const isTop3 = index < 3;
        const levelLabel = escapeHtml(String(rank.levelName || '中級'));
        const score = escapeHtml(String(rank.score));
        const combo = escapeHtml(String(rank.combo));
        const date = escapeHtml(String(rank.date));
        const rankText = GS.lang === 'en' ? `Rank ${index + 1}` : `${index + 1}${t.rankSuffix}`;
        html += `
                    <div class="rank-item ${isTop3 ? 'top3' : ''}">
                        <span class="rank-number">${rankText}</span>
                        <span class="rank-score">
                            [<span data-i18n="buddhaNature${rank.level === 'easy' ? '1' : rank.level === 'normal' ? '2' : rank.level === 'hard' ? '3' : 'Demon'}">${levelLabel}</span>] ${score}${t.destroyedSuffix}<br>
                            <span style="font-size: 0.85em; opacity: 0.8;">${t.maxComboPrefix}${combo})</span>
                        </span>
                        <span class="rank-date">${date}</span>
                    </div>
                `;
    });
    rankingList.innerHTML = html;
    updateLanguageUI(); // Update newly created elements
}

// 累計データの計算と表示
function displayCumulativeStats() {
    const cumulativeStats = document.getElementById('cumulativeStats');
    if (!cumulativeStats) return;

    const t = translations[GS.lang] || translations['ja'];

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
            <div class="cumulative-stat-label" data-i18n="playCount">${t.playCount || 'プレイ回数'}</div>
            <div class="cumulative-stat-value">${totalPlays}</div>
        </div>
        <div class="cumulative-stat">
            <div class="cumulative-stat-label" data-i18n="totalDestroyed">${t.totalDestroyed || '累計撃破数'}</div>
            <div class="cumulative-stat-value">${totalDestroyed}</div>
        </div>
        <div class="cumulative-stat">
            <div class="cumulative-stat-label" data-i18n="totalKudoku">${t.totalKudoku || '累計功徳'}</div>
            <div class="cumulative-stat-value">${totalKudoku}</div>
        </div>
    `;
}

// レベルに基づいてタイトル画面の画像を更新する関数
function updateTitleImages(level = 'easy') {
    // イントロ画像を更新
    introMonkHappy.src = monkHappySources[level] || monkHappySources.easy;
    introMonkSad.src = monkSadSources[level] || monkSadSources.easy;

    // 永続的な画像を更新
    const persistentHappy = document.querySelector('.persistent-happy');
    const persistentSad = document.querySelector('.persistent-sad');
    if (persistentHappy) persistentHappy.src = monkHappySources[level] || monkHappySources.easy;
    if (persistentSad) persistentSad.src = monkSadSources[level] || monkSadSources.easy;
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
    const t = translations[GS.lang] || translations['ja'];
    const introMainRaw = t.introMainRaw || TITLE_INTRO_PHRASE_MAIN;
    const introRedWord = t.introRedWord || INTRO_RED_WORD;

    const redStart = introMainRaw.indexOf(introRedWord);
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
    GS.intro.running = false;
    GS.intro.played = true;

    const t = translations[GS.lang] || translations['ja'];
    const introMainRaw = t.introMainRaw || TITLE_INTRO_PHRASE_MAIN;
    const introSub = t.introSub || TITLE_INTRO_PHRASE_SUB;

    introMonkHappy.classList.add('intro-active');
    introMonkSad.classList.add('intro-active');
    introMonkPray.classList.add('intro-active');
    titleIntroMessage.classList.add('intro-active');
    renderIntroMainText(introMainRaw);
    titleIntroMessageTextSub.textContent = introSub;
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

    const t = translations[GS.lang] || translations['ja'];
    const introMainRaw = t.introMainRaw || TITLE_INTRO_PHRASE_MAIN;
    const introSub = t.introSub || TITLE_INTRO_PHRASE_SUB;

    let charIndex = 0;
    const fullText = `${introMainRaw}\n${introSub}`;
    const threshold = introMainRaw.length;
    GS.intro.typingTimer = setInterval(() => {
        if (!GS.intro.running) return;
        charIndex += 1;
        if (charIndex <= threshold) {
            renderIntroMainText(introMainRaw.slice(0, charIndex));
            titleIntroMessageTextSub.textContent = '';
        } else {
            renderIntroMainText(introMainRaw);
            titleIntroMessageTextSub.textContent = introSub.slice(0, charIndex - threshold - 1);
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
    recordMenuScreen.classList.add('hidden');
    zukanScreen.classList.add('hidden');
    rankingScreen.classList.add('hidden');
    buddhaMessageScreen.classList.add('hidden'); // Fix for close button not working
    buddhaMessageDetailModal.classList.add('hidden'); // Safeguard
    infoPanel.classList.add('hidden');
    virtualControls.classList.add('hidden');
    bonnouMessageContainer.innerHTML = '';

    // ホーム画面は常に monk_happy_1 / monk_sad_1 に固定するため 'easy' を指定
    updateTitleImages('easy');

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
    recordMenuScreen.classList.add('hidden');
    zukanScreen.classList.add('hidden');
    rankingScreen.classList.add('hidden');
    buddhaMessageScreen.classList.add('hidden');
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

// ブッダメッセージ画面
function showBuddhaMessageScreen() {
    GS.screen = 'buddhamessage';
    titleScreen.classList.add('hidden');
    buddhaMessageScreen.classList.remove('hidden');

    // ロック状態の更新
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`bmBtn${i}`);
        const bmData = buddhaMessagesData.find(m => m.id === i);
        if (GS.play.unlockedMessages.includes(i)) {
            btn.classList.remove('locked');
            btn.querySelector('.bm-title').textContent = GS.lang === 'en' ? bmData.titleEn : bmData.title;
            btn.querySelector('.bm-title').removeAttribute('data-i18n');
            const lockEl = btn.querySelector('.bm-lock');
            if (lockEl) lockEl.style.display = 'none';
        } else {
            btn.classList.add('locked');
            btn.querySelector('.bm-title').textContent = translations[GS.lang].locked;
            btn.querySelector('.bm-title').setAttribute('data-i18n', 'locked');
            const lockEl = btn.querySelector('.bm-lock');
            if (lockEl) lockEl.style.display = 'block';
        }
    }
}

function showBuddhaMessageDetail(id) {
    const data = buddhaMessagesData.find(m => m.id === id);
    if (!data) return;

    bmDetailTitle.innerHTML = GS.lang === 'en' ? data.titleEn : data.title;

    if (GS.lang === 'en') {
        bmDetailContentJa.style.display = 'none';
        bmDetailContentEn.style.display = 'block';
        bmDetailContentEn.innerHTML = data.contentEn;
        // remove the dashed top border when there's no Japanese text above it
        bmDetailContentEn.style.borderTop = 'none';
        bmDetailContentEn.style.marginTop = '0';
        bmDetailContentEn.style.paddingTop = '0';
    } else {
        bmDetailContentJa.style.display = 'block';
        bmDetailContentEn.style.display = 'none';
        bmDetailContentJa.innerHTML = data.contentJa;
        // Keep these clean
        bmDetailContentEn.innerHTML = '';
    }

    buddhaMessageDetailModal.classList.remove('hidden');

    // Read aloud if we want to add TTS later
}

// ブッダメッセージ画面イベント
buddhaMessageBtn.addEventListener('click', () => {
    sendAnalyticsEvent('feature_usage', { feature_name: 'buddha_message' });
    showBuddhaMessageScreen();
});
backFromBuddhaMessageBtn.addEventListener('click', showTitle);

// 関連リンクモーダルイベント
affiliateBtn.addEventListener('click', () => {
    sendAnalyticsEvent('feature_usage', { feature_name: 'affiliate' });
    affiliateModal.classList.remove('hidden');
});
closeAffiliateBtn.addEventListener('click', () => {
    affiliateModal.classList.add('hidden');
});

for (let i = 1; i <= 4; i++) {
    document.getElementById(`bmBtn${i}`).addEventListener('click', () => {
        if (!document.getElementById(`bmBtn${i}`).classList.contains('locked')) {
            showBuddhaMessageDetail(i);
        }
    });
}

closeBmDetailBtn.addEventListener('click', () => {
    buddhaMessageDetailModal.classList.add('hidden');
});

// 言語切り替えロジック
function updateLanguageUI() {
    const t = translations[GS.lang];

    // Helper to carefully set data-i18n text
    const setTranslation = (id, key, isHtml = false) => {
        const el = document.getElementById(id);
        if (el && t[key]) {
            if (isHtml) el.innerHTML = t[key];
            else el.textContent = t[key];
        }
    };

    // Update defined elements
    setTranslation('startBtn', 'gameStart');
    setTranslation('rankingBtn', 'record');
    setTranslation('zukanMenuBtn', 'recordZukan');
    setTranslation('historyMenuBtn', 'recordHistory');
    setTranslation('menuBtn', 'setting');
    setTranslation('buddhaMessageBtn', 'buddhaMessage', true);
    setTranslation('langToggleBtn', 'langToggle');

    setTranslation('levelScreen h1', 'stageSelect');
    setTranslation('backFromLevelBtn', 'back');
    setTranslation('backFromRecordMenuBtn', 'back');
    setTranslation('backFromZukanBtn', 'back');
    setTranslation('backFromRankingBtn', 'back');
    setTranslation('restartBtn', 'restart');
    setTranslation('toTitleBtn', 'title');
    setTranslation('shareBtn', 'share');
    setTranslation('closeBmDetailBtn', 'close');
    setTranslation('backFromBuddhaMessageBtn', 'close');
    setTranslation('shootBtn', 'shoot');
    setTranslation('specialBtn', 'special');

    // Handle dynamically populated lists if they have data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.getAttribute('data-i18n-alt');
        if (t[key]) {
            el.alt = t[key];
        }
    });

    document.querySelectorAll('.carousel-slide').forEach((img, index) => {
        const slideNumber = index + 1;
        if (GS.lang === 'en') {
            img.src = `images/tutorial-en/slide${slideNumber}.png`;
        } else {
            img.src = `images/tutorial/slide${slideNumber}.png`;
        }
    });

    // Toggle font class for English
    if (GS.lang === 'en') {
        document.body.classList.add('lang-en');
    } else {
        document.body.classList.remove('lang-en');
    }
}

langToggleBtn.addEventListener('click', () => {
    GS.lang = GS.lang === 'ja' ? 'en' : 'ja';
    localStorage.setItem('nenbunLanguage', GS.lang);

    sendAnalyticsEvent('lang_toggle', { new_lang: GS.lang });

    updateLanguageUI();
    showTitle(); // Refresh screen
});

function showRecordMenu() {
    GS.screen = 'recordMenu';
    titleScreen.classList.add('hidden');
    recordMenuScreen.classList.remove('hidden');
    rankingScreen.classList.add('hidden');
    zukanScreen.classList.add('hidden');

    sendAnalyticsEvent('feature_usage', { feature_name: 'recordMenu' });
}

function showZukan() {
    GS.screen = 'zukan';
    recordMenuScreen.classList.add('hidden');
    zukanScreen.classList.remove('hidden');

    sendAnalyticsEvent('feature_usage', { feature_name: 'zukan' });

    displayZukan();
}

function displayZukan() {
    const isEn = GS.lang === 'en';
    let html = '';

    bonnouList.forEach(bonnou => {
        const isUnlocked = GS.play.unlockedBonnou.includes(bonnou);

        if (isUnlocked) {
            const displayTitle = isEn ? (bonnouDescriptionsEn[bonnou] || bonnou) : bonnou;
            const fullDesc = isEn ? '' : (bonnouDescriptionsJa[bonnou] || '');
            let phonetic = '';
            let meaning = '';

            if (!isEn && fullDesc) {
                const parts = fullDesc.split('：');
                if (parts.length === 2) {
                    phonetic = parts[0];
                    meaning = parts[1];
                } else {
                    meaning = fullDesc;
                }
            }

            html += `
                <div class="zukan-item">
                    <div class="zukan-item-title ${isEn ? 'font-en' : ''}">
                        ${isEn ? `"${escapeHtml(displayTitle)}"` : `「${escapeHtml(displayTitle)}」`}
                    </div>
                    ${!isEn ? `<div class="zukan-item-desc">${escapeHtml(phonetic)}：${escapeHtml(meaning)}</div>` : ''}
                </div>
            `;
        } else {
            html += `
                <div class="zukan-item locked">
                    <!-- Locked content empty as requested -->
                </div>
            `;
        }
    });

    zukanList.innerHTML = html;
}

function showRanking() {
    GS.screen = 'ranking';
    titleScreen.classList.add('hidden');
    recordMenuScreen.classList.add('hidden');
    rankingScreen.classList.remove('hidden');

    sendAnalyticsEvent('feature_usage', { feature_name: 'ranking' });

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

    const t = translations[GS.lang] || translations['ja'];

    let shareText = t.shareTitle || `煩悩シューティング\n`;
    shareText += (t.shareLevel || `【$1】\n`).replace('$1', levelName);

    if (isWin) {
        shareText += (t.shareWin || `✨仏性が育ちました！✨\n`);
    } else {
        shareText += (t.shareLose || `煩悩に呑まれた...\n`);
    }

    shareText += (t.shareScore || `撃破数: $1/$2\n`).replace('$1', play.score).replace('$2', targetDisplay);
    shareText += (t.shareCombo || `最大連鎖: $1\n`).replace('$1', play.maxCombo);
    shareText += `\n#煩悩シューティング #般若心経EDM\n#神社仏閣オンライン\n`;
    shareText += `\nhttps://bonno-taisan.jinjabukkaku.online/`;

    sendAnalyticsEvent('share_click', {
        level: level.current,
        score: play.score,
        is_win: isWin
    });

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

    const t = translations[GS.lang] || translations['ja'];

    if (hashed === -1116238380) { // nenbutsu-mashimashi1
        if (!cleared.includes('easy')) {
            cleared.push('easy');
        }
        localStorage.setItem('nenbunClearedLevels', encodeBase64(JSON.stringify(cleared)));
        message = t.unlockSuccess1 || '✓ 仏性Lev2を解放しました！';
        unlocked = true;
    } else if (hashed === -1116238379) { // nenbutsu-mashimashi2
        if (!cleared.includes('easy')) cleared.push('easy');
        if (!cleared.includes('normal')) cleared.push('normal');
        localStorage.setItem('nenbunClearedLevels', encodeBase64(JSON.stringify(cleared)));
        message = t.unlockSuccess2 || '✓ 仏性Lev3を解放しました！';
        unlocked = true;
    } else if (hashed === -1116238378) { // nenbutsu-mashimashi3
        if (!cleared.includes('easy')) cleared.push('easy');
        if (!cleared.includes('normal')) cleared.push('normal');
        if (!cleared.includes('hard')) cleared.push('hard');
        localStorage.setItem('nenbunClearedLevels', encodeBase64(JSON.stringify(cleared)));
        message = t.unlockSuccessDemon || '✓ Lev悪魔を解放しました！';
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
        passwordMessage.textContent = t.passwordWrong || '✗ パスワードが違います';
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
    mode: 'mobile_slide1'
};

function loadTempSettingsFromStorage() {
    const savedSettings = localStorage.getItem('nenbunSettings');
    if (savedSettings) {
        tempSettings = JSON.parse(savedSettings);
        if (tempSettings.mode === 'mobile' || tempSettings.mode === 'mobile_slide') {
            tempSettings.mode = 'mobile_slide1'; // Migrate legacy 'mobile' or 'mobile_slide' to 'mobile_slide1'
        }
        if (!tempSettings.sound) tempSettings.sound = 'on';
        if (!tempSettings.mode) tempSettings.mode = 'mobile_slide1';
    } else {
        tempSettings = {
            sound: 'on',
            mode: 'mobile_slide1'
        };
    }

    const savedLang = localStorage.getItem('nenbunLanguage');
    if (savedLang) {
        GS.lang = savedLang;
    }
}

function initSettings() {
    const savedSettings = localStorage.getItem('nenbunSettings');

    if (!savedSettings) {
        loadTempSettingsFromStorage();
        settingsModal.classList.remove('hidden');
        updateToggleButtons();
    } else {
        loadTempSettingsFromStorage(); // Also loads language
        const settings = JSON.parse(savedSettings);
        applySettings(settings);
        showTitle();
    }

    updateLanguageUI();
}

function applySettings(settings) {
    if (settings.mode === 'mobile' || settings.mode === 'mobile_slide') {
        settings.mode = 'mobile_slide1';
    }

    // Apply Mode
    if (settings.mode === 'mobile_slide1' || settings.mode === 'mobile_slide2' || settings.mode === 'mobile_joycon') {
        document.body.classList.add('mobile-mode');
    } else {
        document.body.classList.remove('mobile-mode');
    }

    if (settings.mode === 'mobile_joycon') {
        document.body.classList.add('joycon-mode');
    } else {
        document.body.classList.remove('joycon-mode');
    }

    if (settings.mode === 'mobile_slide2') {
        document.body.classList.add('slide2-mode');
    } else {
        document.body.classList.remove('slide2-mode');
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

    const t = translations[GS.lang] || translations['ja'];
    if (GS.ui.currentSlide === slides.length - 1) {
        nextSlideBtn.textContent = t.close || '閉じる';
    } else {
        nextSlideBtn.textContent = t.next || '次へ';
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
    const t = translations[GS.lang] || translations['ja'];

    // 既に取得済みの場合は表示のみ更新
    if (GS.ui.visitorCount !== null) {
        const visitorText = t.visitorCount || 'あなたは $1 人目の修行者です';
        visitorCountDisplay.textContent = visitorText.replace('$1', GS.ui.visitorCount);
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
            const visitorText = t.visitorCount || 'あなたは $1 人目の修行者です';
            visitorCountDisplay.textContent = visitorText.replace('$1', GS.ui.visitorCount);
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
