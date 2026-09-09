import { readdir,readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve,dirname } from 'node:path';
async function files(directory){return (await Promise.all((await readdir(directory,{withFileTypes:true})).map(entry=>entry.isDirectory()?files(`${directory}/${entry.name}`):`${directory}/${entry.name}`))).flat();}
const sources=[...(await files('src')),...(await files('scripts')),...(await files('test')),'vite.config.js'];
let errors=0;
for(const file of sources.filter(file=>/\.m?js$/.test(file))){
  const check=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  if(check.status!==0){console.error(check.stderr);errors++;}
  const source=await readFile(file,'utf8');
  for(const match of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){
    try{await readFile(resolve(dirname(file),match[1]));}catch{console.error(`Unresolved import ${file}: ${match[1]}`);errors++;}
  }
  if(file.startsWith('src/')&&/new\s+(?:THREE\.)?(?:Box|Cylinder|Sphere|Cone|Torus|Plane|Capsule)Geometry\b/.test(source)){
    console.error(`Visible primitive audit requires review: ${file}`);errors++;
  }
}
console.log(`Syntax/import/primitive checks: ${errors===0?'PASS':`${errors} errors`}`);process.exitCode=errors?1:0;
