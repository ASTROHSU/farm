# Firebase 快速設定指南

## 5 分鐘快速設定

### 步驟 1：建立 Firebase 專案（2 分鐘）

1. 前往 https://console.firebase.google.com/
2. 點擊「新增專案」
3. 輸入專案名稱：`content-farm-os`
4. 點擊「繼續」→「建立專案」

### 步驟 2：啟用 Firestore（1 分鐘）

1. 在 Firebase Console 左側選單點擊「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「以測試模式啟動」
4. 選擇位置（建議：`asia-east1` 或 `asia-northeast1`）
5. 點擊「啟用」

### 步驟 3：取得配置資訊（1 分鐘）

1. 點擊左上角齒輪圖標 →「專案設定」
2. 向下滾動到「您的應用程式」
3. 點擊「</>」圖標（網頁應用程式）
4. 輸入應用程式暱稱：`Content Farm OS`
5. **不要**勾選 Firebase Hosting
6. 點擊「註冊應用程式」
7. **複製配置物件**，您會看到類似這樣的資訊：

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

### 步驟 4：設定 Vercel 環境變數（1 分鐘）

1. 前往 https://vercel.com/dashboard
2. 選擇您的專案
3. 進入「Settings」→「Environment Variables」
4. 新增以下 6 個環境變數：

```
VITE_FIREBASE_API_KEY=AIzaSy...（從步驟 3 複製）
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

5. 點擊「Save」

### 步驟 5：安裝依賴並部署

在終端機執行：

```bash
npm install
```

然後在 Vercel 重新部署（或推送程式碼到 GitHub，Vercel 會自動部署）

## 測試

1. 打開應用程式
2. 打開瀏覽器 Console（F12）
3. 應該會看到：`✅ Firebase 登入成功: [user-id]`
4. 新增一個任務
5. 檢查 Firebase Console 的 Firestore，應該會看到新資料

## 設定 Firestore 安全規則

在 Firebase Console → Firestore Database →「規則」分頁，貼上：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if true;
    }
  }
}
```

點擊「發布」

## 完成！

現在您的應用程式已經連接到 Firebase，所有任務都會自動同步！
