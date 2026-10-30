/* Jedi Jim Vol 2 - original orchestral-style WebAudio score + SFX (all synthesized, no samples) */
(function(){
const A={ctx:null,master:null,mus:null,sfx:null,rev:null,muted:false,cur:null,timer:null,hum:null};
const mf=m=>440*Math.pow(2,(m-69)/12);
const NN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nm(s){if(typeof s==='number')return s;const m=s.match(/^([A-G])([#b]?)(-?\d)$/);if(!m)return 60;return 12*(+m[3]+1)+NN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)}
function impulse(ctx,sec,decay){const r=ctx.sampleRate,n=r*sec,b=ctx.createBuffer(2,n,r);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay)}return b}
A.init=function(){if(this.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;const c=this.ctx=new C();
 this.master=c.createGain();this.master.gain.value=this.muted?0:0.9;
 const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.attack.value=0.005;comp.release.value=0.2;
 this.master.connect(comp);comp.connect(c.destination);
 this.rev=c.createConvolver();this.rev.buffer=impulse(c,2.6,2.4);const rg=c.createGain();rg.gain.value=0.32;this.rev.connect(rg);rg.connect(this.master);
 this.mus=c.createGain();this.mus.gain.value=0.5;this.mus.connect(this.master);
 this.musRev=c.createGain();this.musRev.gain.value=0.55;this.mus.connect(this.musRev);this.musRev.connect(this.rev);
 this.sfx=c.createGain();this.sfx.gain.value=0.85;this.sfx.connect(this.master);
 const sr=c.createGain();sr.gain.value=0.18;this.sfx.connect(sr);sr.connect(this.rev);
 this.nbuf=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=this.nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
}catch(e){this.ctx=null}};
A.unlock=function(){this.init();if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})};
A.setMute=function(m){this.muted=m;if(this.master)this.master.gain.setTargetAtTime(m?0:0.9,this.ctx.currentTime,0.02)};
function env(g,t,a,peak,dur,rel){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak,t+Math.max(a,dur));g.gain.exponentialRampToValueAtTime(0.0001,t+Math.max(a,dur)+rel)}
function osc(type,f,t,stop,det){const o=A.ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(det)o.detune.value=det;o.start(t);o.stop(stop);return o}
function noiseSrc(t,dur){const s=A.ctx.createBufferSource();s.buffer=A.nbuf;s.loop=true;s.start(t,Math.random()*1.5);s.stop(t+dur);return s}
/* ---------- instruments ---------- */
const INST={
 strings(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(5200,f*5+700);lp.Q.value=0.4;
  const st=t+d+0.6;[-9,0,8].forEach(dt=>{const o=osc('sawtooth',f,t,st,dt);const vib=c.createOscillator(),vg=c.createGain();vib.frequency.value=5.2;vg.gain.value=f*0.004;vib.connect(vg);vg.connect(o.frequency);vib.start(t);vib.stop(st);o.connect(lp)});
  lp.connect(g);g.connect(out);env(g,t,Math.min(0.16,d*0.4),v*0.07,d,0.45)},
 pad(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(2600,f*3+300);
  const st=t+d+1.2;[-12,-4,5,12].forEach(dt=>{osc('sawtooth',f,t,st,dt).connect(lp)});lp.connect(g);g.connect(out);env(g,t,0.5,v*0.035,d,0.9)},
 brass(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.Q.value=1.2;
  lp.frequency.setValueAtTime(f*1.2,t);lp.frequency.linearRampToValueAtTime(Math.min(6000,f*7),t+0.06);lp.frequency.exponentialRampToValueAtTime(Math.min(3500,f*3.5),t+0.3);
  const st=t+d+0.4;osc('sawtooth',f,t,st,-6).connect(lp);osc('sawtooth',f,t,st,7).connect(lp);const sq=osc('square',f/2,t,st);const sg=c.createGain();sg.gain.value=0.3;sq.connect(sg);sg.connect(lp);
  lp.connect(g);g.connect(out);env(g,t,0.035,v*0.085,d,0.22)},
 horn(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.min(1800,f*2.6);lp.Q.value=0.7;
  const st=t+d+0.5;osc('sawtooth',f,t,st,-4).connect(lp);osc('triangle',f,t,st,4).connect(lp);lp.connect(g);g.connect(out);env(g,t,0.09,v*0.11,d,0.35)},
 choir(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),st=t+d+1;const src=c.createGain();[-7,0,6].forEach(dt=>osc('sawtooth',f,t,st,dt).connect(src));
  [[700,6,1],[1150,7,0.7],[2600,9,0.25]].forEach(([fr,q,a])=>{const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=q;const ag=c.createGain();ag.gain.value=a;src.connect(bp);bp.connect(ag);ag.connect(g)});
  g.connect(out);env(g,t,0.35,v*0.16,d,0.7)},
 bass(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(260,t+0.25);
  const st=t+d+0.3;osc('sawtooth',f,t,st).connect(lp);osc('sine',f/2,t,st).connect(g);lp.connect(g);g.connect(out);env(g,t,0.01,v*0.13,d*0.8,0.12)},
 pizz(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(f*8,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+0.18);
  osc('sawtooth',f,t,t+0.5).connect(lp);lp.connect(g);g.connect(out);env(g,t,0.004,v*0.09,0.02,0.22)},
 bell(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain();[[1,1],[2.76,0.4],[5.4,0.2]].forEach(([m,a])=>{const o=osc('sine',f*m,t,t+2.2),og=c.createGain();og.gain.value=a;o.connect(og);og.connect(g)});g.connect(out);env(g,t,0.003,v*0.07,0.01,1.6)},
 timp(n,t,d,v,out){const c=A.ctx,f=mf(n),g=c.createGain(),o=osc('sine',f*1.5,t,t+1.4);o.frequency.exponentialRampToValueAtTime(f,t+0.08);o.connect(g);
  const ns=noiseSrc(t,0.25),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=300;const ng=c.createGain();ns.connect(lp);lp.connect(ng);ng.connect(out);env(ng,t,0.002,v*0.25,0.01,0.2);
  g.connect(out);env(g,t,0.003,v*0.5,0.02,0.9)},
 snare(n,t,d,v,out){const c=A.ctx,ns=noiseSrc(t,0.3),hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=1400;const g=c.createGain();ns.connect(hp);hp.connect(g);g.connect(out);env(g,t,0.002,v*0.22,0.01,0.14);
  const o=osc('triangle',190,t,t+0.15),og=c.createGain();o.connect(og);og.connect(out);env(og,t,0.002,v*0.12,0.01,0.08)},
 cym(n,t,d,v,out){const c=A.ctx,ns=noiseSrc(t,2),hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=6500;const g=c.createGain();ns.connect(hp);hp.connect(g);g.connect(out);env(g,t,0.005,v*0.12,0.02,1.6)},
 boom(n,t,d,v,out){const c=A.ctx,o=osc('sine',90,t,t+1.2),g=c.createGain();o.frequency.exponentialRampToValueAtTime(32,t+0.9);o.connect(g);g.connect(out);env(g,t,0.004,v*0.6,0.05,1)}
};
/* ---------- score ----------
 Each track: bpm, steps per bar (16 = 4/4 in 16ths, 12 = 6/8 in 8th-triplets feel), bars, chords per bar (roots+triad), and parts.
 Melodies are written as "note:steps" tokens; "-" rests. All melodies are original compositions for this game. */
function seq(str){const out=[];let pos=0;str.trim().split(/\s+/).forEach(tok=>{const [n,l]=tok.split(':');const len=+(l||2);if(n!=='-')out.push([pos,nm(n),len]);pos+=len});return out}
function drum(str){const o=[];[...str.replace(/\s/g,'')].forEach((ch,i)=>{if(ch!=='.')o.push([i,ch])});return o}
const T={
 title:{bpm:84,spb:16,bars:8,
  chords:[['D3','A3','D4','F#4'],['B2','F#3','B3','D4'],['G2','D3','G3','B3'],['A2','E3','A3','C#4'],['D3','A3','D4','F#4'],['G2','D3','B3','G4'],['E3','B3','E4','G4'],['A2','E3','A3','C#4']],
  mel:seq('A3:2 D4:2 E4:2 F#4:2 A4:6 G4:1 F#4:1 E4:4 F#4:2 D4:2 B3:8 G3:2 B3:2 D4:2 G4:2 F#4:6 E4:2 E4:4 C#4:4 A3:8 A3:2 D4:2 E4:2 F#4:2 A4:6 B4:2 D5:8 B4:4 G4:4 B4:4 A4:2 G4:2 F#4:4 E4:4 G4:4 F#4:4 E4:8'),
  mi:'brass',low:'horn',perc:{t:'x...............x.......x.......',c:'x...............................................................................................................................'},pad:'strings'},
 hangar:{bpm:126,spb:16,bars:8,
  chords:[['D3','A3','D4','F4'],['D3','A3','D4','F4'],['Bb2','F3','Bb3','D4'],['C3','G3','C4','E4'],['D3','A3','D4','F4'],['G2','D3','G3','Bb3'],['Bb2','F3','Bb3','D4'],['A2','E3','A3','C#4']],
  ost:seq('D4:1 D4:1 F4:1 D4:1 E4:1 D4:1 C4:1 D4:1 D4:1 D4:1 A4:1 D4:1 G4:1 D4:1 F4:1 E4:1'),
  mel:seq('-:16 -:16 D5:3 C5:1 A4:4 Bb4:4 G4:4 A4:12 -:4 D5:3 F5:1 E5:4 C5:4 D5:4 Bb4:6 A4:2 G4:4 E4:4 A4:16'),
  mi:'horn',perc:{s:'x...x..xx...x...',t:'x.......x.......',b:'x..x..x...x.x...'}},
 chase:{bpm:152,spb:12,bars:8,
  chords:[['E3','B3','E4','G4'],['C3','G3','C4','E4'],['D3','A3','D4','F#4'],['B2','F#3','B3','D#4'],['E3','B3','E4','G4'],['A2','E3','A3','C4'],['C3','G3','C4','E4'],['B2','F#3','B3','D#4']],
  gallop:true,
  mel:seq('E4:3 B4:6 A4:1 G4:1 F#4:1 E4:3 G4:3 B4:3 E5:3 D5:6 C5:3 B4:3 A4:6 G4:3 F#4:3 B4:12 E4:3 B4:6 C5:3 D5:6 E5:3 G5:3 F#5:6 E5:3 D5:3'),
  mi:'brass',perc:{t:'x.....x.....',s:'...x.....x.x',b:'x..x..x..x..'}},
 reactor:{bpm:104,spb:16,bars:8,
  chords:[['C3','G3','C4','Eb4'],['Ab2','Eb3','Ab3','C4'],['F2','C3','F3','Ab3'],['G2','D3','G3','B3'],['C3','G3','C4','Eb4'],['Db3','Ab3','Db4','F4'],['F2','C3','F3','Ab3'],['G2','D3','G3','B3']],
  ost:seq('C4:2 G4:2 Eb4:2 G4:2 C4:2 G4:2 Eb4:2 D4:2'),
  mel:seq('G4:8 Ab4:4 G4:4 F4:8 Eb4:8 D4:16 -:16 G4:8 C5:8 Bb4:4 Ab4:4 G4:8 F4:8 D4:4 B3:4 G3:16'),
  mi:'choir',perc:{t:'x.......x...x...',b:'x.......x.......'}},
 boss:{bpm:144,spb:16,bars:8,
  chords:[['A2','E3','A3','C4'],['A2','E3','A3','C4'],['F2','C3','F3','A3'],['G2','D3','G3','B3'],['A2','E3','A3','C4'],['D3','A3','D4','F4'],['E3','B3','E4','G#4'],['E3','B3','E4','G#4']],
  ost:seq('A4:1 A4:1 C5:1 A4:1 E5:1 A4:1 C5:1 A4:1 A4:1 A4:1 D5:1 A4:1 E5:1 A4:1 F5:1 E5:1'),
  mel:seq('A4:4 C5:4 E5:6 D5:2 C5:4 B4:4 A4:8 F4:4 A4:4 C5:4 F5:4 G5:6 F5:2 E5:8 A5:6 G5:2 E5:4 C5:4 D5:4 F5:4 A5:8 G#5:8 E5:8 B4:8 G#4:8'),
  mi:'brass',choir:true,perc:{t:'x...x...x...x.x.',s:'....x.......x..x',b:'x.x...x.x.x...x.'}},
 vexis:{bpm:116,spb:16,bars:8,
  chords:[['C3','G3','C4','Eb4'],['C3','Ab3','C4','Eb4'],['C3','G3','Bb3','Eb4'],['B2','F3','G3','D4'],['Ab2','Eb3','Ab3','C4'],['F2','C3','F3','Ab3'],['G2','D3','G3','B3'],['G2','D3','G3','B3']],
  ost:seq('C3:2 C3:1 C3:1 Eb3:2 C3:2 G3:2 C3:2 F#3:2 G3:2'),
  mel:seq('C5:6 B4:2 C5:4 Eb5:4 G5:8 F5:4 Eb5:4 D5:4 Eb5:4 C5:8 B4:16 Ab4:6 G4:2 Ab4:4 C5:4 F5:8 Eb5:4 D5:4 B4:8 D5:8 G4:16'),
  mi:'choir',brassStab:true,perc:{t:'x.....x.x.......',s:'....x.......x...',b:'x.....x.x...x...'}},
 victory:{bpm:96,spb:16,bars:4,once:true,
  chords:[['D3','A3','D4','F#4'],['G2','D3','B3','G4'],['A2','E3','C#4','A4'],['D3','A3','F#4','D5']],
  mel:seq('A4:2 D5:2 E5:2 F#5:2 A5:8 B5:2 A5:2 G5:2 F#5:2 G5:4 B5:4 A5:4 E5:2 F#5:2 G5:4 A5:12 D6:8'),
  mi:'brass',perc:{t:'x.......x...x.x.',c:'x...............'}},
 gameover:{bpm:70,spb:16,bars:2,once:true,chords:[['D3','A3','D4','F4'],['Bb2','F3','Bb3','D4']],mel:seq('A4:4 F4:4 E4:4 D4:4 C#4:8 D4:8'),mi:'horn',perc:{t:'x...............'}}
};
A.tracks=T;
A.play=function(key){if(!this.ctx)return;if(this.cur===key)return;this.stopMusic();const tr=T[key];if(!tr)return;this.cur=key;
 const c=this.ctx,step=60/tr.bpm/(tr.spb===12?3:4);let s=0,next=c.currentTime+0.12;const total=tr.bars*tr.spb;
 const bus=c.createGain();bus.gain.value=1;bus.connect(this.mus);this.bus=bus;
 const melBy={};(tr.mel||[]).forEach(m=>{(melBy[m[0]]=melBy[m[0]]||[]).push(m)});const ostBy={},ol=tr.ost?tr.ost.reduce((a,m)=>Math.max(a,m[0]+m[2]),0):0;(tr.ost||[]).forEach(m=>{(ostBy[m[0]]=ostBy[m[0]]||[]).push(m)});
 const P=tr.perc||{};const pp={};for(const k in P)pp[k]=[...P[k]];
 const tick=()=>{const ahead=c.currentTime+0.25;while(next<ahead){const bar=Math.floor(s/tr.spb)%tr.bars,st=s%tr.spb,abs=s%total,ch=tr.chords[bar],v=1;
   if(st===0){ (tr.pad?INST[tr.pad]:INST.strings) && ch.forEach((n,i)=>INST[i===0?'horn':(tr.pad||'strings')](nm(n)+(i===0?0:12),next,step*tr.spb*0.98,i===0?0.6:0.75,bus));INST.bass(nm(ch[0])-12,next,step*4,0.9,bus);
     if(tr.choir||tr.mi==='choir')ch.slice(1).forEach(n=>INST.choir(nm(n)+12,next,step*tr.spb,0.35,bus)) }
   if(tr.spb===16&&st===8)INST.bass(nm(ch[0])-12,next,step*4,0.7,bus);
   if(tr.gallop){const r=nm(ch[0])+12;if(st%3===0)INST.pizz(r+(st%6===3?7:0),next,step,0.9,bus);if(st%3===1||st%3===2)INST.pizz(r+12,next,step,0.5,bus);if(st%6===0)INST.bass(nm(ch[0])-12,next,step*2,0.8,bus)}
   if(ol){const k=s%ol;(ostBy[k]||[]).forEach(m=>INST[tr.mi==='choir'?'strings':'pizz'](m[1]-(tr.mi==='choir'?0:12)+(bar%4===2?-2:0)*0,next,m[2]*step,0.65,bus))}
   (melBy[abs]||[]).forEach(m=>{INST[tr.mi](m[1],next,m[2]*step*0.95,1,bus);if(tr.mi==='brass')INST.horn(m[1]-12,next,m[2]*step*0.95,0.5,bus);if(tr.mi==='choir')INST.strings(m[1],next,m[2]*step,0.8,bus)});
   if(tr.brassStab&&(st===0||st===6||st===8))INST.brass(nm(ch[0])+12,next,step*1.5,0.8,bus);
   for(const k in pp){const pat=pp[k];const ch2=pat[(k==='c'?abs:st)%pat.length];if(ch2==='x'){if(k==='t')INST.timp(nm(ch[0])-12+(st>=8?7:0)*0,next,0,0.9,bus);if(k==='s')INST.snare(0,next,0,0.7,bus);if(k==='c')INST.cym(0,next,0,0.8,bus);if(k==='b')INST.timp(nm(ch[0])-24,next,0,0.6,bus)}}
   next+=step;s++;if(tr.once&&s>=total){this.timer&&clearInterval(this.timer);this.timer=null;break}}};
 tick();this.timer=setInterval(tick,40)};
A.stopMusic=function(){this.cur=null;if(this.timer){clearInterval(this.timer);this.timer=null}if(this.bus){const b=this.bus;try{b.gain.setTargetAtTime(0,this.ctx.currentTime,0.15)}catch(e){}setTimeout(()=>{try{b.disconnect()}catch(e){}},900);this.bus=null}};
A.duck=function(v){if(this.mus)this.mus.gain.setTargetAtTime(v,this.ctx.currentTime,0.1)};
/* ---------- SFX ---------- */
function tn(type,f0,f1,dur,vol,t,out,q){const c=A.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);o.connect(g);g.connect(out||A.sfx);env(g,t,0.003,vol,dur*0.2,dur*0.8);o.start(t);o.stop(t+dur+0.05);return o}
function nz(dur,vol,t,type,f0,f1,q,out){const c=A.ctx,s=noiseSrc(t,dur+0.05),f=c.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(f0||1000,t);if(f1)f.frequency.exponentialRampToValueAtTime(f1,t+dur);f.Q.value=q||1;const g=c.createGain();s.connect(f);f.connect(g);g.connect(out||A.sfx);env(g,t,0.004,vol,dur*0.15,dur*0.85)}
const FX={
 blaster(){const t=A.ctx.currentTime;tn('sawtooth',1800,140,0.22,0.16,t);tn('sine',2600,300,0.16,0.12,t);tn('square',900,90,0.12,0.05,t);},
 blasterFar(){const t=A.ctx.currentTime;tn('sawtooth',1500,160,0.18,0.07,t);tn('sine',2200,300,0.14,0.05,t)},
 heavy(){const t=A.ctx.currentTime;tn('sawtooth',900,60,0.28,0.2,t);nz(0.18,0.15,t,'lowpass',2000,200)},
 ignite(){const t=A.ctx.currentTime;tn('sawtooth',60,180,0.5,0.15,t);tn('sawtooth',62,190,0.5,0.12,t);nz(0.45,0.12,t,'bandpass',300,2400,2)},
 swing(){const t=A.ctx.currentTime,p=0.9+Math.random()*0.25;tn('sawtooth',150*p,95*p,0.28,0.13,t);tn('sawtooth',155*p,98*p,0.28,0.1,t);nz(0.26,0.18,t,'bandpass',700*p,2600*p,3)},
 clash(){const t=A.ctx.currentTime;[1630,2470,3310,4120].forEach((f,i)=>tn('sine',f,f*0.97,0.45,0.07-i*0.01,t));nz(0.25,0.28,t,'highpass',2500,null,0.7);tn('sawtooth',200,80,0.2,0.12,t)},
 deflect(){const t=A.ctx.currentTime;tn('sine',3200,1200,0.18,0.14,t);tn('sawtooth',1600,200,0.2,0.1,t+0.01);nz(0.12,0.2,t,'highpass',3000)},
 hit(){const t=A.ctx.currentTime;nz(0.2,0.3,t,'lowpass',2400,300);tn('square',240,60,0.15,0.1,t)},
 armor(){const t=A.ctx.currentTime;nz(0.12,0.28,t,'bandpass',1800,600,2);tn('triangle',520,180,0.14,0.12,t)},
 force(){const t=A.ctx.currentTime;nz(0.7,0.4,t,'lowpass',300,4000,0.8);tn('sine',120,40,0.7,0.4,t);tn('sawtooth',60,30,0.6,0.08,t)},
 explode(){const t=A.ctx.currentTime;nz(1.1,0.5,t,'lowpass',2500,90,0.7);tn('sine',110,28,0.9,0.55,t);},
 bigboom(){const t=A.ctx.currentTime;nz(2.2,0.6,t,'lowpass',3000,60,0.7);tn('sine',80,22,1.8,0.7,t);nz(1.2,0.2,t+0.2,'lowpass',1200,100)},
 jump(){const t=A.ctx.currentTime;nz(0.18,0.1,t,'bandpass',500,1500,2);tn('sine',260,420,0.12,0.05,t)},
 djump(){const t=A.ctx.currentTime;nz(0.35,0.14,t,'bandpass',300,3000,2);tn('sine',300,900,0.25,0.07,t)},
 land(){const t=A.ctx.currentTime;nz(0.1,0.12,t,'lowpass',600,150)},
 hurt(){const t=A.ctx.currentTime;tn('square',330,110,0.3,0.14,t);nz(0.2,0.2,t,'lowpass',1500,200)},
 pickup(){const t=A.ctx.currentTime;[0,4,7,12].forEach((s,i)=>tn('sine',mf(76+s),0,0.25,0.09,t+i*0.05))},
 heal(){const t=A.ctx.currentTime;[0,7,12,16,19].forEach((s,i)=>tn('triangle',mf(72+s),0,0.35,0.08,t+i*0.06))},
 shard(){const t=A.ctx.currentTime;[0,5,9,12,17,21].forEach((s,i)=>INST.bell(84+s-12,t+i*0.06,0,1.4,A.sfx))},
 tie(){const t=A.ctx.currentTime;const c=A.ctx,o=c.createOscillator(),g=c.createGain(),lf=c.createOscillator(),lg=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(700,t);o.frequency.linearRampToValueAtTime(1100,t+0.6);o.frequency.linearRampToValueAtTime(500,t+1.4);lf.frequency.value=34;lg.gain.value=60;lf.connect(lg);lg.connect(o.frequency);
  const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1400;bp.Q.value=2;o.connect(bp);bp.connect(g);g.connect(A.sfx);env(g,t,0.5,0.12,0.5,0.5);o.start(t);lf.start(t);o.stop(t+1.6);lf.stop(t+1.6);nz(1.4,0.16,t,'bandpass',900,2400,4)},
 stomp(){const t=A.ctx.currentTime;tn('sine',70,30,0.5,0.6,t);nz(0.4,0.3,t,'lowpass',500,60);nz(0.2,0.15,t,'bandpass',2200,800,3)},
 lightning(){const t=A.ctx.currentTime;for(let i=0;i<6;i++)nz(0.06,0.18,t+i*0.05+Math.random()*0.02,'highpass',2000+Math.random()*3000);tn('sawtooth',90,60,0.35,0.07,t)},
 door(){const t=A.ctx.currentTime;nz(0.9,0.45,t,'lowpass',900,60);tn('sawtooth',55,30,0.9,0.2,t);[1200,1900].forEach(f=>tn('sine',f,f*0.8,0.6,0.04,t))},
 alarm(){const t=A.ctx.currentTime;for(let i=0;i<3;i++){tn('square',660,0,0.18,0.05,t+i*0.36);tn('square',520,0,0.18,0.05,t+i*0.36+0.18)}},
 beacon(){const t=A.ctx.currentTime;[0,7,12].forEach((s,i)=>tn('sine',mf(79+s),0,0.4,0.06,t+i*0.08))},
 detonate(){const t=A.ctx.currentTime;tn('square',1400,0,0.05,0.05,t)},
 throw(){const t=A.ctx.currentTime;nz(0.18,0.1,t,'bandpass',800,300,2)},
 laugh(){const t=A.ctx.currentTime;[0,0.22,0.44].forEach(d=>{tn('sawtooth',130,95,0.18,0.12,t+d);nz(0.16,0.06,t+d,'bandpass',600,400,3)})},
 bucket(){const t=A.ctx.currentTime;tn('square',260,0,0.08,0.06,t);tn('square',390,0,0.08,0.06,t+0.09)},
 clear(){const t=A.ctx.currentTime;[0,4,7,12,16].forEach((s,i)=>INST.brass(62+s,t+i*0.09,0.4,1,A.sfx))},
 menu(){const t=A.ctx.currentTime;tn('sine',880,1320,0.08,0.06,t)},
 lock(){const t=A.ctx.currentTime;[1630,2470].forEach(f=>tn('sine',f,f,0.12,0.05,t));nz(0.08,0.12,t,'highpass',3000)}
};
A.fx=function(n){if(!this.ctx||this.muted)return;try{FX[n]&&FX[n]()}catch(e){}};
/* continuous saber hum: intensity 0..1 + swing doppler */
A.humStart=function(){if(!this.ctx||this.hum)return;const c=this.ctx,g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;g.gain.value=0;
 const o1=c.createOscillator(),o2=c.createOscillator();o1.type='sawtooth';o2.type='sawtooth';o1.frequency.value=90;o2.frequency.value=91.6;o1.connect(lp);o2.connect(lp);lp.connect(g);g.connect(this.sfx);o1.start();o2.start();this.hum={g,o1,o2,lp}};
A.humSet=function(on,swing){if(!this.hum)return;const t=this.ctx.currentTime,h=this.hum;h.g.gain.setTargetAtTime(on?(0.035+swing*0.06):0,t,0.05);const f=90+swing*40;h.o1.frequency.setTargetAtTime(f,t,0.04);h.o2.frequency.setTargetAtTime(f*1.018,t,0.04);h.lp.frequency.setTargetAtTime(420+swing*900,t,0.05)};
window.JAudio=A;
})();

'use strict';
/* ===== Jedi Jim's Rebel Mission: Volume 2 - core ===== */
const $=id=>document.getElementById(id);
const cv=$('cv'),c=cv.getContext('2d');
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),sgn=v=>v<0?-1:1;
const VH=540,GROUND=460,GRAV=2300;
const QS=new URLSearchParams(location.search);
const AU=window.JAudio;
const SAVE_KEY='jjrm2_save';let save={};try{save=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(e){save={}}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch(e){}}
AU.muted=!!save.muted;
let W=0,H=0,DPR=1,S=1,VV=540,viewW=800,gameTop=0,gameH=540,portrait=false;
function resize(){W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);portrait=H>W*1.1;
 if(portrait){const vw=clamp(W*1.06,400,480);S=W/vw;gameTop=0;gameH=Math.round(H*0.64);VV=gameH/S}
 else{VV=540;S=H/VV;gameTop=0;gameH=H}
 viewW=W/S;layoutPad()}
function layoutPad(){const pad=$('pad'),bs=$('bSaber'),bf=$('bForce'),bj=$('bJump'),hint=$('swipeHint');if(!pad)return;
 if(portrait){const top=gameH,ph=H-top;pad.style.top=top+'px';pad.style.height=ph+'px';
  const big=Math.round(clamp(ph*0.42,96,126)),sm=Math.round(big*0.78);
  bs.style.width=bs.style.height=big+'px';bs.style.right='16px';bs.style.bottom=Math.round(clamp(ph*0.12,16,40))+'px';
  bj.style.width=bj.style.height=sm+'px';bj.style.right=(16+big*0.18)+'px';bj.style.bottom=(parseInt(bs.style.bottom)+big+12)+'px';
  bf.style.width=bf.style.height=sm+'px';bf.style.right=(16+big+14)+'px';bf.style.bottom=(parseInt(bs.style.bottom)+big*0.35)+'px';
  if(parseInt(bj.style.bottom)+sm>ph-6){bj.style.bottom=(ph-sm-6)+'px'}
  hint.style.display='';hint.style.top='10px';hint.style.left='12px';hint.style.right=(16+big+sm+30)+'px'}
 else{pad.style.top='0';pad.style.height=H+'px';const big=Math.round(clamp(H*0.22,74,96)),sm=Math.round(big*0.76);
  bs.style.width=bs.style.height=big+'px';bs.style.right='14px';bs.style.bottom='14px';
  bj.style.width=bj.style.height=sm+'px';bj.style.right=(14+big*0.12)+'px';bj.style.bottom=(14+big+10)+'px';
  bf.style.width=bf.style.height=sm+'px';bf.style.right=(14+big+12)+'px';bf.style.bottom='18px';
  hint.style.display='none'}}
