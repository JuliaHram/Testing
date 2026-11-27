require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Test = require('./models/Test');
const Teacher = require('./models/Teacher');

// ФИКСИРОВАННЫЙ ID ТЕСТА (никогда не меняется)
const FIXED_TEST_ID = new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d1');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB подключён для seed');

  await Test.deleteMany({});
  await Teacher.deleteMany({});

  const test = await Test.create({
    _id: FIXED_TEST_ID, // <-- Принудительно задаем ID
    title: 'Входное тестирование — WakeUpEnglish',
    questions: [

      // ===== READING — Part 1 =====
      {
        section: 'Reading', part: 1, type: 'choice',
        questionText: 'Genealogy is a branch of history. It concerns family history, (1) ______ than the national or world history studied at school. It doesn\'t merely involve drawing a family tree, however – tracing your family history can also (2) ______ in learning about your roots and your identity. The internet enables millions of people worldwide to (3) ______ information about their family history, without great (4) ______.',
        options: ['instead', 'rather', 'except', 'sooner'],
        correctAnswer: 'rather',
      },
      {
        section: 'Reading', part: 1, type: 'choice',
        questionText: 'Вопрос 2: (2) ______',
        options: ['cause', 'mean', 'result', 'lead'],
        correctAnswer: 'result',
      },
      {
        section: 'Reading', part: 1, type: 'choice',
        questionText: 'Вопрос 3: (3) ______',
        options: ['accomplish', 'access', 'approach', 'admit'],
        correctAnswer: 'access',
      },
      {
        section: 'Reading', part: 1, type: 'choice',
        questionText: 'Вопрос 4: (4) ______',
        options: ['fee', 'price', 'charge', 'expense'],
        correctAnswer: 'expense',
      },

      // ===== USE OF ENGLISH — Part 2 =====
      {
        section: 'Use of English', part: 2, type: 'gap',
        questionText: 'The Le Mans race track in France was (5) ______ I first saw some guys doing motorbike stunts.',
        correctAnswer: 'where',
      },
      {
        section: 'Use of English', part: 2, type: 'gap',
        questionText: 'I\'d never seen anyone riding a motorbike using just the back wheel before and I was (6) ______ impressed I went straight home and taught (7) ______ to do the same.',
        correctAnswer: 'so',
      },
      {
        section: 'Use of English', part: 2, type: 'gap',
        questionText: 'I\'d never seen anyone riding a motorbike using just the back wheel before and I was so impressed I went straight home and taught (7) ______ to do the same.',
        correctAnswer: 'myself',
      },

      // ===== USE OF ENGLISH — Part 3 =====
      {
        section: 'Use of English', part: 3, type: 'gap',
        questionText: 'China is currently the largest (8) ______ of garlic. [PRODUCT]',
        hint: 'PRODUCT',
        correctAnswer: 'producer',
      },
      {
        section: 'Use of English', part: 3, type: 'gap',
        questionText: 'Garlic has long had a history as a health-giving food, used both to prevent and cure (9) ______ . [ILL]',
        hint: 'ILL',
        correctAnswer: 'illness',
      },

      // ===== READING — Part 5 =====
      {
        section: 'Reading', part: 5, type: 'choice',
        questionText: 'We live on the island of Hale. It is joined to the mainland by a causeway. When there is a high tide and the water rises above the road, nothing can pass until the tide goes out a few hours later. In the first paragraph, what is Caitlin\'s main point about the island?',
        options: [
          'It can be dangerous to try to cross from the mainland.',
          'It is much smaller than it looks from the mainland.',
          'It is only completely cut off at certain times.',
          'It can be a difficult place for people to live in.',
        ],
        correctAnswer: 'It is only completely cut off at certain times.',
      },

      // ===== READING — Part 6 =====
      {
        section: 'Reading', part: 6, type: 'choice',
        questionText: 'A former ballet dancer explains what ballet training involves. "As a former dancer in the Royal Ballet Company here in Britain, I would beg to question this. 11 ______ . With expert teaching and daily practice, its various demands are easily within the capacity of the healthy human body." Which sentence best fits the gap?',
        options: [
          'The ballet shoe offers some support, but the real strength is in the muscles, built up through training.',
          'Ballet technique is certainly extreme but it is not, in itself, dangerous.',
          'The principle is identical in the gym – pushing yourself to the limit, but not beyond, will eventually bring the desired result.',
        ],
        correctAnswer: 'Ballet technique is certainly extreme but it is not, in itself, dangerous.',
      },

      // ===== READING — Part 7 =====
      {
        section: 'Reading', part: 7, type: 'choice',
        questionText: 'Текст о футболисте Duncan Williams. Does the text state how surprised the writer was at Duncan\'s early difficulties? (12)',
        options: ['Yes', 'No'],
        correctAnswer: 'Yes',
      },
      {
        section: 'Reading', part: 7, type: 'choice',
        questionText: 'Does the text say that Duncan sometimes seems much more mature than he really is? (13)',
        options: ['Yes', 'No'],
        correctAnswer: 'No',
      },
      {
        section: 'Reading', part: 7, type: 'choice',
        questionText: 'Does the text describe the frustration felt by Duncan\'s father? (14)',
        options: ['Yes', 'No'],
        correctAnswer: 'No',
      },
      {
        section: 'Reading', part: 7, type: 'choice',
        questionText: 'Does the text say that Duncan is on course to reach a high point in his profession? (15)',
        options: ['Yes', 'No'],
        correctAnswer: 'No',
      },
      {
        section: 'Reading', part: 7, type: 'choice',
        questionText: 'Does the text explain how Duncan was a good all-round sportsperson? (16)',
        options: ['Yes', 'No'],
        correctAnswer: 'Yes',
      },

      // ===== WRITING =====
      {
        section: 'Writing', part: 8, type: 'writing', points: 5,
        questionText: 'Which would you prefer to have: a job which is well paid but monotonous or one which is poorly paid but fulfilling? Why? Write your answer in about 50 words.',
        correctAnswer: '',
      },

      // ===== LISTENING — Part 1 =====
      {
        section: 'Listening', part: 1, type: 'choice',
        questionText: 'Вы услышите сообщение на автоответчике. Почему звонит говорящий?',
        options: [
          'to confirm some arrangements',
          'to issue an invitation',
          'to persuade someone to do something',
        ],
        correctAnswer: 'to issue an invitation',
      },

      // ===== LISTENING — Part 2 =====
      {
        section: 'Listening', part: 2, type: 'gap',
        questionText: 'Angela Thomas о спектакле «Spectacled bear». Angela says that it was the ______ of the spectacled bear that first interested her.',
        correctAnswer: 'name',
      },
      {
        section: 'Listening', part: 2, type: 'gap',
        questionText: 'Angela mentions that the bear\'s markings can be found on its ______ as well as its eyes and cheeks.',
        correctAnswer: 'chest',
      },
      {
        section: 'Listening', part: 2, type: 'gap',
        questionText: 'Angela is pleased by evidence that spectacled bears have been seen in ______ areas of Argentina.',
        correctAnswer: 'northern',
      },
      {
        section: 'Listening', part: 2, type: 'gap',
        questionText: 'Angela says the bears usually live in ______, though they can also be found in other places.',
        correctAnswer: 'forests',
      },

      // ===== LISTENING — Part 3 =====
      {
        section: 'Listening', part: 3, type: 'choice',
        questionText: 'Speaker 1: что больше всего понравилось в городе, который он посетил?',
        options: [
          'the efficiency of the public transport system',
          'the natural beauty of the scenery',
          'the variety of goods in the markets',
          'the range of leisure opportunities',
        ],
        correctAnswer: 'the range of leisure opportunities',
      },

      // ===== LISTENING — Part 4 =====
      {
        section: 'Listening', part: 4, type: 'choice',
        questionText: 'Rachel Reed works in a commercial art gallery. What does Rachel say about her job title?',
        options: [
          'It makes her feel more important than she is.',
          'It gives people the wrong idea about her work.',
          'It is appropriate for most of the work she does.',
        ],
        correctAnswer: 'It is appropriate for most of the work she does.',
      },
    ],
  });

  const passwordHash = await bcrypt.hash('WakeUp2024!', 10);
  await Teacher.create({ email: 'teacher@wakeupenglish.ru', passwordHash });

  const total = test.questions.length;
  const auto = test.questions.filter(q => q.type !== 'writing').length;
  console.log('✅ Тест успешно создан с постоянным ID:', test._id.toString());
  console.log(`📊 Вопросов: ${total} (авто-проверка: ${auto}, вручную: ${total - auto})`);
  console.log('✅ Преподаватель: teacher@wakeupenglish.ru / WakeUp2024!');
  console.log('🔗 Ссылка для ученика: http://localhost:5173/test/' + test._id.toString());

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });