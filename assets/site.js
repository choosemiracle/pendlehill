(function(){
  const page = document.body.dataset.page || '';
  const nav = [
    ['index','首页','index.html'],
    ['history','历史','history.html'],
    ['ideas','思想','ideas.html'],
    ['people','人物','people.html'],
    ['practice','实践','practice.html'],
    ['library','文献','library.html'],
    ['sources','来源','sources.html']
  ];
  const header = document.querySelector('[data-site-header]');
  const footer = document.querySelector('[data-site-footer]');
  if(header){
    header.className='site-header';
    header.innerHTML = `
      <a class="skip-link" href="#main">跳到正文</a>
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="彭德尔山研究首页">
          <span class="brand-mark" aria-hidden="true"></span>
          <span><span class="brand-cn">彭德尔山研究</span><span class="brand-en">Pendle Hill Studies</span></span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">菜单</button>
        <nav class="site-nav" id="site-nav" aria-label="主导航">
          ${nav.map(([key,label,url])=>`<a href="${url}" ${page===key?'aria-current="page"':''}>${label}</a>`).join('')}
        </nav>
      </div>`;
    const btn = header.querySelector('.nav-toggle');
    const siteNav = header.querySelector('.site-nav');
    btn?.addEventListener('click',()=>{
      const open = siteNav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }
  if(footer){
    footer.className='site-footer';
    footer.innerHTML = `
      <div class="footer-inner">
        <div>
          <div class="footer-title">彭德尔山研究 · Pendle Hill Studies</div>
          <div class="footer-small">独立中文研究项目，非美国 Pendle Hill 官方网站。事实性资料优先依据 Pendle Hill 官方资料与原始出版物；中文释义、主题归纳与研究导读由本站整理。最后整理：2026 年 10 月。</div>
        </div>
        <div class="footer-links">
          <a href="sources.html">资料来源</a>
          <a href="library.html">研究文献</a>
          <a href="https://pendlehill.org/" target="_blank" rel="noopener">Pendle Hill 官方网站 ↗</a>
        </div>
      </div>`;
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const items = document.querySelectorAll('[data-library-item]');
  const search = document.querySelector('[data-library-search]');
  let active = 'all';
  function applyFilters(){
    const q = (search?.value || '').trim().toLowerCase();
    items.forEach(item=>{
      const tags = (item.dataset.tags || '').split(',');
      const hay = item.textContent.toLowerCase();
      const matchesTag = active==='all' || tags.includes(active);
      const matchesText = !q || hay.includes(q);
      item.style.display = matchesTag && matchesText ? '' : 'none';
    });
  }
  filterButtons.forEach(btn=>btn.addEventListener('click',()=>{
    filterButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    active = btn.dataset.filter;
    applyFilters();
  }));
  search?.addEventListener('input', applyFilters);
})();
