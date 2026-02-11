# GEMINI.md - プロジェクトガイド

このドキュメントは、このプロジェクト「煩悩退散〜修行僧の葛藤〜」の開発を支援するAI（Gemini）のためのガイドラインです。

## プロジェクト概要

「煩悩退散」は、修行僧が迫り来る「煩悩」を「読経」で撃ち落とす、ブラウザベースのシューティングゲームです。PCとモバイルの両方に対応しており、難易度設定やランキング機能を備えています。

## 技術スタック

*   **HTML5**: セマンティックなマークアップ (`index.html`)。
*   **CSS3**: フレームワークを使用しないカスタムスタイル (`assets/css/main.css`)。
*   **JavaScript (ES6+)**: 外部ライブラリやゲームエンジンを使用しないVanilla JS (`assets/js/main.js`)。
*   **アセット**: 画像 (`images/`) と音声 (`sounds/`) ファイルを使用。

## ディレクトリ構成

*   `/`: ルートディレクトリ (`index.html`, `GEMINI.md`)。
*   `assets/`:
    *   `css/`: スタイルシート。
    *   `js/`: ゲームロジック (11ファイル構成)。
        *   **Core**: `config.js` (設定), `state.js` (状態管理), `events.js` (イベントバス)
        *   **Managers**: `audio.js` (音声), `device.js` (デバイス), `input.js` (入力)
        *   **MVC**: `game.js` (Controller), `ui.js` (View: DOM), `renderer.js` (View: Canvas), `entities.js` (Model)
        *   **Entry**: `main.js` (初期化)
*   `images/`: キャラクター、UI、背景などの画像リソース。
    *   `monk/`: 僧侶の画像 (`monk_back.png`, `monk_happy.png` 等)。
    *   `tutorial/`: チュートリアル用画像。
*   `sounds/`: BGM (`bgm.wav`) と効果音 (`shoot.mp3`, `hit.mp3` 等)。
*   `docs/`: ドキュメント関連。

## 主要なゲームシステム

### 1. アーキテクチャ (MVC + State Machine)
*   **GameState (`GS`)**: `state.js` 内の `GS` オブジェクトで全状態（画面、スコア、エンティティ、入力）を一元管理。
*   **メインループ**: `game.js` がコントローラーとしてロジックを回し、`renderer.js` が描画を担当。

### 2. 入力処理
*   **PC**: キーボード操作 (矢印キーで移動, Spaceで発射, Zで必殺技)。
*   **モバイル**: 画面上の仮想ボタンとスワイプ操作に対応。
*   **管理**: `input.js` が入力を正規化し、`GS.input` に状態を反映。

### 3. ゲームプレイ機能
*   **精神力 (HP)**: `GS.play.spirit` で管理。被弾すると減少。
*   **功徳 (MP)**: `GS.play.kudoku` で管理。MAX値は `config.js` で定義。
*   **エンティティ**: `entities.js` 内の `Bullet`, `Enemy`, `Particle` クラスで管理。
*   **レベルシステム**: `easy` 〜 `demon`。`levelSettings` (config.js) でパラメータ定義。

### 4. 音声・アセット
*   **Audio**: `audio.js` で一元管理 (`sounds` オブジェクト)。モバイルの自動再生制限対策済み。
*   **Renderer**: `renderer.js` が Canvas 描画を一手に引き受ける。

### 5. データ永続化
*   **ランキング**: `localStorage` (`nenbunRankings`)。
*   **設定**: `localStorage` (`nenbunSettings`)。
*   **レベル解放**: `localStorage` (`nenbunClearedLevels`)。

## 開発ガイドライン

1.  **状態管理**: グローバル変数は作らず、必ず `GS` オブジェクト (`state.js`) に追加してください。
2.  **描画**: Canvas への描画処理は `game.js` ではなく `renderer.js` に記述してください。
3.  **イベント**: 疎結合いが必要な場合は `events.js` の `EventBus` を使用してください。
4.  **定数**: マジックナンバーは避け、`config.js` の定数を使用してください。

## 今後の拡張について
*   新機能追加時は `GS` オブジェクトの構造を維持し、適切なモジュールにロジックを配置してください。
*   `gameState` (`GS.screen`) の遷移フローを守ってください。
