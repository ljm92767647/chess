import fs from 'node:fs';
import {Chess} from '../dist/chess.js';
import {guides} from '../dist/guides.js';
const data=JSON.parse(fs.readFileSync(new URL('../dist/database.json',import.meta.url)));
const failures=[];
for(const g of guides){let c=new Chess();try{for(const m of g.line.split(' '))c.move(m)}catch(e){failures.push({name:g.name,error:e.message})}}
for(const d of data){let c=new Chess();try{c.loadPgn(d.pgn)}catch(e){failures.push({name:d.name,error:e.message})}}
console.log(JSON.stringify({guides:guides.length,database:data.length,failures},null,2));
if(failures.length)process.exitCode=1;
