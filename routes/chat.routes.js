const router = require('express').Router();
const Product = require('../models/Product.model');
const { GoogleGenerativeAI } = require('@google/generative-ai');


const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);


router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    
    
    const products = await Product.find().select('name price stock description categoryIds').populate('categoryIds', 'name');
    
    
    const storeContext = `
أنت موظف خدمة العملاء والدعم الفني في متجر BLOXED. أنت ودود واحترافي وتتعامل كإنسان طبيعي.
مهم جداً: لا تقل أبداً أنك ذكاء اصطناعي (AI) أو روبوت. تحدث دائماً بصيغة موظف مبيعات حقيقي يعمل في المتجر.
يجب عليك دائماً الرد باللغة العربية.
هدفك هو مساعدة المستخدمين في العثور على المنتجات، الإجابة على أسئلة حول المواصفات والأسعار والمخزون.

إليك الكتالوج الحالي للمنتجات في متجر BLOXED:
${JSON.stringify(products.map(p => ({
  name: p.name,
  price: `$${p.price}`,
  stock: p.stock > 0 ? `${p.stock} in stock` : 'Out of stock',
  desc: p.description,
  categories: p.categoryIds.map(c => c.name).join(', ')
})))}

Guidelines:
1. Only recommend products from the list above. Do NOT invent products.
2. If a product is out of stock, mention it.
3. Keep your answers concise, helpful, and formatted nicely. Do not use overly complex markdown.
4. If the user asks something completely unrelated to shopping or technology, politely steer them back to the store.
5. Provide prices exactly as they are in the data.

User's Message: ${message}
`;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(storeContext);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ message: 'Error communicating with AI Assistant.' });
  }
});

// POST /api/chat/build-kit - AI Setup Builder endpoint
router.post('/build-kit', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const products = await Product.find().select('_id name price description');
    
    const storeContext = `
أنت خبير تجميعات تقنية (Tech Setup Builder) في متجر BLOXED.
المستخدم يسألك بشكل طبيعي وعفوي: "${prompt}"

إليك المنتجات المتوفرة في متجرنا:
${JSON.stringify(products.map(p => ({
  id: p._id.toString(),
  name: p.name,
  desc: p.description
})))}

مهمتك هي الرد على المستخدم بشكل طبيعي، ودود، وخبير، وتوضيح سبب اختيارك للمنتجات التي ستقترحها، واختيار من 1 إلى 4 منتجات كحد أقصى تتناسب مع طلبه.
يجب أن ترجع إجابتك حصراً بصيغة JSON Object يحتوي على مفتاحين:
1. "explanation": النص الذي سترد به على المستخدم (باللغة العربية).
2. "productIds": مصفوفة تحتوي على معرفات المنتجات (IDs) التي رشحتها.

مثال للإجابة الصحيحة:
{
  "explanation": "بناءً على طلبك لجهاز ألعاب قوي ومناسب للبث المباشر، أنصحك بهذا الجهاز لأنه يوفر أداء ممتاز لمعالجة الرسوميات...",
  "productIds": ["64a1b2c3d4e5f60012345678", "64a1b2c3d4e5f60012345679"]
}

لا تضف أي نص خارج كود الـ JSON. تأكد من صحة بناء الـ JSON.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(storeContext);
    const text = result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    let parsed = { explanation: '', productIds: [] };
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON from AI:', text);
      return res.status(500).json({ message: 'Error parsing AI response' });
    }

    if (!Array.isArray(parsed.productIds)) {
      parsed.productIds = [];
    }

    const recommendedProducts = await Product.find({ _id: { $in: parsed.productIds } });
    
    res.json({ products: recommendedProducts, explanation: parsed.explanation });
  } catch (err) {
    console.error('AI Kit Builder Error:', err);
    res.status(500).json({ message: 'Error generating kit setup.' });
  }
});

module.exports = router;
