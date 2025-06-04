/**
 * Конфигурация для работы с n8n вебхуками
 */
export const N8N_CONFIG = {
  // Основной (production) вебхук для обработки сообщений чата
  PRIMARY_WEBHOOK_URL: "https://n8n-djwe.onrender.com/webhook/4b2e3bea-1ccb-44d5-90eb-36ad411982b7",
  
  // Тестовый вебхук (закомментирован)
  // TEST_WEBHOOK_URL: "https://n8n-djwe.onrender.com/webhook-test/4b2e3bea-1ccb-44d5-90eb-36ad411982b7",
  
  // Таймауты для различных операций (в миллисекундах)
  TIMEOUTS: {
    // Таймаут для проверки доступности вебхука
    AVAILABILITY_CHECK: 8000,
    // Таймаут для отправки сообщения
    SEND_MESSAGE: 15000,
    // Таймаут для инициализации сессии
    INIT_SESSION: 10000,
  },
  
  // Интервал для повторной проверки доступности вебхука (в миллисекундах)
  RETRY_INTERVAL: 5 * 60 * 1000, // 5 минут
};

/**
 * Возвращает массив URL вебхуков
 */
export const getWebhookUrls = (): string[] => {
  return [
    N8N_CONFIG.PRIMARY_WEBHOOK_URL,
    // N8N_CONFIG.TEST_WEBHOOK_URL // Тестовый вебхук закомментирован
  ];
};

/**
 * Возвращает названия вебхуков для отображения в интерфейсе
 */
export const getWebhookNames = (): string[] => {
  return [
    "Рабочий вебхук (основной)",
    // "Тестовый вебхук (отключен)"
  ];
};