addEventListener('resize',()=>{resize()});
/* ---------- input ---------- */
const K={L:0,R:0,U:0,D:0,J:0,S:0,F:0};const VIRT={jump:0,saber:0,force:0},VIRTP={jump:0,saber:0,force:0},KP={J:0,S:0,F:0};let kbNav=0;const TOUCH=new Map();let swipeJump=0;
const inp={L:0,R:0,U:0,D:0,sx:0,sy:0,jumpP:0,jump:0,saberP:0,saber:0,saberR:0,forceP:0,force:0};let lastJ=0,lastS=0,lastF=0;let mashCount=0;
const KEYMAP={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowUp:'U',KeyW:'U',ArrowDown:'D',KeyS:'D',Space:'J',KeyJ:'S',KeyZ:'S',KeyX:'S',KeyK:'F',KeyC:'F',KeyL:'F'};
addEventListener('keydown',e=>{AU.unlock();const k=KEYMAP[e.code];if(k){if(k==='S'&&!K.S)mashCount++;if(!K[k]&&k in KP)KP[k]=1;K[k]=1;e.preventDefault()}
 if(e.code==='KeyP'||e.code==='Escape'){if(state==='play')pauseGame();else if(state==='pause')resumeGame()}
 if(e.code==='KeyM')toggleMute();if((e.code==='Enter'||e.code==='Space')&&state==='crawl'){endCrawl();return}
 if(document.body.classList.contains('uiopen')&&!e.repeat){const nav={ArrowDown:1,ArrowRight:1,KeyS:1,KeyD:1,ArrowUp:-1,ArrowLeft:-1,KeyW:-1,KeyA:-1}[e.code];
  if(nav){kbNav=1;gpFocus(gpIdx+(document.querySelector('#ui .gpf')?nav:0),true);AU.fx('menu');e.preventDefault()}
  else if(e.code==='Enter'||e.code==='Space'){e.preventDefault();const bs=[...document.querySelectorAll('#ui [data-a]')];const t=document.querySelector('#ui .gpf')||bs[0];if(t)t.click()}
  else if(e.code==='Backspace'){const bk=document.querySelector('#ui [data-a="back"],#ui [data-a="resume"]');if(bk)bk.click()}}});
addEventListener('keyup',e=>{const k=KEYMAP[e.code];if(k)K[k]=0});
function swipeDir(t){let dx=t.x-t.ax,dy=t.y-t.ay;const d=Math.hypot(dx,dy);t.sx=clamp((t.x-t.ox)/55,-1,1);t.sy=clamp((t.y-t.oy)/55,-1,1);const o={};if(d<12)return o;if(d>40){t.ax=t.x-dx/d*40;t.ay=t.y-dy/d*40}
 const s=Math.round(Math.atan2(dy,dx)/(Math.PI/4));if(s===0||s===1||s===-1)o.R=1;if(s===4||s===-4||s===3||s===-3)o.L=1;if(s===2||s===1||s===3)o.D=1;if(s===-2||s===-1||s===-3)o.U=1;return o}
function tStart(id,x,y){AU.unlock();TOUCH.set(id,{x,y,ax:x,ay:y,ox:x,oy:y,z:{},sx:0,sy:0,t0:performance.now()})}
function tMove(id,x,y){const t=TOUCH.get(id);if(!t)return;t.x=x;t.y=y;const before=t.z.U;t.z=swipeDir(t);if(t.z.U&&!before)swipeJump=1}
function tEnd(id){TOUCH.delete(id)}
function clearInput(){TOUCH.clear();VIRTP.jump=VIRTP.saber=VIRTP.force=0;KP.J=KP.S=KP.F=0;for(const k in K)K[k]=0;for(const k in VIRT)VIRT[k]=0;document.querySelectorAll('#pad .big.on').forEach(b=>b.classList.remove('on'));swipeJump=0}
function bindSurface(el){el.addEventListener('touchstart',e=>{if(state!=='play'&&state!=='crawl')return;e.preventDefault();if(state==='crawl'){endCrawl();return}for(const t of e.changedTouches)tStart(t.identifier,t.clientX,t.clientY)},{passive:false});
 el.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)tMove(t.identifier,t.clientX,t.clientY)},{passive:false});
 el.addEventListener('touchend',e=>{e.preventDefault();for(const t of e.changedTouches)tEnd(t.identifier)},{passive:false});
 el.addEventListener('touchcancel',e=>{for(const t of e.changedTouches)tEnd(t.identifier)});
 let md=false;el.addEventListener('mousedown',e=>{if(state==='crawl'){endCrawl();return}if(state!=='play')return;md=true;tStart('m',e.clientX,e.clientY)});addEventListener('mousemove',e=>{if(md)tMove('m',e.clientX,e.clientY)});addEventListener('mouseup',()=>{if(md){md=false;tEnd('m')}})}
bindSurface(cv);bindSurface($('pad'));$('crawl').addEventListener('pointerdown',e=>{e.preventDefault();endCrawl()});
function bindBtn(el,k){const on=e=>{e.preventDefault();e.stopPropagation();AU.unlock();if(!VIRT[k]&&k==='saber')mashCount++;if(!VIRT[k])VIRTP[k]=1;VIRT[k]=1;el.classList.add('on')},off=e=>{e.preventDefault();e.stopPropagation();VIRT[k]=0;el.classList.remove('on')};
 el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off,{passive:false});el.addEventListener('touchcancel',off,{passive:false});
 el.addEventListener('mousedown',on);el.addEventListener('mouseup',off);el.addEventListener('mouseleave',off);el.addEventListener('contextmenu',e=>e.preventDefault())}
bindBtn($('bSaber'),'saber');bindBtn($('bForce'),'force');bindBtn($('bJump'),'jump');
addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(state==='play')pauseGame()}});
function readInput(){let L=K.L||GP.L,R=K.R||GP.R,U=K.U||GP.U,D=K.D||GP.D,sx=0,sy=0;for(const t of TOUCH.values()){if(t.z.L)L=1;if(t.z.R)R=1;if(t.z.U)U=1;if(t.z.D)D=1;sx+=t.sx;sy+=t.sy}
 if(GP.on&&(Math.abs(GP.sx)>0.3||Math.abs(GP.sy)>0.3)){sx=GP.sx;sy=GP.sy}
 if(K.L||K.R)sx=(K.R?1:0)-(K.L?1:0);if(K.U||K.D)sy=(K.D?1:0)-(K.U?1:0);
 inp.L=L?1:0;inp.R=R?1:0;inp.U=U?1:0;inp.D=D?1:0;inp.sx=clamp(sx,-1,1);inp.sy=clamp(sy,-1,1);
 const bike=G&&G.mode==='bike';
 const j=!!(K.J||GP.J||VIRT.jump||VIRTP.jump||KP.J||(!bike&&K.U));inp.jumpP=((j&&!lastJ)||(!bike&&swipeJump))?1:0;inp.jump=j?1:0;lastJ=j;swipeJump=0;
 const s=!!(K.S||GP.S||VIRT.saber||VIRTP.saber||KP.S);inp.saberP=s&&!lastS?1:0;inp.saberR=!s&&lastS?1:0;inp.saber=s?1:0;lastS=s;
 const f=!!(K.F||GP.F||VIRT.force||VIRTP.force||KP.F);inp.forceP=f&&!lastF?1:0;inp.force=f?1:0;lastF=f;VIRTP.jump=VIRTP.saber=VIRTP.force=0;KP.J=KP.S=KP.F=0;
 if(window.__BOT&&G&&state==='play')botInput()}
