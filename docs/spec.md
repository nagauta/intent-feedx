# プロジェクト仕様書

## プロジェクト概要

コミュニティ運営のための自動情報収集システム。
手動検索のコストを削減し、おすすめアルゴリズムに頼らず能動的にユーザーの声を収集。
収集したデータを意思決定やプロモーション活動に活用する。

## 課題と目的

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

## 機能

### 検索・収集
- 複数キーワードの管理（DB `keywords` テーブル）
- キーワードごとに日時指定での自動検索
- SERP API経由でGoogle検索結果を取得（`site:x.com "キーワード" after:YYYY-MM-DD` 形式）
- ソースアダプターによるマルチソース対応（Twitter / Article）
- Twitter oEmbed APIで埋め込みHTML取得
- Article: OGPメタデータ（サイト名、favicon、ogType）取得
- 重複URL の自動スキップ

### UI
- Webアプリで収集データを閲覧
- Twitterフィード風の表示
- 管理画面（`/admin`）での閲覧・管理
- PWA対応

### 認証
- Better Auth によるユーザー認証

## スコープ外

明確にスコープ外として実装しない機能：

- **意思決定支援UI** — 統計・集計ダッシュボード、データ可視化、レポート生成
- **自動投稿** — X（Twitter）や他SNSへの自動投稿
- **通知** — Slack / メール / Webhook
- **定期自動実行** — cron / スケジューラー / バックグラウンド実行
- **X.com以外のSNS検索** — Facebook、Instagram、LinkedIn等

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Next.js 15 (App Router) + React 19 |
| データフェッチ | SWR |
| ORM | Drizzle ORM |
| データベース | PostgreSQL (Vercel Postgres) |
| 認証 | Better Auth |
| 外部API | SERP API, Twitter oEmbed API |
| モノレポ | Turborepo |
| ランタイム | Bun |

## データ構造

### keywords テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | serial | PK |
| slug | text | ユニークスラッグ |
| query | text | 検索クエリ |
| enabled | boolean | 有効/無効 |
| sources | text[] | ソース種別 (`twitter`, `article`) |
| created_at | timestamp | 作成日時 |

### contents テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | serial | PK |
| url | text | コンテンツURL（ユニーク） |
| source_type | text | `twitter` \| `article` |
| title | text | タイトル |
| snippet | text | 概要テキスト |
| author_name | text | 著者名 |
| published_at | timestamp | 公開日時 |
| thumbnail_url | text | サムネイルURL |
| source_metadata | jsonb | ソース固有データ |
| keyword | text | 検索キーワード |
| search_date | text | 検索日 |
| created_at | timestamp | 作成日時 |
| deleted_at | timestamp | 論理削除日時 |

### ソース固有メタデータ（source_metadata）

**Twitter:**
```json
{ "embedHtml": "<blockquote>...</blockquote>", "embedSuccess": true }
```

**Article:**
```json
{ "siteName": "Example", "favicon": "https://...", "ogType": "article" }
```

---

**最終更新**: 2026-02-14
**バージョン**: 2.0.0
