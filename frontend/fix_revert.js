import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToProcess = [
    'src/pages',
    'src/components',
    'src/pages/admin',
    'src/pages/producer',
    'src/components/dashboard'
];

function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Revert double Rs. Rs.
    content = content.replace(/Rs\.\s*Rs\./g, 'Rs.');

    // Revert Rs. inside className
    content = content.replace(/className=\{`([^`]+)`\}/g, (match, inner) => {
        return 'className={`' + inner.replace(/Rs\.\s*\$\{/g, '${') + '`}';
    });

    // Revert Rs. where it clearly shouldn't be
    content = content.replace(/Month\s+Rs\.\s*\$\{/g, 'Month ${');
    content = content.replace(/Unit:\s+Rs\.\s*\$\{/g, 'Unit: Rs. ${'); // This is fine
    
    // Any remaining Rs. ${ in className if not caught
    content = content.replace(/(\s+)Rs\.\s*\$\{(?=(!|activeImage|loading|isSubmitting|selectedVariant|product\.status|alert\.severity|trend|order\.status))/g, '$1${');

    fs.writeFileSync(filePath, content, 'utf8');
}

dirsToProcess.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) processDirectory(fullDir);
});

console.log("Done reverting broken replacements.");
