/* Language switch (EN / 日本語) shared by the estate pages, plus the listings browser. */
(function(){
  var root=document.documentElement;
  function pick(){
    var q=new URLSearchParams(location.search).get('lang');
    if(q==='ja'||q==='en')return q;
    try{var s=localStorage.getItem('estate.lang');if(s==='ja'||s==='en')return s}catch(e){}
    return (navigator.language||'').toLowerCase().indexOf('ja')===0?'ja':'en';
  }
  function setLang(l){
    root.lang=l;
    try{localStorage.setItem('estate.lang',l)}catch(e){}
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.set===l?'true':'false')});
    document.dispatchEvent(new CustomEvent('langchange',{detail:l}));
  }
  window.estateLang=function(){return root.lang==='ja'?'ja':'en'};
  setLang(pick());
  document.addEventListener('click',function(e){var b=e.target.closest('.lang button');if(b)setLang(b.dataset.set)});
})();

(function(){
  var list=document.getElementById('list');if(!list||!window.LISTINGS)return;
  var L=window.LISTINGS,state={kind:'buy',city:'all',budget:'all'},map=null,markers={};
  var T={
    en:{new:'New build',resale:'For sale',rent:'For rent',more:'Details',ask:'Ask about this',photos:'Photos on request',none:'Nothing matches yet. Tell us what you need and we will look for you.',count:function(n){return n+(n===1?' property':' properties')}},
    ja:{new:'新築',resale:'売り物件',rent:'賃貸',more:'詳しく見る',ask:'この物件について聞く',photos:'写真はご案内時に',none:'条件に合う物件がまだありません。ご希望を送っていただければお探しします。',count:function(n){return n+'件'}}
  };
  var budgets={buy:[['all',{en:'Any budget',ja:'予算指定なし'}],['100000',{en:'Up to $100k',ja:'10万ドルまで'}],['300000',{en:'Up to $300k',ja:'30万ドルまで'}],['1000000',{en:'Up to $1M',ja:'100万ドルまで'}],['big',{en:'$1M and above',ja:'100万ドル以上'}]],
               rent:[['all',{en:'Any budget',ja:'予算指定なし'}],['500',{en:'Up to $500',ja:'$500まで'}],['800',{en:'Up to $800',ja:'$800まで'}],['1500',{en:'Up to $1,500',ja:'$1,500まで'}],['big',{en:'$1,500 and above',ja:'$1,500以上'}]]};
  function tx(v,l){return typeof v==='string'?v:(v&&v[l])||''}
  function wa(item,l){var name=tx(item.name,'en');return 'https://wa.me/819087080598?text='+encodeURIComponent('Hello Kyohei, I am interested in: '+name+' ('+tx(item.area,'en')+')')}
  function match(i){
    if(state.kind==='rent'?i.kind!=='rent':i.kind==='rent')return false;
    if(state.city!=='all'&&i.city!==state.city)return false;
    if(state.budget!=='all'){if(state.budget==='big'){if(i.pmin<(state.kind==='rent'?1500:1000000))return false}else if(i.pmin>+state.budget)return false}
    return true;
  }
  function fillBudget(l){
    var s=document.getElementById('f-budget');var cur=state.budget;s.innerHTML='';
    budgets[state.kind==='rent'?'rent':'buy'].forEach(function(o){var op=document.createElement('option');op.value=o[0];op.textContent=o[1][l];s.appendChild(op)});
    s.value=budgets[state.kind==='rent'?'rent':'buy'].some(function(o){return o[0]===cur})?cur:'all';state.budget=s.value;
  }
  function render(){
    var l=window.estateLang(),t=T[l],items=L.filter(match);
    document.getElementById('count').textContent=t.count(items.length);
    list.innerHTML='';
    if(!items.length){list.innerHTML='<div class="empty">'+t.none+'</div>'}
    items.forEach(function(i){
      var a=document.createElement('a');a.className='card';a.id='c-'+i.id;
      a.href=i.link?i.link:wa(i,l);if(!i.link){a.target='_blank';a.rel='noopener'}
      var ph=i.img?'<div class="arch"><img src="'+i.img+'" alt="'+tx(i.name,l)+'" loading="lazy"></div>'
                  :'<div class="arch noimg">'+tx(i.area,l)+'<br><small style="font-family:var(--sans);font-size:.75rem;opacity:.8">'+t.photos+'</small></div>';
      a.innerHTML='<div class="ph">'+ph+'<span class="tag '+(i.kind==='rent'?'rent':'')+'">'+t[i.kind]+'</span></div>'+
        '<div class="b"><span class="where">'+tx(i.area,l)+'</span><span class="h-m">'+tx(i.name,l)+'</span>'+
        '<span class="price">'+tx(i.price,l)+'<small>'+tx(i.unit,l)+'</small></span><p>'+tx(i.text,l)+'</p>'+
        '<span class="chips">'+(i.chips?i.chips[l]:[]).map(function(c){return '<span>'+c+'</span>'}).join('')+'</span>'+
        '<span class="more">'+(i.link?t.more:t.ask)+'</span></div>';
      a.addEventListener('mouseenter',function(){hl(i.id,true)});a.addEventListener('mouseleave',function(){hl(i.id,false)});
      list.appendChild(a);
    });
    drawMap(items,l);
  }
  function hl(id,on){var m=markers[id];if(m&&m._icon){m._icon.querySelector('.pin').classList.toggle('on',on)}}
  function drawMap(items,l){
    if(!window.L||!document.getElementById('map'))return;
    if(!map){
      map=window.L.map('map',{scrollWheelZoom:false,zoomControl:true});
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors &copy; CARTO'}).addTo(map);
    }
    Object.keys(markers).forEach(function(k){map.removeLayer(markers[k])});markers={};
    var pts=[];
    items.forEach(function(i){
      var icon=window.L.divIcon({className:'',html:'<div class="pin '+(i.kind==='rent'?'rent':'')+'"></div>',iconSize:[30,30],iconAnchor:[15,30]});
      var m=window.L.marker([i.lat,i.lng],{icon:icon}).addTo(map);
      m.bindPopup('<b>'+tx(i.name,l)+'</b><br>'+tx(i.area,l)+'<br>'+tx(i.price,l)+' '+tx(i.unit,l));
      m.on('click',function(){var c=document.getElementById('c-'+i.id);if(c){c.classList.add('hl');c.scrollIntoView({behavior:'smooth',block:'nearest'});setTimeout(function(){c.classList.remove('hl')},1600)}});
      markers[i.id]=m;pts.push([i.lat,i.lng]);
    });
    if(pts.length){map.fitBounds(pts,{padding:[30,30],maxZoom:13})}else{map.setView([41.72,44.78],11)}
  }
  document.querySelectorAll('[data-kind]').forEach(function(b){b.addEventListener('click',function(){
    state.kind=b.dataset.kind;document.querySelectorAll('[data-kind]').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    fillBudget(window.estateLang());render();})});
  document.getElementById('f-city').addEventListener('change',function(e){state.city=e.target.value;render()});
  document.getElementById('f-budget').addEventListener('change',function(e){state.budget=e.target.value;render()});
  document.querySelectorAll('a[data-go]').forEach(function(a){a.addEventListener('click',function(){var k=a.dataset.go;var b=document.querySelector('[data-kind="'+k+'"]');if(b)b.click()})});
  document.addEventListener('langchange',function(e){
    document.querySelectorAll('#f-city option').forEach(function(o){o.textContent=o.dataset[e.detail]});
    fillBudget(e.detail);render();});
  var h=location.hash.replace('#','');if(h==='rent'){state.kind='rent';document.querySelectorAll('[data-kind]').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.kind==='rent'?'true':'false')})}
  document.querySelectorAll('#f-city option').forEach(function(o){o.textContent=o.dataset[window.estateLang()]});
  fillBudget(window.estateLang());render();
})();
