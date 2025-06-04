// Расширение типа AbortSignal для включения метода timeout
interface AbortSignalStatic {
  /**
   * Returns an AbortSignal that will automatically abort after the given amount of milliseconds.
   * @param milliseconds The amount of time to wait before aborting in milliseconds.
   */
  timeout(milliseconds: number): AbortSignal;
}

interface Window {
  AbortSignal: AbortSignalStatic;
}