(function () {
  // Só cartões de módulo de verdade: os cartões de escolha de trilha usam .cartao-trilha
  // e já contaram como "módulo" no contador uma vez (20 de 20 em vez de 18 de 18).
  var cards = Array.prototype.slice.call(document.querySelectorAll('.module[data-slug]'));
  if (!cards.length) return;
  var q = document.getElementById('busca'),
      tema = document.getElementById('f-tema'),
      tipo = document.getElementById('f-tipo'),
      dur = document.getElementById('f-duracao'),
      grid = document.getElementById('modulos'),
      nota = document.getElementById('res-filtro'),
      soma = document.getElementById('soma-tempo'),
      marcados = [];

  function txt(c) { return (c.getAttribute('data-busca') || '').toLowerCase(); }
  // Duas apresentações por tema: 1) crianças e adultos do público geral (básico) 2) bombeiros militares (nível 2)
  function modo() { return (tipo && tipo.value === 'tecnicos') ? 'tecnicos' : 'geral'; }
  function minDe(c) {
    return Number(c.getAttribute(modo() === 'tecnicos' ? 'data-min-nivel2' : 'data-min-basico') || 0);
  }
  function rotulo() {
    return modo() === 'tecnicos' ? 'formação técnica de bombeiros' : 'crianças e adultos do público geral';
  }

  function aplicaModo() {
    var m = 'grid modo-' + modo();
    if (grid && grid.className !== m) grid.className = m;
  }

  function filtra() {
    var termo = (q && q.value || '').trim().toLowerCase(), vis = 0, min = 0;
    aplicaModo();
    cards.forEach(function (c) {
      var ok = (!termo || txt(c).indexOf(termo) !== -1)
        && (!tema.value || c.getAttribute('data-tema') === tema.value)
        && (!dur.value || c.getAttribute('data-duracao') === dur.value);
      c.hidden = !ok;
      if (ok) { vis++; min += minDe(c); }
    });
    if (nota) nota.textContent = vis + ' de ' + cards.length + ' módulos exibidos';
    if (soma) soma.textContent = min + ' min de apresentação (' + rotulo() + ') nos módulos exibidos';
    return vis;
  }

  function atualizaRoteiro() {
    var min = 0, avisos = [];
    cards.forEach(function (x) {
      if (marcados.indexOf(x.getAttribute('data-slug')) === -1) return;
      min += minDe(x);
      (x.getAttribute('data-prereq') || '').split(',').filter(Boolean).forEach(function (p) {
        if (marcados.indexOf(p) === -1) avisos.push(x.getAttribute('data-titulo') + ' exige antes: ' + p);
      });
    });
    var alvo = document.getElementById('roteiro');
    if (!alvo) return;
    alvo.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'score';
    p.textContent = 'Roteiro selecionado: ' + marcados.length + ' módulo(s), ' + min +
      ' min de apresentação (' + rotulo() + ').';
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
  }

  [q, tema, dur].forEach(function (el) { if (el) el.addEventListener('input', filtra); });
  if (tipo) {
    tipo.addEventListener('change', function () {
      filtra();
      if (marcados.length) atualizaRoteiro();
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === '/' && q) { e.preventDefault(); q.focus(); } });

  // Seleção de módulos para somar tempo e avisar pré-requisitos
  cards.forEach(function (c) {
    var b = c.querySelector('.marcar');
    if (!b) return;
    b.addEventListener('change', function () {
      var slug = c.getAttribute('data-slug');
      marcados = b.checked ? marcados.concat([slug]) : marcados.filter(function (s) { return s !== slug; });
      atualizaRoteiro();
    });
  });

  filtra();
})();
