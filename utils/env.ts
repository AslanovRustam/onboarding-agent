/**
 * Утилита для определения окружения
 */

/**
 * Проверяет, запущено ли приложение в режиме разработки
 */
export const isDevelopment = (): boolean => {
  // Проверка window и location для предотвращения ошибок при SSR
  if (typeof window !== "undefined" && window.location) {
    const { hostname } = window.location;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.includes(".local")
    );
  }
  return false;
};

/**
 * Проверяет, запущено ли приложение в браузере
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined";
};

/**
 * Расширяет AbortSignal для поддержки таймаута
 * в браузерах, где это не поддерживается нативно
 */
if (
  isBrowser() &&
  window.AbortSignal &&
  !window.AbortSignal.timeout
) {
  window.AbortSignal.timeout = (ms: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

/**
 * Создает AbortSignal с таймаутом
 * @param ms Время таймаута в миллисекундах
 * @returns AbortSignal
 */
export const createTimeoutSignal = (
  ms: number,
): AbortSignal => {
  if (
    isBrowser() &&
    window.AbortSignal &&
    window.AbortSignal.timeout
  ) {
    return window.AbortSignal.timeout(ms);
  }

  // Запасной вариант для браузеров без поддержки AbortSignal.timeout
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};