/* ---------- art ---------- */
const IMG={},META={};const TINT={};
const ART=['jim_body','st_body','sth_body','stc_body','sith_body','walker_body','wk_nt','wk_ns','wk_nf','wk_ft','wk_fs','wk_ff','jim_idle','jim_run1','jim_run2','jim_jump','jim_slash','jim_push','jim_bike','jim_face','st_aim','st_walk1','st_walk2','st_fire','st_fly','st_heavy','st_cmd','sith_idle','sith_slash','sith_light','sith_hurt','walker','scout_bike','guard','tie','buck','buck_open','bg_hangar','bg_forest','bg_reactor','bg_throne','cover'];
function loadArt(){return Promise.all([fetch('art/meta.json').then(r=>r.json()).then(m=>Object.assign(META,m)).catch(()=>{}),...ART.map(n=>new Promise(res=>{const im=new Image();im.onload=()=>{IMG[n]=im;res()};im.onerror=res;im.src='art/'+n+'.webp?v='+VERSION}))])}
/* cached tinted/silhouette copies (no ctx.filter: iOS ignores it) */
function tinted(n,col,a,mode){const k=n+col+a+(mode||'');if(TINT[k])return TINT[k];const im=IMG[n];if(!im)return null;const cc=document.createElement('canvas');cc.width=im.width;cc.height=im.height;const x=cc.getContext('2d');x.drawImage(im,0,0);x.globalCompositeOperation=mode||'source-atop';x.globalAlpha=a;x.fillStyle=col;x.fillRect(0,0,cc.width,cc.height);return TINT[k]=cc}
/* ---------- particles / fx ---------- */
function P(o){G.parts.push(o);return o}
function burst(x,y,n,cols,sp=260,life=0.6,size=3,add=true,grav=500){for(let i=0;i<n;i++){const a=Math.random()*TAU,v=sp*(0.25+Math.random()*0.75);P({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*0.2,l:life*(0.5+Math.random()*0.7),m:life,s:size*(0.5+Math.random()),c:cols[i%cols.length],add,g:grav,spark:add})}}
function sparks(x,y,dir,n,cols,sp=420){for(let i=0;i<n;i++){const a=(dir===undefined?Math.random()*TAU:dir+rand(-0.8,0.8)),v=sp*(0.3+Math.random()*0.8);P({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rand(0.18,0.45),m:0.45,s:rand(1.2,2.6),c:cols[i%cols.length],add:true,g:900,spark:1})}}
function smoke(x,y,n,col='#5a5a66',sz=14,up=60){for(let i=0;i<n;i++)P({x:x+rand(-10,10),y:y+rand(-6,6),vx:rand(-40,40),vy:-rand(10,up),l:rand(0.6,1.3),m:1.3,s:rand(sz*0.6,sz*1.3),c:col,smoke:1,g:-20})}
function ring(x,y,col,r=60,life=0.4,w=6){P({ring:1,x,y,l:life,m:life,s:r,c:col,w,add:true,vx:0,vy:0,g:0})}
function flashLight(x,y,r,col,life=0.25){G.lights.push({x,y,r,c:col,l:life,m:life})}
function explode(x,y,big){const k=big?1.8:1;burst(x,y,26*k,['#fff7d0','#ffc040','#ff6a1a','#ff3010'],380*k,0.7,4*k);smoke(x,y,10*k,'#3a3436',22*k,80);ring(x,y,'#ffd080',70*k,0.35,8);flashLight(x,y,220*k,'#ffa040',0.4);shake(big?16:9);AU.fx(big?'bigboom':'explode');G.debris&&debris(x,y,big?10:5)}
function debris(x,y,n){for(let i=0;i<n;i++)P({x,y,vx:rand(-320,320),vy:rand(-600,-200),l:rand(0.8,1.4),m:1.4,s:rand(3,7),c:['#9aa0aa','#5a5f6a','#d8dce4'][i%3],g:1500,rock:1,rot:rand(0,6),vr:rand(-12,12)})}
function txt(x,y,s,col='#fff',big=0){for(const t of G.texts)if(Math.abs(t.x-x)<160&&Math.abs(t.y-y)<34&&t.l>0.75)y-=34;G.texts.push({x,y,s,c:col,l:1.1,m:1.1,big})}
function shake(a){G.shake=Math.max(G.shake,a)}
function hitstop(t){G.hs=Math.max(G.hs,t)}
function slowmo(t,f){G.slowT=t;G.slowF=f||0.3}
function screenFlash(col,a){G.flash={c:col,a:a||0.7}}
/* ---------- physics helpers ---------- */
function box(o){return{x:o.x-o.w/2,y:o.y-o.h,w:o.w,h:o.h}}
function ovr(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function moveBody(o,dt,opt){opt=opt||{};const px=o.x,py=o.y;o.vy=Math.min(o.vy+GRAV*(o.gm||1)*dt,1600);
 o.x+=o.vx*dt;let b=box(o);o.hitWall=0;
 for(const s of G.solids){if(s.dead)continue;if(ovr(b,s)){if(px<s.x+s.w/2)o.x=s.x-o.w/2-0.01;else o.x=s.x+s.w+o.w/2+0.01;o.vx=0;o.hitWall=1;b=box(o)}}
 o.y+=o.vy*dt;b=box(o);const was=o.onG;o.onG=false;o.ride=null;
 for(const s of G.solids){if(s.dead)continue;if(ovr(b,s)){if(o.vy>=0&&py<=s.y+2){o.y=s.y;o.vy=0;o.onG=true;o.gnd=s}else if(o.vy<0&&py-o.h>=s.y+s.h-2){o.y=s.y+s.h+o.h;o.vy=0}else{if(px<s.x+s.w/2)o.x=s.x-o.w/2-0.01;else o.x=s.x+s.w+o.w/2+0.01}b=box(o)}}
 if(!opt.drop&&o.vy>=0){for(const p of G.plats){if(o.x+o.w/2*0.6>p.x&&o.x-o.w/2*0.6<p.x+p.w&&py<=p.y+2+(p.dy>0?p.dy:0)&&o.y>=p.y){o.y=p.y;o.vy=0;o.onG=true;o.gnd=p;if(p.mover)o.ride=p}}}
 return was}
function groundAt(x,feetY){let best=null;const all=G.solids.concat(G.plats);for(const s of all){if(s.dead)continue;if(x>=s.x&&x<=s.x+s.w&&s.y>=(feetY===undefined?-999:feetY-4)){if(best===null||s.y<best)best=s.y}}return best}
function solidUnder(x,y){for(const s of G.solids)if(!s.dead&&x>=s.x&&x<=s.x+s.w&&y>=s.y-4&&y<=s.y+30)return true;for(const p of G.plats)if(x>=p.x&&x<=p.x+p.w&&Math.abs(y-p.y)<6)return true;return false}
/* seeded rng for level gen */
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* ===== levels ===== */
const TOUCHDEV=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const HINT={
 move:TOUCHDEV?'SWIPE & HOLD to run  ·  SWIPE UP to jump':'ARROWS / A-D to run  ·  SPACE or UP to jump',
 saber:TOUCHDEV?'Tap SABER to slash  ·  HOLD SABER to deflect bolts':'J = slash  ·  HOLD J to deflect bolts',
 djump:TOUCHDEV?'Swipe up (or JUMP) again in mid-air = FORCE JUMP':'Jump again in mid-air = FORCE JUMP',
 force:TOUCHDEV?'FORCE button = Force push! Troopers go flying':'K = Force push! Troopers go flying',
 door:'Sealed blast door! Use the FORCE',
 bike:TOUCHDEV?'SWIPE & HOLD up/down to steer  ·  JUMP hops logs':'UP/DOWN to steer  ·  SPACE hops logs',
 bike2:TOUCHDEV?'SABER slashes scouts beside you  ·  HOLD SABER to block':'J slashes scouts beside you  ·  HOLD J to block',
 guard:'Royal Guards block your saber. FORCE PUSH them first!'
};
const PADHINT={move:'🎮 STICK or D-PAD to run  ·  A to jump',saber:'🎮 X = slash  ·  HOLD X to deflect bolts',djump:'🎮 Press A again in mid-air = FORCE JUMP',force:'🎮 Y = Force push! Troopers go flying',bike:'🎮 STICK up/down to steer  ·  A hops logs',bike2:'🎮 X slashes scouts beside you  ·  HOLD X to block'};
function hintText(s){if(typeof GP!=='undefined'&&GP.on)for(const k in HINT)if(HINT[k]===s&&PADHINT[k])return PADHINT[k];return s}
const LEVELS=[
 {id:'hangar',name:'Star Destroyer Hangar',num:1,theme:'hangar',music:'hangar',mode:'plat',boss:'krell',bossName:'COMMANDER KRELL',
  card:'Jim has slipped aboard the Star Destroyer <b>Dominator</b>. Darth Vexis stole the Light Ring, and the Empire is using it to power a terrible new weapon. Find out where they took it!',from:'Rebel Command'},
 {id:'chase',name:'Forest Moon Speeder Chase',num:2,theme:'forest',music:'chase',mode:'bike',boss:'walker',bossName:'AT-ST "IRONSTRIDE"',
  card:'The Ring was flown to a secret base on the forest moon! Grab a speeder bike and outrun the scout troopers. A walker guards the shuttle pad.',from:'Rebel Command'},
 {id:'reactor',name:'The Reactor Core',num:3,theme:'reactor',music:'reactor',mode:'plat',boss:'bucketon',bossName:'LORD BUCKETON',
  card:'Jim is on the battle station. The Light Ring is wired into the reactor core... and an old enemy in a very shiny bucket is waiting for revenge.',from:'Rebel Command'},
 {id:'throne',name:'Throne of Darth Vexis',num:4,theme:'throne',music:'vexis',mode:'plat',boss:'vexis',bossName:'DARTH VEXIS',
  card:'This is it, Jim. Darth Vexis holds the Light Ring in the throne room. Get past the Royal Guard and end this. May the Force be with you!',from:'Rebel Command'}
];
function B(){return{
 gnd(x0,x1,y=GROUND,kind){G.solids.push({x:x0,y,w:x1-x0,h:700-y,kind:kind||'floor'})},
 bridge(x0,x1,y=GROUND){G.solids.push({x:x0,y,w:x1-x0,h:26,kind:'bridge'})},
 crate(x,yb,w,h){G.solids.push({x,y:yb-h,w,h,kind:'crate'})},
 wall(x,w,y0,y1,kind){G.solids.push({x,y:y0,w,h:y1-y0,kind:kind||'wall'})},
 cat(x,y,w){G.plats.push({x,y,w,kind:'cat'})},
 mov(x,y,w,dx,dy,per){G.plats.push({x,y,w,x0:x,y0:y,ax:dx,ay:dy,per,mover:1,kind:'mover',ph:Math.random()*0})},
 en(type,x,o){G.spawns.push(Object.assign({type,x},o||{}))},
 pk(type,x,y){G.pickups.push({type,x,y,t:Math.random()*3})},
 cp(x){G.cps.push({x,on:false})},
 hint(x,y,s){G.hints.push({x,y,s})},
 trig(x,name,d){G.trigs.push(Object.assign({x,name,done:false},d||{}))},
 door(x){const d={x,y:-200,w:46,h:GROUND+200,kind:'door',hp:1};G.solids.push(d);G.doors.push(d)},
 beam(x,per,on,ph){G.beams.push({x,per,on,ph:ph||0,y0:-120,y1:GROUND})},
 vent(x){G.vents.push({x,t:Math.random()*3})},
 arena(x0,x1){G.arena={x0,x1,on:false}}
}}
function buildHangar(b){
 b.gnd(-300,1650);b.hint(150,250,HINT.move);b.hint(560,250,HINT.saber);
 b.en('trooper',820);b.crate(980,GROUND,90,80);b.crate(1070,GROUND,90,150);b.en('trooper',1110);
 b.en('trooper',1380);b.en('trooper',1500);b.pk('kyber',1240,300);b.vent(700);b.vent(1300);
 b.hint(1520,200,HINT.djump);
 b.gnd(1860,3560);b.cp(1960);b.trig(2150,'tie');b.en('trooper',2450);b.en('heavy',2760);b.vent(2300);
 b.cat(2880,330,250);b.en('trooper',2990,{y:330});b.cat(3170,240,180);b.pk('shard',3260,170);b.en('trooper',3380);
 b.hint(3250,380,HINT.force);
 b.door(3560);b.hint(3420,190,HINT.door);
 b.gnd(3560,4420);b.cp(3720);b.trig(3780,'rappel',{xs:[3950,4100,4260]});b.pk('force',3900,380);b.vent(4000);
 b.mov(4470,430,150,200,0,3.2);b.pk('shard',4700,250);
 b.gnd(4860,7000);b.en('heavy',5080);b.en('trooper',5180);b.crate(5260,GROUND,80,90);b.en('trooper',5300);b.pk('kyber',5420,380);b.cp(5000);
 b.cp(5560);b.trig(5640,'arena');b.arena(5600,6640);b.wall(6640,200,-300,GROUND);
 b.pk('shard',5800,200);
}
function buildChase(b){G.bikeLen=24000;const r=rng(77);let x=1400;
 b.hint(300,0,HINT.bike);b.hint(1300,0,HINT.bike2);
 while(x<G.bikeLen-900){const k=r();const y=330+r()*190;
  if(k<0.55)G.obs.push({type:'tree',x,y,w:34+r()*20});else if(k<0.8)G.obs.push({type:'log',x,y});else G.obs.push({type:'rock',x,y});
  if(r()<0.35)G.obs.push({type:'tree',x:x+60+r()*80,y:330+((y-330+95)%190),w:30+r()*20});
  if(r()<0.12)G.pickups.push({type:r()<0.5?'kyber':'force',x:x+200,y:330+r()*190,t:0,bike:1});
  x+=300+r()*360-Math.min(150,x/200)}
 [3200,9800,16500].forEach(px=>G.pickups.push({type:'shard',x:px,y:360+r()*120,t:0,bike:1}));
 [1800,4200,6600,9000,11500,14000,16200,18600,21000].forEach((px,i)=>G.trigs.push({x:px,name:'scouts',n:i<2?1:i<6?2:3,done:false}));
 G.trigs.push({x:G.bikeLen,name:'walker',done:false})}
function buildReactor(b){
 b.gnd(-300,760);b.hint(260,240,HINT.djump);b.vent(500);
 b.bridge(960,1500);b.en('shadow',1250,{y:GROUND});b.pk('kyber',1100,380);
 b.mov(1560,400,140,0,-140,3.4);b.cat(1780,300,180);b.pk('shard',1870,210);
 b.bridge(1960,2700);b.cp(2020);b.beam(2250,2.6,1.2,0);b.en('trooper',2450);b.en('shadow',2620);
 b.bridge(2860,3600);b.hint(2900,240,HINT.guard);b.en('guard',3250);b.beam(3480,2.4,1.1,1.1);
 b.mov(3700,440,140,260,0,3.6);b.cat(3780,250,140);b.pk('shard',3850,170);
 b.bridge(4180,5000,GROUND);b.cp(4260);b.en('guard',4550);b.en('shadow',4850);b.cat(4500,330,180);b.en('trooper',4590,{y:330});b.pk('force',4380,380);
 b.bridge(5150,5600);b.cp(5200);b.trig(5330,'arena');b.arena(5180,6460);
 b.cat(5640,360,140);b.cat(5900,280,160);b.cat(6150,360,140);b.mov(5700,450,120,420,0,4.6);
 b.bridge(6100,6460);b.wall(6460,200,-300,GROUND);
 b.pk('shard',5980,190);
}
function buildThrone(b){
 b.gnd(-300,4200);b.hint(240,250,'The Royal Guard protects the throne. FORCE PUSH, then strike!');
 b.en('trooper',700);b.en('trooper',820);b.en('guard',1150);b.pk('kyber',1300,380);
 b.cat(1450,330,200);b.en('shadow',1540,{y:330});b.en('guard',1750);b.en('heavy',1980);
 b.cp(1450);b.pk('shard',1550,240);b.cat(2100,300,160);b.pk('shard',2180,200);
 b.en('guard',2350);b.en('guard',2480);b.pk('force',2250,380);b.pk('kyber',2600,380);b.pk('shard',2720,300);
 b.cp(2750);b.trig(2900,'arena');b.arena(2860,4100);b.wall(4100,200,-300,GROUND);
}
const BUILD={hangar:buildHangar,chase:buildChase,reactor:buildReactor,throne:buildThrone};

/* ===== Jim ===== */
const JT={run:330,acc:2700,air:1800,fric:3000,jump:870,djump:790,slash:0.26,guardMul:0.45,pushCost:34,regen:9};
/* hilt emitter (sprite px, 300px-tall frames) + painted direction */
const HILT={jim_idle:[153,100,.22,-.97],jim_run1:[165,97,.22,-.975],jim_run2:[173,96,.18,-.98],jim_jump:[167,68,.14,-.99],jim_slash:[203,6,.49,-.87],jim_push:[64,119,.63,-.78]};
const JSC=0.37;
function newPlayer(x,y){return{x,y,w:34,h:100,vx:0,vy:0,face:1,onG:false,hp:6,maxHp:6,inv:1,force:100,jumps:0,coyote:0,jbuf:0,slashT:0,slashN:0,slashId:0,guard:false,holdT:0,pushT:0,hurtT:0,dead:false,deadT:0,safe:{x,y},safeT:0,anim:0,djT:0,bladeA:-1.2,trail:[],landT:0,lockT:0,stunT:0}}
function playerHurt(dmg,src,kx){const p=G.p;if(p.inv>0||p.dead||G.clear||(window.__GOD&&!G.godOff))return false;p.hp-=dmg;p.inv=1.1;p.hurtT=0.3;AU.fx('hurt');shake(9);hitstop(0.05);
 burst(p.x,p.y-60,14,['#ffffff','#ff6a5a'],240,0.4,3);p.vx=(kx!==undefined?kx:-p.face)*260;p.vy=Math.min(p.vy,-260);p.guard=false;G.combo=0;
 if(p.hp<=0)playerDie();return true}
function playerDie(){const p=G.p;if(p.dead)return;p.dead=true;p.deadT=2;run.lives--;AU.fx('hurt');shake(16);slowmo(0.8,0.35);burst(p.x,p.y-50,40,['#9ad8ff','#ffffff','#5aa8ff'],300,1,4);}
function respawnPlayer(){const p=G.p;if(run.lives<0){gameOver();return}const r=G.respawn;p.x=r.x;p.y=r.y;p.vx=p.vy=0;p.hp=p.maxHp;p.dead=false;p.inv=2.2;p.force=Math.max(p.force,60);p.guard=false;p.slashT=0;G.cam.x=clamp(p.x-viewW*0.35,G.camMin,G.camMax);
 if(G.boss&&G.boss.reset)G.boss.reset();G.bolts.length=0;G.nades.length=0;ring(p.x,p.y-50,'#7fd0ff',80,0.5,6)}
function stepPlayer(dt){const p=G.p;if(p.dead){p.deadT-=dt;if(p.deadT<=0)respawnPlayer();return}
 if(p.inv>0)p.inv-=dt;if(p.hurtT>0)p.hurtT-=dt;if(p.pushT>0)p.pushT-=dt;if(p.djT>0)p.djT-=dt;if(p.landT>0)p.landT-=dt;
 p.force=Math.min(100,p.force+JT.regen*dt);
 if(p.lockT>0){p.vx=0;moveBody(p,dt);return}
 let dir=(inp.R?1:0)-(inp.L?1:0);if(G.cine)dir=G.cineDir||0;
 /* saber */
 if(inp.saberP&&!G.cine){if(p.slashT<0.09){p.slashN=p.slashN%3+1;p.slashT=JT.slash;p.slashId++;p.hitSet=new Set();AU.fx('swing');p.guard=false}p.holdT=0}
 if(inp.saber&&!G.cine){p.holdT+=dt;if(p.holdT>0.2&&p.slashT<=0){if(!p.guard){p.guard=true;AU.fx('lock')}}}else{p.guard=false;p.holdT=0}
 if(p.slashT>0){p.slashT-=dt;if(p.slashT<=0&&!inp.saber)p.slashN=0}
 if(inp.forceP&&!G.cine)doPush();
 const tgt=dir*JT.run*(p.guard?JT.guardMul:1)*(p.slashT>0&&p.onG?0.7:1);const ac=p.onG?(dir?JT.acc:JT.fric):JT.air;
 if(p.hurtT<=0)p.vx+=clamp(tgt-p.vx,-ac*dt,ac*dt);
 if(dir&&p.slashT<=0.12)p.face=dir;if(p.guard&&dir)p.face=p.face;/* guard keeps facing */
 /* jump */
 if(inp.jumpP)p.jbuf=0.13;else if(p.jbuf>0)p.jbuf-=dt;
 if(p.onG){p.coyote=0.1;p.jumps=0}else if(p.coyote>0)p.coyote-=dt;
 if(p.jbuf>0&&!G.cine){if(p.coyote>0){p.vy=-JT.jump;p.jumps=1;p.coyote=0;p.jbuf=0;AU.fx('jump');dustPuff(p.x,p.y,6)}
  else if(p.jumps<2&&inp.jumpP){p.vy=-JT.djump;p.jumps=2;p.jbuf=0;p.djT=0.45;AU.fx('djump');ring(p.x,p.y-30,'#7fd0ff',46,0.35,4);sparks(p.x,p.y-10,Math.PI/2,10,['#bfe8ff','#5ab0ff'],200)}}
 const was=moveBody(p,dt);
 if(p.onG&&!was&&p.vy>=0){p.landT=0.12;AU.fx('land');dustPuff(p.x,p.y,5)}
 if(p.ride){p.x+=p.ride.dx||0}
 /* pits */
 if(p.y>VH+160){if(!(window.__GOD&&!G.godOff)){p.hp-=1;AU.fx('hurt')}if(p.hp<=0){playerDie();p.y=VH+100;return}p.x=p.safe.x;p.y=p.safe.y;p.vx=p.vy=0;p.inv=1.4;txt(p.x,p.y-130,'-1','#ff7a6a');ring(p.x,p.y-50,'#7fd0ff',60)}
 if(p.onG&&!p.ride&&solidUnder(p.x-22,p.y)&&solidUnder(p.x+22,p.y)){p.safeT+=dt;if(p.safeT>0.25){p.safe={x:p.x,y:p.y};p.safeT=0}}
 /* keep in arena / level */
 const lo=G.arena&&G.arena.on?G.arena.x0+20:-250;if(p.x<lo){p.x=lo;p.vx=Math.max(0,p.vx)}
 /* checkpoints */
 for(const cp of G.cps){if(!cp.on&&p.x>cp.x-10){cp.on=true;const gy=groundAt(cp.x,0);G.respawn={x:cp.x,y:gy===null?GROUND:gy};AU.fx('beacon');ring(cp.x,(gy||GROUND)-90,'#5affb0',50);txt(cp.x,(gy||GROUND)-150,'CHECKPOINT','#7affc8')}}
 p.anim+=dt*(Math.abs(p.vx)>30&&p.onG?Math.abs(p.vx)/JT.run:0.3);
 /* combat */
 if(p.slashT>0){const prog=1-p.slashT/JT.slash;if(prog>0.12&&prog<0.78)slashHits(p)}
 if(p.guard)guardDeflect(p);
 AU.humSet(state==='play',clamp((p.slashT>0?1:0)+Math.abs(p.vx)/900,0,1))}
function dustPuff(x,y,n){for(let i=0;i<n;i++)P({x:x+rand(-14,14),y:y-2,vx:rand(-70,70),vy:rand(-50,-10),l:0.45,m:0.45,s:rand(4,8),c:G.L.theme==='forest'?'#8a7a5a':'#9aa3b0',smoke:1,g:-30})}
function bladeBase(p){/* world-space emitter + painted dir */const fr=jimFrame(p);const h=HILT[fr]||HILT.jim_idle;const m=META[fr]||{ax:90};const sc=JSC;
 const ex=(h[0]-m.ax)*sc,ey=(h[1]-(m.h||300))*sc;return{x:p.x+ex*p.face,y:p.y+ey+(p.bob||0),dx:h[2]*p.face,dy:h[3],fr}}
function bladeAngle(p){/* returns angle in world (radians) */
 if(p.slashT>0){const prog=1-p.slashT/JT.slash;const e=1-Math.pow(1-prog,3);let a0,a1;if(p.slashN===2){a0=0.9;a1=-1.9}else if(p.slashN===3){a0=-2.2;a1=0.6}else{a0=-2.0;a1=0.7}
  if(!p.onG&&p.slashN!==2){a0=-2.4;a1=1.3}const a=lerp(a0,a1,e);return p.face>0?a:Math.PI-a}
 if(p.guard){const a=-0.95+Math.sin(G.t*9)*0.03;return p.face>0?a:Math.PI-a}
 const b=bladeBase(p);return Math.atan2(b.dy,b.dx)}
const BLADE=82;
function slashHits(p){const cx=p.x+p.face*26,cy=p.y-62,R=104;
 for(const e of G.enemies){if(e.dead||p.hitSet.has(e))continue;const dx=e.x-cx,dy=(e.y-e.h/2)-cy;if(Math.abs(dy)<R*0.85&&dx*p.face>-30&&Math.abs(dx)<R+e.w/2){p.hitSet.add(e);enemyHitBySaber(e,p)}}
 for(const b of G.bolts){if(b.owner!=='e')continue;const dx=b.x-cx,dy=b.y-cy;if(dx*p.face>-40&&Math.hypot(dx,dy)<R+10)deflect(b,0.9)}
 for(const n of G.nades){if(n.owner!=='e')continue;const dx=n.x-cx,dy=n.y-cy;if(Math.hypot(dx,dy)<R+10){batBack(n,p.face)}}
 for(const d of G.doors){if(!d.dead&&Math.abs(d.x+d.w/2-cx)<R&&!p.hitSet.has(d)){p.hitSet.add(d);sparks(d.x+(p.face>0?0:d.w),cy,p.face>0?Math.PI:0,14,['#fff','#ffcf6a']);AU.fx('clash');txt(d.x,cy-60,'Use the FORCE!','#9ad8ff')}}
 if(G.boss&&!G.boss.dead&&!p.hitSet.has(G.boss)){const B=G.boss,bb=B.hitbox();const nx=clamp(cx,bb.x,bb.x+bb.w),ny=clamp(cy,bb.y,bb.y+bb.h);if(Math.hypot(nx-cx,ny-cy)<R*0.9&&(nx-cx)*p.face>-30){p.hitSet.add(B);B.onSaber(p)}}
 for(const o of G.thrown){if(o.dead||o.owner!=='e')continue;if(Math.hypot(o.x-cx,o.y-cy)<R+o.r){o.dead=true;explodeSmall(o.x,o.y);txt(o.x,o.y-30,'SMASH!','#ffd27a');run.score+=100}}}
function guardDeflect(p){const cx=p.x+p.face*16,cy=p.y-64;
 for(const b of G.bolts){if(b.owner!=='e')continue;const dx=b.x-cx,dy=b.y-cy;const front=dx*p.face>-14||sgn(b.vx)===-p.face;if(front&&Math.abs(dx)<70&&Math.abs(dy)<84)deflect(b,0.65)}}
function nearestTarget(x,y,face,maxD){let best=null,bd=maxD||1100;for(const e of G.enemies){if(e.dead||e.st==='rappel')continue;const dx=e.x-x;if(dx*face<0)continue;const d=Math.hypot(dx,(e.y-60)-y);if(d<bd){bd=d;best={x:e.x,y:e.y-e.h*0.55,e}}}
 if(G.boss&&!G.boss.dead&&G.boss.aimPt){const a=G.boss.aimPt();const dx=a.x-x;if(dx*face>0||G.mode==='bike'){const d=Math.hypot(dx,a.y-y);if(d<bd*1.4){best={x:a.x,y:a.y,boss:1}}}}return best}
function deflect(b,aim){const p=G.p;b.owner='j';const sp=Math.hypot(b.vx,b.vy)*1.2;const tg=Math.random()<aim?nearestTarget(b.x,b.y,p.face):null;
 if(tg){const a=Math.atan2(tg.y-b.y,tg.x-b.x);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp}else{const a=(p.face>0?0:Math.PI)+(p.face>0?-1:1)*rand(0.15,0.7);b.vx=Math.cos(a)*sp;b.vy=Math.sin(a)*sp}
 b.life=2;b.def=1;sparks(b.x,b.y,Math.atan2(b.vy,b.vx),12,['#ffffff','#ff9a7a','#9ad8ff']);flashLight(b.x,b.y,90,'#ffb0a0',0.15);AU.fx('deflect');hitstop(0.025);run.score+=25;G.stats.deflects++;
 if(G.stats.deflects===1||Math.random()<0.18)txt(b.x,b.y-24,'DEFLECT!','#ffe27a')}
function batBack(n,face){n.owner='j';n.vx=face*rand(520,640);n.vy=-rand(380,480);n.fuse=Math.max(n.fuse,0.7);AU.fx('clash');sparks(n.x,n.y,0,8,['#fff','#ffd27a']);txt(n.x,n.y-30,'RETURN TO SENDER!','#ffe27a')}
function doPush(){const p=G.p;if(p.pushT>0||p.dead)return;if(p.force<JT.pushCost){txt(p.x,p.y-140,'Need more Force','#9ad8ff');return}
 p.force-=JT.pushCost;p.pushT=0.4;p.guard=false;AU.fx('force');shake(7);hitstop(0.04);G.waves.push({x:p.x+p.face*30,y:p.y-60,face:p.face,t:0});
 const cx=p.x,cy=p.y-55,R=310;G.stats.pushes++;
 for(const e of G.enemies){if(e.dead)continue;const dx=(e.x-cx)*p.face,dy=Math.abs(e.y-e.h/2-cy);if(dx>-30&&dx<R&&dy<140)enemyPushed(e,p.face,1-dx/R)}
 for(const b of G.bolts){const dx=(b.x-cx)*p.face;if(b.owner==='e'&&dx>-20&&dx<R&&Math.abs(b.y-cy)<150){b.owner='j';b.vx=Math.abs(b.vx)*p.face*1.1+p.face*200;b.vy*=0.3;b.def=1}}
 for(const n of G.nades){const dx=(n.x-cx)*p.face;if(dx>-30&&dx<R&&Math.abs(n.y-cy)<160)batBack(n,p.face)}
 for(const o of G.thrown){if(o.dead)continue;const dx=(o.x-cx)*p.face;if(dx>-30&&dx<R+80&&Math.abs(o.y-cy)<200){o.owner='j';const B=G.boss;const a=B?Math.atan2(B.y-B.h*0.5-o.y,B.x-o.x):0;o.vx=Math.cos(a)*900;o.vy=Math.sin(a)*900;o.held=0;txt(o.x,o.y-30,'FORCE THROW!','#9ad8ff')}}
 for(const d of G.doors){if(d.dead)continue;const dx=(d.x+d.w/2-cx)*p.face;if(dx>-10&&dx<220){blastDoor(d,p.face)}}
 if(G.boss&&!G.boss.dead){const B=G.boss;const dx=(B.x-cx)*p.face;if(dx>-40&&dx<R+B.w/2&&Math.abs(B.y-B.h/2-cy)<B.h*0.5+120)B.onPush&&B.onPush(p.face,1-dx/(R+B.w/2))}
 if(G.mode==='bike')bikePush()}
function blastDoor(d,face){d.dead=true;AU.fx('door');shake(16);hitstop(0.08);G.props.push({kind:'doorfall',x:d.x,y:d.y,w:d.w,h:d.h,rot:0,vr:face*1.6,vx:face*240,t:0});smoke(d.x+d.w/2,GROUND-30,16,'#7a7f88',26,90);debris(d.x+d.w/2,GROUND-150,10);txt(d.x,200,'DOOR BLASTED!','#9ad8ff',1);run.score+=300}

/* ===== enemies: stormtroopers, heavy troopers, shadow troopers, royal guards ===== */
const ET={trooper:{hp:1,sc:100,w:38,h:104},heavy:{hp:3,sc:250,w:42,h:106},shadow:{hp:2,sc:180,w:38,h:104},guard:{hp:4,sc:350,w:44,h:116}};
function spawnEnemy(s){const d=ET[s.type]||ET.trooper;let y=s.y;if(y===undefined){const g=groundAt(s.x,-100);y=g===null?GROUND:g}
 const e={type:s.type,x:s.x,y,x0:s.x,w:d.w,h:d.h,vx:0,vy:0,face:-1,hp:d.hp,max:d.hp,sc:d.sc,st:s.st||'idle',t:Math.random()*2,cool:rand(0.6,1.6),aimT:0,fireT:0,burst:0,dead:false,stun:0,flash:0,alerted:false,blockT:0,rot:0,alpha:1,rope:0};
 if(e.st==='rappel'){e.y=-60;e.rope=1}G.enemies.push(e);return e}
function onScreen(x,m){m=m||0;return x>G.cam.x-m&&x<G.cam.x+viewW+m}
function eShoot(e,kind){const p=G.p,mx=e.x+e.face*(e.type==='heavy'?52:44),my=e.y-(e.type==='heavy'?62:72);let tx=p.x,ty=p.y-58;if(p.dead){ty=my}
 let a=Math.atan2(ty-my,tx-mx);const base=e.face>0?0:Math.PI;let da=Math.atan2(Math.sin(a-base),Math.cos(a-base));da=clamp(da,-0.42,0.42);a=base+da+rand(-0.04,0.04);
 const sp=kind==='heavy'?480:e.type==='shadow'?610:540;G.bolts.push({x:mx,y:my,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,owner:'e',life:3,col:'#ff2a1a',len:kind==='heavy'?34:26,w:kind==='heavy'?5:3.6});
 flashLight(mx,my,70,'#ff5030',0.12);sparks(mx,my,a,4,['#ffd0a0','#ff6040'],160);AU.fx(kind==='heavy'?'heavy':(onScreen(e.x,0)?'blaster':'blasterFar'));e.fireT=0.14}
function stepEnemies(dt){const p=G.p;let anyAlert=false;
 for(const e of G.enemies){if(e.flash>0)e.flash-=dt;
  if(e.dead){e.t+=dt;if(e.fly){e.vy+=GRAV*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=e.vr*dt;const g=groundAt(e.x,e.y-30);if(g!==null&&e.y>=g&&e.vy>0&&e.t>0.15){e.y=g;e.vy*=-0.25;e.vx*=0.5;e.vr*=0.4;if(Math.abs(e.vy)<90){e.vy=0;e.fly=false;e.rest=1;AU.fx('armor');dustPuff(e.x,e.y,6)}}
    for(const o of G.enemies){if(o!==e&&!o.dead&&e.fling&&Math.abs(o.x-e.x)<40&&Math.abs((o.y-50)-(e.y-40))<70){killEnemy(o,sgn(e.vx),true);txt(o.x,o.y-120,'STRIKE!','#9ad8ff')}}}
   else{e.vr=0}if(e.t>1.6)e.alpha-=dt*1.5;continue}
  e.t+=dt;if(e.stun>0)e.stun-=dt;if(e.blockT>0)e.blockT-=dt;
  if(e.st==='rappel'){e.y+=300*dt;const g=groundAt(e.x,e.y-110);if(g!==null&&e.y>=g){e.y=g;e.st='idle';e.rope=0;dustPuff(e.x,e.y,8);AU.fx('land')}continue}
  const dx=p.x-e.x,dist=Math.abs(dx),vis=onScreen(e.x,10)&&!p.dead;
  if(e.type==='guard'){stepGuard(e,dt,dx,dist,vis);continue}
  if(e.stun>0){e.vx*=0.9;moveBody(e,dt);continue}
  if(vis&&dist<760){if(!e.alerted){e.alerted=true;e.cool=Math.min(e.cool,rand(0.5,1.0));if(!G.alarmed&&G.L.theme==='hangar'){G.alarmed=1}}e.face=sgn(dx);anyAlert=true;
   let want=0;if(dist<190)want=-e.face;else if(dist>520)want=e.face;const sp=e.type==='heavy'?55:80;
   if(want&&e.aimT<=0){const nx=e.x+want*30;if(solidUnder(nx,e.y))e.vx=want*sp;else e.vx=0}else e.vx=0;
   if(e.aimT>0){e.aimT-=dt;if(e.aimT<=0){if(e.type==='heavy'){e.burst=3}else{eShoot(e);if(e.type==='shadow'&&Math.random()<0.6)e.burst=1;e.cool=rand(1.3,2.3)}}}
   else if(e.burst>0){e.bt=(e.bt||0)-dt;if(e.bt<=0){eShoot(e,e.type==='heavy'?'heavy':null);e.burst--;e.bt=e.type==='heavy'?0.14:0.2;if(e.burst===0)e.cool=e.type==='heavy'?rand(2.2,2.9):rand(1.4,2.2)}}
   else{e.cool-=dt;if(e.cool<=0&&p.inv<1.6)e.aimT=e.type==='heavy'?0.7:e.type==='shadow'?0.42:0.55}}
  else{/* patrol */e.aimT=0;const tx=e.x0+Math.sin(e.t*0.6)*50;e.vx=clamp((tx-e.x)*2,-45,45);if(Math.abs(e.vx)>5)e.face=sgn(e.vx);if(!solidUnder(e.x+sgn(e.vx)*24,e.y))e.vx=0}
  if(e.fireT>0)e.fireT-=dt;moveBody(e,dt);if(e.y>VH+200)e.dead=true}
 if(G.alarmed===1){G.alarmed=2;G.alarmT=4;AU.fx('alarm')}}
function stepGuard(e,dt,dx,dist,vis){const p=G.p;
 if(e.stun>0){e.vx*=0.9;moveBody(e,dt);e.st='stun';return}
 if(e.st==='stun')e.st='idle';
 if(!vis||dist>620){e.vx=0;moveBody(e,dt);return}
 if(e.st==='idle'||e.st==='walk'){e.face=sgn(dx);if(dist>92){const nx=e.x+e.face*30;e.vx=solidUnder(nx,e.y)?e.face*115:0;e.st='walk'}else{e.vx=0;e.st='wind';e.st_t=0.5;}}
 else if(e.st==='wind'){e.vx=0;e.st_t-=dt;if(e.st_t<=0){e.st='thrust';e.st_t=0.22;AU.fx('swing');e.vx=e.face*260}}
 else if(e.st==='thrust'){e.st_t-=dt;e.vx*=0.85;const hx=e.x+e.face*70;if(Math.abs(p.x-hx)<62&&Math.abs((p.y-50)-(e.y-60))<70&&!e.hitDone){e.hitDone=1;if(p.guard&&p.face===-e.face){clang(hx,e.y-60);p.vx=e.face*240;e.st='open';e.st_t=1.0;e.hitDone=0;txt(e.x,e.y-140,'OPEN!','#ffe27a');return}playerHurt(1,e,e.face)}
  if(e.st_t<=0){e.st='open';e.st_t=0.75;e.hitDone=0}}
 else if(e.st==='open'){e.vx=0;e.st_t-=dt;if(e.st_t<=0)e.st='idle'}
 moveBody(e,dt);if(e.y>VH+200)e.dead=true}
function clang(x,y){sparks(x,y,undefined,18,['#ffffff','#ffd890','#9ad8ff'],380);flashLight(x,y,110,'#ffe0b0',0.18);AU.fx('clash');hitstop(0.05);shake(4)}
function enemyHitBySaber(e,p){
 if(e.type==='guard'&&e.stun<=0&&e.st!=='open'&&p.face===-e.face){clang(e.x+e.face*20,e.y-70);e.blockT=0.3;txt(e.x,e.y-140,'BLOCKED','#ff9a8a');p.vx=-p.face*180;if(!G.guardTip){G.guardTip=1;tip(HINT.guard)}return}
 e.hp--;e.flash=0.12;hitstop(0.045);shake(3);sparks(e.x,e.y-60,p.face>0?0:Math.PI,12,['#ffffff','#9ad8ff','#ffb070'],320);flashLight(e.x,e.y-60,90,'#9ad8ff',0.15);AU.fx('hit');
 if(e.hp<=0)killEnemy(e,p.face);else{e.vx=p.face*160;e.stun=Math.max(e.stun,0.25);AU.fx('armor')}}
function enemyPushed(e,face,str){const k=0.5+str*0.6;
 if(e.type==='guard'){e.stun=1.9;e.vx=face*380*k;e.vy=-200;e.st='stun';e.hp-=1;e.flash=0.15;txt(e.x,e.y-140,'STUNNED!','#9ad8ff');if(e.hp<=0)killEnemy(e,face,false,true);return}
 if(e.type==='heavy'&&e.hp>1){e.hp-=1;e.stun=1.1;e.vx=face*420*k;e.vy=-260;e.flash=0.15;return}
 killEnemy(e,face,false,true,k)}
function killEnemy(e,face,chain,pushed,k){if(e.dead)return;e.dead=true;e.t=0;e.fly=true;e.fling=pushed;k=k||1;
 e.vx=face*(pushed?rand(640,860)*k:rand(180,260));e.vy=pushed?-rand(380,520)*k:-rand(260,360);e.vr=face*(pushed?rand(6,10):rand(3,5));
 run.score+=e.sc*(1+Math.min(4,G.combo));G.combo++;G.comboT=2.2;G.stats.kills++;if(G.combo>=3)txt(e.x,e.y-150,G.combo+'x COMBO!','#ffe27a');
 sparks(e.x,e.y-60,undefined,10,['#ffffff','#ffd27a'],300);smoke(e.x,e.y-60,3,'#c8ccd4',10,40);AU.fx('armor');
 if(Math.random()<0.16)G.pickups.push({type:Math.random()<0.55?'kyber':'force',x:e.x,y:e.y-60,t:0,vy:-300,drop:1})}
/* detonators (Krell / troopers) */
function throwNade(x,y,tx,owner){const t=0.85,dx=tx-x;G.nades.push({x,y,vx:dx/t,vy:-560,fuse:1.6,owner:owner||'e',r:9,t:0});AU.fx('throw')}
function stepNades(dt){for(const n of G.nades){n.t+=dt;n.fuse-=dt;n.vy+=GRAV*0.6*dt;n.x+=n.vx*dt;n.y+=n.vy*dt;const g=groundAt(n.x,n.y-20);if(g!==null&&n.y>=g&&n.vy>0){n.y=g;n.vy*=-0.35;n.vx*=0.6}
  if(Math.floor(n.t*8)!==Math.floor((n.t-dt)*8))AU.fx('detonate');
  if(n.owner==='j'&&G.boss&&!G.boss.dead){const bb=G.boss.hitbox();if(n.x>bb.x&&n.x<bb.x+bb.w&&n.y>bb.y&&n.y<bb.y+bb.h)n.fuse=0}
  if(n.fuse<=0){n.dead=true;explode(n.x,n.y-10);const p=G.p;if(n.owner==='e'&&Math.hypot(p.x-n.x,(p.y-50)-n.y)<90)playerHurt(2,n,sgn(p.x-n.x));
   if(n.owner==='j'){for(const e of G.enemies)if(!e.dead&&Math.hypot(e.x-n.x,(e.y-50)-n.y)<110)killEnemy(e,sgn(e.x-n.x),false,true);if(G.boss&&!G.boss.dead){const B=G.boss;if(Math.hypot(B.x-n.x,(B.y-B.h/2)-n.y)<B.w/2+100)B.damage(3,'nade')}}}}
 G.nades=G.nades.filter(n=>!n.dead&&n.y<VH+300)}
function explodeSmall(x,y){burst(x,y,14,['#fff2c0','#ffb040','#ff5020'],260,0.5,3);smoke(x,y,5,'#4a4446',14,60);flashLight(x,y,120,'#ffa040',0.25);AU.fx('explode');shake(5)}
/* bolts */
function stepBolts(dt){const p=G.p;
 for(const b of G.bolts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(b.life<=0){b.dead=true;continue}
  if(b.owner==='e'){if(!p.dead){const bx=box(p);if(b.x>bx.x-2&&b.x<bx.x+bx.w+2&&b.y>bx.y+4&&b.y<bx.y+bx.h){/* last-moment guard catch */if(p.guard&&sgn(b.vx)===-p.face){deflect(b,0.65);continue}b.dead=true;sparks(b.x,b.y,undefined,8,['#ff9a7a','#fff']);playerHurt(b.dmg||1,b,sgn(b.vx));continue}}}
  else{for(const e of G.enemies){if(e.dead)continue;const eb=box(e);if(b.x>eb.x&&b.x<eb.x+eb.w&&b.y>eb.y&&b.y<eb.y+eb.h){b.dead=true;if(e.type==='guard'&&e.stun<=0&&e.st!=='open'){clang(b.x,b.y);break}e.hp--;e.flash=0.12;if(e.hp<=0){killEnemy(e,sgn(b.vx));run.score+=150;txt(e.x,e.y-130,'DEFLECT KILL!','#ffe27a')}else{AU.fx('armor');sparks(b.x,b.y,undefined,8,['#fff','#ffb070'])}break}}
   if(!b.dead&&G.boss&&!G.boss.dead){const B=G.boss,bb=B.hitbox();if(b.x>bb.x&&b.x<bb.x+bb.w&&b.y>bb.y&&b.y<bb.y+bb.h){b.dead=true;B.onBolt(b)}}}
  if(!b.dead&&G.mode!=='bike'){for(const s of G.solids){if(s.dead||s.kind==='floor'&&b.y<s.y)continue;if(b.x>s.x&&b.x<s.x+s.w&&b.y>s.y&&b.y<s.y+s.h){b.dead=true;sparks(b.x,b.y,undefined,6,['#ffb090','#fff'],200);P({x:b.x,y:b.y,vx:0,vy:0,l:0.25,m:0.25,s:10,c:'#ff6040',add:true,g:0});break}}}
  if(Math.abs(b.x-G.cam.x-viewW/2)>viewW+600||b.y>VH+100||b.y<-400)b.dead=true}
 G.bolts=G.bolts.filter(b=>!b.dead)}

/* ===== bosses ===== */
function bossBase(o){return Object.assign({hp:o.max,flash:0,ifr:0,dead:false,t:0,st:'intro',st_t:1.2,face:-1,say:'',sayT:0,
 hitbox(){return{x:this.x-this.w/2,y:this.y-this.h,w:this.w,h:this.h}},
 aimPt(){return{x:this.x,y:this.y-this.h*0.62}},
 damage(n,src){if(this.dead||this.ifr>0||this.st==='intro')return false;this.hp-=n;this.flash=0.14;this.ifr=0.16;run.score+=60*n;shake(5);hitstop(0.05);AU.fx('hit');
  sparks(this.x,this.y-this.h*0.55,undefined,16,['#ffffff','#ffd27a','#ff8a5a'],360);if(this.hp<=0){this.hp=0;bossDefeated(this)}else if(this.onDamaged)this.onDamaged(n,src);return true},
 onBolt(b){this.damage(1,'bolt')},onSaber(p){this.damage(1,'saber')},onPush(f,s){this.damage(1,'push')},
 bubble(s,t){this.say=s;this.sayT=t||2.2}},o)}
function bossDefeated(B){B.dead=true;B.deadT=0;slowmo(1.6,0.25);screenFlash('#ffffff',0.9);AU.fx('bigboom');shake(22);run.score+=5000;G.stats.boss=1;
 for(let i=0;i<6;i++)setTimeout(()=>{if(G&&G.boss===B)explode(B.x+rand(-60,60),B.y-rand(20,B.h),i===5)},i*260);
 G.bolts.forEach(b=>b.dead=true);G.nades.length=0;G.enemies.forEach(e=>{if(!e.dead)killEnemy(e,sgn(e.x-B.x),false,true)});
 setTimeout(()=>{if(G&&G.boss===B&&!G.clear)levelClear()},B.type==='vexis'?3600:2800)}
function startArena(){const A=G.arena;if(!A||A.on)return;A.on=true;G.camMin=A.x0;G.camMax=Math.max(A.x0,A.x1-viewW);G.letterbox=1;
 const L=G.L;const mk={krell:makeKrell,bucketon:makeBucketon,vexis:makeVexis}[L.boss];G.boss=mk();G.bossIntro=2.4;G.bossCardT=2.4;AU.play(L.boss==='vexis'?'vexis':'boss');AU.fx(L.boss==='bucketon'?'bucket':'alarm');slowmo(0.6,0.5)}
/* ---------------- Commander Krell ---------------- */
function makeKrell(){const A=G.arena;return bossBase({type:'krell',name:'COMMANDER KRELL',max:22,x:A.x1-220,y:GROUND,w:62,h:156,vx:0,vy:0,face:-1,pattern:0,shots:0,
 step(dt){const p=G.p;this.t+=dt;if(this.flash>0)this.flash-=dt;if(this.ifr>0)this.ifr-=dt;if(this.sayT>0)this.sayT-=dt;if(this.dead)return;
  const dx=p.x-this.x;if(this.st!=='charge')this.face=sgn(dx);this.st_t-=dt;
  if(this.st==='intro'){if(this.st_t<=0){this.st='idle';this.st_t=0.8;this.bubble('Rebel scum! Take him down!')}}
  else if(this.st==='idle'){const d=Math.abs(dx);let want=d<280?-this.face:d>520?this.face:0;this.vx=want*90;if(this.st_t<=0){const opts=['burst','burst','nade','charge'];if(G.enemies.filter(e=>!e.dead).length<2&&this.hp<this.max*0.75)opts.push('call');this.st=opts[this.pattern++%opts.length===0?0:Math.floor(Math.random()*opts.length)];
    this.st_t=this.st==='burst'?0.75:this.st==='nade'?0.5:this.st==='charge'?0.6:0.6;this.shots=0;this.vx=0;if(this.st==='charge'){this.bubble('CHAAARGE!',1);txt(this.x,this.y-190,'!','#ff5a4a',1)}if(this.st==='call'){this.bubble('Reinforcements! NOW!',1.6);AU.fx('alarm')}}}
  else if(this.st==='burst'){this.vx=0;if(this.st_t<=0){const n=this.hp<this.max*0.5?7:5;this.fireT=(this.fireT||0)-dt;if(this.fireT<=0){const hi=this.shots%2===0;this.shootAt(hi?p.y-70:this.y-24);this.shots++;this.fireT=0.15;if(this.shots>=n){this.st='idle';this.st_t=rand(1.0,1.6)}}}}
  else if(this.st==='nade'){if(this.st_t<=0){throwNade(this.x+this.face*30,this.y-120,p.x+rand(-40,40));if(this.hp<this.max*0.6)setTimeout(()=>{if(!this.dead&&G.boss===this)throwNade(this.x+this.face*30,this.y-120,p.x+p.vx*0.5)},350);this.st='idle';this.st_t=1.4}}
  else if(this.st==='charge'){if(this.st_t<=0&&!this.charging){this.charging=1;this.vx=this.face*470;AU.fx('heavy')}if(this.charging){if(Math.abs(p.x-this.x)<56&&Math.abs(p.y-this.y)<120){if(p.guard&&p.face===-this.face){clang(this.x+this.face*30,this.y-80);this.st='open';this.st_t=1.4;this.vx=-this.face*160;this.charging=0;txt(this.x,this.y-190,'STAGGERED!','#ffe27a');return}playerHurt(1,this,this.face);this.charging=0;this.st='idle';this.st_t=1;this.vx=0}
    if(this.st_t<-0.95||this.hitWall){this.charging=0;this.st='open';this.st_t=0.9;this.vx=0;if(this.hitWall){shake(8);txt(this.x,this.y-190,'DAZED!','#ffe27a')}}}}
  else if(this.st==='call'){if(this.st_t<=0){const A=G.arena;[A.x1-60,A.x0+60].forEach((x,i)=>{const e=spawnEnemy({type:'trooper',x,st:'rappel'});});this.st='idle';this.st_t=1.4}}
  else if(this.st==='open'||this.st==='stagger'){this.vx*=0.9;if(this.st_t<=0){this.st='idle';this.st_t=0.8}}
  this.hitWall=0;moveBody(this,dt);this.x=clamp(this.x,G.arena.x0+50,G.arena.x1-50)},
 shootAt(ty){const mx=this.x+this.face*70,my=this.y-92;const a=Math.atan2(ty-my,(this.face*400));G.bolts.push({x:mx,y:my,vx:Math.cos(a)*560*this.face/Math.abs(Math.cos(a))*Math.abs(Math.cos(a)),vy:Math.sin(a)*560,owner:'e',life:3,col:'#ff2a1a',len:34,w:5});
  G.bolts[G.bolts.length-1].vx=this.face*Math.abs(Math.cos(a))*560;AU.fx('heavy');flashLight(mx,my,80,'#ff5030',0.12);this.fireT2=0.1},
 onSaber(p){const dm=this.st==='open'||this.st==='stagger'?2:1;this.damage(dm,'saber');if(dm>1)txt(this.x,this.y-180,'CRITICAL!','#ffe27a')},
 onPush(f){if(this.damage(1,'push')){this.st='stagger';this.st_t=0.8;this.vx=f*320;this.charging=0}},
 onDamaged(){if(this.hp===Math.floor(this.max/2))this.bubble('You... you will pay for that!')},
 reset(){this.hp=Math.min(this.max,this.hp+3);this.st='idle';this.st_t=1.5;this.x=G.arena.x1-220;G.enemies.forEach(e=>{if(!e.dead&&e.st!=='rappel')e.dead=true})},
 draw(){const sc=JSC*1.48;const fr=this.st==='open'||this.st==='stagger'?'st_fly':(this.fireT2>0||this.st==='burst'&&this.st_t<=0)?'st_heavy':'st_heavy';this.fireT2=(this.fireT2||0)-1/60;
  const bob=this.st==='idle'?Math.sin(this.t*6)*1.5:0;const img=null;
  if(fr==='st_fly'){drawSpr('st_fly',this.x,this.y,sc*0.95,this.face>0,{flash:this.flash,rot:-this.face*0.15,tint:tinted('st_fly','#c02018',0.14)})}else{const mv=Math.abs(this.vx)>10&&!this.dead,amp=lrStep(this,undefined,mv,this.vx*(this.face||1),110);if(!((mv||amp>0.15)&&drawFrontRig(this,'stc_body',this.x,this.y,sc,this.face>0,{flash:this.flash},amp*clamp(Math.abs(this.vx)/90,0.7,1.15),false)))drawSpr('st_cmd',this.x,this.y+bob,sc,this.face>0,{flash:this.flash,tint:img})}
  if(this.st==='burst'&&this.st_t>0){aimLine(this.x+this.face*70,this.y-92,this.face,this.st_t)}
  if(this.st==='charge'&&this.st_t>0){c.globalAlpha=0.5+0.5*Math.sin(G.t*30);glowCircle(this.x,this.y-150,30,'#ff3020');c.globalAlpha=1}}})}
function aimLine(x,y,face,t){c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,40,30,'+(0.25+0.3*Math.sin(G.t*40))+')';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x+face*900,y+10);c.stroke();c.restore()}
/* ---------------- Lord Bucketon ---------------- */
function makeBucketon(){const A=G.arena;return bossBase({type:'bucketon',name:'LORD BUCKETON',max:26,x:A.x1-260,y:250,hx:A.x1-260,hy:250,w:84,h:120,face:-1,visor:0,
 hitbox(){return{x:this.x-44,y:this.y-118,w:88,h:150}},aimPt(){return{x:this.x,y:this.y-70}},
 step(dt){const p=G.p,A=G.arena;this.t+=dt;if(this.flash>0)this.flash-=dt;if(this.ifr>0)this.ifr-=dt;if(this.sayT>0)this.sayT-=dt;if(this.visor>0)this.visor-=dt;if(this.dead){this.y+=120*dt;return}
  this.face=sgn(p.x-this.x);this.st_t-=dt;const rage=this.hp<this.max*0.45;
  if(this.st==='intro'){this.y=lerp(this.y,230,0.05);if(this.st_t<=0){this.st='move';this.st_t=1.6;this.bubble('YOU AGAIN?! My new bucket is twice as shiny!',2.6);AU.fx('laugh')}}
  else if(this.st==='move'){this.hx=A.x0+200+(A.x1-A.x0-400)*(0.5+0.5*Math.sin(this.t*0.55));this.hy=210+Math.sin(this.t*1.7)*40;this.x=lerp(this.x,this.hx,0.03);this.y=lerp(this.y,this.hy,0.05);
   if(this.st_t<=0){const r=Math.random();this.st=r<0.42?'triple':r<0.7?'mines':'swoop';this.st_t=this.st==='swoop'?0.7:0.55;this.n=0;if(this.st==='swoop'){txt(this.x,this.y-150,'!','#ff5a4a',1);this.bubble('BUCKET BASH!',1)}}}
  else if(this.st==='triple'){if(this.st_t<=0){this.ft=(this.ft||0)-dt;if(this.ft<=0){this.ft=0.32;this.n++;const mx=this.x+this.face*40,my=this.y-58;const base=Math.atan2(p.y-60-my,p.x-mx);[-0.16,0,0.16].forEach(o=>{if(!rage&&o!==0&&this.n%2)return;G.bolts.push({x:mx,y:my,vx:Math.cos(base+o)*500,vy:Math.sin(base+o)*500,owner:'e',life:3,col:'#ff2050',len:24,w:4})});AU.fx('blaster');
     if(this.n>=(rage?4:3)){this.st='visor';this.st_t=1.5;this.visor=1.5;AU.fx('bucket');this.bubble(['Phew, it gets hot in here...','Let me just wipe my mustache...','Hot hot hot!'][Math.floor(Math.random()*3)],1.4)}}}}
  else if(this.st==='mines'){this.x=lerp(this.x,p.x,0.02);if(this.st_t<=0){this.ft=(this.ft||0)-dt;if(this.ft<=0){this.ft=0.35;this.n++;G.nades.push({x:this.x,y:this.y+10,vx:rand(-90,90),vy:-120,fuse:2.1,owner:'e',r:10,t:0,mine:1});AU.fx('detonate');if(this.n>=(rage?4:3)){this.st='move';this.st_t=rand(1.4,2)}}}}
  else if(this.st==='swoop'){if(this.st_t>0){this.y=lerp(this.y,160,0.08)}else{if(!this.sw){this.sw={x0:this.x,dir:sgn(p.x-this.x),t:0}}const s=this.sw;s.t+=dt;const T=1.5;const k=s.t/T;this.x=s.x0+s.dir*k*720;this.y=160+Math.sin(Math.min(1,k)*Math.PI)*(GROUND-120-160);
    this.x=clamp(this.x,A.x0+60,A.x1-60);if(Math.abs(p.x-this.x)<60&&Math.abs((p.y-50)-(this.y-30))<70){if(p.guard&&p.face===-s.dir){clang(this.x,this.y-30);this.damage(1,'block')}else playerHurt(1,this,s.dir)}
    if(k>=1){this.sw=null;this.st='visor';this.st_t=1.6;this.visor=1.6;this.bubble('Dizzy... so dizzy...',1.2)}}}
  else if(this.st==='visor'){this.y=lerp(this.y,330,0.04);if(this.st_t<=0){this.st='move';this.st_t=rand(1.5,2.4)}}
  else if(this.st==='bonk'){this.vy=(this.vy||0)+900*dt;this.x+=(this.vx||0)*dt;this.vx*=0.96;this.y=Math.min(this.y+this.vy*dt,GROUND-40);if(this.st_t<=0){this.st='move';this.st_t=1.2;this.vy=0}}
  if(Math.random()<dt*6)P({x:this.x+rand(-30,30),y:this.y+22,vx:rand(-20,20),vy:rand(80,160),l:0.4,m:0.4,s:rand(3,6),c:'#ff5ae0',add:true,g:0})},
 onBolt(b){if(this.visor>0){this.damage(2,'bolt');txt(this.x,this.y-150,'BULLSEYE!','#ffe27a');AU.fx('bucket')}else{this.damage(1,'bolt');AU.fx('bucket')}},
 onSaber(p){const ok=this.damage(this.visor>0?2:1,'saber');if(ok&&this.visor>0)this.bubble('OW! My mustache!',1)},
 onPush(f,s){if(this.damage(1,'push')){this.st='bonk';this.st_t=0.9;this.vx=f*500;this.vy=-200;this.bubble('WHOAAA!',0.9)}},
 onDamaged(){if(this.hp<=this.max*0.45&&!this.raged){this.raged=1;this.bubble('NOW I\'M REALLY STEAMED!',2);AU.fx('laugh')}},
 reset(){this.hp=Math.min(this.max,this.hp+3);this.st='move';this.st_t=2;this.x=G.arena.x1-260;this.y=240;G.nades.length=0},
 draw(){const open=this.visor>0;const tilt=this.st==='swoop'?this.sw?this.sw.dir*-0.25:0:this.st==='bonk'?Math.sin(this.t*20)*0.3:Math.sin(this.t*2)*0.05;
  glowCircle(this.x,this.y+20,60,'rgba(255,80,220,0.35)');drawSpr(open?'buck_open':'buck',this.x,this.y+40,0.5,this.face>0,{flash:this.flash,rot:tilt});
  if(this.st==='swoop'&&this.st_t>0){c.globalAlpha=0.6+0.4*Math.sin(G.t*30);glowCircle(this.x,this.y-150,26,'#ff3020');c.globalAlpha=1}}})}
/* ---------------- Darth Vexis ---------------- */
function makeVexis(){const A=G.arena;return bossBase({type:'vexis',name:'DARTH VEXIS',max:48,x:A.x1-260,y:GROUND,w:52,h:152,vx:0,vy:0,face:-1,phase:1,combo:0,fr:'sith_idle',
 step(dt){const p=G.p;this.t+=dt;if(this.flash>0)this.flash-=dt;if(this.ifr>0)this.ifr-=dt;if(this.sayT>0)this.sayT-=dt;if(this.dead){this.fr='sith_hurt';return}
  const dx=p.x-this.x,d=Math.abs(dx);this.st_t-=dt;const ph=this.phase;
  if(this.st!=='dash'&&this.st!=='strike')this.face=sgn(dx);
  if(this.st==='intro'){this.fr='sith_idle';if(this.st_t<=0){this.st='stalk';this.st_t=1;this.bubble('So... the old man comes to me at last.',2.6)}}
  else if(this.st==='stalk'){this.fr='sith_idle';this.vx=d>140?this.face*(ph===3?190:130):0;if(d<=150&&this.st_t<=0){this.st='wind';this.st_t=ph===3?0.28:0.38;this.combo=ph===1?2:3;AU.fx('lock')}
   else if(this.st_t<=0&&d>150){const r=Math.random();if(ph>=2&&r<0.3){this.st='lightning';this.st_t=0.75;this.bubble('Feel the power of the dark side!',1.6)}else if(ph>=2&&r<0.55&&!G.thrown.some(o=>!o.dead)){this.st='debris';this.st_t=1.0;this.liftDebris()}else if(ph===3&&r<0.75){this.st='dash';this.st_t=0.35;smoke(this.x,this.y-70,14,'#2a1020',24,40)}else this.st_t=0.5}}
  else if(this.st==='wind'){this.vx=0;this.fr='sith_idle';if(this.st_t<=0){this.st='strike';this.st_t=0.18;this.vx=this.face*360;AU.fx('swing');this.hitDone=0}}
  else if(this.st==='strike'){this.fr='sith_slash';this.vx*=0.88;const hx=this.x+this.face*70;
   if(!this.hitDone&&Math.abs(p.x-hx)<80&&Math.abs(p.y-this.y)<130){this.hitDone=1;
    if(p.slashT>0&&ph>=2&&Math.random()<0.5){startLock(this);return}
    if((p.guard||p.slashT>0)&&p.face===-this.face){clang((p.x+this.x)/2,this.y-90);p.vx=this.face*260;this.vx=-this.face*120}else playerHurt(1,this,this.face)}
   if(this.st_t<=0){this.combo--;if(this.combo>0){this.st='wind';this.st_t=ph===3?0.22:0.3}else{this.st='open';this.st_t=ph===3?0.7:0.95;txt(this.x,this.y-190,'OPEN!','#ffe27a')}}}
  else if(this.st==='open'){this.fr='sith_hurt';this.vx*=0.85;if(this.st_t<=0){this.st='stalk';this.st_t=rand(0.6,1.2)}}
  else if(this.st==='lightning'){this.vx=0;this.fr='sith_light';if(this.st_t<=0&&!this.zap){this.zap=1.9;AU.fx('lightning')}
   if(this.zap){this.zap-=dt;this.zt=(this.zt||0)-dt;if(this.zt<=0){this.zt=0.12;AU.fx('lightning')}const blocked=p.guard&&p.face===-this.face;
    if(blocked){p.vx=this.face*70;if(Math.random()<0.5)sparks(p.x+p.face*30,p.y-100,undefined,3,['#e8d0ff','#ffffff'],200)}else{this.zd=(this.zd||0)-dt;if(this.zd<=0){this.zd=0.45;playerHurt(1,this,this.face)}}
    if(this.zap<=0){this.zap=0;this.st='open';this.st_t=1.1;this.bubble('Impossible...',1)}}}
  else if(this.st==='debris'){this.fr='sith_light';this.vx=0;for(const o of G.thrown){if(o.held&&o.owner==='e'){o.x=lerp(o.x,o.hx,0.08);o.y=lerp(o.y,o.hy+Math.sin(G.t*4+o.ph)*8,0.08)}}
   if(this.st_t<=0){const o=G.thrown.find(o=>o.held&&o.owner==='e');if(o){o.held=0;const a=Math.atan2(p.y-60-o.y,p.x-o.x);o.vx=Math.cos(a)*620;o.vy=Math.sin(a)*620;AU.fx('throw');this.st_t=0.7}else{this.st='open';this.st_t=0.9}}}
  else if(this.st==='dash'){this.vx=0;this.fr='sith_idle';this.alpha=Math.max(0,this.st_t/0.35);if(this.st_t<=0){this.x=clamp(p.x-p.face*120,G.arena.x0+60,G.arena.x1-60);this.alpha=1;smoke(this.x,this.y-70,14,'#2a1020',24,40);this.face=sgn(p.x-this.x);this.st='wind';this.st_t=0.32;this.combo=2;AU.fx('lock')}}
  else if(this.st==='lockhold'){this.fr='sith_slash';this.vx=0}
  else if(this.st==='knock'){this.fr='sith_hurt';this.vx*=0.9;if(this.st_t<=0){this.st='stalk';this.st_t=0.8}}
  if(this.st!=='lockhold')moveBody(this,dt);this.x=clamp(this.x,G.arena.x0+40,G.arena.x1-40);
  if(ph===1&&this.hp<=32){this.phase=2;this.bubble('Enough! Now you face my true power!',2.2);shake(10);AU.fx('laugh');ring(this.x,this.y-80,'#ff2040',120,0.6,10)}
  if(ph===2&&this.hp<=16){this.phase=3;this.bubble('GUARDS! Destroy him!',2);shake(12);ring(this.x,this.y-80,'#ff2040',160,0.6,12);const A=G.arena;spawnEnemy({type:'guard',x:A.x0+80});spawnEnemy({type:'shadow',x:A.x1-60,st:'rappel'})}},
 liftDebris(){const A=G.arena;for(let i=0;i<(this.phase===3?3:2);i++){const x=this.x+rand(-200,200);G.thrown.push({x:clamp(x,A.x0+60,A.x1-60),y:GROUND-20,hx:this.x+(i-0.5)*110,hy:200-i*30,vx:0,vy:0,r:28,owner:'e',held:1,rot:rand(0,6),vr:rand(-3,3),ph:i*2,kind:i%2?'chunk':'crate'})}AU.fx('force')},
 onSaber(p){if(this.st==='open'||this.st==='knock'||this.st==='lightning'&&this.zap>0||this.st==='debris'){this.damage(2,'saber');return}
  if(Math.random()<0.55){clang(this.x+this.face*30,this.y-90);if(Math.random()<0.3)this.bubble(['Predictable.','Is that all?','Your skills are weak, old man!'][Math.floor(Math.random()*3)],1.2);if(this.st==='stalk'){this.st='wind';this.st_t=0.3;this.combo=1}}else this.damage(1,'saber')},
 onBolt(b){if(this.st==='open'||this.st==='knock'){this.damage(1,'bolt');return}const p=G.p;const nb={x:b.x,y:b.y,vx:-b.vx,vy:(p.y-60-b.y)*1.2,owner:'e',life:2,col:b.col,len:b.len,w:b.w};G.bolts.push(nb);clang(b.x,b.y);txt(this.x,this.y-180,'He sends it back!','#ff9a8a')},
 onPush(f,s){if(this.st==='open'||this.st==='lightning'&&this.zap>0){if(this.damage(2,'push')){this.st='knock';this.st_t=1;this.vx=f*420;this.zap=0}}else{this.vx=f*160;txt(this.x,this.y-180,'Your Force is weak!','#ff9a8a')}},
 reset(){this.hp=Math.min(this.max,this.hp+4);this.st='stalk';this.st_t=1.5;this.x=G.arena.x1-260;G.thrown.length=0;G.lock=null},
 draw(){const fr=this.fr;const sc=0.385;c.globalAlpha=this.alpha===undefined?1:this.alpha;
  /* red aura */glowCircle(this.x,this.y-80,110,'rgba(255,20,40,'+(0.12+0.05*Math.sin(G.t*3))+')');
  {const mv=fr==='sith_idle'&&Math.abs(this.vx)>10&&!this.dead,amp=lrStep(this,undefined,mv,this.vx*(this.face||1),120);if(!(fr==='sith_idle'&&(mv||amp>0.15)&&drawVexisRig(this,this.x,this.y,sc,this.face>0,{flash:this.flash},amp)))drawSpr(fr,this.x,this.y,sc,this.face>0,{flash:this.flash})}
  const h=this.hand();const ang=this.bladeAng();if(!this.dead)drawBlade(h.x,h.y,ang,86,'#ff1a2a',this.st==='wind'?1.4:1);
  if(this.st==='wind'){c.globalCompositeOperation='lighter';glowCircle(h.x+Math.cos(ang)*86,h.y+Math.sin(ang)*86,20+10*Math.sin(G.t*40),'rgba(255,240,240,0.8)');c.globalCompositeOperation='source-over'}
  if(this.st==='lightning'&&this.zap>0){const lh=this.lhand(),p=G.p;const blocked=p.guard&&p.face===-this.face;const tx=blocked?p.x+p.face*30:p.x,ty=blocked?p.y-100:p.y-60;lightning(lh.x,lh.y,tx,ty)}
  else if(this.st==='lightning'){const lh=this.lhand();glowCircle(lh.x,lh.y,30+10*Math.sin(G.t*30),'rgba(200,160,255,0.7)')}
  c.globalAlpha=1},
 hand(){const fr=this.fr,sc=0.385,m=META[fr]||{ax:150,h:400};const H={sith_idle:[77,137],sith_slash:[72,71],sith_light:[118,141],sith_hurt:[31,131]}[fr]||[77,137];let hx=(H[0]-m.ax)*sc,hy=(H[1]-m.h)*sc;if(this.face>0)hx=-hx;return{x:this.x+hx,y:this.y+hy}},
 lhand(){const m=META.sith_light||{ax:210,h:346},sc=0.385;let hx=(100-m.ax)*sc,hy=(67-m.h)*sc;if(this.face>0)hx=-hx;return{x:this.x+hx,y:this.y+hy}},
 bladeAng(){const f=this.face;let a;if(this.st==='strike'||this.st==='lockhold')a=f>0?0.15:Math.PI-0.15;else if(this.st==='wind')a=f>0?-2.2:Math.PI+2.2;else if(this.fr==='sith_hurt')a=f>0?-1.9:Math.PI+1.9;else a=f>0?2.0:Math.PI-2.0;return a}})}
function startLock(B){const p=G.p;G.lock={B,t:2.8,m:0.5,mc:mashCount};B.st='lockhold';p.lockT=3;p.guard=false;p.slashT=0;p.x=B.x+B.face*95;p.face=-B.face;AU.fx('clash');shake(10);slowmo(0.4,0.4);tip(TOUCHDEV?'BLADE LOCK! Tap SABER fast!':'BLADE LOCK! Tap J fast!')}
function stepLock(dt){const L=G.lock;if(!L)return;const p=G.p,B=L.B;L.t-=dt;const taps=mashCount-L.mc;L.mc=mashCount;L.m+=taps*0.085-dt*0.24;if(window.__BOT)L.m+=dt*0.5;
 if(Math.random()<0.6){const x=(p.x+B.x)/2,y=p.y-96;sparks(x,y,-Math.PI/2+rand(-1,1),2,['#ffffff','#ffb0ff','#9ad8ff'],300)}
 if(L.m>=1||L.t<=0&&L.m>=0.5){G.lock=null;p.lockT=0;B.st='knock';B.st_t=1.2;B.vx=p.face*480;B.ifr=0;B.damage(4,'lock');txt(B.x,B.y-190,'OVERPOWERED!','#9ad8ff',1);shake(14);screenFlash('#bfe0ff',0.5)}
 else if(L.m<=0||L.t<=0){G.lock=null;p.lockT=0;B.st='stalk';B.st_t=1;p.inv=0;playerHurt(1,B,B.face);txt(p.x,p.y-150,'OVERPOWERED...','#ff9a8a')}}
/* thrown debris */
function stepThrown(dt){const p=G.p;for(const o of G.thrown){if(o.dead||o.held)continue;o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=o.vr*dt*3;
 if(o.owner==='e'&&Math.hypot(p.x-o.x,(p.y-55)-o.y)<o.r+30){o.dead=true;explodeSmall(o.x,o.y);if(!(p.guard&&p.face===-sgn(o.vx)))playerHurt(1,o,sgn(o.vx));else txt(p.x,p.y-140,'BLOCKED!','#9ad8ff')}
 if(o.owner==='j'&&G.boss&&!G.boss.dead){const bb=G.boss.hitbox();if(o.x>bb.x-o.r&&o.x<bb.x+bb.w+o.r&&o.y>bb.y-o.r&&o.y<bb.y+bb.h+o.r){o.dead=true;explodeSmall(o.x,o.y);G.boss.ifr=0;G.boss.damage(3,'debris');G.boss.st='knock';G.boss.st_t=1;txt(G.boss.x,G.boss.y-190,'DIRECT HIT!','#9ad8ff',1)}}
 if(o.y>GROUND+20||o.x<G.cam.x-300||o.x>G.cam.x+viewW+300||o.y<-300){o.dead=true;if(o.y>GROUND)explodeSmall(o.x,GROUND-10)}}
 G.thrown=G.thrown.filter(o=>!o.dead)}

/* ===== speeder bike chase (pseudo-depth lanes) ===== */
const BK={y0:330,y1:520,base:610,min:470,max:770,steer:310};
function ds(y){return 0.72+(y-BK.y0)/(BK.y1-BK.y0)*0.38}
function startBike(){const p=G.p;p.y=430;p.x=0;p.vx=BK.base;p.z=0;p.vz=0;G.scouts=[];G.obs=G.obs||[]}
function stepBike(dt){const p=G.p;if(p.dead){p.deadT-=dt;p.vx*=0.98;p.x+=p.vx*dt;if(p.deadT<=0)respawnBike();return}
 if(p.inv>0)p.inv-=dt;if(p.hurtT>0)p.hurtT-=dt;if(p.pushT>0)p.pushT-=dt;p.force=Math.min(100,p.force+JT.regen*dt);
 const walker=G.boss&&!G.boss.dead;
 let tv=BK.base+(inp.R?110:inp.sx>0.3?inp.sx*120:0)-(inp.L?130:inp.sx<-0.3?-inp.sx*130:0);if(G.boss&&G.boss.dead)tv=BK.base*0.8;
 p.vx=lerp(p.vx,clamp(tv,BK.min,BK.max)*(p.hurtT>0?0.75:1),0.05);
 let sy=K.U||K.D?((K.D?1:0)-(K.U?1:0)):(Math.abs(inp.sy)>0.12?inp.sy:0);if(inp.U&&!K.U&&!sy)sy=-1;if(inp.D&&!K.D&&!sy)sy=1;
 p.vy=lerp(p.vy||0,sy*BK.steer,0.2);p.y=clamp(p.y+p.vy*dt,BK.y0,BK.y1);p.x+=p.vx*dt;
 if(inp.jumpP&&p.z<=0){p.vz=520;AU.fx('jump')}if(p.z>0||p.vz>0){p.vz-=1500*dt;p.z=Math.max(0,p.z+p.vz*dt);if(p.z===0){p.vz=0;AU.fx('land')}}
 if(inp.saberP){p.slashT=JT.slash;p.slashN=p.slashN%3+1;p.slashId++;p.hitSet=new Set();AU.fx('swing')}
 if(inp.saber){p.holdT+=dt;if(p.holdT>0.2&&p.slashT<=0)p.guard=true}else{p.guard=false;p.holdT=0}
 if(p.slashT>0){p.slashT-=dt;bikeSlash()}if(inp.forceP)doPush();
 if(p.guard){for(const b of G.bolts){if(b.owner==='e'&&Math.hypot(b.x-p.x,b.y-(p.y-p.z-60))<95)deflect(b,1)}}
 /* obstacles */
 for(const o of G.obs){if(o.hit)continue;const dx=o.x-p.x;if(dx<-200||dx>200)continue;const dy=Math.abs(o.y-p.y);
  if(o.type==='tree'){if(dy<20&&dx>-70-o.w/2&&dx<85+o.w/2){o.hit=1;bikeCrash(o)}}
  else{if(dy<22&&dx>-80&&dx<90&&p.z<16){o.hit=1;bikeCrash(o)}}}
 /* scouts */
 stepScouts(dt);
 if(p.x>G.bikeLen&&!G.arena){G.arena={x0:0,x1:1e9,on:false};startWalker()}
 AU.humSet(true,clamp((p.slashT>0?1:0)+0.25,0,1))}
function bikeCrash(o){const p=G.p;if(o.type==='log'||o.type==='rock'){burst(o.x,o.y-15,16,['#8a6a3a','#c8a060','#5a4020'],300,0.6,4,false,900);o.broken=1}else{sparks(p.x+60,p.y-40,Math.PI,14,['#fff','#ffd27a'])}
 if(playerHurt(1,o,-1)){p.vx*=0.6;shake(12);AU.fx('explode')}}
function respawnBike(){const p=G.p;if(run.lives<0){gameOver();return}p.dead=false;p.hp=p.maxHp;p.inv=2.5;p.z=0;p.y=430;p.vx=BK.base;G.bolts.length=0;
 for(const o of G.obs)if(o.x>p.x-200&&o.x<p.x+900)o.hit=1;if(G.boss&&G.boss.reset)G.boss.reset()}
function bikeSlash(){const p=G.p;const prog=1-p.slashT/JT.slash;if(prog<0.1||prog>0.8)return;
 for(const s of G.scouts){if(s.st==='crash'||p.hitSet.has(s))continue;const dx=s.x-p.x,dy=s.y-p.y;if(Math.abs(dx)<150&&Math.abs(dy)<60){p.hitSet.add(s);scoutCrash(s,sgn(dy||1));hitstop(0.05);sparks(s.x,s.y-50,undefined,14,['#fff','#9ad8ff']);AU.fx('hit');txt(s.x,s.y-110,'SLICED!','#9ad8ff')}}
 for(const b of G.bolts){if(b.owner==='e'&&Math.hypot(b.x-p.x,b.y-(p.y-p.z-60))<120)deflect(b,1)}}
function bikePush(){const p=G.p;for(const s of G.scouts){if(s.st==='crash')continue;const dx=s.x-p.x;if(dx>-60&&dx<420&&Math.abs(s.y-p.y)<140){scoutCrash(s,sgn(s.y-p.y||1));txt(s.x,s.y-110,'FORCE!','#9ad8ff')}}}
function spawnScouts(n){const p=G.p;for(let i=0;i<n;i++){const y=BK.y0+20+Math.random()*(BK.y1-BK.y0-40);G.scouts.push({x:G.cam.x-200-i*140,y,vy:0,vx:p.vx+260,st:'approach',t:0,cool:rand(1,2),off:rand(-40,220),hp:1})}AU.fx('blasterFar')}
function scoutCrash(s,dir){s.st='crash';s.t=0;s.vy=dir*260;run.score+=200*(1+Math.min(4,G.combo));G.combo++;G.comboT=2.5;G.stats.kills++}
function stepScouts(dt){const p=G.p;for(const s of G.scouts){s.t+=dt;
 if(s.st==='crash'){s.vx*=0.985;s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot=(s.rot||0)+dt*4*sgn(s.vy);smoke(s.x-40,s.y-30,1,'#3a3436',10,30);if(s.t>0.55&&!s.boom){s.boom=1;explode(s.x,s.y-30)}continue}
 const tx=p.x+s.off;if(s.st==='approach'){s.vx=p.vx+260;if(s.x>tx-30){s.st='ride'}}else{s.vx=p.vx+clamp((tx-s.x)*1.5,-200,200)}
 s.x+=s.vx*dt;const ty=Math.abs(s.x-p.x)<160&&s.t%5<2.2?p.y:s.y+(s.wy||0);s.wy=Math.sin(s.t*1.3)*30;s.vy=clamp((ty-s.y)*2,-170,170);s.y=clamp(s.y+s.vy*dt,BK.y0,BK.y1);
 for(const o of G.obs){if(o.type==='tree'&&Math.abs(o.x-s.x)<40&&Math.abs(o.y-s.y)<20){scoutCrash(s,1);txt(s.x,s.y-110,'TREE!','#ffd27a');break}}
 if(s.st!=='ride')continue;
 if(Math.abs(s.x-p.x)<120&&Math.abs(s.y-p.y)<22&&p.z<20&&p.inv<=0){playerHurt(1,s,sgn(p.x-s.x));s.vy=sgn(s.y-p.y||1)*-300;s.y+=sgn(s.y-p.y||1)*40}
 s.cool-=dt;if(s.cool<=0&&s.x<p.x-60){s.cool=rand(1.4,2.4);const a=Math.atan2((p.y-p.z-55)-(s.y-55),p.x-s.x);G.bolts.push({x:s.x+60,y:s.y-55,vx:p.vx+Math.cos(a)*520,vy:Math.sin(a)*520,owner:'e',life:2.5,col:'#ff2a1a',len:26,w:3.6});AU.fx('blaster')}
 else if(s.cool<=0&&s.x>p.x+80){s.cool=rand(1.6,2.6);const a=Math.atan2((p.y-p.z-55)-(s.y-55),p.x-s.x);G.bolts.push({x:s.x-60,y:s.y-55,vx:p.vx+Math.cos(a)*420,vy:Math.sin(a)*420,owner:'e',life:2.5,col:'#ff2a1a',len:26,w:3.6});AU.fx('blaster')}}
 G.scouts=G.scouts.filter(s=>!(s.boom&&s.t>1.2)&&s.x>G.cam.x-700)}
/* ---------------- walker boss ---------------- */
function startWalker(){G.letterbox=1;G.boss=makeWalker();G.bossIntro=2.4;G.bossCardT=2.4;AU.play('boss');AU.fx('stomp');G.scouts.forEach(s=>{if(s.st!=='crash')scoutCrash(s,1)})}
function makeWalker(){const WB=bossBase({type:'walker',name:'AT-ST "IRONSTRIDE"',max:16,rel:1.25,y:360,w:200,h:330,face:-1,
 hitbox(){const sc=this.sc();return{x:this.x-110*sc,y:this.y-330*sc,w:200*sc,h:150*sc}},aimPt(){const sc=this.sc();return{x:this.x-20*sc,y:this.y-270*sc}},
 sc(){return portrait?0.72:0.95},
 step(dt){const p=G.p;this.t+=dt;if(this.flash>0)this.flash-=dt;if(this.ifr>0)this.ifr-=dt;if(this.sayT>0)this.sayT-=dt;if(this.dead){this.fall=(this.fall||0)+dt;return}
  const target=portrait?0.74:0.76;this.rel=lerp(this.rel,target,0.02);this.st_t-=dt;const sc=this.sc();
  if(Math.floor(this.t*1.6)!==Math.floor((this.t-dt)*1.6)){AU.fx('stomp');shake(4)}
  if(this.st==='intro'){if(this.st_t<=0){this.st='idle';this.st_t=1}}
  else if(this.st==='idle'){if(this.st_t<=0){this.st=Math.random()<0.7?'aim':'stompA';this.st_t=this.st==='aim'?0.7:0.6;this.n=0}}
  else if(this.st==='aim'){if(this.st_t<=0){this.ft=(this.ft||0)-dt;if(this.ft<=0){this.ft=0.22;this.n++;const mx=this.x-120*sc,my=this.y-250*sc;const a=Math.atan2((p.y-p.z-55)-my,p.x-mx);G.bolts.push({x:mx,y:my,vx:p.vx+Math.cos(a)*560,vy:Math.sin(a)*560,owner:'e',life:3,col:'#ff2a1a',len:36,w:5});AU.fx('heavy');flashLight(mx,my,90,'#ff5030',0.12);
     if(this.n>=(this.hp<8?4:2)){this.st='idle';this.st_t=rand(1.1,1.7)}}}}
  else if(this.st==='stompA'){if(this.st_t<=0){this.st='idle';this.st_t=1.4;G.waves2=G.waves2||[];G.waves2.push({x:this.x-60,y:p.y,t:0});AU.fx('stomp');shake(10);txt(this.x-60,p.y-60,'JUMP!','#ffe27a')}}
  /* homing for reflected bolts */
  for(const b of G.bolts){if(b.owner==='j'){const a=this.aimPt();const ang=Math.atan2(a.y-b.y,a.x-b.x);const sp=Math.hypot(b.vx-p.vx,b.vy)+0.1;b.vx=lerp(b.vx,p.vx+Math.cos(ang)*Math.max(sp,700),0.15);b.vy=lerp(b.vy,Math.sin(ang)*Math.max(sp,700),0.15);b.life=Math.max(b.life,0.5)}}
  if(G.waves2)for(const w of G.waves2){w.t+=dt;w.x-=(560-0)*dt;if(!w.hit&&Math.abs(w.x-p.x)<40&&Math.abs(w.y-p.y)<34&&p.z<18){w.hit=1;playerHurt(1,this,-1)}}
  if(G.waves2)G.waves2=G.waves2.filter(w=>w.t<2.2)},
 onBolt(b){this.damage(1,'bolt');explodeSmall(b.x,b.y);txt(this.x-60,this.y-340*this.sc(),'DIRECT HIT!','#ffe27a')},
 onSaber(){},onPush(){},
 reset(){this.hp=Math.min(this.max,this.hp+2);this.st='idle';this.st_t=1.5},
 draw(){const sc=this.sc();const ph=this.t*1.6*Math.PI;const bob=Math.abs(Math.sin(ph))*6;let rot=0,dy=0;if(this.dead){rot=Math.min(1.2,(this.fall||0)*0.8);dy=Math.min(60,(this.fall||0)*40)}
  drawShadow(this.x,this.y,90*sc,14*sc);if(this.dead||!drawWalkerRig(this,this.x,this.y-bob+dy,sc,{flash:this.flash,rot}))drawSpr('walker',this.x,this.y-bob+dy,sc,false,{flash:this.flash,rot});
  if(this.st==='aim'&&this.st_t>0){const mx=this.x-120*sc,my=this.y-250*sc,p=G.p;c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,40,30,'+(0.3+0.3*Math.sin(G.t*40))+')';c.lineWidth=2;c.beginPath();c.moveTo(mx,my);c.lineTo(p.x,p.y-p.z-55);c.stroke();c.restore()}
  if(G.waves2)for(const w of G.waves2){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(w.x,w.y,4,w.x,w.y,70);g.addColorStop(0,'rgba(255,220,150,0.7)');g.addColorStop(1,'rgba(255,120,40,0)');c.fillStyle=g;c.beginPath();c.ellipse(w.x,w.y,70,18,0,0,TAU);c.fill();c.restore();if(Math.random()<0.5)P({x:w.x+rand(-30,30),y:w.y,vx:rand(-60,60),vy:-rand(100,260),l:0.4,m:0.4,s:rand(3,6),c:'#8a7a5a',g:800})}}});
 Object.defineProperty(WB,'x',{get(){return G.cam.x+viewW*this.rel},set(v){},configurable:true});return WB}

/* ===== rendering ===== */
function drawSpr(n,x,y,sc,flip,o){o=o||{};const im=o.tint||IMG[n];const m=META[n];if(!im||!m)return;const w=m.w*sc,h=m.h*sc,ax=(o.ax!==undefined?o.ax:m.ax)*sc;
 c.save();c.translate(x,y);if(o.rot)c.rotate(o.rot);if(flip)c.scale(-1,1);if(o.sy)c.scale(1,o.sy);if(o.alpha!==undefined)c.globalAlpha*=o.alpha;c.drawImage(im,-ax,-h,w,h);
 if(o.flash>0){const wi=tinted(n,'#ffffff',1);if(wi){c.globalAlpha*=Math.min(1,o.flash/0.12)*0.85;c.drawImage(wi,-ax,-h,w,h)}}c.restore()}
function glowCircle(x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function drawShadow(x,y,rx,ry){c.save();c.fillStyle='rgba(0,0,0,0.38)';c.beginPath();c.ellipse(x,y+1,rx,ry,0,0,TAU);c.fill();c.restore()}
function drawBlade(x,y,a,len,col,boost){boost=boost||1;const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;const fl=0.9+Math.random()*0.1;
 c.save();c.lineCap='round';c.strokeStyle='#2a2c30';c.lineWidth=5;c.beginPath();c.moveTo(x-Math.cos(a)*14,y-Math.sin(a)*14);c.lineTo(x,y);c.stroke();c.strokeStyle='#c8ccd4';c.lineWidth=2;c.beginPath();c.moveTo(x-Math.cos(a)*12,y-Math.sin(a)*12);c.lineTo(x-Math.cos(a)*4,y-Math.sin(a)*4);c.stroke();
 c.globalCompositeOperation='lighter';[[20*boost,0.09],[12*boost,0.22],[7,0.5]].forEach(([w,al])=>{c.globalAlpha=al*fl;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke()});
 c.globalAlpha=1;c.strokeStyle='#ffffff';c.lineWidth=3.2;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();c.restore();
 G.lights.push({x:(x+ex)/2,y:(y+ey)/2,r:120,c:col==='#ff1a2a'?'rgba(255,30,40,0.22)':'rgba(70,150,255,0.24)',l:0.02,m:0.02,frame:1})}
function lightning(x0,y0,x1,y1){c.save();c.globalCompositeOperation='lighter';for(let k=0;k<3;k++){c.strokeStyle=k?'rgba(190,150,255,0.55)':'rgba(255,255,255,0.95)';c.lineWidth=k?5:2;c.beginPath();c.moveTo(x0,y0);const n=9;for(let i=1;i<n;i++){const t=i/n;c.lineTo(lerp(x0,x1,t)+rand(-14,14),lerp(y0,y1,t)+rand(-18,18))}c.lineTo(x1,y1);c.stroke()}c.restore();G.lights.push({x:(x0+x1)/2,y:(y0+y1)/2,r:200,c:'rgba(170,120,255,0.3)',l:0.02,m:0.02,frame:1})}
function jimFrame(p){if(p.dead)return'jim_jump';if(p.pushT>0)return'jim_push';if(p.slashT>0||p.lockT>0)return'jim_slash';if(!p.onG)return'jim_jump';if(Math.abs(p.vx)>40&&!p.guard)return IMG.jim_body?'jim_run1':Math.floor(p.anim*2.4)%2?'jim_run2':'jim_run1';return'jim_idle'}
function drawJim(){const p=G.p;if(p.dead&&p.deadT<1.4)return;const fr=jimFrame(p);p.bob=p.onG&&Math.abs(p.vx)>40?-Math.abs(Math.sin(p.anim*Math.PI*2.4))*3:0;
 if(p.inv>0&&!G.cine&&Math.floor(p.inv*14)%2)c.globalAlpha=0.45;
 drawShadow(p.x,groundAt(p.x,p.y-4)??p.y,26,6);
 let rot=0;if(p.djT>0)rot=p.face*(1-p.djT/0.45)*TAU;
 /* force aura */if(p.pushT>0)glowCircle(p.x,p.y-60,90,'rgba(120,190,255,0.25)');
 const sq=p.landT>0?1-p.landT*0.6:1;
 if(rot){c.save();c.translate(p.x,p.y-55);c.rotate(rot);c.translate(-p.x,-(p.y-55));drawSpr(fr,p.x,p.y,JSC,p.face<0,{flash:p.hurtT>0?p.hurtT:0});c.restore()}
 else{const mv=fr==='jim_run1'||fr==='jim_run2',amp=lrStep(p,undefined,mv,Math.abs(p.vx),150),useR=(mv||(fr==='jim_idle'&&p.onG&&amp>0.15))&&sq===1;
  if(!(useR&&drawJimRig(p,p.x,p.y,p.face<0,{flash:p.hurtT>0?p.hurtT:0},amp*clamp(Math.abs(p.vx)/JT.run,0.6,1))))drawSpr(fr,p.x,p.y+p.bob,JSC,p.face<0,{flash:p.hurtT>0?p.hurtT:0,sy:sq})}
 if(!rot){const b=bladeBase(p),a=bladeAngle(p);
  if(p.slashT>0){p.trail.push({x:b.x,y:b.y,a});if(p.trail.length>7)p.trail.shift()}else if(p.trail.length)p.trail.shift();
  if(p.trail.length>1){c.save();c.globalCompositeOperation='lighter';for(let i=1;i<p.trail.length;i++){const t0=p.trail[i-1],t1=p.trail[i];c.globalAlpha=i/p.trail.length*0.35;c.fillStyle='#5ab0ff';c.beginPath();c.moveTo(t0.x+Math.cos(t0.a)*12,t0.y+Math.sin(t0.a)*12);c.lineTo(t0.x+Math.cos(t0.a)*BLADE,t0.y+Math.sin(t0.a)*BLADE);c.lineTo(t1.x+Math.cos(t1.a)*BLADE,t1.y+Math.sin(t1.a)*BLADE);c.lineTo(t1.x+Math.cos(t1.a)*12,t1.y+Math.sin(t1.a)*12);c.fill()}c.restore()}
  drawBlade(b.x,b.y,a,BLADE,'#3a8cff',p.guard?1.3:1)}
 c.globalAlpha=1}
function drawEnemy(e){if(e.alpha<=0)return;c.globalAlpha=Math.max(0,e.alpha);const flip=e.face>0;
 if(e.rope){c.strokeStyle='#1a1c20';c.lineWidth=2;c.beginPath();c.moveTo(e.x+4,-300);c.lineTo(e.x+4,e.y-90);c.stroke()}
 if(!e.dead)drawShadow(e.x,e.y,24,5);
 if(e.type==='guard'){let rot=0,dx=0;if(e.st==='wind')rot=-e.face*-0.12;if(e.st==='thrust'){rot=e.face*0.18;dx=e.face*16}if(e.st==='stun')rot=Math.sin(e.t*14)*0.12;if(e.dead)rot=e.face*-Math.min(1.5,e.t*3);
  drawSpr('guard',e.x+dx,e.y,0.31,flip,{flash:e.flash,rot});if(e.st==='wind'){glowCircle(e.x+e.face*-40,e.y-118,16+8*Math.sin(G.t*30),'rgba(255,220,140,0.9)')}
  if(e.st==='stun'&&!e.dead)stars(e.x,e.y-130);c.globalAlpha=1;return}
 let n='st_aim';if(e.type==='heavy')n='st_heavy';if(e.fireT>0&&e.type!=='heavy')n='st_fire';if(e.dead)n='st_fly';
 const tint=e.type==='shadow'?tinted(n,'#0c0c14',0.8):null;const bob=!e.dead&&Math.abs(e.vx)>10?-Math.abs(Math.sin(e.t*9))*3:0;
 const mv=!e.dead&&!(e.stun>0)&&Math.abs(e.vx)>10,amp=e.dead?0:lrStep(e,undefined,mv,e.vx*(e.face||1),90),useR=!e.dead&&(mv||amp>0.15),ka=amp*clamp(Math.abs(e.vx)/70,0.6,1);
 if(!(useR&&(n==='st_aim'?drawTrooperRig(e,e.x,e.y,flip,{flash:e.flash},ka):n==='st_heavy'?drawFrontRig(e,'sth_body',e.x,e.y,JSC,flip,{flash:e.flash},ka,false):false)))drawSpr(n,e.x,e.y+bob,JSC,flip,{flash:e.flash,rot:e.dead?e.rot*0.25:0,tint});
 if(e.type==='shadow'&&!e.dead){c.save();c.globalCompositeOperation='lighter';glowCircle(e.x+e.face*8,e.y-100,8,'rgba(255,40,40,0.8)');c.restore()}
 if(e.aimT>0&&!e.dead){aimLine(e.x+e.face*44,e.y-72,e.face,e.aimT)}
 if(e.stun>0&&!e.dead&&e.type==='heavy')stars(e.x,e.y-120);
 if(e.alerted&&e.t<0.6&&!e.dead){}
 c.globalAlpha=1}
function stars(x,y){for(let i=0;i<3;i++){const a=G.t*5+i*2.1;c.fillStyle='#ffe27a';c.beginPath();c.arc(x+Math.cos(a)*20,y+Math.sin(a)*6,3,0,TAU);c.fill()}}
/* ---------- backgrounds ---------- */
function bgImage(n,f,yAlign){const im=IMG[n];if(!im)return;const top=0,hh=gameH*DPR;const k=hh/im.height*1.08;const iw=im.width*k,ih=im.height*k;const off=G.cam.x*f*S*DPR;let i0=Math.floor(off/iw);
 const y0=(hh-ih)*(yAlign===undefined?0.6:yAlign);
 for(let i=i0;i*iw-off<cv.width;i++){const x=i*iw-off;if(i%2){c.save();c.translate(x+iw,y0);c.scale(-1,1);c.drawImage(im,0,0,iw+1,ih);c.restore()}else c.drawImage(im,x,y0,iw+1,ih)}}
function worldT(f){f=f===undefined?1:f;const sx=G.shx||0,sy=G.shy||0;c.setTransform(DPR*S,0,0,DPR*S,(-G.cam.x*f*S+sx)*DPR,(gameTop-G.cam.y*S+sy)*DPR)}
function layer(f,fn){worldT(f);fn(G.cam.x*f,G.cam.x*f+viewW)}
function drawBack(){const th=G.L.theme;c.setTransform(1,0,0,1,0,0);
 if(th==='hangar'){bgImage('bg_hangar',0.08,0.72);
  layer(0.3,(x0,x1)=>{const im=tinted('tie','#0a0e18',0.55);for(let x=Math.floor(x0/700)*700;x<x1+300;x+=700){if(im)drawSpr('tie',x+200,420,0.33,false,{tint:im})}});
  layer(0.55,(x0,x1)=>{for(let x=Math.floor(x0/460)*460;x<x1+200;x+=460){const g=c.createLinearGradient(x,0,x+70,0);g.addColorStop(0,'#0b0e14');g.addColorStop(0.5,'#262c36');g.addColorStop(1,'#0b0e14');c.fillStyle=g;c.fillRect(x,-300,70,800);
    c.fillStyle='rgba(140,200,255,0.5)';c.fillRect(x+33,-300,4,800);
    c.save();c.globalCompositeOperation='lighter';const lg=c.createLinearGradient(0,-80,0,460);lg.addColorStop(0,'rgba(190,220,255,0.22)');lg.addColorStop(1,'rgba(190,220,255,0)');c.fillStyle=lg;c.beginPath();c.moveTo(x+200,-80);c.lineTo(x+250,-80);c.lineTo(x+330,460);c.lineTo(x+120,460);c.fill();c.restore();
    c.fillStyle='#dfefff';c.fillRect(x+195,-86,60,6)}});
  if(G.alarmT>0){c.setTransform(1,0,0,1,0,0);c.fillStyle='rgba(255,0,0,'+(0.08+0.08*Math.sin(G.t*8))+')';c.fillRect(0,0,cv.width,gameH*DPR)}}
 else if(th==='forest'){bgImage('bg_forest',0.06,0.5);
  layer(0.35,(x0,x1)=>{for(let x=Math.floor(x0/260)*260;x<x1+200;x+=260){const w=46+((x*7)%30);c.fillStyle='rgba(30,52,50,0.75)';c.fillRect(x,-300,w,700);}});
  layer(0.7,(x0,x1)=>{for(let x=Math.floor(x0/520)*520;x<x1+300;x+=520){const w=90+((x*13)%40);const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#1a1208');g.addColorStop(0.4,'#4a3018');g.addColorStop(1,'#140e06');c.fillStyle=g;c.fillRect(x,-300,w,640);c.beginPath();c.moveTo(x-30,340);c.quadraticCurveTo(x+w/2,300,x+w+30,340);c.fill()}});
  c.setTransform(1,0,0,1,0,0);c.save();c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const x=((i*397-G.cam.x*0.1*S)%(W+400)+W+400)%(W+400)-200;const g=c.createLinearGradient(0,0,0,gameH);g.addColorStop(0,'rgba(255,220,150,0.13)');g.addColorStop(1,'rgba(255,220,150,0)');c.fillStyle=g;c.beginPath();c.moveTo(x*DPR,0);c.lineTo((x+60)*DPR,0);c.lineTo((x-60)*DPR,gameH*DPR);c.lineTo((x-200)*DPR,gameH*DPR);c.fill()}c.restore()}
 else if(th==='reactor'){bgImage('bg_reactor',0.07,0.5);
  layer(0.5,(x0,x1)=>{for(let x=Math.floor(x0/380)*380;x<x1+200;x+=380){c.fillStyle='#07090e';c.fillRect(x,-300,26,900);c.fillRect(x+120,180+((x/380)%3)*40,260,12);c.fillStyle='rgba(255,150,40,0.7)';for(let y=-260;y<540;y+=90)c.fillRect(x+9,y,8,4)}});
  c.setTransform(1,0,0,1,0,0);const g=c.createLinearGradient(0,gameH*DPR*0.6,0,gameH*DPR);g.addColorStop(0,'rgba(40,120,255,0)');g.addColorStop(1,'rgba(60,150,255,'+(0.25+0.08*Math.sin(G.t*2))+')');c.fillStyle=g;c.fillRect(0,gameH*DPR*0.6,cv.width,gameH*DPR*0.4)}
 else if(th==='throne'){bgImage('bg_throne',0.06,0.62);
  layer(0.6,(x0,x1)=>{for(let x=Math.floor(x0/560)*560;x<x1+200;x+=560){const g=c.createLinearGradient(x,0,x+80,0);g.addColorStop(0,'#050306');g.addColorStop(0.5,'#1c1016');g.addColorStop(1,'#050306');c.fillStyle=g;c.fillRect(x,-300,80,760);c.fillStyle='rgba(255,30,40,0.75)';c.fillRect(x+36,-300,6,760);c.save();c.globalCompositeOperation='lighter';glowCircle(x+39,300,80,'rgba(255,20,30,0.2)');c.restore()}})}}
function drawFront(){const th=G.L.theme;
 if(th==='hangar')layer(1.3,(x0,x1)=>{for(let x=Math.floor(x0/1500)*1500;x<x1+300;x+=1500){const g=c.createLinearGradient(x+40,0,x+130,0);g.addColorStop(0,'#05070b');g.addColorStop(0.45,'#141a24');g.addColorStop(0.55,'#2a3444');g.addColorStop(1,'#04060a');c.fillStyle=g;c.beginPath();c.moveTo(x+20,600);c.lineTo(x+55,470);c.lineTo(x+115,470);c.lineTo(x+150,600);c.fill();c.fillRect(x+62,-400,46,872);c.fillStyle='rgba(120,190,255,0.35)';c.fillRect(x+84,-400,2,872);c.fillStyle='#ff3a2a';c.fillRect(x+80,300,10,4);c.fillRect(x+80,140,10,4)}});
 if(th==='forest')layer(1.4,(x0,x1)=>{c.fillStyle='#050a05';for(let x=Math.floor(x0/300)*300;x<x1+200;x+=300){for(let k=0;k<5;k++){c.beginPath();const bx=x+k*22;c.moveTo(bx,560);c.quadraticCurveTo(bx-30+k*12,480,bx-60+k*30,450+k*6);c.quadraticCurveTo(bx-10+k*10,500,bx+14,560);c.fill()}}});
 if(th==='reactor')layer(1.25,(x0,x1)=>{for(let x=Math.floor(x0/1700)*1700;x<x1+300;x+=1700){c.fillStyle='#020306';c.fillRect(x,-400,70,1000);c.fillStyle='rgba(255,140,40,0.8)';c.fillRect(x+30,-400,8,1000)}});
 if(th==='throne')layer(1.3,(x0,x1)=>{for(let x=Math.floor(x0/1600)*1600;x<x1+300;x+=1600){c.fillStyle='#020102';c.fillRect(x,-400,90,1000)}})}
/* ---------- level geometry ---------- */
function drawSolid(s){const th=G.L.theme;if(s.dead)return;
 if(s.kind==='floor'){const g=c.createLinearGradient(0,s.y,0,s.y+120);if(th==='throne'){g.addColorStop(0,'#1a1418');g.addColorStop(0.08,'#0c080a');g.addColorStop(1,'#030203')}else{g.addColorStop(0,'#3a414c');g.addColorStop(0.06,'#22272f');g.addColorStop(1,'#07080b')}c.fillStyle=g;c.fillRect(s.x,s.y,s.w,s.h);
  c.fillStyle=th==='throne'?'rgba(255,60,70,0.55)':'rgba(170,200,230,0.8)';c.fillRect(s.x,s.y,s.w,2);
  c.strokeStyle=th==='throne'?'rgba(255,40,50,0.12)':'rgba(0,0,0,0.5)';c.lineWidth=1.5;const x0=Math.max(s.x,G.cam.x-100),x1=Math.min(s.x+s.w,G.cam.x+viewW+100);
  for(let x=Math.ceil(x0/96)*96;x<x1;x+=96){c.beginPath();c.moveTo(x,s.y+3);c.lineTo(x-20,s.y+80);c.stroke()}
  if(th!=='throne'){c.fillStyle='rgba(120,190,255,'+(0.55+0.3*Math.sin(G.t*3))+')';for(let x=Math.ceil(x0/192)*192;x<x1;x+=192)c.fillRect(x+30,s.y+10,22,3)}
  if(th==='hangar'){hazard(s.x,s.y,26);hazard(s.x+s.w-26,s.y,26)}}
 else if(s.kind==='bridge'){c.fillStyle='#454c56';c.fillRect(s.x,s.y,s.w,10);c.fillStyle='#22262c';c.fillRect(s.x,s.y+10,s.w,16);c.fillStyle='rgba(180,210,240,0.8)';c.fillRect(s.x,s.y,s.w,2);
  c.strokeStyle='#15181c';c.lineWidth=2;for(let x=s.x;x<s.x+s.w;x+=40){c.beginPath();c.moveTo(x,s.y+10);c.lineTo(x+20,s.y+26);c.lineTo(x+40,s.y+10);c.stroke()}
  c.fillStyle='rgba(255,150,40,'+(0.6+0.3*Math.sin(G.t*4))+')';for(let x=s.x+20;x<s.x+s.w;x+=120)c.fillRect(x,s.y+22,10,4)}
 else if(s.kind==='crate'){c.fillStyle='#4a515c';c.fillRect(s.x,s.y,s.w,s.h);c.fillStyle='#5e6774';c.fillRect(s.x+4,s.y+4,s.w-8,6);c.strokeStyle='#1c2026';c.lineWidth=3;c.strokeRect(s.x+1.5,s.y+1.5,s.w-3,s.h-3);
  for(let y=s.y;y<s.y+s.h-10;y+=80){c.beginPath();c.moveTo(s.x+6,y+12);c.lineTo(s.x+s.w-6,y+70);c.stroke();c.fillStyle='rgba(255,190,40,0.8)';c.fillRect(s.x+s.w-20,y+14,10,10)}}
 else if(s.kind==='door'){const g=c.createLinearGradient(s.x,0,s.x+s.w,0);g.addColorStop(0,'#2a2f36');g.addColorStop(0.5,'#5a626e');g.addColorStop(1,'#2a2f36');c.fillStyle=g;c.fillRect(s.x,s.y,s.w,s.h);
  for(let y=s.y+40;y<s.y+s.h;y+=120)hazard(s.x,y,s.w,14);c.fillStyle='rgba(255,40,30,'+(0.6+0.4*Math.sin(G.t*6))+')';c.fillRect(s.x+s.w/2-5,GROUND-200,10,30);
  c.save();c.globalCompositeOperation='lighter';glowCircle(s.x+s.w/2,GROUND-185,40,'rgba(255,40,30,0.35)');c.restore()}
 else{c.fillStyle='#0a0c10';c.fillRect(s.x,s.y,s.w,s.h)}}
function hazard(x,y,w,h){h=h||10;c.save();c.beginPath();c.rect(x,y+2,w,h);c.clip();c.fillStyle='#d8b020';c.fillRect(x,y+2,w,h);c.fillStyle='#14141a';for(let k=-20;k<w+20;k+=14){c.beginPath();c.moveTo(x+k,y+2);c.lineTo(x+k+7,y+2);c.lineTo(x+k-3,y+2+h);c.lineTo(x+k-10,y+2+h);c.fill()}c.restore()}
function drawPlat(p){if(p.kind==='mover'){c.fillStyle='#3a4250';c.fillRect(p.x,p.y,p.w,14);c.fillStyle='rgba(180,220,255,0.9)';c.fillRect(p.x,p.y,p.w,2);c.save();c.globalCompositeOperation='lighter';for(const fx of [p.x+24,p.x+p.w-24]){glowCircle(fx,p.y+20,22+3*Math.sin(G.t*20),'rgba(90,170,255,0.6)')}c.restore();return}
 c.fillStyle='#2c323b';c.fillRect(p.x,p.y,p.w,9);c.fillStyle='rgba(170,200,230,0.8)';c.fillRect(p.x,p.y,p.w,2);c.strokeStyle='#5a6270';c.lineWidth=2;c.beginPath();c.moveTo(p.x,p.y-24);c.lineTo(p.x+p.w,p.y-24);c.stroke();
 for(let x=p.x+4;x<p.x+p.w;x+=40){c.beginPath();c.moveTo(x,p.y);c.lineTo(x,p.y-24);c.stroke()}c.strokeStyle='#14181e';c.beginPath();c.moveTo(p.x+20,p.y+9);c.lineTo(p.x+20,p.y+300);c.moveTo(p.x+p.w-20,p.y+9);c.lineTo(p.x+p.w-20,p.y+300);c.stroke()}
function drawPickup(q){const bob=Math.sin(q.t*3)*5;const x=q.x,y=q.y+bob;c.save();c.globalCompositeOperation='lighter';
 if(q.type==='kyber'){glowCircle(x,y,30,'rgba(80,170,255,0.5)');c.globalCompositeOperation='source-over';c.fillStyle='#8fd4ff';c.strokeStyle='#e8f8ff';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y-16);c.lineTo(x+8,y-3);c.lineTo(x+4,y+14);c.lineTo(x-4,y+14);c.lineTo(x-8,y-3);c.closePath();c.fill();c.stroke()}
 else if(q.type==='force'){glowCircle(x,y,30,'rgba(140,120,255,0.55)');c.strokeStyle='rgba(220,210,255,0.9)';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(x,y,9+i*3,q.t*4+i*2,q.t*4+i*2+3.5);c.stroke()}}
 else if(q.type==='shard'){glowCircle(x,y,38,'rgba(255,210,80,0.55)');c.strokeStyle='#fff4c0';c.lineWidth=5;c.beginPath();c.arc(x,y,15,q.t*2,q.t*2+2.2);c.stroke();c.strokeStyle='rgba(255,200,60,0.9)';c.lineWidth=9;c.globalAlpha=0.5;c.beginPath();c.arc(x,y,15,q.t*2,q.t*2+2.2);c.stroke()}
 c.restore()}
function drawCP(cp){const gy=groundAt(cp.x,0)||GROUND;c.fillStyle='#2a3038';c.fillRect(cp.x-3,gy-90,6,90);c.fillStyle='#4a5260';c.fillRect(cp.x-10,gy-8,20,8);const col=cp.on?'rgba(90,255,180,':'rgba(255,90,70,';
 c.save();c.globalCompositeOperation='lighter';glowCircle(cp.x,gy-96,26+4*Math.sin(G.t*5),col+'0.7)');c.restore();c.fillStyle=col+'1)';c.beginPath();c.arc(cp.x,gy-96,6,0,TAU);c.fill()}
function drawHint(h){const fs=Math.max(16/S,15);c.font='800 '+fs+'px "Trebuchet MS",system-ui,sans-serif';const maxW=Math.min(viewW*0.86,560);const lines=wrapText(hintText(h.s),maxW-24);const w=Math.max(...lines.map(l=>c.measureText(l).width))+28,hh=lines.length*fs*1.25+16;
 let x=clamp(h.x,G.cam.x+w/2+8,G.cam.x+viewW-w/2-8);if(Math.abs(x-h.x)>viewW)return;const y=h.y+Math.sin(G.t*2+h.x)*3;
 c.fillStyle='rgba(6,20,40,0.72)';rr(x-w/2,y-hh/2,w,hh,10);c.fill();c.strokeStyle='rgba(110,200,255,0.85)';c.lineWidth=2;c.stroke();c.fillStyle='#e8f6ff';c.textAlign='center';c.textBaseline='middle';lines.forEach((l,i)=>c.fillText(l,x,y-hh/2+8+fs*0.62+i*fs*1.25))}
function rr(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function wrapText(s,mw){const w=String(s).split(' '),out=[];let cur='';for(const x of w){const t=cur?cur+' '+x:x;if(c.measureText(t).width>mw&&cur){out.push(cur);cur=x}else cur=t}if(cur)out.push(cur);return out}
function drawBolt(b){const a=Math.atan2(b.vy,b.vx),L=b.len||26;const x1=b.x-Math.cos(a)*L,y1=b.y-Math.sin(a)*L;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 c.strokeStyle=b.col;c.globalAlpha=0.35;c.lineWidth=(b.w||3.6)*3.2;c.beginPath();c.moveTo(x1,y1);c.lineTo(b.x,b.y);c.stroke();c.globalAlpha=1;c.lineWidth=b.w||3.6;c.beginPath();c.moveTo(x1,y1);c.lineTo(b.x,b.y);c.stroke();
 c.strokeStyle='#fff0ec';c.lineWidth=(b.w||3.6)*0.4;c.beginPath();c.moveTo(x1,y1);c.lineTo(b.x,b.y);c.stroke();c.restore();G.lights.push({x:b.x,y:b.y,r:46,c:b.col==='#3aff5a'?'rgba(60,255,90,0.25)':'rgba(255,50,30,0.25)',l:0.02,m:0.02,frame:1})}
function drawNade(n){c.fillStyle='#3a3e46';c.beginPath();c.arc(n.x,n.y-n.r,n.r,0,TAU);c.fill();c.strokeStyle='#8a929e';c.lineWidth=2;c.stroke();const on=Math.floor(n.t*(n.fuse<0.6?16:6))%2;if(on){c.save();c.globalCompositeOperation='lighter';glowCircle(n.x,n.y-n.r,18,n.owner==='j'?'rgba(90,180,255,0.9)':'rgba(255,40,30,0.9)');c.restore()}}
function drawThrown(o){c.save();c.translate(o.x,o.y);c.rotate(o.rot);if(o.kind==='crate'){c.fillStyle='#4a515c';c.fillRect(-o.r,-o.r,o.r*2,o.r*2);c.strokeStyle='#1c2026';c.lineWidth=3;c.strokeRect(-o.r,-o.r,o.r*2,o.r*2)}else{c.fillStyle='#2a2228';c.beginPath();c.moveTo(-o.r,-o.r*0.6);c.lineTo(o.r*0.3,-o.r);c.lineTo(o.r,o.r*0.2);c.lineTo(-o.r*0.2,o.r);c.closePath();c.fill()}c.restore();
 c.save();c.globalCompositeOperation='lighter';glowCircle(o.x,o.y,o.r*1.8,o.owner==='j'?'rgba(90,170,255,0.4)':'rgba(255,30,40,0.35)');c.restore()}
function drawParts(){for(const q of G.parts){const a=clamp(q.l/q.m,0,1);if(q.ring){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.strokeStyle=q.c;c.lineWidth=q.w||5;c.beginPath();c.arc(q.x,q.y,q.s*(1.4-a*0.9),0,TAU);c.stroke();c.restore();continue}
 if(q.smoke){c.globalAlpha=a*0.5;c.fillStyle=q.c;c.beginPath();c.arc(q.x,q.y,q.s*(1.6-a*0.6),0,TAU);c.fill();c.globalAlpha=1;continue}
 if(q.rock){c.save();c.translate(q.x,q.y);c.rotate(q.rot);c.globalAlpha=a;c.fillStyle=q.c;c.fillRect(-q.s,-q.s*0.6,q.s*2,q.s*1.2);c.restore();continue}
 c.save();if(q.add)c.globalCompositeOperation='lighter';c.globalAlpha=a;c.strokeStyle=q.c;c.fillStyle=q.c;if(q.spark){c.lineWidth=q.s;c.lineCap='round';c.beginPath();c.moveTo(q.x,q.y);c.lineTo(q.x-q.vx*0.03,q.y-q.vy*0.03);c.stroke()}else{c.beginPath();c.arc(q.x,q.y,q.s,0,TAU);c.fill()}c.restore()}c.globalAlpha=1}
function drawWaves(){for(const w of G.waves){const k=w.t/0.45;if(k>1)continue;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const r=40+k*300-i*28;if(r<10)continue;c.globalAlpha=(1-k)*(0.6-i*0.15);c.strokeStyle=i?'#7fc0ff':'#e8f6ff';c.lineWidth=10-i*3;c.beginPath();c.arc(w.x-w.face*40,w.y,r,w.face>0?-0.9:Math.PI-0.9,w.face>0?0.9:Math.PI+0.9);c.stroke()}c.restore()}}
function drawTexts(){for(const t of G.texts){const a=clamp(t.l/t.m*1.6,0,1);const fs=(t.big?30:20)/Math.min(1,S)*Math.min(1,S)/S*Math.max(S,0.8);const sz=Math.max(t.big?28/S:17/S,t.big?26:16);c.font='900 '+sz+'px "Trebuchet MS",system-ui';c.textAlign='center';c.textBaseline='middle';c.globalAlpha=a;c.lineWidth=4/S;c.strokeStyle='rgba(0,0,0,0.85)';const y=t.y-(1-t.l/t.m)*40;const x=clamp(t.x,G.cam.x+60,G.cam.x+viewW-60);c.strokeText(t.s,x,y);c.fillStyle=t.c;c.fillText(t.s,x,y)}c.globalAlpha=1}
function drawLights(){c.save();c.globalCompositeOperation='lighter';for(const L of G.lights){const a=L.frame?1:clamp(L.l/L.m,0,1);c.globalAlpha=a;if(L.c.startsWith('rgba'))glowCircle(L.x,L.y,L.r,L.c);else{const g=c.createRadialGradient(L.x,L.y,0,L.x,L.y,L.r);g.addColorStop(0,L.c);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a*0.55;c.fillStyle=g;c.fillRect(L.x-L.r,L.y-L.r,L.r*2,L.r*2)}}c.restore()}
function drawBeams(){for(const b of G.beams){const ph=(G.t+b.ph)%b.per,on=ph<b.on,warn=!on&&ph>b.per-0.45;c.fillStyle='#2a3038';c.fillRect(b.x-12,b.y0-10,24,22);c.fillRect(b.x-12,b.y1-14,24,14);
 if(on||warn){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=on?0.9:0.25+0.25*Math.sin(G.t*40);const g=c.createLinearGradient(b.x-18,0,b.x+18,0);g.addColorStop(0,'rgba(80,160,255,0)');g.addColorStop(0.5,'rgba(200,240,255,1)');g.addColorStop(1,'rgba(80,160,255,0)');c.fillStyle=g;c.fillRect(b.x-18+(on?Math.random()*2:0),b.y0,36,b.y1-b.y0);c.restore();if(on)G.lights.push({x:b.x,y:300,r:160,c:'rgba(90,170,255,0.25)',l:0.02,m:0.02,frame:1})}}}
function drawTies(){for(const t of G.ties){if(t.ph===0){worldT(0.25);drawSpr('tie',t.bx,t.by,0.12,false,{alpha:0.9})}else{worldT(1);drawSpr('tie',t.x,t.y,t.sc,false,{rot:t.rot||0});c.save();c.globalCompositeOperation='lighter';glowCircle(t.x,t.y-60*t.sc*3,30,'rgba(255,80,40,0.25)');c.restore()}}worldT(1)}
function drawTargets(){for(const m of G.marks){const a=clamp(m.t/0.6,0,1);c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(255,60,40,'+(0.5+0.5*Math.sin(G.t*30))+')';c.lineWidth=3;c.beginPath();c.ellipse(m.x,m.y,40*(1.2-a*0.4),10,0,0,TAU);c.stroke();c.restore()}}

/* ===== leg rig (Grey Heart leg check, Oct 2026): render-only procedural legs under legless body art =====
   Stride phase advances from horizontal speed, legs ease back to standing when stopped. Sprite-pixel coords. */
function lrStep(o,dt,moving,v,stride){if(o._rph===undefined){o._rph=Math.random();o._ramt=0;o._rt=G.t}
 dt=dt===undefined?clamp(G.t-o._rt,0,0.1):dt;o._rt=G.t;
 o._ramt+=((moving?1:0)-o._ramt)*Math.min(1,dt*12);
 if(moving)o._rph=((o._rph+Math.sign(v)*dt*Math.min(1.375,Math.max(Math.abs(v)/stride,Math.min(.875,Math.abs(v)/40))))%1+1)%1;/* cadence (arm check, Oct 30 2026): run capped ~2.75 steps/s, slow walkers ~1.75 */else if(o._ramt>0.02){const t=o._rph%0.5;o._rph+=(t<0.25?-t:0.5-t)*Math.min(1,dt*10)}
 return o._ramt}
function lrLimb(x,y,a,len,w,fill,line){const ex=x+Math.sin(a)*len,ey=y+Math.cos(a)*len;c.lineCap='round';
 if(line){c.strokeStyle=line;c.lineWidth=w+5;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke()}
 c.strokeStyle=fill;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(ex,ey);c.stroke();return[ex,ey]}
/* side-view leg. d=+1 if the sprite faces right natively. L={th,sh,wt,ws,ct,cs,cl,sw,kb,fl,fh,cf,knee,ankle} */
function lrLeg(hx,hy,t,amp,d,L){const s=Math.sin(t),cs=Math.cos(t);
 const th=0.04+amp*(L.sw||0.5)*s,kn=0.06+amp*((L.kb||1.3)*Math.pow(Math.max(0,cs),1.3)+0.14*Math.max(0,-cs));
 const k=lrLimb(hx,hy,d*th,L.th,L.wt,L.ct,L.cl);const sa=th-kn;
 const a=lrLimb(k[0],k[1],d*sa,L.sh,L.ws,L.cs,L.cl);
 if(L.knee)L.knee(k[0],k[1],d*th,d*sa);
 const fa=amp*0.45*Math.max(0,cs);c.save();c.translate(a[0],a[1]);c.scale(d,1);c.rotate(fa);
 c.fillStyle=L.cl||'#000';c.beginPath();c.ellipse(L.fl*0.28,L.fh*0.15,L.fl*0.62,L.fh*0.62,0,0,TAU);c.fill();
 c.fillStyle=L.cf;c.beginPath();c.ellipse(L.fl*0.28,0,L.fl*0.55,L.fh*0.5,0,0,TAU);c.fill();
 if(L.sole){c.fillStyle=L.sole;c.fillRect(-L.fl*0.25,L.fh*0.32,L.fl*1.05,L.fh*0.22)}
 c.restore();if(L.ankle)L.ankle(a[0],a[1],d*sa)}
/* front-view (facing camera) march leg: foot slides with the step and lifts, knee pushes up */
function lrFront(hx,hy,fx,fy,t,amp,d,L){const s=Math.sin(t),lift=Math.max(0,Math.cos(t));
 const ax=fx+d*amp*L.sx*s,ay=fy-amp*L.lift*lift,kx=(hx+ax)/2+d*amp*L.sx*0.35*s,ky=(hy+ay)/2-amp*L.lift*0.25*lift;
 c.lineCap='round';c.lineJoin='round';
 for(const [w,col] of [[L.wt+5,L.cl],[L.wt,L.ct]]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(hx,hy);c.lineTo(kx,ky);c.stroke()}
 for(const [w,col] of [[L.ws+5,L.cl],[L.ws,L.cs]]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(kx,ky);c.lineTo(ax,ay);c.stroke()}
 if(L.knee)L.knee(kx,ky,Math.atan2(ax-kx,ay-ky));
 c.fillStyle=L.cl;c.beginPath();c.ellipse(ax+(fx<hx?-4:4),ay+3,L.fl*0.6,L.fh*0.62,0,0,TAU);c.fill();
 c.fillStyle=L.cf;c.beginPath();c.ellipse(ax+(fx<hx?-4:4),ay+1,L.fl*0.52,L.fh*0.5,0,0,TAU);c.fill();
 if(L.sole){c.fillStyle=L.sole;c.fillRect(ax+(fx<hx?-4:4)-L.fl*0.5,ay+L.fh*0.3,L.fl,L.fh*0.2)}}
function lrBegin(n,x,y,sc,flip,rot){const m=META[n];c.save();c.translate(x,y);if(rot)c.rotate(rot);if(flip)c.scale(-1,1);c.scale(sc,sc);c.translate(-m.ax,-m.h);return m}
function lrBody(n,o){const im=o&&o.tint||IMG[n];if(im)c.drawImage(im,0,0);if(o&&o.flash>0){const wi=tinted(n,'#ffffff',1);if(wi){c.save();c.globalAlpha*=Math.min(1,o.flash/0.12)*0.85;c.drawImage(wi,0,0);c.restore()}}}
/* ArmRig (arm check, Oct 30 2026; arm-only cut of King Juju's KneeRig): painted single-pose arms re-posed as upper arm + forearm.
   Pieces are cut from the art as capsules (image px); the hole left behind is back-filled with a darkened copy so nothing shows through.
   Each arm swings about the shoulder opposite its leg on the stride phase, the elbow bends more on the forward swing; amp 0 = art pose.
   spec: {arms:[{s:[x,y] shoulder,e:[x,y] elbow,w:[x,y] wrist/fist end,ru,rf radii,o phase offset (0..1),A shoulder swing rad,E elbow bend rad,far}]} */
const ArmRig=(()=>{const C=new WeakMap(),PI=Math.PI,TAU=PI*2;
 function cap(x,a,b,r){const g=Math.atan2(b[1]-a[1],b[0]-a[0]);x.moveTo(a[0]+Math.sin(g)*r,a[1]-Math.cos(g)*r);x.arc(b[0],b[1],r,g-PI/2,g+PI/2);x.arc(a[0],a[1],r,g+PI/2,g+PI*1.5);x.closePath()}
 function cv(W,H){const o=document.createElement('canvas');o.width=W;o.height=H;return o}
 function piece(im,fn){const o=cv(im.width,im.height),x=o.getContext('2d');x.beginPath();fn(x);x.clip();x.drawImage(im,0,0);return o}
 function dark(src,W,H,al){const u=cv(W,H),x=u.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(40,20,20,'+al+')';x.fillRect(0,0,W,H);return u}
 function prep(im,R){let P=C.get(R);if(P&&P.im===im)return P;const W=im.width,H=im.height,body=cv(W,H),bx=body.getContext('2d');bx.drawImage(im,0,0);bx.globalCompositeOperation='destination-out';const U=[],ep=R.ep||0.8;
  const arms=R.arms.map(m=>{const up=piece(im,x=>cap(x,m.s,m.e,m.ru+ep)),fo=piece(im,x=>cap(x,m.e,m.w,m.rf+ep));
   if(!m.keep){bx.beginPath();cap(bx,m.s,m.e,m.ru+ep);bx.fill();bx.beginPath();cap(bx,m.e,m.w,m.rf+ep);bx.fill()}
   return{m,up,fo}});
  /* back-fill each hole that sat over the body by smearing the neighbouring body pixels into it (fu/ff flags per piece), so no ghost arm shows */
  const snap=cv(W,H);snap.getContext('2d').drawImage(body,0,0);const FC={};
  /* fill canvas sampling first from direction fd (radians, image space; undefined = all around) */
  const fill=fd=>{const key=fd===undefined?'all':fd.toFixed(2);if(FC[key])return FC[key];const F=cv(W,H),fx=F.getContext('2d');fx.globalCompositeOperation='destination-over';
   for(let r=1;r<=(R.fr||22);r+=1.5){if(fd===undefined){for(let k=0;k<16;k++){const t=k/16*TAU;fx.drawImage(snap,-Math.cos(t)*r,-Math.sin(t)*r)}}
    else for(const dk of [0,-.4,.4,-.8,.8]){const t=fd+dk;fx.drawImage(snap,-Math.cos(t)*r,-Math.sin(t)*r)}}return FC[key]=F};
  bx.globalCompositeOperation='destination-over';for(const g of arms){const m=g.m;for(const [on,a0,b0,rr,fd] of [[m.fu!==0,m.s,m.e,m.ru,m.fdu],[!!m.ff,m.e,m.w,m.rf,m.fdf]]){if(!on)continue;bx.save();bx.beginPath();cap(bx,a0,b0,rr+ep+0.5);bx.clip();bx.drawImage(fill(fd),0,0);bx.restore()}}
  bx.globalCompositeOperation='source-over';P={im,body,arms};C.set(R,P);return P}
 function blit(x,img,p0,px,py,r){x.save();x.translate(px,py);if(r)x.rotate(r);x.translate(-p0[0],-p0[1]);x.drawImage(img,0,0);x.restore()}
 /* u = stride phase in cycles (0..1, front leg forward at u=.25), amp 0..1; dir: +1 = art faces +x */
 function draw(x,im,R,u,amp){if(!im||!(im.width||im.naturalWidth))return;const a=Math.max(0,Math.min(1,amp||0));if(a<0.01){x.drawImage(im,0,0);return}
  const A=a*a*(3-2*a),P=prep(im,R),fs=[],ns=[];for(const g of P.arms){const m=g.m,f=-Math.sin(TAU*(u+(m.o||0))),sa=-(m.A||0.3)*f*A,ea=-(m.E||0.3)*Math.max(0,f)*A+(m.Eb||0.1)*Math.max(0,-f)*A,
   ex=m.s[0]+(m.e[0]-m.s[0])*Math.cos(sa)-(m.e[1]-m.s[1])*Math.sin(sa),ey=m.s[1]+(m.e[0]-m.s[0])*Math.sin(sa)+(m.e[1]-m.s[1])*Math.cos(sa);(m.far?fs:ns).push([g,ex,ey,sa,sa+ea])}
  const dr=([g,ex,ey,sa,fa])=>{blit(x,g.fo,g.m.e,ex,ey,fa);blit(x,g.up,g.m.s,g.m.s[0],g.m.s[1],sa)};fs.forEach(dr);x.drawImage(P.body,0,0);ns.forEach(dr)}
 return{draw,prep}})();
/* Jedi Jim's painted arms (jim_body art px): front = saber hand (small swing), back = fist; o .5 = opposite each other and the legs */
const JIM_ARMS={arms:[{s:[136,96],e:[146,124],w:[161,110],ru:9,rf:12,o:0,A:.12,E:.12,fu:0,ff:0},{s:[80,92],e:[70,124],w:[77,148],ru:9,rf:10,o:.5,A:.2,E:.25,fu:1,ff:1,fdu:0,fdf:0}]};
function jimBody(o,amp,u){if(o&&o.tint){lrBody('jim_body',o);return}ArmRig.draw(c,IMG.jim_body,JIM_ARMS,u,amp);if(o&&o.flash>0){const wi=tinted('jim_body','#ffffff',1);if(wi){c.save();c.globalAlpha*=Math.min(1,o.flash/0.12)*0.85;c.drawImage(wi,0,0);c.restore()}}}
/* ---- Jedi Jim: boots stride out from under the robe ---- */
const LR_JIM={th:50,sh:52,wt:30,ws:27,ct:'#3e2b1e',cs:'#5c3b22',cl:'#170d06',cf:'#4f321c',fl:40,fh:17,sole:'#22150c',sw:0.55,kb:1.35};
const LR_JIMB=Object.assign({},LR_JIM,{ct:'#2e2016',cs:'#43291a',cf:'#3a2414'});
function drawJimRig(p,x,y,flip,o,amp){if(!IMG.jim_body)return false;const t=p._rph*TAU,bob=-amp*4*Math.abs(Math.cos(t)),lean=amp*0.03*Math.sin(2*t);p.bob=bob;
 lrBegin('jim_body',x,y+bob,JSC,flip);
 lrLeg(70,200,t+Math.PI,amp,1,LR_JIMB);lrLeg(94,202,t,amp,1,LR_JIM);
 c.translate(88,300);c.rotate(lean);c.translate(-88,-300);jimBody(o,amp,p._rph);c.restore();return true}
/* ---- troopers (side view, native facing left) ---- */
function trKnee(dark){return (x,y,a)=>{c.save();c.translate(x,y);c.rotate(-a);c.fillStyle=dark?'#000':'#141414';c.fillRect(-15,-5,30,10);c.fillStyle=dark?'#2a2a34':'#f4f4f0';c.beginPath();c.ellipse(0,-4,12,9,0,0,TAU);c.fill();c.restore()}}
function trAnkle(dark){return (x,y,a)=>{c.save();c.translate(x,y);c.rotate(-a);c.fillStyle=dark?'#000':'#1a1a1a';c.fillRect(-13,-14,26,5);c.restore()}}
function trLegs(dark){const W=dark?'#262630':'#ecebe5',Wb=dark?'#1a1a22':'#c9c8c1',Lc=dark?'#050508':'#2a2a2a';
 return [{th:58,sh:60,wt:30,ws:26,ct:Wb,cs:Wb,cl:Lc,cf:Wb,fl:42,fh:15,sole:Lc,sw:0.5,kb:1.25,knee:trKnee(dark),ankle:trAnkle(dark)},
         {th:58,sh:60,wt:32,ws:28,ct:W,cs:W,cl:Lc,cf:W,fl:44,fh:16,sole:Lc,sw:0.5,kb:1.25,knee:trKnee(dark),ankle:trAnkle(dark)}]}
const LR_TR=trLegs(false),LR_TRD=trLegs(true);
function drawTrooperRig(e,x,y,flip,o,amp){if(!IMG.st_body)return false;const t=e._rph*TAU,bob=amp*4*Math.cos(2*t),dark=e.type==='shadow',L=dark?LR_TRD:LR_TR;
 lrBegin('st_body',x,y+bob,JSC,flip);
 lrLeg(124,150,t+Math.PI,amp,-1,L[0]);lrLeg(98,152,t,amp,-1,L[1]);
 lrBody('st_body',{flash:o.flash,tint:dark?tinted('st_body','#0c0c14',0.8):null});c.restore();return true}
/* ---- heavy troopers + Commander Krell (front-facing armor): marching legs ---- */
function frKnee(x,y){c.fillStyle='#141414';c.beginPath();c.ellipse(x,y,17,13,0,0,TAU);c.fill();c.fillStyle='#f2f2ee';c.beginPath();c.ellipse(x,y-3,13,10,0,0,TAU);c.fill()}
const LR_FR={wt:30,ws:26,ct:'#ecebe5',cs:'#e4e3dd',cl:'#2a2a2a',cf:'#ecebe5',fl:46,fh:18,sole:'#2a2a2a',sx:14,lift:26,knee:frKnee};
const LR_FRD=Object.assign({},LR_FR,{ct:'#262630',cs:'#22222a',cl:'#050508',cf:'#262630',knee:(x,y)=>{c.fillStyle='#000';c.beginPath();c.ellipse(x,y,15,12,0,0,TAU);c.fill()}});
function drawFrontRig(o,n,x,y,sc,flip,opt,amp,dark){if(!IMG[n])return false;const t=o._rph*TAU,bob=amp*4*Math.abs(Math.cos(t)),L=dark?LR_FRD:LR_FR;
 lrBegin(n,x,y-bob,sc,flip);
 lrFront(64,150,40,282,t,amp,-1,L);lrFront(100,150,134,282,t+Math.PI,amp,-1,L);
 lrBody(n,opt);c.restore();return true}
/* ---- Darth Vexis (front-facing, long cape): armored legs march under the cape ---- */
const LR_SITH={wt:21,ws:19,ct:'#2a2024',cs:'#231a1e',cl:'#070405',cf:'#100b0d',fl:44,fh:16,sole:'#000',sx:14,lift:24,knee:(x,y)=>{c.fillStyle='#120a0d';c.beginPath();c.ellipse(x,y,9,8,0,0,TAU);c.fill();c.fillStyle='#b0142a';c.fillRect(x-6,y-1,12,2)}};
function drawVexisRig(b,x,y,sc,flip,opt,amp){if(!IMG.sith_body)return false;const t=b._rph*TAU,bob=amp*3*Math.abs(Math.cos(t));
 lrBegin('sith_body',x,y-bob,sc,flip);
 lrFront(152,240,154,334,t+Math.PI,amp,-1,LR_SITH);lrFront(104,240,100,336,t,amp,-1,LR_SITH);
 lrBody('sith_body',opt);c.restore();return true}
/* ---- AT-ST walker: its own leg art cut into thigh/shin/foot pieces, posed by 2-bone IK; cadence locked to the stomp sound ---- */
const WK={n:{H:[175,150],K:[237,197],A:[210,293],t:'wk_nt',s:'wk_ns',f:'wk_nf'},f:{H:[122,180],K:[143,202],A:[110,292],t:'wk_ft',s:'wk_fs',f:'wk_ff'}};
function wkPiece(n,px,py,ox,oy,rot){const im=IMG[n];if(!im)return;c.save();c.translate(px,py);c.rotate(rot);c.translate(-ox,-oy);c.drawImage(im,0,0);c.restore()}
function wkLeg(L,t,amp){const s=Math.sin(t),lift=Math.max(0,Math.cos(t)),H=L.H,K=L.K,A=L.A;
 const L1=Math.hypot(K[0]-H[0],K[1]-H[1]),L2=Math.hypot(A[0]-K[0],A[1]-K[1]);
 const tx=A[0]+amp*22*s,ty=A[1]-amp*24*Math.pow(lift,1.2);
 const dx=tx-H[0],dy=ty-H[1],D=Math.min(L1+L2-0.5,Math.hypot(dx,dy)),base=Math.atan2(dy,dx),cA=Math.acos(clamp((L1*L1+D*D-L2*L2)/(2*L1*D),-1,1));
 const side=((K[0]-H[0])*(A[1]-H[1])-(K[1]-H[1])*(A[0]-H[0]))>0?-1:1;
 const ka=base+side*cA,kx=H[0]+Math.cos(ka)*L1,ky=H[1]+Math.sin(ka)*L1,ex=H[0]+Math.cos(base)*D,ey=H[1]+Math.sin(base)*D;
 const r1=ka-Math.atan2(K[1]-H[1],K[0]-H[0]),r2=Math.atan2(ey-ky,ex-kx)-Math.atan2(A[1]-K[1],A[0]-K[0]);
 return {draw(){wkPiece(L.t,H[0],H[1],H[0],H[1],r1);wkPiece(L.s,kx,ky,K[0],K[1],r2);wkPiece(L.f,ex,ey,A[0],A[1],amp*0.12*lift*(s>0?-1:1))}}}
function drawWalkerRig(w,x,y,sc,opt){if(!IMG.walker_body||!IMG.wk_nt)return false;const t=w.t*0.8*TAU,amp=1;
 lrBegin('walker_body',x,y,sc,false,opt.rot);
 wkLeg(WK.f,t+Math.PI,amp).draw();const near=wkLeg(WK.n,t,amp);
 c.save();c.translate(WK.n.H[0],WK.n.H[1]);c.restore();
 near.draw();lrBody('walker_body',opt);c.restore();return true}

/* ===== scene composition, HUD ===== */
function render(){c.setTransform(1,0,0,1,0,0);c.fillStyle='#04050a';c.fillRect(0,0,cv.width,cv.height);
 if(!G||state==='title'||state==='missions'||state==='howto'||state==='boot'||state==='crawl'||state==='win'){renderTitleBg();return}
 G.lights=G.lights.filter(l=>!l.frame);
 c.save();c.beginPath();c.rect(0,0,cv.width,gameH*DPR);c.clip();
 drawBack();
 if(G.mode==='bike')drawBikeScene();else drawPlatScene();
 drawFront();
 worldT(1);drawLights();
 c.setTransform(1,0,0,1,0,0);const vg=c.createRadialGradient(cv.width/2,gameH*DPR/2,Math.min(cv.width,gameH*DPR)*0.35,cv.width/2,gameH*DPR/2,Math.max(cv.width,gameH*DPR)*0.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,0.55)');c.fillStyle=vg;c.fillRect(0,0,cv.width,gameH*DPR);
 if(G.flash&&G.flash.a>0){c.fillStyle=G.flash.c;c.globalAlpha=G.flash.a;c.fillRect(0,0,cv.width,gameH*DPR);c.globalAlpha=1}
 const lb=G.lbv||0;if(lb>0.01){const h=gameH*DPR*0.09*lb;c.fillStyle='#000';c.fillRect(0,0,cv.width,h);c.fillRect(0,gameH*DPR-h,cv.width,h)}
 drawWorldHint();
 c.restore();
 if(portrait)drawPadPanel();
 drawHUD()}
function drawPlatScene(){worldT(1);const x0=G.cam.x-200,x1=G.cam.x+viewW+200;
 for(const b of G.beams)if(b.x>x0&&b.x<x1)drawBeams1(b);
 for(const s of G.solids)if(s.x<x1&&s.x+s.w>x0)drawSolid(s);
 for(const p of G.plats)if(p.x<x1&&p.x+p.w>x0)drawPlat(p);
 for(const pr of G.props)drawProp(pr);
 for(const cp of G.cps)if(cp.x>x0&&cp.x<x1)drawCP(cp);
 drawTies();drawTargets();
 for(const q of G.pickups)if(!q.got&&q.x>x0&&q.x<x1)drawPickup(q);
 for(const e of G.enemies)if(e.x>x0&&e.x<x1)drawEnemy(e);
 if(G.boss)G.boss.draw();drawJim();
 if(G.L.theme==='throne')drawReflection();
 for(const n of G.nades)drawNade(n);for(const o of G.thrown)drawThrown(o);for(const b of G.bolts)drawBolt(b);
 drawWaves();drawParts();if(G.boss&&G.boss.sayT>0)drawBubble(G.boss);drawTexts()}
function drawBeams1(b){const sv=G.beams;G.beams=[b];drawBeams();G.beams=sv}
function drawReflection(){G.reflecting=1;c.save();c.beginPath();c.rect(G.cam.x-50,GROUND,viewW+100,200);c.clip();c.translate(0,GROUND*2);c.scale(1,-1);c.globalAlpha=0.16;
 const p=G.p;if(!p.dead)drawSpr(jimFrame(p),p.x,p.y,JSC,p.face<0);for(const e of G.enemies)if(!e.dead&&onScreen(e.x,100))drawSpr(e.type==='guard'?'guard':'st_aim',e.x,e.y,e.type==='guard'?0.31:JSC,e.face>0);
 if(G.boss&&G.boss.type==='vexis')drawSpr(G.boss.fr,G.boss.x,G.boss.y,0.385,G.boss.face>0);c.restore();G.reflecting=0}
function drawProp(pr){if(pr.kind==='doorfall'){c.save();c.translate(pr.x+pr.w/2,GROUND);c.rotate(pr.rot);c.fillStyle='#4a525e';c.fillRect(-pr.w/2,-pr.h,pr.w,pr.h);c.restore()}}
function drawBubble(B){const fs=Math.max(16/S,15);c.font='700 '+fs+'px "Trebuchet MS",system-ui';const lines=wrapText(B.say,Math.min(300,viewW*0.6));const w=Math.max(...lines.map(l=>c.measureText(l).width))+22,h=lines.length*fs*1.25+14;
 const bx=clamp(B.x,G.cam.x+w/2+6,G.cam.x+viewW-w/2-6);const by=Math.max(G.cam.y+h+(portrait?70:90)/S,B.y-B.h-30);c.fillStyle='rgba(20,4,8,0.88)';rr(bx-w/2,by-h,w,h,10);c.fill();c.strokeStyle='#ff4a5a';c.lineWidth=2;c.stroke();
 c.fillStyle='#ffe8ea';c.textAlign='center';c.textBaseline='middle';lines.forEach((l,i)=>c.fillText(l,bx,by-h+7+fs*0.62+i*fs*1.25))}
/* ---------- bike scene ---------- */
function drawBikeScene(){worldT(1);const x0=G.cam.x-200,x1=G.cam.x+viewW+300;
 const g=c.createLinearGradient(0,300,0,560);g.addColorStop(0,'rgba(30,40,22,0.0)');g.addColorStop(0.12,'#26301a');g.addColorStop(1,'#0c1208');c.fillStyle=g;c.fillRect(G.cam.x-10,300,viewW+20,300);
 c.strokeStyle='rgba(160,180,110,0.18)';c.lineWidth=2;for(let i=0;i<26;i++){const y=320+((i*37)%220),len=60+(i*13)%90;const x=G.cam.x+((i*211-G.p.x*1.0)%(viewW+200)+viewW+200)%(viewW+200)-100;c.beginPath();c.moveTo(x,y);c.lineTo(x+len,y);c.stroke()}
 const list=[];for(const o of G.obs)if(o.x>x0&&o.x<x1)list.push({y:o.y,f:()=>drawObs(o)});for(const s of G.scouts)if(s.x>x0-200&&s.x<x1)list.push({y:s.y,f:()=>drawScout(s)});
 for(const q of G.pickups)if(!q.got&&q.x>x0&&q.x<x1)list.push({y:q.y,f:()=>{const sv=q.y;q.y=q.y-55;drawPickup(q);q.y=sv}});
 list.push({y:G.p.y,f:drawBikeJim});if(G.boss)list.push({y:G.boss.y,f:()=>G.boss.draw()});
 list.sort((a,b)=>a.y-b.y);list.forEach(o=>o.f());
 for(const b of G.bolts)drawBolt(b);drawParts();if(G.boss&&G.boss.sayT>0)drawBubble(G.boss);drawTexts();
}
/* on-screen hint bubbles: drawn after all scenery, fg pillars, lights and vignette so nothing covers them */
function drawWorldHint(){worldT(1);if(G.mode==='bike'){const h=nearHint(900);if(h)drawHint({...h,y:portrait?150:120,x:G.cam.x+viewW/2})}else{const h=nearHint(viewW*0.75);if(h)drawHint({...h,y:Math.max(h.y,G.cam.y+70)})}c.setTransform(1,0,0,1,0,0)}
function nearHint(r){let best=null,bd=r;for(const h of G.hints){const d=Math.abs(h.x-G.p.x);if(d<bd){bd=d;best=h}}return best}
function drawObs(o){const k=ds(o.y);if(o.type==='tree'){const w=o.w*k*1.4;const g=c.createLinearGradient(o.x-w/2,0,o.x+w/2,0);g.addColorStop(0,'#1c1208');g.addColorStop(0.35,'#5a3a1c');g.addColorStop(1,'#160e06');c.fillStyle=g;c.fillRect(o.x-w/2,-300,w,o.y+300);
  c.beginPath();c.moveTo(o.x-w/2-14*k,o.y);c.quadraticCurveTo(o.x,o.y-40*k,o.x+w/2+14*k,o.y);c.fill();c.fillStyle='rgba(60,90,40,0.6)';c.fillRect(o.x-w/2,o.y-150*k,w*0.4,60*k);drawShadow(o.x,o.y,w*0.9,6*k)}
 else if(o.type==='log'){if(o.broken)return;c.fillStyle='#4a3018';rr(o.x-46*k,o.y-24*k,92*k,22*k,10*k);c.fill();c.fillStyle='#8a6a3a';c.beginPath();c.ellipse(o.x+44*k,o.y-13*k,7*k,11*k,0,0,TAU);c.fill();drawShadow(o.x,o.y,50*k,6*k)}
 else{if(o.broken)return;c.fillStyle='#4a4c50';c.beginPath();c.moveTo(o.x-30*k,o.y);c.lineTo(o.x-18*k,o.y-30*k);c.lineTo(o.x+10*k,o.y-36*k);c.lineTo(o.x+30*k,o.y);c.fill();c.fillStyle='rgba(100,140,70,0.6)';c.fillRect(o.x-14*k,o.y-34*k,20*k,6*k)}}
function drawScout(s){const k=ds(s.y);drawShadow(s.x,s.y,70*k,7*k);const hov=Math.sin(G.t*9+s.x)*2;drawSpr('scout_bike',s.x,s.y-12*k+hov,0.34*k,true,{rot:s.st==='crash'?s.rot*0.3:0});
 c.save();c.globalCompositeOperation='lighter';glowCircle(s.x-80*k,s.y-30*k,22*k,'rgba(120,200,255,0.5)');c.restore()}
function drawBikeJim(){const p=G.p;if(p.dead)return;const k=ds(p.y);const y=p.y-p.z;drawShadow(p.x,p.y,80*k,8*k);if(p.inv>0&&Math.floor(p.inv*14)%2)c.globalAlpha=0.5;
 const hov=Math.sin(G.t*10)*2;drawSpr('jim_bike',p.x,y-12*k+hov,0.355*k,false,{flash:p.hurtT>0?p.hurtT:0,rot:clamp((p.vy||0)/2000,-0.12,0.12)-(p.vz>0?0.08:0)});
 c.save();c.globalCompositeOperation='lighter';glowCircle(p.x-100*k,y-38*k,30*k,'rgba(110,190,255,0.6)');c.restore();
 /* saber held out to the side */const hx=p.x+18*k,hy=y-72*k;let a;if(p.slashT>0){const pr=1-p.slashT/JT.slash;a=lerp(-2.4,1.0,1-Math.pow(1-pr,3))}else if(p.guard)a=-1.2+Math.sin(G.t*14)*0.6;else a=-0.5;
 if(p.slashT>0||p.guard){p.trail.push({x:hx,y:hy,a});if(p.trail.length>7)p.trail.shift()}else if(p.trail.length)p.trail.shift();
 if(p.trail.length>1){c.save();c.globalCompositeOperation='lighter';for(let i=1;i<p.trail.length;i++){const t0=p.trail[i-1],t1=p.trail[i];c.globalAlpha=i/p.trail.length*0.3;c.fillStyle='#5ab0ff';c.beginPath();c.moveTo(t0.x,t0.y);c.lineTo(t0.x+Math.cos(t0.a)*BLADE*k,t0.y+Math.sin(t0.a)*BLADE*k);c.lineTo(t1.x+Math.cos(t1.a)*BLADE*k,t1.y+Math.sin(t1.a)*BLADE*k);c.fill()}c.restore()}
 drawBlade(hx,hy,a,BLADE*k,'#3a8cff',p.guard?1.3:1);c.globalAlpha=1}
/* ---------- HUD (screen px) ---------- */
function drawPadPanel(){c.setTransform(DPR,0,0,DPR,0,0);const g=c.createLinearGradient(0,gameH,0,H);g.addColorStop(0,'#0b1220');g.addColorStop(1,'#04060c');c.fillStyle=g;c.fillRect(0,gameH,W,H-gameH);
 c.fillStyle='rgba(90,170,255,0.7)';c.fillRect(0,gameH,W,2);c.strokeStyle='rgba(90,170,255,0.08)';c.lineWidth=1;for(let x=0;x<W;x+=28){c.beginPath();c.moveTo(x,gameH);c.lineTo(x,H);c.stroke()}for(let y=gameH;y<H;y+=28){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}}
function drawHUD(){const p=G.p;c.setTransform(DPR,0,0,DPR,0,0);const top=10+(window.__safeTop||0);
 const fx=34,fy=top+26;c.save();c.beginPath();c.arc(fx,fy,24,0,TAU);c.fillStyle='#0a1830';c.fill();c.clip();if(IMG.jim_face)c.drawImage(IMG.jim_face,fx-26,fy-26,52,52);c.restore();c.strokeStyle='#6ac0ff';c.lineWidth=3;c.beginPath();c.arc(fx,fy,24,0,TAU);c.stroke();
 for(let i=0;i<p.maxHp;i++){const x=66+i*19,y=top+10;c.fillStyle=i<p.hp?'#ff4a5a':'rgba(255,255,255,0.15)';c.beginPath();c.moveTo(x+8,y+15);c.bezierCurveTo(x-6,y+6,x+1,y-3,x+8,y+4);c.bezierCurveTo(x+15,y-3,x+22,y+6,x+8,y+15);c.fill()}
 c.fillStyle='rgba(255,255,255,0.12)';rr2(66,top+30,114,9,4);c.fill();c.fillStyle=p.force>=JT.pushCost?'#5ab4ff':'#3a5a8a';rr2(66,top+30,114*p.force/100,9,4);c.fill();c.fillStyle='rgba(255,255,255,0.6)';c.fillRect(66+114*JT.pushCost/100,top+29,1.5,11);
 c.font='800 16px "Trebuchet MS",system-ui';c.textAlign='left';c.textBaseline='top';c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,0.7)';c.lineWidth=3;
 const s1='SCORE '+run.score.toLocaleString();c.strokeText(s1,66,top+44);c.fillText(s1,66,top+44);
 const s2='JIM x'+Math.max(0,run.lives)+'   ◆ '+G.shards+'/3';c.strokeText(s2,10,top+64);c.fillText(s2,10,top+64);
 if(G.boss&&!G.boss.dead&&G.boss.st!=='intro'||G.boss&&G.boss.st==='intro'&&G.bossCardT<=0){const B=G.boss,bw=Math.min(W*0.62,440),bx=(W-bw)/2,by=top+(portrait?96:58);c.fillStyle='rgba(0,0,0,0.6)';rr2(bx-3,by-3,bw+6,16,6);c.fill();c.fillStyle='#ff3046';rr2(bx,by,bw*B.hp/B.max,10,4);c.fill();c.font='900 16px "Trebuchet MS",system-ui';c.textAlign='center';c.textBaseline='bottom';c.strokeText(B.name,W/2,by-4);c.fillStyle='#ffd8dc';c.fillText(B.name,W/2,by-4)}
 if(G.bossCardT>0&&G.boss){const a=clamp(Math.min(G.bossCardT,2.4-G.bossCardT)*3,0,1);c.globalAlpha=a;const fs=Math.min(48,W/12);c.font='900 '+fs+'px "Trebuchet MS",Impact,system-ui';c.textAlign='center';c.textBaseline='middle';const y=gameH*0.42;
  c.fillStyle='rgba(0,0,0,0.55)';c.fillRect(0,y-fs,W,fs*2);c.fillStyle='#ff3046';c.fillRect(0,y-fs,W,3);c.fillRect(0,y+fs-3,W,3);c.lineWidth=5;c.strokeStyle='#000';c.strokeText(G.boss.name,W/2,y);const gr=c.createLinearGradient(0,y-fs/2,0,y+fs/2);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#ff6a7a');c.fillStyle=gr;c.fillText(G.boss.name,W/2,y);c.globalAlpha=1}
 if(G.tipT>0){const a=clamp(G.tipT,0,1);c.globalAlpha=a;c.font='800 17px "Trebuchet MS",system-ui';const lines=wrapText(G.tip,W*0.8);const lw=Math.max(...lines.map(l=>c.measureText(l).width))+26;const y=gameH*(portrait?0.25:0.22);c.fillStyle='rgba(6,20,40,0.82)';rr2(W/2-lw/2,y-14,lw,lines.length*22+12,10);c.fill();c.strokeStyle='#6ac0ff';c.lineWidth=2;c.stroke();c.fillStyle='#fff';c.textAlign='center';c.textBaseline='top';lines.forEach((l,i)=>c.fillText(l,W/2,y-8+i*22));c.globalAlpha=1}
 if(G.lock){const L=G.lock,bw=Math.min(W*0.6,340),bx=(W-bw)/2,by=gameH*0.7;c.fillStyle='rgba(0,0,0,0.6)';rr2(bx-4,by-4,bw+8,22,8);c.fill();c.fillStyle='#ff3046';rr2(bx,by,bw,14,6);c.fill();c.fillStyle='#4aa8ff';rr2(bx,by,bw*clamp(L.m,0,1),14,6);c.fill();c.font='900 18px "Trebuchet MS"';c.textAlign='center';c.textBaseline='bottom';c.fillStyle='#fff';c.fillText(TOUCHDEV?'TAP SABER FAST!':'MASH J / X!',W/2,by-8)}}
function rr2(x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
/* ---------- title background ---------- */
let titleT=0;const embers=[];
function renderTitleBg(){titleT+=1/60;const im=IMG.cover;c.setTransform(1,0,0,1,0,0);
 if(im){const z=1.06+Math.sin(titleT*0.2)*0.03;/* Oct 30: menu never covers Jim: portrait = art in the top band (menu below), landscape = Jim on the right (menu on the left) */
 if(portrait&&state==='title'){c.fillStyle='#04050a';c.fillRect(0,0,cv.width,cv.height);const s=cv.height*0.56/im.height*z;c.drawImage(im,cv.width*0.5-im.width*s*0.64,-im.height*s*0.03,im.width*s,im.height*s);const f=c.createLinearGradient(0,cv.height*0.40,0,cv.height*0.56);f.addColorStop(0,'rgba(4,5,10,0)');f.addColorStop(1,'rgba(4,5,10,1)');c.fillStyle=f;c.fillRect(0,cv.height*0.40,cv.width,cv.height*0.6)}
 else{const s=Math.max(cv.width/im.width,cv.height/im.height)*z;const fx=portrait?0.62:(state==='title'?0.02:0.5);c.drawImage(im,(cv.width-im.width*s)*fx,(cv.height-im.height*s)*0.4,im.width*s,im.height*s)}}
 const g=c.createLinearGradient(0,0,0,cv.height);g.addColorStop(0,'rgba(0,0,0,0.35)');g.addColorStop(0.5,'rgba(0,0,0,0.05)');g.addColorStop(1,'rgba(0,0,0,0.75)');c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height);
 if(embers.length<70)embers.push({x:Math.random()*W,y:H+10,vy:-rand(30,90),vx:rand(-15,15),s:rand(1,3),l:rand(3,7)});c.save();c.globalCompositeOperation='lighter';for(const e of embers){e.x+=e.vx/60;e.y+=e.vy/60;e.l-=1/60;c.fillStyle='rgba(255,160,70,'+clamp(e.l/3,0,0.8)+')';c.beginPath();c.arc(e.x*DPR,e.y*DPR,e.s*DPR,0,TAU);c.fill()}c.restore();for(let i=embers.length-1;i>=0;i--)if(embers[i].l<=0)embers.splice(i,1)}

/* ===== menus, crawl, gamepad ===== */
let state='boot',G=null,run={lives:3,score:0,level:0};
function showUI(h,cls){document.body.classList.add('uiopen');const u=$('ui');u.innerHTML='<div class="scr '+(cls||'')+'">'+h+'</div>';
 u.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();AU.unlock();AU.fx('menu');uiAct(b.dataset.a,b)}));gpFocus(0)}
function hideUI(){document.body.classList.remove('uiopen');$('ui').innerHTML=''}
function uiAct(a,b){
 if(a==='play')startGame(0);else if(a==='missions')missions();else if(a==='howto')howTo();else if(a==='title')toTitle();
 else if(a==='lvl')startGame(+b.dataset.n,true);else if(a==='go')beginLevel();else if(a==='resume')resumeGame();else if(a==='restart'){hideUI();loadLevel(run.level)}
 else if(a==='next')nextLevel();else if(a==='retry'){run.lives=3;run.score=run.levelScore||0;hideUI();loadLevel(run.level)}else if(a==='back')(G&&state==='pausehow'?pauseGame0():toTitle());
 else if(a==='share')shareGame()}
function toggleMute(){AU.unlock();save.muted=!AU.muted;persist();AU.setMute(save.muted);$('bMute').textContent=AU.muted?'🔇':'🔊'}
$('bMute').addEventListener('click',e=>{e.stopPropagation();toggleMute()});$('bPause').addEventListener('click',e=>{e.stopPropagation();if(state==='play')pauseGame();else if(state==='pause')resumeGame()});
function setHud(on){$('hud').hidden=!on;$('pad').hidden=!on}
const LOGO='<div class="logo"><div class="l1">JEDI JIM\'S</div><div class="l2">REBEL MISSION</div><div class="l3">— VOLUME 2 —</div></div>';
function toTitle(){state='title';G=null;setHud(false);AU.humSet(false,0);AU.play('title');
 showUI(LOGO+'<p class="tag">Stormtroopers. Speeder bikes. A Sith lord. One very brave Jim.</p><button class="btn" data-a="play">▶ PLAY</button><br><button class="btn alt" data-a="missions">MISSIONS</button><button class="btn alt" data-a="howto">HOW TO PLAY</button>'+(navigator.share?'<br><button class="btn dim" data-a="share">🔗 SHARE</button>':''),'title')}
function missions(){state='missions';showUI('<h2>MISSIONS</h2><div class="mis">'+LEVELS.map((L,i)=>'<button class="btn alt" data-a="lvl" data-n="'+i+'">'+L.num+'. '+L.name+(save['best'+i]?' <small>★ '+save['best'+i].toLocaleString()+'</small>':'')+'</button>').join('')+'</div><button class="btn dim" data-a="title">BACK</button>')}
function howTo(){const wasPause=state==='pause';state=wasPause?'pausehow':'howto';showUI('<h2>HOW TO PLAY</h2><ul class="how">'+
 '<li><b>Move:</b> swipe &amp; hold anywhere (left / right). <b>Jump:</b> swipe up, or the JUMP button. Jump again in mid-air for a <b>Force jump</b>.</li>'+
 '<li><b>SABER:</b> tap to slash (tap tap tap = 3-hit combo). <b>Hold SABER</b> to guard and deflect blaster bolts back at the troopers.</li>'+
 '<li><b>FORCE:</b> Force push! Sends stormtroopers flying, stuns Royal Guards, knocks back detonators, and blasts open sealed doors. Uses the blue Force bar.</li>'+
 '<li><b>Speeder bike:</b> swipe &amp; hold up/down to steer, left/right for speed, JUMP to hop logs. SABER slashes scouts beside you.</li>'+
 '<li><b>Bosses:</b> watch for <b>OPEN!</b> and strike. Deflect the walker\'s cannon bolts. In a <b>blade lock</b>, tap SABER as fast as you can!</li>'+
 '<li><b>Pickups:</b> blue crystal = health, blue orb = Force, gold ◆ = Light Ring shard (3 per mission).</li>'+
 '<li><b>Keyboard:</b> arrows/WASD move, Space/Up jump, J = saber (hold to guard), K = Force, P = pause, M = mute.</li>'+
 '<li><b>🎮 Game controller</b> (USB or Bluetooth, on computers and phones): left stick or d-pad moves, <b>A</b> jumps, <b>X</b> slashes (hold to guard), <b>Y</b>, <b>B</b> or <b>RB</b> = Force push, <b>Start</b> pauses. In menus: d-pad/stick to choose, <b>A</b> to confirm, <b>B</b> to go back.</li></ul>'+
 '<button class="btn" data-a="back">BACK</button>')}
function pauseGame0(){state='play';pauseGame()}
function pauseGame(){if(state!=='play')return;state='pause';clearInput();AU.humSet(false,0);if(AU.ctx)AU.duck(0.15);showUI('<h2>PAUSED</h2><button class="btn" data-a="resume">RESUME</button><br><button class="btn alt" data-a="restart">RESTART MISSION</button><button class="btn alt" data-a="howto">HOW TO PLAY</button><br><button class="btn dim" data-a="title">QUIT TO TITLE</button>')}
function resumeGame(){if(state!=='pause'&&state!=='pausehow')return;state='play';hideUI();if(AU.ctx)AU.duck(0.5);clearInput()}
function shareGame(){try{navigator.share({title:"Jedi Jim's Rebel Mission: Volume 2",text:'Play Jedi Jim\'s Rebel Mission: Volume 2 — a free game from Peter\'s Arcade!',url:location.origin+location.pathname}).catch(()=>{})}catch(e){}}
let toastT=null;function toast(s){const t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2600)}
function tip(s,t){if(!G)return;G.tip=s;G.tipT=t||3.2}
/* ----- opening crawl ----- */
function startCrawl(){state='crawl';hideUI();setHud(false);AU.play('title');if(window.SkipBtn)SkipBtn.show(endCrawl,{while:()=>state==='crawl'});const el=$('crawl');el.hidden=false;el.innerHTML='<div class="cr-hint">Tap to skip</div><div class="cr-wrap"><div class="cr"><p class="cr-t">VOLUME 2<br>RETURN OF THE LIGHT RING</p>'+
 '<p>Not so long ago, in a galaxy right next door, brave Jedi Jim rebuilt the glowing LIGHT RING and saved the Rebellion.</p><p>But the evil DARTH VEXIS has stolen the Ring! The Empire plans to use its power to fire a terrible new weapon from their battle station.</p><p>With his trusty lightsaber, a big smile and a whole lot of courage, Jim sneaks aboard a giant Star Destroyer to get it back....</p></div></div>';
 G=null;crawlT=0;crawlTimer=setTimeout(endCrawl,24000)}
let crawlT=0,crawlTimer=null;
function endCrawl(){if(state!=='crawl')return;clearTimeout(crawlTimer);$('crawl').hidden=true;$('crawl').innerHTML='';showCard(run.level)}
/* ----- gamepad ----- */
const GP={L:0,R:0,U:0,D:0,J:0,S:0,F:0,sx:0,sy:0,on:false};let gpPrev={},gpCount=0,gpNavT=0,gpIdx=0;
addEventListener('gamepadconnected',e=>{toast('🎮 Controller connected'+(e.gamepad&&e.gamepad.id?': '+e.gamepad.id.split('(')[0].trim().slice(0,32):''));gpCount++});
addEventListener('gamepaddisconnected',()=>{toast('🎮 Controller disconnected');clearGP()});
function clearGP(){for(const k of ['L','R','U','D','J','S','F'])GP[k]=0;GP.sx=GP.sy=0}
function gpFocus(i,kb){const bs=[...document.querySelectorAll('#ui [data-a]')];document.querySelectorAll('#ui .gpf').forEach(b=>b.classList.remove('gpf'));if(!bs.length||!(GP.on||kb||kbNav))return;gpIdx=(i+bs.length)%bs.length;bs[gpIdx].classList.add('gpf');bs[gpIdx].scrollIntoView({block:'nearest'})}
function pollGamepad(dt){let pads=[];try{pads=navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean):[]}catch(e){}
 if(pads.length&&!GP.on){GP.on=true;if(!gpCount){toast('🎮 Controller connected'+(pads[0].id?': '+pads[0].id.split('(')[0].trim().slice(0,32):''));gpCount++}gpFocus(gpIdx)}
 if(!pads.length){if(GP.on){GP.on=false;clearGP()}return}
 const pd=pads[0];const b=i=>!!(pd.buttons[i]&&(pd.buttons[i].pressed||pd.buttons[i].value>0.5));const ax=i=>pd.axes[i]||0;
 const x=Math.abs(ax(0))>0.3?ax(0):0,y=Math.abs(ax(1))>0.3?ax(1):0;
 const cur={A:b(0),B:b(1),X:b(2),Y:b(3),LB:b(4),RB:b(5),LT:b(6),RT:b(7),BK:b(8),ST:b(9),DU:b(12),DD:b(13),DL:b(14),DR:b(15)};
 const pr=k=>cur[k]&&!gpPrev[k];
 if(Object.values(cur).some(v=>v))AU.unlock();
 GP.L=cur.DL||x<-0.3?1:0;GP.R=cur.DR||x>0.3?1:0;GP.U=cur.DU||y<-0.5?1:0;GP.D=cur.DD||y>0.5?1:0;GP.sx=cur.DL?-1:cur.DR?1:x;GP.sy=cur.DU?-1:cur.DD?1:y;
 GP.J=cur.A?1:0;GP.S=(cur.X||cur.LB||cur.RT)?1:0;GP.F=(cur.Y||cur.B||cur.RB||cur.LT)?1:0;if(pr('X')||pr('LB')||pr('RT'))mashCount++;
 const menu=document.body.classList.contains('uiopen');
 if(state==='crawl'&&(pr('A')||pr('ST')||pr('B')))endCrawl();
 else if(menu){GP.J=GP.S=GP.F=0;gpNavT-=dt;const nav=(cur.DD||cur.DR||y>0.5||x>0.5)?1:(cur.DU||cur.DL||y<-0.5||x<-0.5)?-1:0;
  if(nav&&gpNavT<=0){gpFocus(gpIdx+nav);gpNavT=gpPrev._nav?0.16:0.3;AU.fx('menu')}if(!nav)gpNavT=0;cur._nav=nav;
  if(pr('A')){const bs=[...document.querySelectorAll('#ui [data-a]')];const t=bs[gpIdx]||bs[0];if(t)t.click()}
  else if(pr('B')){const bk=document.querySelector('#ui [data-a="back"],#ui [data-a="resume"],#ui [data-a="title"]');if(bk&&state!=='title')bk.click()}
  else if(pr('ST')){if(state==='pause')resumeGame();else if(state==='title')startGame(0)}}
 else if(state==='play'&&pr('ST'))pauseGame();
 gpPrev=cur}

