// Options page script
document.addEventListener('DOMContentLoaded', function() {
  const firebaseConfigInput = document.getElementById('firebaseConfig');
  const appIdInput = document.getElementById('appId');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusMessage = document.getElementById('statusMessage');

  // 載入已保存的配置
  loadConfig();

  // 保存按鈕事件
  saveBtn.addEventListener('click', saveConfig);

  /**
   * 清理 JSON 字串（移除註解、尾隨逗號等）
   */
  function cleanJson(jsonString) {
    let cleaned = jsonString;
    
    // 移除單行註解 (// ...)
    cleaned = cleaned.replace(/\/\/.*$/gm, '');
    
    // 移除多行註解 (/* ... */)
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 移除尾隨逗號（在 } 或 ] 之前）
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    return cleaned.trim();
  }

  // 測試按鈕事件
  testBtn.addEventListener('click', testConnection);

  /**
   * 載入已保存的配置
   */
  function loadConfig() {
    chrome.storage.local.get(['firebaseConfig', 'appId'], function(result) {
      if (result.firebaseConfig) {
        firebaseConfigInput.value = JSON.stringify(result.firebaseConfig, null, 2);
      }
      if (result.appId) {
        appIdInput.value = result.appId;
      }
    });
  }

  /**
   * 保存配置
   */
  function saveConfig() {
    try {
      // 驗證 Firebase 配置
      const firebaseConfigText = firebaseConfigInput.value.trim();
      if (!firebaseConfigText) {
        throw new Error('請輸入 Firebase 配置');
      }

      let firebaseConfig;
      try {
        // 清理 JSON：移除註解和尾隨逗號
        const cleanedJson = cleanJson(firebaseConfigText);
        firebaseConfig = JSON.parse(cleanedJson);
      } catch (e) {
        // 提供更詳細的錯誤訊息
        const errorMsg = e.message || '未知錯誤';
        const position = e.message.match(/position (\d+)/);
        let detailedError = `Firebase 配置格式錯誤：${errorMsg}`;
        
        if (position) {
          const pos = parseInt(position[1]);
          const lines = firebaseConfigText.split('\n');
          let charCount = 0;
          let lineNum = 0;
          let colNum = 0;
          
          for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length + 1 >= pos) {
              lineNum = i + 1;
              colNum = pos - charCount;
              break;
            }
            charCount += lines[i].length + 1; // +1 for newline
          }
          
          detailedError += `\n\n錯誤位置：第 ${lineNum} 行，第 ${colNum} 列`;
          if (lineNum > 0 && lineNum <= lines.length) {
            detailedError += `\n\n問題行內容：\n${lines[lineNum - 1]}`;
            detailedError += `\n${' '.repeat(Math.max(0, colNum - 1))}^`;
          }
        }
        
        throw new Error(detailedError);
      }

      // 驗證必要欄位
      const requiredFields = ['apiKey', 'authDomain', 'projectId'];
      for (const field of requiredFields) {
        if (!firebaseConfig[field]) {
          throw new Error(`缺少必要欄位: ${field}`);
        }
      }

      // 驗證 App ID
      const appId = appIdInput.value.trim();
      if (!appId) {
        throw new Error('請輸入 App ID');
      }

      // 保存到 Chrome Storage
      chrome.storage.local.set({
        firebaseConfig: firebaseConfig,
        appId: appId
      }, function() {
        if (chrome.runtime.lastError) {
          throw new Error(chrome.runtime.lastError.message);
        }

        showStatus('✅ 設定已保存！', 'success');
        console.log('配置已保存:', { firebaseConfig, appId });
      });
    } catch (error) {
      // 顯示錯誤訊息（如果是多行，只顯示第一行，完整訊息在 console）
      const errorMsg = error.message.split('\n')[0];
      showStatus('❌ ' + errorMsg, 'error');
      console.error('保存配置失敗:', error);
      console.error('完整錯誤訊息:', error.message);
      
      // 如果是 JSON 格式錯誤，在 console 中顯示詳細資訊
      if (error.message.includes('JSON') || error.message.includes('格式錯誤')) {
        console.error('提示：請確認 JSON 格式正確，不包含註解或尾隨逗號');
        console.error('輸入的內容:', firebaseConfigInput.value);
      }
    }
  }

  /**
   * 測試連線
   */
  async function testConnection() {
    try {
      testBtn.disabled = true;
      testBtn.textContent = '🔄 測試中...';

      // 驗證配置
      const firebaseConfigText = firebaseConfigInput.value.trim();
      if (!firebaseConfigText) {
        throw new Error('請先輸入 Firebase 配置');
      }

      let firebaseConfig;
      try {
        // 清理 JSON：移除註解和尾隨逗號
        const cleanedJson = cleanJson(firebaseConfigText);
        firebaseConfig = JSON.parse(cleanedJson);
      } catch (e) {
        // 提供更詳細的錯誤訊息
        const errorMsg = e.message || '未知錯誤';
        let detailedError = `Firebase 配置格式錯誤：${errorMsg}`;
        
        // 嘗試找出錯誤位置
        const position = e.message.match(/position (\d+)/);
        if (position) {
          const pos = parseInt(position[1]);
          const lines = firebaseConfigText.split('\n');
          let charCount = 0;
          let lineNum = 0;
          
          for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length + 1 >= pos) {
              lineNum = i + 1;
              break;
            }
            charCount += lines[i].length + 1;
          }
          
          if (lineNum > 0) {
            detailedError += ` (第 ${lineNum} 行附近)`;
          }
        }
        
        throw new Error(detailedError);
      }

      const appId = appIdInput.value.trim();
      if (!appId) {
        throw new Error('請輸入 App ID');
      }

      // 測試連線到 Firestore
      const projectId = firebaseConfig.projectId;
      const collectionPath = `artifacts/${appId}/public/data/tasks`;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?pageSize=1`;

      const response = await fetch(url);

      if (response.ok) {
        showStatus('✅ 連線成功！Firebase 配置正確', 'success');
      } else if (response.status === 403) {
        showStatus('⚠️ 連線成功，但可能需要配置安全規則以允許寫入', 'error');
      } else if (response.status === 404) {
        showStatus('⚠️ 專案或集合不存在，請確認配置正確', 'error');
      } else {
        throw new Error(`連線失敗 (${response.status})`);
      }
    } catch (error) {
      showStatus('❌ 測試失敗: ' + error.message, 'error');
      console.error('測試連線失敗:', error);
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '🧪 測試連線';
    }
  }

  /**
   * 顯示狀態訊息
   */
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;

    // 3 秒後隱藏成功訊息
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.className = 'status-message';
      }, 3000);
    }
  }
});
