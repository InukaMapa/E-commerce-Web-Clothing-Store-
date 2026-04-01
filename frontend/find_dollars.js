import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let results = [];

function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            searchDir(full);
        } else if (full.endsWith('.jsx')) {
            const lines = fs.readFileSync(full, 'utf8').split('\n');
            lines.forEach((line, i) => {
                if (line.includes('$')) {
                    results.push(`${full}:${i + 1}: ${line.trim()}`);
                }
            });
        }
    }
}
searchDir(path.join(__dirname, 'src'));
fs.writeFileSync('found.json', JSON.stringify(results, null, 2), 'utf8');
