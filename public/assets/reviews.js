const search = document.getElementById('review-search');
const cards = [...document.querySelectorAll('[data-review]')];
const count = document.getElementById('review-count');
const empty = document.getElementById('review-empty');
const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const content = cards.map(card => normalize(card.textContent));
search.addEventListener('input', () => {
  const query = normalize(search.value.trim());
  let matches = 0;
  cards.forEach((card, index) => {
    const match = content[index].includes(query);
    card.hidden = !match;
    if (match) matches++;
    const details = card.querySelector('details');
    if (details) details.open = Boolean(query) && match;
  });
  count.textContent = `${matches} ${matches === 1 ? 'klantbericht' : 'klantberichten'}${query ? ' gevonden' : ''}`;
  empty.hidden = matches > 0;
});
const menu = document.querySelector('.menu');
const nav = document.querySelector('header nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
