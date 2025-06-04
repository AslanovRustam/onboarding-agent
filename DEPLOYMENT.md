# Инструкции по развертыванию проекта

## Экспорт и настройка проекта

### 1. Подготовка локальной среды

```bash
# Скачайте все файлы проекта в папку
# Убедитесь, что у вас установлен Node.js (версия 18 или выше)
node --version
npm --version

# Очистите старые зависимости (если есть)
rm -rf node_modules package-lock.json

# Установите зависимости
npm install

# Запустите проект локально для тестирования
npm run dev
```

### 2. Устранение возможных ошибок

**Если получаете ошибки TypeScript о недостающих модулях:**

1. Убедитесь, что все зависимости установлены:
   ```bash
   npm install @radix-ui/react-slot class-variance-authority
   ```

2. Если проблемы с Radix UI компонентами:
   ```bash
   npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip
   ```

**Если получаете ошибку "Dynamic require is not supported":**

1. Попробуйте удалить node_modules и переустановить:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Если ошибка сохраняется, замените содержимое `vite.config.ts` на минимальную версию:
   ```bash
   cp vite.config.minimal.ts vite.config.ts
   ```

**Если проблемы с Tailwind CSS:**

1. Убедитесь, что все конфигурационные файлы используют синтаксис ES модулей
2. Проверьте, что в `postcss.config.js` используется `export default`

### 3. Сборка проекта

```bash
# Создайте production сборку
npm run build

# Папка dist будет содержать готовые файлы для развертывания
```

## Быстрые варианты хостинга

### 1. Vercel (Рекомендуется)

**Простой способ:**
1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Загрузите проект на GitHub
3. Подключите репозиторий к Vercel через веб-интерфейс
4. Vercel автоматически соберет и развернет проект

**Через CLI:**
```bash
npm i -g vercel
vercel
```

### 2. Netlify

1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. Выполните `npm run build`
3. Перетащите папку `dist` в веб-интерфейс Netlify

### 3. GitHub Pages

```bash
npm install --save-dev gh-pages
```

Добавьте в package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Затем:
```bash
npm run deploy
```

### 4. Surge.sh (Самый простой)

```bash
npm install -g surge
npm run build
cd dist
surge
```

### 5. Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Устранение проблем

### Node.js версии:

Убедитесь, что используете Node.js версии 18 или выше:
```bash
node --version
```

Если версия старше, обновите Node.js с [nodejs.org](https://nodejs.org)

### Очистка проекта:

```bash
# Полная очистка
rm -rf node_modules package-lock.json dist .vite
npm install
```

### Проблемы с зависимостями:

```bash
# Попробуйте с флагами
npm install --legacy-peer-deps

# Или принудительно
npm install --force

# Очистка кеша
npm cache clean --force
```

### Проблемы с TypeScript:

Если возникают ошибки типов:
```bash
# Перезапустите TypeScript сервер в VSCode
# Ctrl+Shift+P > "TypeScript: Restart TS Server"

# Или очистите TypeScript кеш
npx tsc --build --clean
```

### Альтернативная установка:

Если ничего не помогает, попробуйте yarn:
```bash
npm install -g yarn
yarn install
yarn dev
```

## Проверка работы

После успешного запуска:
1. Откройте http://localhost:3000
2. Проверьте работу чата
3. Убедитесь, что нет ошибок в консоли браузера
4. Проверьте отправку сообщений

## Поддержка

При возникновении проблем:
1. Проверьте версии Node.js и npm
2. Посмотрите логи в консоли
3. Убедитесь в корректности всех конфигурационных файлов
4. Проверьте работу API endpoints в network вкладке браузера