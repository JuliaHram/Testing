import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../api/client';
import { setCredentials } from '../features/auth/authSlice';
import './TeacherLogin.css';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(setCredentials({
        teacher: data.teacher,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      }));
      nav('/teacher/dashboard');
    } catch {
      setError('Неверный email или пароль');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <Link to="/" className="login-back-link">← На главную</Link>
        
        <h2 className="login-title">Вход преподавателя</h2>
        <p className="login-subtitle">Панель управления WakeUpEnglish</p>

        <form onSubmit={submit} className="login-form" autoComplete="off">
          {error && <div className="login-error">{error}</div>}
          
          {/* Обманка для браузера, чтобы он не подставлял пароль */}
          <div style={{ display: 'none' }}>
            <input type="text" name="fakeusernameremembered" />
            <input type="password" name="fakepasswordremembered" />
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="text-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              name="teacher_email_field"
              autoComplete="new-email"
              autoFocus
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Пароль</label>
            <input
              type="password"
              className="text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите ваш пароль"
              name="teacher_password_field"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="login-btn">
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
}