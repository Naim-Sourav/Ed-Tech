const https = require('https');

https.get('https://mongodb-hb6b.onrender.com/api/quiz/syllabus-stats', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    let parsed = JSON.parse(data);
    let out = JSON.stringify(parsed, null, 2);
    console.log(out.substring(0, 1500));
    console.log("...");
    console.log("Sample chapter for Chemistry 1st Paper:");
    console.log(JSON.stringify(parsed["Chemistry 1st Paper"] || {}, null, 2).substring(0, 500));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
