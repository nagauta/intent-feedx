# Intent FeedX

コミュニティ運営のための自動情報収集システム。SERP API経由でX.com（Twitter）の投稿や記事を検索・収集し、PostgreSQLに保存、Webアプリで閲覧します。

## 技術スタック

- **フロントエンド**: Next.js 15 + React 19 + TypeScript + SWR
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL (Vercel Postgres) + Drizzle ORM
- **認証**: Better Auth
- **ランタイム**: Bun
- **モノレポ**: Turborepo
- **検索API**: SERP API (Google Search) + Twitter oEmbed API

## セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. PostgreSQL起動

```bash
docker-compose up -d
```

### 3. 環境変数の設定

```bash
cp apps/web/.env.sample apps/web/.env.local
```

`.env.local` に以下を設定：

```bash
SERP_API_KEY=your_serp_api_key_here
DATABASE_URL=postgres://...
```

### 4. データベースセットアップ

```bash
bun run db:push    # スキーマをDBに反映
bun run db:seed    # シードデータ投入（任意）
```

## 使い方

### Web UI

```bash
bun run dev
```

- **フィード画面**: `http://localhost:3000` - 収集したコンテンツ一覧
- **管理画面**: `http://localhost:3000/admin` - キーワード管理・検索実行

### コマンドラインで検索

```bash
bun run search "Next.js"
```

### API エンドポイント

| エンドポイント | 説明 |
|---------------|------|
| `GET /api/contents` | コンテンツ一覧取得 |
| `GET /api/keywords` | キーワード一覧取得 |
| `GET /api/search?keyword=...` | 検索実行 |
| `GET /api/health` | ヘルスチェック |

## プロジェクト構造

```
intent-feedx/
├── apps/
│   └── web/                    # Next.js フルスタックアプリ
│       ├── src/
│       │   ├── app/            # App Router
│       │   │   ├── api/        # API Routes
│       │   │   │   ├── auth/   # 認証API
│       │   │   │   ├── contents/
│       │   │   │   ├── keywords/
│       │   │   │   └── search/
│       │   │   ├── admin/      # 管理画面
│       │   │   └── page.tsx    # フィード画面
│       │   ├── components/     # Reactコンポーネント
│       │   ├── db/             # Drizzle ORM スキーマ・クライアント
│       │   └── lib/            # ビジネスロジック
│       │       ├── search.ts   # 検索ロジック
│       │       └── sources/    # ソースアダプター
│       │           ├── twitter.ts
│       │           └── article.ts
│       └── public/             # 静的ファイル
├── packages/
│   └── shared/                 # 共有TypeScript型定義
│       └── src/index.ts        # Content, Keyword, ContentSourceType など
└── package.json
```

## データフロー

1. **キーワード設定** - DB `keywords` テーブルに検索キーワードを登録
2. **SERP API検索** - `site:x.com "キーワード" after:日付` 形式で検索
3. **ソースアダプターで処理**
   - Twitter: oEmbed APIで埋め込みHTML取得
   - Article: OGPメタデータ取得
4. **PostgreSQL保存** - `contents` テーブルに保存
5. **Web UIで閲覧** - フィード画面・管理画面で確認

## 開発コマンド

```bash
# 開発サーバー起動
bun run dev

# ビルド
bun run build

# Lint
bun run lint

# データベース操作
bun run db:push      # スキーマをDBに反映
bun run db:studio    # Drizzle Studio起動（DBブラウザ）
bun run db:seed      # シードデータ投入
bun run db:generate  # マイグレーションファイル生成
bun run db:migrate   # マイグレーション実行

# 検索スクリプト
bun run search "キーワード"
```

## コミット規約

Conventional Commits形式：`<type>(<scope>): <subject>`

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- **Scopes**: `backend`, `frontend`, `api`, `config`, `deps`

## ライセンス

Private
