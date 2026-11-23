/* Générateur PDF autonome, sans serveur ni dépendance externe. */
(function(){
 const A4W=842,A4H=595;
 const latin=s=>String(s).replace(/[\u2019\u2018]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/[\u2022]/g,'-').replace(/[\u00a0]/g,' ').replace(/[\u2026]/g,'...').replace(/[^\x20-\xff]/g,'?');
 const pdfStr=s=>'('+latin(s).replace(/[\\()]/g,'\\$&')+')';
 const fmt=n=>Number(n.toFixed(2)).toString();
 function makePdf(pages,pageW=A4W,pageH=A4H){
  const objs=[null,'<< /Type /Catalog /Pages 2 0 R >>',null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  const kids=[];
  for(const commands of pages){const pageId=objs.length,contentId=pageId+1;kids.push(pageId+' 0 R');objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);objs.push(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`)}
  objs[2]=`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`;
  let output='%PDF-1.4\n%âãÏÓ\n',offsets=[0];for(let i=1;i<objs.length;i++){offsets[i]=output.length;output+=`${i} 0 obj\n${objs[i]}\nendobj\n`};const xref=output.length;output+=`xref\n0 ${objs.length}\n0000000000 65535 f \n`;for(let i=1;i<objs.length;i++)output+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';output+=`trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes=new Uint8Array(output.length);for(let i=0;i<output.length;i++)bytes[i]=output.charCodeAt(i)&255;return new Blob([bytes],{type:'application/pdf'});
 }
 function canvas(pageH=A4H){let lines=[];const cmd=x=>lines.push(x);const color=(r,g,b)=>cmd(`${r} ${g} ${b} rg`);const rect=(x,y,w,h,rgb)=>{color(...rgb);cmd(`${fmt(x)} ${fmt(pageH-y-h)} ${fmt(w)} ${fmt(h)} re f`)};
 const text=(s,x,y,size=11,bold=false,rgb=[.16,.22,.19])=>{color(...rgb);cmd(`BT /F${bold?2:1} ${size} Tf 1 0 0 1 ${fmt(x)} ${fmt(pageH-y)} Tm ${pdfStr(s)} Tj ET`)};
 const wrap=(s,maxWidth,size=11)=>{const words=latin(s).split(/\s+/);const rows=[];let row='';for(const word of words){const trial=row?row+' '+word:word;if(trial.length*size*.51>maxWidth&&row){rows.push(row);row=word}else row=trial}if(row)rows.push(row);return rows.length?rows:['']};return {rect,text,wrap,finish:()=>lines.join('\n')};}
 const header=(c,title,subtitle)=>{c.rect(0,0,A4W,88,[.14,.38,.27]);c.text(title,34,39,22,true,[1,1,1]);c.text(subtitle,35,62,10,false,[.88,.95,.89])};
 function menus(){
  // Toujours reconstruire à partir de la semaine configurée et du planning courant.
  const c=canvas(),ordered=weekDays(),start=ordered[0].date,end=ordered[6].date;
  const x=34,width=A4W-68,labelW=79,colW=(width-labelW)/7,headY=137,headH=64,rowH=151;
  c.rect(0,0,A4W,A4H,[.985,.981,.969]);
  c.rect(0,0,A4W,105,[.15,.34,.27]);
  c.rect(34,26,5,48,[.81,.72,.48]);
  c.text('MENUS DE LA SEMAINE',52,51,21,true,[1,1,1]);
  c.text('Du '+start.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+' au '+end.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}),53,75,11,false,[.87,.94,.89]);
  c.rect(x,117,width,4,[.79,.84,.73]);
  c.rect(x,headY,labelW-2,headH,[.86,.91,.85]);
  c.text('REPAS',x+12,headY+35,10,true,[.22,.38,.29]);
  ordered.forEach(({date,day},i)=>{
   const xx=x+labelW+i*colW;
   c.rect(xx,headY,colW-2,headH,i%2?[.89,.93,.88]:[.84,.90,.84]);
   c.text(days[day].toUpperCase().slice(0,3),xx+12,headY+25,11,true,[.2,.36,.27]);
   c.text(date.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}),xx+12,headY+45,10,false,[.36,.47,.38]);
  });
  ['m','s'].forEach((t,ri)=>{
   const y=headY+headH+5+ri*(rowH+5);
   c.rect(x,y,labelW-2,rowH,ri?[.82,.89,.84]:[.89,.91,.84]);
   c.text(t==='m'?'MIDI':'SOIR',x+13,y+28,12,true,[.19,.37,.28]);
   ordered.forEach(({day},i)=>{
    const xx=x+labelW+i*colW,id=day+'-'+t;
    c.rect(xx,y,colW-2,rowH,ri?(i%2?[.96,.97,.95]:[.98,.98,.96]):(i%2?[.975,.973,.953]:[1,.997,.98]));
    if(!state.config.meals.includes(id)){c.text('-',xx+colW/2-3,y+74,12,false,[.69,.73,.69]);return}
    const selected=plan()[id],r=recipe(selected),meal=typeof selected==='string'&&selected.startsWith('exception:')?selected.slice(10):r?.name;if(!meal)return;
    const lines=c.wrap(meal,colW-19,10.5).slice(0,7);
    const lineH=16,firstY=y+Math.max(29,(rowH-(lines.length-1)*lineH)/2);
    lines.forEach((line,j)=>c.text(line,xx+10,firstY+j*lineH,10.5,j===0,[.19,.28,.22]));
   });
  });
  c.rect(x,541,width,1,[.78,.84,.78]);
  c.text('Menus & Courses  |  Planning familial',x,560,9,false,[.39,.49,.42]);
  c.text('Planning du '+start.toLocaleDateString('fr-FR')+' au '+end.toLocaleDateString('fr-FR'),595,560,9,false,[.39,.49,.42]);
  return makePdf([c.finish()]);
 }
 function courses(){
  // Portrait A4, deux colonnes, catégories intactes et une seule page.
  const W=595,H=842,c=canvas(H),items=computed();
  const groups=categories.map(cat=>({cat,items:items.filter(p=>p.category===cat)})).filter(g=>g.items.length);
  const left=34,gap=18,colW=(W-68-gap)/2,top=104,bottom=802;
  c.rect(0,0,W,H,[.987,.985,.974]);c.rect(0,0,W,82,[.14,.36,.27]);
  c.text('LISTE DE COURSES',34,36,19,true,[1,1,1]);
  const start=startOfWeek(offset),end=new Date(start);end.setDate(end.getDate()+6);
  c.text('Du '+start.toLocaleDateString('fr-FR')+' au '+end.toLocaleDateString('fr-FR'),35,58,10,false,[.89,.95,.9]);
  // Calculer une taille qui tient dans deux colonnes sans tronquer les produits.
  function layout(font){
   const lineH=font+3.6,headH=23,spacing=9;
   const sections=groups.map(g=>({g,rows:g.items.map(p=>c.wrap(p.name+'  -  '+p.qty+' '+(p.unit||''),colW-36,font))}));
   const heights=sections.map(x=>headH+spacing+x.rows.reduce((n,r)=>n+r.length*lineH+4,0)+8);
   const columns=[[],[]],used=[0,0];
   for(let i=0;i<sections.length;i++){
    let col=used[0]<=used[1]?0:1;
    // Keep categories together whenever possible.
    if(used[col]+heights[i]>bottom-top&&used[1-col]+heights[i]<used[col]+heights[i])col=1-col;
    columns[col].push(i);used[col]+=heights[i];
   }
   return {sections,heights,columns,used,lineH,headH,spacing};
  }
  let font=10.5,L=layout(font);
  while(Math.max(...L.used)>bottom-top&&font>6.3){font-=.25;L=layout(font)}
  // Extraordinarily long lists are fitted with tighter spacing; never silently omit products.
  if(Math.max(...L.used)>bottom-top){const scale=(bottom-top)/Math.max(...L.used);font=Math.max(5.2,font*scale);L=layout(font)}
  L.columns.forEach((indices,col)=>{
   let y=top;const x=left+col*(colW+gap);
   for(const idx of indices){const section=L.sections[idx];
    c.rect(x,y,colW,21,[.86,.92,.86]);c.text(section.g.cat,x+9,y+14,10,true,[.2,.38,.28]);y+=L.headH+L.spacing;
    section.rows.forEach((rows,j)=>{
     const p=section.g.items[j];c.rect(x+5,y-8,9,9,[.87,.9,.87]);if(state.checked[p.key])c.text('X',x+6,y-1,8,true);
     rows.forEach(line=>{c.text(line,x+23,y,font,false,[.18,.24,.2]);y+=L.lineH});y+=4;
    });y+=8;
   }
  });
  c.rect(left,816,W-68,1,[.78,.84,.78]);c.text('Menus & Courses',left,830,8,false,[.43,.52,.46]);
  return makePdf([c.finish()],W,H);
 }
 function getPdf(type){return type==='menus'?menus():courses()}
 function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
 window.downloadPdf=type=>downloadBlob(getPdf(type),(type==='menus'?'planning_menus_':'liste_courses_')+week()+'_'+new Date().toISOString().replace(/[:.]/g,'-')+'.pdf');
 window.sharePdf=async type=>{const name=(type==='menus'?'planning_menus_':'liste_courses_')+week()+'_'+new Date().toISOString().replace(/[:.]/g,'-')+'.pdf',blob=getPdf(type),file=new File([blob],name,{type:'application/pdf'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:type==='menus'?'Planning des menus':'Liste de courses',files:[file]});return}catch(e){if(e.name==='AbortError')return;console.warn(e)}}downloadBlob(blob,name);alert('Le partage direct de fichiers PDF n’est pas disponible ici. Le PDF a été téléchargé : tu peux le joindre dans WhatsApp, Messages ou un e-mail.')};
})();
