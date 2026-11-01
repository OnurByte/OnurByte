import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {summarize,render,type Day} from './history.ts';
type Calendar={totalContributions:number;weeks:{contributionDays:Day[]}[]};
const fields='contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }';
function query<T>(query:string):T {
 const result=JSON.parse(execFileSync('gh',['api','graphql','--input','-'],{input:JSON.stringify({query}),encoding:'utf8',maxBuffer:4*1024*1024,timeout:45_000})) as {data?:T;errors?:unknown[]};
 if(result.errors?.length||!result.data)throw Error('GitHub history query failed; existing artwork retained');
 return result.data;
}
const today=new Date().toISOString().slice(0,10);
const current=query<{user:{createdAt:string;contributionsCollection:{contributionCalendar:Calendar}}}>(`query {user(login:"OnurByte"){createdAt contributionsCollection {${fields}}}}`).user;
const joined=current.createdAt.slice(0,10),year=Number(today.slice(0,4)),firstYear=Number(joined.slice(0,4));
if(!/^\d{4}-\d{2}-\d{2}$/.test(joined)||firstYear<2008||firstYear>year)throw Error('Invalid account creation date');
const ranges=[];
for(let y=firstYear;y<=year;y++){
 const from=y===firstYear?joined+'T00:00:00Z':`${y}-01-01T00:00:00Z`;
 const to=y===year?new Date().toISOString():`${y}-12-31T23:59:59Z`;
 ranges.push(`y${y}: contributionsCollection(from:"${from}",to:"${to}"){${fields}}`);
}
const history=query<{user:Record<string,{contributionCalendar:Calendar}>}>(`query {user(login:"OnurByte"){${ranges.join('\n')}}}`).user;
const recent=current.contributionsCollection.contributionCalendar.weeks.flatMap(w=>w.contributionDays);
const all=Object.values(history).flatMap(c=>c.contributionCalendar.weeks.flatMap(w=>w.contributionDays));
const unique=new Set(all.map(d=>d.date));
const expected=(Date.parse(today)-Date.parse(joined))/86_400_000+1;
if(unique.size!==expected||!unique.has(joined)||!unique.has(today))throw Error('Incomplete all-time history; existing artwork retained');
const model=summarize(recent,all,today,current.contributionsCollection.contributionCalendar.totalContributions);
// GitHub reports the aggregate separately from daily squares; preserve both source values.
// Render both before writing either. API failures never replace good artwork with placeholders.
const light=render(model,'light'),dark=render(model,'dark');
mkdirSync('assets',{recursive:true});
writeFileSync('assets/github-history-light.svg',light);
writeFileSync('assets/github-history-dark.svg',dark);
console.log(`History updated ${today}: ${model.total} yearly contributions, ${model.current}-day current / ${model.longest}-day all-time longest streak; member since ${joined}`);
