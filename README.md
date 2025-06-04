# Enable3.io Chat Onboarding

Интерфейс чата для онбординга пользователей enable3.io с интеграцией n8n webhook.

## Особенности

- 🎨 Современный темный дизайн
- 💬 ChatGPT-стиль интерфейса сообщений
- 🎤 Поддержка аудио сообщений (имитация)
- 🔗 Интеграция с n8n webhook
- 📱 Адаптивный дизайн
- ⚡ Быстрая загрузка с Vite
- 🎯 TypeScript поддержка

## Технологический стек

- **React 18** - UI библиотека
- **TypeScript** - Типизация
- **Vite** - Сборщик и dev сервер
- **Tailwind CSS v4** - CSS фреймворк
- **Lucide React** - Иконки
- **ShadCN/UI** - UI компоненты

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Предварительный просмотр production сборки
npm run preview
```

## Структура проекта

```
├── components/          # React компоненты
│   ├── ui/             # ShadCN UI компоненты
│   ├── ChatInterface.tsx
│   ├── ChatMessage.tsx
│   └── ...
├── services/           # API сервисы
├── styles/            # CSS файлы
├── utils/             # Утилиты
└── types/             # TypeScript типы
```

## Развертывание

См. [DEPLOYMENT.md](./DEPLOYMENT.md) для подробных инструкций по развертыванию на различных платформах.

## Конфигурация

### Webhook URL

По умолчанию используется production webhook. Для изменения отредактируйте `services/hybridService.ts`:

```typescript
const WEBHOOK_URLS = [
  "https://your-webhook-url.com",
];
```

### Настройка сообщений

Начальное сообщение можно изменить в `components/ChatInterface.tsx`:

```typescript
const initialMessages = [
  {
    id: 1,
    isUser: false,
    message: "Ваше приветственное сообщение",
    timestamp: "10:00",
  },
];
```

## API интеграция

Проект интегрируется с n8n webhook, отправляя следующие данные:

```typescript
{
  message: string,           // Текст сообщения
  sessionId: string,        // ID сессии
  timestamp: string,        // ISO timestamp
  type: 'text' | 'audio',   // Тип сообщения
  source: 'enable3-chat'    // Источник
}
```

## Разработка

### Добавление новых компонентов

1. Создайте компонент в папке `components/`
2. Используйте TypeScript для типизации
3. Следуйте существующим паттернам именования

### Стилизация

Проект использует Tailwind CSS v4. Кастомные стили определены в `styles/globals.css`.

### Тестирование

Для тестирования кнопки завершения используйте команду в консоли браузера:

```javascript
window.__testCompletionButton()
```

Или отправьте сообщение:
```
/activate-completion
```

## Лицензия

Этот проект принадлежит enable3.io. Все права защищены.

## Поддержка

При возникновении вопросов обращайтесь к команде разработки enable3.io.