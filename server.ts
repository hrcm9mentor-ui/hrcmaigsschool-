import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log("Gemini GenAI initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini GenAI Client:", err);
  }
} else {
  console.warn("GEMINI_API_KEY not found or default. AI Assistant will operate with educational local responses.");
}

// AI Assistant endpoint
app.post('/api/ai-mentor', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request payload. 'messages' array is required." });
  }

  // System instructions restricting responses to educational insights of Astrology, Numerology, Vastu, Medical Vastu, Rudraksha, Mental Wellness.
  // Warning against professional diagnosis or medical treatment.
  const systemInstruction = `You are HRCM MENTOR, an expert premium AI assistant designed by founder Nabin K. Choudhary (located in Ghaziabad, UP, India).
Your expertise is limited to answering educational questions about:
1. Astrology (Vedic, planets, transits, Kundli reading)
2. Numerology (Chaldean Method, name correction, lucky numbers, mobile analysis)
3. Vastu Shastra & Medical Vastu (direction alignments, 16 anatomical health zones)
4. Rudraksha (bead benefits, Mukhi varieties, energetic shielding)
5. Mental Wellness (educational screening, breathing practices, coping tips)

Strict constraints:
- Do NOT provide professional clinical diagnoses.
- Do NOT provide emergency medical advice. If a user asks about self-harm, severe clinical depression, chest pain, or medical emergencies, provide immediate compassionate crisis helplines, urge them to consult a medical doctor, and clearly declare your technical limitation.
- Always be premium, professional, compassionate, yet objective and grounded.
- Maintain a highly respectful, structured tone. Respond in markdown format.`;

  try {
    if (ai) {
      // Map frontend messages structure to Gemini structure
      const formattedContents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      });

      const responseText = response.text || "I was unable to formulate an answer. Let's try rephrasing.";
      return res.json({ response: responseText });
    } else {
      // Fallback local educational response generator for offline/testing mode
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "HRCM MENTOR (Local Mode): My apologies, but my connection to the premium Gemini AI servers is not fully configured yet. \n\nHere is an educational guidance based on ancient scriptures:\n\n";
      
      if (lastMessage.includes('vastu') || lastMessage.includes('direction')) {
        reply += "- **Medical Vastu tip**: Ensure your North-East (Ishanya) zone is clean, clutter-free, and has no toilet fixtures. This supports mental clarity and prevents chronic brain fatigue.\n- Sleeping with your head facing South ensures deep, restorative sleep aligned with Earth's magnetic flows.";
      } else if (lastMessage.includes('astrology') || lastMessage.includes('horoscope') || lastMessage.includes('kundli')) {
        reply += "- **Vedic Astrology tip**: Your rising ascendant determines your physical constitution (Prakriti). Balancing planetary energies with specific colored gemstones, chanting, or meditation can bring physiological stability.";
      } else if (lastMessage.includes('numerology') || lastMessage.includes('name') || lastMessage.includes('chaldean')) {
        reply += "- **Chaldean Numerology tip**: Every letter has a specific vibration from 1 to 8 (9 is considered sacred and excluded from name calculations). Name corrections that align your first name with your psychic or destiny numbers can boost overall professional success.";
      } else if (lastMessage.includes('rudraksha') || lastMessage.includes('bead')) {
        reply += "- **Rudraksha Wisdom**: A genuine 5 Mukhi Rudraksha is governed by Jupiter. It stabilizes heart rate, helps regulate high blood pressure, and calms an overactive nervous system.";
      } else if (lastMessage.includes('depress') || lastMessage.includes('anxiety') || lastMessage.includes('stress')) {
        reply += "- **Mental Wellness Guidance**: We highly recommend taking our integrated PHQ-9 or GAD-7 screening tests in the Mental Health Tools section. Remember: these tools are educational screening guides and do not replace professional medical diagnosis.";
      } else {
        reply += "To help you better, please ask about Astrology, Chaldean Numerology, Vastu/Medical Vastu remedies, authentic Rudraksha consults, or mental wellness screening practices.";
      }

      return res.json({ response: reply });
    }
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({ error: "Failed to generate response. Please try again." });
  }
});

// Simulated payment creation (Razorpay)
app.post('/api/create-order-session', (req, res) => {
  const { amount, currency = "INR", description } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  // Generate a random simulated Razorpay payment ID
  const simulatedOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;
  return res.json({
    id: simulatedOrderId,
    amount: amount,
    currency: currency,
    status: "created",
    key: "rzp_test_mock_hrcm_mentor_key",
    description: description
  });
});

// Simulated invoice generation
app.post('/api/generate-invoice', (req, res) => {
  const { orderId, customerName, items, total } = req.body;
  
  const invoiceHtml = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .logo { font-size: 24px; font-weight: bold; color: #064e3b; }
          .title { font-size: 28px; text-transform: uppercase; color: #1e3a8a; }
          .details { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #f3f4f6; padding: 12px; text-align: left; border-bottom: 1px solid #d1d5db; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .total { font-size: 18px; font-weight: bold; text-align: right; color: #064e3b; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">HRCM MENTOR</div>
            <p>Ghaziabad, Uttar Pradesh, India<br/>Email: choudharynabink@gmail.com</p>
          </div>
          <div class="title">INVOICE</div>
        </div>
        <div class="details">
          <div>
            <h3>Billed To:</h3>
            <p><strong>${customerName || 'Valued Customer'}</strong></p>
          </div>
          <div style="text-align: right;">
            <p><strong>Invoice No:</strong> INV-${orderId || 'MOCK-123'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${items && Array.isArray(items) ? items.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity || 1}</td>
                <td>₹${item.price}</td>
                <td>₹${item.price * (item.quantity || 1)}</td>
              </tr>
            `).join('') : `
              <tr>
                <td>Consultation / Product Purchase</td>
                <td>1</td>
                <td>₹${total}</td>
                <td>₹${total}</td>
              </tr>
            `}
          </tbody>
        </table>
        <div class="total">Grand Total: ₹${total}</div>
        <div class="footer">
          <p>Thank you for choosing HRCM MENTOR. Medical science and spiritual wisdom combined.</p>
          <p>Copyright &copy; 2026 HRCM MENTOR. All Rights Reserved.</p>
        </div>
      </body>
    </html>
  `;

  return res.json({ invoiceHtml });
});

// SEO sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hrcmmentor.com/</loc>
    <lastmod>2026-07-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hrcmmentor.com/astrology</loc>
    <lastmod>2026-07-21</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hrcmmentor.com/numerology</loc>
    <lastmod>2026-07-21</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hrcmmentor.com/vastu</loc>
    <lastmod>2026-07-21</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hrcmmentor.com/shop</loc>
    <lastmod>2026-07-21</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hrcmmentor.com/consultation</loc>
    <lastmod>2026-07-21</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://hrcmmentor.com/mental-health</loc>
    <lastmod>2026-07-21</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://hrcmmentor.com/courses</loc>
    <lastmod>2026-07-21</lastmod>
    <priority>0.9</priority>
  </url>
</urlset>`);
});

// SEO robots.txt
app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://hrcmmentor.com/sitemap.xml`);
});

// Google Search Console Ownership Verification Route (HTML File Method)
// Serves any Google verification file request like /google1234567890abcdef.html
app.get('/google:code.html', (req, res) => {
  const filename = `google${req.params.code}.html`;
  res.header('Content-Type', 'text/html');
  res.send(`google-site-verification: ${filename}`);
});

// Setup Vite Dev Server / Static files handler
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for any remaining route in production
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HRCM MENTOR Server] Listening at http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
