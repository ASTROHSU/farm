#!/usr/bin/env python3
"""
生成 Chrome 擴充功能所需的圖標
需要安裝 Pillow: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw
    import os

    def generate_icon(size):
        """生成指定尺寸的圖標"""
        # 創建新圖片，RGBA 模式支援透明
        img = Image.new('RGB', (size, size), color='#667eea')
        draw = ImageDraw.Draw(img)
        
        # 繪製漸層背景（簡單版本：使用兩個顏色）
        # 從左上到右下的漸層效果
        for i in range(size):
            # 計算漸層顏色
            ratio = i / size
            r1, g1, b1 = 0x66, 0x7e, 0xea  # #667eea
            r2, g2, b2 = 0x76, 0x4b, 0xa2  # #764ba2
            r = int(r1 + (r2 - r1) * ratio)
            g = int(g1 + (g2 - g1) * ratio)
            b = int(b1 + (b2 - b1) * ratio)
            color = (r, g, b)
            draw.line([(i, 0), (i, size)], fill=color)
        
        # 繪製書本圖標（兩個重疊的矩形）
        book_width = int(size * 0.6)
        book_height = int(size * 0.4)
        x = (size - book_width) // 2
        y = (size - book_height) // 2
        
        # 左頁
        draw.rectangle([x, y, x + book_width // 2, y + book_height], fill='white')
        # 右頁
        draw.rectangle([x + book_width // 2, y, x + book_width, y + book_height], fill='white')
        # 書脊線
        draw.line([(x + book_width // 2, y), (x + book_width // 2, y + book_height)], 
                  fill='#667eea', width=max(1, size // 32))
        
        return img

    # 生成三個尺寸的圖標
    sizes = [16, 48, 128]
    
    for size in sizes:
        icon = generate_icon(size)
        filename = f'icon{size}.png'
        icon.save(filename, 'PNG')
        print(f'✅ 已生成 {filename} ({size}x{size})')
    
    print('\n🎉 所有圖標已生成完成！')

except ImportError:
    print('❌ 需要安裝 Pillow 套件')
    print('💡 請執行: pip install Pillow')
    print('\n或者使用瀏覽器打開 generate-icons.html 來生成圖標')
