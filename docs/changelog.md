# Changelog

完了したタスクのログ。

---

## 2026-02

- **Workflow 統合（スクリーンショット定期撮影）**
  - `apps/web` に Vercel Workflow DevKit を統合（partial adoption）
  - browserless.io v2 API で X.com アカウントページのスクリーンショット撮影
  - Vercel Blob（本番）/ ローカルファイル（開発）に保存
  - Vercel Cron で毎時0分に自動実行
- **Next.js 16 + ESLint 9 移行**
  - Next.js 15 → 16、ESLint 8 → 9（flat config）に移行

## 2025-01

- **スプリント1: 最小限の検索実装**
  - SERP API統合、`site:x.com` 形式の検索、JSON保存

- **スプリント2: Twitter oEmbed統合**
  - 埋め込みHTML取得、著者名抽出、エラーハンドリング

- **スプリント3: 複数キーワード対応**
  - `keywords.json` 設定ファイル、enabled/disabled制御

- **スプリント4: 重複チェック機能**
  - 既存URL確認、重複スキップ、新規のみ追加

- **スプリント5: 基本的なWeb表示**
  - Next.js UI、TweetFeedコンポーネント、埋め込み表示

- **認証機能**
  - Better Auth導入、管理画面の認証保護
