const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { search: /bg-zinc-950\/50/g, replace: 'bg-white/90' },
  { search: /bg-zinc-900\/50/g, replace: 'bg-zinc-50/90' },
  { search: /bg-zinc-950/g, replace: 'bg-white' },
  { search: /bg-zinc-900/g, replace: 'bg-zinc-50' },
  { search: /bg-zinc-800/g, replace: 'bg-zinc-100' },
  { search: /border-zinc-900/g, replace: 'border-zinc-200' },
  { search: /border-zinc-800/g, replace: 'border-zinc-200' },
  { search: /border-zinc-700/g, replace: 'border-zinc-300' },
  { search: /text-white/g, replace: 'text-zinc-900' },
  { search: /text-zinc-300/g, replace: 'text-zinc-700' },
  { search: /text-zinc-400/g, replace: 'text-zinc-600' },
  { search: /text-zinc-500/g, replace: 'text-zinc-500' },
  { search: /hover:bg-zinc-900/g, replace: 'hover:bg-zinc-100' },
  { search: /hover:bg-zinc-800/g, replace: 'hover:bg-zinc-200' }
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

console.log('Iniciando migração de cores...');
const modifiedFiles = processDirectory(directoryPath);
console.log(`Migração concluída com sucesso! Modificados ${modifiedFiles} arquivos.`);
