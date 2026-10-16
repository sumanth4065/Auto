require('dotenv').config();
var exec = require('child_process').exec;

const apiKey = process.env.QA_ISS_AXE_API_KEY
console.log('apiKey', apiKey);

console.log('send scan...')
exec(`axe bulk-reports ./a11y_results --send-axe-reports --axe-reports-api-key ${apiKey} --axe-reports-url https://axe-reports-server.dequecloud.com/`, ((error, stdout, stderr) => {
 
  if (error) {
    console.log('error', error)
  }
  if (stdout) {
    console.log('stdout', stdout)
  }
  if (stderr) {
    console.log('stderr', stderr)
  }
}))
