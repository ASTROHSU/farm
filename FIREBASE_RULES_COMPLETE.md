# Firebase Firestore 完整安全規則

## 問題診斷

如果規則已經設定為：
```javascript
match /artifacts/{appId}/public/data/tasks/{taskId} {
  allow read, write: if request.auth != null;
}
```

但仍然出現權限錯誤，可能是因為：

1. **集合查詢需要父文檔讀取權限**：當使用 `onSnapshot` 查詢集合時，Firestore 可能需要讀取父文檔路徑
2. **路徑匹配問題**：確保規則路徑與實際資料路徑完全匹配

## 完整規則（推薦）

使用以下完整規則，確保所有必要的路徑都有讀取權限：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允許讀寫 tasks 集合中的文檔
    match /artifacts/{appId}/public/data/tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
    
    // 允許讀取父文檔路徑，確保集合查詢可以正常工作
    // 這對於 onSnapshot 查詢很重要
    match /artifacts/{appId}/public/data {
      allow read: if request.auth != null;
    }
    
    // 可選：如果需要允許讀取更上層的路徑
    match /artifacts/{appId}/public {
      allow read: if request.auth != null;
    }
    
    // 可選：如果需要允許讀取 artifacts 集合
    match /artifacts/{appId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 簡化規則（如果上面還不行）

如果上面的規則還是不行，可以嘗試更寬鬆的規則（僅用於測試）：

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

⚠️ **注意**：`{document=**}` 是通配符，會匹配所有子路徑。這是最寬鬆的設定，適合內部協作使用。

## 檢查步驟

1. **確認 appId 值**：
   - 在瀏覽器 Console 中執行：`console.log('appId:', 'content-farm-os-default')`
   - 確認這個值與規則中的 `{appId}` 匹配

2. **檢查實際資料路徑**：
   - 前往 Firebase Console → Firestore Database
   - 查看實際建立的資料路徑
   - 確認路徑是否為：`artifacts/content-farm-os-default/public/data/tasks/{taskId}`

3. **測試規則**：
   - 在 Firebase Console → Firestore → 規則
   - 使用「規則測試器」功能
   - 測試讀寫操作

4. **檢查身份驗證**：
   - 確認匿名登入成功
   - 在 Console 中檢查 `user` 物件是否存在

## 常見問題

### Q: 為什麼需要允許讀取父文檔？

**A:** 當使用 `onSnapshot` 查詢集合時，Firestore 可能需要驗證父文檔的存在性。如果父文檔路徑沒有讀取權限，查詢可能會失敗。

### Q: 使用 `{document=**}` 安全嗎？

**A:** 如果配合 `if request.auth != null`，只有已認證的用戶（包括匿名用戶）可以讀寫。這對於內部協作工具來說是安全的，但如果您需要更細緻的權限控制，應該使用更明確的路徑規則。
