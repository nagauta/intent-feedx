# スクリーンショット Workflow リリース手順

## 前提条件
- [ ] Vercel に `apps/workflow` 用の新規プロジェクトを作成済み
- [ ] browserless.io アカウントがある
- [ ] Vercel Blob ストレージが有効化済み

---

## 1. Vercel プロジェクト作成

1. Vercel ダッシュボード → Add New → Project
2. 同じ GitHub リポジトリを選択
3. Root Directory を `apps/workflow` に設定
4. Framework Preset: Next.js

---

## 2. 環境変数の設定

Vercel ダッシュボード → Settings → Environment Variables:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `BROWSERLESS_API_TOKEN` | browserless.io のダッシュボードから取得 | Production |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 連携で自動設定、または手動取得 | Production |
| `CRON_SECRET` | `openssl rand -base64 32` で生成 | Production |

```bash
openssl rand -base64 32
```

---

## 3. デプロイ

PR マージで自動デプロイ、または手動:

```bash
vercel --prod
```

---

## 4. デプロイ後の確認

### チェックリスト

- [ ] **ヘルスチェック**
  ```bash
  curl https://your-workflow-domain.vercel.app/api/health
  ```
  → `{ "status": "ok" }` が返ればOK

- [ ] **Cron Job が登録されている**
  - Vercel ダッシュボード → Settings → Cron Jobs に `/api/cron/screenshot` (`0 * * * *`) が表示される

- [ ] **手動テスト実行**
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" https://your-workflow-domain.vercel.app/api/cron/screenshot
  ```
  → `{ "message": "Screenshot workflow started" }` が返ればOK

- [ ] **認証チェック**
  ```bash
  curl https://your-workflow-domain.vercel.app/api/cron/screenshot
  ```
  → `{ "error": "Unauthorized" }` (401) が返ればOK

- [ ] **Blob ストレージ確認**
  - Vercel ダッシュボード → Storage → Blob に `screenshots/raycast_jp/` 配下にファイルが保存されているか確認

- [ ] **Workflow 実行確認**
  - Vercel ダッシュボード → AI → Workflows で実行履歴を確認

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

`apps/workflow/vercel.json` から `crons` を削除して再デプロイ。

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
