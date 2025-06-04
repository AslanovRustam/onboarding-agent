// Этот файл нужно включить в index.html через тег script
// Он позволит настраивать конфигурацию без перекомпиляции приложения

// Инициализируем объект __ENV__ в window, если он еще не существует
window.__ENV__ = window.__ENV__ || {};

// Заполняем переменные окружения для n8n
// В продакшне эти значения можно перезаписать через инструменты развертывания
window.__ENV__.N8N_BASE_URL = window.__ENV__.N8N_BASE_URL || 'https://your-n8n-instance.com';
window.__ENV__.N8N_WORKFLOW_ID = window.__ENV__.N8N_WORKFLOW_ID || 'your-workflow-id';
window.__ENV__.N8N_API_KEY = window.__ENV__.N8N_API_KEY || 'your-api-key';