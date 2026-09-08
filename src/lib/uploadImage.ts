/**
 * Загружает фото товара в Supabase Storage, аккуратно раскладывая по папкам:
 * products/{productId}/images/...  — если товар уже существует
 * products/_unassigned/images/...  — если товар ещё создаётся (форма "новый товар")
 */
export async function uploadProductImage(file: File, productId?: string): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Загрузка фото не настроена — не заданы переменные Supabase");
  }

  const fileExt = file.name.split(".").pop();
  const folder = productId ? `products/${productId}/images` : "products/_unassigned/images";
  const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;

  const res = await fetch(`${supabaseUrl}/storage/v1/object/product-photos/${fileName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      apikey: anonKey,
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Ошибка загрузки файла");
  }

  return `${supabaseUrl}/storage/v1/object/public/product-photos/${fileName}`;
}
