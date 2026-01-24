# Firebase 配置快速修復

## 🎯 問題總結

從您的截圖發現：
1. **appId 不一致**：主應用程式使用 `content-farm-os-default`，Chrome 擴充功能使用 `farm-39a95`
2. **Firestore 路徑不匹配**：導致資料無法共享

## ✅ 解決方案

### 選項 1：統一使用 `farm-39a95`（推薦）

**優點：**
- 與專案 ID 一致，容易記憶
- 已更新程式碼預設值為 `farm-39a95`

**步驟：**
1. ✅ 程式碼已更新（預設值改為 `farm-39a95`）
2. 確認 Chrome 擴充功能設定為 `farm-39a95`
3. 重新載入主應用程式
4. 測試新增任務

### 選項 2：統一使用 `content-farm-os-default`

**步驟：**
1. 在 Chrome 擴充功能設定中，將 App ID 改為 `content-farm-os-default`
2. 或在主應用程式的環境變數中設定：`VITE_FIREBASE_APP_ID=content-farm-os-default`

## 📋 檢查清單

- [ ] 主應用程式和 Chrome 擴充功能使用相同的 appId
- [ ] 重新載入主應用程式
- [ ] 重新載入 Chrome 擴充功能
- [ ] 在主應用程式中新增測試任務
- [ ] 檢查 Firestore Console 是否出現資料
- [ ] 檢查連線狀態是否為「✅ 雲端同步中」

## 🔍 驗證步驟

1. **檢查主應用程式的 appId**：
   - 打開瀏覽器 Console（F12）
   - 應該會看到：`📌 使用的 appId: farm-39a95`

2. **檢查 Chrome 擴充功能的 appId**：
   - 打開擴充功能選項頁面
   - 確認 App ID 欄位顯示：`farm-39a95`

3. **測試資料同步**：
   - 在主應用程式中新增一個任務
   - 前往 Firestore Console
   - 路徑應該是：`artifacts > farm-39a95 > public > data > tasks`
   - 應該能看到新建立的任務

## 🐛 如果還是不行

1. **清除瀏覽器快取**：
   - 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
   - 清除快取和 Cookie

2. **檢查 Firestore 規則**：
   - 確認規則已發布（不是草稿）
   - 確認規則允許匿名用戶讀寫

3. **檢查匿名認證**：
   - 確認 Firebase Console → Authentication → Sign-in method → 匿名 已啟用

4. **查看 Console 錯誤**：
   - 打開瀏覽器 Console
   - 查看是否有 Firebase 相關錯誤
   - 截圖並提供錯誤訊息
