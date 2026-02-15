# apps/web

Next.js 16 (App Router) + React 19 のフルスタックアプリ。

## 技術スタック
- Drizzle ORM + PostgreSQL (Vercel Postgres)
- Better Auth（認証）
- SWR（データフェッチ）
- SERP API + Twitter oEmbed API
- Vercel Workflow DevKit（スクリーンショット定期撮影）
- browserless.io v2 + Vercel Blob

## Data Flow
1. キーワード設定（DB `keywords` テーブル）
2. SERP API で `site:x.com "キーワード" after:日付` 形式で検索
3. ソースアダプター（`src/lib/sources/`）で結果を処理
4. PostgreSQL `contents` テーブルに保存
5. `/admin` 画面で閲覧・管理

## dev server
```bash
bun run --cwd apps/web dev  # port 3000
```
