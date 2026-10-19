import {Chess} from './chess.js';
import {guides as allGuides} from './guides.js';
import {guides} from './catalog.js';
import {profile,purposes} from './purposes.js';
import {lessons,position} from './lessons.js';
const center=['d4','e4','d5','e5'];
const names={p:'폰',n:'나이트',b:'비숍',r:'룩',q:'퀸',k:'킹'};
const other=x=>x==='w'?'b':'w';
export function boardFacts(c,side){const enemy=other(side),home=side==='w'?'1':'8',pieces=c.board().flat().filter(Boolean),own=pieces.filter(p=>p.color===side),king=own.find(p=>p.type==='k'),undeveloped=own.filter(p=>['n','b'].includes(p.type)&&p.square[1]===home).map(p=>p.square),centralPawns=own.filter(p=>p.type==='p'&&['c','d','e','f'].includes(p.square[0])).map(p=>p.square),control=center.filter(s=>c.isAttacked(s,side)),attacked=own.filter(p=>p.type!=='k'&&c.isAttacked(p.square,enemy)).map(p=>p.square),closed=['d','e'].filter(f=>{for(let r=2;r<=6;r++){const a=c.get(f+r),b=c.get(f+(r+1));if(a?.type==='p'&&a.color==='w'&&b?.type==='p'&&b.color==='b')return true;}return false;});return {king:king.square,kingAttacked:c.isAttacked(king.square,enemy),undeveloped,centralPawns,control,attacked,closed};}
export function transition(history,g,reference){const expected=reference||g.line.split(' '),at=history.findIndex((m,i)=>expected[i]!==m);if(at<0)return {title:'대표 수순 안에서 진행 중',detail:'같은 수순이어도 상대의 위협을 먼저 확인하세요.'};const eligible=allGuides.filter(x=>x.id!==g.id&&history.length>=3&&history.every((m,i)=>x.line.split(' ')[i]===m));const match=eligible.sort((a,b)=>a.line.split(' ').length-b.line.split(' ').length)[0];return {title:match?'다른 갈래: '+match.name:'대표 수순과 다른 국면',detail:`${Math.floor(at/2)+1}수 ${at%2?'흑':'백'} ${history[at]}부터 달라졌습니다. ${match?'중앙과 기물의 역할을 새 갈래에 맞춰 다시 봅니다.':'정석을 벗어난 것만으로 실수는 아닙니다. 위협 → 중앙 → 전개 → 킹 안전 순서로 판단하세요.'}`,link:match&&guides.some(x=>x.id===match.id)?match.id:null};}
export function checklist(c,g,side){const f=boardFacts(c,side);const legal=c.moves({verbose:true}),captures=legal.filter(m=>m.captured).map(m=>m.san),turn=c.turn()===side?'내':'상대';return [
 {id:'king',title:f.kingAttacked?'킹에 대한 위협부터 처리':'킹 안전 확인',text:f.kingAttacked?'현재 킹이 공격받고 있습니다. 체크를 해소하는 합법 수부터 봅니다.':`킹 ${f.king}. 중앙을 열기 전 상대 체크와 주변 폰 방어를 확인하세요.`},
 {id:'center',title:'중앙과 폰 브레이크',text:`내 직접 공격 칸: ${f.control.join('·')||'중앙 4칸 직접 공격 없음'}. ${f.closed.length?f.closed.join('·')+'파일 폰이 서로 막혀 있습니다. 돌파 준비와 기물 기동을 먼저 봅니다.':'중앙 교환이 일어나면 열린 선과 킹 안전을 다시 봅니다.'}`},
 {id:'develop',title:'개선할 말',text:f.undeveloped.length?`시작 줄에 남은 경량 기물: ${f.undeveloped.join('·')}. 공격받는 말 처리 후 활동할 칸을 찾으세요.`:'경량 기물이 시작 줄을 벗어났습니다. 활동이 적은 말과 룩의 파일을 점검하세요.'},
 {id:'structure',title:'공격 대상과 교환',text:f.attacked.length?`상대가 직접 공격하는 내 말·폰: ${f.attacked.join('·')}. 수비·교환·이동을 비교하세요. 공격받는다고 곧 손실은 아닙니다.`:`중앙 폰: ${f.centralPawns.join('·')||'없음'}. 폰 전진 후 약해지는 칸과 교환 후 파일을 확인하세요.`},
 {id:'restrict',title:'상대의 의도',text:captures.length?`지금 ${turn} 차례의 가능한 잡기: ${captures.slice(0,5).join(' · ')}. 강제 획득인지는 후속 응수를 계산해야 합니다.`:'상대가 다음에 준비할 중앙 돌파와 말의 진입 칸을 먼저 확인하세요.'}
 ].map(x=>({...x,focus:profile(g).focus.includes(x.id)}));}
