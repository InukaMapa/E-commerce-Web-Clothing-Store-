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

    // Remove $ that directly followed Rs. 
    // Rs. ${var} -> Rs. {var}
    content = content.replace(/Rs\.\s*\$\{/g, 'Rs. {');
    // Rs. $120 -> Rs. 120
    content = content.replace(/Rs\.\s*\$([0-9])/g, 'Rs. $1');

    fs.writeFileSync(filePath, content, 'utf8');
}

dirsToProcess.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) processDirectory(fullDir);
});

console.log("Done stripping lingering dollar signs.");
