const https = require('https');

https.get('https://apis.omniabid.com/quiz/syllabus-stats', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(data), null, 2).substring(0, 1500));
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
