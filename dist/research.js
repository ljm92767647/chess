import {Chess} from './chess.js';

// The cursor moves independently of the saved line; a new move replaces only its future.
export class ResearchLine {
  constructor(fen) { this.start=fen; this.moves=[]; this.cursor=0; }
  game(at=this.cursor) { const c=new Chess(this.start); for(const san of this.moves.slice(0,at))c.move(san); return c; }
  seek(at) { this.cursor=Math.max(0,Math.min(this.moves.length,at)); return this.game(); }
  append(san) { const c=this.game(),m=c.move(san); this.moves=this.moves.slice(0,this.cursor); this.moves.push(m.san); this.cursor++; return c; }
  variation(pv,at=1) { const base=this.cursor,c=this.game(),valid=[]; for(const san of pv)valid.push(c.move(san).san); this.moves=[...this.moves.slice(0,base),...valid]; return this.seek(base+at); }
  snapshot() { return {start:this.start,moves:[...this.moves],cursor:this.cursor}; }
  restore(s) { this.start=s.start; this.moves=[...s.moves]; return this.seek(s.cursor); }
}
