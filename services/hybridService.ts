import { ChatMessageData } from "./n8nService";
import { logSendMessage, logReceiveMessage, logError } from "../utils/logger";
import { createTimeoutSignal } from "../utils/env";

// URLs вебхуков n8n - основной рабочий вебхук
const WEBHOOK_URLS = [
  "https://n8n-djwe.onrender.com/webhook/4b2e3bea-1ccb-44d5-90eb-36ad411982b7",      // Основной рабочий вебхук
];

// Индекс текущего рабочего вебхука (null означает, что нет рабочего вебхука)
let workingWebhookIndex: number | null = 0; // По умолчанию используем основной вебхук

// Список публичных CORS прокси-сервисов для обхода CORS-ограничений
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://proxy.cors.sh/',
  'https://api.allorigins.win/raw?url='
];

// Индекс текущего рабочего прокси
let workingProxyIndex: number | null = null;

// Таймауты для различных операций (в миллисекундах)
const TIMEOUTS = {
  // Таймаут для проверки доступности вебхука
  AVAILABILITY_CHECK: 8000,
  // Таймаут для отправки сообщения
  SEND_MESSAGE: 15000,
  // Таймаут для инициализации сессии
  INIT_SESSION: 10000,
};

/**
 * Выполняет запрос к внешнему URL с обходом CORS-ограничений
 * @param url URL для запроса
 * @param options Опции запроса
 * @returns Promise с результатом запроса
 */
