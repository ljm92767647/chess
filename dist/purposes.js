import {lessons} from './lessons.js';
export const purposes=[
 ['center','중앙 영향력','중앙 폰과 핵심 칸을 다뤄 말이 활동할 공간을 얻습니다.'],
 ['develop','효율적인 전개','말을 싸움에 참여시키고 서로 협력하게 합니다.'],
 ['king','킹의 안전','중앙이 열려도 킹이 공격받지 않도록 준비합니다.'],
 ['structure','활용 가능한 폰 구조','공간·약점·열린 파일과 폰 브레이크를 만듭니다.'],
 ['restrict','상대의 자유 제한','상대의 전개와 중앙 돌파를 방해합니다.']
];
export const directions=[
 ['activity','빠른 전개 → 중앙 개방','전개에서 앞설 때 중앙을 열어 활동성을 활용합니다.'],
 ['space','공간 확보 → 돌파','전진한 중앙을 지키고 말을 개선한 뒤 돌파합니다.'],
 ['counter','상대 중앙 유도 → 반격','상대가 만든 큰 중앙을 폰 브레이크와 기물로 공격합니다.'],
 ['stable','안정된 구조 → 약점 압박','활동이 나쁜 말을 개선하고 약한 폰·칸을 압박합니다.'],
 ['imbalance','비대칭 구조 → 서로 다른 곳에서 활동','파일·대각선·폰 다수의 차이로 반격 기회를 얻습니다.']
];
const groups={
 quiet:[['center','develop','king'],['stable','space']],scotch:[['center','develop','king'],['activity']],
 'french-chain':[['center','structure','restrict'],['counter','imbalance']],
 'french-ex':[['develop','king','structure'],['stable','activity']],
 'iqp-white':[['develop','center','structure'],['activity','imbalance']],
 'iqp-black':[['develop','center','structure'],['activity','imbalance']],
 qgd:[['center','structure','king'],['stable']],carlsbad:[['structure','restrict','center'],['stable','space']],
 'open-sicilian':[['center','develop','structure'],['imbalance','counter']],
 'sicilian-e6':[['center','structure','develop'],['imbalance','counter']],
 'sicilian-e5':[['center','restrict','develop'],['imbalance']],dragon:[['center','develop','king'],['imbalance','counter']],
 maroczy:[['restrict','structure','center'],['counter','stable']],
 caro:[['structure','center','develop'],['stable','counter']],
 'caro-adv':[['center','restrict','structure'],['space']],
 'caro-ex':[['develop','structure','king'],['stable','activity']],
 scandi:[['center','develop','structure'],['stable']],hyper:[['center','structure','develop'],['counter','imbalance']],
 london:[['structure','develop','king'],['stable','space']],stonewall:[['center','restrict','structure'],['space']],
 slav:[['center','structure','develop'],['stable']],semi:[['center','structure','develop'],['imbalance']],
 nimzo:[['restrict','structure','develop'],['imbalance','stable']],fianchetto:[['center','develop','restrict'],['counter','stable']],
 kid:[['center','structure','king'],['counter','imbalance']],grunfeld:[['center','develop','structure'],['counter']],
 dutch:[['center','structure','king'],['imbalance','space']],
 'gambit-white':[['develop','center','king'],['activity','imbalance']],
 'gambit-black':[['develop','center','king'],['activity','imbalance']]
};
const specific={
 vienna:[['center','develop','king'],['space','activity']],
 'vienna-gambit':[['center','develop','king'],['activity','imbalance']],
 italian:[['center','develop','king'],['stable','space']],
 ruy:[['restrict','center','develop'],['space','stable']],
 'open-game':[['center','develop','king'],['activity','stable']],
 'french-advance':[['center','restrict','structure'],['space']],
 'french-tarrasch':[['center','develop','structure'],['space','activity']],
 'french-exchange':[['develop','king','structure'],['stable','activity']],
 'sicilian-accelerated':[['center','restrict','develop'],['counter','stable']],
 'grand-prix':[['center','develop','king'],['space','activity']],
 'closed-sicilian':[['center','structure','king'],['space','imbalance']],
 moscow:[['develop','center','king'],['stable']],rossolimo:[['structure','restrict','develop'],['stable','imbalance']],
 alapin:[['center','structure','develop'],['space','activity']],
 reti:[['center','restrict','develop'],['counter','stable']],
 larsen:[['center','develop','restrict'],['counter','imbalance']],
 kia:[['center','king','develop'],['space']],
 trompowsky:[['restrict','structure','develop'],['imbalance']],
 'fried-liver':[['develop','king','center'],['activity']],marshall:[['develop','center','king'],['activity','imbalance']]
};
export function profile(g){const l=lessons[g?.id];const [focus,paths]=specific[g?.id]||groups[l?.base]||[['center','develop','king'],['stable']];return {focus,paths,summary:l?.summary||'',side:g?.category?.startsWith('흑')?'b':'w'};}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let expanded=false;
export function mountPurpose(g){const p=profile(g),root=document.getElementById('purpose-banner');root.innerHTML=`<details class="purpose-box" ${expanded?'open':''}><summary><span><small>OPENING → PLAN</small><strong>오프닝의 목적</strong></span><span class="purpose-current">${g?esc(g.name)+' · '+p.paths.map(id=>directions.find(x=>x[0]===id)[1].split(' → ')[0]).join(' / '):'공통 원칙과 다섯 가지 방향'}</span><span class="fold-mark" aria-hidden="true">＋</span></summary><div class="purpose-body"><p class="purpose-lead">말을 효과적으로 배치하고 킹을 안전하게 만들어, 싸울 준비가 된 미들게임에 들어갑니다.</p><p class="small muted">모든 오프닝이 공유하는 목적입니다. ${g?'색상과 ‘중점’ 표시는 선택한 진영에서 특히 강조하는 목적입니다.':'오프닝을 선택하면 중점을 색으로 표시합니다.'}</p><div class="purpose-grid">${purposes.map(([id,t,d])=>`<div class="purpose-item ${g&&p.focus.includes(id)?'emphasis':''}" data-purpose="${id}"><b>${esc(t)}</b>${g&&p.focus.includes(id)?'<span class="focus-label">중점</span>':''}<p>${esc(d)}</p></div>`).join('')}</div><h3>선택하는 방향 ${g?`<small>· ${p.side==='b'?'흑':'백'}의 대표 계획</small>`:''}</h3><div class="direction-grid">${directions.map(([id,t,d])=>`<div class="direction-item ${g&&p.paths.includes(id)?'emphasis':''}"><b>${g&&p.paths.includes(id)?'✓ ':''}${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</div><p class="small muted">대표 수순의 성향입니다. 중앙 교환·상대 대응에 따라 방향을 바꿉니다.</p></div></details>`;root.querySelector('details').ontoggle=e=>{expanded=e.target.open};}
