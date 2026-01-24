// Content script for extracting webpage content
(function() {
  'use strict';

  /**
   * 提取網頁主要內容（閱讀模式）
   */
  function extractMainContent() {
    // 獲取頁面標題
    const title = document.title || 'Untitled';

    // 獲取頁面 URL
    const url = window.location.href;

    // 嘗試從各種來源提取內容
    let content = '';

    // 1. 嘗試找到主要文章容器
    const articleSelectors = [
      'article',
      '[role="article"]',
      '.article',
      '.post',
      '.entry-content',
      '.post-content',
      '.article-content',
      'main article',
      '#content article',
      '.content'
    ];

    let mainElement = null;
    for (const selector of articleSelectors) {
      mainElement = document.querySelector(selector);
      if (mainElement && mainElement.textContent.trim().length > 200) {
        break;
      }
    }

    // 2. 如果找不到文章容器，使用整個 body
    if (!mainElement) {
      mainElement = document.body;
    }

    // 3. 提取文字內容
    if (mainElement) {
      // 克隆元素以避免修改原始 DOM
      const clone = mainElement.cloneNode(true);

      // 移除不需要的元素
      const elementsToRemove = [
        'script',
        'style',
        'nav',
        'header',
        'footer',
        'aside',
        '.ad',
        '.advertisement',
        '.social-share',
        '.comments',
        '.sidebar',
        '[role="navigation"]',
        '[role="banner"]',
        '[role="complementary"]'
      ];

      elementsToRemove.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });

      // 提取文字並保留基本格式
      content = extractTextWithFormat(clone);
    }

    // 4. 如果內容太短，嘗試獲取整個 body 的文字
    if (content.length < 100) {
      content = document.body.innerText || document.body.textContent;
    }

    // 5. 清理內容
    content = cleanContent(content);

    // 6. 限制內容長度（避免過長）
    const maxLength = 50000; // 50k 字元
    if (content.length > maxLength) {
      content = content.substring(0, maxLength) + '\n\n[內容過長，已截斷...]';
    }

    return {
      title: title.trim(),
      url: url,
      content: content.trim()
    };
  }

  /**
   * 提取文字並保留基本格式
   */
  function extractTextWithFormat(element) {
    let text = '';
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const content = node.textContent.trim();
        if (content) {
          text += content + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        // 在區塊元素後添加換行
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'br'].includes(tagName)) {
          text += '\n';
        }

        // 標題添加標記
        if (tagName.match(/^h[1-6]$/)) {
          const level = parseInt(tagName[1]);
          text += '\n' + '#'.repeat(level) + ' ';
        }

        // 列表項添加標記
        if (tagName === 'li') {
          text += '• ';
        }
      }
    }

    return text;
  }

  /**
   * 清理內容
   */
  function cleanContent(content) {
    return content
      // 移除多餘的空白
      .replace(/[ \t]+/g, ' ')
      // 移除多餘的換行（保留最多 2 個）
      .replace(/\n{3,}/g, '\n\n')
      // 移除行首尾空白
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  /**
   * 監聽來自 popup 的訊息
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
      try {
        const extractedData = extractMainContent();

        // 驗證提取的資料
        if (!extractedData.content || extractedData.content.length < 10) {
          sendResponse({
            success: false,
            error: '無法提取網頁內容，內容過短或為空'
          });
          return true;
        }

        sendResponse({
          success: true,
          data: extractedData
        });
      } catch (error) {
        console.error('提取內容時發生錯誤:', error);
        sendResponse({
          success: false,
          error: '提取內容時發生錯誤: ' + error.message
        });
      }
      return true; // 保持訊息通道開啟以進行非同步響應
    }
  });

  console.log('內容農場助手 - Content Script 已載入');
})();
