# Firebase appId 路徑問題修復

## 🔍 問題描述

發現資料被寫入到錯誤的路徑：
- **原本路徑**：`/artifacts/content-farm-os-default`
- **錯誤路徑**：`/artifacts/1:1021923560500:web:bb69bdf72a95b09dd68e61`
- **期望路徑**：`/artifacts/farm-39a95` 或 `/artifacts/content-farm-os-default`

## 🎯 問題原因

程式碼中的 `appId` 選擇邏輯可能使用了 Firebase 應用程式 ID（`1:1021923560500:web:...`）而不是專案 ID 或自定義 ID。

**重要區別：**
- **Firebase 應用程式 ID** (`1:1021923560500:web:...`)：Firebase 應用程式的唯一識別碼
- **專案 ID** (`farm-39a95`)：Firebase 專案的識別碼
- **自定義 appId**（用於 Firestore 路徑）：可以是任何值，建議使用專案 ID 或有意義的名稱

## ✅ 解決方案

### 選項 1：使用環境變數明確指定（推薦）

在 `.env.local` 或 Vercel 環境變數中設定：

```bash
VITE_FIREBASE_APP_ID=farm-39a95
```

這樣可以明確控制 Firestore 路徑，不會受到其他配置影響。

### 選項 2：恢復使用預設值

程式碼已恢復預設值為 `content-farm-os-default`，這樣可以：
- 保持與舊資料的一致性
- 避免路徑變更導致的資料分離

### 選項 3：使用專案 ID

如果沒有設定環境變數，程式碼會自動使用專案 ID (`farm-39a95`)。

## 📋 當前邏輯

```javascript
appId 優先順序：
1. 環境變數 VITE_FIREBASE_APP_ID
2. 全域變數 __app_id
3. 專案 ID (app?.options?.projectId)
4. 預設值 'content-farm-os-default'
```

## 🔧 修復步驟

### 步驟 1：選擇要使用的 appId

**選項 A：使用 `farm-39a95`（專案 ID）**
- 在環境變數中設定：`VITE_FIREBASE_APP_ID=farm-39a95`
- 或確保 Chrome 擴充功能也使用 `farm-39a95`

**選項 B：使用 `content-farm-os-default`（保持舊路徑）**
- 不需要設定環境變數
- 程式碼會使用預設值
- 資料會繼續寫入舊路徑

### 步驟 2：統一主應用程式和 Chrome 擴充功能

確保兩者使用相同的 appId：
- 主應用程式：通過環境變數或預設值
- Chrome 擴充功能：在選項頁面中設定

### 步驟 3：驗證修復

1. 重新載入主應用程式
2. 打開瀏覽器 Console（F12）
3. 應該會看到：`📌 使用的 appId (Firestore 路徑): [您的 appId]`
4. 新增一個測試任務
5. 檢查 Firestore Console，確認路徑正確

## 🐛 關於舊資料

### 舊資料位置

- `/artifacts/content-farm-os-default` - 原本的資料
- `/artifacts/1:1021923560500:web:...` - 錯誤路徑的資料（如果有的話）

### 資料遷移（可選）

如果需要統一所有資料到一個路徑：

1. **手動遷移**：
   - 在 Firestore Console 中手動複製資料
   - 從舊路徑複製到新路徑

2. **保留舊資料**：
   - 舊資料繼續保留在原路徑
   - 新資料寫入新路徑
   - 兩邊的資料不會互相影響

## 💡 建議

**推薦使用 `content-farm-os-default`**，因為：
- 與舊資料路徑一致
- 不需要遷移資料
- 避免資料分離

如果需要使用 `farm-39a95`，請：
1. 設定環境變數 `VITE_FIREBASE_APP_ID=farm-39a95`
2. 確保 Chrome 擴充功能也使用相同的值
3. 考慮是否需要遷移舊資料

## 🔍 檢查清單

- [ ] 確認要使用的 appId（`farm-39a95` 或 `content-farm-os-default`）
- [ ] 設定環境變數（如果使用 `farm-39a95`）
- [ ] 確認 Chrome 擴充功能使用相同的 appId
- [ ] 重新載入主應用程式
- [ ] 檢查 Console 中的 appId 日誌
- [ ] 測試新增任務，確認路徑正確
- [ ] 檢查 Firestore Console，確認資料寫入正確路徑
