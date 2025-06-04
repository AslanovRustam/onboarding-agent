import { ChatMessageData } from "./n8nService";

/**
 * Сервис имитации чат-бота для демонстрации без подключения к n8n
 */

// Базовые ответы для разных типов запросов
const responses = {
  greeting: [
    "Здравствуйте! Чем я могу вам помочь сегодня?",
    "Приветствую! Я виртуальный ассистент enable3.io. Чем могу быть полезен?",
    "Добро пожаловать! Как я могу помочь вам сегодня?",
  ],
  
  farewell: [
    "Спасибо за обращение! Если возникнут еще вопросы, обращайтесь.",
    "Всего хорошего! Буду рад помочь вам снова.",
    "До свидания! Надеюсь, ваш вопрос был решен.",
  ],
  
  unknown: [
    "Я не совсем понимаю ваш запрос. Можете пояснить подробнее?",
    "Извините, но я не могу обработать этот запрос. Попробуйте задать вопрос иначе.",
    "Мне нужно больше информации, чтобы помочь вам с этим вопросом.",
  ],
  
  // Ответы, связанные с n8n
  n8n: [
    "Для подключения чата к n8n вам потребуется настроить рабочий процесс (workflow) в вашем экземпляре n8n.",
    "n8n - это платформа автоматизации, которая может обрабатывать сообщения из чата и интегрировать их с другими сервисами.",
    "Подключение к n8n требует настройки вебхуков и обработчиков сообщений на стороне n8n.",
  ],
  
  // Ответы о возможностях
  capabilities: [
    "Я могу помочь вам с настройкой и использованием продуктов enable3.io.",
    "В мои возможности входит ответ на вопросы, помощь с настройкой и предоставление информации о сервисах enable3.io.",
    "Я специализируюсь на поддержке пользователей и могу помочь с различными вопросами о платформе enable3.io.",
  ],
};

// Функция для получения случайного элемента из массива
const getRandomResponse = (category: keyof typeof responses): string => {
  const options = responses[category];
  return options[Math.floor(Math.random() * options.length)];
};

// Поиск ключевых слов в сообщении
const findKeywords = (message: string): string[] => {
  const keywords = [];
  const lowerMsg = message.toLowerCase();
  
  if (/привет|здравствуй|добрый день|hi|hello/i.test(lowerMsg)) {
    keywords.push("greeting");
  }
  
  if (/пока|до свидания|спасибо|благодар/i.test(lowerMsg)) {
    keywords.push("farewell");
  }
  
  if (/n8n|подключ[ае]ни[яе]|интегр|workflow|webhook/i.test(lowerMsg)) {
    keywords.push("n8n");
  }
  
  if (/возможност|умеешь|что ты|функци|способ/i.test(lowerMsg)) {
    keywords.push("capabilities");
  }
  
  return keywords;
};

// Генерация ответа на основе ключевых слов
const generateResponse = (message: string): string => {
  const keywords = findKeywords(message);
  
  if (keywords.length === 0) {
    return getRandomResponse("unknown");
  }
  
  // Формируем полный ответ, комбинируя ответы из разных категорий
  if (keywords.length === 1) {
    return getRandomResponse(keywords[0] as keyof typeof responses);
  } else {
    // Комбинируем несколько ответов, если найдено несколько ключевых слов
    const responses = keywords.map(keyword => 
      getRandomResponse(keyword as keyof typeof responses)
    );
    return responses.join(" ");
  }
};

/**
 * Имитационный сервис для демонстрации работы чата без n8n
 */
export class MockService {
  // Имитация задержки ответа
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Имитирует отправку сообщения и получение ответа
   */
  async sendMessage(message: string, sessionId: string = 'demo'): Promise<ChatMessageData> {
    // Имитация задержки ответа (1-3 секунды)
    const responseTime = 1000 + Math.random() * 2000;
    await this.delay(responseTime);
    
    // Генерация ответа на основе содержимого сообщения
    const responseText = generateResponse(message);
    
    return {
      id: Date.now(),
      isUser: false,
      message: responseText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  }
  
  /**
   * Имитирует инициализацию сессии
   */
  async initSession(userId: string, initialContext: Record<string, any> = {}): Promise<string> {
    // Имитация задержки (0.5-1.5 секунды)
    const responseTime = 500 + Math.random() * 1000;
    await this.delay(responseTime);
    
    return `demo-session-${userId}`;
  }
}

// Создание и экспорт экземпляра сервиса
export const createMockService = (): MockService => {
  return new MockService();
};