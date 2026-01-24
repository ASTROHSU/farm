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

      // 向 content script 發送訊息以擷取內容
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractContent'
      });

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
