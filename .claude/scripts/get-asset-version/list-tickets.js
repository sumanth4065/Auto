const args = process.argv.slice(2);

const hasArg = (...options) => options.some(option => args.includes(option));

if (hasArg('--help', '-h')) {
  console.log(`Usage: node list-tickets.js [options]

Options:
  --help, -h           Show this help message
  --url, -u, u         Display only the ticket URLs
  --url+, +u       Display each ticket and its URL
`);
  process.exit(0);
}

const fs = require('fs');
const readline = require('readline');

const FILE_NAME = 'asset_versions.txt';
const REGEX_TICKET = /((ISS|MEM|OBP2)-.*)/;
const REGEX_TICKET_NUMBER = /((ISS|MEM|OBP2)-[0-9]{1,10})[ :]/;

let isUrlOnly = false;
let isUrlPlus = false;

isUrlOnly = hasArg('--url', '-u', 'u', 'url');
isUrlPlus = hasArg('--url+', '+u', '+url');

const displayUrl = s => {
  const results = s.match(REGEX_TICKET_NUMBER);
  const tix = results ? results[1].trim() : null;
  if (tix) console.log(`https://autoclub.atlassian.net/browse/${tix}`);
};

const displayTickets = tickets => {
  console.log(`Number of tickets: ${tickets.length}`);
  if (tickets.length > 0) {
    tickets.sort().forEach(ticket => {
      if (isUrlOnly) {
        displayUrl(ticket);
      } else {
        console.log(ticket);
        if (isUrlPlus) displayUrl(ticket);
      }
    });
  }
};

const getTicket = line => {
  const s = line.trim();
  const results = s.match(REGEX_TICKET);
  return results ? results[0] : null;
};

async function readFile(filePath) {
  const tickets = [];

  const lineHandle = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
  });

  lineHandle.on('line', line => {
    const ticket = getTicket(line);
    if (ticket) tickets.push(ticket);
  });

  await new Promise(resolve => lineHandle.once('close', resolve));

  displayTickets(tickets);
}

readFile(FILE_NAME);
