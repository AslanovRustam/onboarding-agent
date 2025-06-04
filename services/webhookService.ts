import { getWebhookUrls } from "../config/n8nConfig";
import { logSendMessage, logReceiveMessage, logError } from "../utils/logger";
import type { ChatMessageData } from "./n8nService";

export async function sendToWebhook(message: string, sessionId: string, isAudio: boolean = false): Promise<ChatMessageData> {
  const webhookUrls = getWebhookUrls();
  const mainWebhookUrl = webhookUrls[0];
  
  const payload = {
    content: message,
    sessionId: sessionId,
    timestamp: new Date().toISOString(),
    type: isAudio ? "audio" : "text",
    source: "chat-interface"
  };

  try {
    logSendMessage(message, sessionId, isAudio);
    
    const response = await fetch(mainWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.text();
    logReceiveMessage(responseData);

    return {
      id: Date.now(),
      isUser: false,
      message: responseData || "Сообщение обработано",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Ошибка при отправке на webhook', {
      error: errorMessage,
      url: mainWebhookUrl,
      payload
    });

    return {
      id: Date.now(),
      isUser: false,
      message: `Ошибка сети: ${errorMessage}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isError: true
    };
  }
}

export async function sendSessionInit(sessionId: string): Promise<{ success: boolean; message?: string }> {
  const webhookUrls = getWebhookUrls();
  const mainWebhookUrl = webhookUrls[0];
  
  const payload = {
    action: "init_session",
    sessionId: sessionId,
    timestamp: new Date().toISOString(),
    source: "chat-interface"
  };

  try {
    logSendMessage('Session initialization', sessionId, false);
    
    const response = await fetch(mainWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.text();
    logReceiveMessage({ sessionId, response: responseData });

    return {
      success: true,
      message: responseData
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Ошибка при инициализации сессии', {
      error: errorMessage,
      sessionId,
      url: mainWebhookUrl
    });

    return {
      success: false,
      message: errorMessage
    };
  }
}

export async function testWebhookConnection(): Promise<boolean> {
  const webhookUrls = getWebhookUrls();
  const testWebhookUrl = webhookUrls[1] || webhookUrls[0];
  
  const payload = {
    action: "test_connection",
    timestamp: new Date().toISOString(),
    source: "chat-interface"
  };

  try {
    logSendMessage('Connection test', 'test-session', false);
    
    const response = await fetch(testWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const isSuccess = response.ok;
    logReceiveMessage({ success: isSuccess, status: response.status });
    
    return isSuccess;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logError('Ошибка при тестировании подключения', {
      error: errorMessage,
      url: testWebhookUrl
    });
    return false;
  }
}