変更をコミットしてください。

1. `git status` と `git diff --staged` で変更内容を確認
2. 未ステージの変更があれば `git add` でステージング
3. Conventional Commits形式でコミットメッセージを作成
   - 形式: `<type>(<scope>): <subject>`
   - Types: feat, fix, docs, style, refactor, perf, test, chore
   - Scopes: backend, frontend, api, config, deps, db
4. コミットを実行

注意:
- .env ファイルや認証情報はコミットしない
- pushはしない（明示的に指示された場合のみ）
