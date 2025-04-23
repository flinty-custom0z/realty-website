"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ClientImage from '@/components/ClientImage';
import Button from '@/components/Button';

interface User {
  id: string;
  name: string;
  username: string;
  phone?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', username: '', phone: '', password: '', photo: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError("Ошибка загрузки списка риелторов");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить риелтора?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления");
      fetchUsers();
    } catch (err) {
      alert("Ошибка при удалении риелтора");
    }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: '', username: '', phone: '', password: '', photo: '' });
    setFormError('');
    setShowForm(true);
  };
  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({ name: user.name, username: user.username, phone: user.phone || '', password: '', photo: user.photo || '' });
    setFormError('');
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditUser(null);
    setForm({ name: '', username: '', phone: '', password: '', photo: '' });
    setFormError('');
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/users/upload-photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.path) {
        setForm((prev) => ({ ...prev, photo: data.path }));
      } else {
        setFormError(data.error || 'Ошибка загрузки фото');
      }
    } catch {
      setFormError('Ошибка загрузки фото');
    }
  };
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      if (!form.name || !form.username || (!editUser && !form.password)) {
        setFormError('Имя, логин и пароль обязательны');
        setFormLoading(false);
        return;
      }
      const payload = { name: form.name, username: form.username, phone: form.phone, password: form.password, photo: form.photo };
      let res;
      if (editUser) {
        res = await fetch(`/api/admin/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || 'Ошибка сохранения');
        setFormLoading(false);
        return;
      }
      closeForm();
      fetchUsers();
    } catch (err) {
      setFormError('Ошибка сети');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Риелторы</h1>
        <button className="admin-add-btn" onClick={openAdd}>
          Добавить риелтора
        </button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeForm}>
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{editUser ? 'Редактировать' : 'Добавить'} риелтора</h2>
            <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя *</label>
                <input name="name" value={form.name} onChange={handleFormChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Логин *</label>
                <input name="username" value={form.username} onChange={handleFormChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <input name="phone" value={form.phone} onChange={handleFormChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Пароль {editUser ? '(оставьте пустым для без изменений)' : '*'}</label>
                <input name="password" type="password" value={form.password} onChange={handleFormChange} className="w-full p-2 border rounded" autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Фото</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full p-2 border rounded" />
                {form.photo && (
                  <div className="mt-2">
                    <ClientImage src={form.photo} alt={form.name || 'Фото'} className="avatar-image" fill={false} />
                  </div>
                )}
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded" onClick={closeForm}>Отмена</button>
                <button type="submit" className="admin-add-btn" disabled={formLoading}>
                  {formLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-8 text-center">Загрузка...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Имя</th>
                <th>Логин</th>
                <th>Телефон</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.photo ? (
                      <ClientImage src={user.photo} alt={user.name} className="avatar-image" fill={false} />
                    ) : (
                      <div className="avatar-placeholder">{user.name.charAt(0)}</div>
                    )}
                  </td>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.phone ? (
                      <a href={`tel:${user.phone}`} className="text-blue-500 hover:text-blue-700 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {user.phone}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="space-x-2 admin-btn-group">
                    <button className="admin-edit-link" onClick={() => openEdit(user)}>Редактировать</button>
                    <button className="admin-delete-btn" onClick={() => handleDelete(user.id)}>Удалить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 