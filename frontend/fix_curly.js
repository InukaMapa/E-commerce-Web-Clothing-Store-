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

    // Rs. {var} => Rs. ${var} inside template literals ONLY!
    // We can do \`Rs. { => \`Rs. ${
    content = content.replace(/\`Rs\.\s*\{/g, '`Rs. ${');

    fs.writeFileSync(filePath, content, 'utf8');
}

dirsToProcess.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) processDirectory(fullDir);
});

console.log("Done fixing curly brackets.");
