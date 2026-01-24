// Background service worker for Content Farm Assistant

/**
 * 監聽來自 popup 的訊息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveTask') {
    handleSaveTask(request.data)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('保存任務失敗:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    return true; // 保持訊息通道開啟以進行非同步響應
  }
});

/**
 * 處理保存任務到 Firebase
 */
async function handleSaveTask(taskData) {
  try {
    // 從 Chrome Storage 獲取配置
    const config = await getConfig();

    if (!config.firebaseConfig) {
      throw new Error('未配置 Firebase，請前往設定頁面配置');
    }

    if (!config.appId) {
      throw new Error('未配置 App ID，請前往設定頁面配置');
    }

    // 準備任務資料
    const task = {
      title: extractTitle(taskData.content) || taskData.title || 'Untitled',
      content: taskData.content,
      url: taskData.url,
      status: 'todo',
      step: 1,
      geminiReport: '',
      summary: '',
      substackLink: '',
      imageStatus: false,
      created_at: new Date().toISOString()
    };

    // 保存到 Firebase
    const result = await saveToFirebase(config.firebaseConfig, config.appId, task);

    return {
      success: true,
      taskId: result.taskId
    };
  } catch (error) {
    console.error('處理保存任務時發生錯誤:', error);
    throw error;
  }
}

/**
 * 從內容中提取標題（第一行）
 */
function extractTitle(content) {
  if (!content) return '';

  const lines = content.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) return '';

  const firstLine = lines[0].trim();
  // 移除可能的 markdown 標題標記
  const title = firstLine.replace(/^#+\s*/, '');

  // 限制標題長度
  const maxLength = 100;
  if (title.length > maxLength) {
    return title.substring(0, maxLength) + '...';
  }

  return title;
}

/**
 * 從 Chrome Storage 獲取配置
 */
async function getConfig() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['firebaseConfig', 'appId'], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * 使用 Firebase REST API 保存任務到 Firestore
 */
async function saveToFirebase(firebaseConfig, appId, task) {
  try {
    // 構建 Firestore REST API URL
    const projectId = firebaseConfig.projectId;
    const collectionPath = `artifacts/${appId}/public/data/tasks`;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}`;

    // 將任務資料轉換為 Firestore 格式
    const firestoreDoc = convertToFirestoreFormat(task);

    // 發送請求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: firestoreDoc
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Firebase API 錯誤:', errorData);

      // 如果是認證問題，提供更詳細的錯誤訊息
      if (response.status === 401 || response.status === 403) {
        throw new Error('Firebase 認證失敗，請檢查安全規則是否允許公開寫入，或使用 Firebase Admin SDK');
      }

      throw new Error(`保存到 Firebase 失敗: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const taskId = result.name.split('/').pop();

    console.log('成功保存任務到 Firebase:', taskId);
    return { taskId };
  } catch (error) {
    console.error('Firebase 操作失敗:', error);
    throw error;
  }
}

/**
 * 將 JavaScript 對象轉換為 Firestore 格式
 */
function convertToFirestoreFormat(obj) {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      result[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        result[key] = { integerValue: value.toString() };
      } else {
        result[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      result[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      result[key] = { timestampValue: value.toISOString() };
    } else if (typeof value === 'object') {
      result[key] = { mapValue: { fields: convertToFirestoreFormat(value) } };
    }
  }

  return result;
}

/**
 * 安裝或更新時的處理
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('內容農場助手已安裝');
    // 打開設定頁面
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('內容農場助手已更新');
  }
});

console.log('內容農場助手 - Background Service Worker 已啟動');
