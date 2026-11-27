/* STAR WATER public-site analytics. No private workspace routes or form values. */
(() => {
  'use strict';
  const tag = document.currentScript;
  const page = tag?.dataset.page;
  const id = 'G-02NHVYKH57';
  const domain = 'solucionesstarwater.com';
  if (location.hostname !== domain || !page || !page.startsWith('/')) return;
  // The build injects this file exclusively on indexed marketing pages.
  const canonical = 'https://' + domain + page;
  const key = 'sw_analytics_choice_v1';
  const readChoice = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const saveChoice = value => { try { localStorage.setItem(key, value); } catch { /* preference remains in memory */ } };
  let choice = readChoice();
  let active = false;
  let initialized = false;
  const privacySignal = navigator.globalPrivacyControl === true;
  const deny = {analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'};
  const allow = {...deny, analytics_storage:'granted'};
  function safeReferrer() {
    try {
      const ref = new URL(document.referrer);
      return ['https:', 'http:'].includes(ref.protocol) && ref.hostname !== domain ? ref.origin + '/' : '';
    } catch { return ''; }
  }
  function area() {
    if (page === '/deteccion-de-fugas' || page === '/como-detectar-fuga-de-agua') return 'fugas';
    if (page.startsWith('/tienda') || page === '/como-elegir-equipos-de-agua') return 'tienda';
    if (['/programa','/plataforma','/gestion-de-asadas'].includes(page)) return 'asadas';
    return 'general';
  }
  // Slugs come from static product-page paths; never send link text or URL query strings.
  const itemFromPath = path => /^\/tienda\/[a-z0-9-]+\.html$/.test(path) && path !== '/tienda/filtros-de-agua.html' ? path.split('/').pop().slice(0,-5) : '';
  const item = itemFromPath(page);
  function event(name, extra = {}) {
    if (!active || typeof window.gtag !== 'function') return;
    window.gtag('event', name, {
      send_to:id, page_location:canonical, page_referrer:safeReferrer(),
      area_comercial:area(), ...extra
    });
  }
  function start() {
    if (active || initialized || privacySignal) return;
    initialized = true;
    active = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default', deny);
    window.gtag('consent','update', allow);
    window.gtag('js', new Date());
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('config', id, {
      send_page_view:false,
      allow_google_signals:false,
      allow_ad_personalization_signals:false,
      page_location:canonical,
      page_referrer:safeReferrer()
    });
    event('page_view', {page_title:document.title});
    if (item) event('view_item', {items:[{item_id:item}]});
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function clearAnalyticsCookies() {
    try {
      for (const part of document.cookie.split(';')) {
        const name = part.split('=')[0].trim();
        if (!/^_ga(?:_[A-Za-z0-9]+)?$/.test(name)) continue;
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax; Secure';
        document.cookie = name + '=; Max-Age=0; Path=/; Domain=' + domain + '; SameSite=Lax; Secure';
      }
    } catch { /* cookies can be unavailable */ }
  }
  const panel = document.createElement('section');
  panel.className = 'sw-analytics-consent';
  panel.setAttribute('aria-label', 'Preferencias de medición');
  panel.hidden = true;
  panel.innerHTML = '<p class="sw-consent-heading">Preferencias de medición</p><p>Usamos Google Analytics, solo si lo acepta, para entender cómo se utiliza nuestro sitio público. No es necesario para navegar ni acceder a la plataforma.</p><div class="sw-consent-actions"><button type="button" data-consent="declined">No aceptar</button><button type="button" data-consent="accepted">Aceptar medición</button></div><a href="https://policies.google.com/privacy?hl=es" target="_blank" rel="noopener noreferrer">Privacidad de Google</a>';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sw-analytics-settings';
  button.textContent = 'Preferencias de medición';
  button.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.querySelector('button')?.focus();
  });
  const setChoice = value => {
    choice = value;
    saveChoice(value);
    panel.hidden = true;
    if (value === 'accepted' && !privacySignal) start();
    else if (active) {
      active = false;
      window['ga-disable-' + id] = true;
      clearAnalyticsCookies();
      location.reload();
    }
    button.focus();
  };
  panel.addEventListener('click', e => {
    const value = e.target.closest('[data-consent]')?.dataset.consent;
    if (value === 'accepted' || value === 'declined') setChoice(value);
  });
  document.body.append(panel);
  (document.querySelector('footer .footer-about') || document.querySelector('footer .wrap') || document.querySelector('footer') || document.body).append(button);
  if (privacySignal) {
    panel.querySelector('[data-consent="accepted"]').disabled = true;
    panel.querySelector('.sw-consent-heading').textContent = 'Medición desactivada por su preferencia de privacidad';
    clearAnalyticsCookies();
  } else if (choice === 'accepted') start();
  else if (choice !== 'declined') panel.hidden = false;
  document.addEventListener('click', e => {
    if (!active) return;
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    let url;
    try { url = new URL(a.href, location.href); } catch { return; }
    const same = url.hostname === domain;
    if (['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(url.hostname)) {
      const productLink = a.closest('article.product')?.querySelector('a.product-name-link');
      const product = item || (productLink ? itemFromPath(new URL(productLink.href, location.href).pathname) : '');
      event('clic_whatsapp', product ? {producto:product} : {});
      if (area() === 'tienda' && (product || a.classList.contains('sw-consulta') || page === '/como-elegir-equipos-de-agua' || page === '/tienda/filtros-de-agua')) event('clic_cotizacion', product ? {producto:product} : {});
      if (area() === 'asadas') event('clic_asesoria');
      return;
    }
    const calendar = ['calendar.app.google','calendar.google.com'].includes(url.hostname);
    if (calendar || (same && url.pathname.replace(/\.html$/,'') === '/deteccion-de-fugas' && url.hash === '#reservar')) {
      if (area() === 'fugas') event('clic_agenda_fugas');
      else if (area() === 'asadas') event('clic_asesoria');
      return;
    }
    if (same && /^\/acceso(?:\.html)?$/.test(url.pathname) && url.searchParams.get('prueba') === 'registro') {
      event('clic_prueba_asadas');
      return;
    }
    if (same && url.pathname.replace(/\.html$/,'') === '/consulta-agua') { event('clic_consulta_agua'); return; }
    const selected = same && itemFromPath(url.pathname);
    if (selected) event('select_item', {items:[{item_id:selected}]});
  }, {capture:true});
})();
