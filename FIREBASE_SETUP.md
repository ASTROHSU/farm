# Firebase 設定指南

## 概述

此應用程式使用 Firebase Firestore 作為後台資料庫，實現協作功能：
- 您新增的任務會自動同步到 Firebase
- 夥伴可以隨時查看您新增的內容
- 「本週已完成」時，前端清空但 Firebase 保留所有歷史資料

## 步驟 1：建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」或「建立專案」
3. 輸入專案名稱（例如：`content-farm-os`）
4. 選擇是否啟用 Google Analytics（可選）
5. 點擊「建立專案」

## 步驟 2：啟用 Firestore Database

1. 在 Firebase Console 中，點擊左側選單的「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「以測試模式啟動」（開發階段）
4. 選擇資料庫位置（建議選擇離您最近的區域，例如：`asia-east1`）
5. 點擊「啟用」

### 設定 Firestore 安全規則（重要）

在「規則」分頁中，設定以下規則以允許讀寫：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許匿名用戶讀寫 artifacts 集合下的公開資料
    // 路徑格式：artifacts/{appId}/public/data/tasks/{taskId}
    match /artifacts/{appId}/public/data/tasks/{taskId} {
      // 允許已認證的用戶（包括匿名用戶）讀寫
      allow read, write: if request.auth != null;
      
      // 或者更寬鬆的設定（允許所有匿名用戶，僅用於協作）
      // allow read, write: if true;
    }
  }
}
```

**⚠️ 注意**：此規則允許所有人讀寫，僅適合內部協作使用。如需更安全的設定，請參考 Firebase 文件。

## 步驟 3：取得 Firebase 配置

1. 在 Firebase Console 中，點擊專案設定（齒輪圖標）
2. 向下滾動到「您的應用程式」區塊
3. 點擊「</>」圖標（網頁應用程式）
4. 輸入應用程式暱稱（例如：`Content Farm OS`）
5. **不要**勾選「也設定 Firebase Hosting」
6. 點擊「註冊應用程式」
7. 複製 Firebase 配置物件，格式如下：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## 步驟 4：設定環境變數

### 在 Vercel 設定

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案
3. 進入「Settings」→「Environment Variables」
4. 新增以下環境變數：

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 在本地開發環境設定

在專案根目錄的 `.env.local` 檔案中加入：

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 步驟 5：安裝 Firebase SDK

在專案根目錄執行：

```bash
npm install firebase
```

## 步驟 6：部署並測試

1. 提交並推送程式碼到 GitHub
2. Vercel 會自動部署
3. 打開應用程式，檢查瀏覽器 Console 是否有錯誤
4. 新增一個任務，檢查 Firebase Console 的 Firestore 是否有資料

## 資料結構

Firestore 中的資料結構：

```
tasks (collection)
  └── {taskId} (document)
      ├── id: number
      ├── title: string
      ├── content: string
      ├── url: string
      ├── geminiReport: string
      ├── summary: string
      ├── status: string (todo | in_progress | done)
      ├── created_at: timestamp
      ├── completed_at: timestamp
      ├── substackLink: string
      └── imageStatus: boolean
```

## 疑難排解

### 1. Firebase 初始化錯誤

**錯誤訊息**：`Firebase: Error (auth/invalid-api-key)`

**解決方法**：
- 檢查環境變數是否正確設定
- 確認變數名稱以 `VITE_` 開頭
- 重新部署 Vercel

### 2. Firestore 權限錯誤

**錯誤訊息**：`Missing or insufficient permissions`

**解決方法**：
- 檢查 Firestore 安全規則
- 確認規則允許讀寫操作

### 3. 資料未同步

**檢查步驟**：
1. 打開瀏覽器 Console
2. 查看是否有 Firebase 相關錯誤
3. 檢查 Firebase Console 的 Firestore 是否有資料
4. 確認網路連線正常

## 安全性建議

1. **生產環境**：修改 Firestore 規則，限制只有授權使用者可以讀寫
2. **API Key**：雖然前端 API Key 會暴露，但 Firestore 規則會保護資料
3. **身份驗證**：未來可以加入 Firebase Authentication 來識別使用者

## 參考資源

- [Firebase 文件](https://firebase.google.com/docs)
- [Firestore 文件](https://firebase.google.com/docs/firestore)
- [Firebase 安全規則](https://firebase.google.com/docs/firestore/security/get-started)
