# 日次自動検索 Cron Job リリース手順

## 前提条件
- Vercel プロジェクトがセットアップ済み
- SERP API キーが設定済み
- 本番 DB に `keywords` / `contents` テーブルが存在する
- キーワードが登録済み（`/admin` から設定）

---

## 1. 環境変数の設定

Vercel ダッシュボード → Settings → Environment Variables で追加:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `CRON_SECRET` | `openssl rand -base64 32` で生成 | Production |

```bash
openssl rand -base64 32
```

> `CRON_SECRET` は Vercel が cron 実行時に `Authorization: Bearer <secret>` ヘッダーとして自動送信する。未認証リクエストを弾くために必須。

---

## 2. デプロイ

PR マージで自動デプロイ:

```bash
gh pr merge --squash
```

---

## 3. デプロイ後の確認

### チェックリスト

- [ ] **Cron Job が登録されている**
  - Vercel ダッシュボード → Settings → Cron Jobs に `/api/cron/daily-search` (`0 1 * * *`) が表示される

- [ ] **手動テスト実行**
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/daily-search
  ```
  → `{ "results": [...], "totalSaved": N }` が返ればOK

- [ ] **認証チェック**
  ```bash
  curl https://your-domain.vercel.app/api/cron/daily-search
  ```
  → `{ "error": "Unauthorized" }` (401) が返ればOK

- [ ] **翌日ログ確認**
  - Vercel ダッシュボード → Logs で JST 10:00 (UTC 01:00) にcron実行ログがあるか確認

---

## スケジュール

| 項目 | 値 |
|------|-----|
| cron式 | `0 1 * * *` |
| UTC | 毎日 01:00 |
| JST | 毎日 10:00 |

---

## ロールバック

### Cron を無効化する場合

`vercel.json` から `crons` を削除して再デプロイ。

### デプロイのロールバック

```bash
vercel rollback
```

---

## トラブルシューティング

### Cron が実行されない
- Vercel ダッシュボードで Cron Job が表示されているか確認
- `CRON_SECRET` が環境変数に設定されているか確認

### 401 Unauthorized が返る
- Vercel の環境変数 `CRON_SECRET` と `vercel.json` の cron path が一致しているか確認
- Vercel が自動で `Authorization` ヘッダーを付けるのは Production デプロイのみ

### SERP API エラー
- `SERP_API_KEY` が有効か確認
- API クォータの残量を確認（https://serpapi.com/dashboard）
