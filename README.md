# 煩悩シューティング

![](images/logo.png)


修行僧が迫り来る「煩悩」を「読経」で撃ち落とす、ブラウザベースのシューティングゲームです。
PCとスマートフォンの両方に対応しており、単純ながらも奥深いゲームプレイを楽しめます。

## 🎮 ゲーム概要

プレイヤーは修行僧となり、空から降ってくる「煩悩（文字）」を「読経（ショット）」で浄化します。
精神力（HP）が尽きる前に、より多くの徳を積み、高スコアを目指しましょう。

<img width="462" height="612" alt="image" src="https://github.com/user-attachments/assets/057bb714-77b9-488d-861d-e4895fd99544" />


## ✨ 特徴

*   **クロスプラットフォーム**: PC（キーボード）とモバイル（タッチ操作）の両方に完全対応。
*   **レベルシステム**: 「仏性Lev1（Easy）」から「悪魔（Demon）」まで、幅広い難易度を用意。
*   **必殺技**: 徳（MP）を貯めて放つ「煩悩即菩薩」で一発逆転。
*   **修行の軌跡機能**: ローカル保存によるハイスコアランキングに対応。
*   **隠し要素**: 特定の条件で解放される高難易度モード。

<img width="462" height="612" alt="image" src="https://github.com/user-attachments/assets/04f76f74-4e3b-494f-8c85-b477eaab8f61" />


## 🕹️ 操作方法

### PC（キーボード操作）
*   **移動**: `←` `→` キー
*   **読経（ショット）**: `Space` キー
*   **必殺技（煩悩即菩薩）**: `Z` キー（MP満タン時）

<img width="462" height="612" alt="image" src="https://github.com/user-attachments/assets/e6dc34da-eb0f-4f50-a3d0-697dc263383d" />
<img width="462" alt="image" src="https://github.com/user-attachments/assets/c1799bf3-77d1-4ed4-bf0c-bef4e63d2d7a" />


### スマートフォン（タッチ操作）
*   画面上に表示される仮想ボタンを使用します。
*   **左右ボタン**: 移動
*   **ショットボタン**: 読経
*   **必殺技ボタン**: 必殺技発動

<img width="462" height="612" alt="image" src="https://github.com/user-attachments/assets/b27616af-424b-4d67-a4d6-d77d3973cafd" />
<img width="462" height="612" alt="image" src="https://github.com/user-attachments/assets/4cc65b3a-acea-4e33-aa8e-52a977afa99a" />


## 🚀 始め方

特別なインストールは不要です。ブラウザがあればすぐに遊べます。

1.  このリポジトリをダウンロードまたはクローンします。
2.  フォルダ内の `index.html` をブラウザ（Chrome, Safari, Edgeなど）で開いてください。

## 🛠️ 技術スタック

*   **HTML5**: フレームワーク不使用
*   **CSS3**: フレームワーク不使用
*   **JavaScript (ES6+)**: Vanilla JS（ライブラリ不使用）

## 🏗️ アーキテクチャ

MVC (Model-View-Controller) パターンに基づき、状態管理 (`state.js`) と描画ロジック (`renderer.js`) を分離して設計しています。

```mermaid
graph TD
    %% Core State & Config
    CONFIG["config.js<br/>定数・設定"] --> STATE
    STATE["state.js<br/>GameState<br/>(全状態管理)"] --> GAME
    STATE --> RENDERER
    STATE --> UI
    STATE --> INPUT

    %% Managers
    AUDIO["audio.js<br/>音声管理"] --> GAME
    AUDIO --> UI
    DEVICE["device.js<br/>デバイス判定"] --> UI
    EVENTS["events.js<br/>EventBus"] --> GAME
    EVENTS --> UI

    %% MVC Components
    ENTITIES["entities.js<br/>Entity Classes"] --> GAME
    RENDERER["renderer.js<br/>Renderer<br/>(View: Canvas)"] --> GAME
    UI["ui.js<br/>UI Manager<br/>(View: DOM)"] --> MAIN
    INPUT["input.js<br/>Input Manager"] --> MAIN

    %% Entry Point
    GAME["game.js<br/>Game Loop<br/>(Controller)"] --> MAIN
    MAIN["main.js<br/>Entry Point"]
```

## 📂 ディレクトリ構成

*   `index.html`: ゲームのメインファイル
*   `assets/`: JS、CSSファイル
*   `images/`: ゲーム内で使用する画像素材
*   `sounds/`: BGMおよび効果音

---
Enjoy your ascetic practice!
