# Firestore 資料結構修復指南

## 🔍 問題分析

從您的截圖發現：

1. **舊資料位置**：`tasks/{taskId}`（根層級集合）
2. **新程式碼路徑**：`artifacts/{appId}/public/data/tasks/{taskId}`
3. **手動創建的結構**：`artifacts > farm-39a95`（文檔，但為空）

## 📊 正確的 Firestore 結構

Firestore 使用集合（Collection）和文檔（Document）的層級結構：

```
artifacts (集合)
  └── farm-39a95 (文檔) ← 您已創建，但需要子集合
      └── public (子集合) ← 需要創建
          └── data (文檔) ← 需要創建
              └── tasks (子集合) ← 需要創建
                  └── {taskId} (文檔) ← 任務資料
```

## ✅ 解決方案

### 選項 1：手動創建完整結構（推薦）

在 Firestore Console 中：

1. **創建 `public` 子集合**：
   - 點擊 `artifacts > farm-39a95`
   - 點擊「+ 新增集合」
   - 集合 ID：`public`
   - 點擊「下一步」

2. **創建 `data` 文檔**：
   - 在 `public` 集合中
   - 點擊「+ 新增文件」
   - 文件 ID：`data`
   - 點擊「儲存」（可以留空，不需要欄位）

3. **創建 `tasks` 子集合**：
   - 點擊 `artifacts > farm-39a95 > public > data`
   - 點擊「+ 新增集合」
   - 集合 ID：`tasks`
   - 點擊「下一步」

完成後，結構應該是：
```
artifacts
  └── farm-39a95
      └── public
          └── data
              └── tasks (空集合，等待資料)
```

### 選項 2：簡化路徑結構（更簡單）

如果您覺得路徑太複雜，可以修改程式碼使用更簡單的路徑：

**修改前：**
```javascript
artifacts/{appId}/public/data/tasks/{taskId}
```

**修改後：**
```javascript
artifacts/{appId}/tasks/{taskId}
```

這樣只需要：
```
artifacts
  └── farm-39a95
      └── tasks (子集合)
          └── {taskId} (文檔)
```

### 選項 3：讓程式碼自動創建（最簡單）

**不需要手動創建！** Firestore 會在第一次寫入時自動創建所有必要的路徑。

只需要：
1. 確保 `artifacts > farm-39a95` 文檔存在（您已創建）
2. 在主應用程式中新增一個任務
3. Firestore 會自動創建 `public > data > tasks` 結構

## 🎯 推薦做法

**建議使用選項 3**：讓程式碼自動創建結構。

步驟：
1. ✅ 確認 `artifacts > farm-39a95` 文檔存在（您已完成）
2. 在主應用程式中新增一個測試任務
3. 檢查 Firestore Console，應該會看到完整的結構自動創建

## 📋 關於舊資料

### 舊資料位置：`tasks/{taskId}`

這些是之前使用舊路徑創建的資料。您有兩個選擇：

#### 選項 A：保留舊資料（不遷移）

- 舊資料繼續在 `tasks` 集合中
- 新資料會寫入 `artifacts/farm-39a95/public/data/tasks`
- 兩邊的資料不會互相影響

#### 選項 B：遷移舊資料到新路徑

如果需要統一，可以：
1. 在 Firestore Console 中手動複製資料
2. 或寫一個遷移腳本（如果需要大量資料）

## 🔍 驗證步驟

1. **確認結構存在**：
   - 前往 Firestore Console
   - 路徑：`artifacts > farm-39a95 > public > data > tasks`
   - 應該能看到（即使為空）

2. **測試新增任務**：
   - 在主應用程式中新增一個測試任務
   - 檢查 Firestore Console
   - 應該會在 `artifacts/farm-39a95/public/data/tasks` 中看到新任務

3. **檢查連線狀態**：
   - 主應用程式應該顯示「✅ 雲端同步中」
   - 沒有 403 錯誤

## 🐛 如果還是不行

1. **檢查 Firestore 規則**：
   - 確認規則允許寫入 `artifacts/{document=**}`
   - 確認規則已發布

2. **檢查匿名認證**：
   - 確認已啟用匿名認證

3. **查看 Console 錯誤**：
   - 打開瀏覽器 Console
   - 查看是否有 Firebase 錯誤
   - 截圖並提供錯誤訊息

## 💡 重要提示

- **文檔可以為空**：`artifacts/farm-39a95` 和 `artifacts/farm-39a95/public/data` 這兩個文檔可以完全為空，它們只是作為容器存在
- **子集合會自動創建**：當您第一次寫入 `tasks` 集合時，所有父路徑會自動創建
- **不需要預先創建**：雖然可以手動創建，但不是必須的
