const router      = require('express').Router();
const Review      = require('../models/Review.model');
const verifyToken = require('../middleware/auth.middleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET /api/reviews/:productId/summary — public
router.get('/:productId/summary', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).limit(50);
    if (reviews.length < 2) {
      return res.json({ summary: null, message: 'Not enough reviews for AI summary.' });
    }

    const reviewTexts = reviews.filter(r => r.body || r.title).map(r => `Title: ${r.title}\nBody: ${r.body}`).join('\n\n');
    if (!reviewTexts) {
      return res.json({ summary: null, message: 'No textual reviews found.' });
    }

    const prompt = `
      You are an AI assistant for an e-commerce platform. Read the following customer reviews for a product and summarize them into 3-4 bullet points outlining the main pros, cons, and general sentiment.
      Return exactly a JSON array of strings (the bullet points), and nothing else. No markdown wrappers.
      
      Reviews:
      ${reviewTexts}
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    else if (text.startsWith('\`\`\`')) text = text.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');

    const summaryArray = JSON.parse(text);
    res.json({ summary: summaryArray });
  } catch (err) {
    console.error('AI Summary Error:', err);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

// GET /api/reviews/:productId  — public
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, avgRating: Number(avg), count: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews/:productId  — auth required
router.post('/:productId', verifyToken, async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1-5' });

    const review = await Review.findOneAndUpdate(
      { productId: req.params.productId, userId: req.user.id },
      { rating, title, body },
      { upsert: true, new: true }
    );

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id  — owner only
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
