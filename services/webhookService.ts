import { getProxyWebhookUrl } from "../config/n8nConfig";

/**
 * Сервис для тестирования подключения к вебхуку
 */
export const webhookService = {
  /**
   * Проверяет доступность вебхука с помощью HEAD-запроса
   * @returns Promise с информацией о доступности
   */
  checkAvailability: async (): Promise<{ available: boolean; status?: number; error?: string }> => {
    try {
      const proxyUrl = getProxyWebhookUrl();
      const response = await fetch(proxyUrl, { method: 'HEAD' });
      
      return {
        available: response.ok,
        status: response.status
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  },
  
  /**
   * Отправляет тестовое сообщение на вебхук и возвращает результат
   * @param testMessage Тестовое сообщение для отправки
   * @returns Promise с результатом отправки
   */
  sendTestMessage: async (testMessage: string): Promise<{
    success: boolean;
    status?: number;
    data?: any;
    error?: string;
    responseTime?: number;
  }> => {
    const startTime = Date.now();
    try {
      const proxyUrl = getProxyWebhookUrl();
      const payload = {
        message: testMessage,
        sessionId: `test-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'text',
        source: 'enable3-chat-test'
      };
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseTime = Date.now() - startTime;
      
      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { rawText: text };
        }
      } catch (e) {
        data = { error: 'Не удалось прочитать ответ' };
      }
      
      return {
        success: response.ok,
        status: response.status,
        data,
        responseTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  },
  
  /**
   * Получает статистику производительности вебхука
   * @param samples Количество тестовых запросов для сбора статистики
   * @returns Promise со статистикой производительности
   */
  getPerformanceStats: async (samples: number = 3): Promise<{
    success: boolean;
    avgResponseTime?: number;
    minResponseTime?: number;
    maxResponseTime?: number;
    successRate?: number;
    error?: string;
  }> => {
    try {
      const results = [];
      
      for (let i = 0; i < samples; i++) {
        const result = await webhookService.sendTestMessage(`Тест производительности #${i+1}`);
        results.push(result);
        
        // Небольшая пауза между запросами
        if (i < samples - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const successfulRequests = results.filter(r => r.success);
      const responseTimes = results.map(r => r.responseTime).filter(Boolean) as number[];
      
      if (responseTimes.length === 0) {
        return {
          success: false,
          error: 'Не удалось получить время отклика ни для одного запроса'
        };
      }
      
      return {
        success: true,
        avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
        successRate: (successfulRequests.length / results.length) * 100
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};