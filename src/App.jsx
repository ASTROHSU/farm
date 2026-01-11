import React, { useState, useEffect, useRef } from 'react';
import { Plus, Copy, Check, ArrowRight, FileText, Image as ImageIcon, Share, Trash2, ExternalLink, Settings, X, AlignLeft, Archive, AlertTriangle, ClipboardPaste, Sparkles, Loader2, Key, LayoutTemplate } from 'lucide-react';

// --- 配置與 Prompt 資料庫 ---
const PROMPTS = {
  // 修改：還原為原始的研究指令
  gemini: `請你替我研究這個主題並以繁體中文製作報告，內容包含目前的發展進度是什麼、為什麼會發生這件事（為什麼會做這個決定），以及這件事會對未來產生什麼影響？還有，我也想知道網路上有哪些人對這起事件有哪些正面和反面的論點？他們說了什麼、為什麼這樣說？`,
  
  chatgpt_role: `# Role
你是一位極簡主義的新聞通訊社編輯（如 Reuters 或 AP 風格）。你的任務是將報告以更像是台灣人寫的內容，濃縮為「高密度的純文字摘要」。

# Rules
1. **純段落呈現**：禁止使用條列式。
2. **事實優先**：每一句話都必須包含具體的資訊點（Who, What, When, Where, Why, How much）。
3. **客觀中立**：移除所有情緒修飾詞，僅保留事實描述。

# Structure
請撰寫一個清晰的標題，接著用 **2 個段落** 完成摘要：
1. **第一段**：概述事件發生的主體與核心衝突。
2. **第二段**：提供支持該事件的關鍵數據、證據或具體處置結果。`,

  notebooklm_style: `統一色票 (Color Palette)： 背景底色： 使用 乾淨的米白色 (Cream / Off-White, #F9F9F7) 或 極淺灰 (Light Grey)，取代原本各自不同的深黑或亮橘背景，確保閱讀舒適度。 主色調 (Primary)： 使用 專業深海藍 (Deep Navy Blue, #1A365D) 用於標題與主要圖標，展現權威感。 強調色 (Accent)： 使用 活力珊瑚紅 (Coral Red) 或 亮眼金 (Muted Gold) 用來標示數據重點（如「700萬美元」、「20.2億」），要在米色背景上能跳出來。 插畫風格 (Illustration Style)： 扁平化向量 (Flat Vector)： 去除過於立體、陰影過重的 3D 效果。 線條風格 (Line Art)： 圖示請使用簡潔的粗線條勾勒（類似「以太坊安全革命」那張圖的風格），給人一種冷靜、分析的感覺。 人物與物件： 簡化人物細節，使用抽象或幾何圖形代表駭客或用戶，避免過於卡通化。 版面配置 (Layout)： 卡片式設計 (Card Design)： 將每個資訊點（Point）放在微圓角的矩形框線中，讓資訊模組化。 字體層級： 標題要是粗體無襯線字（Sans-serif），內文清晰易讀。`
};

// --- 組件 ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

// 修改 Button 組件以支援暫時性文字變化 (Copied feedback)
const Button = ({ onClick, children, variant = "primary", className = "", icon: Icon, disabled = false, loading = false }) => {
  const [feedback, setFeedback] = useState(null);
  
  const handleClick = async (e) => {
    // 攔截 onClick 來處理複製回饋，如果 onClick 回傳 "copied"，則顯示回饋
    const result = await onClick(e);
    if (result === 'copied') {
      setFeedback('已複製！');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#1A365D] text-white hover:bg-[#152c4d]",
    secondary: "bg-white text-[#1A365D] border border-[#1A365D] hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    ghost: "text-slate-500 hover:bg-slate-100",
    warning: "bg-orange-500 text-white hover:bg-orange-600",
    magic: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-md",
  };

  return (
    <button onClick={handleClick} disabled={disabled || loading} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : (Icon && !feedback && <Icon size={16} className="mr-2 flex-shrink-0" />)}
      <span className="truncate">{feedback || children}</span>
    </button>
  );
};

