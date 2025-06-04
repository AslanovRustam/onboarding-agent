import { isDevelopment } from "./env";

/**
 * Утилита для логирования взаимодействия с внешними API
 */

// Константа для включения/выключения логирования
const ENABLE_LOGGING = true;

/**
 * Функция для логирования запросов
 * @param type Тип сообщения
 * @param message Основное сообщение
 * @param data Дополнительные данные
 */
export const logRequest = (type: string, message: string, data?: any): void => {
  if (!ENABLE_LOGGING) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
  
  console.log(`${prefix} ${message}`);
  if (data) {
    console.log(`${prefix} Данные:`, data);
  }
};

/**
 * Логирование отправки сообщения
 */
export const logSendMessage = (message: string, sessionId: string, isAudio: boolean = false): void => {
  logRequest('send', `Отправка ${isAudio ? 'аудио' : 'текстового'} сообщения на вебхук`, {
    message,
    sessionId,
    isAudio
  });
};

/**
 * Логирование получения ответа
 */
export const logReceiveMessage = (response: any): void => {
  logRequest('receive', 'Получен ответ от вебхука', response);
};

/**
 * Логирование ошибки
 */
export const logError = (message: string, error: any): void => {
  logRequest('error', message, error);
  
  // В режиме разработки можно выводить полный стек ошибки
  if (isDevelopment()) {
    console.error(error);
  }
};