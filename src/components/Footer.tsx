export default function Footer() {
  return (
    <footer id="contacts" className="bg-graphite text-steelLight mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="font-display font-700 text-white mb-3">АКТИВ.КАТАЛОГ</div>
          <p className="text-sm leading-relaxed">
            Цифровая витрина имущества, реализуемого в рамках процедуры банкротства.
            Заявка → менеджер → переговоры → продажа.
          </p>
        </div>
        <div>
          <div className="text-white font-semibold mb-3 text-sm">Контакты</div>
          <ul className="text-sm space-y-1.5">
            <li>Телефон: +998 XX XXX XX XX</li>
            <li>Telegram: @asset_manager</li>
            <li>Email: sales@example.uz</li>
            <li>Ташкент, Узбекистан</li>
          </ul>
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
        © {new Date().getFullYear()} Актив.Каталог
      </div>
    </footer>
  );
}
