# 環境變數設定說明

## 如何設定預設的 OpenAI API Key

如果您想為所有使用者提供預設的 API Key（但不想寫死在程式碼中），請按照以下步驟：

### 1. 建立 `.env.local` 檔案

在專案根目錄建立 `.env.local` 檔案：

```bash
# 在專案根目錄執行
touch .env.local
```

### 2. 填入您的 API Key

在 `.env.local` 檔案中加入：

```
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**注意**：`VITE_GOOGLE_SHEETS_API_URL` 是選填的。如果未設定，系統會使用本地儲存（localStorage）。如需協作功能，請參考 `GOOGLE_SHEETS_SETUP.md` 進行設定。

### 3. 重要提醒

- ✅ `.env.local` 檔案**不會**被提交到 GitHub（已在 `.gitignore` 中排除）
- ✅ 只有以 `VITE_` 開頭的環境變數才會在客戶端使用
- ✅ 如果使用者已經在設定中填入自己的 API Key，系統會優先使用使用者的 Key
- ⚠️ 注意：即使使用環境變數，API Key 仍會被打包進前端程式碼中，因此建議：
  - 使用只讀權限的 API Key
  - 設定使用額度限制
  - 定期輪換 Key

### 4. 開發環境

執行 `npm run dev` 時，系統會自動讀取 `.env.local` 中的環境變數。

### 5. 生產環境

在部署時，您需要在部署平台（如 Vercel、Netlify 等）的環境變數設定中新增 `VITE_OPENAI_API_KEY`。

## 範例檔案

專案中已包含 `.env.example` 作為範例，您可以複製它來建立 `.env.local`：

```bash
cp .env.example .env.local
```
