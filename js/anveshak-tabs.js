/**
 * Anveshak — Tab-switchable LEA Case Studies + Moat accordion
 */

function initTabs() {
  const tabs = document.querySelectorAll('.case-tab');
  const panels = document.querySelectorAll('.case-panel');

  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(`panel-${target}`);
      if (panel) panel.classList.add('active');
    });
  });
}

function initMoatAccordion() {
  const cards = document.querySelectorAll('.moat-card');

  cards.forEach(card => {
    const header = card.querySelector('.moat-card__header');
    if (!header) return;

    header.addEventListener('click', () => {
      // Close others
      cards.forEach(c => {
        if (c !== card) c.classList.remove('open');
      });
      // Toggle this
      card.classList.toggle('open');
    });
  });
}

function initMeaAccordion() {
  const items = document.querySelectorAll('.mea-accordion__item');

  items.forEach(item => {
    const trigger = item.querySelector('.mea-accordion__trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      // Close others
      items.forEach(i => {
        if (i !== item) i.classList.remove('open');
      });
      item.classList.toggle('open');
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initMoatAccordion();
    initMeaAccordion();
  });
} else {
  initTabs();
  initMoatAccordion();
  initMeaAccordion();
}
