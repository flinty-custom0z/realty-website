import React from 'react';
import ContactForm from '@/components/ui/ContactForm';
import YandexMap from '@/components/YandexMap';
import YandexMapProvider from '@/components/YandexMapProvider';

export const metadata = {
  title: 'Контакты | Опора Дом',
  description: 'Контактная информация, адрес и форма обратной связи агентства недвижимости «Опора Дом»',
};

const OFFICE_COORDINATES: [number, number] = [45.054169, 39.0294664]; // Краснодар, ул. Героя Сарабеева 5 к3

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Свяжитесь с нами</h1>

      {/* Agency description */}
      <section className="max-w-3xl mx-auto mb-12 text-gray-700 leading-relaxed">
        <p className="mb-6 text-lg">
          <strong className="text-gray-900">ОпораДом</strong> — компания, предоставляющая полный комплекс услуг на рынке недвижимости Краснодарского края. Мы помогаем купить, продать и арендовать жилую и коммерческую недвижимость в Краснодаре и других городах страны.
        </p>

        <h2 className="text-xl font-semibold mb-3">Наши преимущества</h2>
        <ul className="list-disc pl-6 space-y-1 mb-6 marker:text-sale-primary-600">
          <li>Полная проверка юридической чистоты объектов</li>
          <li>Профессиональная оценка недвижимости</li>
          <li>Сопровождение сделки «под ключ»</li>
          <li>База проверенных объектов без посредников</li>
          <li>Честные и прозрачные условия сотрудничества</li>
          <li>Опытные специалисты со знанием местного рынка</li>
        </ul>

        <h2 className="text-xl font-semibold mb-3">Специализируемся на</h2>
        <ul className="list-disc pl-6 space-y-1 mb-6 marker:text-sale-primary-600">
          <li>Квартирах в новостройках и вторичном рынке</li>
          <li>Частных домах и коттеджах</li>
          <li>Коммерческой недвижимости</li>
          <li>Земельных участках</li>
        </ul>

        <p className="text-lg">
          Работаем на протяжении 20&nbsp;лет. Помогли более 1000&nbsp;семьям найти идеальное жильё. Предоставляем бесплатные консультации по вопросам недвижимости.
        </p>
      </section>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact details & map */}
        <div className="space-y-6">
          <section>
            <p className="text-lg leading-relaxed">
              Телефон: <a href="tel:+7964441579" className="underline hover:text-sale-primary-600">+7 962 444-15-79</a>
            </p>
            <p className="text-lg leading-relaxed">
              E-mail: <a href="mailto:oporadom@gmail.com" className="underline hover:text-sale-primary-600">oporadom@gmail.com</a>
            </p>
            <p className="text-lg leading-relaxed">
              Адрес: Краснодар, ул. Героя Сарабеева д.5 к.3
            </p>
          </section>

          {/* Yandex Map */}
          <YandexMapProvider>
            <YandexMap
              center={OFFICE_COORDINATES}
              zoom={15}
              height="300px"
              markers={[{
                id: 'office',
                coordinates: OFFICE_COORDINATES,
                title: 'Офис «Опора Дом», ул. Героя Сарабеева д.5 к.3',
              }]}
              className="rounded-lg overflow-hidden"
            />
          </YandexMapProvider>
        </div>

        {/* Contact form */}
        <div>
          <ContactForm />
        </div>
      </div>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: 'Опора Дом',
            url: 'https://www.oporadom.ru',
            telephone: '+7-962-444-15-79',
            address: 'Краснодар, ул. Героя Сарабеева д.5 к.3',
            geo: {
              '@type': 'GeoCoordinates',
              latitude: OFFICE_COORDINATES[0],
              longitude: OFFICE_COORDINATES[1],
            },
          }),
        }}
      />
    </div>
  );
} 