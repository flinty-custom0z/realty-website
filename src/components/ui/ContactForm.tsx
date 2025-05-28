'use client';

import { useState, FormEvent } from 'react';
import { ThemeButton } from './ThemeButton';
import { useDealType } from '@/contexts/DealTypeContext';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { dealType } = useDealType();

  // Gradient background class based on deal type
  const gradientClass = dealType === 'sale' 
    ? 'bg-gradient-to-br from-sale-primary-300 to-sale-primary-600' 
    : 'bg-gradient-to-br from-rent-primary-300 to-rent-primary-600';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, message }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка при отправке формы');
      }
      
      // Reset form and show success message
      setName('');
      setPhone('');
      setMessage('');
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке формы');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common input class with proper borders
  const inputClass = "w-full px-4 py-3 rounded-lg border-2 border-white border-opacity-50 bg-white bg-opacity-90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent shadow-sm";

  return (
    <div className={`rounded-xl p-8 text-black shadow-lg ${gradientClass}`}>
      <h2 className="text-2xl font-bold mb-4 text-center tracking-tight">Бесплатная консультация экспертов</h2>
      
      <p className="text-center mb-6 text-lg opacity-90 max-w-2xl mx-auto">
        Оставьте свой номер телефона, мы назначим время звонка и поможем принять решение
      </p>
      
      {success ? (
        <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
          <p className="font-medium">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className={inputClass}
                required
              />
            </div>
            
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Телефон"
                className={inputClass}
                required
              />
            </div>
          </div>
          
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Сообщение (необязательно)"
              className={`${inputClass} resize-none`}
              rows={3}
            />
          </div>
          
          <div className="text-center">
            <ThemeButton
              type="submit"
              variant="outline"
              size="lg"
              className="bg-white text-gray-800 hover:bg-gray-100 font-medium px-8 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </ThemeButton>
          </div>
        </form>
      )}
    </div>
  );
} 