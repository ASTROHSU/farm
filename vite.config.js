import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 確保環境變數可以在客戶端使用（以 VITE_ 開頭）
  define: {
    // 環境變數會自動處理，不需要在這裡定義
  }
})
