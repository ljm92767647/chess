import {collectResult,toCandidate} from './uci.js?v=20261020-compare2';
const merit=x=>x.scoreKind==='mate'?(x.score>0?100000-x.score:-100000-x.score):Math.max(-99000,Math.min(99000,x.score));
export function scoreText(x){if(!x||!(x.depth>0))return '평가 미확정';return x.scoreKind==='mate'?(x.score>0?`상대 메이트까지 ${x.score}수`:`내 메이트까지 ${-x.score}수`):`${x.score>=0?'+':''}${(x.score/100).toFixed(2)}`;}
export function comparePlan(candidates,planSan,depth){
 const best=candidates[0],plan=candidates.find(x=>x.san===planSan),base={planSan,bestSan:best?.san,depth,best,plan};
 if(!planSan)return {...base,status:'no-plan'};
 if(!plan||depth<10)return {...base,status:'incomplete'};
 if(best.scoreKind==='cp'&&plan.scoreKind==='cp'){const lossCp=Math.max(0,best.score-plan.score);return {...base,status:'compared',lossCp,category:lossCp<=30?'close':lossCp<80?'adjust':'hold'};}
 if(plan.scoreKind==='mate'&&plan.score<0&&!(best.scoreKind==='mate'&&best.score<0))return {...base,status:'compared',category:'hold',mateReason:'원래 예시 수에는 강제 메이트 위험이 계산되었습니다.'};
 if(best.scoreKind==='mate'&&best.score>0&&!(plan.scoreKind==='mate'&&plan.score>0))return {...base,status:'compared',category:'hold',mateReason:'계산 후보에는 원래 예시 수와 다른 강제 메이트 기회가 있습니다.'};
 if(best.scoreKind==='mate'&&plan.scoreKind==='mate')return {...base,status:'compared',category:best.score>0&&plan.score>0?'close':'hold',mateReason:best.score>0?'두 수 모두 강제 메이트가 계산됩니다.':'비교한 수들에서 모두 메이트 위험이 계산됩니다.'};
 return {...base,status:'incomplete'};
}
export function mergePlanSearch(fen,mainGroups,planGroups,expected,bestmove,planSan){
 const base=collectResult(fen,mainGroups,expected,bestmove);
 if(!planSan)return {...base,comparison:comparePlan(base.candidates,null,base.depth)};
 if(base.candidates.some(x=>x.san===planSan))return {...base,comparison:comparePlan(base.candidates,planSan,base.depth)};
 const common=[...mainGroups.keys()].filter(d=>planGroups.get(d)?.has(1)&&Array.from({length:expected},(_,i)=>mainGroups.get(d).has(i+1)).every(Boolean)).sort((a,b)=>b-a)[0];
 if(common){
  const g=mainGroups.get(common),plan=toCandidate(fen,planGroups.get(common).get(1));
  if(plan.san!==planSan)throw Error('Plan search did not match requested move');
  const candidates=[...Array.from({length:expected},(_,i)=>toCandidate(fen,g.get(i+1))).filter(x=>x.san!==planSan),{...plan,source:'plan'}].sort((a,b)=>merit(b)-merit(a));
  return {...base,depth:common,nodes:base.nodes+planGroups.get(common).get(1).nodes,candidates,comparison:comparePlan(candidates,planSan,common)};
 }
 const latest=[...planGroups.entries()].filter(([,g])=>g.has(1)).sort((a,b)=>b[0]-a[0])[0];
 const extra=latest?{...toCandidate(fen,latest[1].get(1)),source:'plan'}:null;
 if(extra&&extra.san!==planSan)throw Error('Plan search did not match requested move');
 return {...base,candidates:extra?[...base.candidates,extra]:base.candidates,comparison:{status:'incomplete',planSan,bestSan:base.candidates[0]?.san,depth:0}};
}
export function assessedPlan(d,result,side,explain){
 const pending={...d,checked:false,selected:'pending',verdict:d.kind==='end'?d.verdict:'전략 초안 · 계산 전',because:`목표 초안: ${d.route.goal}. 이번 수는 아직 계산으로 확인하지 않았습니다.`,theoryReason:d.because,first:d.example?`이론 예시 ${d.example}는 아직 이 국면에서 검증하지 않았습니다. 수 계산으로 비교하세요.`:'장기 목표의 초안입니다. 이번에 둘 수는 계산한 뒤 선택하세요.',example:null,comparisonText:'',originalExample:d.example};
 if(d.kind==='respond'){pending.verdict=d.verdict==='체크 해소 먼저'?'체크 해소 필수 · 대응 수 계산 전':'위협 확인 먼저 · 대응 수 계산 전';pending.because=d.because;pending.first='원래 전개를 두기 전에 수비·이동·반격 후보를 계산하세요.';}
 if(d.turn&&d.turn!==side){pending.verdict='상대 차례 · 다음 응수 확인';pending.first='상대 수를 선택하거나 계산하세요. 내 수의 검증은 상대 응수 뒤 진행합니다.';}
 if(d.kind==='end')return {...d,checked:true};
 if(!result?.candidates?.length)return pending;
 const best=result.candidates[0],cmp=result.comparison||{status:'incomplete'},ownTurn=result.fen.split(' ')[1]===side;
 if(!ownTurn)return {...pending,checked:true,verdict:'상대 후보 계산 · 내 판단은 응수 뒤',because:`${best.san}는 상대 차례의 후보입니다. 내 다음 수를 확인한 계산이 아닙니다.`,first:'상대 수를 보드에 둔 뒤 내 차례에서 다시 계산하세요.',example:null};
 const next={...d,checked:true,pvSummary:best.pv.slice(0,4).join(' → '),example:best.san,first:`${best.san} 우선 검토. ${explain(best.san)}`,comparisonText:cmp.planSan?`원래 예시: ${cmp.planSan}`:'원래 계획에는 비교할 한 수가 정해져 있지 않습니다.'};
 if(result.depth<10||cmp.status==='incomplete')return {...pending,checked:false,verdict:'비교 미완료 · 확정 보류',because:'같은 국면·같은 탐색 깊이에서 원래 예시 수까지 충분히 비교하지 못했습니다.',first:`현재 후보는 ${best.san}입니다. 다시 계산하거나 더 깊은 분석으로 확인하세요.`,comparisonText:next.comparisonText};
 if(cmp.status==='no-plan')return {...next,selected:d.selected,verdict:`이번 수는 ${best.san} 우선`,because:'아래 장기 목표는 참고 계획입니다. 이번 수는 현재 국면에서 계산한 후보로 정했습니다.'};
 next.criteria='안내 기준: 평가 차이 0.30 이하는 근접, 0.31~0.79는 수 조정, 0.80 이상은 원래 수 보류입니다. 시간 제한 계산의 안내 기준이며 절대적 경계는 아닙니다.';
 const delta=cmp.lossCp===undefined?'':`후보와의 차이 약 ${(cmp.lossCp/100).toFixed(2)} (탐색 깊이 ${cmp.depth})`;
 next.comparisonText+=` · ${cmp.plan?scoreText(cmp.plan):''} / 우선 후보 ${cmp.bestSan} ${scoreText(cmp.best)}${delta?' · '+delta:''}`;
 if(cmp.category==='close')return {...next,selected:d.kind==='switch'?'switch':'continue',verdict:d.kind==='switch'?`새 갈래 계획 · ${best.san} 진행`:best.san===cmp.planSan?`목표 유지 · ${best.san} 진행`:`목표 유지 · 이번 수는 ${best.san} 우선`,because:cmp.mateReason||`원래 예시 ${cmp.planSan}도 근접한 후보입니다. 목표 유지가 그 수를 반드시 반복한다는 뜻은 아닙니다.`};
 return {...next,selected:d.kind==='switch'?'switch':'respond',verdict:cmp.category==='hold'?`원래 수는 보류 · ${best.san} 먼저`:`목표는 유지 · 수는 ${best.san}로 조정`,because:cmp.mateReason||`이 국면에서는 원래 예시 ${cmp.planSan}보다 ${best.san}의 계산 평가가 낫습니다. 이번 수를 바꿉니다. 장기 목표 전체가 틀렸다는 판정은 아닙니다.`};
}
