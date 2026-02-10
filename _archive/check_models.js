const https = require('https');

const apiKey = 'AIzaSyDhjOpSjkg8_gGpDHwUTM1_IT72OfshsBQ'; // User provided key
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.error) {
        console.error('Error:', response.error.message);
      } else {
        console.log('Available Models:');
        response.models.forEach(m => {
          if(m.supportedGenerationMethods.includes('generateContent')) {
             console.log(`- ${m.name.replace('models/', '')}`);
          }
        });
      }
    } catch (e) {
      console.error('Parse Error:', e.message);
    }
  });
}).on('error', (e) => {
  console.error('Request Error:', e.message);
});
