import {readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, {withFileTypes:true})) {
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()) await checkDirectory(file);
    else if(/\.(?:m?js)$/.test(entry.name)) execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
  }
}
export async function checkClientSyntax() {
  await checkDirectory('public');
  await checkDirectory('private');
}
