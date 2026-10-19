import {replay,parseInfo,collectResult} from './uci.js';
let engine=null,watchdog=null;
self.onmessage=({data})=>{
 try{const {game,command}=replay(data.fen,data.history),groups=new Map(),expected=Math.min(3,game.moves().length);
  if(game.isGameOver()){self.postMessage({id:data.id,fen:data.fen,depth:0,nodes:0,candidates:[],terminal:game.isCheckmate()?'checkmate':game.isStalemate()?'stalemate':'draw'});return;}
  const finish=result=>{clearTimeout(watchdog);engine?.terminate();engine=null;self.postMessage({id:data.id,...result});};
  engine=new Worker(new URL('./engine/stockfish-19-lite-single.js',import.meta.url));
  watchdog=setTimeout(()=>finish({fen:data.fen,error:'엔진 로딩이 지연되었습니다. 다시 계산하거나 외부 분석판을 이용하세요.'}),25000);
  engine.onerror=()=>finish({fen:data.fen,error:'이 브라우저에서 Stockfish를 불러오지 못했습니다. 외부 분석판을 이용하세요.'});
  engine.onmessage=({data:message})=>{for(const raw of String(message).split('\n')){const line=raw.trim();if(line==='uciok'){engine.postMessage('setoption name Hash value 16');engine.postMessage('setoption name MultiPV value '+expected);engine.postMessage('isready');}else if(line==='readyok'){engine.postMessage(command);engine.postMessage('go depth 16 movetime 1800');}else if(line.startsWith('info ')){const info=parseInfo(line);if(info){if(!groups.has(info.depth))groups.set(info.depth,new Map());groups.get(info.depth).set(info.rank,info);}}else if(line.startsWith('bestmove ')){try{finish(collectResult(data.fen,groups,expected,line.split(' ')[1]));}catch{finish({fen:data.fen,error:'계산 수순의 합법성 검증에 실패했습니다. 다시 계산해 주세요.'});}}}};
  engine.postMessage('uci');
 }catch{clearTimeout(watchdog);engine?.terminate();self.postMessage({id:data.id,fen:data.fen,error:'현재 국면을 계산할 수 없습니다.'});}
};
