#!/bin/bash
# 快速創建簡單的圖標（使用 ImageMagick 或 sips）

echo "正在生成圖標..."

# 檢查是否有 ImageMagick
if command -v convert &> /dev/null; then
    # 使用 ImageMagick 創建圖標
    convert -size 16x16 xc:"#667eea" -fill white -draw "rectangle 3,6 8,10 rectangle 8,6 13,10" icon16.png
    convert -size 48x48 xc:"#667eea" -fill white -draw "rectangle 9,18 24,30 rectangle 24,18 39,30" icon48.png
    convert -size 128x128 xc:"#667eea" -fill white -draw "rectangle 25,48 65,80 rectangle 65,48 105,80" icon128.png
    echo "✅ 圖標已生成（使用 ImageMagick）"
elif command -v sips &> /dev/null; then
    # macOS 使用 sips（需要先創建一個基礎圖片）
    echo "⚠️ 請使用瀏覽器打開 generate-icons.html 來生成圖標"
    echo "或安裝 ImageMagick: brew install imagemagick"
else
    echo "⚠️ 未找到圖片處理工具"
    echo "💡 請使用瀏覽器打開 generate-icons.html 來生成圖標"
fi
