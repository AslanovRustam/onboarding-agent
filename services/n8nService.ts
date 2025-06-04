/**
 * Интерфейс данных сообщения чата
 */
export interface ChatMessageData {
  id: number;
  isUser: boolean;
  message: string;
  timestamp?: string;
  isError?: boolean; // Флаг для обозначения сообщений об ошибках
}

/**
 * Интерфейс сервиса для работы с сообщениями чата
 */
export interface ChatService {
  /**
   * Отправляет сообщение и получает ответ
   * @param message Текст сообщения для отправки
   * @param sessionId Идентификатор сессии (опционально)
   * @param isAudio Флаг, указывающий, является ли сообщение аудио (опционально)
   * @returns Promise с данными ответного сообщения
   */
  sendMessage: (message: string, sessionId?: string, isAudio?: boolean) => Promise<ChatMessageData>;
  
  /**
   * Инициализирует сессию для пользователя
   * @param userId Идентификатор пользователя
   * @returns Promise с идентификатором сессии
   */
  initSession: (userId: string) => Promise<string>;
}