export function explainCandidate(fen,san,g,side){const c=new Chess(fen),moving=c.turn(),before=boardFacts(c,moving),m=c.move(san),after=boardFacts(c,moving),parts=[],ties=[];const focus=profile(g).focus;
 if(m.flags.includes('k')||m.flags.includes('q')){parts.push('킹을 옮기고 룩을 중앙 쪽으로 연결합니다.');ties.push('king','develop');}
 if(m.captured){parts.push(`${m.to}의 ${names[m.captured]}${['n','q'].includes(m.captured)?'를':'을'} 잡습니다. 되잡힌 뒤의 재료와 열린 선을 비교합니다.`);ties.push('structure');if(center.includes(m.to))ties.push('center');}
 if(m.san.includes('#'))parts.push('체크메이트입니다.');else if(m.san.includes('+'))parts.push('체크로 상대의 대응을 제한합니다.');
 if(['n','b'].includes(m.piece)&&before.undeveloped.includes(m.from)){parts.push(`${names[m.piece]}${m.piece==='n'?'를':'을'} ${m.to}로 전개합니다.`);ties.push('develop');}
 const gained=after.control.filter(s=>!before.control.includes(s));if(gained.length){parts.push(`${gained.join('·')}에 통제·수비를 추가합니다.`);ties.push('center','restrict');}
 if(m.piece==='p'&&['c','d','e'].includes(m.from[0])){parts.push('중앙 폰 배치를 바꾸므로 교환 뒤 약점과 기물 경로를 확인합니다.');ties.push('structure','center');}
 if(m.piece==='p'&&['f','g','h'].includes(m.from[0]))parts.push('킹 쪽 폰 이동입니다. 공격 공간과 킹 주변 약화의 교환을 확인합니다.');
 if(!parts.length)parts.push(`${names[m.piece]}${['n','q','r','k'].includes(m.piece)?'를':'을'} ${m.from}에서 ${m.to}로 옮깁니다. 다음 중앙 돌파와 상대 응수를 함께 봅니다.`);
 const matched=[...new Set(ties)].filter(id=>focus.includes(id)).map(id=>purposes.find(x=>x[0]===id)[1]);
 return {text:parts.slice(0,2).join(' '),relation:matched.length?`${moving===side?'내':'상대'} 수의 목적 연결: ${matched.join(' · ')}`:'목적 연결은 현재 구조와 상대의 응수까지 보고 판단합니다.'};
}
export function planStatus(c,g,side,studyCase=lessons[g.id].cases[0]){const i=side==='w'?0:1,arr=studyCase.plans[i],reference=position(studyCase.line),pawns=x=>x.board().flat().filter(p=>p?.type==='p'&&['c','d','e','f'].includes(p.square[0])).map(p=>p.color+p.square).sort().join(' '),same=pawns(c)===pawns(reference),breaks=[...new Set(arr[2].match(/[a-h][3-6]/g)||[])],legal=c.turn()===side?c.moves({verbose:true}):[],available=breaks.filter(s=>legal.some(m=>m.piece==='p'&&m.to===s));return {same,goal:arr[6],improve:arr[1],prepare:arr[2],target:arr[3],text:same?'대표 예시와 중앙 폰 배치가 같습니다. 이 계획을 검토할 수 있지만 말 배치와 전술도 확인하세요.':'대표 예시와 중앙 폰 배치가 다릅니다. 아래 계획은 조건부입니다. 원래 수순을 강요하지 말고 중앙 교환과 상대 위협부터 다시 보세요.',breakNote:c.turn()!==side?'상대 차례입니다. 상대의 중앙 반격을 확인한 다음 돌파를 검토하세요.':available.length?`${available.join('·')}로 가는 폰 수가 현재 합법적입니다. 안전성과 유리함은 후보 계산으로 확인하세요.`:'계획의 폰 돌파가 지금 바로 가능하지 않을 수 있습니다. 전개·수비·준비 수를 먼저 비교하세요.'};}
