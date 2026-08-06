const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

// --- 1. TEST RUNNER (SANDBOXED ENGINE) ---
function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
}

function runSnippet(snippet, timeoutMs = 2000) {
  const tmpName = `grader_${Date.now()}_${Math.random().toString(36).slice(2)}.js`;
  const tmpPath = path.join(os.tmpdir(), tmpName);
  
  try {
    fs.writeFileSync(tmpPath, snippet, 'utf8');
    const result = spawnSync('node', [tmpPath], { 
      timeout: timeoutMs, 
      encoding: 'utf8',
      maxBuffer: 1024 * 50
    });
    
    let isTimeout = result.error && result.error.code === 'ETIMEDOUT';
    
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      crashed: result.status !== 0 || !!result.error,
      errorMsg: isTimeout ? 'Infinite loop detected (Timeout)' : (result.error ? result.error.message : null)
    };
  } finally {
    try { fs.unlinkSync(tmpPath); } catch (_) {}
  }
}

function testCode(studentCode, mockInputs = []) {
  const inputsStr = JSON.stringify(mockInputs);
  const snippet = `
const __logs = [];
const __origLog = console.log;
let __logCount = 0;

console.log = (...args) => {
  if (__logCount++ > 1000) return;
  __logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
};

const requireOrig = require;
require = function(moduleName) {
  if (moduleName === 'readline') {
    return {
      createInterface: () => ({
        question: (promptText, callback) => {
          const answer = ${inputsStr}[__inputIndex++] || '';
          callback(answer);
        },
        close: () => {}
      })
    };
  }
  if (['fs', 'child_process', 'os', 'path'].includes(moduleName)) {
    throw new Error('Security Error: Blocked access to ' + moduleName);
  }
  return requireOrig(moduleName);
};

let __inputIndex = 0;

try {
  ${studentCode}
} catch (e) {
  console.log('CRITICAL_ERROR:', e.message);
}

console.log = __origLog;
if (__logs.length > 0) {
  console.log(__logs.join('\\n'));
}
process.exit(0);
`;
  return runSnippet(snippet);
}


// --- 2. THE TEST SUITE ---
const jsFile = path.join(__dirname, '..', 'coffee-shop.js');

console.log('==============================================');
console.log('🤖 GITHUB AUTOGRADER: THE COFFEE SHOP');
console.log('==============================================\\n');

if (!fs.existsSync(jsFile)) {
  console.log('❌ FATAL ERROR: coffee-shop.js not found in the repository root.');
  process.exit(1);
}

let rawCode;
try {
  rawCode = fs.readFileSync(jsFile, 'utf8');
} catch (e) {
  console.log('❌ FATAL ERROR: Could not read coffee-shop.js.');
  process.exit(1);
}

const code = stripComments(rawCode);
let score = 0;
const MAX_SCORE = 100;
let failCount = 0;

function pass(msg, pts = 0) {
  console.log(\`✅ PASS (+\${pts}pts): \${msg}\`);
  score += pts;
}

function fail(msg) {
  console.log(\`❌ FAIL: \${msg}\`);
  failCount++;
}

// Check 1: Menu Object
if (/(const|let|var)\\s+\\w+\\s*=\\s*\\{/.test(code) && /:/.test(code)) {
  pass('Defined a menu object', 15);
} else {
  fail('Missing a clear menu object definition.');
}

// Check 2: Function
if (/function\\s+calculateTotal|const\\s+calculateTotal\\s*=/.test(code)) {
  pass('Created calculateTotal() function', 15);
} else {
  fail('Missing calculateTotal() function.');
}

// Determine a valid drink based on their menu
const menuMatch = code.match(/['"]?(\\w+)['"]?\\s*:\\s*\\d+/g);
let validDrink = 'espresso'; 
if (menuMatch && menuMatch.length > 0) {
  const firstKey = menuMatch[0].split(':')[0].replace(/['"\\s]/g, '');
  if (firstKey) validDrink = firstKey;
}

// Check 3: Valid Order simulation
const res1 = testCode(rawCode, [validDrink, '3']);
if (res1.crashed) {
  fail(\`Code crashed on valid order: \${res1.errorMsg || 'Syntax Error'}\`);
} else if (/\\d{3,}/.test(res1.stdout)) { 
  pass(\`Successfully processed valid order (\${validDrink}, qty 3)\`, 20);
} else {
  fail('Did not output a total price (number > 99) for a valid order.');
}

// Check 4: Case Insensitivity
const weirdDrink = '  ' + validDrink.toUpperCase() + '  ';
const res2 = testCode(rawCode, [weirdDrink, '2']);
if (!res2.crashed && /\\d{3,}/.test(res2.stdout) && !res2.stdout.toLowerCase().includes('error')) {
  pass('Handled case-insensitive and padded input correctly.', 25);
} else {
  fail('Failed to handle case-insensitivity or trailing spaces (Hint: use .toLowerCase() and .trim()).');
}

// Check 5: Invalid Drink
const res3 = testCode(rawCode, ['some_random_fanta', '1']);
if (!res3.crashed && !/\\d{3,}/.test(res3.stdout)) {
  pass('Gracefully handled an invalid drink without crashing.', 10);
} else {
  fail('Failed to reject an invalid menu item.');
}

// Check 6: Invalid Number
const res4 = testCode(rawCode, [validDrink, 'five']);
if (!res4.crashed && !res4.stdout.includes('NaN')) {
  pass('Handled text entered in the quantity field properly.', 15);
} else {
  fail('Failed to handle bad numbers. If user types "five", your code outputs "NaN". (Hint: check with isNaN()).');
}

console.log('\\n==============================================');
console.log(\`🎯 FINAL SCORE: \${score} / \${MAX_SCORE}\`);
console.log('==============================================');

if (failCount > 0) {
  console.log(\`\\n⚠️ Your code has \${failCount} issue(s) remaining. Please fix them and push again!\`);
  process.exit(1); // Fails the GitHub Action
} else {
  console.log('\\n🎉 CONGRATULATIONS! ALL TESTS PASSED!');
  process.exit(0); // Passes the GitHub Action
}
