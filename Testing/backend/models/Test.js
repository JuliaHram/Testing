const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  section: { type: String, enum: ['Reading', 'Use of English', 'Writing', 'Listening'], required: true },
  part: { type: Number, required: true },
  type: { type: String, enum: ['choice', 'gap', 'writing'], required: true },
  questionText: { type: String, required: true },
  options: [{ type: String }],
  hint: { type: String },
  correctAnswer: { type: String, default: '' },   // ← больше не required
  points: { type: Number, default: 1 },
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);