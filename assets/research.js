(function(){
  const esc = (value='') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize = (value='') => String(value).toLowerCase().normalize('NFKC').replace(/[\s\u3000]+/g,' ').trim();
  const yearOf = (date='') => {
    const m=String(date).match(/(19|20)\d{2}/);
    return m ? Number(m[0]) : null;
  };
  const dataUrl = 'data/pamphlets.json';

  async function loadPamphlets(){
    const res = await fetch(dataUrl, {cache:'no-store'});
    if(!res.ok) throw new Error('无法读取 Pamphlet 数据库');
    return res.json();
  }

  async function initPamphletIndex(){
    const host=document.querySelector('[data-pamphlet-index]');
    if(!host) return;
    const status=host.querySelector('[data-pamphlet-status]');
    const tbody=host.querySelector('[data-pamphlet-rows]');
    const search=host.querySelector('[data-pamphlet-search]');
    const decade=host.querySelector('[data-pamphlet-decade]');
    const topic=host.querySelector('[data-pamphlet-topic]');
    const translation=host.querySelector('[data-pamphlet-translation]');
    const order=host.querySelector('[data-pamphlet-order]');
    const loadMore=host.querySelector('[data-pamphlet-more]');
    const summary=host.querySelector('[data-pamphlet-summary]');
    let data=[];
    let visible=60;

    try{
      data=await loadPamphlets();
    }catch(err){
      if(status) status.textContent='数据库加载失败，请刷新后重试。';
      return;
    }
    const initialQuery=new URLSearchParams(location.search).get('q');
    if(search && initialQuery) search.value=initialQuery;

    const decades=[...new Set(data.map(x=>yearOf(x.date)).filter(Boolean).map(y=>Math.floor(y/10)*10))].sort((a,b)=>a-b);
    decades.forEach(d=>{
      const o=document.createElement('option'); o.value=String(d); o.textContent=`${d} 年代`; decade?.appendChild(o);
    });
    const topicMap=new Map();
    data.forEach(x=>(x.topics||[]).forEach(t=>topicMap.set(t.key,t.label)));
    [...topicMap.entries()].sort((a,b)=>a[1].localeCompare(b[1],'zh-CN')).forEach(([key,label])=>{
      const o=document.createElement('option'); o.value=key; o.textContent=label; topic?.appendChild(o);
    });

    function filtered(){
      const q=normalize(search?.value||'');
      const d=Number(decade?.value||0);
      const t=topic?.value||'';
      const tr=translation?.value||'';
      let list=data.filter(x=>{
        const year=yearOf(x.date);
        const text=normalize([
          x.number,x.author,x.date,x.title_en,x.title_zh,x.keywords_en,
          ...(x.topics||[]).flatMap(z=>[z.key,z.label])
        ].join(' '));
        if(q && !text.includes(q)) return false;
        if(d && !(year>=d && year<d+10)) return false;
        if(t && !(x.topics||[]).some(z=>z.key===t)) return false;
        if(tr && x.translation_status!==tr) return false;
        return true;
      });
      const ord=order?.value||'number-asc';
      list.sort((a,b)=>{
        if(ord==='number-desc') return b.number-a.number;
        if(ord==='year-desc') return (yearOf(b.date)||0)-(yearOf(a.date)||0)||b.number-a.number;
        if(ord==='author') return String(a.author).localeCompare(String(b.author),'en')||a.number-b.number;
        return a.number-b.number;
      });
      return list;
    }

    function render(reset=false){
      if(reset) visible=60;
      const list=filtered();
      const shown=list.slice(0,visible);
      if(summary){
        const reviewed=list.filter(x=>x.translation_status==='reviewed').length;
        summary.textContent=`找到 ${list.length} 册；全部已有中文工作题名，其中 ${reviewed} 册为重点校订题名`;
      }
      tbody.innerHTML=shown.map(x=>{
        const zh=x.title_zh
          ? `<div class="pamphlet-title-cn">${esc(x.title_zh)}</div>`
          : '<div class="pamphlet-title-cn pending">中文题名待校订</div>';
        const trBadge=x.translation_status==='reviewed'
          ? '<span class="topic-chip translation-reviewed">题名重点校订</span>'
          : '<span class="topic-chip translation-working">工作译名待复核</span>';
        const tags=trBadge+(x.topics||[]).slice(0,4).map(t=>`<span class="topic-chip">${esc(t.label)}</span>`).join('');
        const source=x.source_tier==='official-current'
          ? '<span class="source-badge official">官方书店核对</span>'
          : '<span class="source-badge">历史索引</span>';
        return `<tr id="php-${x.number}">
          <td class="pamphlet-no">#${String(x.number).padStart(3,'0')}</td>
          <td class="pamphlet-date">${esc(x.date||'—')}</td>
          <td class="pamphlet-main">
            ${zh}
            <div class="pamphlet-title-en">${esc(x.title_en)}</div>
            <div class="pamphlet-tags">${tags}</div>
          </td>
          <td class="pamphlet-author">${esc(x.author)}</td>
          <td class="pamphlet-source">${source}<br><a href="${esc(x.source_url)}" target="_blank" rel="noopener">来源 ↗</a></td>
        </tr>`;
      }).join('');
      if(loadMore){
        loadMore.hidden=shown.length>=list.length;
        loadMore.textContent=`继续显示（剩余 ${Math.max(0,list.length-shown.length)}）`;
      }
      if(status) status.textContent=`数据库共 ${data.length} 册，当前显示 ${shown.length} 册。`;
    }

    [search,decade,topic,translation,order].forEach(el=>{
      el?.addEventListener(el===search?'input':'change',()=>render(true));
    });
    loadMore?.addEventListener('click',()=>{visible+=60;render(false);});
    render(true);

    if(location.hash && /^#php-\d+$/.test(location.hash)){
      const n=Number(location.hash.replace('#php-',''));
      if(n>visible) visible=Math.min(data.length, Math.ceil(n/60)*60);
      render(false);
      requestAnimationFrame(()=>document.querySelector(location.hash)?.scrollIntoView({block:'center'}));
    }
  }

  async function initResearchSearch(){
    const app=document.querySelector('[data-research-search]');
    if(!app) return;
    const input=app.querySelector('[data-global-search]');
    const results=app.querySelector('[data-global-results]');
    const stats=app.querySelector('[data-global-stats]');
    const examples=app.querySelectorAll('[data-search-example]');
    const manifest=[
      ['首页','index.html'],['历史','history.html'],['思想','ideas.html'],['人物','people.html'],['实践','practice.html'],
      ['文献导览','library.html'],['Pamphlet 索引','pamphlets.html'],['思想谱系','genealogy.html'],
      ['人物关系','network.html'],['Palmer 十年','palmer.html'],['宗教与心理学','psychology.html'],['资料来源','sources.html']
    ];
    let docs=[];
    let pamphlets=[];
    try{
      const [pams,...pages]=await Promise.all([
        loadPamphlets(),
        ...manifest.map(async ([label,url])=>{
          const res=await fetch(url,{cache:'no-store'});
          const html=await res.text();
          const dom=new DOMParser().parseFromString(html,'text/html');
          const main=dom.querySelector('main');
          const title=dom.querySelector('h1')?.textContent?.trim()||dom.title;
          const text=main?.textContent?.replace(/\s+/g,' ').trim()||'';
          return {kind:'page',label,url,title,text};
        })
      ]);
      pamphlets=pams;
      docs=pages;
      if(stats) stats.textContent=`可检索本站 ${docs.length} 个研究页面 + ${pamphlets.length} 条 Pamphlet 元数据。`;
      const initialQuery=new URLSearchParams(location.search).get('q');
      if(input && initialQuery) input.value=initialQuery;
    }catch(err){
      if(stats) stats.textContent='索引加载失败，请刷新后重试。';
      return;
    }

    function snippets(text,q){
      const low=normalize(text), key=normalize(q);
      const pos=low.indexOf(key);
      if(pos<0) return text.slice(0,180)+(text.length>180?'…':'');
      const start=Math.max(0,pos-70), end=Math.min(text.length,pos+key.length+120);
      return (start?'…':'')+text.slice(start,end)+(end<text.length?'…':'');
    }
    function searchNow(){
      const q=(input?.value||'').trim();
      if(q.length<1){
        results.innerHTML='<div class="empty-state">输入人物、概念、年份、PHP 编号或中文主题，例如「Palmer」「内在之光」「澄心会」「1960」「PHP 305」。</div>';
        return;
      }
      const key=normalize(q.replace(/^php\s*/i,''));
      const pageHits=docs.map(d=>{
        const title=normalize(d.title), text=normalize(d.text);
        let score=0;
        if(title.includes(normalize(q))) score+=14;
        const count=text.split(normalize(q)).length-1;
        score+=Math.min(count,8)*2;
        return {...d,score};
      }).filter(x=>x.score>0);

      const pamHits=pamphlets.map(x=>{
        const hay=normalize([x.number,x.author,x.date,x.title_en,x.title_zh,x.keywords_en,...(x.topics||[]).map(t=>t.label)].join(' '));
        let score=hay.includes(normalize(q))?4:0;
        if(String(x.number)===key) score+=30;
        if(normalize(x.title_zh).includes(normalize(q))||normalize(x.title_en).includes(normalize(q))) score+=8;
        if(normalize(x.author).includes(normalize(q))) score+=6;
        return {kind:'pamphlet',score,x};
      }).filter(z=>z.score>0);

      const merged=[
        ...pageHits.map(x=>({score:x.score,html:`<a class="result-item" href="${x.url}">
          <span class="result-type">研究页面 · ${esc(x.label)}</span>
          <h3>${esc(x.title)}</h3><p>${esc(snippets(x.text,q))}</p></a>`})),
        ...pamHits.map(({score,x})=>({score,html:`<a class="result-item" href="pamphlets.html#php-${x.number}">
          <span class="result-type">Pendle Hill Pamphlet #${x.number} · ${esc(x.date||'')}</span>
          <h3>${esc(x.title_zh||x.title_en)}</h3>
          <p>${x.title_zh?esc(x.title_en)+' · ':''}${esc(x.author)} · ${esc((x.topics||[]).map(t=>t.label).join(' / '))}</p></a>`}))
      ].sort((a,b)=>b.score-a.score).slice(0,60);

      results.innerHTML=merged.length?merged.map(x=>x.html).join(''):'<div class="empty-state">没有找到匹配结果。可以换一个更短的关键词，或尝试英文原词。</div>';
    }
    input?.addEventListener('input',searchNow);
    examples.forEach(el=>el.addEventListener('click',()=>{input.value=el.dataset.searchExample||el.textContent;searchNow();input.focus();}));
    searchNow();
  }

  function initGraphFocus(){
    const root=document.querySelector('[data-graph]');
    if(!root) return;
    const cards=[...root.querySelectorAll('[data-node]')];
    const lines=[...root.querySelectorAll('[data-edge]')];
    cards.forEach(card=>card.addEventListener('mouseenter',()=>{
      const id=card.dataset.node;
      root.classList.add('is-focused');
      card.classList.add('is-active');
      lines.forEach(line=>{
        const ends=(line.dataset.edge||'').split(',');
        if(ends.includes(id)) line.classList.add('is-active');
      });
    }));
    cards.forEach(card=>card.addEventListener('mouseleave',()=>{
      root.classList.remove('is-focused');
      cards.forEach(x=>x.classList.remove('is-active'));
      lines.forEach(x=>x.classList.remove('is-active'));
    }));
  }

  initPamphletIndex();
  initResearchSearch();
  initGraphFocus();
})();
