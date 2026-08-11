# Video Uniqueizer Pro - Руководство для контрибьюторов

## Стандарты кода

### TypeScript
- Строгий режим (`strict: true`)
- Никаких `any` типов
- Явные возвращаемые типы для функций
- Использовать интерфейсы для публичных API

### Стиль кода
- Prettier для форматирования
- ESLint flat config для линтинга
- 2 пробела для отступов
- Одинарные кавычки для строк

### Именование
- Файлы: `kebab-case.ts` (например, `license-client.ts`)
- Классы: `PascalCase`
- Функции/переменные: `camelCase`
- Константы: `UPPER_SNAKE_CASE`
- Типы/Интерфейсы: `PascalCase`

## Структура коммитов

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: добавлена новая функция
fix: исправление ошибки
docs: обновление документации
style: форматирование кода
refactor: рефакторинг без изменений функционала
test: добавление тестов
chore: обновление зависимостей, настройка сборки
```

Примеры:
```bash
git commit -m "feat: добавлен эффект размытия"
git commit -m "fix: исправлена ошибка валидации лицензии"
git commit -m "docs: обновлена LICENSE-API.md"
```

## Ветка и Pull Requests

### Ветки
- `main` - стабильная версия
- `develop` - текущая разработка
- `feature/*` - новые функции
- `fix/*` - исправления
- `release/*` - подготовка релиза

### Process
1. Форкните репозиторий
2. Создайте ветку (`git checkout -b feature/my-feature`)
3. Внесите изменения
4. Закоммитьте согласно стандартам
5. Запушьте (`git push origin feature/my-feature`)
6. Откройте Pull Request

## Тестирование

### Перед коммитом
```bash
# Линтинг
pnpm lint

# Проверка типов
pnpm typecheck

# Сборка
pnpm build
```

### Desktop App
Проверьте:
- [ ] Все IPC handlers работают
- [ ] Очередь задач обрабатывается корректно
- [ ] Прогресс отображается правильно
- [ ] Обработка ошибок не ломает приложение
- [ ] Логи записываются

### License Server
Проверьте:
- [ ] API endpoints возвращают правильные статусы
- [ ] Валидация токенов работает
- [ ] Rate limiting активен
- [ ] Audit log записывается

## Добавление новых эффектов

1. Добавьте тип в `packages/shared-types/src/effects.ts`
2. Реализуйте FFmpeg фильтр в `packages/ffmpeg-command-builder/src/video-filters.ts` или `audio-filters.ts`
3. Добавьте UI компонент в `apps/desktop/renderer/src/components/effects/`
4. Обновите переводы в `ru.json` и `en.json`
5. Добавьте документацию в `docs/EFFECTS.md`

## Работа с i18n

Все строки UI должны быть в файлах локализации:
- `apps/desktop/renderer/src/i18n/ru.json`
- `apps/desktop/renderer/src/i18n/en.json`

Не используйте хардкод строк в компонентах!

```typescript
// ❌ Плохо
<h1>Настройки</h1>

// ✅ Хорошо
<h1>{t('settings.title')}</h1>
```

## Безопасность

### Никогда не коммитьте:
- Пароли
- API ключи
- Приватные токены
- `.env` файлы с реальными значениями

### Используйте placeholder:
```env
SECRET_KEY=your_secret_key_here_change_in_production
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

## Релизы

Версионирование по [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH` (например, `1.2.3`)
- `MAJOR` - ломающие изменения
- `MINOR` - новые функции (обратно совместимые)
- `PATCH` - исправления ошибок

### Checklist перед релизом
- [ ] Все тесты проходят
- [ ] Документация обновлена
- [ ] CHANGELOG.md заполнен
- [ ] Версия в package.json обновлена
- [ ] Installer собран и протестирован

## Контакты

По вопросам обращайтесь:
- GitHub Issues
- Email: support@video-uniqueizer.pro
