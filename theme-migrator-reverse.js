const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Glass backgrounds
  { search: /bg-white\/90/g, replace: 'bg-[#001A14]/60' },     // Darkest green glass
  { search: /bg-zinc-50\/90/g, replace: 'bg-[#002B21]/60' },   // Subtle green glass
  
  // Solid backgrounds
  { search: /bg-white/g, replace: 'bg-[#001A14]' },           // Darkest green solid
  { search: /bg-zinc-50/g, replace: 'bg-[#002B21]' },         // Subtle green solid
  { search: /bg-zinc-100/g, replace: 'bg-zinc-900' },
  
  // Borders
  { search: /border-zinc-200\/50/g, replace: 'border-white/5' },
  { search: /border-zinc-200/g, replace: 'border-zinc-900' },
  { search: /border-zinc-300/g, replace: 'border-zinc-800' },
  
  // Text
  { search: /text-zinc-900/g, replace: 'text-white' },
  { search: /text-zinc-700/g, replace: 'text-zinc-400' },
  { search: /text-zinc-600/g, replace: 'text-zinc-400' },
  
  // Hovers
  { search: /hover:bg-zinc-100/g, replace: 'hover:bg-zinc-900' },
  { search: /hover:bg-zinc-200/g, replace: 'hover:bg-zinc-800' }
];

function processDirectory(dir) {
  let count = 0;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      count += processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      replacements.forEach(({ search, replace }) => {
        content = content.replace(search, replace);
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        count++;
      }
    }
  });
  return count;
}

console.log('Iniciando reversão do tema...');
const modifiedFiles = processDirectory(directoryPath);
console.log(`Reversão concluída com sucesso! Modificados ${modifiedFiles} arquivos.`);
