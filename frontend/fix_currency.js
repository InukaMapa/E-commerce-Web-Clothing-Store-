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
    let hasChanges = false;

    // Specifically look for patterns where $ is used for currency in UI text:
    
    // Pattern 1: $ followed by {
    // but ONLY inside JSX tags. Actually, we can just replace > $ { with > Rs. {
    // or spaces then $ {
    content = content.replace(/(>\s*)\$\{(?=\(?[a-zA-Z])/g, '$1Rs. ${');
    content = content.replace(/(\s+)\$\{(?=[a-zA-Z(])/g, '$1Rs. ${');
    
    // Pattern 2: ${var} inside template literals if it starts with $
    // e.g. `$${total}` => replaced already to `Rs. ${total}` in prev step
    
    // Pattern 3: hardcoded $ values like $15.00
    content = content.replace(/'\$15\.00'/g, "'Rs. 15.00'");
    content = content.replace(/"\$15\.00"/g, '"Rs. 15.00"');
    
    // Pattern 4: in ProductCard
    // `          ${product.price` 
    // it's already caught by (\s+)\$\{ maybe? Let's explicitly do it:
    content = content.replace(/(\s+)\$\{product\.price/g, '$1Rs. ${product.price');

    // Make sure we didn't mistakenly double up "Rs. Rs."
    content = content.replace(/Rs\.\s*Rs\./g, 'Rs.');

    if (content !== fs.readFileSync(filePath, 'utf8')) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated currency in: ${filePath}`);
    }
}

dirsToProcess.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) processDirectory(fullDir);
});

console.log("Done fixing currency.");
