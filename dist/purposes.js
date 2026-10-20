import {lessons} from './lessons.js';
export const purposes=[
 ['center','중앙 영향력','중앙 폰과 핵심 칸을 다뤄 말이 활동할 공간을 얻습니다.'],
 ['develop','말 전개','말을 싸움에 참여시키고 서로 협력하게 합니다.'],
 ['king','킹의 안전','중앙이 열려도 킹이 공격받지 않도록 준비합니다.'],
 ['structure','폰 구조','공간·약점·열린 파일과 폰 브레이크를 만듭니다.'],
 ['restrict','상대 제한','상대의 전개와 중앙 돌파를 방해합니다.']
];
export const directions=[
 ['activity','빠른 전개 → 중앙 개방','전개에서 앞설 때 중앙을 열어 활동성을 활용합니다.'],
 ['space','공간 확보 → 돌파','전진한 중앙을 지키고 말을 개선한 뒤 돌파합니다.'],
 ['counter','중앙 유도 → 반격','상대가 만든 큰 중앙을 폰 브레이크와 기물로 공격합니다.'],
 ['stable','안정 → 약점 압박','활동이 나쁜 말을 개선하고 약한 폰·칸을 압박합니다.'],
 ['imbalance','비대칭 → 반격','파일·대각선·폰 다수의 차이로 반격 기회를 얻습니다.']
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
export function mountPurpose(g){
 const p=profile(g),root=document.getElementById('purpose-banner');
 const shortLabels={center:'중앙영향',develop:'말 전개',king:'킹 안전',structure:'폰 구조',restrict:'상대 제한',activity:'빠른 전개 → 개방',space:'공간 확보 → 돌파',counter:'중앙 유도 → 반격',stable:'안정 → 약점 압박',imbalance:'비대칭 → 반격'};
 const chips=(items,selected,kind)=>items.map(([id,t])=>{const on=!!g&&selected.includes(id);return `<span class="purpose-chip ${on?'lit':''}" data-${kind}="${id}" aria-label="${esc(t)}${on?' · 중점':''}">${on?'<span class="focus-dot" aria-hidden="true">● </span>':''}<span class="chip-long">${esc(t)}</span><span class="chip-short" aria-hidden="true">${esc(shortLabels[id]||t)}</span></span>`}).join('');
 root.innerHTML=`<details class="purpose-box" ${expanded?'open':''}><summary><span class="purpose-heading"><strong>오프닝의 목적</strong></span><span class="purpose-chips" aria-label="공통 목적 · 강조 항목은 선택한 오프닝의 중점">${chips(purposes,p.focus,'focus')}</span><span class="path-label">방향</span><span class="purpose-paths">${chips(directions,p.paths,'path')}</span><span class="fold-mark" aria-hidden="true">＋</span></summary><div class="purpose-body"><p class="purpose-lead">말을 전개하고 킹을 지켜, 원하는 미들게임을 준비합니다.</p><p class="small muted">${g?'● 강조 항목은 선택한 진영의 중점입니다.':'오프닝을 선택하면 중점과 방향이 강조됩니다.'}</p><div class="purpose-grid">${purposes.map(([id,t,d])=>`<div class="purpose-item ${g&&p.focus.includes(id)?'emphasis':''}" data-purpose="${id}"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</div><h3>플레이 방향</h3><div class="direction-grid">${directions.map(([id,t,d])=>`<div class="direction-item ${g&&p.paths.includes(id)?'emphasis':''}"><b>${g&&p.paths.includes(id)?'✓ ':''}${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</div></div></details>`;
 root.querySelector('details').ontoggle=e=>{expanded=e.target.open};
}
