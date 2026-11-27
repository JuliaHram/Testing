import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/client';
import { clearCredentials } from '../features/auth/authSlice';
import './TeacherDashboard.css';

const getLevel = (score, total) => {
  if (!total) return '—';
  const percent = (score / total) * 100;
  if (percent >= 86) return 'C1';
  if (percent >= 66) return 'B2';
  if (percent >= 50) return 'B1';
  return 'A2';
};

// Функция для нормализации ответов (убираем пробелы и регистр)
const normalize = (str) => String(str || '').trim().toLowerCase();

export default function TeacherDashboard() {
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { teacher } = useSelector(s => s.auth);

  const {
    data: list = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const { data } = await api.get('/admin/submissions');
      return data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    enabled: Boolean(teacher),
  });

  useEffect(() => {
    if (!teacher) nav('/teacher/login');
  }, [teacher, nav]);

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    dispatch(clearCredentials());
    nav('/teacher/login');
  };

  const getWritingAnswer = (answers) => {
    if (!answers || answers.length < 17) return '—';
    return answers[16] || '(Пусто)';
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dash-header">
        <div className="dash-container dash-header-content">
          <div>
            <h1 className="dash-title">Результаты тестов</h1>
            <p className="dash-subtitle">{teacher?.email}</p>
          </div>
          <button onClick={logout} className="btn-logout">Выйти</button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-toolbar">
          <div style={{ color: '#64748b', fontSize: 14 }}>
            Всего записей: <b>{list.length}</b>
          </div>
          <button onClick={() => refetch()} disabled={isFetching} className="btn-refresh">
            {isFetching ? 'Обновляю...' : 'Обновить данные'}
          </button>
        </div>

        {isLoading && <div className="loader">Загрузка результатов...</div>}
        {error && <div className="loader" style={{color: 'red'}}>Ошибка загрузки данных</div>}

        {!isLoading && list.length === 0 && (
          <div className="empty-state">
            <h3 style={{ marginTop: 0 }}>Пока нет пройденных тестов</h3>
            <p>Как только ученики начнут сдавать тесты, они появятся здесь.</p>
          </div>
        )}

        <div className="student-list">
          {list.map(s => (
            <div key={s._id} className="result-card">
              
              <div className="card-header">
                <div>
                  <h3 className="student-name">{s.studentName}</h3>
                  <div className="student-date">
                    {new Date(s.submittedAt).toLocaleString()}
                  </div>
                </div>
                <div className="score-box">
                  {/* Выводим баллы только за авто-часть */}
                  <div className="score-value">{s.score} / {s.autoChecked || s.total}</div>
                  <div className="score-label">Авто-баллы</div>
                  
                  <div style={{ 
                    marginTop: '10px', 
                    paddingTop: '10px', 
                    borderTop: '1px solid #fae3d9',
                    fontSize: '15px',
                    fontWeight: '800',
                    color: '#91bdb2',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>
                    Уровень: {getLevel(s.score, s.autoChecked || s.total)}
                  </div>
                </div>
              </div>

              <div className="essay-box">
                <div className="essay-title">Письменная часть (Writing)</div>
                <p className="essay-text">
                  {getWritingAnswer(s.answers)}
                </p>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Тестовые ответы (детально)
                </div>
                <div className="answers-grid">
                  {s.answers.map((ans, i) => {
                    if (i === 16) return null; // Пропускаем эссе

                    const questionData = s.testId?.questions?.[i];
                    const correctAnswer = questionData?.correctAnswer;
                    
                    // Сравниваем нормализованные ответы
                    const isCorrect = correctAnswer && normalize(ans) === normalize(correctAnswer);

                    let bgColor = '#f3f4f6';
                    let textColor = '#4b5563';
                    
                    if (ans) {
                      if (isCorrect) {
                        bgColor = '#dcfce7'; // Зеленый фон
                        textColor = '#166534'; // Темно-зеленый текст
                      } else {
                        bgColor = '#fee2e2'; // Красный фон
                        textColor = '#991b1b'; // Темно-красный текст
                      }
                    } else {
                      textColor = '#9ca3af';
                    }

                    return (
                      <div key={i} style={{ 
                        background: bgColor, 
                        color: textColor, 
                        fontSize: 13, 
                        padding: '8px 12px', 
                        borderRadius: 6, 
                        fontWeight: 500,
                        border: '1px solid rgba(0,0,0,0.05)',
                        minWidth: '60px'
                      }}>
                        {i + 1}. {ans || '—'}
                        {ans && !isCorrect && (
                          <span style={{ display: 'block', fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                            Верно: {correctAnswer}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
}