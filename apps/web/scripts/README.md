# Scripts

ワンショット実行用スクリプト集。

## 使い方

```bash
cd apps/web
bun run scripts/<script-name>.ts
```

## スクリプト一覧

### migrate-tweets-to-contents.ts

**目的**: `tweets`テーブルから`contents`テーブルへのデータ移行

**背景**: マルチソースコンテンツ対応（v2）で、Twitter専用の`tweets`テーブルから汎用的な`contents`テーブルに移行。

**実行タイミング**:
- `contents`テーブル作成後、1回のみ実行
- 既に移行済みの場合は重複スキップされるため再実行しても安全

**実行方法**:
```bash
bun run scripts/migrate-tweets-to-contents.ts
```

**処理内容**:
1. `tweets`テーブルから全データ取得
2. `contents`形式に変換（`sourceType: 'twitter'`を付与）
3. `embedHtml`, `embedSuccess`を`sourceMetadata`に格納
4. `contents`テーブルにバッチinsert（URL重複はスキップ）

**出力例**:
```
🚀 tweetsからcontentsへの移行を開始...
📊 移行対象: 4件
  📥 4/4 処理中...
✅ 移行完了: 4件を挿入
⏭️  0件はスキップ（重複）
🎉 移行スクリプト完了
```
