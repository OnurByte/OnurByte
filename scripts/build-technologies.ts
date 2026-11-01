import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
type Mark={name:string;icon:string;source:string};
type Manifest={source:string;groups:{name:string;items:Mark[]}[]};
const manifest=JSON.parse(readFileSync('assets/technologies.json','utf8')) as Manifest;
const marks=manifest.groups.flatMap(g=>g.items);
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function mark(filename:string,x:number,y:number,size:number,ink:string){
 if(!/^[a-z0-9-]+\.svg$/.test(filename))throw Error('Invalid icon path');
 const original=readFileSync('assets/technology-icons/'+filename,'utf8');
 if(/<(?:script|image|foreignObject)\b|\bon\w+=/i.test(original))throw Error('Unexpected active icon content');
 const svg=original.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>\s*$/);
 const box=svg?.[1].match(/viewBox=["']([^"']+)["']/)?.[1];
 if(!svg||!box||!/^[-.\d\s]+$/.test(box))throw Error('Icon viewBox missing');
 const prefix=filename.replace('.svg','')+'-';
 let body=svg[2].replace(/<(?:title|desc)\b[^>]*>[\s\S]*?<\/(?:title|desc)>/g,'');
 body=body.replace(/\b(fill|stroke)=(["'])([^"']+)\2/g,(_,kind:string,q:string,value:string)=>`${kind}=${q}${value==='none'?'none':ink}${q}`);
 body=body.replace(/\bid=(["'])([^"']+)\1/g,(_,q:string,id:string)=>`id=${q}${prefix}${id}${q}`).replace(/url\(#([^)]+)\)/g,`url(#${prefix}$1)`);
 return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${box}" fill="${ink}" color="${ink}">${body}</svg>`;
}
mkdirSync('assets/links',{recursive:true});
for(const theme of ['light','dark'] as const){
 const dark=theme==='dark',ink=dark?'#ffffff':'#0d0d0d',bg=dark?'#000000':'#ffffff',border=dark?'#404040':'#d5d5d5';
 const columns=11,cell=75,rows=Math.ceil(marks.length/columns),height=rows*48+20;
 let body=`<rect x=".5" y=".5" width="859" height="${height-1}" rx="12" fill="${bg}" stroke="${border}"/>`;
 marks.forEach((m,i)=>{
  const center=55+(i%columns)*cell,y=10+Math.floor(i/columns)*48;
  body+=`<g><title>${escape(m.name)}</title>${mark(m.icon,center-10,y,20,ink)}<text x="${center}" y="${y+35}" text-anchor="middle" font-size="${m.name.length>12?10:11}" fill="${ink}">${escape(m.name)}</text></g>`;
 });
 writeFileSync(`assets/technologies-${theme}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 ${height}" role="img" aria-labelledby="title desc"><title id="title">Technologies I work with</title><desc id="desc">${escape(marks.map(m=>m.name).join(', '))}</desc><g font-family="Helvetica Neue, Helvetica, Arial, sans-serif">${body}</g></svg>\n`);
 const links=[{id:'onur',label:'onur.af',icon:'onur.svg',width:98},{id:'github',label:'GitHub',icon:'github.svg',width:92},{id:'linux',label:'Linux',icon:'linux.svg',width:82},{id:'neovim',label:'Neovim',icon:'neovim.svg',width:100}];
 for(const link of links){
  const text=link.id==='linux'||link.id==='neovim'?(dark?'#b3b3b3':'#555555'):ink;
  writeFileSync(`assets/links/${link.id}-${theme}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${link.width} 28" role="img" aria-label="${link.label}"><rect x=".5" y=".5" width="${link.width-1}" height="27" rx="6" fill="${bg}" stroke="${border}"/>${mark(link.icon,9,6,16,ink)}<text x="33" y="18.2" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="12" fill="${text}">${link.label}</text></svg>\n`);
 }
}
console.log(`Built ${marks.length} compact technology marks and four footer links in both themes.`);
