const fs = require('fs');

const data = fs.readFileSync('src/lib/__tests__/utils.test.ts', 'utf8');

const updated = data
  .replace(/<<<<<<< Updated upstream[\s\S]*?import {.*?isNotes } from '\.\.\/utils\.js';\n=======\nimport {.*?isHistoryEntry } from '\.\.\/utils\.js';\n>>>>>>> Stashed changes/, "import { loadLS, saveLS, extractImdbId, serMatch, desMatch, isNotes, isHistoryEntry } from '../utils.js';")
  .replace(/<<<<<<< Updated upstream/, '')
  .replace(/=======\n/, '')
  .replace(/>>>>>>> Stashed changes\n/, '');

fs.writeFileSync('src/lib/__tests__/utils.test.ts', updated);
