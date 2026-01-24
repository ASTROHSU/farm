# Chrome 擴充功能故障排除指南

## 錯誤：「Could not establish connection. Receiving end does not exist.」

### 問題原因

這個錯誤表示 popup 無法與 content script 通信，通常因為：

1. **Content script 未注入**：在某些頁面上，content script 可能沒有被正確注入
2. **特殊頁面限制**：Chrome 內部頁面（`chrome://`、`chrome-extension://`）無法注入 content script
3. **Service Worker 未運行**：Background service worker 可能已停止

### 解決步驟

#### 1. 重新載入擴充功能

1. 前往 `chrome://extensions/`
2. 找到「內容農場助手」
3. 點擊重新載入圖示（圓形箭頭）
4. 確認擴充功能已啟用

#### 2. 檢查當前頁面

確保您不在以下類型的頁面上：
- `chrome://` 開頭的頁面（Chrome 內部頁面）
- `chrome-extension://` 開頭的頁面（擴充功能頁面）
- `edge://` 開頭的頁面（Edge 內部頁面）

**解決方法**：在普通網頁（如 `https://example.com`）上使用擴充功能。

#### 3. 檢查擴充功能權限

1. 前往 `chrome://extensions/`
2. 找到「內容農場助手」
3. 確認「在所有網站上」權限已授予
4. 如果沒有，點擊「詳細資料」→「網站存取權」→ 選擇「在所有網站上」

#### 4. 檢查 Console 錯誤

1. 打開擴充功能的 popup
2. 右鍵點擊 popup →「檢查」
3. 查看 Console 是否有錯誤訊息
4. 查看 Network 標籤是否有失敗的請求

#### 5. 檢查 Background Service Worker

1. 前往 `chrome://extensions/`
2. 找到「內容農場助手」
3. 點擊「Service Worker」連結（如果有）
4. 檢查 Console 是否有錯誤

#### 6. 重新安裝擴充功能

如果以上方法都不行：

1. 前往 `chrome://extensions/`
2. 移除「內容農場助手」
3. 重新載入擴充功能資料夾
4. 重新啟用擴充功能

### 常見問題

#### Q: 為什麼在某些頁面上無法使用？

**A:** Chrome 限制在以下頁面上注入 content script：
- `chrome://` 頁面（Chrome 內部頁面）
- `chrome-extension://` 頁面（擴充功能頁面）
- `edge://` 頁面（Edge 內部頁面）
- 某些受保護的網站

**解決方法**：在普通網頁上使用擴充功能。

#### Q: 如何確認 content script 是否已注入？

**A:** 
1. 打開網頁
2. 按 F12 打開開發者工具
3. 在 Console 中輸入：`chrome.runtime.sendMessage({action: 'test'})`
4. 如果沒有錯誤，表示 content script 已注入

或者檢查 Console 是否有「內容農場助手 - Content Script 已載入」的訊息。

#### Q: Service Worker 一直停止怎麼辦？

**A:** 
1. 檢查 `background.js` 是否有語法錯誤
2. 檢查 Console 是否有錯誤訊息
3. 重新載入擴充功能

### 測試步驟

1. **打開一個普通網頁**（如 `https://example.com`）
2. **點擊擴充功能圖示**
3. **點擊「擷取當前頁面」**
4. **檢查是否成功**

如果仍然失敗，請：
1. 打開 popup 的開發者工具（右鍵 → 檢查）
2. 查看 Console 中的完整錯誤訊息
3. 截圖並提供錯誤詳情

### 相關文件

- [Chrome 擴充功能開發文件](https://developer.chrome.com/docs/extensions/)
- [Content Scripts 文件](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Message Passing 文件](https://developer.chrome.com/docs/extensions/mv3/messaging/)
