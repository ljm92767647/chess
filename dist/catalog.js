import {guides as allGuides} from './guides.js';

// The sources have different scales. This is an explicit catalogue cutoff,
// not a conversion of their ratings or an objective strength score.
export const ratingPolicy='평가가 있는 출처 중 하나라도 B 이상이면 유지합니다. 체스프릭 S/A/B, 히카루·고담 Legendary/Unbreakable/Legit가 유지 기준입니다. C 이하만 있거나 두 출처 모두 미평가이면 제외합니다.';
export function isIncluded(g){return ['S','A','B'].includes(g.cf)||['Legendary','Unbreakable','Legit'].includes(g.hk);}
export const guides=allGuides.filter(isIncluded);
export const removed=allGuides.filter(g=>!isIncluded(g));
