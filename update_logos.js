const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'server', 'ui', 'admin'),
    path.join(__dirname, 'server', 'ui', 'teacher')
];

const newLogoHTML = `
            <div class="logo" style="margin-bottom: 24px; display: flex; justify-content: center; width: 100%;">
                <img src="/user/logo/AnalogiX.png" alt="AnalogiX Logo" style="height: 32px; max-width: 100%; object-fit: contain;">
            </div>
`;

dirs.forEach(dir => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'login.html');
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Regex to replace the entire <div class="logo">...</div> block
        const logoRegex = /<div class="logo">[\s\S]*?<\/div>\s*<span>.*?<\/span>\s*<\/div>/;
        
        // Let's try replacing a more generic block if the span is outside
        const alternativeRegex = /<div class="logo">\s*<div class="logo-icon">\s*<ion-icon name=".*?"><\/ion-icon>\s*<\/div>\s*<span>.*?<\/span>\s*<\/div>/;
        
        if (alternativeRegex.test(content)) {
            content = content.replace(alternativeRegex, newLogoHTML);
            fs.writeFileSync(filePath, content);
            console.log(`Updated logo in ${dir}/${file}`);
        } else {
            console.log(`Logo block not found or already updated in ${dir}/${file}`);
        }
    });
});
