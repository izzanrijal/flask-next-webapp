import express from 'express';
import { Sequelize } from 'sequelize';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Get questions by system ID
router.get('/', async (req, res, next) => {
  try {
    const { systemId, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const { Question, SubtopicList, TopicList } = req.app.get('models');
    
    const questions = await Question.findAll({
      attributes: ['id', 'already_updated'],
      include: [
        {
          model: SubtopicList,
          required: true,
          include: [
            {
              model: TopicList,
              required: true,
              where: { system_id: systemId }
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['id', 'ASC']]
    });
    
    res.json(questions);
  } catch (error) {
    next(error);
  }
});

// Get question by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Question } = req.app.get('models');
    
    const question = await Question.findByPk(id);
    
    if (!question) {
      return res.status(404).json({
        error: 'Question not found',
        message: `No question found with ID ${id}`
      });
    }
    
    res.json(question);
  } catch (error) {
    next(error);
  }
});

// Generate new question using Grok API
router.post('/:id/generate', async (req, res, next) => {
  try {
    const { originalQuestion } = req.body;
    
    if (!originalQuestion) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Original question data is required'
      });
    }
    
    // Prepare prompt with the question data
    const prompt = `
Berikut ini adalah soal klinis tingkat UKMPPD yang telah ada, dalam format JSON dari aplikasi:

${JSON.stringify(originalQuestion, null, 2)}

Tugas Anda:
1. Identifikasi topik klinis atau diagnosis utama yang sedang diuji dari soal tersebut (berdasarkan jawaban yang benar).    
2. Buat soal baru yang menguji diagnosis yang sama, namun dengan skenario klinis yang **sepenuhnya berbeda** (bukan parafrase, bukan pengulangan pola).    
3. Skenario boleh berdasarkan anamnesis, pemeriksaan fisik, EKG, hasil lab, radiologi, atau gabungan data klinis lainnya.    
4. Fokus soal tetap pada **penegakan diagnosis**, dan peserta harus dituntun untuk bernalar klinis untuk sampai ke diagnosis tersebut.    
5. Buat lima pilihan jawaban (A–E), hanya satu yang benar, dan pastikan semua opsi terlihat kredibel secara medis.    
6. Buat **pembahasan komprehensif**, menjelaskan:    
    - Kenapa satu jawaban paling tepat,        
    - Kenapa opsi lain salah, berdasarkan ilmu dan data klinis.        
7. **Tentukan "learning_objective"** untuk soal tersebut, yang merupakan konsep inti atau tujuan pembelajaran yang diuji dalam soal ini. "Learning_objective" ini harus mencakup hal-hal seperti teori dasar, diagnosis utama, tanda klinis relevan, dan pendekatan pengobatan yang diperlukan untuk menjawab dengan benar. Fokus utama adalah pada apa yang perlu dipahami oleh calon dokter agar dapat menjawab soal dengan tepat, tanpa perlu mengungkapkan rincian soal atau skenario klinis secara keseluruhan. Buatlah dalam format yang ringkas dan langsung ke inti, yang mudah untuk dianalisis oleh AI.

**Format output HARUS dalam bentuk JSON**, dengan struktur berikut:
{
  "scenario": "",
  "question": "",
  "option_a": "",
  "option_b": "",
  "option_c": "",
  "option_d": "",
  "option_e": "",
  "correct_answer": "",
  "discussion": "",
  "learning_objective": ""
}

Gunakan Bahasa Indonesia akademik yang jelas, logis, dan mengalir klinis.
    `;
    
    // Mock Grok API call for development (replace with actual API call in production)
    // In the real implementation, you would use the Grok API:
    // const response = await axios.post('https://api.grok.ai/v1/completions', {
    //   prompt,
    //   max_tokens: 4000,
    //   temperature: 0.9
    // }, {
    //   headers: {
    //     Authorization: `Bearer ${process.env.GROK_API_KEY}`
    //   }
    // });
    
    // For development, generate a mock response
    const mockGeneratedQuestion = {
      scenario: "Seorang pria berusia 55 tahun datang ke IGD dengan keluhan nyeri dada mendadak sejak 2 jam yang lalu. Nyeri dirasakan seperti tertindih benda berat, menjalar ke lengan kiri dan rahang. Pasien memiliki riwayat hipertensi dan dislipidemia. Pemeriksaan fisik didapatkan tekanan darah 160/95 mmHg, nadi 102 x/menit, frekuensi napas 24 x/menit. Hasil EKG menunjukkan elevasi segmen ST pada lead V1-V4.",
      question: "Apakah diagnosis yang paling tepat pada pasien ini?",
      option_a: "Angina Pektoris Stabil",
      option_b: "Sindrom Koroner Akut - Angina Pektoris Tidak Stabil",
      option_c: "Sindrom Koroner Akut - NSTEMI",
      option_d: "Sindrom Koroner Akut - STEMI anterior",
      option_e: "Miokarditis Akut",
      correct_answer: "D",
      discussion: "Diagnosis yang paling tepat pada pasien ini adalah Sindrom Koroner Akut - STEMI (ST-Elevation Myocardial Infarction) anterior. Hal ini ditegakkan berdasarkan gejala klinis berupa nyeri dada yang tipikal (nyeri seperti tertindih benda berat, menjalar ke lengan kiri dan rahang), onset akut (2 jam), dan temuan EKG berupa elevasi segmen ST pada lead V1-V4 yang merepresentasikan area anterior jantung. STEMI terjadi akibat oklusi total arteri koroner yang menyebabkan nekrosis miokard. Faktor risiko yang dimiliki pasien (hipertensi dan dislipidemia) juga mendukung diagnosis ini.\n\nAngina Pektoris Stabil (opsi A) tidak tepat karena pasien menunjukkan gejala akut dan perubahan EKG signifikan. Angina stabil biasanya dipicu oleh aktivitas dan membaik dengan istirahat.\n\nSindrom Koroner Akut - Angina Pektoris Tidak Stabil (opsi B) tidak tepat karena meskipun gejalanya akut, EKG menunjukkan elevasi ST yang jelas, yang tidak sesuai dengan APTS.\n\nSindrom Koroner Akut - NSTEMI (opsi C) tidak tepat karena EKG menunjukkan elevasi ST, sedangkan pada NSTEMI tidak terdapat elevasi ST yang persisten.\n\nMiokarditis Akut (opsi E) tidak tepat karena meskipun dapat menyebabkan nyeri dada dan perubahan EKG, gambaran klinis dan faktor risiko pasien lebih mendukung diagnosis STEMI.",
      learning_objective: "Peserta mampu mendiagnosis Sindrom Koroner Akut - STEMI berdasarkan presentasi klinis (nyeri dada tipikal, onset akut), faktor risiko kardiovaskular, dan gambaran EKG karakteristik berupa elevasi segmen ST pada lead tertentu yang menunjukkan lokasi infark (anterior, inferior, lateral)."
    };
    
    // Simulate API response delay
    setTimeout(() => {
      res.json(mockGeneratedQuestion);
    }, 2000);
    
  } catch (error) {
    next(error);
  }
});

