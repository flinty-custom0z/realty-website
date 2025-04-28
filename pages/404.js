import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Страница не найдена</h1>
      <p className="text-xl mb-8">Запрошенная вами страница не существует.</p>
      <Link 
        href="/" 
        className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
