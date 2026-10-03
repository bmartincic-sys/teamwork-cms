// Line endings. Text runs the full width of its box (text-wrap: pretty in the
// stylesheet). The one case worth fixing by hand is a block whose last line is
// left holding one or two words: those, and only those, are evened out with
// text-wrap: balance. Measured after fonts load and again on resize, because
// where a line breaks depends on both.
(function () {
  if (!window.CSS || !CSS.supports('text-wrap', 'balance')) return;

  var SEL = 'main h1, main h2, main h3, main h4, main p, main li, main figcaption, main blockquote';
  var CLS = 'wrap-even';

  // Where each word sits decides the lines. Measured per word, because a block
  // link or span inside a heading makes the element's own boxes misleading.
  function lastLineWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
    var wr = document.createRange(), re = /\S+/g, m, tops = [];
    while ((node = walker.nextNode())) {
      re.lastIndex = 0;
      while ((m = re.exec(node.textContent))) {
        wr.setStart(node, m.index); wr.setEnd(node, m.index + m[0].length);
        var r = wr.getClientRects()[0];
        if (r && r.width) tops.push(r.top);
      }
    }
    if (tops.length < 3) return null;
    var first = Math.min.apply(null, tops), last = Math.max.apply(null, tops);
    if (last - first < 4) return null;                            // one line: nothing to fix
    var words = 0;
    for (var i = 0; i < tops.length; i++) if (last - tops[i] < 4) words++;
    return words;
  }

  function run() {
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) els[i].classList.remove(CLS);
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      if (!el.offsetParent || el.closest('nav, .faq-answer[hidden]')) continue;
      var n = lastLineWords(el);
      if (n !== null && n <= 2) el.classList.add(CLS);
    }
  }

  var t;
  function later() { clearTimeout(t); t = setTimeout(run, 150); }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(run);
  window.addEventListener('resize', later);
  // FAQ answers and tab panels change size when opened.
  document.addEventListener('click', function (e) {
    if (e.target.closest('.faq-question, .captab, [role="tab"]')) later();
  });
})();
