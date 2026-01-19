# ⚠️ Vercel環境変数の設定リマインダー

## 重要：環境変数を正しく設定してください

ダッシュボードが正しく動作するために、Vercelの環境変数を以下の通り設定してください。

### 設定手順

1. **Vercelダッシュボードを開く**
   - https://vercel.com/dashboard
   - プロジェクト「gemini-discord-bot-wen-dashboard」を選択

2. **Settings → Environment Variables に移動**

3. **以下の2つの環境変数を追加**

   | 変数名 | 値 | 環境 |
   |--------|-----|------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://[your-project-ref].supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

4. **Supabase認証情報の取得方法**
   - Supabaseダッシュボードを開く: https://supabase.com/dashboard
   - プロジェクトを選択
   - Settings → API に移動
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`にコピー
   - **anon public** キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`にコピー

5. **環境を選択**
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   - すべてにチェックを入れてください

6. **保存後、必ず再デプロイ**
   - Deployments タブに移動
   - 最新のデプロイの右側にある「...」メニューをクリック
   - 「Redeploy」を選択
   - 「Redeploy」ボタンをクリック

### 確認方法

1. デプロイ完了後、以下のURLにアクセス：
   ```
   https://your-dashboard.vercel.app/debug
   ```

2. 以下が表示されることを確認：
   - ✅ NEXT_PUBLIC_SUPABASE_URL: https://...
   - ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: SET (eyJhbGci...)
   - ✅ Environment variables are configured
   - ✅ Connection successful!

### よくある間違い

❌ **間違い1**: 変数名が正しくない
- `SUPABASE_URL` ではなく `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_` プレフィックスが必須です

❌ **間違い2**: 環境を選択していない
- Production, Preview, Development すべてにチェックを入れてください

❌ **間違い3**: 再デプロイしていない
- 環境変数を追加・変更した後は必ず再デプロイが必要です

❌ **間違い4**: Supabase URLの形式が間違っている
- 正しい形式: `https://abcdefghijklmnop.supabase.co`
- 末尾に `/` を付けないでください

❌ **間違い5**: Service Role Keyを使用している
- Anon Key（公開キー）を使用してください
- Service Role Keyは秘密鍵なので、フロントエンドでは使用しません

### トラブルシューティング

**問題**: "Connection Error: TypeError: Failed to fetch"

**解決策**:
1. `/debug` ページで環境変数が正しく設定されているか確認
2. Supabase URLが正しい形式か確認（https://で始まり、.supabase.coで終わる）
3. Supabaseプロジェクトが一時停止していないか確認
4. ブラウザのコンソール（F12）でエラーメッセージを確認
5. Vercelで再デプロイを実行

**問題**: 環境変数が表示されない（"❌ NOT SET"）

**解決策**:
1. 変数名に `NEXT_PUBLIC_` プレフィックスがあるか確認
2. Vercelで環境を選択したか確認（Production, Preview, Development）
3. 再デプロイを実行したか確認

---

## チェックリスト

設定が完了したら、以下をチェックしてください：

- [ ] Vercel Settings → Environment Variables で2つの変数を追加
- [ ] 変数名が `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Production, Preview, Development すべてにチェック
- [ ] 再デプロイを実行
- [ ] `/debug` ページで環境変数が表示されることを確認
- [ ] `/debug` ページで "Connection successful!" が表示されることを確認
- [ ] `/dashboard` ページでデータが表示されることを確認

すべてチェックが完了したら、ダッシュボードが正常に動作するはずです！
