import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "./ui/button";
import { Mic, Send, HelpCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Logo } from "./Logo";
import { useCORSBypass } from "./CORSBypass";
import { setCORSBypassFetch } from "../services/webhookService";
import "../styles/chat.css";
import { ChatMessageData } from "../services/n8nService";
import { initSession, sendMessage } from "../services/hybridService";

// Текст сообщения, которое активирует кнопку завершения
const COMPLETION_MESSAGE = "Спасибо за ответы, ваши данные сохранены, теперь вы можете закончить онбординг";

// Пример начальных сообщений для демонстрации
const initialMessages = [
  {
    id: 1,
    isUser: false,
    message: "Здравствуй, расскажи кратко о себе, ответив на несколько вопросов. Как твоё имя?",
    timestamp: "10:00",
  },
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);
  const [canComplete, setCanComplete] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Получаем CORS bypass функцию
  const { fetchWithCORSBypass } = useCORSBypass();
  
  // Устанавливаем CORS bypass функцию в webhookService при инициализации
  useEffect(() => {
    setCORSBypassFetch(fetchWithCORSBypass);
  }, [fetchWithCORSBypass]);
  
  // Генерация сессии при первой отправке сообщения
  const initializeSessionIfNeeded = async () => {
    if (sessionId) return sessionId; // Сессия уже создана
    
    setInitializing(true);
    
    try {
      // Генерируем случайный ID пользователя или используем сохраненный
      const userId = localStorage.getItem('chatUserId') || `user-${Date.now()}`;
      localStorage.setItem('chatUserId', userId);
      
      // Инициализируем сессию с вебхуком
      const newSessionId = await initSession(userId);
      
      setSessionId(newSessionId);
      console.log("Сессия инициализирована:", newSessionId);
      setConnectionError(false);
      setInitializing(false);
      
      return newSessionId;
    } catch (error) {
      console.error('Ошибка при инициализации сессии:', error);
      // В случае ошибки устанавливаем временный ID сессии
      const fallbackId = `fallback-session-${Date.now()}`;
      setSessionId(fallbackId);
      setConnectionError(true);
      setInitializing(false);
      
      return fallbackId;
    }
  };
  
  // Проверка на наличие сообщения, активирующего кнопку завершения
  useEffect(() => {
    const hasCompletionMessage = messages.some(
      msg => !msg.isUser && msg.message.includes(COMPLETION_MESSAGE)
    );
    
    if (hasCompletionMessage && !canComplete) {
      setCanComplete(true);
      console.log("Кнопка завершения активирована");
    }
  }, [messages, canComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Добавляем скрытую функцию для тестирования активации кнопки завершения
    // @ts-ignore
    window.__testCompletionButton = () => {
      const completionMessage: ChatMessageData = {
        id: Date.now(),
        isUser: false,
        message: COMPLETION_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages(prevMessages => [...prevMessages, completionMessage]);
      console.log("Тестовое сообщение завершения добавлено в чат");
    };

    // Очистка при размонтировании
    return () => {
      // @ts-ignore
      if (window.__testCompletionButton) {
        // @ts-ignore
        delete window.__testCompletionButton;
      }
    };
  }, []);

  // Функция для повторной попытки подключения
  const retryConnection = async () => {
    setConnectionError(false);
    setIsLoading(true);
    
    try {
      // Генерируем новый ID пользователя
      const userId = `user-${Date.now()}`;
      localStorage.setItem('chatUserId', userId);
      
      // Инициализируем сессию заново
      const newSessionId = await initSession(userId);
      setSessionId(newSessionId);
      
      // Добавляем сообщение об успешном подключении
      const successMessage: ChatMessageData = {
        id: Date.now(),
        isUser: false,
        message: "Соединение восстановлено. Вы можете продолжить общение.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      setMessages(prevMessages => [...prevMessages, successMessage]);
    } catch (error) {
      console.error('Ошибка при повторной инициализации сессии:', error);
      setConnectionError(true);
      
      // Добавляем сообщение об ошибке
      const errorMessage: ChatMessageData = {
        id: Date.now(),
        isUser: false,
        message: "Не удалось восстановить соединение. Пожалуйста, попробуйте позже.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для тестирования активации кнопки завершения (для использования разработчиками)
  const testCompletionButton = () => {
    const completionMessage: ChatMessageData = {
      id: Date.now(),
      isUser: false,
      message: COMPLETION_MESSAGE,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages(prevMessages => [...prevMessages, completionMessage]);
  };

  const handleSendMessage = async () => {
    // Добавляем скрытый триггер для тестирования
    if (inputValue.trim() === "/activate-completion") {
      testCompletionButton();
      setInputValue("");
      return;
    }

    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      
      // Инициализируем сессию, если она еще не создана
      const currentSessionId = sessionId || await initializeSessionIfNeeded();
      
      // Добавляем сообщение пользователя
      const newUserMessage: ChatMessageData = {
        id: Date.now(),
        isUser: true,
        message: inputValue,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      const messageTrimmed = inputValue.trim();
      setInputValue("");
      
      try {
        // Отправляем сообщение на вебхук
        const response = await sendMessage(messageTrimmed, currentSessionId);
        
        // Проверяем, является ли сообщение ошибкой
        if (response.isError) {
          setConnectionError(true);
        } else {
          setConnectionError(false);
        }
        
        // Добавляем ответ в чат
        setMessages(prevMessages => [...prevMessages, response]);
      } catch (error) {
        console.error("Ошибка при обработке сообщения:", error);
        setConnectionError(true);
        
        // Добавляем сообщение об ошибке
        const errorMessage: ChatMessageData = {
          id: Date.now(),
          isUser: false,
          message: "Произошла ошибка при обработке сообщения. Пожалуйста, попробуйте позже.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isError: true
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleRecording = async () => {
    // Инициализируем сессию, если она еще не создана
    if (!sessionId) {
      await initializeSessionIfNeeded();
    }
    
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Начинаем запись (имитация)
      setTimeout(() => {
        setIsRecording(false);
        // Имитируем отправку аудиосообщения
        const newUserMessage = {
          id: Date.now(),
          isUser: true,
          message: "🎤 Аудиосообщение",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        
        // Обработка аудиосообщения и отправка через вебхук
        setTimeout(async () => {
          setIsLoading(true);
          
          // Пример обработки аудио (в реальном приложении здесь будет логика преобразования речи в текст)
          const audioTranscription = "Это текст, полученный из аудиосообщения";
          
          try {
            // Отправляем аудиосообщение, указывая флаг isAudio
            const response = await sendMessage(audioTranscription, sessionId, true);
            
            // Проверяем, является ли сообщение ошибкой
            if (response.isError) {
              setConnectionError(true);
            } else {
              setConnectionError(false);
            }
            
            setMessages(prevMessages => [...prevMessages, response]);
          } catch (error) {
            console.error("Ошибка при обработке аудиосообщения:", error);
            setConnectionError(true);
            
            const errorMessage: ChatMessageData = {
              id: Date.now(),
              isUser: false,
              message: "Не удалось обработать аудиосообщение. Пожалуйста, попробуйте ещё раз.",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isError: true
            };
            
            setMessages(prevMessages => [...prevMessages, errorMessage]);
          } finally {
            setIsLoading(false);
          }
        }, 2000);
      }, 3000);
    }
  };

  const handleCompleteOnboarding = () => {
    if (!canComplete) return;
    
    // Здесь можно добавить логику для завершения онбординга
    // Например, отправить запрос на сервер или перенаправить пользователя
    console.log("Онбординг завершен");
    alert("Онбординг успешно завершен!");
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] shadow-lg rounded-2xl overflow-hidden border border-[#333333]">
      {/* Логотип по центру */}
      <div className="flex justify-center py-4 bg-[#1A1A1A] shrink-0">
        <Logo className="h-7 w-auto" />
      </div>
      
      {/* Панель управления */}
      <div className="flex items-center justify-end border-b border-t border-[#333333] p-3 bg-[#1A1A1A] shrink-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 border-[#7C4DFF] bg-[#1A1A1A] text-[#7C4DFF] hover:bg-[#7C4DFF] hover:text-[#121212] transition-colors duration-200"
          >
            <HelpCircle size={16} />
            <span>Поддержка</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canComplete}
            onClick={handleCompleteOnboarding}
            className={`flex items-center gap-1 ${
              canComplete 
                ? "border-[#FF9800] bg-[#1A1A1A] text-[#FF9800] hover:bg-[#FF9800] hover:text-[#121212]" 
                : "border-[#666666] bg-[#1A1A1A] text-[#666666] opacity-50 cursor-not-allowed"
            } transition-colors duration-300`}
          >
            <CheckCircle size={16} />
            <span>Завершить</span>
            {canComplete && (
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9800] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF9800]"></span>
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Область сообщений с фиксированной высотой без скролла */}
      <div className="chat-messages h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden p-4 bg-[#121212]">
        {initializing ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw size={32} className="text-[#00FF00] animate-spin" />
              <p className="text-white">Подключение к серверу...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                isUser={msg.isUser}
                message={msg.message}
                timestamp={msg.timestamp}
                isError={msg.isError}
              />
            ))}
          </>
        )}
        
        {isLoading && !initializing && (
          <div className="flex justify-start w-full gap-4 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#252525]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21.5L17.5 13L13 10L15 2.5L6.5 11L11 14L9 21.5Z"
                  fill="#00FF00"
                  stroke="#00FF00"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="max-w-[80%] rounded-2xl p-4 bg-[#252525] text-white">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Панель ошибки подключения */}
        {connectionError && !isLoading && !initializing && (
          <div className="flex justify-center w-full p-2 mt-2">
            <div className="rounded-lg p-2 bg-[#2D1A1A] text-red-400 text-sm flex items-center gap-2">
              <span>Проблема с подключением</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs py-1 px-2 h-auto border-red-500 text-red-400 hover:bg-red-900/20"
                onClick={retryConnection}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw size={12} className="animate-spin mr-1" />
                ) : null}
                Переподключиться
              </Button>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Поле ввода */}
      <div className="border-t border-[#333333] p-4 bg-[#1A1A1A] shrink-0">
        <div className="flex items-center gap-2 rounded-full bg-[#252525] p-2 pr-4">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full transition-colors duration-200 ${
              isRecording 
                ? "bg-[#FF5252] text-white hover:bg-[#FF3333] hover:text-[#121212]" 
                : "text-[#00FF00] hover:bg-[#00FF00] hover:text-[#121212]"
            }`}
            onClick={toggleRecording}
            disabled={isLoading || initializing}
          >
            <Mic size={20} />
          </Button>
          <input
            type="text"
            placeholder={
              initializing 
                ? "Подключение к серверу..." 
                : isLoading 
                  ? "Обработка сообщения..." 
                  : "Введите сообщение..."
            }
            className="flex-grow border-none bg-transparent outline-none text-white"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            disabled={isLoading || initializing}
          />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-[#00FF00] hover:bg-[#00FF00] hover:text-[#121212] transition-colors duration-200"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || initializing}
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}