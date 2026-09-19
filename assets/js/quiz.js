/* Motor de exercício: confirmação -> feedback -> trava -> escore (sem certificado). */
(function () {
  var dados = window.QUIZ || null;
  if (!dados) return;
  var raiz = document.getElementById('quiz');
  var estado = { respostas: {}, acertos: 0, finalizado: false };
  var total = dados.questions.length;
  window.QUIZ_ESTADO = estado;

  function p(tag, txt, cls) {
    var e = document.createElement(tag);
    if (txt !== undefined) e.textContent = txt;
    if (cls) e.className = cls;
    return e;
  }

  function render() {
    raiz.innerHTML = '';
    dados.questions.forEach(function (q, i) {
      var qn = i + 1;
      var fs = p('fieldset');
      fs.setAttribute('data-questao', String(qn));
      fs.appendChild(p('legend', qn + '. ' + q.q));
      q.opts.forEach(function (op, j) {
        var lab = p('label', undefined, 'alt');
        var inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = 'q' + qn;
        inp.value = String(j);
        if (estado.respostas[qn] !== undefined) inp.disabled = true;
        if (estado.respostas[qn] === j) inp.checked = true;
        lab.appendChild(inp);
        lab.appendChild(p('span', op));
        fs.appendChild(lab);
      });
      var btn = p('button', 'Confirmar resposta', 'botao');
      btn.type = 'button';
      btn.setAttribute('data-confirmar', String(qn));
      btn.disabled = !!estado.respostas[qn];
      if (estado.respostas[qn]) btn.hidden = true;
      btn.addEventListener('click', function () { confirmar(qn, q); });
      fs.appendChild(btn);
      var fb = p('p', undefined, 'feedback');
      fb.setAttribute('data-feedback', String(qn));
      fb.hidden = true;
      fs.appendChild(fb);
      if (estado.respostas[qn] !== undefined) mostraFeedback(fb, q, estado.respostas[qn]);
      raiz.appendChild(fs);
    });
    var st = p('p', 'Acertos até agora: ' + estado.acertos + ' de ' + total, 'score');
    st.setAttribute('data-placar', 'parcial');
    raiz.appendChild(st);
    var fs = p('button', 'Finalizar e ver resultado', 'botao primario');
    fs.type = 'button';
    fs.setAttribute('data-finalizar', '1');
    fs.setAttribute('title', 'O envio incompleto é recusado e indica qual questão falta.');
    fs.addEventListener('click', finalizar);
    raiz.appendChild(fs);
    var rf = p('button', 'Refazer exercício', 'botao');
    rf.type = 'button';
    rf.setAttribute('data-refazer', '1');
    rf.addEventListener('click', refazer);
    raiz.appendChild(rf);
    var res = p('div');
    res.setAttribute('data-resultado', '1');
    raiz.appendChild(res);
  }

  function mostraFeedback(el, q, escolha) {
    el.hidden = false;
    var ok = escolha === q.answer;
    el.className = 'feedback ' + (ok ? 'ok' : 'err');
    el.textContent = (ok ? 'Correto. ' : 'Não é a alternativa correta. ') + (q.explica || '');
  }

  function confirmar(qn, q) {
    if (estado.respostas[qn] !== undefined) return;           // trava
    var sel = raiz.querySelector('input[name="q' + qn + '"]:checked');
    var aviso = raiz.querySelector('[data-aviso="' + qn + '"]');
    if (aviso) aviso.remove();
    if (!sel) {
      var a = p('p', 'Escolha uma alternativa antes de confirmar.', 'feedback err');
      a.setAttribute('data-aviso', String(qn));
      raiz.querySelector('[data-questao="' + qn + '"]').appendChild(a);
      return;
    }
    var idx = Number(sel.value);
    estado.respostas[qn] = idx;
    if (idx === q.answer) estado.acertos++;
    render();
  }

  function finalizar() {
    if (estado.finalizado) return;
    if (Object.keys(estado.respostas).length < total) {
      var falta = [];
      for (var i = 1; i <= total; i++) if (estado.respostas[i] === undefined) falta.push(i);
      var r0 = raiz.querySelector('[data-resultado]');
      r0.textContent = 'Falta(m) responder/confirmar: questão(ões) ' + falta.join(', ') + '.';
      r0.className = 'feedback err';
      return;
    }
    estado.finalizado = true;
    var nota = (estado.acertos / total * 10).toFixed(1).replace('.', ',');
    var r = raiz.querySelector('[data-resultado]');
    r.className = 'feedback ok';
    r.textContent = 'Resultado teórico da sessão: ' + estado.acertos + ' de ' + total +
      ' — nota ' + nota + '. Pontuação teórica; não é certificação, não atesta competência prática ' +
      'e não substitui prática supervisionada com manequim e observação profissional.';
  }

  function refazer() {
    if (!window.confirm('Refazer o exercício e apagar as respostas desta sessão?')) return;
    estado.respostas = {}; estado.acertos = 0; estado.finalizado = false;
    render();
  }

  render();
})();
