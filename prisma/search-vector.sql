-- Убираем колонку, если db push уже создал её "пустой" (без логики генерации)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "searchVector";

-- Вычисляемая колонка: Postgres сам заполнит её для всех текущих товаров
-- и будет пересчитывать при каждом добавлении/изменении.
-- Вес A (важнее всего) — название; B — производитель+модель; C — инв. номер; D — описание.
ALTER TABLE "Product" ADD COLUMN "searchVector" tsvector
GENERATED ALWAYS AS (
  setweight(to_tsvector('russian', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('russian', coalesce("manufacturer", '') || ' ' || coalesce("model", '')), 'B') ||
  setweight(to_tsvector('russian', coalesce("inventoryNumber", '')), 'C') ||
  setweight(to_tsvector('russian', coalesce("description", '')), 'D')
) STORED;

CREATE INDEX IF NOT EXISTS "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");
