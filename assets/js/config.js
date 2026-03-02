// ==========================================
// config.js — 定数・DOM要素・設定データ
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

// 仮想コントローラーボタン
const shootBtn = document.getElementById('shootBtn');
const specialBtn = document.getElementById('specialBtn');

// モバイルステータス表示
const mobileStatus = document.getElementById('mobileStatus');
const mobileScoreDisplay = document.getElementById('mobileScore');
const mobileSpiritDisplay = document.getElementById('mobileSpirit');
const mobileKudokuDisplay = document.getElementById('mobileKudoku');
const mobileComboDisplay = document.getElementById('mobileCombo');

// 煩悩メッセージ表示
const bonnouMessageContainer = document.getElementById('bonnouMessageContainer');

// ブッダメッセージ関連要素
const buddhaMessageBtn = document.getElementById('buddhaMessageBtn');
const buddhaMessageScreen = document.getElementById('buddhaMessageScreen');
const backFromBuddhaMessageBtn = document.getElementById('backFromBuddhaMessageBtn');
const buddhaMessageDetailModal = document.getElementById('buddhaMessageDetailModal');
const closeBmDetailBtn = document.getElementById('closeBmDetailBtn');
const bmDetailTitle = document.getElementById('bmDetailTitle');
const bmDetailContentJa = document.getElementById('bmDetailContentJa');
const bmDetailContentEn = document.getElementById('bmDetailContentEn');
const langToggleBtn = document.getElementById('langToggleBtn');

// 関連リンク関連要素
const affiliateBtn = document.getElementById('affiliateBtn');
const affiliateModal = document.getElementById('affiliateModal');
const closeAffiliateBtn = document.getElementById('closeAffiliateBtn');

// 画像リソース
const monkImage = new Image();
monkImage.src = 'images/monk/monk_back.png';

const bulletImage = new Image();
bulletImage.src = 'images/game/hourin.png'; // 卍から法輪

// === 定数 ===
const MAX_KUDOKU = 6;
const HIDE_DELAY = 3000;
const TARGET_FPS = 60;
const STEP = 1000 / TARGET_FPS;

// タイトルイントロ テキスト定数
const TITLE_INTRO_PHRASE_MAIN = '降り注ぐ煩悩の雨……\n迷わず撃て！悟りはその先にある。';
const TITLE_INTRO_PHRASE_SUB = '究極の徳（ハイスコア）を目指せ！';
const INTRO_RED_WORD = '煩悩';

// 六波羅蜜リスト
const ROPPARAMITSU_LIST = ['布施', '持戒', '忍辱', '精進', '禅定', '智慧'];

