import {Chess} from './chess.js';
import {boardFacts,explainCandidate} from './coach.js?v=20261020-roadmap2';
import {lessons} from './lessons.js';
const names={p:'폰',n:'나이트',b:'비숍',r:'룩',q:'퀸',k:'킹'};
const other=s=>s==='w'?'b':'w';
const pieces=c=>c.board().flat().filter(Boolean);
const label=p=>`${p.square} ${names[p.type]}`;
const filesOpened=(a,b,color)=>['c','d','e','f'].filter(f=>pieces(a).some(p=>p.type==='p'&&p.color===color&&p.square[0]===f)&&!pieces(b).some(p=>p.type==='p'&&p.color===color&&p.square[0]===f));

export function moveInsight(m,g,side,studyCase=lessons[g.id].cases[0]){
 if(!m)return null;
 const before=new Chess(m.before),after=new Chess(m.after),own=m.color===side,explanation=explainCandidate(m.before,m.san,g,side);
 const old=boardFacts(before,m.color),now=boardFacts(after,m.color);
 const newTargets=pieces(after).filter(p=>p.color!==m.color&&p.type!=='k'&&after.isAttacked(p.square,m.color)&&!before.isAttacked(p.square,m.color));
 const opened=filesOpened(before,after,m.color),centralTrade=!!m.captured&&['c','d','e'].includes(m.to[0]);
 const lockChanged=old.closed.join()!==now.closed.join();
 let kind='inspect',relation='목적 연결 확인 · 원래 돌파와 표적에 도움이 되는지 비교',next='이 이동 뒤 원래 돌파가 쉬워지는지, 상대의 반격을 막는지 확인합니다. 이동만으로 계획 유지·전환을 확정하지 않습니다.';
 if(before.isCheck()) {kind='prepare';relation='대응 우선 · 체크를 풀고 원래 계획으로 돌아갈 준비';next='체크를 막은 뒤에도 공격받는 말이 남는지 확인하고 전개를 이어갑니다.';}
 else if(m.promotion){kind='change';relation='새 목표로 전환 · 승진한 말의 활동과 킹 공격';next='승진한 말의 안전, 체크와 강제 교환을 먼저 계산합니다.';}
 else if(lockChanged&&!m.captured&&!opened.length){kind='prepare';relation='목적은 유지 가능 · 맞막힌 중앙의 돌파를 준비';next='맞막힌 중앙을 바로 열 수 없다면 다른 말을 전개하고 폰 돌파를 지원할 칸으로 기동합니다. 중앙이 잠겼다는 이유만으로 목표를 버릴 필요는 없습니다.';}
 else if(centralTrade||lockChanged||opened.length){kind='review';relation='계획 전환 검토 · 교환 뒤 파일과 표적에 맞춰 조정';next=opened.length?`${opened.join('·')}파일에서 내 폰이 없어졌습니다. 상대 폰이 남으면 반열린 파일입니다. 룩의 진입과 남은 약한 폰을 비교하세요.`:'중앙의 남은 폰과 열린 대각선을 보고, 기존 표적이 남으면 목적을 유지하고 사라졌으면 새 표적을 고릅니다.';}
 else if(m.piece!=='p'&&old.attacked.includes(m.from)&&!now.attacked.includes(m.to)&&!m.captured){kind='prepare';relation='대응 우선 · 공격받던 말을 옮기며 순서를 조정';next='말을 피한 뒤 원래 목표에 다시 참여할 경로를 찾습니다. 퇴각만으로 목적을 포기한 것은 아닙니다.';}
 else if((m.flags.includes('k')||m.flags.includes('q'))){kind='keep';relation='기존 목적 유지 · 킹 안전과 룩 연결을 준비';next='킹을 옮긴 쪽의 폰 방어와 중앙을 확인한 뒤 룩을 활동시킵니다.';}
 else if(newTargets.some(p=>['n','b','r','q'].includes(p.type))){kind='prepare';relation='목적 유지 가능 · 상대 말을 압박하며 대응 유도';next='상대가 이동·수비·교환 중 무엇을 선택할지 비교하고 그 사이 전개를 이어갈 수 있는지 확인합니다. 공격만으로 템포 이득이 확정되지는 않습니다.';}
 else if(m.captured){kind='review';relation='교환 뒤 계획 확인 · 남은 말의 역할을 다시 비교';next='교환한 말이 담당하던 공격·수비와 남은 말의 활동을 비교합니다. 핵심 공격 수단이 사라졌을 때만 새 목표를 검토합니다.';}
 else if(['n','b'].includes(m.piece)&&old.undeveloped.includes(m.from)){kind='keep';relation='기존 목적 유지 · 경량 기물을 전개해 싸움에 참여';next='새로 통제하는 칸을 활용하며 다른 말의 전개와 킹 안전을 준비합니다.';}
 else if(m.piece==='p'&&['c','d','e'].includes(m.to[0])){kind='keep';relation='기존 목적 유지 · 중앙 공간과 돌파의 발판 마련';next='전진한 폰을 지킬 말과 상대의 폰 교환을 확인한 뒤 전개를 이어갑니다.';}
 if(m.san.includes('#')){kind='finish';relation='목표 달성 · 체크메이트';next='이 수로 대국이 끝납니다.';}
 const plans=studyCase.plans[own?(side==='w'?0:1):(side==='w'?1:0)];
 return {san:m.san,color:m.color,own,kind,title:`${m.before.split(' ')[5]}수 ${m.color==='w'?'백':'흑'} · ${m.san}`,why:explanation.text,pressure:newTargets.length?`이 수 뒤 새로 압박하는 대상: ${newTargets.slice(0,3).map(label).join('·')}. 수비와 되잡기가 있으므로 강제 획득을 뜻하지 않습니다.`:'',relation:(own?'내 수: ':'상대 수: ')+relation,next,goal:plans[6],note:'말 배치와 수의 직접 효과를 바탕으로 한 해설입니다. 폰을 움직였다는 이유만으로 장기 계획이 바뀌었다고 단정하지 않습니다.'};
}

