# スクリーンショット Workflow リリース手順

## 前提条件
- [ ] browserless.io アカウントがある
- [ ] Vercel Blob ストレージが有効化済み
- [ ] `apps/web` の Vercel プロジェクトが存在する（既存）

---

## 背景

当初 `apps/workflow` を別 Vercel プロジェクトとして実装していたが、Vercel Workflow DevKit の partial adoption が可能であることを検証し、既存の `apps/web` に統合した（PR #7）。これにより別プロジェクトの管理が不要になった。

---

## 1. 環境変数の追加

既存の `apps/web` Vercel プロジェクトに以下を追加:

Vercel ダッシュボード → Settings → Environment Variables:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `BROWSERLESS_API_TOKEN` | browserless.io のダッシュボードから取得 | Production |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 連携で自動設定、または手動取得 | Production |

```bash
# CRON_SECRET は既存の daily-search 用に設定済みのはず
# 未設定の場合:
openssl rand -base64 32
```

---

## 2. デプロイ

PR #7 をマージで自動デプロイ。

---

## 3. デプロイ後の確認

### チェックリスト

- [ ] **Cron Job が登録されている**
  - Vercel ダッシュボード → Settings → Cron Jobs に以下2つが表示される:
    - `/api/cron/daily-search` (`0 1 * * *`) — 既存
    - `/api/cron/screenshot` (`0 * * * *`) — 新規

- [ ] **手動テスト実行**
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/screenshot
  ```
  → `{ "message": "Screenshot workflow started" }` が返ればOK

- [ ] **認証チェック**
  ```bash
  curl https://your-domain.vercel.app/api/cron/screenshot
  ```
  → `{ "error": "Unauthorized" }` (401) が返ればOK

- [ ] **Blob ストレージ確認**
  - Vercel ダッシュボード → Storage → Blob に `screenshots/raycast_jp/` 配下にファイルが保存されているか確認

- [ ] **Workflow 実行確認**
  - Vercel ダッシュボード → AI → Workflows で実行履歴を確認

- [ ] **既存機能への影響なし**
  - `/api/cron/daily-search`, `/api/contents`, `/api/keywords` 等が正常に動作するか確認

---

## アーキテクチャ

```
apps/web/
  src/workflows/screenshot.ts    # 'use workflow' — ワークフロー定義
  src/lib/browserless.ts         # 'use step' — スクリーンショット撮影
  src/lib/storage.ts             # 'use step' — Blob / ローカル保存
  src/app/api/cron/screenshot/   # Cron エンドポイント (start() で起動)
```

- `withWorkflow()` で `next.config.ts` をラップ
- `.well-known/workflow/v1/*` ルートはビルド時に自動生成

---

## スケジュール

| 項目 | 値 |
|------|-----|
| cron式 | `0 * * * *` |
| 頻度 | 毎時0分 |
| ターゲット | https://x.com/raycast_jp |

---

## ロールバック

### Cron を無効化する場合

`vercel.json` から screenshot の cron エントリを削除して再デプロイ。

### Workflow 自体を無効化する場合

1. `apps/web/next.config.ts` の `withWorkflow()` ラップを外す
2. `apps/web/src/workflows/`, `apps/web/src/lib/browserless.ts`, `apps/web/src/lib/storage.ts` を削除
3. `apps/web/src/app/api/cron/screenshot/` を削除
4. 再デプロイ

### デプロイのロールバック

```bash
vercel rollback
```

---

## トラブルシューティング

### Cron が実行されない
- Vercel ダッシュボードで Cron Job が表示されているか確認
- `CRON_SECRET` が環境変数に設定されているか確認

### browserless.io エラー
- `BROWSERLESS_API_TOKEN` が有効か確認
- browserless.io ダッシュボードで API クォータを確認

### Blob アップロード失敗
- `BLOB_READ_WRITE_TOKEN` が設定されているか確認
- Vercel Blob ストレージの容量を確認

### スクリーンショットが空白
- X.com は未ログイン状態だとフィードが表示されない（ログインウォール）
- プロフィールヘッダー部分のみキャプチャされるのは正常動作

### 既存ルートへの影響
- `withWorkflow()` は既存の Next.js 設定をラップするだけで、非 workflow ルートには影響しない
- ビルドログで既存ルートが全て出力されていることを確認
