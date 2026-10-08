import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context';
import { safeImage, safeURL } from '../lib/format';
const svgs = import.meta.glob('../assets/icons/*.svg',{query:'?raw',import:'default',eager:true});
const names = {starOutline:'star-outline',logout:'logout',creditCard:'credit-card',qrCode:'qr-code',mapPin:'map-pin',chat:'message-square',alert:'alert-circle'};
export function Icon({name}) {
  const svg=svgs[`../assets/icons/${names[name] || name}.svg`] || '';
  // Only bundled, trusted SVG assets; no user content is inserted as HTML.
  return <span className="inline-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:svg}} />;
}
export function Picture({src,alt='',...props}) {
  const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[src]);
  return !safeImage(src) || failed ? <div className="request-fallback"><Icon name="cube" /></div> : <img {...props} src={safeImage(src)} alt={alt} loading="lazy" onError={()=>setFailed(true)} />;
}
export function Empty({title='Nenhum item por aqui ainda',children}) {return <div className="empty-state"><h3>{title}</h3>{children}</div>;}
export function Attachments({items=[]}) {return <div className="request-attachments">{items.map((item,i)=>safeURL(item.url)?<a key={item.path || i} className="btn btn-secondary btn-sm" href={safeURL(item.url)} download={item.name} target="_blank" rel="noopener noreferrer"><Icon name="paperclip" />{item.name}</a>:<span key={i}>{item.name} (referência sem arquivo)</span>)}</div>;}
export function Media({item}) {return /^data:application\/pdf;|\.pdf(?:[?#]|$)/i.test(item.image || '') ? <a className="btn btn-outline" href={safeURL(item.image)} target="_blank" rel="noopener noreferrer"><Icon name="file" />Abrir portfólio PDF</a>:<Picture src={item.image} alt={item.title} />;}
export function Stars({rating}) {return <span className="rating-stars" aria-label={`${Number(rating || 0).toFixed(1)} estrelas`}>{[1,2,3,4,5].map(n=><Icon key={n} name={n<=Math.round(rating || 0)?'star':'starOutline'} />)}</span>;}
export function Modal({id,children}) {
  const {modal,actions,busy}=useApp(); const ref=useRef(null);const open=modal===id;
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement;const el=ref.current;
    document.body.classList.add('modal-open');
    const focusable=()=>[...el.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(e=>!e.disabled && e.type!=='hidden' && e.getClientRects().length);
    focusable()[0]?.focus();
    const key=event=>{if(event.key==='Escape'){event.preventDefault();actions.closeModal(id);}if(event.key==='Tab'){const list=focusable(),first=list[0],last=list.at(-1);if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}}};
    el.addEventListener('keydown',key);
    return ()=>{el.removeEventListener('keydown',key);document.body.classList.remove('modal-open');if(previous?.isConnected)previous.focus();};
  // Actions delegate to stable state setters; reopening establishes the focus boundary.
  },[open,id]);
  return open?<div ref={ref} className="modal-overlay show" id={id} role="dialog" aria-modal="true" aria-label={{modalAuth:'Acesso à conta',modalRequest:'Publicar requisição',modalConfirmRequest:'Revisar requisição',modalMaker:'Conheça o prestador'}[id] || 'Detalhes e ações'} aria-busy={busy} onMouseDown={e=>{if(e.target===e.currentTarget)actions.closeModal(id);}}>{children}</div>:null;
}
