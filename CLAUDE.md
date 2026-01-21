# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

コミュニティ運営のための自動情報収集システム。SERP API経由でX.com（Twitter）の投稿を検索・収集し、Webアプリで閲覧する。

## Commands

```bash
# 全パッケージの開発サーバー起動
bun run dev

# ビルド
bun run build

# 個別起動
bun run --cwd apps/api dev    # API: http://localhost:3001
bun run --cwd apps/web dev    # Web: http://localhost:3000

# 型チェック
bun run lint
```

## Architecture

Turborepoモノレポ構成：

- **apps/api** - Hono.js バックエンド (Bun runtime, port 3001)
  - SERP API統合（Google検索経由でX.com検索）
  - Twitter oEmbed API統合
- **apps/web** - Next.js 15 フロントエンド (App Router, port 3000)
  - 収集データの閲覧UI
- **packages/shared** - 共有TypeScript型定義
  - `Keyword`, `Tweet`, `SearchResult` などのインターフェース

## Data Flow

1. `keywords.json` から検索キーワードを読み込み
2. SERP APIで `site:x.com "キーワード" after:日付` 形式で検索
3. Twitter oEmbed APIで埋め込みHTML取得
4. `twitter-results-YYYY-MM-DD.json` に保存
5. Webアプリで閲覧

## Commit Convention

Conventional Commits形式を使用：

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Scopes: `backend`, `frontend`, `api`, `config`, `deps`
