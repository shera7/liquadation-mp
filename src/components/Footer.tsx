import { getSiteSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSiteSettings();
  const siteName = settings.siteName || "Актив.Каталог";

  const hasContacts =
    settings.contactPhone || settings.contactTelegram || settings.contactEmail || settings.contactAddress;

  return (
    <footer id="contacts" className="bg-graphite text-steelLight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="font-display font-700 text-white mb-3">{siteName}</div>
          <p className="text-sm leading-relaxed">
            Цифровая витрина имущества, реализуемого в рамках процедуры банкротства.
            Заявка → менеджер → переговоры → продажа.
          </p>
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">Контакты</div>
          {hasContacts ? (
            <ul className="text-sm space-y-1.5">
              {settings.contactPhone && <li>Телефон: {settings.contactPhone}</li>}
              {settings.contactTelegram && <li>Telegram: {settings.contactTelegram}</li>}
              {settings.contactWhatsapp && <li>WhatsApp: {settings.contactWhatsapp}</li>}
              {settings.contactEmail && <li>Email: {settings.contactEmail}</li>}
              {settings.contactAddress && <li>{settings.contactAddress}</li>}
            </ul>
          ) : (
            <p className="text-sm text-steel">Контакты появятся здесь после заполнения в настройках сайта</p>
          )}
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">Информация</div>
          <ul className="text-sm space-y-1.5">
            <li>Порядок реализации имущества</li>
            <li>Условия покупки</li>
            <li>Политика конфиденциальности</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-steel">
        © {new Date().getFullYear()} {siteName}
      </div>
    </footer>
  );
}