/* ===== game flow + loop ===== */
function startGame(i,skipCrawl){run={lives:3,score:0,level:i,levelScore:0};if(i===0&&!skipCrawl&&!QS.has('nocrawl'))startCrawl();else showCard(i)}
function showCard(i){state='card';G=null;setHud(false);const L=LEVELS[i];
 showUI('<div class="card"><div class="mnum">MISSION '+L.num+' OF '+LEVELS.length+'</div><h2>'+L.name.toUpperCase()+'</h2><div class="comm"><img src="art/jim_face.webp" alt="Jim"><p><small>'+L.from+':</small><br>'+L.card+'</p></div><button class="btn" data-a="go">GO, JIM! ▶</button></div>')}
function beginLevel(){hideUI();loadLevel(run.level)}
function newG(L){return{L,mode:L.mode,t:0,cam:{x:-100,y:0},solids:[],plats:[],spawns:[],enemies:[],bolts:[],nades:[],thrown:[],parts:[],texts:[],lights:[],pickups:[],props:[],doors:[],cps:[],hints:[],trigs:[],beams:[],vents:[],waves:[],ties:[],marks:[],obs:[],scouts:[],arena:null,boss:null,shake:0,hs:0,slowT:0,slowF:1,flash:null,combo:0,comboT:0,shards:0,tip:'',tipT:0,lbv:0,letterbox:0,camMin:-200,camMax:1e9,stats:{kills:0,deflects:0,pushes:0,boss:0},debris:1}}
function loadLevel(i){const L=LEVELS[i];run.level=i;run.levelScore=run.score;G=newG(L);BUILD[L.id](B());
 G.p=newPlayer(80,GROUND);G.respawn={x:80,y:GROUND};
 if(L.mode==='bike'){startBike();G.camMax=1e9}else{G.spawns.forEach(spawnEnemy);let mx=0;G.solids.forEach(s=>{if(s.kind!=='wall')mx=Math.max(mx,s.x+s.w)});G.camMax=mx-viewW}
 G.cam.x=G.mode==='bike'?-viewW*0.25:-60;G.cam.y=VH-VV;state='play';setHud(true);clearInput();AU.unlock();AU.play(L.music);AU.humStart();AU.fx('ignite');
 $('bJump').textContent='JUMP';$('swipeHint').textContent=L.mode==='bike'?'SWIPE & HOLD UP/DOWN TO STEER':'SWIPE & HOLD TO MOVE · SWIPE UP TO JUMP';
 tip(L.num+'. '+L.name,2.6);if(QS.get('x')&&window.__QA){G.p.x=+QS.get('x');G.p.y=groundAt(G.p.x,0)||GROUND}}
