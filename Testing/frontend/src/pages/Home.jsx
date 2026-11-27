import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';
import logoImg from '../assets/Logo.png'; 

// ФИКСИРОВАННЫЙ ID (совпадает с backend/seed.js)
const FCE_TEST_ID = '65f1a2b3c4d5e6f7a8b9c0d1'; 

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-wrapper">
      {/* Фиксированная шапка */}
      <header className={`home-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-footer-container">
          <Link to="/" className="home-logo">
            <img 
              src={logoImg} 
              alt="Wake Up English" 
              style={{ height: '120px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>
        </div>
      </header>

      {/* Скроллящаяся середина */}
      <main className="home-content-scroll">
        <div className="container">
          
          <div className="hero-section">
            <h1 className="hero-title">ПРОВЕРЬТЕ СВОЙ УРОВЕНЬ АНГЛИЙСКОГО</h1>
            <p className="hero-subtitle">
              Пройдите входное тестирование 
              и определить свой текущий уровень. Это займет не более 15 минут.
            </p>
          </div>

          {/* Сетка с тестами */}
          <div className="tests-grid">
            
            {/* Карточка FCE */}
            <div className="test-card active">
              <div className="badge badge-active">ДОСТУПНО</div>
              <h2 className="card-title">FCE</h2>
              <p className="card-subtitle">First Certificate in English</p>
              <p className="card-desc">
                Тест на уровень Upper-Intermediate (B2). Проверяет навыки чтения, письма, аудирования и знания грамматики.
              </p>
              <Link to={`/test/${FCE_TEST_ID}`} className="btn-start">
                НАЧАТЬ ТЕСТ FCE
              </Link>
            </div>

            {/* Карточка CAE */}
            <div className="test-card">
              <div className="badge badge-soon">СКОРО</div>
              <h2 className="card-title">CAE</h2>
              <p className="card-subtitle">Certificate in Advanced English</p>
              <p className="card-desc">
                Тест на уровень Advanced (C1). Для тех, кто хочет учиться или работать за рубежом.
              </p>
              <button disabled className="btn-disabled">В РАЗРАБОТКЕ</button>
            </div>

            {/* Карточка CPE */}
            <div className="test-card">
              <div className="badge badge-soon">СКОРО</div>
              <h2 className="card-title">CPE</h2>
              <p className="card-subtitle">Certificate of Proficiency in English</p>
              <p className="card-desc">
                Тест на уровень Proficiency (C2). Подтверждает владение английским на уровне носителя.
              </p>
              <button disabled className="btn-disabled">В РАЗРАБОТКЕ</button>
            </div>

          </div>
        </div>
      </main>

      {/* Фиксированный подвал */}
      <footer className="home-footer">
        <div className="header-footer-container footer-content">
          <p>© {new Date().getFullYear()} WakeUpEnglish. Все права защищены.</p>
          <Link to="/teacher/login" className="admin-link">ВХОД ДЛЯ ПРЕПОДАВАТЕЛЯ</Link>
        </div>
      </footer>
    </div>
  );
}