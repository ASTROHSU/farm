# 圖標說明

此擴充功能需要三個尺寸的圖標：

- `icon16.png` - 16x16 像素
- `icon48.png` - 48x48 像素
- `icon128.png` - 128x128 像素

## 選項 1：使用線上工具生成圖標

1. 前往 [Favicon Generator](https://favicon.io/favicon-generator/)
2. 選擇一個表情符號或文字（例如：📚 或 CF）
3. 下載生成的圖標
4. 重新命名為對應的尺寸並放入此資料夾

## 選項 2：使用設計工具

使用 Figma、Canva 或任何圖片編輯器創建圖標：

- 建議使用簡單的設計
- 背景色：漸層紫藍色 (#667eea 到 #764ba2)
- 圖標：白色的書本或文件符號
- 導出為 PNG 格式，三個尺寸

## 選項 3：暫時禁用圖標

如果暫時不需要圖標，可以在 `manifest.json` 中：

1. 移除 `"action"` 中的 `"default_icon"` 屬性
2. 移除頂層的 `"icons"` 屬性

Chrome 會使用預設的圖標佔位符。

## 選項 4：使用表情符號作為臨時圖標

創建一個簡單的 HTML 文件來生成圖標：

```html
<!DOCTYPE html>
<html>
<body>
  <canvas id="canvas" width="128" height="128"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // 背景漸層
    const gradient = ctx.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    // 表情符號
    ctx.font = '80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📚', 64, 64);

    // 下載
    const link = document.createElement('a');
    link.download = 'icon128.png';
    link.href = canvas.toDataURL();
    link.click();
  </script>
</body>
</html>
```

將此 HTML 文件在瀏覽器中打開，然後調整尺寸為 16、48、128 分別生成三個圖標。
