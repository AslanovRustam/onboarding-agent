import type { ChatMessageData } from "./n8nService";

type ResponseKey = "unknown" | "greeting" | "farewell" | "n8n" | "capabilities";

const responses: Record<ResponseKey, string[]> = {
  unknown: [
    "Извините, я не совсем понял ваш вопрос. Не могли бы вы уточнить?",
    "Это интересный вопрос! Не могли бы вы рассказать больше?", 
    "Я еще изучаю этот аспект. Можете ли вы предоставить дополнительную информацию?",
    "Спасибо за вопрос. Давайте разберем это подробнее.",
  ],
  greeting: [
    "Привет! Как дела? Чем могу помочь?",
    "Здравствуйте! Рад вас видеть. О чем хотели бы поговорить?",
    "Добро пожаловать! Готов ответить на ваши вопросы.",
    "Привет! Отличный день для общения, не так ли?",
  ],
  farewell: [
    "До свидания! Было приятно пообщаться.",
    "Увидимся! Обращайтесь, если появятся вопросы.",
    "Пока! Хорошего дня!",
    "До встречи! Надеюсь, наш разговор был полезным.",
  ],
  n8n: [
    "n8n - это отличная платформа для автоматизации рабочих процессов!",
    "С помощью n8n можно создавать мощные интеграции между различными сервисами.",
    "n8n позволяет автоматизировать множество задач с помощью простого визуального интерфейса.",
    "Я работаю на базе автоматизации n8n, что позволяет мне быть более эффективным.",
  ],
  capabilities: [
    "Я могу помочь с ответами на ваши вопросы и ведением диалога.",
    "Моя задача - помочь вам в онбординге и ответить на возникающие вопросы.",
    "Я специализируюсь на поддержке пользователей и предоставлении информации.",
    "Я могу общаться как через текст, так и через голосовые сообщения.",
  ]
};

function getRandomResponse(category: ResponseKey): string {
  const categoryResponses = responses[category];
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

function categorizeMessage(message: string): ResponseKey {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("привет") || lowerMessage.includes("здравствуй") || lowerMessage.includes("добро")) {
    return "greeting";
  }
  
  if (lowerMessage.includes("пока") || lowerMessage.includes("до свидания") || lowerMessage.includes("спасибо")) {
    return "farewell";
  }
  
  if (lowerMessage.includes("n8n") || lowerMessage.includes("автоматизация") || lowerMessage.includes("интеграция")) {
    return "n8n";
  }
  
  if (lowerMessage.includes("можешь") || lowerMessage.includes("умеешь") || lowerMessage.includes("способност")) {
    return "capabilities";
  }
  
  return "unknown";
}

export function generateMockResponse(message: string, sessionId: string): ChatMessageData {
  // Базовая логика для генерации ответа
  const category = categorizeMessage(message);
  const response = getRandomResponse(category);
  
  return {
    id: Date.now(),
    isUser: false,
    message: response,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function generateSmartMockResponse(message: string, sessionId: string): ChatMessageData {
  const keywords = extractKeywords(message);
  
  if (keywords.length === 0) {
    return generateMockResponse(message, sessionId);
  }
  
  // Генерируем ответы на основе ключевых слов
  const responses: string[] = keywords.map((keyword: string) =>
    getRandomResponse(keyword as ResponseKey)
  );
  
  // Комбинируем ответы
  const combinedResponse = responses.join(" ");
  
  return {
    id: Date.now(),
    isUser: false,
    message: combinedResponse,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function extractKeywords(message: string): string[] {
  const keywordMap: Record<string, ResponseKey> = {
    "привет": "greeting",
    "здравствуй": "greeting", 
    "добро": "greeting",
    "пока": "farewell",
    "спасибо": "farewell",
    "n8n": "n8n",
    "автоматизация": "n8n",
    "можешь": "capabilities",
    "умеешь": "capabilities",
  };
  
  const lowerMessage = message.toLowerCase();
  const foundKeywords: string[] = [];
  
  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (lowerMessage.includes(keyword)) {
      foundKeywords.push(category);
    }
  }
  
  return [...new Set(foundKeywords)]; // Убираем дубликаты
}