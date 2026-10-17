const fs = require('fs');

const data = fs.readFileSync('src/lib/__tests__/utils.test.ts', 'utf8');

const updated = data
  .replace(/describe\('isHistoryEntry validation', \(\) => {/, "  });\n});\n\ndescribe('isHistoryEntry validation', () => {");

fs.writeFileSync('src/lib/__tests__/utils.test.ts', updated);
