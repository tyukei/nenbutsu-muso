# 自動テストドキュメント

このプロジェクトでは、コード品質とユーザー体験を保証するために、3種類の自動テストを実装しています。

## 📋 目次

- [テストの種類](#テストの種類)
- [ローカルでのテスト実行](#ローカルでのテスト実行)
- [CI/CDでの自動実行](#cicdでの自動実行)
- [テスト結果の確認方法](#テスト結果の確認方法)
- [トラブルシューティング](#トラブルシューティング)

---

## テストの種類

### 1. HTMLバリデーション ✅

**目的**: HTMLの構文エラーを検出し、Web標準に準拠していることを確認

**チェック内容**:
- HTML5構文の正しさ
- 必須メタタグの存在確認
  - `<meta charset="UTF-8">`
  - `<meta name="viewport">`
  - `<meta name="version">`

**使用ツール**: [Nu Html Checker (vnu)](https://validator.github.io/validator/)

**実行時間**: 約10秒

---

### 2. パフォーマンステスト 📊

**目的**: ページの読み込み速度とパフォーマンスを測定

**測定項目**:
- **Performance Score**: 総合パフォーマンススコア（目標: 90以上）
- **FCP (First Contentful Paint)**: 最初のコンテンツが表示されるまでの時間
- **LCP (Largest Contentful Paint)**: 最大のコンテンツが表示されるまでの時間
- **TBT (Total Blocking Time)**: メインスレッドのブロック時間
- **CLS (Cumulative Layout Shift)**: レイアウトのずれ

**使用ツール**: [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

**実行時間**: 約30秒（3回測定の平均）

**閾値**:
- Performance: 90%以上
- Accessibility: 90%以上
- Best Practices: 90%以上
- SEO: 90%以上

> **Note**: スコアが閾値を下回っても、テストは失敗しません（警告のみ）

---

### 3. アクセシビリティテスト ♿

**目的**: 障害を持つユーザーでもゲームを楽しめるかチェック

**チェック項目**:
- 色のコントラスト比（WCAG 2.1 AA基準）
- ボタンやリンクのラベル
- フォーム要素のラベル
- ARIA属性の正しさ
- キーボード操作性
- 画像のalt属性

**使用ツール**: 
- [axe-core](https://github.com/dequelabs/axe-core)
- [Playwright](https://playwright.dev/)

**実行時間**: 約15秒

**基準**: WCAG 2.1 Level AA

---

## ローカルでのテスト実行

### 前提条件

- Node.js 20以上
- Java 17以上（HTMLバリデーション用）

### 1. HTMLバリデーション

```bash
# vnu.jarをダウンロード
wget https://github.com/validator/validator/releases/download/latest/vnu.jar_latest.zip
unzip vnu.jar_latest.zip

# バリデーション実行
java -jar dist/vnu.jar --errors-only index.html
```

### 2. パフォーマンステスト

```bash
# 依存関係をインストール
npm install -g @lhci/cli http-server

# ローカルサーバー起動
http-server -p 8080 &

# Lighthouse CI実行
lhci autorun
```

### 3. アクセシビリティテスト

```bash
# 依存関係をインストール
npm install -D @playwright/test @axe-core/playwright axe-core http-server

# Playwrightブラウザをインストール
npx playwright install --with-deps chromium

# ローカルサーバー起動
npx http-server -p 8080 &

# テスト実行
node tests/accessibility.test.js
```

---

## CI/CDでの自動実行

### トリガー

以下のタイミングで自動的にテストが実行されます:

- Pull Request作成時
- `main`ブランチへのpush時

### ワークフロー

GitHub Actionsで3つのジョブが**並列実行**されます:

```
┌─────────────────────┐
│  HTML Validation    │  (~10秒)
└─────────────────────┘

┌─────────────────────┐
│  Performance Test   │  (~30秒)
└─────────────────────┘

┌─────────────────────┐
│  Accessibility Test │  (~15秒)
└─────────────────────┘
```

**合計実行時間**: 約30秒（並列実行のため）

### ワークフローファイル

`.github/workflows/test.yml`

---

## テスト結果の確認方法

### GitHub Actions UI

1. GitHubリポジトリの **Actions** タブを開く
2. 該当のワークフロー実行をクリック
3. 各ジョブの結果を確認

### アーティファクト

テスト結果は以下のアーティファクトとしてダウンロード可能:

- **lighthouse-results**: Lighthouseの詳細レポート（HTML/JSON）
- **accessibility-results**: アクセシビリティ違反の詳細（JSON）

### ステータスバッジ

README.mdに以下のバッジを追加できます:

```markdown
![Tests](https://github.com/YOUR_USERNAME/nenbutsu-muso/actions/workflows/test.yml/badge.svg)
```

---

## トラブルシューティング

### HTMLバリデーションが失敗する

**原因**: HTML構文エラー、または必須メタタグの欠落

**解決方法**:
1. エラーメッセージを確認
2. 該当箇所のHTMLを修正
3. ローカルで`vnu.jar`を実行して確認

### パフォーマンステストのスコアが低い

**原因**: 画像サイズが大きい、JavaScriptが重い、など

**解決方法**:
1. Lighthouseレポートの「Opportunities」セクションを確認
2. 推奨される最適化を実施
3. 画像の圧縮、コードの最小化などを検討

> **Note**: パフォーマンステストは警告のみで、失敗しません

### アクセシビリティテストが失敗する

**原因**: コントラスト比不足、ラベル欠落、など

**解決方法**:
1. `accessibility-report.json`をダウンロード
2. 違反内容と該当要素を確認
3. 推奨される修正方法（`helpUrl`）を参照
4. 修正後、再度テスト実行

**よくある違反例**:

| 違反ID | 説明 | 修正方法 |
|--------|------|----------|
| `color-contrast` | 色のコントラスト比不足 | 文字色と背景色のコントラストを4.5:1以上に |
| `button-name` | ボタンにラベルがない | `aria-label`または内部テキストを追加 |
| `image-alt` | 画像にalt属性がない | `alt`属性を追加 |

---

## 設定ファイル

### lighthouserc.json

Lighthouse CIの設定ファイル:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:8080/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}]
      }
    }
  }
}
```

**カスタマイズ方法**:
- `numberOfRuns`: 測定回数（デフォルト: 3）
- `minScore`: 最低スコア（0.0〜1.0）
- `warn` → `error`: 警告を失敗に変更

---

## 参考リンク

- [Nu Html Checker](https://validator.github.io/validator/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/getting-started.md)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Vitals](https://web.dev/vitals/)

---

## 今後の改善案

- [ ] E2Eテストの追加（ゲームプレイの自動テスト）
- [ ] ビジュアルリグレッションテスト
- [ ] クロスブラウザテスト（Firefox, Safari）
- [ ] モバイルデバイスでのテスト
- [ ] セキュリティスキャン
