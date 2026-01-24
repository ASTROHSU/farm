# Firebase Firestore 安全規則 - 最終版本

## 問題確認

從您的截圖可以看到：
- **專案 ID**: `farm-39a95`
- **App ID**: `farm-39a95`
- **資料路徑**: `artifacts/farm-39a95/public/data/tasks`
- **錯誤**: `403 Forbidden`

這表示 Firestore 安全規則不允許讀取該路徑。

## 解決方案：更新 Firestore 安全規則

### 步驟 1：前往 Firebase Console

1. 打開 [Firebase Console](https://console.firebase.google.com/)
2. 選擇專案 `farm-39a95`
3. 點擊左側選單的「Firestore Database」
4. 點擊「規則」分頁

### 步驟 2：複製並貼上以下規則

**重要**：完全替換現有的規則內容：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許已認證用戶（包括匿名用戶）讀寫 artifacts 下的所有資料
    // 使用通配符匹配所有子路徑
    match /artifacts/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 步驟 3：發布規則

1. 點擊「發布」按鈕
2. 等待規則生效（通常幾秒鐘內）

### 步驟 4：驗證修復

1. **重新載入 Chrome 擴充功能**：
   - 前往 `chrome://extensions/`
   - 找到「內容農場助手」
   - 點擊重新載入圖示（圓形箭頭）

2. **重新測試連線**：
   - 打開擴充功能選項頁面
   - 點擊「測試連線」按鈕
   - 應該會看到「✅ 連線成功！」

3. **檢查主應用程式**：
   - 打開主應用程式（React 應用）
   - 檢查連線狀態是否變為「✅ 雲端同步中」
   - 嘗試新增一個任務，確認可以寫入

## 規則說明

### 為什麼使用 `{document=**}`？

`{document=**}` 是 Firestore 的通配符，會匹配所有子路徑，包括：
- `artifacts/farm-39a95/public/data/tasks/{taskId}`
- `artifacts/farm-39a95/public/data`
- `artifacts/farm-39a95/public`
- `artifacts/farm-39a95`

這確保了：
1. 可以讀取集合（需要父路徑權限）
2. 可以讀寫文檔
3. 無論 `appId` 是什麼值都能正常工作

### 為什麼需要 `request.auth != null`？

這確保只有已認證的用戶（包括匿名用戶）可以讀寫。這對於：
- 保護資料不被未授權訪問
- 允許匿名用戶協作
- 符合 Firebase 最佳實踐

## 如果還是不行

### 檢查清單

- [ ] 規則已完全替換（不是追加）
- [ ] 規則已發布（不是草稿狀態）
- [ ] 匿名認證已啟用（Firebase Console → Authentication → Sign-in method）
- [ ] Chrome 擴充功能已重新載入
- [ ] 主應用程式已重新載入
- [ ] 瀏覽器 Console 沒有 403 錯誤

### 臨時測試規則（僅用於診斷）

如果上述規則還是不行，可以暫時使用最寬鬆的規則來測試：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ⚠️ 警告：此規則允許所有人讀寫，僅用於測試
    match /artifacts/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**重要**：如果這個規則可以工作，表示問題是認證相關的。請檢查：
1. 匿名認證是否已啟用
2. 應用程式是否正確進行匿名登入

測試完成後，請改回使用 `if request.auth != null` 的規則。

## 關於測試連線的 403 錯誤

Chrome 擴充功能的「測試連線」功能使用 REST API 直接測試，**不會包含認證 token**，所以會出現 403 錯誤。這是正常的。

**真正的測試**應該在主應用程式中進行，因為主應用程式會：
1. 進行匿名認證
2. 使用 Firebase SDK（包含認證 token）
3. 正確讀寫資料

## 相關文件

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - 完整的 Firebase 設定指南
- [FIREBASE_403_FIX.md](./FIREBASE_403_FIX.md) - 403 錯誤修復指南
- [FIREBASE_PERMISSION_FIX.md](./FIREBASE_PERMISSION_FIX.md) - 權限問題修復
