(()=>{'use strict';
const $=id=>document.getElementById(id), ids=['citation','title','intro','development','call'];
const labels=['Cita bíblica','Título','Introducción','Desarrollo','Llamado'];
let sermons=[],activeId=null,current=0;
const storeKey='miPredicador.v1';
$('editors').innerHTML=ids.map((id,i)=>`<div class="section"><div class="row"><strong>${labels[i]}</strong><button class="tool copy-one" data-id="${id}">Copiar sección</button></div><div class="editor" id="ed_${id}" contenteditable="true" data-placeholder="Escribe aquí ${labels[i].toLowerCase()}..."></div></div>`).join('');
$('sermonDate').value=new Date().toLocaleDateString('en-CA');
function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',2200)}
function snapshot(){return{id:activeId||String(Date.now()),title:$('sermonTitle').value,date:$('sermonDate').value,place:$('sermonPlace').value,verse:$('sermonVerse').value,parts:ids.map(id=>$('ed_'+id).innerHTML)}}
function load(d){activeId=d.id||null;$('sermonTitle').value=d.title||'';$('sermonDate').value=d.date||'';$('sermonPlace').value=d.place||'';$('sermonVerse').value=d.verse||'';ids.forEach((id,i)=>$('ed_'+id).innerHTML=d.parts?.[i]||'');renderSlides()}
function saveStore(){try{localStorage.setItem(storeKey,JSON.stringify(sermons));return true}catch(e){toast('No se pudo guardar. Exporta una copia o libera espacio.');return false}}
function refresh(){ $('savedList').innerHTML=sermons.length?sermons.map(s=>`<div class="sermon-item"><button class="info" data-open="${s.id}" style="text-align:left;background:none;border:0;color:inherit"><strong>${esc(s.title||'Sin título')}</strong><span class="small">${esc(s.date||'')} · ${esc(s.place||'')}</span></button><button class="tool" data-delete="${s.id}">Eliminar</button></div>`).join(''):'<p class="small">Aún no has guardado sermones.</p>'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
try{sermons=JSON.parse(localStorage.getItem(storeKey)||'[]')}catch(e){sermons=[]}refresh();
function slides(d){return[{label:'CITA BÍBLICA',title:'Cita bíblica',content:d.verse||d.parts[0]||''},{label:'TÍTULO',title:'Título',content:d.title||d.parts[1]||''},...d.parts.slice(2).map((v,i)=>({label:labels[i+2].toUpperCase(),title:labels[i+2],content:v})),{label:'FINAL',title:'Final',content:'Amén'}]}
function renderSlides(){let ss=slides(snapshot());current=Math.min(current,ss.length-1);let s=ss[current];$('slideLabel').textContent=s.label;$('slideContent').innerHTML=s.content||'<span style="opacity:.45">Sin contenido</span>';$('counter').textContent=`Aspecto ${current+1} de ${ss.length}`;$('nextText').textContent=(ss[current+1]||ss[0]).title;$('prev').disabled=current===0;$('next').textContent=current===ss.length-1?'Volver al inicio ↺':'Siguiente →';$('slideList').innerHTML=ss.map((x,i)=>`<button class="tool ${i===current?'primary':''}" data-slide="${i}">${i+1}. ${x.title}</button>`).join('');$('preachMeta').textContent=snapshot().title||'Sermón sin título'}
function tab(t){['prepare','preach','library'].forEach(x=>$(x).classList.toggle('hidden',x!==t));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));if(t==='preach')renderSlides();if(t==='library')refresh()}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
document.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>document.execCommand(b.dataset.cmd,false,null));
$('fontFamily').onchange=e=>document.execCommand('fontName',false,e.target.value);
$('fontSize').onchange=e=>document.execCommand('fontSize',false,e.target.value);
$('fontColor').oninput=e=>document.execCommand('foreColor',false,e.target.value);
$('editors').onclick=async e=>{let b=e.target.closest('.copy-one');if(b){let text=$('ed_'+b.dataset.id).innerText;try{await navigator.clipboard.writeText(text);toast('Sección copiada')}catch(_){toast('Selecciona el texto y copia manualmente')}}};
$('copyAll').onclick=async()=>{let d=snapshot(),txt=[d.title,d.date,d.place,d.verse,...ids.map((id,i)=>labels[i]+'\n'+$('ed_'+id).innerText)].join('\n\n');try{await navigator.clipboard.writeText(txt);toast('Sermón copiado')}catch(_){toast('No se pudo copiar automáticamente')}};
$('save').onclick=()=>{let d=snapshot(),i=sermons.findIndex(x=>x.id===d.id);if(i<0)sermons.unshift(d);else sermons[i]=d;activeId=d.id;if(saveStore()){refresh();toast('Sermón guardado en este dispositivo')}};
$('new').onclick=()=>{if(confirm('¿Crear un sermón nuevo? Guarda antes los cambios que quieras conservar.')){load({parts:[]});$('sermonDate').value=new Date().toLocaleDateString('en-CA');toast('Nuevo sermón') }};
$('savedList').onclick=e=>{let o=e.target.closest('[data-open]'),del=e.target.closest('[data-delete]');if(o){let d=sermons.find(x=>x.id===o.dataset.open);if(d){load(d);tab('prepare');toast('Sermón abierto')}}if(del&&confirm('¿Eliminar este sermón?')){sermons=sermons.filter(x=>x.id!==del.dataset.delete);saveStore();refresh()}};
$('next').onclick=()=>{current=(current+1)%slides(snapshot()).length;renderSlides()};$('prev').onclick=()=>{current=Math.max(0,current-1);renderSlides()};$('nextPreview').onclick=()=>$('next').click();
$('slideList').onclick=e=>{let b=e.target.closest('[data-slide]');if(b){current=+b.dataset.slide;renderSlides()}};
$('slideSize').oninput=e=>$('slideContent').style.fontSize=e.target.value+'px';
$('fullscreen').onclick=()=>{let el=$('slide');if(!document.fullscreenElement)el.requestFullscreen?.().catch(()=>toast('Pantalla completa no disponible en este navegador'));else document.exitFullscreen?.()};
$('export').onclick=()=>{let d=snapshot();let i=sermons.findIndex(x=>x.id===d.id);if(i<0)sermons.unshift(d);else sermons[i]=d;saveStore();let blob=new Blob([JSON.stringify(sermons,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='respaldo-mi-predicador.json';a.click();URL.revokeObjectURL(a.href);toast('Copia de seguridad descargada')};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let arr=JSON.parse(await f.text());if(!Array.isArray(arr))throw Error();let map=new Map(sermons.map(x=>[x.id,x]));arr.forEach(x=>map.set(x.id||String(Date.now()+Math.random()),x));sermons=[...map.values()];saveStore();refresh();toast('Copia importada')}catch(_){toast('El archivo no es una copia válida')}e.target.value=''};
renderSlides();
})();