function nextLevel(){hideUI();if(run.level+1>=LEVELS.length){winScreen();return}run.level++;showCard(run.level)}
function levelClear(){if(G.clear)return;G.clear=true;AU.play('victory');AU.humSet(false,0);const i=run.level;if(!save['best'+i]||run.score>save['best'+i])save['best'+i]=run.score;save.reached=Math.max(save.reached||0,i+1);persist();
 setTimeout(()=>{if(!G||!G.clear)return;state='clear';setHud(false);const last=i===LEVELS.length-1;
  showUI('<h2>MISSION COMPLETE!</h2><p class="big">'+G.L.name+'</p><table class="st"><tr><td>Score</td><td><b>'+run.score.toLocaleString()+'</b></td></tr><tr><td>Troopers defeated</td><td>'+G.stats.kills+'</td></tr><tr><td>Bolts deflected</td><td>'+G.stats.deflects+'</td></tr><tr><td>Light Ring shards</td><td>'+G.shards+' / 3</td></tr></table><button class="btn" data-a="next">'+(last?'FINALE ▶':'NEXT MISSION ▶')+'</button><br><button class="btn dim" data-a="title">TITLE</button>')},1400)}
function gameOver(){state='over';setHud(false);AU.play('gameover');AU.humSet(false,0);showUI('<h2>JIM HAS FALLEN...</h2><p>But a Jedi never gives up!</p><p>Score: <b>'+run.score.toLocaleString()+'</b></p><button class="btn" data-a="retry">TRY AGAIN</button><br><button class="btn alt" data-a="missions">MISSIONS</button><button class="btn dim" data-a="title">TITLE</button>')}
function winScreen(){state='win';G=null;setHud(false);AU.play('victory');save.won=1;persist();
 showUI(LOGO+'<h2>THE LIGHT RING IS SAFE!</h2><p>Darth Vexis is beaten, the battle station is space dust, and the whole Rebellion is cheering for Jim.</p><p class="big">Final score: <b>'+run.score.toLocaleString()+'</b></p><p class="sub">Thanks for playing! Made with love for Jim.</p><button class="btn" data-a="play">PLAY AGAIN</button><button class="btn alt" data-a="missions">MISSIONS</button>','title')}
