import React, { useState, createContext, useContext } from 'react';

/**
 * Список популярных CORS прокси-сервисов
 */
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://proxy.cors.sh/',
  'https://api.allorigins.win/raw?url='
];

interface CORSBypassProps {
  children: React.ReactNode;
}

/**
 * Контекст для обхода CORS-ограничений
 */
export const CORSBypassContext = createContext({
  fetchWithCORSBypass: async (url: string, options?: RequestInit) => {
    return fetch(url, options);
  }
});

/**
 * Компонент-провайдер для обхода CORS-ограничений
 * Предоставляет функцию fetchWithCORSBypass, которая автоматически
 * пытается использовать различные CORS-прокси, если прямой запрос не удался
 */
export function CORSBypassProvider({ children }: CORSBypassProps) {
  const [workingProxyIndex, setWorkingProxyIndex] = useState<number | null>(null);

  /**
   * Выполняет запрос с обходом CORS-ограничений
   * @param url URL для запроса
   * @param options Опции запроса
   * @returns Promise с результатом запроса
   */
  const fetchWithCORSBypass = async (url: string, options?: RequestInit) => {
    // Сначала пробуем прямой запрос
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
    } catch (error) {
      console.log(`Прямой запрос не удался: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Если у нас есть рабочий прокси из предыдущих запросов, используем его
    if (workingProxyIndex !== null) {
      try {
        const proxyUrl = `${CORS_PROXIES[workingProxyIndex]}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, options);
        if (response.ok) {
          return response;
        }
      } catch (error) {
        console.log(`Запрос через известный прокси не удался: ${error instanceof Error ? error.message : String(error)}`);
        setWorkingProxyIndex(null); // Сбрасываем индекс, если прокси перестал работать
      }
    }
    
    // Если нет рабочего прокси или он перестал работать, пробуем все прокси по очереди
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      if (i === workingProxyIndex) continue; // Пропускаем уже проверенный прокси
      
      try {
        const proxyUrl = `${CORS_PROXIES[i]}${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, options);
        if (response.ok) {
          setWorkingProxyIndex(i);
          return response;
        }
      } catch (error) {
        console.log(`Прокси ${CORS_PROXIES[i]} не работает: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Если все прокси не сработали, бросаем ошибку
    throw new Error('Не удалось выполнить запрос через прямое соединение или CORS-прокси');
  };

  return (
    <CORSBypassContext.Provider value={{ fetchWithCORSBypass }}>
      {children}
    </CORSBypassContext.Provider>
  );
}

/**
 * Хук для использования функции обхода CORS
 * @returns Функция для выполнения запросов с обходом CORS
 */
export function useCORSBypass() {
  return useContext(CORSBypassContext);
}