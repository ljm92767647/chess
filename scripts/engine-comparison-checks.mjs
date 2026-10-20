import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Chess} from '../dist/chess.js';
import {parseInfo,collectResult} from '../dist/uci.js';
import {mergePlanSearch,assessedPlan} from '../dist/plan-analysis.js';
import {choosePlan} from '../dist/plan-choice.js';
import {guides} from '../dist/catalog.js';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'chess-plan-compare-')),base='stockfish-19-lite-single';
for(const ext of ['js','wasm'])fs.copyFileSync(fileURLToPath(new URL('../dist/engine/'+base+'.'+ext,import.meta.url)),path.join(root,base+'.'+ext));
fs.writeFileSync(path.join(root,'package.json'),'{"type":"commonjs"}');
const child=spawn(process.execPath,[path.join(root,base+'.js')],{stdio:['pipe','pipe','pipe'],windowsHide:true});
const send=s=>child.stdin.write(s+'\n');let buffer='',dispatch=()=>{};
child.stdout.on('data',chunk=>{buffer+=chunk;const lines=buffer.split('\n');buffer=lines.pop();for(const line of lines)dispatch(line.trim());});
const timer=setTimeout(()=>child.kill(),30000);
const exited=new Promise(resolve=>child.once('exit',resolve));
const ready=new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',()=>reject(Error('Engine stopped before ready')));dispatch=line=>{if(line==='uciok')send('isready');if(line==='readyok')resolve();};});
send('uci');await ready;
async function search(fen,depth,plan){return new Promise((resolve,reject)=>{
 const groups=new Map();
 const stopped=()=>reject(Error('Engine stopped during comparison'));child.once('exit',stopped);
 dispatch=line=>{try{if(line.startsWith('info ')){const info=parseInfo(line);if(info){if(!groups.has(info.depth))groups.set(info.depth,new Map());groups.get(info.depth).set(info.rank,info);}}else if(line.startsWith('bestmove ')){child.removeListener('exit',stopped);resolve({groups,best:line.split(' ')[1]});}}catch(e){child.removeListener('exit',stopped);reject(e);}};
 send('setoption name MultiPV value '+(plan?1:3));send('position fen '+fen);send(`go depth ${depth} movetime 1500${plan?' searchmoves '+plan:''}`);
 });}
const h6=new Chess();for(const san of ['e4','e5','Nf3','Nc6','Bc4','h6'])h6.move(san);
const results=[],italian=guides.find(g=>g.id==='italian');
try{
 for(const [name,c,san]of [['omitted-theory-move',new Chess(),'a3'],['italian-h6',h6,'c3']]){
  const main=await search(c.fen(),12),baseline=collectResult(c.fen(),main.groups,3,main.best),m=c.moves({verbose:true}).find(x=>x.san===san);
  assert(baseline.depth>0);const extra=await search(c.fen(),baseline.depth,m.from+m.to+(m.promotion||''));
  const merged=mergePlanSearch(c.fen(),main.groups,extra.groups,3,main.best,san),plan=merged.candidates.find(x=>x.san===san);
  assert(plan,name+' proposed move must be in the displayed results');
  assert(merged.comparison.depth>0,name+' requires shared completed depth');
  for(const candidate of merged.candidates){const replay=new Chess(c.fen());for(const pvMove of candidate.pv)assert(replay.move(pvMove));}
  const decision=assessedPlan(choosePlan(c,italian,'w'),merged,'w',()=> '');
  if(decision.checked)assert(merged.candidates.some(x=>x.san===decision.example));
  results.push({name,theoryMove:san,sharedDepth:merged.depth,category:merged.comparison.category||merged.comparison.status,originalWasTopThree:baseline.candidates.some(x=>x.san===san),candidate:decision.example});
 }
}finally{clearTimeout(timer);send('quit');await exited;const resolved=fs.realpathSync(root);assert.equal(path.dirname(resolved),fs.realpathSync(os.tmpdir()));assert(path.basename(resolved).startsWith('chess-plan-compare-'));fs.rmSync(resolved,{recursive:true,force:true});}
fs.mkdirSync('outputs',{recursive:true});fs.writeFileSync('outputs/engine-comparison-validation.json',JSON.stringify({results,failures:[]},null,2));console.log(JSON.stringify({enginePlanComparisons:results,failures:[]}));
