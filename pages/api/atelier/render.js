// pages/api/atelier/render.js
//
// Clean 11A — optional real Stability AI render bridge.
// The route is dormant until STABILITY_API_KEY is configured in the server
// environment. The secret never reaches the browser.


export const config = {
  api: {
    responseLimit: '12mb',
  },
};

const ENDPOINTS = {
  core: 'https://api.stability.ai/v2beta/stable-image/generate/core',
  ultra: 'https://api.stability.ai/v2beta/stable-image/generate/ultra',
};

const ALLOWED_ASPECTS = new Set(['1:1', '16:9', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21']);

function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function statusMessage(status) {
  if (status === 401 || status === 403) return 'מפתח מנוע ההדמיה אינו תקין או שאין לו הרשאה.';
  if (status === 402) return 'אין מספיק קרדיטים בחשבון מנוע ההדמיה.';
  if (status === 429) return 'מנוע ההדמיה עמוס כרגע. נסה שוב בעוד רגע.';
  if (status >= 500) return 'מנוע ההדמיה אינו זמין כרגע.';
  return 'הבקשה למנוע ההדמיה לא הושלמה.';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, code: 'method-not-allowed' });
  }

  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      code: 'engine-not-configured',
      message: 'מנוע ההדמיה עדיין לא הוגדר ב-Vercel.',
    });
  }

  const prompt = cleanText(req.body && req.body.prompt, 9000);
  const negativePrompt = cleanText(req.body && req.body.negativePrompt, 2500);
  const aspectRatio = ALLOWED_ASPECTS.has(req.body && req.body.aspectRatio)
    ? req.body.aspectRatio
    : '1:1';
  const quality = req.body && req.body.quality === 'core' ? 'core' : 'ultra';

  if (prompt.length < 20) {
    return res.status(400).json({
      ok: false,
      code: 'prompt-too-short',
      message: 'הבריף עדיין קצר מדי ליצירת הדמיה מדויקת.',
    });
  }

  try {
    const form = new FormData();
    form.append('prompt', prompt);
    if (negativePrompt) form.append('negative_prompt', negativePrompt);
    form.append('aspect_ratio', aspectRatio);
    form.append('output_format', 'jpeg');

    const response = await fetch(ENDPOINTS[quality], {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        accept: 'image/*',
      },
      body: form,
    });

    if (!response.ok) {
      await response.text().catch(() => '');
      return res.status(response.status).json({
        ok: false,
        code: 'provider-error',
        message: statusMessage(response.status),
        providerStatus: response.status,
      });
    }

    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());
    return res.status(200).json({
      ok: true,
      provider: 'stability',
      model: quality,
      mimeType,
      imageBase64: buffer.toString('base64'),
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      code: 'provider-unreachable',
      message: 'לא ניתן היה להתחבר למנוע ההדמיה כרגע.',
    });
  }
}