// 難易度設定
const levelSettings = {
    easy: {
        name: '仏性Lev1',
        targetScore: 36,
        baseSpeed: 1.5,
        spawnRate: 34,
        speedIncrease: 0.02,
        nenbutsuRate: 0.3,
        isInfinite: false,
        initialSpirit: 3,
        maxEnemies: 8
    },
    normal: {
        name: '仏性Lev2',
        targetScore: 72,
        baseSpeed: 1.5,
        spawnRate: 25,
        speedIncrease: 0.05,
        isInfinite: false,
        initialSpirit: 4,
        maxEnemies: 10
    },
    hard: {
        name: '仏性Lev3',
        targetScore: 108,
        baseSpeed: 1.8,
        spawnRate: 20,
        speedIncrease: 0.06,
        isInfinite: false,
        initialSpirit: 5,
        maxEnemies: 15
    },
    demon: {
        name: 'Lev悪魔',
        targetScore: 324,
        baseSpeed: 1.0,
        spawnRate: 15,
        speedIncrease: 0.05,
        nenbutsuRate: 0.3,
        isInfinite: false,
        initialSpirit: 5,
        maxEnemies: 20
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

// 煩悩の説明と対処法 (Japanese)
const bonnouDescriptionsJa = {
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

// 煩悩の説明と対処法 (English)
const bonnouDescriptionsEn = {
    '貪': 'Greed',
    '瞋': 'Aversion',
    '痴': 'Unawareness of the true nature of things',
    '慢': 'Pride',
    '疑': 'Doubt',
    '見': 'Wrong View',
    '無明': 'Fundamental lack of knowledge',
    '随眠': 'Subconscious afflictions',
    '無慚': 'Shamelessness',
    '無愧': 'Recklessness',
    '嫉': 'Jealousy',
    '慳': 'Miserliness',
    '悪作': 'Regret',
    '眠': 'Sleepiness (narrow view)',
    '掉挙': 'Restlessness',
    '惛沈': 'Sloth',
    '忿': 'Quickness to anger',
    '覆': 'Concealment of mistakes, untruthfulness',
    '執着': 'Clinging',
    '渇愛': 'Craving',
    '妄想': 'Delusional thought divorced from reality',
    '恐怖': 'Fear',
    '懈怠': 'Laziness',
    '色欲': 'Craving for form',
    '声欲': 'Craving for sound',
    '香欲': 'Craving for smell',
    '味欲': 'Craving for taste',
    '触欲': 'Craving for sense pleasures'
};

// UI・テキストの翻訳辞書
const translations = {
    'ja': {
        'gameStart': '修行の開始',
        'record': '修行の軌跡',
        'setting': '修行の準備',
        'buddhaMessage': 'ブッダメッセージ',
        'langToggle': 'In English',
        'stageSelect': '修行の道',
        'buddhaNature1': '仏性Lev1',
        'buddhaNature2': '仏性Lev2',
        'buddhaNature3': '仏性Lev3',
        'levelDemon': 'Lev悪魔',
        'levelLock1': '仏性Lev1をクリアで解放',
        'levelLock2': '仏性Lev2をクリアで解放',
        'levelLock3': '仏性Lev3をクリアで解放',
        'levelLockDemon': 'Lev悪魔クリアで解放',
        'back': '戻る',
        'close': '閉じる',
        'toTitle': 'タイトルに戻る',
        'share': '共有',
        'restart': '再修行',
        'title': 'タイトル',
        'shoot': '読経発射',
        'special': '煩悩即菩薩',
        'locked': 'Locked',

        // --- 新規追加 ---
        'introMain': '降り注ぐ<span class="text-bonnou-red">煩悩</span>の雨……<br>迷わず撃て！悟りはその先にある。',
        'introMainRaw': '降り注ぐ煩悩の雨……\n迷わず撃て！悟りはその先にある。',
        'introRedWord': '煩悩',
        'introSub': '究極の徳（ハイスコア）を目指せ！',
        'tapToSkip': 'タップでスキップ',
        'tutorialBasic': '基本操作',
        'tutorialShoot': '煩悩を撃て',
        'tutorialCollect': '六波羅蜜を集めよ',
        'prev': '前へ',
        'next': '次へ',
        'selectDifficulty': '難易度を選べ',
        'descEasy': '煩悩36体 / ゆっくり',
        'descNormal': '煩悩72体 / 普通',
        'descHard': '煩悩108体 / 高速',
        'descDemon': '煩悩324体 / 加速地獄',
        'unlockLevel': 'レベル解放',
        'passwordDesc': 'パスワードを入力してレベルを解放',
        'passwordHint': '※各レベルに対応するパスワードがあります',
        'passwordPlaceholder': 'パスワードを入力',
        'confirm': '確認',
        'cancel': 'キャンセル',
        'unlockSuccess1': '✓ 仏性Lev2を解放しました！',
        'unlockSuccess2': '✓ 仏性Lev3を解放しました！',
        'unlockSuccessDemon': '✓ Lev悪魔を解放しました！',
        'passwordWrong': '✗ パスワードが違います',
        'menu': 'メニュー',
        'menuSettings': '設定',
        'menuTos': '利用規約',
        'menuTutorial': '修行の心得',
        'menuDeveloper': '開発者モード',
        'settingsTitle': '環境設定',
        'soundSetting': '音声設定',
        'soundOn': 'ON (BGMあり)',
        'soundOff': 'OFF (無音)',
        'soundDesc': '※「ON」の場合、開始時に音声が再生されます',
        'controlMode': '操作モード',
        'controlPc': 'キーボード',
        'controlMobileSlide1': 'スライド1',
        'controlMobileSlide2': 'スライド2',
        'controlMobileJoycon': 'ジョイコン',
        'submit': '決定',
        'tosAgree': '閉じる',
        'tosTitle': '利用規約',
        'tosText': `<h3 style='margin-bottom: 0px;'>「煩悩シューティング」利用規約</h3>
<p style='text-align: right; font-size: 0.8em; color: #888; margin-bottom: 15px;'>最終更新日：2026年3月1日</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>本利用規約（以下「本規約」といいます。）は、株式会社神社仏閣オンライン（以下「当社」といいます。）が提供するブラウザゲーム「煩悩シューティング」（以下「本ゲーム」といいます。）の利用条件を定めるものです。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>ユーザーは、本ゲームを利用することにより、本規約に同意したものとみなされます。</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第1条（著作権および権利帰属）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒈　本ゲームに関する一切の権利（著作権、商標権、プログラム、画像、音声、テキスト、ゲームデザイン、キャラクター、世界観その他の知的財産権）は、当社または正当な権利を有する第三者に帰属し、ユーザーは、本規約で明示的に許可される範囲を超えて、本ゲームを利用することはできません。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒉　当社は、本ゲームの素材を、文章生成AI、画像生成AI、その他の生成系AIの学習用データとして使用、入力、または提供する行為を当社の利益を不当に害するものとして禁止します。</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第2条（許諾される利用）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>当社は、ユーザーに対し、本ゲームを個人的かつ非営利目的で利用することを許諾します。</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第3条（二次創作および動画配信の利用）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. 	ユーザーは、本ゲームのプレイ動画、スクリーンショット、実況動画、配信、レビュー、二次創作作品（イラスト・動画・文章等を含む）を、非営利目的の範囲で自由に制作・公開することができます。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. 	前項にかかわらず、以下のプラットフォームが提供する標準的な収益化機能による収益取得は、非営利利用の例外として許可します。</p>
<ul style='margin-left: 20px; list-style-type: disc; margin-bottom: 10px; color: #ddd; font-size: 0.9em;'>
<li>動画共有サイトの広告収益プログラム</li>
<li>配信サイトの投げ銭・スーパーチャット・サブスク機能</li>
<li>プラットフォーム公式のクリエイター収益分配制度</li>
<li>その他当社が同等と認める標準収益化機能[聖宮1]</li>
</ul>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>3. 	前項の例外は、プラットフォームが提供する仕組みによる収益取得のみを対象とし、以下の行為は許可されません。</p>
<ul style='margin-left: 20px; list-style-type: disc; margin-bottom: 10px; color: #ddd; font-size: 0.9em;'>
<li>二次創作物の販売</li>
<li>グッズ販売</li>
<li>有料配信・有料視聴販売</li>
<li>有料会員限定コンテンツとしての公開</li>
<li>企業案件</li>
<li>広告タイアップ</li>
<li>本ゲーム素材を用いた商用サービス提供</li>
<li>その他営利を目的とする利用[聖宮2]</li>
</ul>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>4. 	二次創作・配信にあたっては、以下の表示を推奨します。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>© 煩悩シューティング</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第4条（禁止事項）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>ユーザーは、以下の行為を行ってはなりません。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. 本ゲームのデータ・プログラムの解析、改変、リバースエンジニアリング</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. 本ゲームの再配布、再公開、無断転載</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>3. 本ゲームを商業・営利目的で利用する行為</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>4. 本ゲームの素材を独立したコンテンツとして使用する行為</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>5. 本ゲームの素材を生成AIの学習用データとして入力または提供する行為</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>6. 当社または第三者の権利を侵害する行為</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>7. 公序良俗に反する利用</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>8. 本ゲームのイメージを著しく損なう利用</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>9. 反社会的活動への利用</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒑ 本ゲーム公式または公認と誤認させる表示</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒒ その他当社が不適切と判断する行為</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第5条（ガイドライン違反時の措置）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>当社は、ユーザーの利用が本規約に違反すると判断した場合、公開停止要請、削除要請、利用差止め等の措置を行うことがあります。</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第6条（免責）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. 	当社は、本ゲームの提供に関し、その完全性、正確性、継続性、および特定のデバイスやOSでの動作を保証しません。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. 	本ゲームの利用により、当社の責めに帰すべき事由によって、ユーザーに損害が生じた場合、当社は故意または重過失がある場合を除き、ユーザーに現実に生じた直接かつ通常の損害（特別損害、逸失利益、データの消失を除く）に限り、賠償責任を負うものとします。[聖宮3]</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第7条（情報の取り扱い及びプライバシー）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒈　ユーザーが登録したニックネーム、ユーザーID、スコア、およびゲームプレイ履歴は、原則として非個人情報として扱い、ランキング形式等で他のユーザーに公開されることがあります 。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒉　当社は、本ゲームの利用状況の分析およびサービス向上のため、Cookie（クッキー）等の技術を用いてユーザーのアクセスログ情報を収集することがあります 。[聖宮4]</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第8条（サービス変更・終了）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>当社は、予告なく本ゲームの内容変更、提供停止、終了を行うことがあります。</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第9条（規約変更）[聖宮5]</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒈　当社は、民法第548条の4の規定に基づき、本規約を変更することができます。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒉　当社は、本規約を変更する場合、変更後の規約の効力発生時期を定め、その14日前までに、本ゲーム内または公式サイトへの掲載その他適切な方法により、規約を変更する旨、変更後の内容、および効力発生時期を周知します。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>⒊　ユーザーが変更後の規約の効力発生時期以降に本ゲームを利用した場合、変更後の契約に同意したものとみなされます。</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第10条（準拠法・管轄）</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>本規約は日本法に準拠します。本ゲームに関して紛争が生じた場合、当社所在地を管轄する裁判所を第一審の専属管轄裁判所とします。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[聖宮1]不明確なので削除してもよろしいでしょうか。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[聖宮2]当方からすると、不許可事項が多い方が有利ですので、包括条項を入れています。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[聖宮3]利用規約ですので、損害の範囲を限定的にしています。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>消費者契約法8条1項1号で事業者の軽過失による債務不履行や不法行為により消費者に生じた損害について、事業者の責任を「全面的に免除」する条項は無効とされます。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>そのため、可能な限り、損害額の範囲を限定しております。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>（事業者の損害賠償の責任を免除する条項等の無効）</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>第八条 次に掲げる消費者契約の条項は、無効とする。</h4>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>一 事業者の債務不履行により消費者に生じた損害を賠償する責任の全部を免除し、又は当該事業者にその責任の有無を決定する権限を付与する条項</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[聖宮4]個人情報に配慮しておいた方がよいので、この記載を入れています。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>有料版にする際には、プライバシーポリシー等で個人情報の取り扱いを定めておいた方がよいです。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[聖宮5]第548条の4【定型約款の変更】</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>①　定型約款準備者は、次に掲げる場合には、定型約款の変更をすることにより、変更後の定型約款の条項について合意があったものとみなし、個別に相手方と合意をすることなく契約の内容を変更することができる。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>一　定型約款の変更が、相手方の一般の利益に適合するとき。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>二　定型約款の変更が、契約をした目的に反せず、かつ、変更の必要性、変更後の内容の相当性、この条の規定により定型約款の変更をすることがある旨の定めの有無及びその内容その他の変更に係る事情に照らして合理的なものであるとき。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>②　定型約款準備者は、前項の規定による定型約款の変更をするときは、その効力発生時期を定め、かつ、定型約款を変更する旨及び変更後の定型約款の内容並びにその効力発生時期をインターネットの利用その他の適切な方法により周知しなければならない。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>③　第一項第二号の規定による定型約款の変更は、前項の効力発生時期が到来するまでに同項の規定による周知をしなければ、その効力を生じない。</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>④　第548条の2第2項の規定は、第一項の規定による定型約款の変更については、適用しない。</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>この条文が令和2年の民法改正で新設されたため、今回は、効力発生時期を定め、周知するという流れに条項を変更しております。</p>
`,
        'pastRecord': '己の過去と向き合う',
        'playCount': 'プレイ回数',
        'totalDestroyed': '累計撃破数',
        'totalKudoku': '累計功徳',
        'noRecord': 'まだ記録がありません',
        'rankSuffix': '位',
        'destroyedSuffix': '体撃破',
        'maxComboPrefix': '(最大連鎖×',
        'hudTitle': '煩悩シューティング:',
        'hudSpirit': '精神力:',
        'hudKudoku': '功徳:',
        'hudCombo': '連鎖数:',
        'mobileSpirit': '精神力',
        'mobileKudoku': '功徳',
        'mobileCombo': '連鎖',
        'mobileScore': '徳',
        'resultWin': '仏性が$1に育ちました!',
        'resultWinHard': '解脱達成',
        'resultLose': '煩悩に呑まれた',
        'resultTextWinSuffix': 'の煩悩を全て打ち払いました',
        'resultTextLoseDemon': '悪魔の煩悩に呑まれてしまいました...',
        'resultTextLosePrefix': '「',
        'resultTextLoseSuffix': '」に心を侵されてしまいました',
        'statLevel': '仏性Lev',
        'statDestroyed': '撃破数',
        'statMaxCombo': '最大連鎖',
        'statGainedKudoku': '獲得功徳',
        'newBuddhaMessage': '✨ 新しいブッダメッセージが届きました ✨',
        'buddhaMsgOverlay': '✨ ブッダメッセージ が入りました ✨',
        'bonnouSokuBodai': '煩悩即菩提',
        'ropparamitsu': '六波羅蜜成就',
        'pressZ': 'Zを押して必殺技',
        'visitorCount': 'あなたは $1 人目の修行者です',
        'shareTitle': '煩悩シューティング\n',
        'shareLevel': '【$1】\n',
        'shareWin': '✨仏性が育ちました！✨\n',
        'shareLose': '煩悩に呑まれた...\n',
        'shareScore': '撃破数: $1/$2\n',
        'shareCombo': '最大連鎖: $1\n',
        'affiliate': '関連リンク',
        'affiliateCompany': '制作会社：神社仏閣オンライン',
        'sponsor': '協賛会社',
        'recruiting': '募集中',
    },
    'en': {
        'gameStart': 'Start Practice',
        'record': 'Practice Record',
        'setting': 'Settings',
        'buddhaMessage': 'Buddha Message',
        'langToggle': '日本語',
        'stageSelect': 'Path of Practice',
        'buddhaNature1': 'Buddha nature Lev1',
        'buddhaNature2': 'Buddha nature Lev2',
        'buddhaNature3': 'Buddha nature Lev3',
        'levelDemon': 'Lev Demon',
        'levelLock1': 'Clear Buddha nature 1 to unlock',
        'levelLock2': 'Clear Buddha nature 2 to unlock',
        'levelLock3': 'Clear Buddha nature 3 to unlock',
        'levelLockDemon': 'Clear Lev Demon to unlock',
        'back': 'Back',
        'close': 'Close',
        'toTitle': 'Back to Title',
        'share': 'Share',
        'restart': 'Retry',
        'title': 'Title',
        'shoot': 'Chant',
        'special': 'Transmute Afflictions',
        'locked': 'Locked',

        // --- 新規追加 ---
        'introMain': 'A falling rain of <span class="text-bonnou-red">afflictions</span>...<br>Shoot without hesitation! Enlightenment lies beyond.',
        'introMainRaw': 'A falling rain of afflictions...\nShoot without hesitation! Enlightenment lies beyond.',
        'introRedWord': 'afflictions',
        'introSub': 'Aim for the ultimate virtue (High Score)!',
        'tapToSkip': 'Tap to skip',
        'tutorialBasic': 'Basic Controls',
        'tutorialShoot': 'Shoot Afflictions',
        'tutorialCollect': 'Collect Paramitas',
        'prev': 'Prev',
        'next': 'Next',
        'selectDifficulty': 'Select Difficulty',
        'descEasy': '36 Afflictions / Slow',
        'descNormal': '72 Afflictions / Normal',
        'descHard': '108 Afflictions / Fast',
        'descDemon': '324 Afflictions / Acceleration Hell',
        'unlockLevel': 'Unlock Level',
        'passwordDesc': 'Enter password to unlock level',
        'passwordHint': '* Each level has a corresponding password',
        'passwordPlaceholder': 'Enter password',
        'confirm': 'Confirm',
        'cancel': 'Cancel',
        'unlockSuccess1': '✓ Buddha nature Lev2 unlocked!',
        'unlockSuccess2': '✓ Unlocked Buddha nature Lev3!',
        'unlockSuccessDemon': '✓ Unlocked Demon Level!',
        'passwordWrong': '✗ Incorrect password',
        'menu': 'Menu',
        'menuSettings': 'Settings',
        'menuTos': 'Terms of Service',
        'menuTutorial': 'How to Play',
        'menuDeveloper': 'Developer Mode',
        'settingsTitle': 'Environment Settings',
        'soundSetting': 'Sound Settings',
        'soundOn': 'ON (with BGM)',
        'soundOff': 'OFF (Muted)',
        'soundDesc': '* If ON, audio will play at the start',
        'controlMode': 'Control Mode',
        'controlPc': 'Keyboard',
        'controlMobileSlide1': 'Slide 1',
        'controlMobileSlide2': 'Slide 2',
        'controlMobileJoycon': 'Joycon',
        'submit': 'OK',
        'tosAgree': 'Close',
        'tosTitle': 'Terms of Service',
        'tosText': `<h3 style='margin-bottom: 0px;'>"Bonno Shooter" Terms of Service</h3>
<p style='text-align: right; font-size: 0.8em; color: #888; margin-bottom: 15px;'>Last Updated: March 1, 2026</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>These Terms of Service (hereinafter referred to as the "Terms") stipulate the conditions for using the browser game "Bonno Shooter" (hereinafter referred to as the "Game") provided by Jinja Bukkaku Online Co., Ltd. (hereinafter referred to as the "Company").</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>By using the Game, the user is deemed to have agreed to these Terms.</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 1 (Copyrights and Attribution of Rights)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. All rights related to the Game (copyrights, trademarks, programs, images, audio, text, game design, characters, worldview, and other intellectual property rights) belong to the Company or a third party with legitimate rights, and the user may not use the Game beyond the scope expressly permitted by these Terms.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. The Company prohibits the act of using, inputting, or providing the materials of the Game as training data for text generation AI, image generation AI, and other generative AI, as it unjustly harms the interests of the Company.</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 2 (Permitted Use)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>The Company grants the user permission to use the Game for personal and non-commercial purposes.</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 3 (Secondary Creation and Use for Video Distribution)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. Users may freely create and publish play videos, screenshots, live gameplay videos, streams, reviews, and derivative works (including illustrations, videos, text, etc.) of the Game as long as they are for non-commercial purposes.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. Notwithstanding the preceding paragraph, obtaining revenue through standard monetization features provided by the following platforms is permitted as an exception to non-commercial use:</p>
<ul style='margin-left: 20px; list-style-type: disc; margin-bottom: 10px; color: #ddd; font-size: 0.9em;'>
<li>Advertising revenue programs on video sharing sites</li>
<li>Tipping, Super Chat, and subscription features on streaming sites</li>
<li>Official creator revenue sharing systems on platforms</li>
<li>Other standard monetization features deemed equivalent by the Company [Seimiya 1]</li>
</ul>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>3. The exception in the preceding paragraph applies only to obtaining revenue through mechanisms provided by the platforms, and the following actions are not permitted:</p>
<ul style='margin-left: 20px; list-style-type: disc; margin-bottom: 10px; color: #ddd; font-size: 0.9em;'>
<li>Sales of derivative works</li>
<li>Merchandise sales</li>
<li>Paid streaming/paid viewing sales</li>
<li>Publishing as paid member-only content</li>
<li>Corporate sponsorships</li>
<li>Advertising tie-ups</li>
<li>Providing commercial services using Game materials</li>
<li>Other commercial uses [Seimiya 2]</li>
</ul>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>4. When making derivative works or streaming, the following display is recommended:</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>© Bonno Shooter</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 4 (Prohibited Actions)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>Users must not engage in the following actions:</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. Analyzing, modifying, or reverse engineering the Game's data or programs</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. Redistributing, republishing, or unauthorized reproduction of the Game</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>3. Using the Game for commercial or profit-making purposes</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>4. Using the materials of the Game as independent content</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>5. Inputting or providing the materials of the Game as training data for generative AI</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>6. Infringing on the rights of the Company or third parties</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>7. Use contrary to public order and morals</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>8. Use that significantly damages the Game's image</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>9. Use for anti-social activities</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>10. Displays that mislead as being official or authorized by the Game</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>11. Other actions deemed inappropriate by the Company</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 5 (Measures in Case of Guideline Violations)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>If the Company determines that a user's use violates these Terms, it may take measures such as requests for suspension of publication, deletion requests, and injunctions against use.</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 6 (Disclaimer)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. The Company does not guarantee the completeness, accuracy, continuity, or operation on specific devices or OSs regarding the provision of the Game.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. If the user suffers damages due to the use of the Game for reasons attributable to the Company, the Company shall be liable to compensate only for direct and ordinary damages actually incurred by the user (excluding special damages, lost profits, and data loss), except in cases of intentional or gross negligence by the Company. [Seimiya 3]</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 7 (Handling of Information and Privacy)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. Nicknames, User IDs, scores, and gameplay history registered by the user will generally be treated as non-personal information and may be published to other users in a ranking format, etc.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. The Company may collect users' access log information using technologies such as cookies for analyzing the usage status of the Game and improving the service. [Seimiya 4]</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 8 (Changes/Termination of Service)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>The Company may change the content, suspend provision, or terminate the Game without prior notice.</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 9 (Changes to Terms) [Seimiya 5]</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. The Company may change these Terms based on the provisions of Article 548-4 of the Civil Code.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. When the Company changes these Terms, it shall determine the effective date of the amended Terms and inform users of the intention to change the Terms, the changed content, and the effective date at least 14 days in advance by posting within the Game or on the official website, or by other appropriate methods.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>3. If the user uses the Game on or after the effective date of the amended Terms, it shall be deemed that they have agreed to the amended contract.</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 10 (Governing Law/Jurisdiction)</h4>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>These Terms shall be governed by Japanese law. In the event of a dispute related to the Game, the court with jurisdiction over the location of the Company shall be the exclusive agreement jurisdictional court of the first instance.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[Seimiya 1] This is unclear, so may I delete it?</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[Seimiya 2] From our perspective, it is more advantageous to have more prohibited items, so we have included a comprehensive clause.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[Seimiya 3] Since this is a terms of service, the scope of damages is limited.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>Under Article 8, Paragraph 1, Item 1 of the Consumer Contract Act, a clause that "completely exempts" the business operator from liability for damages caused to consumers due to default or tort caused by the business operator's slight negligence is invalid. Therefore, we have limited the scope of the amount of damages as much as possible.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>(Invalidity of Clauses Exempting Business Operators from Liability for Damages)</p>
<h4 style='margin-top: 15px; margin-bottom: 5px; color: #fff;'>Article 8 The following clauses of a consumer contract are invalid.</h4>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>(1) A clause that completely exempts a business operator from liability for damages caused to a consumer by the default of the business operator or grants the business operator the authority to determine whether or not it is liable.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[Seimiya 4] We have included this description because it is better to consider personal information. When making it a paid version, it is better to stipulate the handling of personal information in a privacy policy, etc.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; border-left: 2px solid #ffaa55; padding-left: 10px; background-color: rgba(255, 170, 85, 0.1);'>[Seimiya 5] Article 548-4 [Changes to Standard Terms and Conditions]</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>(1) A party making standard terms and conditions may change the standard terms and conditions without an individual agreement with the counterparty, considering that the counterparty has agreed to the clauses of the changed standard terms and conditions, in the following cases:</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>1. When the change to the standard terms and conditions conforms to the general interests of the counterparty.</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>2. When the change to the standard terms and conditions does not run counter to the purpose for which the contract was concluded, and is reasonable in light of the necessity of the change, the appropriateness of the changed content, the presence or absence of a provision to the effect that the standard terms and conditions may be changed pursuant to this Article, its content, and other circumstances relating to the change.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>(2) When changing standard terms and conditions pursuant to the preceding paragraph, the party making the standard terms and conditions must determine the effective date and make widely known to the public, by use of the Internet or other appropriate means, the fact that the standard terms and conditions are to be changed, the content of the changed standard terms and conditions, and the effective date thereof.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>(3) A change to standard terms and conditions pursuant to the provisions of paragraph (1), item 2 does not become effective unless the public notice under the preceding paragraph is given by the effective date under the preceding paragraph.</p>
<p style='margin-bottom: 8px; font-size: 0.85em; color: #ffaa55; line-height: 1.4; padding-left: 10px;'>(4) The provisions of Article 548-2, paragraph 2 do not apply to a change to standard terms and conditions under paragraph (1).</p>
<p style='margin-bottom: 8px; font-size: 0.9em; color: #eee; line-height: 1.4;'>Since this provision was newly established in the amendment to the Civil Code in 2020, we have changed the clause to follow the flow of determining the effective date and making it widely known.</p>
`,
        'pastRecord': 'Facing your past',
        'playCount': 'Play Count',
        'totalDestroyed': 'Total Destroyed',
        'totalKudoku': 'Total Kudoku',
        'noRecord': 'No records yet',
        'rankSuffix': '',  // Handled in code for 'Rank X'
        'destroyedSuffix': ' Destroyed',
        'maxComboPrefix': '(Max Combo x',
        'hudTitle': 'Bonno Shooter:',
        'hudSpirit': 'Spirit:',
        'hudKudoku': 'Kudoku:',
        'hudCombo': 'Combo:',
        'mobileSpirit': 'Spirit',
        'mobileKudoku': 'Kudoku',
        'mobileCombo': 'Combo',
        'mobileScore': 'Score',
        'resultWin': 'Buddha nature has grown to $1!',
        'resultWinHard': 'Attained Moksha',
        'resultLose': 'Swallowed by afflictions',
        'resultTextWinSuffix': ' afflictions completely vanquished',
        'resultTextLoseDemon': 'Swallowed by demon afflictions...',
        'resultTextLosePrefix': 'Your mind was invaded by "',
        'resultTextLoseSuffix': '"',
        'statLevel': 'Buddha nature Lev',
        'statDestroyed': 'Destroyed',
        'statMaxCombo': 'Max Combo',
        'statGainedKudoku': 'Gained Kudoku',
        'newBuddhaMessage': '✨ A new Buddha Message has arrived ✨',
        'buddhaMsgOverlay': '✨ Buddha Message Received ✨',
        'bonnouSokuBodai': 'Affliction to Bodhi',
        'ropparamitsu': 'Paramita Achieved',
        'pressZ': 'Press Z for Special',
        'visitorCount': 'You are the $1th practitioner',
        'shareTitle': 'Nenbutsu Muso\n',
        'shareLevel': '[$1]\n',
        'shareWin': '✨Buddha nature has grown!✨\n',
        'shareLose': 'Swallowed by afflictions...\n',
        'shareScore': 'Destroyed: $1/$2\n',
        'shareCombo': 'Max Combo: $1\n',
        'affiliate': 'Affiliates',
        'affiliateCompany': 'Production Company: Jinja Bukkaku Online',
        'sponsor': 'Sponsors',
        'recruiting': 'Now Recruiting',
    }
};

// ブッダメッセージ データ
const buddhaMessagesData = [
    {
        id: 1,
        levelRequirement: 'easy',
        title: '中道（ちゅうどう）',
        titleEn: 'The Middle Way',
        contentJa: `苦楽の両極端を捨て、いま静かに正しい道に立て<br><br>快楽に流される道と、苦行で自分を痛めつける道、その両方を離れる教えです。「ほどほど」ではなく、どちらにも寄らず、八正道という“まっすぐな実践”に立つことが中道だと説かれます。「正しく見て、正しく考え、正しく生きる。」その積み重ねが、中道です。あなたは今、かたよりすぎていませんか。極端を離れたところに、静かな智慧があります。`,
        contentEn: `Abandoning both extremes of pleasure and pain, stand quietly on the right path now.<br><br>It is the teaching to break away from both the path of seeking pleasure and the path of torturing oneself through asceticism. It is not about being "moderate," but about not leaning towards either side and standing on the "straight practice" called the Noble Eightfold Path. "See rightly, think rightly, live rightly." The accumulation of this is the Middle Way. Are you leaning too far to one side now? In a place away from extremes lies quiet wisdom.`
    },
    {
        id: 2,
        levelRequirement: 'normal',
        title: '十二縁起（じゅうにえんぎ）',
        titleEn: 'Twelve Links of Dependent Origination',
        contentJa: `原因を遡ると、根本的な無知に辿り着く<br><br>十二縁起は、「苦しみは、条件がつながって起きる」と見る教えです。無明から老死まで、12の段階で流れを示します。大事なのは“運命”ではなく、「条件がそろうと起き、条件がほどけると弱まる」という見方です。あなたの苦しみも、原因によって生じています。つながりを見れば、解放の道も見えてきます。ぜひ原因を分解して考えていきましょう。`,
        contentEn: `Tracing the causes back, we arrive at fundamental ignorance.<br><br>The Twelve Links of Dependent Origination is a teaching that views "suffering arises from a chain of conditions." It shows the flow in 12 stages, from ignorance to aging and death. The important thing is not "fate," but the view that "it happens when conditions are met, and it weakens when conditions are unraveled." Your suffering also arises from causes. If you look at the connections, you will see the path to liberation. Let's break down the causes and think about them.`
    },
    {
        id: 3,
        levelRequirement: 'hard',
        title: '四諦（したい）',
        titleEn: 'Four Noble Truths',
        contentJa: `苦しみを、四諦でほどいていこう。<br><br>四諦は、苦・集（原因）・滅・道の四真理。苦しみの事実を順を追って考える方法です。「苦がある」→「原因がある」→「止められる」→「その道がある」という、四つの見取り図のような教えです。生きることには苦があり、その原因は渇愛にあり、それは滅することができ、その道もある。理由があるものには、終わりがあります。`,
        contentEn: `Let's untangle suffering with the Four Noble Truths.<br><br>The Four Noble Truths are the four truths of suffering, origin (cause), cessation, and path. It is a method of thinking about the reality of suffering step by step. It is a teaching like a map of four steps: "There is suffering" → "There is a cause" → "It can be stopped" → "There is a path to it." Living involves suffering, its cause lies in craving, it can be extinguished, and there is a path to do so. What has a reason, has an end.`
    },
    {
        id: 4,
        levelRequirement: 'demon',
        title: '八正道（はっしょうどう）',
        titleEn: 'Noble Eightfold Path',
        contentJa: `見方・言葉・行いを整え、八つの道で進もう。<br><br>苦しみを取り除く習慣です。心は、習慣によって整います。正しく見る、正しく思う、正しく語る、正しく行う、正しく生きる、正しく努める、正しく気づく、正しく集中する。この八つは、ばらばらの教えではありません。互いに支え合いながら、あなたを静かな自由へ導きます。`,
        contentEn: `Organize your views, words, and actions, and proceed on the eight paths.<br><br>It is a habit to remove suffering. The mind is organized by habit. Right view, right resolve, right speech, right action, right livelihood, right effort, right mindfulness, right concentration. These eight are not separate teachings. While supporting each other, they will lead you to quiet freedom.`
    }
];

// プレイヤー
const player = {
    x: canvas.width / 2,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 12
};