/* ---- triggers / set pieces ---- */
function stepTriggers(){const p=G.p;for(const t of G.trigs){if(t.done)continue;const lead=t.name==='arena'||t.name==='walker'?0:viewW*0.35;if(p.x<t.x-lead)continue;t.done=true;
 if(t.name==='tie'){G.ties.push({ph:0,t:0,bx:G.cam.x*0.25+viewW+120,by:170,pass:0});AU.fx('tie')}
 else if(t.name==='rappel'){t.xs.forEach((x,i)=>setTimeout(()=>{if(G)spawnEnemy({type:'trooper',x,st:'rappel'})},i*450));G.alarmT=4;AU.fx('alarm');tip('Troopers dropping in!',2)}
 else if(t.name==='arena')startArena();else if(t.name==='scouts')spawnScouts(t.n)}}
function stepTies(dt){const p=G.p;for(const t of G.ties){t.t+=dt;
 if(t.ph===0){t.bx-=520*dt;t.by+=10*dt;if(t.t>1.5){t.ph=1;t.t=0;t.x=G.cam.x+viewW+260;t.y=90;t.sc=0.42;t.ft=0;AU.fx('tie')}}
 else{t.x-=(900-p.vx*0.5)*dt;t.y=90+Math.sin(t.t*2)*20;t.rot=-0.08;t.ft-=dt;if(t.ft<=0&&t.x>G.cam.x+40&&t.x<G.cam.x+viewW+40){t.ft=0.2;const tx=p.x+rand(-140,180),ty=groundAt(tx,0)??GROUND;const a=Math.atan2(ty-(t.y-20),tx-t.x);G.bolts.push({x:t.x,y:t.y-20,vx:Math.cos(a)*950,vy:Math.sin(a)*950,owner:'e',life:2,col:'#3aff5a',len:34,w:4.5,tie:1,ty});G.marks.push({x:tx,y:ty,t:0.6});AU.fx('blasterFar')}
  if(t.x<G.cam.x-420){t.pass++;if(t.pass<2){t.x=G.cam.x+viewW+380;t.t=0;AU.fx('tie')}else t.dead=true}}}
 G.ties=G.ties.filter(t=>!t.dead);for(const m of G.marks)m.t-=dt;G.marks=G.marks.filter(m=>m.t>0);
 for(const b of G.bolts){if(b.tie&&b.owner==='e'&&b.y>=b.ty-2){b.dead=true;explodeSmall(b.x,b.ty-8);if(Math.abs(p.x-b.x)<62&&Math.abs(p.y-b.ty)<40)playerHurt(1,b,sgn(p.x-b.x))}}}
