# 📚 內容農場助手 Chrome Extension

一鍵擷取網頁內容（閱讀模式）並自動新增到待處理任務的 Chrome 擴充功能。

## 🌟 功能特色

- **一鍵擷取**：點擊擴充功能圖標即可擷取當前網頁內容
- **智能提取**：自動使用閱讀模式提取網頁主要內容，過濾廣告和無關元素
- **自動同步**：直接保存到 Firebase Firestore，與主應用程式即時同步
- **標題識別**：自動從內容第一行提取標題
- **URL 追蹤**：自動記錄來源網頁 URL

## 📦 安裝步驟

### 1. 載入擴充功能到 Chrome

1. 打開 Chrome 瀏覽器
2. 在網址列輸入 `chrome://extensions/`
3. 開啟右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇 `chrome-extension` 資料夾

### 2. 配置 Firebase

首次安裝後會自動開啟設定頁面，或者：

1. 點擊擴充功能圖標
2. 點擊「⚙️ 設定」按鈕
3. 填入以下資訊：

#### Firebase 配置

從 Firebase Console 複製您的專案配置：

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案
3. 點擊專案設定（⚙️圖標）
4. 在「一般」頁籤下找到「您的應用程式」
5. 複製 Firebase 配置物件（JSON 格式）

範例：
```json
{
  "apiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "authDomain": "your-app.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-app.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdefghijk"
}
```

#### App ID

輸入您在主應用程式中使用的 App ID。這是 Firestore 路徑中的應用程式識別碼。

路徑格式：`artifacts/{appId}/public/data/tasks`

### 3. 配置 Firebase 安全規則

為了讓擴充功能能夠寫入任務，您需要在 Firebase Console 中配置 Firestore 安全規則：

1. 前往 Firebase Console > Firestore Database > 規則
2. 添加以下規則（或修改現有規則）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/tasks/{taskId} {
      // 允許公開讀寫（開發環境）
      allow read, write: if true;

      // 或者只允許已認證用戶（包含匿名）
      // allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **注意**：上述規則允許公開讀寫，僅適用於開發環境。生產環境請使用更嚴格的安全規則。

## 🚀 使用方法

1. **瀏覽到目標網頁**
   - 打開任何您想要擷取內容的網頁

2. **點擊擴充功能圖標**
   - 點擊瀏覽器工具列上的「內容農場助手」圖標

3. **擷取內容**
   - 點擊「✨ 擷取當前頁面」按鈕
   - 等待幾秒鐘，內容會自動提取並保存

4. **查看結果**
   - 成功後會顯示「✅ 已成功新增到待處理任務」
   - 返回主應用程式，在「📥 待處理」欄位中查看新任務

## 📁 文件結構

```
chrome-extension/
├── manifest.json       # 擴充功能配置文件
├── popup.html          # 彈出視窗 UI
├── popup.js            # 彈出視窗邏輯
├── content.js          # 內容提取腳本
├── background.js       # 背景服務 (Firebase 整合)
├── options.html        # 設定頁面 UI
├── options.js          # 設定頁面邏輯
├── icons/              # 圖標資料夾
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # 說明文件
```

## 🔧 技術細節

### 內容提取邏輯

擴充功能使用以下策略提取網頁內容：

1. **尋找主要文章容器**
   - 嘗試常見的文章選擇器（`article`, `.post`, `.entry-content` 等）

2. **清理無關元素**
   - 移除導航、頁首、頁尾、廣告、側邊欄等

3. **保留文字格式**
   - 保留標題層級（轉換為 Markdown 格式）
   - 保留段落分隔
   - 保留列表項目

4. **內容驗證**
   - 確保提取的內容長度合理（至少 10 字元）
   - 限制最大長度為 50,000 字元

### Firebase 整合

使用 Firebase REST API 直接寫入 Firestore：

- **API Endpoint**: `https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/{collectionPath}`
- **方法**: POST
- **格式**: Firestore Document Format

## 🐛 故障排除

### 擴充功能無法載入
- 確認已開啟「開發人員模式」
- 檢查是否選擇了正確的資料夾
- 查看 Chrome 擴充功能頁面的錯誤訊息

### 無法擷取內容
- 確認網頁已完全載入
- 嘗試重新整理網頁
- 檢查瀏覽器控制台（F12）的錯誤訊息

### 無法保存到 Firebase
- 確認 Firebase 配置正確
- 確認 App ID 正確
- 檢查 Firestore 安全規則是否允許寫入
- 使用設定頁面的「🧪 測試連線」功能

### 圖標未顯示
- 在 `icons/` 資料夾中添加三個尺寸的圖標（16x16, 48x48, 128x128）
- 或暫時移除 manifest.json 中的圖標配置

## 📝 注意事項

1. **隱私權**：此擴充功能會提取並上傳網頁內容到您的 Firebase 專案
2. **版權**：請遵守網頁內容的版權規定
3. **安全性**：請妥善保管 Firebase 配置，不要分享給他人
4. **性能**：大型網頁可能需要較長的提取時間

## 🔄 版本歷史

### v1.0.0 (2024-01-24)
- ✨ 初始版本
- 📚 網頁內容提取（閱讀模式）
- 🔥 Firebase Firestore 整合
- ⚙️ 設定頁面
- 🎨 美觀的 UI 設計

## 📄 授權

此專案為內容農場管理系統的一部分。

## 🤝 貢獻

歡迎提出問題和建議！

---

Made with ❤️ for Content Farm Assistant
