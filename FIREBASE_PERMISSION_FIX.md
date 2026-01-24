# Firebase 寫入權限問題修復指南

## 問題描述

如果看到「⚠️ 連線成功，但可能需要配置安全規則以允許寫入」的警告，表示：
- ✅ Firebase 連線正常
- ✅ 身份驗證成功
- ❌ 但 Firestore 安全規則不允許寫入操作

## 解決步驟

### 1. 前往 Firebase Console

1. 打開 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案
3. 點擊左側選單的「Firestore Database」
4. 點擊「規則」分頁

### 2. 更新安全規則

將規則更新為以下內容：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許匿名用戶讀寫 artifacts 集合下的公開資料
    // 路徑格式：artifacts/{appId}/public/data/tasks/{taskId}
    
    // 允許讀寫 tasks 集合中的文檔
    match /artifacts/{appId}/public/data/tasks/{taskId} {
      // 允許已認證的用戶（包括匿名用戶）讀寫
      allow read, write: if request.auth != null;
    }
    
    // 允許讀取父文檔路徑，確保集合查詢可以正常工作
    match /artifacts/{appId}/public/data {
      allow read: if request.auth != null;
    }
  }
}
```

### 3. 發布規則

1. 點擊「發布」按鈕
2. 等待規則生效（通常幾秒鐘內）

### 4. 測試

1. 重新載入應用程式
2. 嘗試新增一個任務
3. 警告訊息應該會消失，狀態會變為「✅ 雲端同步中」

## 常見問題

### Q: 規則已經設定為 `allow read, write: if request.auth != null;` 但還是失敗？

**A:** 檢查以下幾點：
1. 確認規則路徑是否正確：`artifacts/{appId}/public/data/tasks/{taskId}`
2. 確認 `appId` 是否與程式碼中的一致（預設為 `content-farm-os-default`）
3. 檢查是否有其他規則覆蓋了這個規則
4. 確認規則已發布（不是草稿）

### Q: 如何確認規則是否生效？

**A:** 在 Firebase Console 中：
1. 前往 Firestore Database → 規則
2. 使用「規則測試器」功能測試讀寫操作
3. 檢查瀏覽器 Console 是否有 Firebase 錯誤訊息

### Q: 可以暫時使用更寬鬆的規則嗎？

**A:** 僅限開發階段，可以使用：

```javascript
match /artifacts/{appId}/public/data/tasks/{taskId} {
  allow read, write: if true;  // 允許所有人讀寫（僅用於測試）
}
```

⚠️ **警告**：此規則不適合生產環境，會讓任何人都能讀寫您的資料。

## 詳細說明

完整的 Firebase 設定指南請參考：[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
