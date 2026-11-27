import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import './StudentTest.css';

const SECTIONS = ['Reading', 'Use of English', 'Writing', 'Listening'];

// Тексты для Reading (только для Part 1, 5, 6, 7)
const READING_TEXTS = {
  1: `Genealogy is a branch of history. It concerns family history, (1) ______ than the national or world history studied at school. It doesn't merely involve drawing a family tree, however – tracing your family history can also (2) ______ in learning about your roots and your identity. The internet enables millions of people worldwide to (3) ______ information about their family history, without great (4) ______.`,
  5: `We live on the island of Hale. It's about four kilometres long and two kilometres wide at its broadest point, and it's joined to the mainland by a causeway called the Stand - a narrow road built across the mouth of the river which separates us from the rest of the country. Most of the time you wouldn't know we're on an island because the river mouth between us and the mainland is just a vast stretch of tall grasses and brown mud. But when there's a high tide and the water rises a half a metre or so above the road and nothing can pass until the tide goes out again a few hours later, then you know it's an island.`,
  6: `What we ballet dancers do is instinctive, but instinct learnt through a decade of training. A dancer’s life is hard to understand, and easy to misinterpret. Many a poet and novelist has tried to do so, but even they have chosen to interpret all the hard work and physical discipline as obsessive. And so the idea persists that dancers spend every waking hour in pain, bodies at breaking point, their smiles a pretence. As a former dancer in the Royal Ballet Company here in Britain, I would beg to question this. 11_________. With expert teaching and daily practice, its various demands are easily within the capacity of the healthy human body.`,
  7: `It’s my first time driving to Chelsea’s training ground and I turn off slightly too early at the London University playing fields. Had he accepted football’s rejections in his early teenage years, it is exactly the sort of ground Duncan Williams would have found himself running around on at weekends. At his current age of 18, he would have been a bright first-year undergraduate mixing his academic studies with a bit of football, rugby and cricket, given his early talent in all these sports. However, Duncan undoubtedly took the right path. Instead of studying, he is sitting with his father Gavin in one of the interview rooms at Chelsea’s training base reflecting on Saturday’s match against Manchester City. Such has been his rise to fame that it is with some disbelief that you listen to him describing how his career was nearly all over before it began.`
};

