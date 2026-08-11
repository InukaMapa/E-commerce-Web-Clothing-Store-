const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "src/components/ProductCard.jsx",
  "src/pages/Cart.jsx",
  "src/pages/Checkout.jsx",
  "src/pages/MyOrders.jsx",
  "src/pages/ProductDetails.jsx",
  "src/pages/admin/Analytics.jsx",
  "src/pages/admin/Orders.jsx",
  "src/pages/admin/ProductManagement.jsx",
  "src/pages/producer/Products.jsx"
];

const basePath = path.join(__dirname, 'frontend');

for (const relPath of filesToUpdate) {
  const filePath = path.join(__dirname, 'frontend', relPath);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('http://localhost:5000')) {
    // Add import statement if not exists
    if (!content.includes('API_BASE_URL')) {
      // Find the last import
      const importMatches = [...content.matchAll(/^import.*from.*;?$/gm)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const lastImportEnd = lastImport.index + lastImport[0].length;
        
        // determine path to api/axios
        const dir = path.dirname(relPath);
        const depth = dir.split('/').length - 1; // src/components -> 1, src/pages -> 1, src/pages/admin -> 2
        let apiPath = '../api/axios';
        if (dir === 'src/components' || dir === 'src/pages') {
          apiPath = '../api/axios';
        } else if (dir === 'src/pages/admin' || dir === 'src/pages/producer') {
          apiPath = '../../api/axios';
        }

        const importStmt = `\nimport { API_BASE_URL } from "${apiPath}";`;
        content = content.slice(0, lastImportEnd) + importStmt + content.slice(lastImportEnd);
      }
    }
    
    // Replace hardcoded url
    // Handle cases like `http://localhost:5000${product.images[0]}` -> `${API_BASE_URL}${product.images[0]}`
    // and "http://localhost:5000" + ... -> API_BASE_URL + ...
    content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');
    
    // Fix non-template literal concatenations if they became string literals containing ${API_BASE_URL}
    // e.g. "http://localhost:5000/uploads" -> `${API_BASE_URL}/uploads`
    content = content.replace(/"\$\{API_BASE_URL\}(.*?)"/g, '`${API_BASE_URL}$1`');
    content = content.replace(/'\$\{API_BASE_URL\}(.*?)'/g, '`${API_BASE_URL}$1`');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', relPath);
  }
}
