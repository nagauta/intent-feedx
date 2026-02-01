# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

コミュニティ運営のための自動情報収集システム。SERP API経由でX.com（Twitter）の投稿や記事を検索・収集し、PostgreSQLに保存、Webアプリで閲覧する。

## Commands

```bash
# 開発サーバー起動 (port 3000)
bun run dev

# ビルド
bun run build

# 型チェック・リント
bun run lint

# データベース操作
bun run db:push      # スキーマをDBに反映
bun run db:studio    # Drizzle Studio起動（DBブラウザ）
bun run db:seed      # シードデータ投入
bun run db:generate  # マイグレーションファイル生成
bun run db:migrate   # マイグレーション実行

# 検索スクリプト
bun run search "keyword"
```

## Architecture

Turborepoモノレポ構成：

```
apps/web/          # Next.js 15 フルスタックアプリ (App Router)
  src/app/api/     # APIエンドポイント (search, contents, keywords, auth)
  src/lib/         # ビジネスロジック (search.ts, sources/)
  src/db/          # Drizzle ORM スキーマ・クライアント
  src/components/  # Reactコンポーネント

packages/shared/   # 共有TypeScript型定義
  src/index.ts     # Content, Keyword, ContentSourceType など
```

**主要技術:**
- Next.js 15 + React 19 + SWR
- Drizzle ORM + PostgreSQL (Vercel Postgres)
- Better Auth（認証）
- SERP API + Twitter oEmbed API

## Data Flow

1. キーワード設定（DB `keywords`テーブル）
2. SERP APIで `site:x.com "キーワード" after:日付` 形式で検索
3. ソースアダプター（`src/lib/sources/`）で結果を処理
   - Twitter: oEmbed APIで埋め込みHTML取得
   - Article: OGPメタデータ取得
4. PostgreSQL `contents`テーブルに保存
5. `/admin`画面で閲覧・管理

## Key Files

- `apps/web/src/lib/search.ts` - 検索ロジック本体
- `apps/web/src/lib/sources/` - ソースアダプター（twitter.ts, article.ts）
- `apps/web/src/db/schema.ts` - DBスキーマ定義
- `packages/shared/src/index.ts` - 共有型定義

## Local Development

```bash
docker-compose up -d              # PostgreSQL起動
cp apps/web/.env.sample apps/web/.env.local
# .env.localにSERP_API_KEY等を設定
bun install && bun run dev
```

## Commit Convention

Conventional Commits形式：`<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Scopes: `backend`, `frontend`, `api`, `config`, `deps`
