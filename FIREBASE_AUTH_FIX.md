# Firebase 認證失敗修復指南

## 錯誤訊息

如果看到「❌ Firebase 認證失敗」的錯誤，通常是因為匿名認證未啟用。

## 解決步驟

### 1. 啟用匿名認證

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案
3. 點擊左側選單的「Authentication」（身份驗證）
4. 點擊「Sign-in method」（登入方式）分頁
5. 在登入提供者列表中，找到「Anonymous」（匿名）
6. 點擊「Anonymous」
7. 切換「Enable」（啟用）開關為「開啟」
8. 點擊「Save」（儲存）

### 2. 檢查其他可能問題

#### 問題 A：API Key 無效

**錯誤代碼**：`auth/invalid-api-key`

**解決方法**：
1. 檢查環境變數 `VITE_FIREBASE_API_KEY` 是否正確設定
2. 確認 API Key 來自正確的 Firebase 專案
3. 在 Vercel 中重新設定環境變數並重新部署

#### 問題 B：網路連線問題

**錯誤代碼**：`auth/network-request-failed`

**解決方法**：
1. 檢查網路連線
2. 確認防火牆或代理設定沒有阻擋 Firebase 連線
3. 檢查瀏覽器 Console 是否有 CORS 錯誤

#### 問題 C：Firebase 專案設定問題

**檢查項目**：
1. 確認 Firebase 專案已正確建立
2. 確認 Authentication 服務已啟用
3. 檢查 Firebase 配置是否正確（apiKey, authDomain, projectId 等）

### 3. 驗證修復

1. 重新載入應用程式
2. 打開瀏覽器 Console（F12）
3. 查看是否有「✅ Firebase 初始化成功」的訊息
4. 查看是否有「Firebase Auth Error」的錯誤
5. 檢查連線狀態是否變為「✅ 雲端同步中」

## 常見錯誤代碼

| 錯誤代碼 | 原因 | 解決方法 |
|---------|------|---------|
| `auth/operation-not-allowed` | 匿名認證未啟用 | 在 Firebase Console 啟用匿名登入 |
| `auth/invalid-api-key` | API Key 無效 | 檢查環境變數設定 |
| `auth/network-request-failed` | 網路連線問題 | 檢查網路和防火牆設定 |
| `auth/app-not-authorized` | 應用程式未授權 | 檢查 Firebase 專案設定 |

## 詳細步驟截圖說明

### 啟用匿名認證

1. **進入 Authentication 頁面**
   ```
   Firebase Console → 您的專案 → Authentication → Sign-in method
   ```

2. **找到 Anonymous 提供者**
   - 在登入提供者列表中向下滾動
   - 找到「Anonymous」選項

3. **啟用匿名認證**
   - 點擊「Anonymous」
   - 切換「Enable」開關
   - 點擊「Save」

## 測試匿名認證

在 Firebase Console 中測試：

1. 前往 Authentication → Users
2. 如果匿名認證成功，應該會看到一個匿名用戶（顯示為 "Anonymous user"）
3. 用戶 ID 會以隨機字串形式顯示

## 如果仍然失敗

1. **檢查瀏覽器 Console**：
   - 打開開發者工具（F12）
   - 查看 Console 中的完整錯誤訊息
   - 複製錯誤代碼和訊息

2. **檢查 Firebase Console**：
   - 前往 Authentication → Users
   - 確認是否有匿名用戶被建立
   - 檢查是否有任何錯誤日誌

3. **檢查環境變數**：
   - 確認所有 `VITE_FIREBASE_*` 環境變數都已正確設定
   - 在 Vercel 中確認環境變數已部署

4. **重新部署**：
   - 如果修改了環境變數，需要重新部署 Vercel
   - 清除瀏覽器快取並重新載入

## 相關文件

- [Firebase Authentication 文件](https://firebase.google.com/docs/auth)
- [匿名認證文件](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - 完整的 Firebase 設定指南