const fetchWithCORSBypass = async (url: string, options?: RequestInit): Promise<Response> => {
  console.log(`Attempting direct request to: ${url}`);
  
  // Сначала пробуем прямой запрос
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors', // Явно указываем режим CORS
      credentials: 'omit' // Не отправляем куки для кросс-доменных запросов
    });
    
    if (response.ok) {
      console.log(`Direct request to ${url} succeeded`);
      return response;
    }
    console.log(`Direct request to ${url} failed with status: ${response.status}`);
  } catch (error) {
    console.log(`Direct request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Если у нас есть рабочий прокси из предыдущих запросов, используем его
  if (workingProxyIndex !== null) {
    const proxyUrl = `${CORS_PROXIES[workingProxyIndex]}${encodeURIComponent(url)}`;
    console.log(`Trying known working proxy: ${CORS_PROXIES[workingProxyIndex]}`);
    
    try {
      const response = await fetch(proxyUrl, options);
      if (response.ok) {
        console.log(`Request via working proxy succeeded`);
        return response;
      }
      console.log(`Request via working proxy failed with status: ${response.status}`);
    } catch (error) {
      console.log(`Request via working proxy failed: ${error instanceof Error ? error.message : String(error)}`);
      workingProxyIndex = null; // Сбрасываем индекс, если прокси перестал работать
    }
  }
  
  // Если нет рабочего прокси или он перестал работать, пробуем все прокси по очереди
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    if (i === workingProxyIndex) continue; // Пропускаем уже проверенный прокси
    
    const proxyUrl = `${CORS_PROXIES[i]}${encodeURIComponent(url)}`;
    console.log(`Trying proxy ${i + 1}: ${CORS_PROXIES[i]}`);
    
    try {
      const response = await fetch(proxyUrl, options);
      if (response.ok) {
        console.log(`Proxy ${i + 1} worked successfully`);
        workingProxyIndex = i;
        return response;
      }
      console.log(`Proxy ${i + 1} failed with status: ${response.status}`);
    } catch (error) {
      console.log(`Proxy ${i + 1} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Если все прокси не сработали, пробуем еще раз прямой запрос с другими настройками
  console.log(`All proxies failed, trying direct request with no-cors mode`);
  try {
    // В режиме no-cors нельзя прочитать ответ, но можно отправить запрос
    // Это может работать для POST запросов, если сервер корректно обрабатывает preflight
    const response = await fetch(url, {
      ...options,
      mode: 'no-cors'
    });
    
    console.log(`No-cors mode request completed with type: ${response.type}`);
    // В режиме no-cors мы не можем проверить статус, поэтому возвращаем response как есть
    return response;
  } catch (error) {
    console.error(`Final attempt failed: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Не удалось выполнить запрос: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Генерирует стандартное сообщение об ошибке
 * @param errorType Тип ошибки
 * @returns Объект сообщения с ответом об ошибке
 */
const generateErrorResponse = (errorType: 'connection' | 'timeout' | 'server' | 'unknown'): ChatMessageData => {
  const errorMessages = {
    connection: "Не удалось подключиться к серверу. Пожалуйста, проверьте подключение к интернету и попробуйте снова.",
    timeout: "Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте снова позже.",
    server: "Сервер временно недоступен. Наша команда уже работает над устранением проблемы.",
    unknown: "Произошла неизвестная ошибка. Пожалуйста, попробуйте снова позже."
  };

  return {
    id: Date.now(),
    isUser: false,
    message: errorMessages[errorType],
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    isError: true
  };
};

/**
 * Пробует отправить запрос на все доступные вебхуки
 * @param payload Полезная нагрузка для отправки
 * @param signal Сигнал для прерывания запроса по таймауту
 * @returns Promise с ответом от первого успешного вебхука или null, если все недоступны
 */
const tryAllWebhooks = async (payload: any, signal?: AbortSignal): Promise<Response | null> => {
  console.log(`Trying webhook with payload:`, payload);
  
  // Пробуем все вебхуки по очереди
  for (let i = 0; i < WEBHOOK_URLS.length; i++) {
    try {
      console.log(`Trying webhook ${i + 1} (${WEBHOOK_URLS[i]})`);
      const response = await fetchWithCORSBypass(WEBHOOK_URLS[i], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal
      });
      
      if (response.ok || response.type === 'opaque') {
        console.log(`Webhook ${i + 1} responded successfully`);
        workingWebhookIndex = i;
        return response;
      }
      
      console.log(`Webhook ${i + 1} failed with status: ${response.status}`);
    } catch (error) {
      console.log(`Error with webhook ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.error("All webhooks failed");
  return null;
};

/**
 * Обрабатывает ответ от вебхука
 * @param response Ответ от вебхука
 * @returns Объект сообщения с ответом
 */
const processResponse = async (response: Response | null): Promise<ChatMessageData> => {
  if (!response) {
    return generateErrorResponse('connection');
  }
  
  try {
    // Если response имеет тип 'opaque', значит мы использовали режим no-cors
    // и не можем прочитать тело ответа
    if (response.type === 'opaque') {
      return {
        id: Date.now(),
        isUser: false,
        message: "Получен ответ от сервера, но его содержимое недоступно из-за ограничений CORS.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    }
    
    // Пробуем разобрать ответ как JSON
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Если не удалось разобрать как JSON, используем текст как есть
      data = { message: responseText || 'Получен пустой ответ от сервера' };
    }
    
    // Логируем полученный ответ
    logReceiveMessage(data);
    
    return {
      id: Date.now(),
      isUser: false,
      message: data.message || data.response || 'Получен пустой ответ от сервера',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  } catch (error) {
    // Если возникла ошибка при чтении ответа
    console.error("Ошибка при чтении ответа:", error);
    return generateErrorResponse('unknown');
  }
};

/**
 * Отправляет сообщение на вебхук n8n
 * @param message Сообщение для отправки
 * @param sessionId Идентификатор сессии
 * @param isAudio Флаг, указывающий, является ли сообщение аудио
 * @returns Объект сообщения с ответом
 */
export const sendMessage = async (
  message: string, 
  sessionId: string = 'default',
  isAudio: boolean = false
): Promise<ChatMessageData> => {
  try {
    // Логируем отправку сообщения
    logSendMessage(message, sessionId, isAudio);
    
    const payload = {
      message,
      sessionId,
      timestamp: new Date().toISOString(),
      type: isAudio ? 'audio' : 'text',
      source: 'enable3-chat',
    };
    
    // Создаем сигнал с таймаутом для запроса
    const signal = createTimeoutSignal(TIMEOUTS.SEND_MESSAGE);
    
    // Пробуем отправить на все вебхуки
    const response = await tryAllWebhooks(payload, signal);
    return await processResponse(response);
  } catch (error) {
    // Обработка непредвиденных ошибок
    console.error("Непредвиденная ошибка при отправке сообщения:", error);
    logError('Ошибка при отправке сообщения на вебхук', error);
    
    // Определяем тип ошибки
    let errorType: 'connection' | 'timeout' | 'server' | 'unknown' = 'unknown';
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorType = 'timeout';
      } else if (error.message.includes('network') || error.message.includes('connect')) {
        errorType = 'connection';
      }
    }
    
    return generateErrorResponse(errorType);
  }
};

/**
 * Обрабатывает ответ от вебхука при инициализации сессии
 * @param response Ответ от вебхука
 * @param userId Идентификатор пользователя (используется как запасной вариант)
 * @returns Идентификатор сессии
 */
const processSessionResponse = async (response: Response | null, userId: string): Promise<string> => {
  if (!response) {
    return userId;
  }
  
  try {
    // Если response имеет тип 'opaque', значит мы использовали режим no-cors
    // и не можем прочитать тело ответа
    if (response.type === 'opaque') {
      return userId;
    }
    
    // Пробуем разобрать ответ как JSON
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      // Если не удалось разобрать как JSON, используем userId в качестве sessionId
      return userId;
    }
    
    logReceiveMessage(data);
    return data.sessionId || userId;
  } catch (error) {
    // Если возникла ошибка при чтении ответа, используем userId в качестве sessionId
    return userId;
  }
};

/**
 * Инициализирует сессию с вебхуком
 * @param userId Идентификатор пользователя
 * @returns Идентификатор сессии
 */
export const initSession = async (userId: string): Promise<string> => {
  try {
    logSendMessage('Инициализация сессии', userId);
    
    const payload = {
      action: 'init_session',
      userId,
      timestamp: new Date().toISOString(),
      source: 'enable3-chat',
    };
    
    // Создаем сигнал с таймаутом для запроса
    const signal = createTimeoutSignal(TIMEOUTS.INIT_SESSION);
    
    console.log("Initializing session for user:", userId);
    
    // Пробуем инициализировать сессию через все вебхуки
    const response = await tryAllWebhooks(payload, signal);
    const sessionId = await processSessionResponse(response, userId);
    
    console.log("Session initialized with ID:", sessionId);
    return sessionId;
  } catch (error) {
    // Обработка непредвиденных ошибок
    console.error('Ошибка при инициализации сессии с вебхуком:', error);
    logError('Ошибка при инициализации сессии с вебхуком', error);
    
    // В случае ошибки используем userId как sessionId
    return userId;
  }
};