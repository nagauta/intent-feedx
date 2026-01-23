# Intent FeedX

X.com（旧Twitter）から特定キーワードに関連するツイートを検索・収集するツールです。

## 📋 技術スタック

- **フロントエンド**: Next.js 15 + React 19 + TypeScript
- **バックエンド**: Next.js API Routes
- **ランタイム**: Bun
- **モノレポ**: Turborepo
- **検索API**: SERP API (Google Search)

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
bun install
```

### 2. 環境変数の設定

`.env.local` ファイルを `apps/web/` に作成し、SERP API キーを設定してください：

```bash
SERP_API_KEY=your_serp_api_key_here
```

## 📖 使い方

### スクリプトで検索を実行

コマンドラインから直接検索を実行できます：

```bash
# 基本的な使い方
bun run search "Next.js"

# 別のキーワードで検索
bun run search "React 19"
```

実行すると：
- コンソールに検索結果が表示されます
- `data/twitter-results-YYYY-MM-DD.json` にJSON形式で保存されます

### Web UIで検索を実行

開発サーバーを起動：

```bash
bun run dev
```

ブラウザで以下のURLにアクセス：
- Web UI: `http://localhost:3000`
- API エンドポイント:
  - `http://localhost:3000/api` - API情報
  - `http://localhost:3000/api/health` - ヘルスチェック
  - `http://localhost:3000/api/search?keyword=Next.js` - 検索API

## 📁 プロジェクト構造

```
intent-feedx/
├── apps/
│   └── web/               # Next.js アプリケーション
│       ├── src/
│       │   ├── app/       # App Router
│       │   │   ├── api/   # API Routes
│       │   │   │   ├── route.ts       # GET /api
│       │   │   │   ├── health/        # GET /api/health
│       │   │   │   └── search/        # GET /api/search
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   └── lib/       # 共通ロジック
│       │       ├── search.ts         # SERP API統合
│       │       └── file-storage.ts   # ファイル保存
│       └── package.json
├── scripts/
│   └── search.ts          # スタンドアロン検索スクリプト
├── data/                  # 検索結果の保存先
└── package.json
```

## 🔍 検索の仕組み

1. **SERP API経由でGoogle検索を実行**
   - クエリ形式: `site:x.com "キーワード" after:昨日の日付`
   - 昨日以降のツイートを検索

2. **検索結果を解析**
   - X.comのURLのみを抽出
   - タイトル、URL、スニペットを取得

3. **結果を保存**
   - JSON形式で `data/twitter-results-YYYY-MM-DD.json` に保存
   - 同日の検索は同じファイルに追記

## 📊 スプリント進捗

- ✅ **スプリント1**: 最小限の検索実装（完了）
  - SERP API統合
  - 1キーワードでの検索
  - JSON保存機能
  - スクリプト実行機能

- ⏳ **スプリント2**: Twitter oEmbed統合（未実装）
- ⏳ **スプリント3**: 複数キーワード対応（未実装）
- ⏳ **スプリント4**: 重複チェック機能（未実装）
- ⏳ **スプリント5**: 基本的なWeb表示（未実装）
- ⏳ **スプリント6**: フィルタリング機能（未実装）

詳細は [docs/todo.md](./docs/todo.md) を参照してください。

## 🛠️ 開発コマンド

```bash
# 開発サーバー起動
bun run dev

# ビルド
bun run build

# 本番サーバー起動
bun run start

# Lint
bun run lint

# 検索スクリプト実行
bun run search "キーワード"
```

## 📝 ライセンス

Private
