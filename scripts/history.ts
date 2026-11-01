export type Day = {date:string;contributionCount:number};
const DAY=86_400_000;
function stamp(date:string):number {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid contribution date');
 const n=Date.parse(date+'T00:00:00Z');
 if(!Number.isFinite(n)||new Date(n).toISOString().slice(0,10)!==date)throw Error('Invalid contribution date');
 return n;
}
function normalize(days:Day[],today:string):Day[]{
 if(!days.length)throw Error('Missing contribution history');
 const end=stamp(today),unique=new Map<string,Day>();
 for(const d of days){if(stamp(d.date)>end||!Number.isSafeInteger(d.contributionCount)||d.contributionCount<0)throw Error('Invalid contribution count');const previous=unique.get(d.date);if(previous&&previous.contributionCount!==d.contributionCount)throw Error('Conflicting boundary date');unique.set(d.date,d);}
 return [...unique.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
export function streaks(input:Day[],today:string){
 const days=normalize(input,today);let longest=0,run=0,last=-Infinity;
 for(const d of days){const t=stamp(d.date);run=d.contributionCount>0?(t-last===DAY?run+1:1):0;longest=Math.max(longest,run);last=t;}
 const byDate=new Map(days.map(d=>[stamp(d.date),d.contributionCount]));let cursor=stamp(today),current=0;
 if(!byDate.get(cursor))cursor-=DAY;
 const end=new Date(cursor).toISOString().slice(0,10);
 while((byDate.get(cursor)||0)>0){current++;cursor-=DAY;}
 return {current,longest,start:current?new Date(cursor+DAY).toISOString().slice(0,10):'',end:current?end:''};
}
export function summarize(recent:Day[],history:Day[],today:string,reportedTotal?:number){
 const days=normalize(recent,today),all=normalize(history,today);
 if(days.length>366)throw Error('Recent period exceeds one year');
 for(let i=1;i<days.length;i++)if(stamp(days[i].date)-stamp(days[i-1].date)!==DAY)throw Error('Incomplete recent calendar');
 const weekly=new Map<number,number>();
 for(const d of days){const t=stamp(d.date),sunday=t-new Date(t).getUTCDay()*DAY;weekly.set(sunday,(weekly.get(sunday)||0)+d.contributionCount);}
 const dailyTotal=days.reduce((n,d)=>n+d.contributionCount,0);
 if(reportedTotal!==undefined&&(!Number.isSafeInteger(reportedTotal)||reportedTotal<0))throw Error('Invalid reported total');
 return {today,days,profileViews:null as number|null,total:reportedTotal??dailyTotal,dailyTotal,active:days.filter(d=>d.contributionCount>0).length,weekly:[...weekly.values()],historyStart:all[0].date,...streaks(all,today)};
}
export function parseViews(svg:string):number {
 if(svg.length>65_536||!/<svg\b/.test(svg))throw Error('Invalid counter response');
 const texts=[...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map(m=>m[1].trim());
 if(!texts.some(t=>/^profile views$/i.test(t)))throw Error('Counter label missing');
 const values=texts.filter(t=>!/^profile views$/i.test(t));
 if(!values.length||values.some(t=>!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)$/.test(t)))throw Error('Counter count unavailable');
 const counts=values.map(t=>Number(t.replaceAll(',','')));
 if(counts.some(n=>!Number.isSafeInteger(n))||new Set(counts).size!==1)throw Error('Invalid counter count');
 return counts[0];
}
export type Summary=ReturnType<typeof summarize>;
export function render(m:Summary,theme:'light'|'dark'):string {
 const dark=theme==='dark',bg=dark?'#000000':'#ffffff',fg=dark?'#ffffff':'#0d0d0d',muted=dark?'#b3b3b3':'#555555',border=dark?'#404040':'#d5d5d5';
 const shades=dark?['#161616','#444444','#777777','#b3b3b3','#ffffff']:['#f2f2f2','#cfcfcf','#999999','#555555','#0d0d0d'];
 const text=(x:number,y:number,s:string,size=14,color=fg,weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${s}</text>`;
 const line=(y:number)=>`<path d="M28 ${y}H832" stroke="${border}"/>`;
 const fmt=(n:number)=>n.toLocaleString('en-US');
 if(m.profileViews!==null&&(!Number.isSafeInteger(m.profileViews)||m.profileViews<0))throw Error('Invalid view count');
 const metrics=[[fmt(m.total),'contributions',`last ${m.days.length} days`],[m.profileViews===null?'—':fmt(m.profileViews),'profile views','daily snapshot'],[fmt(m.active),'active days',`of ${m.days.length} days`],[String(m.current),'current streak','days ⁜ UTC'],[String(m.longest),'longest streak','days ⁜ all-time']];
 let body=`<rect x=".5" y=".5" width="859" height="659" rx="12" fill="${bg}" stroke="${border}"/>`;
 const joinedLabel=new Date(stamp(m.historyStart)).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
 body+=text(28,30,'on GitHub since',14,muted)+text(28,67,joinedLabel,30,fg,600);
 body+=text(832,30,'i am. i think. i will.',15,fg,500).replace('<text ','<text text-anchor="end" ');
 body+=text(832,58,`${m.days[0].date} to ${m.today}`,12,muted).replace('<text ','<text text-anchor="end" ');
 metrics.forEach(([value,label,scope],i)=>{const x=28+i*164;body+=text(x,115,value,32,fg,600)+text(x,142,label,15)+text(x,163,scope,12,muted)});
 body+=line(183)+text(28,214,'contribution calendar',17,fg,600);
 const first=stamp(m.days[0].date),start=first-new Date(first).getUTCDay()*DAY,max=Math.max(1,...m.days.map(d=>d.contributionCount));
 let month=-1;
 for(const d of m.days){const t=stamp(d.date),date=new Date(t),col=Math.floor((t-start)/(DAY*7)),row=date.getUTCDay(),x=48+col*14.7,y=251+row*14.7;
  if(date.getUTCMonth()!==month){month=date.getUTCMonth();body+=text(x,237,date.toLocaleDateString('en-US',{month:'short',timeZone:'UTC'}),11,muted)}
  const level=d.contributionCount===0?0:Math.min(4,1+Math.floor(d.contributionCount/max*3));
  body+=`<rect class="day" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="11.7" height="11.7" rx="2" fill="${shades[level]}"><title>${d.date}: ${d.contributionCount} contributions</title></rect>`;
 }
 body+=text(28,273,'M',10,muted)+text(28,303,'W',10,muted)+text(28,332,'F',10,muted)+text(659,375,'less',11,muted);
 shades.forEach((fill,i)=>body+=`<rect x="${690+i*17}" y="364" width="12" height="12" rx="2" fill="${fill}"/>`);
 body+=text(782,375,'more',11,muted)+line(396)+text(28,430,'weekly activity',17,fg,600)+text(832,430,'contributions',12,muted).replace('<text ','<text text-anchor="end" ');
 const peak=Math.max(1,...m.weekly),left=48,top=456,width=776,height=112;
 for(let i=0;i<3;i++){const y=top+i*height/2;body+=`<path d="M${left} ${y}h${width}" stroke="${border}"/>`+text(28,y+4,String(Math.round(peak*(1-i/2))),10,muted).replace('<text ','<text text-anchor="end" ')}
 const points=m.weekly.map((n,i)=>`${(left+i*width/Math.max(1,m.weekly.length-1)).toFixed(2)},${(top+height-n/peak*height).toFixed(2)}`).join(' ');
 body+=`<polyline points="${left},${top+height} ${points} ${left+width},${top+height}" fill="${fg}" fill-opacity=".06" stroke="none"/><polyline points="${points}" fill="none" stroke="${fg}" stroke-width="2" stroke-linejoin="round"/>`;
 body+=text(left,589,m.days[0].date,11,muted)+text(824,589,m.today,11,muted).replace('<text ','<text text-anchor="end" ');
 body+=text(28,618,m.current?`current run ⁜ ${m.start} to ${m.end}`:'current run ⁜ no active streak',12,muted);
 body+=text(28,642,`all-time streak history from ${m.historyStart} ⁜ updated ${m.today} UTC`,12,muted);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 660" role="img" aria-labelledby="title desc"><title id="title">Onur's GitHub history</title><desc id="desc">On GitHub since ${joinedLabel}. ${m.total} contributions and ${m.active} active days in this period. Profile view snapshot: ${m.profileViews===null?'unavailable':m.profileViews}. Current streak ${m.current} days. All-time longest streak ${m.longest} days. Calendar and weekly contribution activity.</desc><g font-family="Helvetica Neue, Helvetica, Arial, sans-serif">${body}</g></svg>\n`;
}
