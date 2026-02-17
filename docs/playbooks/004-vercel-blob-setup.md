# Vercel Blob ストレージ セットアップ手順

## 前提条件
- [ ] Vercel CLI がインストール済み（`npm i -g vercel` / `bun add -g vercel`）
- [ ] Vercel にログイン済み（`vercel login`）
- [ ] `apps/web` の Vercel プロジェクトが存在する

---

## 1. Blob Store の作成

### CLI の場合（推奨）

```bash
vercel blob store add intent-feedx-blob
```

リージョン指定する場合:

```bash
vercel blob store add intent-feedx-blob --region iad1
```

> デフォルトリージョンは `iad1`（US East）。

### ダッシュボードの場合

1. Vercel Dashboard → 対象プロジェクト → **Storage** タブ
2. **Connect Database** → **Create New** タブ → **Blob** → **Continue**
3. ストア名を入力（例: `intent-feedx-blob`）
4. **Create a new Blob store** を選択
5. 環境（Production / Preview / Development）を選んで接続

---

## 2. 環境変数の確認

Blob Store を作成・接続すると `BLOB_READ_WRITE_TOKEN` が自動でプロジェクトの環境変数に追加される。

### 確認方法

```bash
# ダッシュボードの環境変数をローカルに取得
vercel env pull apps/web/.env.local
```

```bash
# .env.local に BLOB_READ_WRITE_TOKEN が含まれていることを確認
grep BLOB_READ_WRITE_TOKEN apps/web/.env.local
```

> 手動で設定が必要な場合は Vercel Dashboard → Settings → Environment Variables から追加。

---

## 3. 動作確認

### ローカルテスト

```bash
# ローカルでは BLOB_READ_WRITE_TOKEN が未設定ならファイル保存にフォールバック
bun run dev
# → screenshots/ ディレクトリにローカル保存される

# BLOB_READ_WRITE_TOKEN が .env.local にあれば Vercel Blob に直接アップロード
```

### 本番テスト

```bash
# スクリーンショット Workflow を手動実行
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/screenshot
```

→ `{ "message": "Screenshot workflow started" }` が返ればOK

### Blob の中身を確認

```bash
# CLI でファイル一覧
vercel blob list --prefix screenshots/

# 特定ファイルの詳細
vercel blob list --prefix screenshots/raycast_jp/ --limit 5
```

ダッシュボードの場合: Storage → Blob → ファイル一覧で確認。

---

## 確認チェックリスト

- [ ] `vercel blob store add` でストアが作成できた
- [ ] `BLOB_READ_WRITE_TOKEN` がプロジェクトの環境変数に設定されている
- [ ] `vercel env pull` でローカルにトークンを取得できた
- [ ] スクリーンショット Workflow 実行後、Blob にファイルが保存されている
- [ ] `vercel blob list --prefix screenshots/` でファイルが表示される

---

## CLI コマンドリファレンス

| コマンド | 用途 |
|---|---|
| `vercel blob store add [name]` | ストア作成 |
| `vercel blob store get [store-id]` | ストア情報取得 |
| `vercel blob store remove [store-id]` | ストア削除 |
| `vercel blob list` | ファイル一覧 |
| `vercel blob put [file]` | ファイルアップロード |
| `vercel blob del [url-or-pathname]` | ファイル削除 |
| `vercel blob copy [from] [to]` | ファイルコピー |

よく使うオプション:

```bash
# プレフィックスでフィルタ
vercel blob list --prefix screenshots/ --limit 100

# 手動アップロード
vercel blob put image.png --pathname screenshots/test/manual.png

# 削除
vercel blob del screenshots/test/manual.png
```

---

## ロールバック

### Blob Store を切り離す場合

1. Vercel Dashboard → Storage → 対象ストア → **Disconnect** でプロジェクトとの接続を解除
2. 環境変数 `BLOB_READ_WRITE_TOKEN` は自動で削除される

### Blob Store を削除する場合

```bash
# ストア ID を確認
vercel blob store get

# 削除
vercel blob store remove [store-id]
```

> 削除するとストア内の全ファイルが失われる。

---

## トラブルシューティング

### `BLOB_READ_WRITE_TOKEN is not set` エラー
- Blob Store がプロジェクトに接続されているか確認
- 環境変数の対象環境（Production / Preview / Development）を確認
- `vercel env pull` でローカルに最新の環境変数を取得

### アップロードが 403 で失敗する
- トークンの権限が `read-write` であることを確認
- トークンが失効していないか確認（ダッシュボードで再生成可能）

### ローカルで Blob に書き込めない
- `apps/web/.env.local` に `BLOB_READ_WRITE_TOKEN` があるか確認
- ない場合は `vercel env pull apps/web/.env.local` で取得
- それでも不要ならローカルファイル保存フォールバックが動作するので問題なし

### ファイルサイズ制限
- サーバーサイドアップロード: 最大 4.5 MB（Vercel Serverless の制限）
- クライアントアップロード: 最大 5 TB（マルチパート対応）
- スクリーンショットは通常 1-3 MB 程度なのでサーバーサイドで問題なし