function stepMovers(dt){for(const m of G.plats){if(!m.mover)continue;const k=0.5-0.5*Math.cos(G.t*TAU/m.per);const nx=m.x0+m.ax*k,ny=m.y0+m.ay*k;m.dx=nx-m.x;m.dy=ny-m.y;m.x=nx;m.y=ny;const p=G.p;if(p.ride===m){p.y=m.y}}}
function stepBeams(dt){const p=G.p;for(const b of G.beams){const on=((G.t+b.ph)%b.per)<b.on;if(on&&!p.dead&&Math.abs(p.x-b.x)<22&&p.y>b.y0&&p.inv<=0){playerHurt(1,b,p.x<b.x?-1:1);p.vx=(p.x<b.x?-1:1)*380}}
 for(const v of G.vents){v.t+=dt;if(v.t%3<1.2&&Math.random()<0.5)P({x:v.x+rand(-8,8),y:GROUND-2,vx:rand(-20,20),vy:-rand(140,260),l:1,m:1,s:rand(8,16),c:'#b8c4d0',smoke:1,g:-60})}}
function stepPickups(dt){const p=G.p;for(const q of G.pickups){if(q.got)continue;q.t+=dt;if(q.drop){q.vy=(q.vy||0)+1400*dt;q.y+=q.vy*dt;const g=groundAt(q.x,q.y-10);if(g!==null&&q.y>g-26){q.y=g-26;q.vy=0;q.drop=0}}
 const hit=G.mode==='bike'?Math.abs(q.x-p.x)<90&&Math.abs(q.y-p.y)<34:Math.abs(q.x-p.x)<42&&Math.abs(q.y-(p.y-55))<70;if(!hit||p.dead)continue;q.got=true;
 if(q.type==='kyber'){p.hp=Math.min(p.maxHp,p.hp+2);AU.fx('heal');txt(q.x,q.y-30,'+HEALTH','#8fd4ff')}else if(q.type==='force'){p.force=Math.min(100,p.force+60);AU.fx('pickup');txt(q.x,q.y-30,'+FORCE','#b8a8ff')}
 else{G.shards++;run.score+=500;AU.fx('shard');txt(q.x,q.y-30,'LIGHT RING SHARD '+G.shards+'/3','#ffe27a');ring(q.x,q.y,'#ffd060',50)}burst(q.x,q.y,12,['#ffffff','#9ad8ff'],200,0.5,3)}}
