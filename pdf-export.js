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
 function menus(){const c=canvas(),start=startOfWeek(offset),end=new Date(start);end.setDate(end.getDate()+6);header(c,'Menus de la semaine','Du '+start.toLocaleDateString('fr-FR')+' au '+end.toLocaleDateString('fr-FR'));
 const x=34,y=122,labelW=65,colW=(A4W-68-labelW)/7,rowH=133;c.rect(x,y,A4W-68,45,[.89,.94,.9]);c.text('Repas',x+10,y+27,10,true);
 const ordered=weekDays();ordered.forEach(({date,day},i)=>{const xx=x+labelW+i*colW;c.rect(xx,y,colW-1,45,i%2?[.91,.95,.92]:[.86,.93,.88]);c.text(days[day].slice(0,3)+'.',xx+9,y+18,10,true);c.text(date.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}),xx+9,y+34,9)});
 ['m','s'].forEach((t,ri)=>{const top=y+45+ri*rowH;c.rect(x,top,A4W-68,rowH,ri?[.95,.97,.95]:[.99,.99,.98]);c.rect(x,top,labelW-1,rowH,[.87,.93,.88]);c.text(t==='m'?'Midi':'Soir',x+10,top+25,12,true);ordered.forEach(({day},i)=>{const id=day+'-'+t,cx=x+labelW+i*colW;if(i%2)c.rect(cx,top,colW-1,rowH,[.96,.98,.96]);if(!state.config.meals.includes(id)){c.text('-',cx+8,top+26,10,false,[.65,.7,.66]);return}const r=recipe(plan()[id]);if(!r)return;let yy=top+25;for(const line of c.wrap(r.name,colW-17,10)){if(yy>top+rowH-13)break;c.text(line,cx+8,yy,10,yy===top+25);yy+=15}})});
 c.rect(34,464,A4W-68,2,[.82,.9,.83]);c.text('Menus & Courses  |  Planning familial',35,490,9,false,[.43,.51,.45]);return makePdf([c.finish()]);}
 function courses(){const c=canvas(),items=computed(),groups=categories.map(cat=>({cat,items:items.filter(p=>p.category===cat)})).filter(g=>g.items.length);header(c,'Liste de courses',startOfWeek(offset).toLocaleDateString('fr-FR')+' - '+new Date(startOfWeek(offset).getTime()+6*86400000).toLocaleDateString('fr-FR'));
 // Répartition équilibrée des catégories en colonnes, une seule page A4 paysage.
 const total=groups.reduce((n,g)=>n+1+g.items.reduce((k,p)=>k+Math.max(1,Math.ceil((p.name+' - '+p.qty+' '+p.unit).length/38)),0),0);
 const columns=total>49?3:2,usableW=A4W-70,gap=16,colW=(usableW-(columns-1)*gap)/columns,top=105,bottom=562,usableH=bottom-top;
 let font=total>82?7.5:total>62?8.5:10;let lineH=font+4;let sections=groups.map(g=>({g,lines:g.items.reduce((n,p)=>n+c.wrap(p.name+' - '+p.qty+' '+p.unit,colW-30,font).length,0)}));let col=0,y=top;
 for(const {g,lines} of sections){const need=24+lines*lineH+8;if(y+need>bottom&&col<columns-1){col++;y=top}const x=35+col*(colW+gap);c.rect(x,y,colW,22,[.87,.93,.88]);c.text(g.cat,x+8,y+15,10,true);y+=31;for(const p of g.items){const rows=c.wrap(p.name+' - '+p.qty+' '+p.unit,colW-33,font);if(y+rows.length*lineH>bottom){if(col<columns-1){col++;y=top}else{font=Math.max(6.3,font-.2);lineH=font+2.4}}const xx=35+col*(colW+gap);c.rect(xx+5,y-8,9,9,[.9,.92,.9]);if(state.checked[p.key])c.text('X',xx+6,y-1,8,true);for(const row of rows){c.text(row,xx+22,y,font);y+=lineH}y+=3}y+=8}
 c.text('Menus & Courses',35,580,8,false,[.5,.55,.5]);return makePdf([c.finish()]);}
 function getPdf(type){return type==='menus'?menus():courses()}
 function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
 window.downloadPdf=type=>downloadBlob(getPdf(type),(type==='menus'?'planning_menus_':'liste_courses_')+week()+'.pdf');
 window.sharePdf=async type=>{const name=(type==='menus'?'planning_menus_':'liste_courses_')+week()+'.pdf',blob=getPdf(type),file=new File([blob],name,{type:'application/pdf'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({title:type==='menus'?'Planning des menus':'Liste de courses',files:[file]});return}catch(e){if(e.name==='AbortError')return;console.warn(e)}}downloadBlob(blob,name);alert('Le partage direct de fichiers PDF n’est pas disponible ici. Le PDF a été téléchargé : tu peux le joindre dans WhatsApp, Messages ou un e-mail.')};
})();
