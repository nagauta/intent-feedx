# apps/workflow

Vercel Workflow DevKit による定期スクリーンショット撮影サービス。

## 技術スタック
- Vercel Workflow DevKit (`'use workflow'` / `'use step'`)
- browserless.io v2（スクリーンショット撮影）
- Vercel Blob（本番ストレージ）/ ローカルファイル（開発時）
- Vercel Cron（毎時0分トリガー）

## ストレージ切り替え
- `process.env.VERCEL` が存在 → Vercel Blob
- それ以外 → `screenshots/` にローカル保存

## dev server
```bash
bun run --cwd apps/workflow dev  # port 3001
```
