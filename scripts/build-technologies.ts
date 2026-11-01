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
 const height=manifest.groups.length*19+18;
 let body=`<rect x=".5" y=".5" width="759" height="${height-1}" rx="8" fill="${bg}" stroke="${border}"/>`;
 manifest.groups.forEach((group,row)=>{
  const y=9+row*19;let x=112;
  body+=`<text x="14" y="${y+13}" font-size="10" font-weight="500" fill="${dark?'#b3b3b3':'#555555'}">${escape(group.name.toLowerCase())}</text>`;
  group.items.forEach(m=>{
   body+=`<g><title>${escape(group.name+': '+m.name)}</title>${mark(m.icon,x,y+2,14,ink)}<text x="${x+19}" y="${y+13}" font-size="10.5" fill="${ink}">${escape(m.name)}</text></g>`;
   x+=32+m.name.length*5.8;
  });
  if(x>760)throw Error(`Category does not fit: ${group.name}`);
 });
 writeFileSync(`assets/technologies-${theme}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 ${height}" role="img" aria-labelledby="title desc"><title id="title">Technologies I work with</title><desc id="desc">${escape(manifest.groups.map(g=>g.name+': '+g.items.map(m=>m.name).join(', ')).join('. '))}</desc><g font-family="Helvetica Neue, Helvetica, Arial, sans-serif">${body}</g></svg>\n`);
 const links=[{id:'onur',label:'onur.af',icon:'onur.svg',width:98},{id:'github',label:'GitHub',icon:'github.svg',width:92},{id:'linux',label:'Linux',icon:'linux.svg',width:82},{id:'neovim',label:'Neovim',icon:'neovim.svg',width:100}];
 for(const link of links){
  const text=link.id==='linux'||link.id==='neovim'?(dark?'#b3b3b3':'#555555'):ink;
  writeFileSync(`assets/links/${link.id}-${theme}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${link.width} 28" role="img" aria-label="${link.label}"><rect x=".5" y=".5" width="${link.width-1}" height="27" rx="6" fill="${bg}" stroke="${border}"/>${mark(link.icon,9,6,16,ink)}<text x="33" y="18.2" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="12" fill="${text}">${link.label}</text></svg>\n`);
 }
}
console.log(`Built ${marks.length} compact technology marks and four footer links in both themes.`);
