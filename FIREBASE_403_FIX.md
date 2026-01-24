# Firebase 403 Forbidden 錯誤修復指南

## 問題診斷

看到 `403 (Forbidden)` 錯誤，表示：
- ✅ Firebase 連線正常
- ✅ 匿名認證已啟用
- ❌ **Firestore 安全規則不允許讀取/寫入**

從錯誤訊息可以看到實際路徑：
```
artifacts/farm-39a95/public/data/tasks
```

這表示 `appId` 實際上是 `farm-39a95`（您的 Firebase 專案 ID）。

## 解決步驟

### 1. 更新 Firestore 安全規則

前往 Firebase Console → Firestore Database → 規則，使用以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許讀寫 tasks 集合中的文檔
    match /artifacts/{appId}/public/data/tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // 允許讀取父文檔路徑，確保集合查詢可以正常工作
    match /artifacts/{appId}/public/data {
      allow read: if request.auth != null;
    }
    
    // 如果需要，也可以允許讀取更上層的路徑
    match /artifacts/{appId}/public {
      allow read: if request.auth != null;
    }
  }
}
```

**重要**：規則中的 `{appId}` 是通配符，會匹配任何值（包括 `farm-39a95`）。

### 2. 確認 appId 值

在瀏覽器 Console 中，您應該會看到：
```
📌 使用的 appId: farm-39a95
📌 Firebase 專案 ID: farm-39a95
```

如果顯示的是其他值，請檢查：
- 環境變數 `VITE_FIREBASE_APP_ID` 是否設定
- 是否有全域變數 `__app_id` 被設定

### 3. 發布規則並重新載入

1. 在 Firebase Console 中點擊「發布」按鈕
2. 等待規則生效（通常幾秒鐘）
3. **重新載入應用程式**：
   - 按 `F5` 或 `Ctrl+R` (Windows/Linux)
   - 按 `Cmd+R` (Mac)
   - 或點擊瀏覽器的重新整理按鈕

### 4. 驗證修復

重新載入後：
1. 打開瀏覽器 Console（F12）
2. 檢查是否還有 403 錯誤
3. 連線狀態應該會變為「✅ 雲端同步中」
4. 嘗試新增一個任務，確認可以寫入

## 如果還是不行

### 方案 A：使用通配符規則（最寬鬆）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許所有已認證用戶讀寫 artifacts 下的所有資料
    match /artifacts/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 方案 B：明確指定 appId

如果通配符還是不行，可以明確指定 `farm-39a95`：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 明確匹配您的專案 ID
    match /artifacts/farm-39a95/public/data/tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    match /artifacts/farm-39a95/public/data {
      allow read: if request.auth != null;
    }
  }
}
```

## 如何重新載入應用程式

### 方法 1：鍵盤快捷鍵
- **Windows/Linux**: 按 `F5` 或 `Ctrl + R`
- **Mac**: 按 `Cmd + R`

### 方法 2：瀏覽器按鈕
- 點擊瀏覽器地址欄旁邊的重新整理按鈕（圓形箭頭圖示）

### 方法 3：強制重新載入（清除快取）
- **Windows/Linux**: 按 `Ctrl + Shift + R` 或 `Ctrl + F5`
- **Mac**: 按 `Cmd + Shift + R`

### 方法 4：開發者工具
1. 打開開發者工具（F12）
2. 右鍵點擊重新整理按鈕
3. 選擇「清空快取並強制重新載入」

## 檢查清單

- [ ] Firestore 安全規則已更新
- [ ] 規則已發布（不是草稿）
- [ ] 匿名認證已啟用
- [ ] 應用程式已重新載入
- [ ] 瀏覽器 Console 沒有 403 錯誤
- [ ] 連線狀態顯示「✅ 雲端同步中」

## 相關文件

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - 完整的 Firebase 設定指南
- [FIREBASE_PERMISSION_FIX.md](./FIREBASE_PERMISSION_FIX.md) - 權限問題修復
- [FIREBASE_RULES_COMPLETE.md](./FIREBASE_RULES_COMPLETE.md) - 完整規則說明
