(() => {
 const nodes=[...document.querySelectorAll('[data-views]')];
 const setCount=(n,value)=>{let label=n.querySelector('.ty-view-label');if(!label){label=document.createElement('span');label.className='ty-view-label';const extra=n.querySelector('.ty-download-count');n.replaceChildren(label);if(extra)n.append(extra)}label.textContent=value};
 if(!nodes.length)return;
 nodes.forEach(n=>setCount(n,'◉ 1.000+ görüntülenme'));
})();