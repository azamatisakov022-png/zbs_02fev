# Развёртывание АИС «Цифровой реестр отходов» на серверах Заказчика

Это пошаговая инструкция для системного администратора МПРЭТН КР.
Установка занимает ~30 минут на свежем сервере.

---

## 1. Системные требования

| Компонент | Минимум | Рекомендуется |
|-----------|---------|---------------|
| ОС        | Ubuntu 22.04 LTS / RHEL 9 / Debian 12 | Ubuntu 24.04 LTS |
| CPU       | 2 vCPU  | 4 vCPU |
| RAM       | 4 GB    | 8 GB |
| Диск      | 20 GB SSD | 50 GB SSD (для долгосрочных бэкапов) |
| Открытые порты (наружу) | 80 (HTTP), 443 (HTTPS) | + 22 (SSH для админа) |
| Открытые порты (только localhost) | 9001 (MinIO console) | |

---

## 2. Установка зависимостей на сервере

### Ubuntu/Debian
```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Docker и Docker Compose plugin
sudo apt install -y docker.io docker-compose-plugin git

# Запустить и включить автозапуск
sudo systemctl enable --now docker

# (Опционально) разрешить текущему пользователю docker без sudo
sudo usermod -aG docker $USER
# После этого выйти/войти в SSH-сессию заново
```

### Проверка
```bash
docker --version           # должно быть >= 24.0
docker compose version     # должно быть >= 2.20
```

---

## 3. Получение исходного кода

```bash
# Клонировать репозиторий
sudo mkdir -p /opt/eco-operator
sudo chown $USER:$USER /opt/eco-operator
cd /opt/eco-operator

git clone https://github.com/<organization>/<repo>.git .
# или, если репозиторий приватный:
# git clone git@github.com:<organization>/<repo>.git .
```

---

## 4. Конфигурация (.env)

```bash
# Скопировать шаблон
cp .env.prod.example .env

# Сгенерировать сильные пароли и JWT-секрет
openssl rand -base64 24    # для POSTGRES_PASSWORD
openssl rand -base64 64    # для JWT_SECRET
openssl rand -base64 24    # для MINIO_ROOT_PASSWORD

# Открыть .env в редакторе и подставить значения
nano .env
```

**Обязательные переменные:**
- `POSTGRES_PASSWORD` — пароль БД
- `JWT_SECRET` — secret для JWT (минимум 64 байта в base64!)
- `MINIO_ROOT_PASSWORD` — пароль для MinIO

**Опциональные:**
- `HTTP_PORT` — порт по умолчанию `80`. Если другая система уже использует 80, поставьте `8080`.
- Интеграции с ГНС/ГТС/банками — если их API уже готов, указать URL и ключи.

---

## 5. Первый запуск

```bash
# Сборка и запуск всех сервисов в фоне
docker compose -f docker-compose.prod.yml up -d --build

# Просмотр логов первичного запуска (Ctrl+C для выхода)
docker compose -f docker-compose.prod.yml logs -f
```

При первом запуске:
1. PostgreSQL запускается, создаётся БД.
2. Backend поднимается, Flyway применяет все миграции схемы и заполняет реальные ГИС-данные (V15) — ~46 объектов по Кыргызстану.
3. MinIO создаёт bucket для файлов.
4. Nginx (`web`) собирает frontend и начинает отдавать на порту 80.

**Проверка:** откройте `http://<IP-сервера>/` — должна появиться публичная ГИС-карта.

---

## 6. Создание учётных записей сотрудников

В первом запуске уже создаются 5 тестовых пользователей через миграцию `V5__seed_test_users.sql`:

| ИНН | Пароль | Роль |
|-----|--------|------|
| `01234500010002` | `test123` | EMPLOYEE (сотрудник МПРЭТН) |
| `01234500010001` | `test123` | ECO_OPERATOR |
| `00000000000001` | `test123` | ADMIN |
| `02312200210134` | `test123` | BUSINESS |

**ВАЖНО:** перед сдачей в эксплуатацию обязательно:
1. Сменить пароли всех seed-пользователей через ЛК администратора.
2. Создать реальные учётные записи сотрудников МПРЭТН.
3. Удалить или деактивировать тестовых пользователей.

