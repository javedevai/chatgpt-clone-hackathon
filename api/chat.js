module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing GEMINI_API_KEY' });
  }

  try {
    const { messages, systemPrompt } = req.body;

    // Convert OpenAI-style messages to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // Build Gemini request body
    const geminiBody = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    };

    // Add system instruction if provided
    const sysPrompt = systemPrompt || messages.find(m => m.role === 'system')?.content;
    if (sysPrompt) {
      geminiBody.systemInstruction = {
        parts: [{ text: sysPrompt }]
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMsg = errorData.error?.message || 'Upstream Gemini API Error';
      return res.status(response.status).json({ error: errorMsg });
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    // Return in a normalized format
    return res.status(200).json({
      choices: [{ message: { role: 'assistant', content: text } }]
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
