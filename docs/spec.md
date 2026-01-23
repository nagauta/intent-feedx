# プロジェクト仕様書

## 📌 プロジェクト概要

コミュニティ運営のための自動情報収集システム。
手動検索のコストを削減し、おすすめアルゴリズムに頼らず能動的にユーザーの声を収集。
収集したデータを意思決定やプロモーション活動に活用する。

## 🎯 課題と目的

### 課題
- コミュニティ運営において、ユーザーの声を拾うために手動でX検索やGoogle検索を定期的に実施している
- 能動的な情報収集にコストがかかる
- Xのおすすめフィードだけでは、今までリーチしていない声や聞いたことのない声に触れるタッチポイントが限定的

### 目的
- キーワード検索による自動情報収集
- データに基づいた意思決定の支援
  - 情報を持っている人へのリーチ
  - 熱狂的なファンとの関わり
  - 問題点への対応やコミュニティアクション
- プロモーション活動へのデータ活用

## ✅ やること（スコープ内）

### 1. 検索・収集機能
- [ ] 複数キーワードの設定ファイル管理（`keywords.json`など）
- [x] キーワードごとに日時指定での自動検索
- [x] SERP API経由でGoogle検索結果を取得
  - X.com検索も含む（`site:x.com "キーワード" after:YYYY-MM-DD`形式）
- [x] 検索結果をJSON形式で保存
- [ ] Twitter oEmbed APIで埋め込みHTML取得
- [ ] 重複URL（同じツイート）の自動スキップ

### 2. UI機能
- [ ] Webアプリで収集データを閲覧
- [ ] Twitterフィード風の表示
- [ ] 収集データの検索機能
  - キーワードでフィルタ
  - 日付でフィルタ

### 3. データ管理
- [ ] JSON形式でデータ保存（全履歴保持）
- [ ] 日付別ファイル管理（`twitter-results-YYYY-MM-DD.json`）

### 4. 実行方式
- [ ] 手動実行（`npm start`など）

## ❌ やらないこと（スコープ外）

明確にスコープ外として実装しない機能：

1. **意思決定支援UI**
   - データ分析機能
   - 統計・集計ダッシュボード
   - データ可視化（グラフ・チャート）
   - レポート生成

2. **自動投稿機能**
   - X（Twitter）への自動投稿
   - 他SNSへの自動投稿

3. **通知機能**
   - Slack通知
   - メール通知
   - Webhook連携

4. **高度なデータ管理**
   - データベース（PostgreSQL、MySQLなど）
   - データの定期削除・アーカイブ
   - データのエクスポート機能

5. **自動実行機能**
   - cron設定
   - スケジューラー
   - バックグラウンド実行

6. **X.com以外の検索**
   - 他SNS（Facebook、Instagram、LinkedIn等）の検索
   - ブログやニュースサイトの専用検索

## 🛠 技術スタック

### バックエンド
- Hono.js
- SERP API（Google検索）
- Twitter oEmbed API（埋め込みHTML取得）

### フロントエンド
- Next.js

### データ保存
- JSONファイル形式

### 実行環境
- ローカル実行（手動）

## 📁 データ構造

### キーワード設定ファイル（例: `keywords.json`）
```json
{
  "keywords": [
    {
      "id": "raycast",
      "query": "Raycast",
      "enabled": true
    },
    {
      "id": "community-tools",
      "query": "コミュニティツール",
      "enabled": true
    }
  ]
}
```

### 検索結果ファイル（例: `twitter-results-YYYY-MM-DD.json`）
```json
{
  "searchQuery": "site:x.com \"Raycast\" after:2026-01-21",
  "searchDate": "2026-01-21",
  "keyword": "Raycast",
  "totalResults": 5,
  "retrievedCount": 3,
  "generatedAt": "2026-01-21T17:22:01.571Z",
  "tweets": [
    {
      "url": "https://x.com/user/status/123",
      "title": "ツイートタイトル",
      "snippet": "概要テキスト",
      "embedSuccess": true,
      "embedHtml": "<blockquote>...</blockquote>",
      "authorName": "ユーザー名"
    }
  ]
}
```

## 🔄 データフロー

1. ユーザーが手動で実行（`npm start`）
2. `keywords.json`から有効なキーワードを読み込み
3. 各キーワードについて：
   - SERP APIでGoogle検索実行（`site:x.com "キーワード" after:日付`）
   - 検索結果を取得
   - 各ツイートURLについて：
     - 既存JSONに同じURLが存在するかチェック
     - 存在しない場合のみTwitter oEmbed APIで埋め込みHTML取得
   - 結果を`twitter-results-YYYY-MM-DD.json`に保存
4. Webアプリでデータを閲覧

## 📝 重複チェックロジック

- 同じURL（ツイートURL）が既に保存されている場合はスキップ
- チェック対象：全てのJSONファイル内のツイートURL
- 重複の場合：oEmbed API呼び出しをスキップし、処理をスキップ

## 🚀 今後の拡張可能性（参考）

スコープ外だが、将来的に検討可能な機能：
- 自動実行（cron）
- 通知機能
- データ分析ダッシュボード
- X以外のSNS対応
- データベース化

---

**最終更新**: 2026-01-22
**バージョン**: 1.0.0
