import {guides as allGuides} from './guides.js';
import {lessons,position,moves} from './lessons.js';
import {openingRoadmap} from './roadmap.js';
import {explainCandidate} from './coach.js?v=20261020-roadmap2';
const enemy=s=>s==='w'?'b':'w';
const pawnKey=c=>c.board().flat().filter(p=>p?.type==='p'&&'cde'.includes(p.square[0])).map(p=>p.color+p.square).sort().join();
const value={p:1,n:3,b:3,r:5,q:9,k:100};
export function choosePlan(c,g,side,studyCase=lessons[g.id].cases[0],reference=moves(studyCase.line)){
 const history=c.history(),verbose=c.history({verbose:true}),lastEnemy=verbose.findLast(m=>m.color!==side),original=openingRoadmap(g,studyCase,side);
 const at=history.findIndex((m,i)=>reference[i]!==m),prefix=at<0;
 let nextGuide=g,nextCase=studyCase,kind='continue',verdict='그대로 진행',because='원래 배치를 막는 변화가 아직 확인되지 않았습니다.',first=original.steps[0];
 const alternatives=at<0?[]:allGuides.filter(x=>x.id!==g.id&&lessons[x.id]).map(x=>({g:x,line:moves(x.line)})).filter(x=>{const n=Math.min(history.length,x.line.length);return n>=Math.max(4,at+1)&&history.slice(0,n).every((m,i)=>m===x.line[i]);}).sort((a,b)=>Math.min(history.length,b.line.length)-Math.min(history.length,a.line.length));
 const branch=alternatives[0];
 const shape=lessons[g.id].cases.find(s=>s!==studyCase&&pawnKey(position(s.line))===pawnKey(c)&&pawnKey(position(s.line))!==pawnKey(position(studyCase.line)));
 if(branch){nextGuide=branch.g;nextCase=lessons[nextGuide.id].cases[0];kind='switch';verdict='새 계획으로 전환';because=`${Math.floor(at/2)+1}수 ${at%2?'흑':'백'} ${history[at]}로 ${nextGuide.name} 수순에 들어갔습니다. ${g.name}의 수순을 이어서 강요하지 않습니다.`;}
 else if(shape){nextCase=shape;kind='switch';verdict='새 계획으로 전환';because=`폰 배치가 ‘${shape.label}’ 예시와 같습니다. 기존 예시의 폰 돌파 대신 이 구조의 계획을 사용합니다.`;}
 const route=openingRoadmap(nextGuide,nextCase,side),path=moves(nextCase.line);
 let example=history.length<path.length&&history.every((m,i)=>path[i]===m)&&c.moves().includes(path[history.length])?path[history.length]:null;
 if(kind==='continue'&&!example&&history.length<reference.length&&c.moves().includes(reference[history.length]))example=reference[history.length];
 if(nextGuide.id==='italian'&&side==='w'&&c.get('c1')?.type==='b'&&c.attackers('g5','b').some(s=>c.get(s).type==='p')){
  route.steps[0]=(c.get('d2')?.type==='p'?'d3로 길을 연 뒤 ':'')+'c1 비숍을 e3 방향으로 전개';
  first=route.steps[0];
  because+=' g5는 흑 폰의 공격을 받으므로 비숍은 e3 방향으로 전개합니다. d4 목표는 유지합니다.';
 }
 if(kind==='switch')first=route.steps[0];
 const risk=c.board().flat().filter(p=>p?.color===side&&p.type!=='k'&&c.isAttacked(p.square,enemy(side))&&(!c.isAttacked(p.square,side)||c.attackers(p.square,enemy(side)).some(s=>value[c.get(s).type]<value[p.type])));
 if(c.isGameOver()){kind='end';verdict='수순 종료';because=c.isCheckmate()?'체크메이트입니다.':'무승부 조건에 도달했습니다.';first='이전 수로 돌아가 다른 대응을 비교하세요.';example=null;}
 else if(c.turn()===side&&c.isCheck()){kind='respond';verdict='체크 해소 먼저';because='원래 계획보다 킹의 체크 해소가 우선입니다.';first='킹 이동·공격 말 잡기·공격선 차단 중 합법 수를 계산하세요.';example=null;}
 else if(kind!=='switch'&&risk.length){kind='respond';verdict='먼저 대응한 뒤 진행';because=`${risk.slice(0,3).map(p=>p.square).join('·')}에 손실 위험을 확인할 공격이 있습니다. 목표를 버리는 것이 아니라 수비·반격을 먼저 합니다.`;first='수비·이동과 중앙 반격을 계산한 뒤 아래 원래 계획으로 돌아오세요.';}
 else if(kind==='continue'&&!prefix){because=lastEnemy?`상대가 ${lastEnemy.san}로 달리 뒀지만, 다른 갈래나 폰 배치 전환은 확인되지 않았습니다. 우선 원래 전개를 이어갑니다.`:'우선 원래 전개를 이어갑니다.';}
 const selected=kind==='respond'?'respond':kind==='switch'?'switch':'continue';
 if(kind==='respond')example=null;
 if(example&&kind!=='end'&&kind!=='respond'&&c.turn()===side)first=`${example}를 후보로 봅니다. ${explainCandidate(c.fen(),example,nextGuide,side).text}`;
 if(c.turn()!==side&&kind!=='end')first='지금은 상대 차례입니다. 다음 내 차례에는 '+first;
 if(nextGuide.id==='italian'&&side==='w'&&route.steps[0].includes('e3 방향으로 전개')&&!because.includes('g5'))because+=' g5는 흑 폰이 공격하므로 비숍은 e3 방향으로 전개합니다. d4 목표는 유지합니다.';
 return {kind,selected,verdict,because,first,example,route,preparing:history.length<path.length,planName:nextGuide.name+(nextCase===lessons[nextGuide.id].cases[0]?'':' · '+nextCase.label),newGuide:nextGuide.id!==g.id?nextGuide:null,note:'현재 배치와 알려진 갈래에 따른 학습용 우선순위입니다. 전술적 최선 수는 후보 계산으로 확인하세요.'};
}
