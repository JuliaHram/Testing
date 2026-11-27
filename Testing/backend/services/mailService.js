const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

exports.sendStudentThanks = async (to, name) => {
  try {
    await transporter.sendMail({
      from: `"WakeUpEnglish" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Спасибо за прохождение теста!',
      html: `<h3>${name}, спасибо!</h3>
             <p>Мы получили ваши ответы. Преподаватель WakeUpEnglish свяжется с вами в ближайшее время.</p>`
    });
  } catch (e) { console.error('mail student:', e.message); }
};

exports.sendTeacherNotification = async (studentName, score, total) => {
  try {
    await transporter.sendMail({
      from: `"WakeUpEnglish System" <${process.env.SMTP_USER}>`,
      to: process.env.TEACHER_EMAIL,
      subject: 'Новый результат тестирования',
      html: `<p>Ученик <b>${studentName}</b> завершил тест: <b>${score}/${total}</b>.</p>
             <p>Подробности в панели преподавателя.</p>`
    });
  } catch (e) { console.error('mail teacher:', e.message); }
};