// --- API Service ---

// Gemini API 暫時停用，保留函式結構但移除呼叫
// const callGeminiAPI = async (apiKey, prompt, content) => { ... }

const callOpenAIAPI = async (apiKey, systemPrompt, userContent) => {
  const userMessage = `請根據以下「Gemini 研究報告」內容進行撰寫：\n\n「\n${userContent}\n」`;
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

// --- Utility: Confetti Effect ---
const triggerConfetti = () => {
  const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
  const confettiCount = 150;
  
  for (let i = 0; i < confettiCount; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.width = '10px';
    el.style.height = '10px';
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.zIndex = '9999';
    el.style.pointerEvents = 'none';
    el.style.borderRadius = '2px';
    
    // Random physics
    const angle = Math.random() * Math.PI * 2;
    const velocity = 8 + Math.random() * 12;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;
    
    document.body.appendChild(el);

    let x = 0;
    let y = 0;
    let currentDx = dx;
    let currentDy = dy;
    let rotation = Math.random() * 360;
    
    const animate = () => {
      x += currentDx;
      y += currentDy;
      currentDy += 0.5; // Gravity
      rotation += 10;
      
      el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg)`;
      el.style.opacity = 1 - (Math.abs(y) / (window.innerHeight / 1.2));
      
      if (y < window.innerHeight && el.style.opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        el.remove();
      }
    };
    
    animate();
  }
};

// --- 主應用程式 ---

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('content-farm-tasks');
      return saved ? JSON.parse(saved) : [
        { id: 1, title: '範例：SEC 起訴 Coinbase', status: 'inbox', url: 'https://example.com', content: '這裡是一段範例的原始文字內容...', geminiReport: '', summary: '', substackLink: '', created_at: new Date().toISOString() },
      ];
    } catch (e) {
      return [];
    }
  });

  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('content-farm-api-keys');
      // 移除 gemini key 預設值
      return saved ? JSON.parse(saved) : { openai: '' };
    } catch (e) {
      return { openai: '' };
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null });
  
  const [isGeneratingGPT, setIsGeneratingGPT] = useState(false);

  const substackPreviewRef = useRef(null);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  useEffect(() => {
    localStorage.setItem('content-farm-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('content-farm-api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // 新增：設定網頁標題與 Favicon
  useEffect(() => {
    // 1. 設定標題
    document.title = "內容農場｜週報製作 SOP";

    // 2. 動態設定 Favicon (使用 Robot Emoji)
    const setFavicon = () => {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      // 使用 SVG data URI 作為 favicon，兼容性好且不需要外部圖片資源
      link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>`;
    };
    setFavicon();
  }, []);

  const addTask = (rawContent) => {
    if (!rawContent.trim()) return;

    const firstLine = rawContent.trim().split('\n')[0];
    const title = firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine;
    const urlMatch = rawContent.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : '';

    const newTask = {
      id: Date.now(),
      title,
      url,
      content: rawContent,
      geminiReport: '', 
      summary: '',
      status: 'inbox',
      created_at: new Date().toISOString(),
      imageStatus: false,
      substackLink: ''
    };
    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
  };

  const updateTask = (id, updates) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteRequest = (id) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      id: id
    });
  };

  const handleArchiveRequest = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'archive',
      id: null
    });
  };

  const confirmAction = () => {
    if (confirmDialog.type === 'delete') {
      setTasks(prev => prev.filter(t => t.id !== confirmDialog.id));
      if (activeTaskId === confirmDialog.id) setActiveTaskId(null);
    } else if (confirmDialog.type === 'archive') {
      setTasks([]); 
      setActiveTaskId(null);
    }
    setConfirmDialog({ isOpen: false, type: '', id: null });
  };

  const handleCopySubstackDraft = () => {
    if (substackPreviewRef.current) {
      const range = document.createRange();
      range.selectNode(substackPreviewRef.current);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      try {
        document.execCommand('copy');
        
        // 觸發彩帶特效
        triggerConfetti();

        // 標記完成並關閉視窗 (狀態改為 'published'，對應 '已處理')
        updateTask(activeTask.id, { status: 'published' });
        
        // 延遲一點點再關閉，讓使用者看到按鈕反應
        setTimeout(() => {
          setActiveTaskId(null);
        }, 500);
        
        return 'copied';
      } catch (err) {
        alert("複製失敗，請手動選取內容複製。");
      }
      window.getSelection().removeAllRanges();
    }
  };

  const handleChatGPTGenerate = async () => {
    if (!apiKeys.openai) {
      alert("請先點擊右上角「設定」，填入 OpenAI API Key。");
      return;
    }
    setIsGeneratingGPT(true);
    try {
      const result = await callOpenAIAPI(apiKeys.openai, PROMPTS.chatgpt_role, activeTask.geminiReport);
      updateTask(activeTask.id, { summary: result });
    } catch (error) {
      alert(`發生錯誤：${error.message}`);
    } finally {
      setIsGeneratingGPT(false);
    }
  };

  const parseSummary = (text) => {
    if (!text) return { title: '', p1: '', p2: '' };
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const title = lines[0] || '';
    let p1 = '';
    let p2 = '';
    const remaining = lines.slice(1);
    if (remaining.length > 0) p1 = remaining[0];
    if (remaining.length > 1) p2 = remaining.slice(1).join('\n\n');
    return { title, p1, p2 };
  };

  const renderMarkdownText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold markers
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderWizard = () => {
    if (!activeTask) return null;

    const secureCopy = (text) => {
      const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      };

      if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return 'copied';
      }
      navigator.clipboard.writeText(text).catch(err => {
        fallbackCopyTextToClipboard(text);
      });
      return 'copied';
    };

    const copyGeminiPrompt = (prompt, content) => {
      let fullText = prompt;
      if (content) fullText += `\n\n\n${content}`;
      const result = secureCopy(fullText);
      if (result === 'copied') {
        window.open('https://gemini.google.com/app', '_blank');
      }
      return result;
    };

    const copyChatGPTPrompt = (rolePrompt, report) => {
      let fullText = rolePrompt;
      if (report) {
        fullText += `\n\n請根據以下「Gemini 研究報告」內容進行撰寫：\n\n「\n${report}\n」`;
      }
      return secureCopy(fullText);
    };

    const copyToClipboard = (text, openUrl = null) => {
      const result = secureCopy(text);
      if (result === 'copied' && openUrl) {
        window.open(openUrl, '_blank');
      }
      return result;
    };

    const summaryParts = parseSummary(activeTask.summary);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4 backdrop-blur-sm">
        <div className="bg-[#F9F9F7] w-full max-w-4xl h-[95vh] sm:h-[90vh] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
          
          <div className="bg-[#1A365D] text-white p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex-1 min-w-0 mr-4">
              <h2 className="text-lg sm:text-xl font-bold truncate">{activeTask.title}</h2>
              <div className="flex items-center text-blue-200 text-xs sm:text-sm mt-1 space-x-3">
                <span className="flex items-center truncate opacity-70">
                  <AlignLeft size={12} className="mr-1 flex-shrink-0" />
                  <span className="truncate">素材已載入</span>
                </span>
              </div>
            </div>
            <button onClick={() => setActiveTaskId(null)} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-20 sm:pb-6">
            
            {/* 針對已處理的任務，直接顯示最終成果在最上方 */}
            {activeTask.status === 'published' && (
              <div className="mb-8 border-b border-gray-200 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-green-700 flex items-center">
                    <Sparkles className="mr-2" /> 🎉 最終成果 (Draft Preview)
                  </h3>
                  <Button 
                    onClick={handleCopySubstackDraft} 
                    icon={Copy} 
                    variant="magic" 
                    className="text-xs py-1 px-3 h-8"
                  >
                    再次複製草稿
                  </Button>
                </div>
                <div 
                  ref={substackPreviewRef}
                  className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm text-gray-800 leading-relaxed font-serif"
                >
                  <h1 className="text-2xl font-bold mb-4 text-black border-b pb-2">
                    {renderMarkdownText(summaryParts.title || activeTask.title)}
                  </h1>
                  
                  <p className="mb-6 text-lg whitespace-pre-line">
                    {renderMarkdownText(summaryParts.p1 || "無摘要內容")}
                  </p>
                  
                  <p className="mb-6 text-lg whitespace-pre-line">
                    {renderMarkdownText(summaryParts.p2)}
                  </p>
                  
                  {activeTask.url && (
                    <div className="text-sm text-gray-500 mt-8 pt-4 border-t">
                      資料來源：<a href={activeTask.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">原始新聞連結</a>
                    </div>
                  )}
                </div>
              </div>
            )}

            <section className={`transition-all duration-300 ${activeTask.status === 'inbox' ? 'opacity-100 scale-100' : 'opacity-50 grayscale'}`}>
              <div className="flex items-center mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base ${activeTask.status === 'inbox' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}>1</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Gemini 深度研究</h3>
              </div>
              <Card className={`p-4 bg-white transition-all ${activeTask.status === 'inbox' ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
                <p className="text-sm text-gray-500 mb-2">選項 A：手動複製指令與素材（前往 Gemini 網頁）</p>
                <div className="mb-3 p-3 border-l-4 border-blue-200 bg-slate-50 text-xs text-gray-600">
                  <div className="font-bold mb-1 text-slate-500">素材預覽：</div>
                  <div className="line-clamp-3 italic text-slate-700">
                    {activeTask.content}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-4">
                  <Button onClick={() => copyGeminiPrompt(PROMPTS.gemini, activeTask.content)} icon={Copy} variant="secondary" className="w-full">
                    複製指令並開啟 Gemini
                  </Button>
                  
                  {/* AI 自動產生按鈕已隱藏 */}
                </div>

                {activeTask.geminiReport && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-in fade-in duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-sm font-bold text-green-800">
                        <Check size={16} className="mr-1" /> 報告已填入
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => copyToClipboard(activeTask.geminiReport)}
                        className="h-8 text-xs bg-white border border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Copy size={12} className="mr-1"/> 複製內容
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600 bg-white p-2 rounded border border-green-100 h-24 overflow-y-auto">
                      {activeTask.geminiReport}
                    </div>
                  </div>
                )}
                
                {activeTask.status === 'inbox' && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => updateTask(activeTask.id, { status: 'processing' })} icon={ArrowRight}>
                      下一步：ChatGPT 文案
                    </Button>
                  </div>
                )}
              </Card>
            </section>

            <section className={`transition-all duration-300 ${activeTask.status === 'processing' ? 'opacity-100 scale-100' : (activeTask.status === 'inbox' ? 'opacity-30 pointer-events-none' : 'opacity-50 grayscale')}`}>
              <div className="flex items-center mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base ${activeTask.status === 'processing' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}>2</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">ChatGPT 文案</h3>
              </div>
              <Card className={`p-4 bg-white transition-all ${activeTask.status === 'processing' ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
                
                <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center mb-2 text-purple-800 font-bold text-sm">
                    <ClipboardPaste size={16} className="mr-2" />
                    第一步：Gemini 研究報告 (手動貼上)
                  </div>
                  <textarea 
                    className="w-full border rounded p-3 text-base sm:text-sm h-32 focus:ring-2 focus:ring-purple-500 outline-none" 
                    placeholder="請在此貼上您從 Gemini 獲得的研究報告..."
                    value={activeTask.geminiReport || ''}
                    onChange={(e) => updateTask(activeTask.id, { geminiReport: e.target.value })}
                  />
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <Button 
                       onClick={() => copyChatGPTPrompt(PROMPTS.chatgpt_role, activeTask.geminiReport)} 
                       icon={Copy} 
                       variant="secondary" 
                       className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                       disabled={!activeTask.geminiReport}
                     >
                      手動複製指令
                    </Button>
                    <Button 
                      onClick={handleChatGPTGenerate} 
                      icon={Sparkles} 
                      variant="magic" 
                      className="w-full"
                      loading={isGeneratingGPT}
                      disabled={!activeTask.geminiReport}
                    >
                      AI 自動撰寫文案
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2 font-bold">第三步：最終摘要 (AI 自動填入或手動貼上)</p>
                  <textarea 
                    className="w-full border rounded p-3 text-base sm:text-sm h-32 focus:ring-2 focus:ring-purple-500 outline-none resize-none" 
                    placeholder="最終產出的標題與摘要會顯示在這裡..."
                    value={activeTask.summary}
                    onChange={(e) => updateTask(activeTask.id, { summary: e.target.value })}
                  />
                </div>

                 {activeTask.status === 'processing' && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                      onClick={() => updateTask(activeTask.id, { status: 'visuals' })} 
                      icon={ArrowRight}
                      disabled={!activeTask.summary}
                    >
                      下一步：製作圖表
                    </Button>
                  </div>
                )}
              </Card>
            </section>

            <section className={`transition-all duration-300 ${activeTask.status === 'visuals' ? 'opacity-100 scale-100' : (['inbox', 'processing'].includes(activeTask.status) ? 'opacity-30 pointer-events-none' : 'opacity-50 grayscale')}`}>
              <div className="flex items-center mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base ${activeTask.status === 'visuals' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}>3</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">資訊圖表</h3>
              </div>
              <Card className={`p-4 bg-white transition-all ${activeTask.status === 'visuals' ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
                <div className="mb-4 space-y-3">
                  <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle size={14} className="mr-2" />
                    注意：NotebookLM 與製圖目前無法自動化，請手動操作。
                  </div>
                  <p className="text-sm text-gray-500 font-bold">1. 準備製圖素材 (Gemini 報告)：</p>
                  <Button 
                    onClick={() => copyToClipboard(activeTask.geminiReport || '無報告內容', 'https://notebooklm.google.com/')} 
                    icon={Copy} 
                    variant="secondary" 
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    disabled={!activeTask.geminiReport}
                  >
                    複製報告並開啟 NotebookLM
                  </Button>
                  
                  <p className="text-sm text-gray-500 font-bold pt-2">2. 設定 NotebookLM 與複製風格：</p>
                  <div className="bg-slate-50 p-2 text-xs text-slate-600 rounded mb-2">
                    請選擇：<span className="font-bold text-slate-800">資訊圖表 {'->'} 精簡 {'->'} 橫式</span>
                  </div>
                  <Button onClick={() => copyToClipboard(PROMPTS.notebooklm_style)} icon={Copy} variant="secondary" className="w-full">
                    複製風格指令 (Style Guide)
                  </Button>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => updateTask(activeTask.id, { imageStatus: !activeTask.imageStatus })}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${activeTask.imageStatus ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                    {activeTask.imageStatus && <Check size={14} className="text-white" />}
                  </div>
                  <label className="text-sm font-medium cursor-pointer flex-1 select-none">圖表已製作並下載</label>
                </div>

                {activeTask.status === 'visuals' && (
                  <div className="mt-4 flex justify-end">
                    <Button 
                       onClick={() => updateTask(activeTask.id, { status: 'review' })} 
                       icon={ArrowRight}
                       disabled={!activeTask.imageStatus}
                    >
                      下一步：上架整合
                    </Button>
                  </div>
                )}
              </Card>
            </section>

             <section className={`transition-all duration-300 ${activeTask.status === 'review' ? 'opacity-100 scale-100' : (activeTask.status === 'published' ? 'opacity-50 grayscale' : 'opacity-30 pointer-events-none')}`}>
              <div className="flex items-center mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm sm:text-base ${activeTask.status === 'review' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-800'}`}>4</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">上架整合 (Substack)</h3>
              </div>
              <Card className={`p-4 bg-white border-orange-200 bg-orange-50 transition-all ${activeTask.status === 'review' ? 'ring-2 ring-orange-400 shadow-lg' : ''}`}>
                
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center">
                      <LayoutTemplate size={16} className="mr-2"/> 草稿預覽 (自動排版)
                    </label>
                  </div>
                  
                  <div 
                    ref={substackPreviewRef}
                    className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm text-gray-800 leading-relaxed font-serif"
                    style={{ minHeight: '300px' }}
                  >
                    <h1 className="text-2xl font-bold mb-4 text-black border-b pb-2">
                      {renderMarkdownText(summaryParts.title || activeTask.title)}
                    </h1>
                    
                    <p className="mb-6 text-lg whitespace-pre-line">
                      {renderMarkdownText(summaryParts.p1 || "等待摘要生成...")}
                    </p>
                    
                    <p className="mb-6 text-lg whitespace-pre-line">
                      {renderMarkdownText(summaryParts.p2)}
                    </p>
                    
                    {activeTask.url && (
                      <div className="text-sm text-gray-500 mt-8 pt-4 border-t">
                        資料來源：<a href={activeTask.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">原始新聞連結</a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-orange-200 pt-4 mt-4">
                   {activeTask.status === 'review' && (
                    <div className="flex justify-center">
                      <Button 
                         onClick={handleCopySubstackDraft} 
                         icon={Sparkles} 
                         variant="magic"
                         className="w-full py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                         disabled={!activeTask.summary}
                      >
                        ✨ 複製草稿並完成任務
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </section>

          </div>
        </div>
      </div>
    );
  };

  const renderSettingsModal = () => {
    if (!isSettingsOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center text-slate-800">
              <Settings className="mr-2" size={24} /> 系統設定 (API)
            </h3>
            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
              填入 API Key 後，系統將啟用「✨ AI 自動產生」功能。
              <br/>Key 僅儲存在您的瀏覽器中，不會上傳伺服器。
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">OpenAI API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                  type="password"
                  className="w-full border rounded pl-10 p-2 text-base sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="sk-..."
                  value={apiKeys.openai}
                  onChange={(e) => setApiKeys({...apiKeys, openai: e.target.value})}
                />
              </div>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block text-right">
                取得 OpenAI API Key
              </a>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={() => setIsSettingsOpen(false)}>儲存並關閉</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmDialog = () => {
    if (!confirmDialog.isOpen) return null;

    const isArchive = confirmDialog.type === 'archive';

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full transform scale-100 transition-all">
          <div className="flex items-center text-amber-600 mb-4">
            <AlertTriangle size={24} className="mr-3" />
            <h3 className="text-lg font-bold">{isArchive ? '確定本週已完成？' : '確定要刪除？'}</h3>
          </div>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {isArchive 
              ? '這將會「清空」看板上的所有卡片，代表本週工作已全數完成。此動作無法復原。'
              : '確定要刪除這張卡片嗎？此動作無法復原。'}
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setConfirmDialog({ isOpen: false, type: '', id: null })}>
              取消
            </Button>
            <Button variant="danger" onClick={confirmAction}>
              {isArchive ? '確認完成 (清空)' : '刪除'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const columns = [
    { id: 'inbox', title: '待處理', color: 'bg-gray-100' },
    { id: 'processing', title: '🤖 研究撰寫', color: 'bg-blue-50' },
    { id: 'visuals', title: '🎨 製圖中', color: 'bg-purple-50' },
    { id: 'review', title: '🚀 準備發布', color: 'bg-orange-50' },
    { id: 'published', title: '✅ 已處理', color: 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-slate-800 font-sans pb-10">
      {/* Navbar */}
      <header className="bg-[#1A365D] text-white p-3 sm:p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText size={20} className="sm:w-6 sm:h-6" />
            <h1 className="text-lg sm:text-xl font-bold tracking-wide">內容農場｜週報製作 SOP</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsSettingsOpen(true)}
              className="text-white hover:bg-white/10"
            >
              <Settings size={18} />
            </Button>
            <Button 
              variant="warning" 
              onClick={handleArchiveRequest}
              icon={Archive} 
              className="text-xs sm:text-sm px-3 py-1.5 shadow-lg"
            >
              <span className="hidden sm:inline">本週已完成</span>
              <span className="sm:hidden">完成</span>
            </Button>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)} icon={Plus} className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
              新增
            </Button>
          </div>
        </div>
      </header>

      {/* Main Board */}
      <main className="max-w-[1600px] mx-auto p-3 sm:p-6">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 md:overflow-x-auto pb-4">
          {columns.map(col => (
            <div key={col.id} className={`flex-1 rounded-xl p-3 sm:p-4 ${col.color} min-w-full md:min-w-[300px] md:flex-shrink-0 transition-all`}>
              <h3 className="font-bold text-slate-700 mb-3 sm:mb-4 flex items-center justify-between">
                {col.title}
                <span className="bg-white/50 px-2 py-1 rounded text-xs font-mono">
                  {tasks.filter(t => t.status === col.id).length}
                </span>
              </h3>
              
              <div className="space-y-3">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <Card key={task.id} className="p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer group relative active:scale-[0.99] touch-manipulation hover:-translate-y-1">
                    <div onClick={() => setActiveTaskId(task.id)}>
                      <div className="flex justify-between items-start mb-2">
                        <Badge color={
                          task.status === 'inbox' ? 'gray' : 
                          task.status === 'review' ? 'yellow' : 'blue'
                        }>
                          {new Date(task.created_at).toLocaleDateString()}
                        </Badge>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteRequest(task.id); }}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h4 className="font-bold text-gray-800 mb-2 leading-tight text-sm sm:text-base line-clamp-2">{task.title}</h4>
                      
                      {/* 內容預覽 */}
                      <p className="text-xs text-gray-500 mb-3 flex items-start">
                        <AlignLeft size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{task.content}</span>
                      </p>
                      
                      {/* 進度指示圖示 */}
                      <div className="flex items-center space-x-3 text-xs text-gray-400 border-t pt-2 mt-2">
                        <div className={`flex items-center ${task.summary ? 'text-blue-600 font-medium' : ''}`}>
                          <FileText size={14} className="mr-1" /> 
                          <span className="hidden sm:inline">文案</span>
                        </div>
                        <div className={`flex items-center ${task.imageStatus ? 'text-green-600 font-medium' : ''}`}>
                          <ImageIcon size={14} className="mr-1" />
                          <span className="hidden sm:inline">圖片</span>
                        </div>
                         <div className={`flex items-center ${task.substackLink ? 'text-orange-600 font-medium' : ''}`}>
                          <Share size={14} className="mr-1" />
                          <span className="hidden sm:inline">連結</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {tasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-xs sm:text-sm border-2 border-dashed border-gray-200/50 rounded-lg">
                    無任務
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Task Modal (Simplified) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">快速新增素材</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              addTask(formData.get('rawContent'));
            }}>
              <div className="mb-4">
                <textarea 
                  name="rawContent" 
                  autoFocus
                  required
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-48 text-base sm:text-sm leading-relaxed resize-none text-gray-700" 
                  placeholder="在此貼上任何內容：
- 一整段還沒整理的英文新聞
- 一個想研究的議題關鍵字
- 或是電子報的快訊內容

系統會自動幫你建立卡片。" 
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">取消</button>
                <button type="submit" className="px-4 py-2 bg-[#1A365D] text-white rounded hover:bg-[#152c4d] text-sm font-medium shadow-sm">新增卡片</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* The Wizard Modal */}
      {renderWizard()}
      
      {/* Settings Modal */}
      {renderSettingsModal()}

      {/* Confirmation Dialog */}
      {renderConfirmDialog()}
    </div>
  );
}