// netlify/functions/extract.js
// Proxies image extraction to Anthropic API.
// Your ANTHROPIC_API_KEY is set in Netlify → Site settings → Environment variables.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured on server.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { image_b64, image_mime, prompt } = body;
  if (!image_b64 || !image_mime || !prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing image_b64, image_mime, or prompt.' }) };
  }

  // Validate mime type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(image_mime)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported image type.' }) };
  }

  // Basic size guard (base64 of 10MB ≈ 13.3MB string)
  if (image_b64.length > 14_000_000) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Image too large. Please crop and compress.' }) };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: image_mime, data: image_b64 } },
            { type: 'text', text: prompt }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error. Please try again.' }) };
    }

    const data = await response.json();
    const text = (data.content || []).map(c => c.type === 'text' ? c.text : '').join('');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };

  } catch (err) {
    console.error('Extract function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error. Please try again.' }) };
  }
};
