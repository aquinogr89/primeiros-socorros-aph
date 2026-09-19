(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.module'));
  if (!cards.length) return;
  var q = document.getElementById('busca'),
      tema = document.getElementById('f-tema'),
      pub = document.getElementById('f-publico'),
      dur = document.getElementById('f-duracao'),
      nota = document.getElementById('res-filtro'),
      soma = document.getElementById('soma-tempo'),
      marcados = [];

  function txt(c) { return (c.getAttribute('data-busca') || '').toLowerCase(); }

  function filtra() {
    var termo = (q && q.value || '').trim().toLowerCase(), vis = 0, min = 0;
    cards.forEach(function (c) {
      var ok = (!termo || txt(c).indexOf(termo) !== -1)
        && (!tema.value || c.getAttribute('data-tema') === tema.value)
        && (!pub.value || (c.getAttribute('data-publico') || '').indexOf(pub.value) !== -1)
        && (!dur.value || c.getAttribute('data-duracao') === dur.value);
      c.hidden = !ok;
      if (ok) { vis++; min += Number(c.getAttribute('data-min-basico') || 0); }
    });
    if (nota) nota.textContent = vis + ' de ' + cards.length + ' módulos exibidos';
    if (soma) soma.textContent = min + ' min de apresentação (Nível básico) nos módulos exibidos';
    return vis;
  }

  [q, tema, pub, dur].forEach(function (el) { if (el) el.addEventListener('input', filtra); });
  document.addEventListener('keydown', function (e) { if (e.key === '/' && q) { e.preventDefault(); q.focus(); } });

  // Seleção de módulos para somar tempo e avisar pré-requisitos
  cards.forEach(function (c) {
    var b = c.querySelector('.marcar');
    if (!b) return;
    b.addEventListener('change', function () {
      var slug = c.getAttribute('data-slug');
      marcados = b.checked ? marcados.concat([slug]) : marcados.filter(function (s) { return s !== slug; });
      var min = 0, avisos = [];
      cards.forEach(function (x) {
        if (marcados.indexOf(x.getAttribute('data-slug')) === -1) return;
        min += Number(x.getAttribute('data-min-basico') || 0);
        var pre = (x.getAttribute('data-prereq') || '').split(',').filter(Boolean);
        pre.forEach(function (p) {
          if (marcados.indexOf(p) === -1) avisos.push(x.getAttribute('data-titulo') + ' exige antes: ' + p);
        });
      });
      var alvo = document.getElementById('roteiro');
      alvo.innerHTML = '';
      var p = document.createElement('p');
      p.className = 'score';
      p.textContent = 'Roteiro selecionado: ' + marcados.length + ' módulo(s), ' + min + ' min de apresentação.';
      alvo.appendChild(p);
      avisos.forEach(function (a) {
        var d = document.createElement('p');
        d.className = 'feedback err';
        d.textContent = 'Atenção de pré-requisito — ' + a;
        alvo.appendChild(d);
      });
      if (!avisos.length) {
        var d = document.createElement('p');
        d.textContent = 'Sem aviso de pré-requisito para a seleção atual.';
        alvo.appendChild(d);
      }
    });
  });

  filtra();
})();
