---

## Google API連携 セットアップ手順

このエージェントはGoogle Calendar APIおよびGoogle Tasks APIと連携します。利用するには、以下の手順で認証設定を行う必要があります。

### 1. `credentials.json` の準備

Google Cloud Platform (GCP) でOAuth 2.0 クライアントIDを作成し、認証情報ファイル `credentials.json` をダウンロードしてください。
ダウンロードしたファイルは、このプロジェクトのルートディレクトリ (`mastra-test/`) に配置します。

**注意:** このファイルには機密情報が含まれるため、`.gitignore`によってGitの追跡対象から除外されています。

### 2. `token.json` の生成

プロジェクトのルートディレクトリで以下のコマンドを実行し、初回認証を行ってください。

```bash
node google-auth.cjs
```

コマンドを実行するとブラウザが起動し、Googleアカウントへのアクセス許可を求める画面が表示されます。画面の指示に従って認証を完了させると、`token.json` ファイルが自動的に生成されます。このファイルが、プログラムがGoogle APIにアクセスするための鍵となります。

**注意:** このファイルも`.gitignore`によってGitの追跡対象から除外されています。 