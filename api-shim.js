/* Faz o app funcionar fora do Apps Script: imita google.script.run enviando as chamadas
   por HTTPS (POST) para o app da web publicado no Google Apps Script. */
(function () {
  var cfg = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || '';
  var API = '';
  try { API = localStorage.getItem('pb_api') || ''; } catch (e) {}
  API = API || cfg;

  function setup(msg) {
    if (document.getElementById('api_ov')) return;
    var o = document.createElement('div');
    o.id = 'api_ov';
    o.style.cssText = 'position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:18px;background:#0b1a24;color:#e8f0f5;font-family:Inter,system-ui,sans-serif';
    o.innerHTML = '<div style="max-width:440px;width:100%"><h2 style="margin:0 0 8px">Conectar ao servidor</h2>' +
      '<p style="color:#9db2c0;font-size:14px;line-height:1.5">Cole o endereço do app da web do Google Apps Script (o link que termina em <b>/exec</b>). Isso é feito só uma vez neste aparelho.</p>' +
      '<input id="api_in" type="url" placeholder="https://script.google.com/macros/s/.../exec" style="width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid #2c4a5c;background:#12293a;color:#fff;font-size:14px">' +
      '<div id="api_m" style="color:#ff8a8a;font-size:13px;min-height:20px;margin:8px 0">' + (msg || '') + '</div>' +
      '<button id="api_b" style="width:100%;padding:12px;border:0;border-radius:10px;background:#7be05a;color:#0b1a24;font-weight:700;font-size:15px;cursor:pointer">Conectar</button></div>';
    document.body.appendChild(o);
    document.getElementById('api_b').onclick = function () {
      var v = document.getElementById('api_in').value.trim();
      if (!/^https:\/\/script\.google\.com\/(a\/[^\/]+\/)?macros\/s\/[^\/]+\/exec$/.test(v)) {
        document.getElementById('api_m').textContent = 'Endereço inválido. Ele deve começar com https://script.google.com/macros/s/ e terminar em /exec';
        return;
      }
      try { localStorage.setItem('pb_api', v); } catch (e) {}
      location.reload();
    };
  }

  function req(fn, args) {
    if (!API) {
      var go = function () { setup(); };
      if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
      return Promise.reject(new Error('Servidor não configurado'));
    }
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var tm = setTimeout(function () { if (ctl) ctl.abort(); }, 60000);
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ fn: fn, args: args }),
      redirect: 'follow',
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) { return r.text(); }).then(function (t) {
      clearTimeout(tm);
      var j;
      try { j = JSON.parse(t); } catch (e) { throw new Error('Resposta inválida do servidor. Confira se a implantação está como "Qualquer pessoa" e se o Code.gs novo foi publicado.'); }
      if (!j.ok) throw new Error(j.error || 'Erro no servidor');
      return j.result;
    }, function (e) {
      clearTimeout(tm);
      throw new Error(e && e.name === 'AbortError' ? 'timeout' : 'Sem conexão com o servidor. Verifique a internet.');
    });
  }

  function mk(ok, no) {
    return new Proxy({}, {
      get: function (t, p) {
        if (p === 'withSuccessHandler') return function (f) { return mk(f, no); };
        if (p === 'withFailureHandler') return function (f) { return mk(ok, f); };
        if (p === 'withUserObject') return function () { return mk(ok, no); };
        return function () {
          var a = Array.prototype.slice.call(arguments);
          if (p === 'appUrl') { if (ok) ok(location.href.split('#')[0]); return; }
          req(String(p), a).then(function (r) { if (ok) ok(r); }, function (e) { if (no) no(e); else console.error(e); });
        };
      }
    });
  }

  if (!API) { if (document.body) setup(); else document.addEventListener('DOMContentLoaded', function () { setup(); }); }


  /* Botão "Instalar app" dentro do próprio aplicativo (quando o navegador permite) */
  var instEv = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); instEv = e;
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return;
    var b = document.createElement('button');
    b.textContent = '📲 Instalar app';
    b.style.cssText = 'position:fixed;right:14px;bottom:76px;z-index:150;padding:11px 16px;border:0;border-radius:999px;background:#7be05a;color:#0b1a24;font:700 14px Inter,system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.4);cursor:pointer';
    b.onclick = function () { instEv.prompt(); instEv.userChoice.then(function () { b.remove(); instEv = null; }); };
    var add = function () { document.body.appendChild(b); };
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  });
  window.addEventListener('appinstalled', function () { var x = document.querySelectorAll('button'); });


  /* Barra do sistema (topo/rodapé no celular) acompanha a cor do tema escolhido no app */
  function syncTheme() {
    try {
      var c = getComputedStyle(document.documentElement).getPropertyValue('--bg0').trim() || getComputedStyle(document.body).backgroundColor;
      if (!c) return;
      var m = document.querySelector('meta[name="theme-color"]');
      if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
      if (m.content !== c) m.content = c;
    } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    syncTheme();
    try { new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'style', 'class'] }); } catch (e) {}
    setTimeout(syncTheme, 500);
  });

  window.google = { script: { run: mk(null, null) } };
  window.PWA_TROCAR_SERVIDOR = function () { try { localStorage.removeItem('pb_api'); } catch (e) {} location.reload(); };
})();
