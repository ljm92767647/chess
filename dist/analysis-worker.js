import {replay,parseInfo,collectResult} from './uci.js?v=20261020-compare';
import {mergePlanSearch} from './plan-analysis.js?v=20261020-compare';
let engine=null,watchdog=null;
self.onmessage=({data})=>{
 let finished=false;
 const finish=result=>{if(finished)return;finished=true;clearTimeout(watchdog);engine?.terminate();engine=null;self.postMessage({id:data.id,...result});};
 try{
  const {game,command}=replay(data.fen,data.history),groups=new Map(),planGroups=new Map(),expected=Math.min(3,game.moves().length);
  if(game.isGameOver()){finish({fen:data.fen,depth:0,nodes:0,candidates:[],terminal:game.isCheckmate()?'checkmate':game.isStalemate()?'stalemate':'draw'});return;}
  const planMove=data.planMove?game.moves({verbose:true}).find(m=>m.san===data.planMove):null;
  if(data.planMove&&!planMove)throw Error('Invalid proposed move');
  let phase='main',mainBest=null;
  engine=new Worker(new URL('./engine/stockfish-19-lite-single.js',import.meta.url));
  watchdog=setTimeout(()=>finish({fen:data.fen,error:'계산이 지연되었습니다. 다시 계산하거나 외부 분석판을 이용하세요.'}),35000);
  engine.onerror=()=>finish({fen:data.fen,error:'이 브라우저에서 Stockfish를 불러오지 못했습니다. 외부 분석판을 이용하세요.'});
  engine.onmessage=({data:message})=>{if(finished)return;for(const raw of String(message).split('\n')){
   const line=raw.trim();
   if(line==='uciok'){engine.postMessage('setoption name Hash value 16');engine.postMessage('setoption name MultiPV value '+expected);engine.postMessage('isready');}
   else if(line==='readyok'){engine.postMessage(command);engine.postMessage('go depth 18 movetime 2600');}
   else if(line.startsWith('info ')){const info=parseInfo(line);if(info){const store=phase==='main'?groups:planGroups;if(!store.has(info.depth))store.set(info.depth,new Map());store.get(info.depth).set(info.rank,info);}}
   else if(line.startsWith('bestmove ')){
    try{
     if(phase==='main'){
      mainBest=line.split(' ')[1];const result=collectResult(data.fen,groups,expected,mainBest);
      if(planMove&&result.depth>0&&!result.candidates.some(x=>x.san===planMove.san)){
       phase='plan';self.postMessage({id:data.id,fen:data.fen,phase:'plan-check',planMove:planMove.san});
       engine.postMessage('setoption name MultiPV value 1');engine.postMessage(command);
       engine.postMessage(`go depth ${result.depth} movetime 2200 searchmoves ${planMove.from+planMove.to+(planMove.promotion||'')}`);
      }else finish(mergePlanSearch(data.fen,groups,planGroups,expected,mainBest,planMove?.san));
     }else finish(mergePlanSearch(data.fen,groups,planGroups,expected,mainBest,planMove?.san));
    }catch{finish({fen:data.fen,error:'후보와 원래 예시 수를 비교하지 못했습니다. 다시 계산하세요.'});}
   }
  }};
  engine.postMessage('uci');
 }catch{finish({fen:data.fen,error:'현재 국면과 검증할 수를 확인하지 못했습니다.'});}
};
