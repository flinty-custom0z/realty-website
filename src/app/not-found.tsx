import Link from 'next/link';

export const runtime = "edge";

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>404 - Страница не найдена</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Запрошенная вами страница не существует.</p>
      <Link 
        href="/" 
        style={{ 
          backgroundColor: '#11535F', 
          color: 'white', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '0.25rem',
          textDecoration: 'none' 
        }}
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
