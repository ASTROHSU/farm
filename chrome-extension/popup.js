// Popup script for Content Farm Assistant
document.addEventListener('DOMContentLoaded', function() {
  const captureBtn = document.getElementById('captureBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const statusDiv = document.getElementById('status');

  // 顯示狀態訊息
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = 'status';

    if (type === 'success') {
      statusDiv.classList.add('success');
    } else if (type === 'error') {
      statusDiv.classList.add('error');
    }

    statusDiv.classList.remove('hidden');
  }

  // 隱藏狀態訊息
  function hideStatus() {
    statusDiv.classList.add('hidden');
  }

  // 擷取按鈕點擊事件
  captureBtn.addEventListener('click', async function() {
    try {
      // 禁用按鈕並顯示載入狀態
      captureBtn.disabled = true;
      captureBtn.innerHTML = '<div class="spinner"></div><span>擷取中...</span>';
      hideStatus();

      // 獲取當前活動標籤頁
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('無法獲取當前標籤頁');
      }

      // 檢查是否為特殊頁面（無法注入 content script）
      if (tab.url.startsWith('chrome://') || 
          tab.url.startsWith('chrome-extension://') || 
          tab.url.startsWith('moz-extension://') ||
          tab.url.startsWith('edge://')) {
        throw new Error('無法在此類頁面上擷取內容（chrome://、擴充功能頁面等）');
      }

      // 嘗試注入 content script（如果尚未注入）
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (injectError) {
        // 如果注入失敗，可能是已經注入或頁面不允許注入
        console.log('Content script 可能已存在或無法注入:', injectError);
      }

      // 向 content script 發送訊息以擷取內容
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'extractContent'
        });
      } catch (messageError) {
        // 如果發送訊息失敗，嘗試重新注入
        if (messageError.message.includes('Receiving end does not exist')) {
          // 重新注入 content script
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          // 等待一小段時間讓 script 載入
          await new Promise(resolve => setTimeout(resolve, 100));
          // 再次嘗試發送訊息
          response = await chrome.tabs.sendMessage(tab.id, {
            action: 'extractContent'
          });
        } else {
          throw messageError;
        }
      }

      if (response && response.success) {
        // 發送到 background script 以儲存到 Firebase
        const saveResult = await chrome.runtime.sendMessage({
          action: 'saveTask',
          data: {
            title: response.data.title,
            content: response.data.content,
            url: response.data.url
          }
        });

        if (saveResult && saveResult.success) {
          showStatus('✅ 已成功新增到待處理任務', 'success');

          // 3 秒後關閉 popup
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          throw new Error(saveResult?.error || '儲存失敗');
        }
      } else {
        throw new Error(response?.error || '擷取內容失敗');
      }
    } catch (error) {
      console.error('擷取失敗:', error);
      showStatus('❌ ' + error.message, 'error');
    } finally {
      // 恢復按鈕狀態
      captureBtn.disabled = false;
      captureBtn.innerHTML = '<span class="icon">✨</span><span>擷取當前頁面</span>';
    }
  });

  // 設定按鈕點擊事件
  settingsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  // 檢查 Firebase 配置狀態
  chrome.storage.local.get(['firebaseConfig'], function(result) {
    if (!result.firebaseConfig) {
      showStatus('⚠️ 請先在設定中配置 Firebase', 'error');
    }
  });
});
