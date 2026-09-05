export async function uploadMarketingImage(file: File): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Загрузка изображений не настроена — не заданы переменные Supabase");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `marketing/${crypto.randomUUID()}.${fileExt}`;

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
    throw new Error(err.message || "Ошибка загрузки изображения");
  }

  return `${supabaseUrl}/storage/v1/object/public/product-photos/${fileName}`;
}