function stepParts(dt){for(const q of G.parts){q.l-=dt;q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.rock)q.rot+=q.vr*dt;if(q.smoke){q.vx*=0.97}}G.parts=G.parts.filter(q=>q.l>0);if(G.parts.length>900)G.parts.splice(0,G.parts.length-900);
 for(const t of G.texts){t.l-=dt}G.texts=G.texts.filter(t=>t.l>0);for(const L of G.lights){L.l-=dt}G.lights=G.lights.filter(L=>L.l>0||L.frame);for(const w of G.waves)w.t+=dt;G.waves=G.waves.filter(w=>w.t<0.5)}
function stepCamera(dt){const p=G.p;if(G.mode==='bike'){G.cam.x=p.x-viewW*(portrait?0.2:0.24)}else{const A=G.arena;let mn=G.camMin,mx=Math.max(G.camMin,G.camMax);if(A&&A.on){mn=A.x0;mx=A.x1-viewW;if(mx<mn){mn=mx=(A.x0+A.x1)/2-viewW/2}}
  let tx=p.x-viewW*0.42+p.face*viewW*0.06;if(G.boss&&!G.boss.dead&&G.boss.x){tx=lerp(tx,(p.x+G.boss.x)/2-viewW/2,0.45)}tx=clamp(tx,mn,mx);G.cam.x=lerp(G.cam.x,tx,1-Math.pow(0.0015,dt))}
 G.cam.y=VH-VV;const s=G.shake;G.shx=s>0.3?rand(-s,s):0;G.shy=s>0.3?rand(-s,s):0;G.shake=Math.max(0,s-dt*40)}
function step(dt){if(!G||state!=='play')return;if(G.hs>0){G.hs-=dt;return}
 if(G.slowT>0){G.slowT-=dt;dt*=G.slowF}
 G.t+=dt;if(G.tipT>0)G.tipT-=dt;if(G.bossCardT>0)G.bossCardT-=dt;if(G.alarmT>0)G.alarmT-=dt;if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0}if(G.flash){G.flash.a-=dt*2;if(G.flash.a<=0)G.flash=null}
 const intro=G.bossIntro>0;if(intro){G.bossIntro-=dt}G.lbv=lerp(G.lbv,intro?1:0,0.08);G.cine=intro;
 if(G.mode==='bike'){stepBike(dt);stepTriggers();if(G.boss)G.boss.step(dt)}
 else{stepMovers(dt);stepPlayer(dt);stepTriggers();stepTies(dt);stepBeams(dt);stepEnemies(dt);if(G.boss)G.boss.step(dt);stepLock(dt);stepThrown(dt);stepNades(dt)}
 stepBolts(dt);stepPickups(dt);stepParts(dt);stepCamera(dt);
 if(G.boss&&G.boss.dead&&G.boss.type==='vexis'&&!G.ringShown){G.ringShown=1;setTimeout(()=>{if(G&&G.p){G.ringFx=1;tip('Jim reclaims the LIGHT RING!',3);AU.fx('shard')}},1300)}
 if(G.ringFx){G.ringFx+=dt;const p=G.p;for(let i=0;i<3;i++){const a=rand(0,TAU);P({x:p.x+Math.cos(a)*60,y:p.y-150+Math.sin(a)*60,vx:-Math.cos(a)*40,vy:-Math.sin(a)*40,l:0.6,m:0.6,s:3,c:'#ffe27a',add:true,g:0})}G.lights.push({x:p.x,y:p.y-150,r:220,c:'rgba(255,220,120,0.3)',l:0.02,m:0.02,frame:1})}}
let last=performance.now(),acc=0;
function frame(now){const dt=Math.min(0.05,(now-last)/1000);last=now;pollGamepad(dt);readInput();
 if(state==='play'){let t=dt*(window.__QA?+(QS.get('speed')||1):1);while(t>0.0001){const h=Math.min(t,1/60);step(h);t-=h}}
 try{render()}catch(e){console.error(e)}requestAnimationFrame(frame)}
/* ---- QA bot (only with ?bot=1) ---- */
let botS={};function botInput(){const p=G.p;if(!p)return;if(botS.G!==G)botS={G};const o={L:0,R:0,j:0,s:0,f:0,sy:0};
 if(G.mode==='bike'){let best=p.y,score=-1;for(let y=BK.y0;y<=BK.y1;y+=19){let sc=1000;for(const ob of G.obs){if(ob.hit)continue;const dx=ob.x-p.x;if(dx<-60||dx>520)continue;if(Math.abs(ob.y-y)<34&&ob.type==='tree')sc=Math.min(sc,dx)}sc-=Math.abs(y-p.y)*0.15;if(sc>score){score=sc;best=y}}
  o.sy=clamp((best-p.y)/40,-1,1);for(const ob of G.obs){if(!ob.hit&&ob.type!=='tree'){const dx=ob.x-p.x;if(dx>60&&dx<150&&Math.abs(ob.y-p.y)<30)o.j=1}}
  const near=G.bolts.some(b=>b.owner==='e'&&Math.hypot(b.x-p.x,b.y-(p.y-60))<240);const sc=G.scouts.some(s=>s.st!=='crash'&&Math.abs(s.x-p.x)<140&&Math.abs(s.y-p.y)<55);
  if(sc)o.s=(G.t*10|0)%2;else if(near||G.boss&&!G.boss.dead)o.s=1;if(G.scouts.filter(s=>s.st!=='crash'&&s.x>p.x&&s.x<p.x+380).length>=2&&p.force>40)o.f=(G.t*4|0)%2;
  inp.sy=o.sy;inp.U=o.sy<-0.2?1:0;inp.D=o.sy>0.2?1:0}
 else{const B=G.boss&&!G.boss.dead?G.boss:null;let dir=1;
  if(B){const d=B.x-p.x;const want=B.type==='bucketon'?0:110;dir=Math.abs(d)>want+30?sgn(d):(Math.abs(d)<want-50?-sgn(d):0);if(B.type==='bucketon'){dir=Math.abs(d)>40?sgn(d):0}}
  else if(G.arena&&G.arena.on)dir=sgn((G.arena.x0+G.arena.x1)/2-p.x);
  const ahead=p.x+dir*70;const gap=dir&&!solidUnder(ahead,p.y)&&!solidUnder(p.x+dir*40,p.y);
  const wall=G.solids.some(s=>!s.dead&&s.kind!=='floor'&&s.kind!=='door'&&p.x+dir*46>s.x&&p.x+dir*46<s.x+s.w&&s.y<p.y-8&&s.y>p.y-200);
  if(p.onG&&(gap||wall))o.j=1;if(!p.onG&&p.vy>50&&p.jumps<2&&groundAt(p.x+dir*30,p.y-2)===null)o.j=1;
  const door=G.doors.find(d=>!d.dead&&(d.x-p.x)*dir>0&&Math.abs(d.x-p.x)<200);if(door){if(p.force>=34)o.f=1;else dir=0}
  const en=G.enemies.find(e=>!e.dead&&e.st!=='rappel'&&Math.abs(e.x-p.x)<150&&Math.abs(e.y-p.y)<130);const gd=G.enemies.find(e=>!e.dead&&e.type==='guard'&&e.stun<=0&&Math.abs(e.x-p.x)<260&&Math.abs(e.y-p.y)<80);
  const bolt=G.bolts.find(b=>b.owner==='e'&&Math.abs(b.x-p.x)<230&&Math.abs(b.y-(p.y-55))<110&&sgn(b.vx)===sgn(p.x-b.x));
  if(gd&&p.force>=34){p.face=sgn(gd.x-p.x);o.f=1}else if(en){p.face=sgn(en.x-p.x);o.s=(G.t*12|0)%2;dir=Math.abs(en.x-p.x)>70?sgn(en.x-p.x):0}
  else if(bolt||B&&B.type==='vexis'&&(B.st==='wind'||B.st==='strike'||B.zap>0)||B&&B.st==='charge'){o.s=1;dir=bolt?0:dir;if(B&&B.zap>0)dir=0}
  else if(B){const d=Math.abs(B.x-p.x);const open=B.st==='open'||B.st==='knock'||B.st==='stagger'||B.visor>0||B.st==='debris';if(B.type==='bucketon'){if(B.y>GROUND-200&&d<120)o.s=(G.t*12|0)%2;if(B.visor>0&&d<80&&p.onG&&B.y<GROUND-160)o.j=1;if(!p.onG&&d<120)o.s=(G.t*12|0)%2}else if(d<150&&(open||Math.random()<0.02))o.s=(G.t*12|0)%2;if(G.thrown.some(t=>!t.held&&t.owner==='e'&&Math.abs(t.x-p.x)<260)&&p.force>=34)o.f=1;if(G.nades.some(n=>n.owner==='e'&&Math.abs(n.x-p.x)<200)&&p.force>=34)o.f=1}
  if(G.lock)o.s=(G.t*20|0)%2;
  for(const b of G.beams){const on=((G.t+b.ph)%b.per)<b.on;const soon=((G.t+b.ph+0.6)%b.per)<b.on;if((on||soon)&&(b.x-p.x)*dir>0&&Math.abs(b.x-p.x)<80)dir=0}
  const mv=G.plats.find(m=>m.mover&&gap);if(gap&&p.onG&&!wall){const far=[60,140,220,300].every(d=>groundAt(p.x+dir*d,p.y-200)===null);if(far){const mm=G.plats.find(m=>m.mover&&Math.abs(m.y-p.y)<120&&((m.x+m.w/2)-p.x)*dir>0&&Math.abs(m.x+m.w/2-p.x)<260);if(!mm){o.j=0;dir=0}}}
  o.L=dir<0?1:0;o.R=dir>0?1:0;
  botS.lx=botS.lx||p.x;botS.t=(botS.t||0)+1/60;if(p.x>botS.lx+40||B||G.arena&&G.arena.on){botS.lx=Math.max(p.x,botS.lx);botS.t=0}if(botS.t>6){botS.t=0;let nx=p.x+40;while(nx<p.x+1400&&groundAt(nx,-400)===null)nx+=20;nx+=40;p.x=nx;p.y=(groundAt(nx,-400)??GROUND)-1;p.vy=0;p.safe={x:p.x,y:p.y};G.stats.botWarps=(G.stats.botWarps||0)+1;botS.lx=p.x}}
 inp.L=o.L;inp.R=o.R;if(G.mode!=='bike')inp.sx=o.R-o.L;inp.jumpP=o.j&&!botS.j?1:0;inp.jump=o.j;botS.j=o.j;inp.saberP=o.s&&!botS.s?1:0;inp.saber=o.s;if(inp.saberP)mashCount++;botS.s=o.s;inp.forceP=o.f&&!botS.f?1:0;inp.force=o.f;botS.f=o.f}
/* ---- boot ---- */
window.__T={get G(){return G},get state(){return state},loadLevel,startGame,levelClear,LEVELS,get run(){return run},skipBoss(){if(G&&G.boss)G.boss.damage(999)}};
if(QS.get('qa'))window.__QA=1;if(QS.get('bot'))window.__BOT=1;if(QS.get('god'))window.__GOD=1;
$('bMute').textContent=AU.muted?'🔇':'🔊';
resize();requestAnimationFrame(frame);
loadArt().then(()=>{const lv=QS.get('level');if(lv&&window.__QA){run={lives:3,score:0,level:+lv-1,levelScore:0};loadLevel(+lv-1)}else toTitle()});
document.addEventListener('pointerdown',()=>{AU.unlock();if(state==='title'&&!AU.cur)AU.play('title')},{capture:true});

