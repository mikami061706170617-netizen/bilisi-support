/* fx.js — hero slideshow, reveal-on-scroll and count-up. Content stays visible if this fails. */
(function(){
  try{
    var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* slideshow: <el data-slides="a.jpg|b.jpg"> */
    [].forEach.call(document.querySelectorAll('[data-slides]'),function(h){
      var list=h.getAttribute('data-slides').split('|');
      var box=document.createElement('div');box.className='fx-slides';box.setAttribute('aria-hidden','true');
      list.forEach(function(src,i){var d=document.createElement('div');d.className='fx-slide'+(i===0?' on':'');d.style.backgroundImage='url("'+src+'")';box.appendChild(d)});
      h.insertBefore(box,h.firstChild);h.classList.add('fx-has-slides');
      var slides=box.children,cur=0,t;
      var dots=document.createElement('div');dots.className='fx-dots';
      list.forEach(function(_,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Photo '+(i+1));if(i===0)b.className='on';b.addEventListener('click',function(){go(i);start()});dots.appendChild(b)});
      h.appendChild(dots);
      function go(i){slides[cur].classList.remove('on');dots.children[cur].classList.remove('on');cur=i;slides[cur].classList.add('on');dots.children[cur].classList.add('on')}
      function start(){clearInterval(t);if(!rm&&slides.length>1)t=setInterval(function(){go((cur+1)%slides.length)},5200)}
      start();
    });
    /* petals: <el data-petals="12"> */
    if(!rm)[].forEach.call(document.querySelectorAll('[data-petals]'),function(h){var n=+h.getAttribute('data-petals')||10,w=document.createElement('div');w.className='fx-petals';w.setAttribute('aria-hidden','true');
      for(var i=0;i<n;i++){var s=document.createElement('span');s.style.left=(Math.random()*100)+'%';s.style.animationDelay=(-Math.random()*14)+'s';s.style.animationDuration=(10+Math.random()*8)+'s';var z=8+Math.random()*10;s.style.width=z+'px';s.style.height=(z*.8)+'px';w.appendChild(s)}
      h.appendChild(w)});
    /* count-up: <b data-count="30" data-suffix="+"> */
    var counters=[].slice.call(document.querySelectorAll('[data-count]'));
    function runCount(el){var end=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'',t0=null;if(rm){el.textContent=end+suf;return}
      function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/1400,1);el.textContent=Math.round(end*(1-Math.pow(1-p,3)))+suf;if(p<1)requestAnimationFrame(step)}requestAnimationFrame(step)}
    /* reveal */
    var sel=document.body.getAttribute('data-fx');
    if(!('IntersectionObserver' in window)){counters.forEach(runCount);return}
    var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;var e=x.target;if(e.hasAttribute('data-count'))runCount(e);else e.classList.add('fx-in');io.unobserve(e)})},{rootMargin:'0px 0px -8% 0px'});
    counters.forEach(function(e){io.observe(e)});
    if(sel&&!rm){document.documentElement.classList.add('fx-js');
      [].forEach.call(document.querySelectorAll(sel),function(e,i){if(e.closest('header'))return;e.classList.add('fx-rv');e.style.transitionDelay=((i%4)*80)+'ms';io.observe(e)})}
  }catch(err){document.documentElement.classList.remove('fx-js')}
})();
