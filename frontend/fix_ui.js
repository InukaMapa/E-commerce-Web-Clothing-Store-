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
    let hasChanges = false;

    // Prices: 
    // ${...} to Rs. ${...} if it's for money. Some are inside template literals.
    // Also $15.00 -> Rs. 15.00
    // But be careful not to replace template literal syntax ${} unless we see $${
    let newContent = content.replace(/\$\$\{/g, 'Rs. ${');
    newContent = newContent.replace(/\$([0-9]+\.[0-9]+)/g, 'Rs. $1');
    newContent = newContent.replace(/\$([0-9]+[MK]?)/g, 'Rs. $1');
    newContent = newContent.replace(/\$\{([a-zA-Z0-9_.]+(?:\.toFixed\([0-9]\)|\.toLocaleString\([^)]*\)))?\}/g, (match) => {
        // Just replacing specific things might be dangerous, we handled $${ which covers string literals.
        // What about JSX text like ${product.price} ?
        return match;
    });
    
    // Fix JSX text nodes with standalone $ followed by JS expression, e.g. >${total
    newContent = newContent.replace(/>\$\{/g, '>Rs. ${');
    
    // Size reductions
    newContent = newContent.replace(/text-sm/g, 'text-xs');         // 14px -> 12px
    newContent = newContent.replace(/text-base/g, 'text-sm');       // 16px -> 14px
    newContent = newContent.replace(/text-lg/g, 'text-base');       // 18px -> 16px

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated UI in: ${filePath}`);
    }
}

dirsToProcess.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) processDirectory(fullDir);
});

console.log("Done fixing UI.");
