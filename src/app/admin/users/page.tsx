"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  username: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', username: '', phone: '', password: '' });
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
    setForm({ name: '', username: '', phone: '', password: '' });
    setFormError('');
    setShowForm(true);
  };
  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({ name: user.name, username: user.username, phone: user.phone || '', password: '' });
    setFormError('');
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditUser(null);
    setForm({ name: '', username: '', phone: '', password: '' });
    setFormError('');
  };
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      const payload = { name: form.name, username: form.username, phone: form.phone, password: form.password };
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
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" onClick={openAdd}>
          Добавить риелтора
        </button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={closeForm}>&times;</button>
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
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={closeForm}>Отмена</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white" disabled={formLoading}>{formLoading ? 'Сохранение...' : 'Сохранить'}</button>
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
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4 font-medium">Имя</th>
                <th className="py-3 px-4 font-medium">Логин</th>
                <th className="py-3 px-4 font-medium">Телефон</th>
                <th className="py-3 px-4 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">{user.name}</td>
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">{user.phone || "-"}</td>
                  <td className="py-3 px-4 space-x-2">
                    <button className="text-blue-500 hover:underline" onClick={() => openEdit(user)}>Редактировать</button>
                    <button className="text-red-500 hover:underline" onClick={() => handleDelete(user.id)}>Удалить</button>
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