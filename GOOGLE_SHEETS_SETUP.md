# Google Sheets 後台整合設定指南

## 概述

此功能將任務資料同步到 Google Sheets，實現協作功能：
- 您新增的任務會自動寫入 Google Sheet
- 夥伴可以隨時查看您新增的內容
- 「本週已完成」時，前端清空但後台保留所有歷史資料

## 設定步驟

### 1. 建立 Google Sheet

1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立一個新的試算表
3. 在第一行建立標題列：
   ```
   ID | 標題 | 內容 | URL | Gemini報告 | 摘要 | 狀態 | 建立時間 | 完成時間
   ```
4. 記下試算表的 ID（從網址中取得，例如：`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`）

### 2. 建立 Google Apps Script

1. 在 Google Sheet 中，點擊「擴充功能」→「Apps Script」
2. 將以下代碼貼上：

```javascript
// 設定您的試算表 ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Sheet1'; // 或您的工作表名稱

// 處理 GET 請求（讀取資料）
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // 跳過標題列，轉換為 JSON
    const headers = data[0];
    const tasks = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // 如果有 ID
        const task = {
          id: row[0],
          title: row[1] || '',
          content: row[2] || '',
          url: row[3] || '',
          geminiReport: row[4] || '',
          summary: row[5] || '',
          status: row[6] || 'inbox',
          created_at: row[7] || new Date().toISOString(),
          completed_at: row[8] || '',
          substackLink: row[9] || '',
          imageStatus: row[10] || false
        };
        tasks.push(task);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(tasks))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 處理 POST 請求（寫入/更新資料）
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    const action = data.action; // 'create', 'update', 'archive'
    
    if (action === 'create') {
      // 新增任務
      const task = data.task;
      const row = [
        task.id,
        task.title,
        task.content,
        task.url || '',
        task.geminiReport || '',
        task.summary || '',
        task.status || 'inbox',
        task.created_at || new Date().toISOString(),
        '', // completed_at
        task.substackLink || '',
        task.imageStatus || false
      ];
      sheet.appendRow(row);
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: task.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'update') {
      // 更新任務
      const task = data.task;
      const rows = sheet.getDataRange().getValues();
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] == task.id) {
          sheet.getRange(i + 1, 1, 1, 11).setValues([[
            task.id,
            task.title,
            task.content,
            task.url || '',
            task.geminiReport || '',
            task.summary || '',
            task.status || 'inbox',
            task.created_at || new Date().toISOString(),
            task.completed_at || '',
            task.substackLink || '',
            task.imageStatus || false
          ]]);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'archive') {
      // 標記所有任務為已完成（但保留資料）
      const rows = sheet.getDataRange().getValues();
      const now = new Date().toISOString();
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][6] !== 'archived') { // 如果還沒歸檔
          sheet.getRange(i + 1, 6).setValue('archived'); // 更新狀態
          sheet.getRange(i + 1, 9).setValue(now); // 更新完成時間
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **重要**：將 `YOUR_SPREADSHEET_ID_HERE` 替換為您的試算表 ID

### 3. 部署為 Web App

1. 在 Apps Script 編輯器中，點擊「部署」→「新增部署作業」
2. 選擇類型：「網頁應用程式」
3. 設定：
   - **說明**：內容農場後台 API
   - **執行身份**：我
   - **具有存取權的使用者**：所有人（或僅限您自己，視需求）
4. 點擊「部署」
5. **複製 Web App URL**（例如：`https://script.google.com/macros/s/AKfycby.../exec`）

### 4. 在前端設定

1. 在專案根目錄建立 `.env.local` 檔案（如果還沒有）
2. 加入以下環境變數：

```
VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

3. 將 `YOUR_SCRIPT_ID` 替換為您從步驟 3 取得的 Web App URL

## 功能說明

### 自動同步

- **新增任務**：自動寫入 Google Sheet
- **更新任務**：狀態變更時同步更新
- **本週已完成**：標記為 `archived` 狀態，但保留所有資料

### 資料讀取

- 應用程式載入時，會自動從 Google Sheet 讀取所有未歸檔的任務
- 已歸檔的任務不會顯示在前端，但保留在 Sheet 中

## 安全性

- Google Apps Script 的 Web App 預設需要授權
- 建議設定「具有存取權的使用者」為「僅限您自己」或特定協作者
- API Key 和 URL 都應該保密，不要提交到公開的 GitHub

## 疑難排解

1. **CORS 錯誤**：確保 Apps Script 部署時選擇「所有人」或正確的存取權限
2. **權限錯誤**：確保 Apps Script 有權限存取您的 Google Sheet
3. **資料不同步**：檢查瀏覽器控制台的錯誤訊息
