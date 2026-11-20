/* Générateur PDF autonome, sans serveur ni dépendance externe. */
(function(){
 const A4W=842,A4H=595;
 const latin=s=>String(s).replace(/[\u2019\u2018]/g,"'").replace(/[\u2013\u2014]/g,'-').replace(/[\u2022]/g,'-').replace(/[\u00a0]/g,' ').replace(/[\u2026]/g,'...').replace(/[^\x20-\xff]/g,'?');
 const pdfStr=s=>'('+latin(s).replace(/[\\()]/g,'\\$&')+')';
 const fmt=n=>Number(n.toFixed(2)).toString();
 function makePdf(pages){
  const objs=[null,'<< /Type /Catalog /Pages 2 0 R >>',null,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  const kids=[];
  for(const commands of pages){const pageId=objs.length,contentId=pageId+1;kids.push(pageId+' 0 R');objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4W} ${A4H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);objs.push(`<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`)}
  objs[2]=`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${kids.length} >>`;
  let output='%PDF-1.4\n%âãÏÓ\n',offsets=[0];for(let i=1;i<objs.length;i++){offsets[i]=output.length;output+=`${i} 0 obj\n${objs[i]}\nendobj\n`};const xref=output.length;output+=`xref\n0 ${objs.length}\n0000000000 65535 f \n`;for(let i=1;i<objs.length;i++)output+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';output+=`trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes=new Uint8Array(output.length);for(let i=0;i<output.length;i++)bytes[i]=output.charCodeAt(i)&255;return new Blob([bytes],{type:'application/pdf'});
 }
 function canvas(){let lines=[];const cmd=x=>lines.push(x);const color=(r,g,b)=>cmd(`${r} ${g} ${b} rg`);const rect=(x,y,w,h,rgb)=>{color(...rgb);cmd(`${fmt(x)} ${fmt(A4H-y-h)} ${fmt(w)} ${fmt(h)} re f`)};
 const text=(s,x,y,size=11,bold=false,rgb=[.16,.22,.19])=>{color(...rgb);cmd(`BT /F${bold?2:1} ${size} Tf 1 0 0 1 ${fmt(x)} ${fmt(A4H-y)} Tm ${pdfStr(s)} Tj ET`)};
 const wrap=(s,maxWidth,size=11)=>{const words=latin(s).split(/\s+/);const rows=[];let row='';for(const word of words){const trial=row?row+' '+word:word;if(trial.length*size*.51>maxWidth&&row){rows.push(row);row=word}else row=trial}if(row)rows.push(row);return rows.length?rows:['']};return {rect,text,wrap,finish:()=>lines.join('\n')};}
 const header=(c,title,subtitle)=>{c.rect(0,0,A4W,88,[.14,.38,.27]);c.text(title,34,39,22,true,[1,1,1]);c.text(subtitle,35,62,10,false,[.88,.95,.89])};
 function menus(){const c=canvas(),start=monday(offset),end=new Date(start);end.setDate(end.getDate()+6);const period='Du '+start.toLocaleDateString('fr-FR')+' au '+end.toLocaleDateString('fr-FR');header(c,'Menus de la semaine',period);const x=34,y=119,labelW=70,colW=(A4W-68-labelW)/7,rowH=170;
  c.rect(x,y,A4W-68,40,[.88,.94,.89]);c.text('Repas',x+10,y+25,10,true);
  for(let i=0;i<7;i++){const date=new Date(start);date.setDate(start.getDate()+i);c.text(days[i].slice(0,3)+'.',x+labelW+i*colW+8,y+17,10,true);c.text(String(date.getDate()).padStart(2,'0')+'/'+String(date.getMonth()+1).padStart(2,'0'),x+labelW+i*colW+8,y+31,9)}
  for(const [ri,t] of ['m','s'].entries()){const top=y+40+ri*rowH;c.rect(x,top,A4W-68,rowH,ri===0?[.98,.99,.97]:[.94,.97,.94]);c.rect(x,top,labelW,rowH,[.86,.92,.87]);c.text(t==='m'?'Midi':'Soir',x+10,top+25,12,true);for(let i=0;i<7;i++){const id=i+'-'+t,cx=x+labelW+i*colW+7;if(!state.config.meals.includes(id)){c.text('-',cx,top+30,12,false,[.65,.7,.66]);continue}const r=recipe(plan()[id]);if(!r)continue;let yy=top+25;for(const line of c.wrap(r.name,colW-13,10)){if(yy>top+rowH-12)break;c.text(line,cx,yy,10,yy===top+25);yy+=14}}}
  c.text('Planning personnel - Menus & Courses',35,535,9,false,[.43,.51,.45]);return makePdf([c.finish()]);}
 function courses(){const items=computed(),pages=[];let c=canvas(),y=110,page=1;const addPage=()=>{if(c)pages.push(c.finish());c=canvas();header(c,'Liste de courses','Semaine du '+monday(offset).toLocaleDateString('fr-FR'));y=109;page++};header(c,'Liste de courses','Semaine du '+monday(offset).toLocaleDateString('fr-FR'));
 for(const cat of categories){const group=items.filter(x=>x.category===cat);if(!group.length)continue;if(y+50>550)addPage();c.rect(35,y-17,772,28,[.88,.94,.89]);c.text(cat,45,y+1,12,true);y+=29;for(const item of group){const rows=c.wrap(item.name+' - '+item.qty+' '+item.unit,700,11);if(y+rows.length*16>550)addPage();c.rect(44,y-10,10,10,[.9,.92,.9]);if(state.checked[item.key])c.text('X',45,y-1,9,true);for(const line of rows){c.text(line,65,y,11);y+=16}y+=5}y+=12}
 pages.push(c.finish());return makePdf(pages)}
 function getPdf(type){return type==='menus'?menus():courses()}
 function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
 window.downloadPdf=type=>downloadBlob(getPdf(type),(type==='menus'?'planning_menus_':'liste_courses_')+week()+'.pdf');
 window.sharePdf=async type=>{const name=(type==='menus'?'planning_menus_':'liste_courses_')+week()+'.pdf',blob=getPdf(type),file=new File([blob],name,{type:'application/pdf'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:type==='menus'?'Planning des menus':'Liste de courses',files:[file]});return}catch(e){if(e.name==='AbortError')return;console.warn(e)}}downloadBlob(blob,name);alert('Le partage direct de fichiers PDF n’est pas disponible ici. Le PDF a été téléchargé : tu peux le joindre dans WhatsApp, Messages ou un e-mail.')};
})();