// Update question
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    const { Question } = req.app.get('models');
    const sequelize = req.app.get('sequelize');
    
    // Validate correct_answer format
    if (updatedData.correct_answer && !['A', 'B', 'C', 'D', 'E'].includes(updatedData.correct_answer)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'correct_answer must be one of: A, B, C, D, E'
      });
    }
    
    // Validate required fields
    const requiredFields = [
      'scenario', 'question', 'option_a', 'option_b', 'option_c', 
      'option_d', 'option_e', 'correct_answer', 'discussion', 'learning_objective'
    ];
    
    const missingFields = requiredFields.filter(field => !updatedData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Use transaction for data integrity
    await sequelize.transaction(async (t) => {
      // Get the original question for backup (optional)
      const originalQuestion = await Question.findByPk(id, { transaction: t });
      
      if (!originalQuestion) {
        throw new Error(`Question with ID ${id} not found`);
      }
      
      // Update the question
      await Question.update(
        {
          ...updatedData,
          already_updated: true
        },
        {
          where: { id },
          transaction: t
        }
      );
      
      // Optional: Store original in backup table
      // await QuestionBackup.create({
      //   original_id: id,
      //   ...originalQuestion.toJSON()
      // }, { transaction: t });
    });
    
    res.json({ success: true, message: 'Question updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;