import {useEffect,useRef} from 'react';
import type {BrowseItem} from './DesignCard';
export interface CatalogView {selected:BrowseItem|null;newKind:'shapes'|'cutters'|null;task:string;query:string;search:string;ownership:string;demo:boolean;offset:number}
interface Entry {session:string;index:number;root:number;view:CatalogView;url:string;scroll:number;resultsScroll:number}
const key='cookieCatalogNavigation';
const route=(view:CatalogView)=>view.selected?.shape_id??null;
const urlFor=(view:CatalogView)=>{const url=new URL(window.location.href);url.searchParams.delete('design');url.searchParams.delete('cutter');if(view.selected){url.searchParams.set('design',view.selected.shape_id);if(view.selected.focus_cutter_id)url.searchParams.set('cutter',view.selected.focus_cutter_id);}return url.pathname+url.search+url.hash;};
/** Scope history to catalog design navigation; never serialize drafts or add a router. */
export function useCatalogHistory(view:CatalogView,restore:(view:CatalogView)=>void,allowChange:()=>boolean,loading=false){
 const latest=useRef({view,restore,allowChange});latest.current={view,restore,allowChange};
 const current=useRef<Entry|null>(null),recovering=useRef(false),pendingScroll=useRef<Entry|null>(null);
 const returnFocus=useRef<string|null>(null);
 const initialDesign=useRef(new URLSearchParams(window.location.search).get('design'));
 const results=()=>document.querySelector<HTMLElement>('[aria-label="Catalog results"]');
 const write=(entry:Entry,push=false)=>{window.history[push?'pushState':'replaceState']({...window.history.state,[key]:entry},'',entry.url);current.current=entry;};
 useEffect(()=>{
  const initial:Entry={session:crypto.randomUUID(),index:0,root:0,view:latest.current.view,url:window.location.pathname+window.location.search+window.location.hash,scroll:window.scrollY,resultsScroll:results()?.scrollTop??0};
  const stored=window.history.state?.[key] as Entry|undefined;
  if(stored&&typeof stored.session==='string'&&Number.isSafeInteger(stored.index)&&Number.isSafeInteger(stored.root)&&stored.root<=stored.index&&stored.view&&typeof stored.view.query==='string'){
   write(stored);initialDesign.current=null;pendingScroll.current=stored;latest.current.restore(stored.view);
  }else write(initial);
  const pop=(event:PopStateEvent)=>{
   const target=event.state?.[key] as Entry|undefined,previous=current.current;
   if(!target||!previous||target.session!==previous.session)return;
   if(recovering.current){if(target.index===previous.index)recovering.current=false;return;}
   if(!latest.current.allowChange()){
    const delta=previous.index-target.index;
    if(delta){recovering.current=true;window.history.go(delta);}return;
   }
   returnFocus.current=previous.view.selected?.shape_id??null;current.current=target;pendingScroll.current=target;latest.current.restore(target.view);
  };
  // Capture before the click changes DOM/focus; detail focus may scroll the page.
  const capture=()=>{const entry=current.current;if(entry&&!recovering.current)current.current={...entry,scroll:window.scrollY,resultsScroll:results()?.scrollTop??0};};
  document.addEventListener('click',capture,true);window.addEventListener('popstate',pop);
  return()=>{document.removeEventListener('click',capture,true);window.removeEventListener('popstate',pop);};
 },[]);
 useEffect(()=>{
  const previous=current.current;if(!previous||recovering.current)return;
  // popstate already chose the entry; rendering it must not add another entry.
  if(pendingScroll.current){if(loading)return;const target=pendingScroll.current;pendingScroll.current=null;requestAnimationFrame(()=>{
   results()?.scrollTo?.({top:target.resultsScroll});window.scrollTo({top:target.scroll});
   if(!target.view.selected)(document.getElementById('view-'+returnFocus.current)??document.getElementById('browse-title'))?.focus({preventScroll:true});
  });return;}
  const changed=route(previous.view)!==route(view),loadedLink=initialDesign.current&&view.selected?.shape_id===initialDesign.current;
  const next={...previous,view,url:urlFor(view)};
  if(changed&&view.selected&&!loadedLink){
   // Capture the results entry before opening the design, including unsent search text.
   write({...previous,view:previous.view.selected?previous.view:{...previous.view,newKind:null,task:'find'}});
   write({...next,index:previous.index+1,root:previous.view.selected?previous.root:previous.index,scroll:0,resultsScroll:0},true);
  }else if(!initialDesign.current||view.selected){
   const old=previous.view;
   // Keep query keystrokes in memory; persist once on navigation/search, not every render.
   if(next.url!==previous.url||old.selected!==view.selected||old.newKind!==view.newKind||old.task!==view.task||old.search!==view.search||old.ownership!==view.ownership||old.demo!==view.demo||old.offset!==view.offset)write(next);
   else current.current=next;
  }
  if(loadedLink)initialDesign.current=null;
 });
 return ()=>{
  const entry=current.current;if(!entry||recovering.current)return;
  if(entry.root<entry.index){window.history.go(entry.root-entry.index);return;}
  // A direct link has no in-app results entry; do not send the user off site.
  if(latest.current.allowChange()){initialDesign.current=null;latest.current.restore({...latest.current.view,selected:null,newKind:null});}
 };
}
