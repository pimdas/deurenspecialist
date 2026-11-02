const kind = document.querySelector('main').dataset.kind;
const grid = document.getElementById('grid'), search = document.getElementById('search');
const pages = document.getElementById('pages'), count = document.getElementById('count'), modal = document.getElementById('product');
const styleSelect = document.getElementById('style-filter'), glassSelect = document.getElementById('glass-filter');
const panelSelect = document.getElementById('panel-filter'), panelField = document.getElementById('panel-field');
const clearButton = document.getElementById('clear-filters');
let items = [], filtered = [], page = 1, active = 0, offerFilter = 'all';
const perPage = 24;
const menu = document.querySelector('.menu'), nav = document.querySelector('header nav');
menu.onclick = () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); };
function selections() {
  return { style: styleSelect?.value || 'all', glass: glassSelect?.value || 'all', panels: panelSelect?.value || 'all' };
}
function matchesDoor(door, selection, query, type) {
  return door.model.toLowerCase().includes(query.trim().toLowerCase()) &&
    (type === 'all' || door.kind === type) &&
    (selection.style === 'all' || (door.styles || []).includes(selection.style)) &&
    (selection.glass === 'all' || door.glazing === selection.glass) &&
    (selection.glass !== 'zonder' || selection.panels === 'all' ||
      (selection.panels === '5plus' ? Number.isInteger(door.panels) && door.panels >= 5 : door.panels !== null && door.panels === Number(selection.panels)));
}
function syncPanelField() {
  if (!panelField) return;
  panelField.hidden = glassSelect.value !== 'zonder';
  if (panelField.hidden) panelSelect.value = 'all';
}
function urlState() {
  const u = new URL(location.href), s = selections(); u.search = '';
  if (search.value.trim()) u.searchParams.set('zoek', search.value.trim());
  if (page > 1) u.searchParams.set('pagina', page);
  if (kind === 'aanbiedingen' && offerFilter !== 'all') u.searchParams.set('type', offerFilter);
  if (s.style !== 'all') u.searchParams.set('stijl', s.style);
  if (s.glass !== 'all') u.searchParams.set('glas', s.glass);
  if (s.glass === 'zonder' && s.panels !== 'all') u.searchParams.set('panelen', s.panels);
  if (modal.open && filtered[active]) u.searchParams.set('model', filtered[active].model);
  history.replaceState(null, '', u);
}
function render() {
  const s = selections();
  filtered = items.filter(x => matchesDoor(x, s, search.value, offerFilter));
  const total = Math.max(1, Math.ceil(filtered.length / perPage)); page = Math.max(1, Math.min(page, total));
  grid.replaceChildren();
  filtered.slice((page - 1) * perPage, page * perPage).forEach((x, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'product-card';
    button.innerHTML = `<div class="product-photo"><img src="${x.image}" alt="${(x.kind || kind) === 'binnendeuren' ? 'Binnendeur' : 'Buitendeur'} model ${x.model}" loading="lazy"></div><div class="product-meta"><div><small>${x.offer ? 'WINSTPAKKER · ' + (x.kind === 'binnendeuren' ? 'BINNEN' : 'BUITEN') : 'MODEL'}</small><strong>${x.model}</strong></div><span>↗</span></div>`;
    button.onclick = () => show((page - 1) * perPage + i); grid.append(button);
  });
  count.textContent = filtered.length ? `${(page - 1) * perPage + 1}–${Math.min(page * perPage, filtered.length)} van ${filtered.length} ${filtered.length === 1 ? 'model' : 'modellen'}` : '0 modellen';
  document.getElementById('empty').hidden = filtered.length > 0;
  if (clearButton) clearButton.disabled = !search.value && s.style === 'all' && s.glass === 'all' && s.panels === 'all';
  pages.replaceChildren();
  if (total > 1) {
    const add = (label, num, disabled, current) => {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.disabled = disabled;
      b.setAttribute('aria-label', label === '←' ? 'Vorige pagina' : label === '→' ? 'Volgende pagina' : 'Pagina ' + num);
      if (current) b.setAttribute('aria-current', 'page');
      b.onclick = () => { page = num; render(); (document.querySelector('.catalog-filters') || document.querySelector('.toolbar')).scrollIntoView({ behavior: 'smooth', block: 'start' }); }; pages.append(b);
    };
    add('←', page - 1, page === 1); for (let n = 1; n <= total; n++) add(String(n), n, false, n === page); add('→', page + 1, page === total);
  }
  urlState();
}
function show(i) {
  if (!filtered[i]) return;
  active = i; const x = filtered[i];
  document.querySelector('.dialog-head .eyebrow').textContent = (x.offer ? 'Winstpakker · ' : '') + (x.kind || kind);
  document.getElementById('product-image').src = x.image;
  document.getElementById('product-image').alt = 'Deur model ' + x.model;
  document.getElementById('product-title').textContent = 'Model ' + x.model;
  let offerInfo = document.getElementById('product-offer-info');
  if (!offerInfo) {
    offerInfo = document.createElement('div'); offerInfo.id = 'product-offer-info'; offerInfo.className = 'offer-information';
    document.getElementById('product-title').after(offerInfo);
  }
  offerInfo.replaceChildren();
  const hasOfferInfo = Boolean(x.offer && (x.price || x.description));
  offerInfo.hidden = !hasOfferInfo;
  if (hasOfferInfo) {
    if (x.price) {
      const price = document.createElement('p'); price.className = 'offer-price'; price.textContent = x.price;
      if (x.vat) { const vat = document.createElement('small'); vat.textContent = x.vat; price.append(vat); }
      offerInfo.append(price);
    }
    if (x.description) {
      const description = document.createElement('div'); description.className = 'offer-description';
      x.description.split('\n').filter(Boolean).forEach(line => { const p = document.createElement('p'); p.textContent = line; description.append(p); });
      offerInfo.append(description);
    }
  }
  const introduction = document.querySelector('.detail-text > p:not(.note)');
  if (introduction) introduction.hidden = hasOfferInfo;

  document.getElementById('product-mail').href = '/offerte-aanvragen/?' + new URLSearchParams({ type: x.kind || kind, model: x.model, ...(x.offer ? { aanbieding: '1' } : {}) });
  document.getElementById('product-mail').textContent = 'Offerte aanvragen ↗';
  document.getElementById('position').textContent = (i + 1) + ' / ' + filtered.length;
  document.getElementById('previous').disabled = i === 0; document.getElementById('next').disabled = i === filtered.length - 1;
  if (!modal.open) modal.showModal(); urlState();
}
modal.querySelector('.close').onclick = () => modal.close();
modal.addEventListener('close', urlState);
document.getElementById('previous').onclick = () => show(active - 1);
document.getElementById('next').onclick = () => show(active + 1);
modal.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' && active > 0) { e.preventDefault(); show(active - 1); }
  if (e.key === 'ArrowRight' && active < filtered.length - 1) { e.preventDefault(); show(active + 1); }
});
modal.addEventListener('click', e => {
  if (e.target === modal) { const r = modal.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) modal.close(); }
});
search.oninput = () => { page = 1; render(); };
function resetFilters() {
  search.value = ''; if (styleSelect) styleSelect.value = 'all'; if (glassSelect) glassSelect.value = 'all'; if (panelSelect) panelSelect.value = 'all';
  syncPanelField(); page = 1; render();
}
document.getElementById('reset').onclick = resetFilters;
if (clearButton) clearButton.onclick = resetFilters;
[styleSelect, glassSelect, panelSelect].filter(Boolean).forEach(select => select.addEventListener('change', () => { syncPanelField(); page = 1; render(); }));
document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => {
  offerFilter = button.dataset.filter; page = 1;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); render();
});
async function loadCatalog() {
  try {
    const urls = [kind === 'aanbiedingen' ? '/assets/aanbiedingen.json?v=offerinfo1' : '/assets/collectie.json'];
    if (styleSelect) urls.push('/assets/catalog-filters.json?v=offers1');
    const data = await Promise.all(urls.map(async url => { const response = await fetch(url); if (!response.ok) throw Error('Load failed'); return response.json(); }));
    items = kind === 'aanbiedingen' ? data[0] : data[0][kind];
    if (styleSelect) {
      const config = data[1];
      config.styles.forEach(style => { const option = document.createElement('option'); option.value = style.value; option.textContent = style.label; styleSelect.append(option); });
      items = items.map(x => ({ ...x, ...config.models[x.model] }));
    }
    const params = new URLSearchParams(location.search);
    search.value = params.get('zoek') || '';
    const restore = (select, key) => { if (select && [...select.options].some(o => o.value === params.get(key))) select.value = params.get(key); };
    restore(styleSelect, 'stijl'); restore(glassSelect, 'glas'); restore(panelSelect, 'panelen'); syncPanelField();
    offerFilter = ['binnendeuren', 'buitendeuren'].includes(params.get('type')) ? params.get('type') : 'all';
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === offerFilter)));
    page = Number(params.get('pagina')) || 1; render();
    const requested = params.get('model'); if (requested) { const index = filtered.findIndex(x => x.model === requested); if (index >= 0) show(index); }
  } catch { count.textContent = 'De collectie kon niet worden geladen. Vernieuw de pagina om het opnieuw te proberen.'; }
}
loadCatalog();
