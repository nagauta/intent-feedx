---
name: update-docs
description: 実装完了後にドキュメント（CLAUDE.md + docs/）を更新する
---

実装タスク完了後、sub-agentを起動して以下のドキュメントを更新すること。

## CLAUDE.md 更新対象
- Architecture: アプリ・パッケージの追加・削除
- Local Development: 環境変数・起動手順の変更
- Commands: 新しいコマンドの追加
- 各 apps/*/CLAUDE.md: アプリ固有の技術スタック・設定変更

## docs/ 更新対象
- `docs/spec.md`: 技術スタック・機能・スコープ外の変更
- `docs/changelog.md`: 完了した機能の記録
- `docs/todo.md`: 完了タスクの打ち消し・新タスク追加
- `docs/playbooks/`: 新機能のリリース手順書を追加（テンプレートは `docs/playbooks/README.md` 参照）
