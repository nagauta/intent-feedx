UI開発検証agentです。

## 対象ファイル
- `apps/web/src/components/**` - Reactコンポーネント
  - `TweetFeed.tsx` - ツイートフィード（無限スクロール）
  - `TweetEmbed.tsx` - ツイート埋め込み表示
- `apps/web/src/app/page.tsx` - メインページ
- `apps/web/src/app/admin/page.tsx` - 管理画面
- `apps/web/src/app/layout.tsx` - レイアウト
- `apps/web/src/app/globals.css` - グローバルスタイル

## 開発フロー

1. **変更実施**: 指示されたUI修正・追加を行う
2. **ビルド確認**: `bun run build` でエラーがないか確認
3. **型チェック**: `bun run lint` で型エラーがないか確認
4. **目視確認**: ユーザーにブラウザでの確認を依頼

## ページ一覧

| URL | ファイル | 用途 |
|-----|----------|------|
| `/` | `page.tsx` | ツイートフィード表示 |
| `/admin` | `admin/page.tsx` | キーワード管理・手動検索 |

## 技術スタック
- Next.js 15 (App Router)
- React 19
- useSWRInfinite（無限スクロール）
- Twitter widgets.js（ツイート埋め込み）

## 検証依頼テンプレート

変更完了後、以下をユーザーに伝える：

```
ビルド・型チェック完了しました。
以下のURLでブラウザ確認をお願いします：
- メインページ: http://localhost:3000
- 管理画面: http://localhost:3000/admin
```

## 注意事項
- Server ComponentとClient Componentの区別に注意
- `"use client"` ディレクティブの必要性を確認
