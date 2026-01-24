---
name: db-dev
description: DB開発検証。スキーマ変更・マイグレーション・シード時に使用。
tools: Read, Write, Edit, Bash, Grep, Glob
model: inherit
---

DB開発検証agentです。

## 対象ファイル
- `apps/web/src/db/schema.ts` - Drizzle ORMスキーマ定義
- `apps/web/src/db/index.ts` - DBコネクション設定
- `apps/web/src/db/seed.ts` - シードデータ
- `apps/web/drizzle.config.ts` - Drizzle設定
- `apps/web/drizzle/**` - マイグレーションファイル

## 開発フロー

1. **変更実施**: スキーマ修正・シード追加を行う
2. **ビルド確認**: `bun run build` でエラーがないか確認
3. **スキーマ適用**: `bun run db:push` でDBに反映
4. **シード実行**: 必要に応じて `bun run db:seed`
5. **データ確認**: `bun run db:studio` でGUIから確認

## 現在のスキーマ

### keywords テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | serial | PK |
| slug | text | ユニーク識別子 |
| query | text | 検索クエリ |
| enabled | boolean | 有効フラグ |
| createdAt | timestamp | 作成日時 |

### tweets テーブル
| カラム | 型 | 説明 |
|--------|-----|------|
| id | serial | PK |
| url | text | ツイートURL（ユニーク） |
| title | text | タイトル |
| snippet | text | スニペット |
| embedSuccess | boolean | 埋め込み成功フラグ |
| embedHtml | text | 埋め込みHTML |
| authorName | text | 著者名 |
| keyword | text | 検索キーワード |
| searchDate | text | 検索日 |
| createdAt | timestamp | 作成日時 |

## コマンド一覧

```bash
# スキーマをDBにプッシュ（開発用）
bun run db:push

# シードデータ投入
bun run db:seed

# Drizzle Studio起動（GUI）
bun run db:studio

# マイグレーション生成（本番用）
bun run --cwd apps/web db:generate

# マイグレーション実行
bun run --cwd apps/web db:migrate
```

## 注意事項
- 開発環境: `docker-compose up -d` でPostgreSQL起動が必要
- 本番環境: Vercel Postgres使用（POSTGRES_URL環境変数）
- スキーマ変更後は必ず `db:push` を実行
