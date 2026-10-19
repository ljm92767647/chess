import {Chess} from '../dist/chess.js';
import {guides} from '../dist/catalog.js';
const failures=[];
for(const g of guides){let c=new Chess();try{for(const m of g.line.split(' '))c.move(m)}catch(e){failures.push({name:g.name,error:e.message})}}
console.log(JSON.stringify({guides:guides.length,failures},null,2));
if(failures.length)process.exitCode=1;
