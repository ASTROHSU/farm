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
        firebaseConfig = JSON.parse(firebaseConfigText);
      } catch (e) {
        throw new Error('Firebase 配置格式錯誤，請確認是有效的 JSON');
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
      showStatus('❌ ' + error.message, 'error');
      console.error('保存配置失敗:', error);
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
        firebaseConfig = JSON.parse(firebaseConfigText);
      } catch (e) {
        throw new Error('Firebase 配置格式錯誤');
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
