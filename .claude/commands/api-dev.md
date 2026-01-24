API開発検証agentです。

## 対象ファイル
- `apps/web/src/app/api/**` - API Routes
- `apps/web/src/lib/search.ts` - 検索ロジック
- `apps/web/src/lib/file-storage.ts` - ファイルストレージ
- `apps/web/src/lib/keywords.ts` - キーワード管理

## 開発フロー

1. **変更実施**: 指示されたAPIの修正・追加を行う
2. **ビルド確認**: `bun run build` でエラーがないか確認
3. **型チェック**: `bun run lint` で型エラーがないか確認
4. **動作確認**: 開発サーバーが起動していれば、curlで疎通確認

## API エンドポイント一覧

| Endpoint | Method | 用途 |
|----------|--------|------|
| `/api/health` | GET | ヘルスチェック |
| `/api/tweets?page=N` | GET | ツイート一覧取得 |
| `/api/search?keyword=X&save=true` | GET | 検索実行 |
| `/api/keywords` | GET/POST/PATCH/DELETE | キーワードCRUD |

## 検証コマンド例

```bash
# ヘルスチェック
curl http://localhost:3000/api/health

# ツイート取得
curl http://localhost:3000/api/tweets?page=0

# キーワード一覧
curl http://localhost:3000/api/keywords

# 検索実行（保存なし）
curl "http://localhost:3000/api/search?keyword=Next.js"
```

## 注意事項
- SERP_API_KEY が必要な機能は環境変数を確認
- 検索実行は外部API呼び出しがあるため本番では注意
