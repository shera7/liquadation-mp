import BulkPhotoImport from "@/components/admin/BulkPhotoImport";

export const dynamic = "force-dynamic";

export default function ImportPhotosPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-800 text-2xl text-graphite mb-2">Массовая загрузка фото</h1>
      <p className="text-steel text-sm mb-6">
        Назовите файлы по инвентарному номеру товара — например 000123.jpg. Для нескольких фото одного товара используйте суффикс: 000123-1.jpg, 000123-2.jpg.
      </p>
      <BulkPhotoImport />
    </div>
  );
}
