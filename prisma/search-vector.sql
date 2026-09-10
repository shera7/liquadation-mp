-- 1) Убираем предыдущую версию (вычисляемая GENERATED-колонка конфликтует с Prisma db push)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "searchVector";

-- 2) Обычная колонка — Prisma её видит как самую заурядную колонку, ничего не пытается чинить
ALTER TABLE "Product" ADD COLUMN "searchVector" tsvector;

-- 3) Функция и триггер: сами пересчитывают searchVector при добавлении/изменении товара
CREATE OR REPLACE FUNCTION product_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('russian', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('russian', coalesce(NEW."manufacturer", '') || ' ' || coalesce(NEW."model", '')), 'B') ||
    setweight(to_tsvector('russian', coalesce(NEW."inventoryNumber", '')), 'C') ||
    setweight(to_tsvector('russian', coalesce(NEW."description", '')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_search_vector_trigger ON "Product";
CREATE TRIGGER product_search_vector_trigger
BEFORE INSERT OR UPDATE ON "Product"
FOR EACH ROW EXECUTE FUNCTION product_search_vector_update();

-- 4) Заполняем уже существующие товары один раз
UPDATE "Product" SET "searchVector" =
  setweight(to_tsvector('russian', coalesce("title", '')), 'A') ||
  setweight(to_tsvector('russian', coalesce("manufacturer", '') || ' ' || coalesce("model", '')), 'B') ||
  setweight(to_tsvector('russian', coalesce("inventoryNumber", '')), 'C') ||
  setweight(to_tsvector('russian', coalesce("description", '')), 'D');

-- 5) Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS "Product_searchVector_idx" ON "Product" USING GIN ("searchVector");
