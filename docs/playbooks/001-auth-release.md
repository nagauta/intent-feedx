# Better Auth リリース手順

## 前提条件
- Vercel プロジェクトがセットアップ済み
- Neon DB (本番) が作成済み
- GitHub リポジトリと Vercel が連携済み

---

## 1. 本番環境変数の設定 (Vercel)

Vercel ダッシュボード → Settings → Environment Variables で以下を追加:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` で生成 | Production |
| `BETTER_AUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |

### シークレット生成コマンド
```bash
openssl rand -base64 32
```

> **重要:** `BETTER_AUTH_SECRET` は本番用に新しく生成し、開発環境とは別の値を使用してください。

---

## 2. 本番DBマイグレーション

### 方法A: ローカルから本番DBに直接実行（推奨）

```bash
cd apps/web

# 本番DB接続文字列を一時的に設定
export POSTGRES_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# マイグレーション実行
bun run db:push

# または migrate コマンド
bun run db:migrate
```

### 方法B: Neon コンソールから直接実行

1. Neon ダッシュボード → SQL Editor を開く
2. `apps/web/drizzle/0001_mean_jane_foster.sql` の内容をコピー
3. SQL Editor に貼り付けて実行

### マイグレーション内容の確認
```bash
# 生成されたSQLを確認
cat apps/web/drizzle/0001_mean_jane_foster.sql
```

作成されるテーブル:
- `user` - ユーザー情報
- `session` - セッション管理
- `account` - 認証アカウント（パスワードハッシュ含む）
- `verification` - メール検証トークン

---

## 3. デプロイ

### PRマージによる自動デプロイ
```bash
# mainブランチに切り替え
git checkout main

# PRをマージ
gh pr merge 1 --squash

# または GitHub UI からマージ
```

### 手動デプロイ（必要な場合）
```bash
vercel --prod
```

---

## 4. デプロイ後の確認

### チェックリスト

- [ ] **環境変数確認**
  ```
  Vercel Dashboard → Deployments → 最新デプロイ → Logs
  → 環境変数が正しく読み込まれているか確認
  ```

- [ ] **ヘルスチェック**
  ```bash
  curl https://your-domain.vercel.app/api/health
  ```

- [ ] **認証エンドポイント確認**
  ```bash
  curl https://your-domain.vercel.app/api/auth/session
  # → {"session":null} が返ればOK
  ```

- [ ] **UIテスト**
  1. `/admin` にアクセス → `/login` にリダイレクトされる
  2. `/signup` で新規ユーザー登録
  3. `/login` でログイン
  4. `/admin` にアクセスできる
  5. ログアウトが機能する

- [ ] **DBテーブル確認** (Neon コンソール)
  ```sql
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public';
  ```

---

## 5. ロールバック手順

### デプロイのロールバック
```bash
# Vercel CLI
vercel rollback

# または Vercel Dashboard → Deployments → 以前のデプロイを Promote
```

### DBロールバック（必要な場合）
```sql
-- 認証テーブルを削除（データも削除されるため注意）
DROP TABLE IF EXISTS verification CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
```

---

## トラブルシューティング

### 「Invalid session」エラー
- `BETTER_AUTH_SECRET` が正しく設定されているか確認
- 開発環境と本番環境で異なるシークレットを使用しているか確認

### 「Database connection failed」エラー
- `POSTGRES_URL` が正しいか確認
- Neon の接続プーリング設定を確認（`?sslmode=require` が必要）

### Cookie が設定されない
- `BETTER_AUTH_URL` が実際のドメインと一致しているか確認
- HTTPS が有効になっているか確認

---

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `POSTGRES_URL` | ✅ | Neon DB 接続文字列 |
| `BETTER_AUTH_SECRET` | ✅ | 認証シークレット（32文字以上） |
| `BETTER_AUTH_URL` | ✅ | アプリケーションURL |
| `NEXT_PUBLIC_APP_URL` | ✅ | クライアント側URL |
| `SERP_API_KEY` | ✅ | SERP API キー（既存） |