---

## 7. Резервное копирование БД

Добавьте в crontab админа:
```bash
sudo crontab -e
```

```cron
# Бэкап БД ежедневно в 03:00, ротация — 30 дней
0 3 * * *  docker exec eco-postgres pg_dump -U eco eco_operator | gzip > /opt/eco-operator/backups/db_$(date +\%Y\%m\%d).sql.gz && find /opt/eco-operator/backups -name 'db_*.sql.gz' -mtime +30 -delete

# Бэкап MinIO раз в неделю по воскресеньям в 04:00
0 4 * * 0  tar -czf /opt/eco-operator/backups/minio_$(date +\%Y\%m\%d).tar.gz -C /var/lib/docker/volumes/eco-operator_minio_data/_data .
```

Создайте папку для бэкапов:
```bash
sudo mkdir -p /opt/eco-operator/backups
```

**Восстановление:**
```bash
gunzip -c /opt/eco-operator/backups/db_20260415.sql.gz | docker exec -i eco-postgres psql -U eco eco_operator
```

---

## 8. HTTPS (рекомендуется через Let's Encrypt)

Установите Certbot и nginx-proxy перед нашим стеком, либо используйте **Caddy** как reverse proxy:

```bash
# Простой вариант — Caddy
sudo apt install -y caddy
```

Создайте `/etc/caddy/Caddyfile`:
```caddy
gis.mprent.gov.kg {
  reverse_proxy localhost:80
}
```
Затем:
```bash
sudo systemctl reload caddy
```

Caddy автоматически получит TLS-сертификат и будет обновлять.

В `.env` поменяйте:
```env
HTTP_PORT=8080
```
чтобы наш контейнер слушал на 8080, а Caddy на 80/443.

---

## 9. Обновление системы

```bash
cd /opt/eco-operator

# Получить новый код
git pull origin main

# Пересобрать и перезапустить
docker compose -f docker-compose.prod.yml up -d --build

# Удалить устаревшие образы (освобождение диска)
docker image prune -f
```

Backend сам применит новые миграции БД через Flyway.

---

## 10. Мониторинг и диагностика

### Просмотр логов
```bash
# Все сервисы
docker compose -f docker-compose.prod.yml logs -f

# Только backend
docker logs -f eco-backend

# Только frontend (nginx)
docker logs -f eco-web

# Только БД
docker logs -f eco-postgres
```

### Подключение к БД
```bash
docker exec -it eco-postgres psql -U eco -d eco_operator
```

### Журнал действий пользователей (audit log)
```bash
docker exec eco-postgres psql -U eco -d eco_operator -c "
  SELECT created_at, user_name, action, entity_type, entity_id, details
  FROM audit_log
  ORDER BY created_at DESC
  LIMIT 50;
"
```

### MinIO console (только с localhost сервера)
```bash
# Через SSH-туннель с вашей машины
ssh -L 9001:127.0.0.1:9001 user@server.ip
# Затем откройте http://localhost:9001
```

---

## 11. Поддержка и контакты

При проблемах с развёртыванием обращайтесь к разработчику АИС.
Полезные ссылки:
- API документация: `http://<IP-сервера>/api/v1/swagger-ui.html`
- Исходный код: см. `<repo URL>`
- Список миграций: `backend/src/main/resources/db/migration/`

---

## Контрольный лист после установки

- [ ] `docker compose ps` — все 4 сервиса в статусе `healthy`
- [ ] `http://<IP>/` отвечает 200, видна публичная ГИС-карта с маркерами
- [ ] `http://<IP>/api/v1/public/landfills` возвращает JSON с >0 объектов
- [ ] Возможен вход в ЛК сотрудника (test-учётка работает)
- [ ] Создание объекта сотрудником появляется на публичной карте через ≤60 сек
- [ ] Cron-задача бэкапа БД настроена и отрабатывает
- [ ] HTTPS-сертификат получен (если используется Caddy/Certbot)
- [ ] Сменены пароли всех тестовых seed-пользователей
- [ ] Создан админ-аккаунт с реальными credentials
