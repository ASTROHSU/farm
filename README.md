# 內容農場 OS - 週報製作工具

一個專為內容創作者設計的週報製作工作流程管理系統，整合了 Gemini AI 研究、ChatGPT 文案撰寫、NotebookLM 圖表製作等功能。

## 功能特色

- 📥 **點子庫管理**：快速收集和組織內容素材
- 🤖 **AI 自動化**：整合 Gemini 3.0 Pro Deep Research 和 ChatGPT API，自動產生研究報告和文案
- 🎨 **視覺化工作流**：追蹤從點子到發布的完整流程
- 📊 **資訊圖表支援**：提供 NotebookLM 風格指南，協助製作專業圖表
- 🖼️ **圖片上傳與預覽**：支援上傳資訊圖表，自動排版 Substack 草稿預覽
- 📋 **一鍵複製功能**：快速複製完整草稿內容到 Substack
- 💾 **本地儲存**：所有資料儲存在瀏覽器本地，保護隱私

## 技術 stack

- React 18
- Vite
- Tailwind CSS
- Lucide React Icons

## 安裝與執行

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

### 3. 建置生產版本

```bash
npm run build
```

### 4. 預覽生產版本

```bash
npm run preview
```

## API Key 設定

在使用 AI 自動化功能前，請先設定 API Keys：

1. 點擊右上角的「設定」圖示
2. 填入 **Google Gemini API Key**（[取得連結](https://aistudio.google.com/app/apikey)）
3. 填入 **OpenAI API Key**（[取得連結](https://platform.openai.com/api-keys)）
4. 點擊「儲存並關閉」

**注意**：API Keys 僅儲存在瀏覽器本地，不會上傳到任何伺服器。

## 使用流程

### 步驟 1：Gemini 深度研究
- 手動複製指令與素材到 Gemini，或
- 使用 AI 自動產生報告（需要 Gemini API Key）

### 步驟 2：ChatGPT 文案撰寫
- 將 Gemini 報告轉換為精簡的摘要
- 支援手動複製或 AI 自動撰寫（需要 OpenAI API Key）

### 步驟 3：資訊圖表製作
- 使用 NotebookLM 製作資訊圖表
- 複製風格指令以確保視覺一致性

### 步驟 4：上架整合
- 上傳 NotebookLM 產出的資訊圖表
- 自動生成 Substack 草稿預覽（標題、段落、圖片排版）
- 一鍵複製完整草稿內容到 Substack
- 貼上 Substack 預覽連結
- 完成發布流程

## 版本

v4.2.0

### v4.2 新功能

- ✅ 改進 Gemini API：優先使用 Gemini 3.0 Pro，支援 Deep Research（Google Search Grounding）
- ✅ 新增圖片上傳功能：可在步驟 4 上傳資訊圖表
- ✅ Substack 草稿預覽：自動排版標題、段落和圖片，一鍵複製完整內容
- ✅ 改進任務管理：新任務自動置頂，更清晰的進度指示
- ✅ 優化 ChatGPT Prompt：自動包含 Gemini 報告上下文

## License

MIT
