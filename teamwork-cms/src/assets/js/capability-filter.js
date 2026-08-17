/* Capability index filter.
   Narrows the 34-row table to native or connected capabilities. Group heading rows
   hide when nothing in that group is showing, so the table never leaves an empty
   heading behind. Ships with every row visible, so no-JS readers see the full list
   and the chips are only wired up once the driver runs. */
(function () {
  function init() {
    var bar = document.querySelector('[data-capx-filter]');
    var table = document.querySelector('.capx');
    if (!bar || !table) return;

    var chips = [].slice.call(bar.querySelectorAll('.capx-chip'));
    var rows = [].slice.call(table.querySelectorAll('tbody tr'));
    var live = document.getElementById('capxLive');
    var total = rows.filter(function (r) { return !r.classList.contains('capx-group'); }).length;

    function apply(mode) {
      var group = null, groupHasVisible = false, shown = 0;

      function settleGroup() {
        if (group) group.classList.toggle('capx-off', !groupHasVisible);
      }

      rows.forEach(function (r) {
        if (r.classList.contains('capx-group')) {
          settleGroup();
          group = r; groupHasVisible = false;
          return;
        }
        var kind = r.querySelector('.capx-n') ? 'native' : 'connected';
        var visible = (mode === 'all' || mode === kind);
        r.classList.toggle('capx-off', !visible);
        if (visible) { shown++; groupHasVisible = true; }
      });
      settleGroup();

      if (live) {
        live.textContent = mode === 'all'
          ? 'Showing all ' + total + ' capabilities'
          : 'Showing ' + shown + ' of ' + total + ' capabilities, ' + mode + ' only';
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply(chip.getAttribute('data-capx'));
      });
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
