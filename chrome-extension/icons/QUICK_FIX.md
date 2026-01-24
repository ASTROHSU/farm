# 快速修復：生成圖標

## 方法 1：使用瀏覽器生成（最簡單）

1. 在瀏覽器中打開 `generate-icons.html`
2. 點擊「全部下載」按鈕
3. 將下載的三個 PNG 檔案放入 `chrome-extension/icons/` 資料夾
4. 確保檔案名稱正確：`icon16.png`, `icon48.png`, `icon128.png`

## 方法 2：使用 Python（需要 Pillow）

```bash
cd chrome-extension/icons
pip install Pillow
python3 generate-icons.py
```

## 方法 3：手動創建簡單圖標

如果以上方法都不行，可以暫時使用純色圖標：

1. 創建三個純色圖片（16x16, 48x48, 128x128）
2. 使用任何圖片編輯器（如 Preview、GIMP、Photoshop）
3. 填充顏色：#667eea（紫藍色）
4. 另存為 PNG 格式

## 方法 4：暫時移除圖標要求

如果暫時無法生成圖標，可以修改 `manifest.json`：

1. 打開 `chrome-extension/manifest.json`
2. 暫時註解掉圖標相關的設定
3. Chrome 會使用預設的擴充功能圖標
