import {test} from 'node:test';
import assert from 'node:assert/strict';
import {streaks, summarize, render, type Day} from '../scripts/history.ts';
const day=(date:string,count:number):Day=>({date,contributionCount:count});
test('current streak tolerates an unfinished UTC day, but not an inactive yesterday',()=>{
 const days=[day('2026-10-28',1),day('2026-10-29',0),day('2026-10-30',2),day('2026-10-31',3),day('2026-11-01',0)];
 assert.deepEqual(streaks(days,'2026-11-01'),{current:2,longest:2,start:'2026-10-30',end:'2026-10-31'});
 days[3].contributionCount=0;assert.equal(streaks(days,'2026-11-01').current,0);
});
test('longest streak spans years and ignores duplicate boundary days',()=>{
 const days=[day('2025-12-30',1),day('2025-12-31',2),day('2025-12-31',2),day('2026-01-01',3),day('2026-01-02',0)];
 assert.equal(streaks(days,'2026-01-02').longest,3);
});
test('a missing date cannot bridge a streak and future days are rejected',()=>{
 assert.equal(streaks([day('2026-10-29',1),day('2026-10-31',1)],'2026-11-01').longest,1);
 assert.throws(()=>streaks([day('2026-11-02',1)],'2026-11-01'));
});
test('malformed data is never turned into successful zero counts',()=>{
 assert.throws(()=>summarize([day('2026-11-01',-1)],[],'2026-11-01'));
 assert.throws(()=>summarize([],[],'2026-11-01'));
});
test('both theme panels contain real calendar, activity, full-history streak and source',()=>{
 const ds=Array.from({length:35},(_,i)=>day(new Date(Date.UTC(2026,9,i+1)).toISOString().slice(0,10),i%4));
 const m=summarize(ds,ds,'2026-11-04');
 for(const theme of ['light','dark'] as const){const svg=render(m,theme);assert.match(svg,/contribution calendar/);assert.match(svg,/weekly activity/);assert.match(svg,/longest streak/);assert.match(svg,/all-time/);assert.match(svg,/2026-11-04/);assert.doesNotMatch(svg,/NaN|undefined|(?:href|src)=|foreignObject|<script/);assert.equal((svg.match(/<rect class="day"/g)||[]).length,35);}
});

test('GitHub aggregate and daily counts retain their separate source values',()=>{const ds=[day('2026-11-01',3)];const m=summarize(ds,ds,'2026-11-01',5);assert.equal(m.total,5);assert.equal(m.dailyTotal,3);assert.throws(()=>summarize(ds,ds,'2026-11-01',NaN));});
