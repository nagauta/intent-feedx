# CLAUDE.md

## Project Overview

コミュニティ運営のための自動情報収集システム。SERP API経由でX.com（Twitter）の投稿や記事を検索・収集し、PostgreSQLに保存、Webアプリで閲覧する。

## Commands

```bash
# 開発サーバー起動 (web: 3000, workflow: 3001)
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

Turborepoモノレポ（`apps/*`, `packages/*`）。各アプリの詳細は配下の CLAUDE.md を参照。

- `apps/web` — Next.js 15 フルスタックアプリ（検索・閲覧・管理）
- `apps/workflow` — Vercel Workflow による定期スクリーンショット撮影
- `packages/shared` — 共有TypeScript型定義

詳細な仕様は @docs/spec.md を参照。

## Local Development

```bash
docker-compose up -d              # PostgreSQL起動
cp apps/web/.env.sample apps/web/.env.local
cp apps/workflow/.env.sample apps/workflow/.env.local
# .env.localにSERP_API_KEY, BROWSERLESS_API_TOKEN等を設定
bun install && bun run dev
```

## Commit Convention

Conventional Commits形式：`<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Scopes: `backend`, `frontend`, `api`, `config`, `deps`