export default function StudentTest() {
  const { id } = useParams();

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/test/${id}`)
      .then((r) => {
        setTest(r.data);
        setAnswers(new Array(r.data.questions.length).fill(''));
      })
      .catch(() => setError('Тест не найден или ссылка недействительна'))
      .finally(() => setLoading(false));
  }, [id]);

  const sectionData = useMemo(() => {
    if (!test) return [];

    return SECTIONS.map(sec => {
      const rawQuestions = test.questions
        .map((q, index) => ({ ...q, globalIndex: index }))
        .filter(q => q.section === sec);

      if (rawQuestions.length === 0) return null;

      if (sec === 'Reading' || sec === 'Listening') {
        const partsMap = {};
        rawQuestions.forEach(q => {
          const partNum = q.part || 1;
          if (!partsMap[partNum]) partsMap[partNum] = [];
          partsMap[partNum].push(q);
        });
        
        return {
          name: sec,
          parts: Object.keys(partsMap).sort((a,b) => a-b).map(pNum => ({
            partNumber: pNum,
            questions: partsMap[pNum]
          }))
        };
      }

      return { name: sec, questions: rawQuestions };
    }).filter(Boolean);
  }, [test]);

  const handleSelect = (index, value) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleNext = () => {
    setError('');
    
    if (currentStep === 0) {
      if (!name.trim() || !email.trim()) {
        return setError('Пожалуйста, заполните имя и email');
      }
    }
    
    if (currentStep === sectionData.length) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/submit', {
        testId: id,
        studentName: name.trim(),
        studentEmail: email.trim(),
        answers,
      });
      setCurrentStep(5); 
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки, попробуйте ещё раз');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Загрузка...</div>;
  if (error && !test) return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>{error}</div>;

  if (currentStep === 5) {
    return (
      <div className="student-test-wrapper">
        <div className="test-content">
          <div className="step-card success-card">
            <div className="success-icon">🎉</div>
            <h1 className="step-title">СПАСИБО, {name.toUpperCase()}!</h1>
            <p className="step-subtitle">
              Ваши ответы успешно отправлены. Преподаватель WakeUpEnglish свяжется с вами в ближайшее время.
            </p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '20px', textDecoration: 'none' }}>
              ВЕРНУТЬСЯ НА ГЛАВНУЮ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = (currentStep / sectionData.length) * 100;
  const currentSection = sectionData[currentStep - 1];

  const renderQuestion = (q) => {
    // Убираем дублирование текста для Reading Part 1
    let displayText = q.questionText;
    if (q.section === 'Reading' && q.part === 1 && displayText.includes('Genealogy')) {
      displayText = 'Вставьте пропущенное слово (1):';
    } else if (q.section === 'Reading' && q.part === 1) {
      displayText = `Вставьте пропущенное слово (${q.globalIndex + 1}):`;
    }

    return (
      <div key={q.globalIndex} className="question-block">
        <div className="question-text">{q.globalIndex + 1}. {displayText}</div>
        {q.type === 'choice' && (
          <div className="options-grid">
            {q.options.map((opt) => (
              <label key={opt} className={`option-label ${answers[q.globalIndex] === opt ? 'selected' : ''}`}>
                <input type="radio" className="option-radio" name={`q${q.globalIndex}`} value={opt} checked={answers[q.globalIndex] === opt} onChange={() => handleSelect(q.globalIndex, opt)} />
                {opt}
              </label>
            ))}
          </div>
        )}
        {q.type === 'gap' && (
          <input type="text" className="text-input" value={answers[q.globalIndex] || ''} onChange={(e) => handleSelect(q.globalIndex, e.target.value)} placeholder={q.hint ? `Подсказка: ${q.hint}` : 'Введите слово...'} />
        )}
        {q.type === 'writing' && (
          <textarea className="text-input" rows={6} value={answers[q.globalIndex] || ''} onChange={(e) => handleSelect(q.globalIndex, e.target.value)} placeholder="Напишите ваш ответ (около 50 слов)..." style={{ resize: 'vertical' }} />
        )}
      </div>
    );
  };

  return (
    <div className="student-test-wrapper">
      <header className="test-header">
        <div className="progress-container">
          <div style={{ marginBottom: 20 }}>
            <Link to="/" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: '#9ca3af', textDecoration: 'none', fontSize: '13px',
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#e26748'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              ← На главную
            </Link>
          </div>

          <div className="progress-steps">
            <div className="progress-line-bg" />
            <div className="progress-line-fill" style={{ width: `${progressPercent}%` }} />
            
            {['Старт', ...sectionData.map(s => s.name)].map((label, idx) => (
              <div key={label} className="step-dot">
                <div className={`dot-circle ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}>
                  {idx < currentStep ? '✓' : idx + 1}
                </div>
                <div className={`dot-label ${idx === currentStep ? 'active' : ''}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="test-content">
        <div className="step-card">
          {error && <div className="error-msg">{error}</div>}

          {currentStep === 0 && (
            <div>
              <h1 className="step-title">ДОБРО ПОЖАЛОВАТЬ!</h1>
              <p className="step-subtitle">
                Перед началом теста "{test.title}" пожалуйста, представьтесь.
              </p>
              <div className="input-group">
                <label className="input-label">Ваше имя и фамилия</label>
                <input className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Иван Иванов" autoFocus />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="text-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
          )}

          {currentStep > 0 && currentStep <= sectionData.length && currentSection && (
            <div>
              <h1 className="step-title">РАЗДЕЛ: {currentSection.name.toUpperCase()}</h1>
              <p className="step-subtitle">
                Вы можете пропустить сложные вопросы и вернуться к ним позже.
              </p>

              {(currentSection.name === 'Listening' || currentSection.name === 'Reading') && currentSection.parts ? (
                currentSection.parts.map((part) => (
                  <div key={part.partNumber} style={{ marginBottom: '48px' }}>
                    
                    {currentSection.name === 'Listening' ? (
                      <div style={{ background: '#fff8f6', border: '1px solid #fae3d9', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#e26748', textTransform: 'uppercase', letterSpacing: '1px' }}>🎧 PART {part.partNumber}</h3>
                        <audio controls style={{ width: '100%', height: '40px', outline: 'none' }}>
                          <source src={`/audio/Part ${part.partNumber}.mp3`} type="audio/mpeg" />
                          Ваш браузер не поддерживает аудио.
                        </audio>
                      </div>
                    ) : (
                      READING_TEXTS[part.partNumber] && (
                        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '8px', marginBottom: '24px', fontSize: '15px', lineHeight: '1.6', color: '#333' }}>
                          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#91bdb2', textTransform: 'uppercase', letterSpacing: '1px' }}>PART {part.partNumber}</h3>
                          {READING_TEXTS[part.partNumber]}
                        </div>
                      )
                    )}

                    {part.questions.map(renderQuestion)}
                  </div>
                ))
              ) : (
                currentSection.questions.map(renderQuestion)
              )}
            </div>
          )}
        </div>

        <div className="btn-nav">
          {currentStep > 0 ? (
            <button className="btn btn-secondary" onClick={handleBack} disabled={submitting}>← НАЗАД</button>
          ) : (
            <div /> 
          )}
          <button className="btn btn-primary" onClick={handleNext} disabled={submitting}>
            {submitting ? 'ОТПРАВКА...' : currentStep === sectionData.length ? 'ЗАВЕРШИТЬ ТЕСТ' : 'ДАЛЕЕ →'}
          </button>
        </div>
      </main>
    </div>
  );
}