export function responseAdvice(c,g,side,studyCase=lessons[g.id].cases[0]){
 const f=boardFacts(c,side),moves=c.history({verbose:true}),m=moves.findLast(x=>x.color!==side),plans=studyCase.plans[side==='w'?0:1];
 const insight=moveInsight(m,g,side,studyCase),after=m?new Chess(m.after):null,before=m?new Chess(m.before):null;
 const fresh=m?pieces(c).filter(p=>p.color===side&&p.type!=='k'&&c.isAttacked(p.square,other(side))&&after.isAttacked(p.square,other(side))&&!before.isAttacked(p.square,other(side))):[];
 let title='전개를 이어가며 상대의 중앙 반격을 확인하세요',status='기존 목적을 이어갈 후보',action=`먼저 ${plans[1]}. 이후 ${plans[2]}를 준비하며 ${plans[3]}을 목표로 합니다.`,reason=m?insight.why:'아직 확인할 상대 수가 없습니다. 원하는 상대 수를 두면 그 수의 효과와 대응을 보여줍니다.';
 if(c.isGameOver()){title='대국이 끝났습니다';status='수순 종료';action='앞으로 더 둘 수 없습니다. 이전 수로 돌아가 다른 대응을 비교하세요.';}
 else if(f.kingAttacked){title='지금은 내 킹의 체크부터 막아야 합니다';status='수비 먼저 → 원래 계획은 그 다음';action='킹 이동·체크 기물 잡기·공격선 차단 중 합법 수를 비교하세요. 체크를 무시하고 원래 수순을 둘 수 없습니다.';}
 else if(fresh.length){title=`상대의 새 압박 대상: ${fresh.slice(0,2).map(label).join('·')}`;status='대응 순서 조정 · 표적은 아직 유지 가능';const captures=c.turn()===side?c.moves({verbose:true}).filter(x=>x.captured).map(x=>x.san).slice(0,3):[];action='수비 추가·말 이동·공격 말 교환과 상대 중앙에 대한 반격을 비교하세요. '+(captures.length?`지금 가능한 잡기 ${captures.join('·')}도 후보이며 후속 되잡기까지 계산합니다. `:'')+'공격받는다는 이유만으로 곧 잃는 것은 아니므로 원래 전개를 계속할 수도 있습니다.';}
 else if(insight?.kind==='review'){title=`상대가 ${m.to}에서 교환했습니다 · 남은 말과 표적을 확인하세요`;status='표적이 남으면 유지 · 사라졌으면 계획 전환';action=insight.next;}
 else if((m&&(m.flags.includes('k')||m.flags.includes('q')))){title='상대가 캐슬링했습니다 · 공격 방향을 다시 확인하세요';status='목적 유지 가능 · 공격 표적 위치 확인';action='상대 킹이 옮겨간 쪽의 약점과 내 킹 안전을 비교하세요. 공격 준비가 부족하면 말 전개와 중앙 수비를 먼저 합니다.';}
 else if(m?.piece==='p'&&['c','d','e'].includes(m.to[0])){title=`상대가 ${m.to}에 폰을 뒀습니다 · 중앙을 지킬지 교환할지 비교하세요`;status='중앙 대응 확인 → 기존 전개 계속';action='중앙 폰의 전진·교환·유지 뒤 상대의 가장 강한 응수를 비교하세요. 기존 돌파와 표적이 여전히 유효하면 계획을 이어가고, 교환으로 없어지면 새 파일을 활용합니다.';}
 return {title,status,reason,action,opponent:m?`${m.color==='w'?'백':'흑'} ${m.san}`:'아직 없음',answered:!!m&&moves.at(-1).color===side,goal:plans[6],improve:plans[1],prepare:plans[2],target:plans[3],insight};
}
