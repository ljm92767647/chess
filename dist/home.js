import {Chess} from './chess.js';
import {guides} from './catalog.js';
import {profile} from './purposes.js?v=20261020-thin1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selectedIndex=0;
export function mountHome(onSelect){
 const root=document.getElementById('main'),abort=new AbortController(),signal=abort.signal;
 document.title='오프닝 선택 · 오프닝 아틀라스';
 root.innerHTML=`<section class="opening-carousel" aria-roledescription="캐러셀" aria-label="오프닝 선택"><div class="carousel-header" aria-live="polite" aria-atomic="true"><p id="carousel-category"></p><h1 id="carousel-title"></h1></div><div class="carousel-stage"><button class="carousel-arrow prev-opening" aria-label="이전 오프닝">‹</button><div class="carousel-window"><a class="carousel-card" id="carousel-open" draggable="false"><div class="preview-frame"><div id="preview-board" class="board" role="img"></div></div></a></div><button class="carousel-arrow next-opening" aria-label="다음 오프닝">›</button></div><div class="carousel-footer"><p id="carousel-count"></p><a class="primary" id="carousel-learn">이 오프닝 배우기 →</a><p class="carousel-hint">화살표 · 휠 · 좌우 드래그로 선택</p></div></section>`;
 const stage=root.querySelector('.carousel-stage'),card=root.querySelector('.carousel-card');
 let wheel=0,wheelAt=0,gesture=null,suppressClick=false,suppressTimer=null,animation=null;
 function draw(delta=0){
  const g=guides[selectedIndex],c=new Chess(),side=profile(g).side;
  for(const san of g.line.replace(/\d+\.(\.\.)?/g,'').trim().split(/\s+/).filter(Boolean))c.move(san);
  const files=side==='b'?'hgfedcba':'abcdefgh',ranks=side==='b'?[1,2,3,4,5,6,7,8]:[8,7,6,5,4,3,2,1];
  root.querySelector('#carousel-title').innerHTML=`${esc(g.name)} <span class="opening-side">(${side==='w'?'백':'흑'})</span>`;
  root.querySelector('#carousel-category').textContent=g.category;
  const board=root.querySelector('#preview-board');board.setAttribute('aria-label',g.name+' 대표 수순의 마지막 배치');
  board.innerHTML=ranks.flatMap((r,ri)=>[...files].map((f,fi)=>{const p=c.get(f+r);return `<span class="sq ${(f.charCodeAt(0)-97+r)%2===1?'dark-square':''}">${p?`<img class="piece-img" src="./pieces/${p.color}${p.type.toUpperCase()}.svg" alt="" draggable="false">`:''}${fi===0?`<span class="coordinate">${r}</span>`:''}${ri===7?`<span class="coordinate file">${f}</span>`:''}</span>`})).join('');
  card.href='#opening/'+g.id;card.setAttribute('aria-label',g.name+' 학습하기');root.querySelector('#carousel-learn').href=card.getAttribute('href');
  root.querySelector('#carousel-count').textContent=`${selectedIndex+1} / ${guides.length} · 대표 배치`;
  card.style.transform='';animation?.cancel();if(delta&&!matchMedia('(prefers-reduced-motion: reduce)').matches)animation=card.animate([{transform:`translateX(${delta>0?40:-40}px)`,opacity:.35},{transform:'translateX(0)',opacity:1}],{duration:220,easing:'ease-out'});
  onSelect(g);
 }
 function move(delta){selectedIndex=(selectedIndex+delta+guides.length)%guides.length;draw(delta);}
 root.querySelector('.prev-opening').addEventListener('click',()=>move(-1),{signal});root.querySelector('.next-opening').addEventListener('click',()=>move(1),{signal});
 stage.addEventListener('wheel',e=>{if(e.ctrlKey||e.metaKey)return;e.preventDefault();const now=performance.now();if(now-wheelAt<380)return;const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;wheel+=d*(e.deltaMode===1?16:e.deltaMode===2?300:1);if(Math.abs(wheel)>45){move(wheel>0?1:-1);wheel=0;wheelAt=now;}},{passive:false,signal});
 stage.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,dragging:false};},{signal});
 stage.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;if(!gesture.dragging){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){gesture=null;return;}if(Math.abs(dx)<12)return;gesture.dragging=true;stage.setPointerCapture(e.pointerId);}card.style.transform=`translateX(${Math.max(-90,Math.min(90,dx*.5))}px)`;},{signal});
 stage.addEventListener('pointerup',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x,dragged=gesture.dragging;gesture=null;card.style.transform='';if(dragged){suppressClick=true;clearTimeout(suppressTimer);suppressTimer=setTimeout(()=>suppressClick=false,250);if(Math.abs(dx)>45)move(dx<0?1:-1);}},{signal});
 stage.addEventListener('pointercancel',()=>{gesture=null;card.style.transform='';},{signal});
 stage.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation();}},{capture:true,signal});stage.addEventListener('dragstart',e=>e.preventDefault(),{signal});
 document.addEventListener('keydown',e=>{if(document.body.classList.contains('menu-open')||document.querySelector('dialog[open]')||e.target.closest('input,select,textarea,summary'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}},{signal});
 draw();return ()=>{abort.abort();animation?.cancel();clearTimeout(suppressTimer);};
}
