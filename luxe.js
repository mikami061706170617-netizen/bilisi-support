/* LUXE: gentle reveal-on-scroll. Content stays visible if this file fails. */
(function(){
  try{
    if(!('IntersectionObserver' in window))return;
    var d=document.documentElement;d.classList.add('lx-js');
    var sel='.sec2 h2,.sec2 .intro,.why>div,.pc,.mini,.mosaic figure,.split>*,.card,section h2,.intro .big,.photos img,details';
    var els=[].slice.call(document.querySelectorAll(sel)).filter(function(e){return !e.closest('header')});
    els.forEach(function(e){e.classList.add('lx-rv')});
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('lx-in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(e){io.observe(e)});
  }catch(e){document.documentElement.classList.remove('lx-js')}
})();
