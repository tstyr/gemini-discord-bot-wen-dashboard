# Vercel環境変数セットアップガイド

## 必要な環境変数

### Supabase（必須）

1. Supabaseダッシュボード (https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. Settings → API に移動
4. 以下をコピー：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercelでの設定手順

1. Vercelダッシュボード → プロジェクト選択
2. Settings → Environment Variables
3. 以下を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseのProject URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseのanon public key | Production, Preview, Development |

### オプション（Koyeb統合）

```
KOYEB_API_TOKEN=your_koyeb_token
KOYEB_SERVICE_ID=your_service_id
```

## 設定後

1. Deployments → 最新デプロイの「...」メニュー → Redeploy
2. または、新しいコミットをプッシュして自動デプロイ

## トラブルシューティング

### "Failed to fetch" エラー
- 環境変数が正しく設定されているか確認
- Vercelで再デプロイを実行
- ブラウザのキャッシュをクリア（Ctrl + Shift + R）

### "Invalid API key" エラー
- anon public key（service role keyではない）を使用しているか確認
- キーの前後にスペースがないか確認

### データが表示されない
- Supabaseでテーブルが作成されているか確認（database.sql実行）
- Supabaseにデータが入っているか確認（database-sample-data.sql実行）
- Realtime機能が有効になっているか確認
