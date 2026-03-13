const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/GEMINI_API_KEY=(.+)/);
if (!match) { console.log('key not found'); process.exit(1); }
const key = match[1].trim();
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log("AVAILABLE MODELS:\n" + data.models.map(m => m.name).join('\n'));
    } else {
      console.log(data);
    }
  })
  .catch(console.error);
