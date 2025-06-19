`psql` остановился на строке, где выполняется
`REVOKE … FROM cloud_admin;` – в дампе фигурирует ещё одна роль,
которой нет в вашей локальной СУБД. Самый быстрый способ ―
**создать фиктивную роль cloud\_admin** перед импортом.
Чтобы не ловить такие ошибки по одной, можно автоматически
создать все роли, упомянутые в файле.

---

## 1 - Показать все роли, встречающиеся в дампе

```bash
# Выведет уникальный список имён после "Owner:" или "role ..."
awk '/Owner: / {print $NF}
     /role "/ {gsub(/"/, "", $2); print $2}' \
     database_cleaned4.sql | sort -u
```

Обычно вы увидите что-то вроде:

```
cloud_admin
neondb_owner
neon_superuser
postgres
```

*(`postgres` уже существует, остальные — надо создать.)*

---

## 2 - Создать отсутствующие роли разом

```bash
psql -U postgres <<'SQL'
DO $$
DECLARE
  r text;
  needed text[] := ARRAY['cloud_admin','neondb_owner','neon_superuser'];
BEGIN
  FOREACH r IN ARRAY needed LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I;', r);
    END IF;
  END LOOP;
END$$;
SQL
```

> Если появятся ещё имена — добавьте их в массив `needed`.

---

## 3 - Повторить импорт (в одной транзакции)

```bash
# На всякий случай начинаем с чистой базы
psql -U postgres -c 'DROP DATABASE IF EXISTS oporadom_test WITH (FORCE);'
createdb -U postgres -O test_user oporadom_test

psql -U postgres -d oporadom_test \
     --single-transaction \
     -v ON_ERROR_STOP=1 \
     -f database_cleaned4.sql
```

Теперь файл должен дойти до конца без ошибок.

---

## 4 - Передать владение объектами рабочему пользователю

```bash
psql -U postgres -d oporadom_test <<'SQL'
ALTER SCHEMA public OWNER TO test_user;
REASSIGN OWNED BY neondb_owner   TO test_user;
REASSIGN OWNED BY cloud_admin    TO test_user;
REASSIGN OWNED BY neon_superuser TO test_user;
-- Удалить фиктивные роли, если больше не нужны
DROP ROLE IF EXISTS neondb_owner, cloud_admin, neon_superuser;
SQL
```

Проверяем:

```bash
psql -U test_user -d oporadom_test -c '\dt'
psql -U test_user -d oporadom_test -c 'SELECT COUNT(*) FROM "Listing";'
```

Если таблицы выводятся и запросы работают без `permission denied`,
локальная база готова — точно так же поступите на VPS.

---

### Итог

1. Найдите все незнакомые роли в дампе.
2. Создайте их фиктивно перед импортом.
3. Импортируйте файл в одной транзакции.
4. Переназначьте владельца объектов своему пользователю и удалите
   фиктивные роли.

Так вы избежите дальнейших остановок `psql` и получите рабочую
копию базы, пригодную для локального тестирования и для загрузки
на сервер reg.ru.
