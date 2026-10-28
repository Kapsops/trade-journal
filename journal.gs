/**
 * Config.gs — все константы журнала в одном месте.
 * Имена листов, цвета темы, раскладка колонок, настройки по умолчанию.
 * Остальные файлы ссылаются только сюда, номера колонок нигде не «зашиты».
 */

const TZ = 'Europe/Moscow';

const SH = {
  OPEN: 'Открытые',
  ORDERS: 'Заявки',
  CLOSED: 'Закрытые',
  STATS: 'Статистика',
  EXP: 'Расходы',
  SETTINGS: 'Настройки',
  REF: 'Справочник',
};

/** Порядок вкладок слева направо. */
const SHEET_ORDER = [SH.OPEN, SH.ORDERS, SH.CLOSED, SH.STATS, SH.EXP, SH.SETTINGS, SH.REF];

/**
 * Палитры в стиле TradingView. Активна THEME_MODE.
 * light — светлая тема TradingView; Dark Reader превращает её в тёмную.
 * dark  — тёмная тема TradingView, если смотреть без Dark Reader.
 * neon  — почти чёрный фон, неоновые зелёный (прибыль) и оранжевый (акцент), как калькулятор. Dark Reader для Таблиц выключить.
 * neonLight — светлая «негатив» палитры neon: цвета подобраны обратным расчётом фильтра Dark Reader
 *   (invert + hue-rotate 180° + яркость/контраст 85%), чтобы под ним журнал выглядел как калькулятор.
 */
const THEME_MODE = 'neonLight';
const PALETTES = {
  neonLight: {
    bg: '#ffffff', head: '#f7f8fe', text: '#000000', muted: '#676a74',
    profit: '#006a46', loss: '#f44017', accent: '#d85700', chart: '#006a46',
    profitBg: '#cef1df', lossBg: '#ffebde', warn: '#9f4000',
    font: 'Inter', mono: 'JetBrains Mono', line: '#dbdde5', onAccent: '#ffffff', radius: 10,
  },
  neon: {
    bg: '#0b0c0e', head: '#17181c', text: '#e8e8ea', muted: '#7d7f86',
    profit: '#3ee08f', loss: '#ff6a4d', accent: '#ff7a2a', chart: '#3ee08f',
    profitBg: '#0f2a1d', lossBg: '#2e1510', warn: '#ffb347',
    font: 'Inter', mono: 'JetBrains Mono', line: '#2a2c31', onAccent: '#1a0b02', radius: 10,
  },
  dark: {
    bg: '#131722', head: '#1e222d', text: '#d1d4dc', muted: '#787b86',
    profit: '#26a69a', loss: '#ef5350', accent: '#2962ff',
    profitBg: '#14332f', lossBg: '#3b1d22', warn: '#f0a030',
  },
  light: {
    bg: '#ffffff', head: '#f0f3fa', text: '#131722', muted: '#787b86',
    profit: '#089981', loss: '#f23645', accent: '#2962ff',
    profitBg: '#ddf3ef', lossBg: '#fde4e6', warn: '#e65100',
  },
};
const THEME = Object.assign({ font: 'Roboto', mono: 'Roboto Mono', size: 10, rowH: 22, line: '#e0e3eb', onAccent: '#fff', radius: 4 }, PALETTES[THEME_MODE]);
THEME.chart = THEME.chart || THEME.accent;

/** Цена «рядом» с SL/TP, доля от цены. */
const NEAR_PCT = 0.003;

/** Диапазон справочника для формул (VLOOKUP). Колонки см. REF_COLS. */
const REF_RANGE = "'" + SH.REF + "'!$A:$L";

/**
 * Справочник: одна строка — один инструмент.
 * PTVALUE — сколько ₽ даёт движение цены на 1 пункт для 1 единицы объёма:
 *   фьючерс: STEPPRICE / MINSTEP (за 1 контракт)
 *   акция:   LOTSIZE            (за 1 лот)
 * Благодаря ей все формулы одинаковы: движение ₽ = Δцены × PTVALUE × объём.
 */
const REF_COLS = ['SECID', 'SHORTNAME', 'TYPE', 'MINSTEP', 'STEPPRICE', 'LOTSIZE',
  'INITIALMARGIN', 'LASTTRADEDATE', 'DECIMALS', 'PTVALUE', 'PREVPRICE', 'ISIN'];
const RC = REF_COLS.reduce((o, k, i) => (o[k] = i + 1, o), {}); // номер колонки по имени

/**
 * Описание колонок.
 * t (тип) задаёт формат и выравнивание:
 *   text, ticker, side, strategy, check, price, qty, money, pnl, r, rr, pct, dt, dur, link
 * f — формула-заголовок (ARRAYFORMULA), строится в Setup.gs.
 * hide — колонка уходит в свёрнутую группу.
 */
const OPEN = {
  SUMMARY: 1, HEAD: 2, FIRST: 3,
  cols: [
    { k: 'TICKER',   h: 'Тикер',   t: 'ticker',  w: 62 },
    { k: 'SIDE',     h: 'L/S',     t: 'side',    w: 32 },
    { k: 'QTY',      h: 'Объём',   t: 'qty',     w: 46 },
    { k: 'ENTRY',    h: 'Вход',    t: 'price',   w: 70 },
    { k: 'PRICE',    h: 'Текущая', t: 'price',   w: 70 },
    { k: 'SL',       h: 'SL',      t: 'price',   w: 70 },
    { k: 'TP',       h: 'TP',      t: 'price',   w: 70 },
    { k: 'PNL',      h: 'PnL ₽',   t: 'pnl',     w: 78, f: 'openPnl' },
    { k: 'PNLR',     h: 'R',       t: 'r',       w: 50, f: 'openR' },
    { k: 'STOPPNL',  h: 'По стопу ₽', t: 'pnl',  w: 112, f: 'openStop' },   // ≥ 0 — позиция без риска
    { k: 'CLOSE',    h: '✕',       t: 'check',   w: 28 },
    // ---- свёрнутая группа ----
    { k: 'ID',       h: 'ID',          t: 'qty',      w: 44,  hide: true },
    { k: 'NAME',     h: 'Инструмент',  t: 'text',     w: 96,  hide: true, f: 'name' },
    { k: 'OPENED',   h: 'Вход, время', t: 'dt',       w: 104, hide: true },
    { k: 'STRATEGY', h: 'Стратегия',   t: 'strategy', w: 110, hide: true },
    { k: 'MARGIN',   h: 'ГО ₽',        t: 'money',    w: 78,  hide: true, f: 'openMargin' },
    { k: 'RISK',     h: 'До стопа ₽',  t: 'money',    w: 78,  hide: true, f: 'openRisk' },
    { k: 'NOTE',     h: 'Заметка',     t: 'text',     w: 160, hide: true },
    { k: 'SHOT',     h: 'Скрин',       t: 'link',     w: 80,  hide: true },
    { k: 'SL0',      h: 'SL план',     t: 'price',    w: 70,  hide: true },
    { k: 'TAG',      h: 'Метка',       t: 'text',     w: 60,  hide: true },   // цвет лампочки: red…violet
  ],
};

const ORDERS = {
  HEAD: 1, FIRST: 2,
  cols: [
    { k: 'CREATED',  h: 'Создана',   t: 'dt',       w: 82, fmt: 'dd.mm hh:mm' },
    { k: 'TICKER',   h: 'Тикер',     t: 'ticker',   w: 62 },
    { k: 'SIDE',     h: 'L/S',       t: 'side',     w: 32 },
    { k: 'QTY',      h: 'Объём',     t: 'qty',      w: 46 },
    { k: 'ENTRY',    h: 'Вход',      t: 'price',    w: 66 },
    { k: 'SL',       h: 'SL',        t: 'price',    w: 66 },
    { k: 'TP',       h: 'TP',        t: 'price',    w: 66 },
    { k: 'RISK',     h: 'Риск ₽',    t: 'money',    w: 66, f: 'orderRisk' },
    { k: 'RR',       h: 'R:R',       t: 'rr',       w: 40, f: 'orderRR' },
    { k: 'STRATEGY', h: 'Стратегия', t: 'strategy', w: 86 },
    { k: 'FILL',     h: '✓',         t: 'check',    w: 26 },
    { k: 'CANCEL',   h: '✕',         t: 'check',    w: 26 },
    // ---- свёрнутая группа ----
    { k: 'ID',       h: 'ID',        t: 'qty',      w: 44,  hide: true },
    { k: 'NOTE',     h: 'Заметка',   t: 'text',     w: 160, hide: true },
    { k: 'TAG',      h: 'Метка',     t: 'text',     w: 60,  hide: true },
  ],
};

const CLOSED = {
  HEAD: 1, FIRST: 2,
  cols: [
    { k: 'ID',       h: 'ID',         t: 'qty',      w: 44 },
    { k: 'OPENED',   h: 'Вход, время',  t: 'dt',     w: 104 },
    { k: 'CLOSED',   h: 'Выход, время', t: 'dt',     w: 104 },
    { k: 'TICKER',   h: 'Тикер',      t: 'ticker',   w: 62 },
    { k: 'SIDE',     h: 'L/S',        t: 'side',     w: 32 },
    { k: 'QTY',      h: 'Объём',      t: 'qty',      w: 46 },
    { k: 'ENTRY',    h: 'Вход',       t: 'price',    w: 70 },
    { k: 'EXIT',     h: 'Выход',      t: 'price',    w: 70 },
    { k: 'SL',       h: 'SL план',    t: 'price',    w: 70 },
    { k: 'TP',       h: 'TP',         t: 'price',    w: 70 },
    { k: 'FEE',      h: 'Комиссия',   t: 'money',    w: 66 },
    { k: 'PNL',      h: 'PnL ₽',      t: 'pnl',      w: 78 },
    { k: 'PNLR',     h: 'R',          t: 'r',        w: 50, f: 'closedR' },
    { k: 'PLANRR',   h: 'План R:R',   t: 'rr',       w: 56, f: 'closedRR' },
    { k: 'DUR',      h: 'В сделке',   t: 'dur',      w: 64, f: 'closedDur' },
    { k: 'STRATEGY', h: 'Стратегия',  t: 'strategy', w: 110 },
    { k: 'NOTE',     h: 'Заметка',    t: 'text',     w: 200 },
    { k: 'SHOT',     h: 'Скрин',      t: 'link',     w: 80 },
    { k: 'RISK',     h: 'Риск план ₽', t: 'money',   w: 72, f: 'closedRisk' },
    { k: 'PV',       h: '₽/пункт',    t: 'num',      w: 64 },  // зафиксировано при закрытии
    { k: 'TILT',     h: 'Тильт',      t: 'text',     w: 170, f: 'closedTilt' },  // ⚠ 3+ сделки по инструменту за день
    { k: 'EXIT_STRAT', h: 'Стратегия выхода', t: 'text', w: 130 },
    { k: 'TAG',      h: 'Метка',      t: 'text',     w: 60 },
  ],
};

/**
 * Доходы и расходы вне сделок: комиссия за плечо, перенос через РЕПО, пени, дивиденды.
 * Заполняется импортом брокерского отчёта, можно дописывать вручную. Расход — со знаком минус.
 */
const EXP = {
  HEAD: 1, FIRST: 2, KEY: 'KIND',
  cols: [
    { k: 'DATE',   h: 'Дата',        t: 'dt',   w: 104, fmt: 'dd.mm.yyyy' },
    { k: 'KIND',   h: 'Вид',         t: 'text', w: 150 },
    { k: 'AMOUNT', h: 'Сумма ₽',     t: 'pnl',  w: 90 },
    { k: 'NOTE',   h: 'Комментарий', t: 'text', w: 360 },
  ],
};

/** Колонка, по которой определяется «строка занята». */
function keyCol_(layout) { return C_(layout)[layout.KEY || 'TICKER']; }

/** Номера колонок по ключу: C_(OPEN).SL → 6 */
function C_(layout) {
  if (!layout._idx) layout._idx = layout.cols.reduce((o, c, i) => (o[c.k] = i + 1, o), {});
  return layout._idx;
}

/** Буква колонки по ключу: L_(OPEN,'SL') → 'F' */
function L_(layout, key) {
  return colLetter_(C_(layout)[key]);
}

function colLetter_(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; }
  return s;
}

/**
 * Настройки: каждая строка — именованный диапазон (имя используется в формулах).
 * def пишется только в пустую ячейку — повторный запуск установки ваши значения не трогает.
 */
const SETTINGS = [
  { name: 'SET_DEPOSIT',     label: 'Депозит, ₽',                                  def: 1000000, fmt: '#,##0' },
  { name: 'SET_COMM_FUT',    label: 'Комиссия фьючерсы, ₽ за контракт (за сторону)', def: 0.45,     fmt: '0.00' },
  { name: 'SET_COMM_STK',    label: 'Комиссия акции, % оборота (за сторону)',       def: 0.0006,  fmt: '0.000%' },
  { name: 'SET_RISK_TRADE',  label: 'Лимит риска на сделку, % депозита',            def: 0.01,    fmt: '0.0%' },
  { name: 'SET_RISK_TOTAL',  label: 'Лимит суммарного риска открытых, % депозита',  def: 0.05,    fmt: '0.0%' },
  { name: 'SET_API_KEY',     label: 'Ключ доступа для калькулятора',                def: '=KEY',  fmt: '@' },
  { name: 'SET_REF_UPDATED', label: 'Справочник MOEX обновлён',                     def: '',      fmt: 'dd.mm.yy hh:mm', ro: true },
  // Новые параметры — только в конец списка: строки «Настроек» привязаны к порядку.
  { name: 'SET_EXCH_FUT',    label: 'Биржевой сбор фьючерсы, % стоимости контракта (за сторону)', def: 0.000066, fmt: '0.0000%' },
  { name: 'SET_REPO_SHORT',  label: 'Перенос шорта по акциям (РЕПО), % годовых',    def: 0.06,    fmt: '0.00%' },
  { name: 'SET_REPO_LONG',   label: 'Перенос лонга по акциям в долг, % годовых',    def: 0.1465,  fmt: '0.00%' },
  { name: 'SET_FUT_LEV',     label: 'Плата за плечо фьючерсов (ГО не покрыто рублями), % годовых от ГО', def: 0.2, fmt: '0.00%' },
];

const STRATEGY_DEFAULTS = ['Пробой', 'Отбой от уровня', 'Тренд', 'Контртренд', 'Новости'];
const STRATEGY_ROWS = 30; // сколько строк отведено под список стратегий
const EXIT_STRATEGY_DEFAULTS = ['Стоп', 'Тейк', 'Безубыток', 'Частичная фиксация', 'Трейлинг', 'По времени', 'Руками / эмоции'];
/** Цветные метки-лампочки: код цвета и подпись по умолчанию (подписи меняются в приложении). */
const TAGS = [['red', 'Красный', 'особый контроль'], ['orange', 'Оранжевый', ''], ['yellow', 'Жёлтый', 'внимание'],
  ['green', 'Зелёный', ''], ['cyan', 'Голубой', ''], ['blue', 'Синий', ''], ['violet', 'Фиолетовый', '']];

/** Галочка-кнопка «⟳ обновить всё» в сводке над «Открытыми» (строка 1). */
const REFRESH_COL = 11;

/** Обработчик правок (устанавливаемый триггер: умеет открывать диалоги). */
const EDIT_HANDLER = 'handleEdit';

/**
 * Setup.gs — создание и оформление листов.
 * setupJournal() можно запускать сколько угодно раз: данные не трогает,
 * только восстанавливает шапки, формулы, форматы, списки и подсветку.
 */

/** Главная функция установки. Меню: Журнал → Сервис → Установить / починить оформление. */
function setupJournal() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TZ);

  buildSettings_(ss);   // первыми: формулы ссылаются на именованные диапазоны
  buildRef_(ss);
  buildTable_(ss, SH.OPEN, OPEN);
  buildTable_(ss, SH.ORDERS, ORDERS);
  buildTable_(ss, SH.CLOSED, CLOSED);
  buildTable_(ss, SH.EXP, EXP);
  buildOpenSummary_(ss.getSheetByName(SH.OPEN));
  buildStats_(ss);
  arrangeSheets_(ss);

  const ref = ss.getSheetByName(SH.REF);
  if (lastDataRow_(ref, 2, 1) < 2 || ref.getRange(2, RC.ISIN).getValue() === '') refreshReference_(false); // нет данных или старый формат
  refreshPriceFormats_();
  installTriggers_();
  toast_('Журнал настроен');
}

// ---------------------------------------------------------------- таблицы

/** Стиль по типу колонки: выравнивание, шрифт, числовой формат. */
const TYPE_STYLE = {
  text:     { a: 'left',   mono: false, fmt: '@' },
  link:     { a: 'left',   mono: false, fmt: '@' },
  ticker:   { a: 'left',   mono: true,  fmt: '@' },
  side:     { a: 'center', mono: false, fmt: '@' },
  strategy: { a: 'left',   mono: false, fmt: '@' },
  check:    { a: 'center', mono: false, fmt: 'General' },
  price:    { a: 'right',  mono: true,  fmt: 'General' }, // точный формат — по DECIMALS инструмента
  qty:      { a: 'right',  mono: true,  fmt: '0' },
  money:    { a: 'right',  mono: true,  fmt: '#,##0' },
  pnl:      { a: 'right',  mono: true,  fmt: '+#,##0;-#,##0;0' },
  r:        { a: 'right',  mono: true,  fmt: '+0.00;-0.00;0.00' },
  rr:       { a: 'right',  mono: true,  fmt: '0.0' },
  num:      { a: 'right',  mono: true,  fmt: 'General' },
  pct:      { a: 'right',  mono: true,  fmt: '0.0%' },
  dt:       { a: 'right',  mono: true,  fmt: 'dd.mm.yy hh:mm' },
  dur:      { a: 'right',  mono: true,  fmt: '[h]:mm' },
};

/** Строит лист-таблицу («Открытые», «Заявки», «Закрытые») по описанию колонок из Config.gs. */
function buildTable_(ss, name, layout) {
  const sh = ensureSheet_(ss, name);
  const c = C_(layout);
  const ncols = layout.cols.length;

  // Миграция: колонка «По стопу ₽» появилась после R — вставляем пустую, чтобы данные не съехали.
  if (name === SH.OPEN && sh.getMaxColumns() >= C_(OPEN).STOPPNL && sh.getRange(OPEN.HEAD, C_(OPEN).STOPPNL).getValue() === '✕') {
    sh.insertColumnAfter(C_(OPEN).PNLR);
  }
  // Компактная сетка: ровно столько колонок, сколько нужно, строки — данные + одна пустая «запасная».
  // Новые сделки вставляются перед запасной строкой, поэтому наследуют списки, галочки и подсветку.
  sh.setFrozenRows(0);
  const last = lastDataRow_(sh, layout.FIRST, keyCol_(layout));
  fitGrid_(sh, Math.max(last + 1, layout.FIRST + 1), ncols); // минимум две строки под данные
  const rows = sh.getMaxRows();
  const nData = rows - layout.FIRST + 1;

  paint_(sh);

  // Шапка: текст или формула-массив, которая считает всю колонку.
  const F = tableFormulas_();
  layout.cols.forEach((col, i) => {
    const head = sh.getRange(layout.HEAD, i + 1);
    if (col.f) {
      sh.getRange(layout.FIRST, i + 1, nData, 1).clearContent(); // иначе массив не «разольётся»
      head.setFormula(fx_(F[col.f]));
    } else {
      head.setValue(col.h);
    }
  });

  // Ширина, выравнивание, шрифт, формат.
  const headRow = sh.getRange(layout.HEAD, 1, 1, ncols)
    .setBackground(THEME.head).setFontColor(THEME.muted).setFontSize(9);
  sh.setRowHeight(layout.HEAD, 24);
  layout.cols.forEach((col, i) => {
    const st = TYPE_STYLE[col.t];
    sh.setColumnWidth(i + 1, col.w);
    sh.getRange(layout.HEAD, i + 1).setHorizontalAlignment(st.a);
    sh.getRange(layout.FIRST, i + 1, nData, 1)
      .setHorizontalAlignment(st.a)
      .setFontFamily(st.mono ? THEME.mono : THEME.font)
      .setNumberFormat(col.fmt || st.fmt);
  });

  applyValidation_(ss, sh, layout, name !== SH.ORDERS); // в «Открытых»/«Закрытых» допустимы истёкшие контракты из импорта
  applyConditional_(sh, layout, name);

  sh.setFrozenRows(layout.HEAD);
  groupHidden_(sh, layout);

  // Шапку защищаем «мягко» (только предупреждение), чтобы случайно не стереть формулу.
  sh.getProtections(SpreadsheetApp.ProtectionType.RANGE)
    .filter(p => p.getDescription() === 'journal-head').forEach(p => p.remove());
  headRow.protect().setDescription('journal-head').setWarningOnly(true);

  if (name === SH.CLOSED) {
    if (sh.getFilter()) sh.getFilter().remove();
    sh.getRange(layout.HEAD, 1, rows - layout.HEAD + 1, ncols).createFilter();
  }
  return sh;
}

/**
 * Формулы-массивы для расчётных колонок. Живут в ячейке шапки и считают всю колонку,
 * поэтому перенос/удаление строк скриптом их не ломает.
 * Справочник: 2 SHORTNAME, 3 TYPE, 6 LOTSIZE, 7 INITIALMARGIN, 10 PTVALUE.
 */
function tableFormulas_() {
  const R = REF_RANGE;
  const rg = (layout, k) => { const a = L_(layout, k); return a + layout.FIRST + ':' + a; };
  const head = (layout, k) => '"' + layout.cols[C_(layout)[k] - 1].h + '"';

  // ---- Открытые
  const o = k => rg(OPEN, k);
  const oT = o('TICKER'), oS = o('SIDE'), oQ = o('QTY'), oE = o('ENTRY'), oP = o('PRICE'),
        oSL = o('SL'), oSL0 = o('SL0'), oPnl = o('PNL');
  const look = (n) => 'VLOOKUP(' + oT + ',' + R + ',' + n + ',0)';

  // PnL = направление × Δцены × ₽/пункт × объём − комиссия входа − комиссия выхода (по текущей цене)
  const openPnl = '=ARRAYFORMULA({' + head(OPEN, 'PNL') + ';IF((' + oT + '="")+(' + oE + '="")+(' + oP + '=""),,IFERROR(LET(' +
    'tp,' + look(3) + ',pv,' + look(10) + ',lot,' + look(6) + ',' +
    'dir,IF(' + oS + '="S",-1,1),' +
    'fee,IF(tp="F",' + oQ + '*(SET_COMM_FUT*2+(' + oE + '+' + oP + ')*pv*SET_EXCH_FUT),(' + oE + '+' + oP + ')*lot*' + oQ + '*SET_COMM_STK),' +
    'dir*(' + oP + '-' + oE + ')*pv*' + oQ + '-fee)))})';

  // R = PnL / плановый риск (от «SL план», а если он пуст — от текущего SL)
  const openR = '=ARRAYFORMULA({' + head(OPEN, 'PNLR') + ';IF((' + oPnl + '="")+(' + oT + '="")+(' + oSL0 + '="")*(' + oSL + '=""),,IFERROR(LET(' +
    'stop,IF(' + oSL0 + '="",' + oSL + ',' + oSL0 + '),' +
    oPnl + '/(ABS(' + oE + '-stop)*' + look(10) + '*' + oQ + '))))})';

  // По стопу: результат, если сработает текущий SL (с комиссией входа и выхода). ≥ 0 — позиция без риска.
  const openStop = '=ARRAYFORMULA({' + head(OPEN, 'STOPPNL') + ';IF((' + oT + '="")+(' + oE + '="")+(' + oSL + '=""),,IFERROR(LET(' +
    'tp,' + look(3) + ',pv,' + look(10) + ',lot,' + look(6) + ',' +
    'dir,IF(' + oS + '="S",-1,1),' +
    'fee,IF(tp="F",' + oQ + '*(SET_COMM_FUT*2+(' + oE + '+' + oSL + ')*pv*SET_EXCH_FUT),(' + oE + '+' + oSL + ')*lot*' + oQ + '*SET_COMM_STK),' +
    'dir*(' + oSL + '-' + oE + ')*pv*' + oQ + '-fee)))})';

  const name = '=ARRAYFORMULA({' + head(OPEN, 'NAME') + ';IF(' + oT + '="",,IFERROR(' + look(2) + ',"нет в справочнике"))})';

  // ГО: фьючерс = INITIALMARGIN × контракты; акция = цена × LOTSIZE × лоты
  const openMargin = '=ARRAYFORMULA({' + head(OPEN, 'MARGIN') + ';IF(' + oT + '="",,IFERROR(' +
    'IF(' + look(3) + '="F",' + look(7) + ',IF(' + oP + '="",' + oE + ',' + oP + ')*' + look(6) + ')*' + oQ + '))})';

  // До стопа: сколько потеряем относительно входа, если сработает текущий SL (стоп в плюсе → 0)
  const openRisk = '=ARRAYFORMULA({' + head(OPEN, 'RISK') + ';IF((' + oT + '="")+(' + oSL + '="")+(' + oE + '=""),,IFERROR(LET(' +
    'x,IF(' + oS + '="S",' + oSL + '-' + oE + ',' + oE + '-' + oSL + ')*' + look(10) + '*' + oQ + ',' +
    'IF(x>0,x,0))))})';

  // ---- Заявки
  const z = k => rg(ORDERS, k);
  const zT = z('TICKER'), zQ = z('QTY'), zE = z('ENTRY'), zSL = z('SL'), zTP = z('TP');
  const orderRisk = '=ARRAYFORMULA({' + head(ORDERS, 'RISK') + ';IF((' + zT + '="")+(' + zE + '="")+(' + zSL + '=""),,IFERROR(' +
    'ABS(' + zE + '-' + zSL + ')*VLOOKUP(' + zT + ',' + R + ',10,0)*' + zQ + '))})';
  const orderRR = '=ARRAYFORMULA({' + head(ORDERS, 'RR') + ';IF((' + zE + '="")+(' + zSL + '="")+(' + zTP + '=""),,IFERROR(' +
    'ABS(' + zTP + '-' + zE + ')/ABS(' + zE + '-' + zSL + ')))})';

  // ---- Закрытые (PnL и комиссия — значения, «замороженные» при закрытии)
  const x = k => rg(CLOSED, k);
  const closedR = '=ARRAYFORMULA({' + head(CLOSED, 'PNLR') + ';IF((' + x('PNL') + '="")+(' + x('RISK') + '=""),,IFERROR(' +
    x('PNL') + '/' + x('RISK') + '))})';
  const closedRR = '=ARRAYFORMULA({' + head(CLOSED, 'PLANRR') + ';IF((' + x('ENTRY') + '="")+(' + x('SL') + '="")+(' + x('TP') + '=""),,IFERROR(' +
    'ABS(' + x('TP') + '-' + x('ENTRY') + ')/ABS(' + x('ENTRY') + '-' + x('SL') + ')))})';
  const closedRisk = '=ARRAYFORMULA({' + head(CLOSED, 'RISK') + ';IF((' + x('ENTRY') + '="")+(' + x('SL') + '="")+(' + x('PV') + '=""),,IFERROR(' +
    'ABS(' + x('ENTRY') + '-' + x('SL') + ')*' + x('PV') + '*' + x('QTY') + '))})';
  const closedDur = '=ARRAYFORMULA({' + head(CLOSED, 'DUR') + ';IF((' + x('OPENED') + '="")+(' + x('CLOSED') + '=""),,' +
    x('CLOSED') + '-' + x('OPENED') + ')})';

  // Тильт: 3 и больше сделок по одному инструменту за день (считаются разные ID)
  const closedTilt = '=ARRAYFORMULA({' + head(CLOSED, 'TILT') + ';IF(' + x('ID') + '="",,LET(c,MAP(' + x('ID') + ',' + x('OPENED') + ',' + x('TICKER') +
    ',LAMBDA(i,b,t,IF(t="",0,COUNTUNIQUEIFS(' + x('ID') + ',' + x('TICKER') + ',t,' + x('OPENED') + ',">="&INT(b),' + x('OPENED') + ',"<"&(INT(b)+1))))),' +
    'IF(c>=3,"⚠ тильт: "&c&" сделки за день","")))})';

  return { openPnl, openR, openStop, name, openMargin, openRisk, orderRisk, orderRR, closedR, closedRR, closedRisk, closedDur, closedTilt };
}

/** Выпадающие списки и галочки на строках данных. */
function applyValidation_(ss, sh, layout, lenient) {
  const n = sh.getMaxRows() - layout.FIRST + 1;
  const refList = ss.getSheetByName(SH.REF).getRange('A2:A');
  const strategies = ss.getRangeByName('STRATEGIES');
  const DV = SpreadsheetApp.newDataValidation;

  layout.cols.forEach((col, i) => {
    const r = sh.getRange(layout.FIRST, i + 1, n, 1);
    let rule = null;
    switch (col.t) {
      case 'ticker':   rule = DV().requireValueInRange(refList, true).setAllowInvalid(lenient); break; // в архиве допустимы истёкшие
      case 'side':     rule = DV().requireValueInList(['L', 'S'], true).setAllowInvalid(false); break;
      case 'strategy': rule = DV().requireValueInRange(strategies, true).setAllowInvalid(lenient); break;
      case 'qty':      if (col.k === 'QTY') rule = DV().requireNumberGreaterThan(0).setAllowInvalid(false); break;
    }
    if (col.t === 'check') { r.insertCheckboxes().setFontColor(THEME.muted); return; } // все галочки сброшены
    if (rule) r.setDataValidation(rule.build()); else r.clearDataValidations();
  });
}

/** Условное форматирование: цвет PnL, L/S, близость цены к SL/TP, превышение лимитов. */
function applyConditional_(sh, layout, name) {
  const c = C_(layout);
  const n = sh.getMaxRows() - layout.FIRST + 1;
  const col = k => sh.getRange(layout.FIRST, c[k], n, 1);
  const A = k => '$' + L_(layout, k) + layout.FIRST;
  const CF = SpreadsheetApp.newConditionalFormatRule;
  const rules = [];

  const signColor = k => {
    rules.push(CF().whenNumberGreaterThan(0).setFontColor(THEME.profit).setRanges([col(k)]).build());
    rules.push(CF().whenNumberLessThan(0).setFontColor(THEME.loss).setRanges([col(k)]).build());
  };
  if (c.SIDE) {
    rules.push(CF().whenTextEqualTo('L').setFontColor(THEME.profit).setRanges([col('SIDE')]).build());
    rules.push(CF().whenTextEqualTo('S').setFontColor(THEME.loss).setRanges([col('SIDE')]).build());
  }
  if (name === SH.EXP) signColor('AMOUNT');

  if (name === SH.OPEN) {
    signColor('PNL'); signColor('PNLR'); signColor('STOPPNL');
    // Без риска: стоп в безубытке или дальше — тикер подсвечен зелёным
    rules.push(CF().whenFormulaSatisfied(fx_('=AND(ISNUMBER(' + A('STOPPNL') + '),' + A('STOPPNL') + '>=0)'))
      .setBackground(THEME.profitBg).setFontColor(THEME.profit).setBold(true).setRanges([col('TICKER')]).build());
    const P = A('PRICE'), S = A('SIDE'), SL = A('SL'), TP = A('TP');
    const has = lvl => 'ISNUMBER(' + lvl + '),ISNUMBER(' + P + ')';
    // Порядок важен: сначала «за уровнем» (заливка), потом «рядом» (цвет текста).
    rules.push(CF().whenFormulaSatisfied(fx_('=AND(' + has(SL) + ',IF(' + S + '="S",' + P + '>=' + SL + ',' + P + '<=' + SL + '))'))
      .setBackground(THEME.lossBg).setFontColor(THEME.loss).setBold(true).setRanges([col('SL')]).build());
    rules.push(CF().whenFormulaSatisfied(fx_('=AND(' + has(SL) + ',ABS(' + P + '-' + SL + ')<=' + P + '*' + NEAR_PCT + ')'))
      .setFontColor(THEME.warn).setBold(true).setRanges([col('SL')]).build());
    rules.push(CF().whenFormulaSatisfied(fx_('=AND(' + has(TP) + ',IF(' + S + '="S",' + P + '<=' + TP + ',' + P + '>=' + TP + '))'))
      .setBackground(THEME.profitBg).setFontColor(THEME.profit).setBold(true).setRanges([col('TP')]).build());
    rules.push(CF().whenFormulaSatisfied(fx_('=AND(' + has(TP) + ',ABS(' + P + '-' + TP + ')<=' + P + '*' + NEAR_PCT + ')'))
      .setFontColor(THEME.profit).setBold(true).setRanges([col('TP')]).build());

    // Сводка (строка 1): PnL цветом, риск красным при превышении лимита.
    const s = OPEN.SUMMARY;
    const pnlCell = sh.getRange(s, 2), riskCells = sh.getRange(s, 5, 1, 2), stopCell = sh.getRange(s, c.STOPPNL);
    rules.push(CF().whenNumberGreaterThan(0).setFontColor(THEME.profit).setRanges([pnlCell, stopCell]).build());
    rules.push(CF().whenNumberLessThan(0).setFontColor(THEME.loss).setRanges([pnlCell, stopCell]).build());
    rules.push(CF().whenFormulaSatisfied(fx_('=$F$' + s + '>INDIRECT("SET_RISK_TOTAL")'))
      .setFontColor(THEME.loss).setBold(true).setRanges([riskCells]).build());
  }

  if (name === SH.ORDERS) {
    rules.push(CF().whenFormulaSatisfied(fx_('=' + A('RISK') + '>INDIRECT("SET_DEPOSIT")*INDIRECT("SET_RISK_TRADE")'))
      .setFontColor(THEME.loss).setBold(true).setRanges([col('RISK')]).build());
  }

  if (name === SH.CLOSED) { signColor('PNL'); signColor('PNLR'); }

  sh.setConditionalFormatRules(rules);
}

/** Сворачивает служебные колонки (hide: true) в группу с переключателем слева от неё. */
function groupHidden_(sh, layout) {
  const idx = layout.cols.findIndex(col => col.hide);
  if (idx < 0) return;
  const start = idx + 1, n = layout.cols.length - idx;
  if (sh.getColumnGroupDepth(start) === 0) sh.getRange(1, start, 1, n).shiftColumnGroupDepth(1);
  sh.setColumnGroupControlPosition(SpreadsheetApp.GroupControlTogglePosition.BEFORE);
  try { sh.getColumnGroup(start, 1).collapse(); } catch (e) { /* группы нет — не страшно */ }
}

/** Сводка над «Открытыми»: PnL · риск ₽ и % · ГО % · время котировок. */
function buildOpenSummary_(sh) {
  const s = OPEN.SUMMARY, f = OPEN.FIRST;
  const col = k => L_(OPEN, k) + f + ':' + L_(OPEN, k);
  sh.getRange(s, 1, 1, sh.getMaxColumns()).breakApart().clearContent()
    .setBackground(THEME.bg).setFontSize(11).setFontFamily(THEME.mono).setHorizontalAlignment('left');
  sh.setRowHeight(s, 30);

  const label = (c, t) => sh.getRange(s, c).setValue(t).setFontFamily(THEME.font).setFontSize(9)
    .setFontColor(THEME.muted).setHorizontalAlignment('right');
  label(1, 'PnL');  sh.getRange(s, 2, 1, 2).merge().setFormula(fx_('=SUM(' + col('PNL') + ')')).setNumberFormat('+#,##0" ₽";-#,##0" ₽";0" ₽"');
  label(4, 'Риск'); sh.getRange(s, 5).setFormula(fx_('=SUM(' + col('RISK') + ')')).setNumberFormat('#,##0" ₽"');
                    sh.getRange(s, 6).setFormula(fx_('=IFERROR(E' + s + '/SET_DEPOSIT,0)')).setNumberFormat('0.0%');
  label(7, 'ГО');   sh.getRange(s, 8).setFormula(fx_('=IFERROR(SUM(' + col('MARGIN') + ')/SET_DEPOSIT,0)')).setNumberFormat('0.0%');
  sh.getRange(s, C_(OPEN).STOPPNL).setFormula(fx_('=IF(COUNT(' + col('STOPPNL') + '),SUM(' + col('STOPPNL') + '),"")'))
    .setNumberFormat('"стоп "+#,##0;"стоп "-#,##0;"стоп 0"').setFontSize(10).setHorizontalAlignment('right')
    .setNote('Итог, если сработают все стопы открытых позиций (с комиссией). Позиции без стопа не учтены.');
  sh.getRange(s, 9).setNumberFormat('hh:mm').setFontSize(9)
    .setFontColor(THEME.muted).setHorizontalAlignment('right')
    .setNote('Время последнего обновления котировок.\nБесплатные данные MOEX ISS идут с задержкой ~15 минут.');
  sh.getRange(s, REFRESH_COL).insertCheckboxes().setFontColor(THEME.accent).setHorizontalAlignment('center')
    .setNote('⟳ Обновить всё: справочник MOEX (раз в день) и котировки.\nПоставьте галочку — она снимется сама.');
}

// ---------------------------------------------------------------- настройки, справочник, статистика

function buildSettings_(ss) {
  const sh = ensureSheet_(ss, SH.SETTINGS);
  sh.setFrozenRows(0);
  fitGrid_(sh, Math.max(SETTINGS.length, STRATEGY_ROWS) + 1, 9);
  paint_(sh);
  sh.getRange(1, 1, 1, 9).setValues([['Параметр', 'Значение', '', 'Стратегии входа', '', 'Стратегии выхода', '', 'Метка', 'Что значит']])
    .setBackground(THEME.head).setFontColor(THEME.muted).setFontSize(9);
  [3, 5, 7].forEach(c => sh.getRange(1, c).setBackground(THEME.bg));
  [280, 120, 16, 170, 16, 170, 16, 90, 170].forEach((w, i) => sh.setColumnWidth(i + 1, w));
  sh.getRange(2, 2, SETTINGS.length, 1).setFontFamily(THEME.mono).setHorizontalAlignment('right');
  sh.getRange(1, 2).setHorizontalAlignment('right');

  SETTINGS.forEach((p, i) => {
    const row = i + 2;
    sh.getRange(row, 1).setValue(p.label).setFontColor(p.ro ? THEME.muted : THEME.text);
    const cell = sh.getRange(row, 2);
    if (p.fmt) cell.setNumberFormat(p.fmt);
    if (p.check) cell.setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());
    if (p.list) cell.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(p.list.map(String), true).build());
    if (cell.getValue() === '' && p.def !== '') {
      cell.setValue(p.def === '=KEY' ? Utilities.getUuid().replace(/-/g, '').slice(0, 16) : p.def);
    }
    if (p.ro) cell.setFontColor(THEME.muted);
    ss.setNamedRange(p.name, cell);
  });

  const strat = sh.getRange(2, 4, STRATEGY_ROWS, 1);
  if (strat.getValues().every(r => r[0] === '')) {
    sh.getRange(2, 4, STRATEGY_DEFAULTS.length, 1).setValues(STRATEGY_DEFAULTS.map(s => [s]));
  }
  ss.setNamedRange('STRATEGIES', strat);

  const exits = sh.getRange(2, 6, STRATEGY_ROWS, 1);
  if (exits.getValues().every(r => r[0] === '')) {
    sh.getRange(2, 6, EXIT_STRATEGY_DEFAULTS.length, 1).setValues(EXIT_STRATEGY_DEFAULTS.map(s => [s]));
  }
  ss.setNamedRange('EXIT_STRATEGIES', exits);

  sh.getRange(2, 8, TAGS.length, 1).setValues(TAGS.map(t => [t[1]])).setFontColor(THEME.muted);
  const tagNames = sh.getRange(2, 9, TAGS.length, 1);
  if (tagNames.getValues().every(r => r[0] === '')) tagNames.setValues(TAGS.map(t => [t[2]]));
  ss.setNamedRange('TAG_NAMES', tagNames);
  sh.setFrozenRows(1);
}

function buildRef_(ss) {
  const sh = ensureSheet_(ss, SH.REF);
  sh.setFrozenRows(0);
  fitGrid_(sh, Math.max(sh.getMaxRows(), 2), REF_COLS.length);
  paint_(sh);
  sh.getRange(1, 1, 1, REF_COLS.length).setValues([REF_COLS])
    .setBackground(THEME.head).setFontColor(THEME.muted).setFontSize(9);
  sh.getRange(2, 1, sh.getMaxRows() - 1, REF_COLS.length).setFontFamily(THEME.mono);
  sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setNumberFormat('@');
  sh.setFrozenRows(1);
}

/** Порядок вкладок, удаление пустого «Лист1», скрытие справочника. */
function arrangeSheets_(ss) {
  ss.getSheets().forEach(s => {
    if (!SHEET_ORDER.includes(s.getName()) && s.getLastRow() === 0 && s.getLastColumn() === 0) ss.deleteSheet(s);
  });
  SHEET_ORDER.forEach((n, i) => { ss.setActiveSheet(ss.getSheetByName(n)); ss.moveActiveSheet(i + 1); });
  ss.getSheetByName(SH.REF).hideSheet();
  ss.setActiveSheet(ss.getSheetByName(SH.OPEN));
}

/** Формат цены по количеству знаков инструмента (DECIMALS) — для всех таблиц. */
function refreshPriceFormats_() {
  const ss = SpreadsheetApp.getActive();
  [[SH.OPEN, OPEN], [SH.ORDERS, ORDERS], [SH.CLOSED, CLOSED]].forEach(([name, layout]) => {
    const sh = ss.getSheetByName(name);
    const last = lastDataRow_(sh, layout.FIRST, C_(layout).TICKER);
    if (last >= layout.FIRST) applyPriceFormat_(sh, layout, layout.FIRST, last - layout.FIRST + 1);
  });
}

/** Применяет формат цены к строкам [first, first+n) — вызывается и при добавлении сделки. */
function applyPriceFormat_(sh, layout, first, n) {
  if (!C_(layout).TICKER) return;
  const ref = loadRef_();
  const fmts = sh.getRange(first, C_(layout).TICKER, n, 1).getValues()
    .map(r => [priceFormat_(ref[String(r[0]).trim()])]);
  layout.cols.forEach((col, i) => {
    if (col.t === 'price') sh.getRange(first, i + 1, n, 1).setNumberFormats(fmts);
  });
}

function priceFormat_(spec) {
  if (!spec || spec.decimals === '' || spec.decimals == null) return 'General';
  const d = Number(spec.decimals);
  return d > 0 ? '#,##0.' + '0'.repeat(d) : '#,##0';
}

// ---------------------------------------------------------------- общие помощники

/**
 * Формула в синтаксисе локали Таблицы. Скрипт пишет формулы «по-английски» (запятые),
 * а в русской локали Google разбирает их как в интерфейсе: аргументы через «;», дробь через «,»,
 * столбцы в массиве {…} через «\\».
 * Один раз за запуск проверяем, как Таблица понимает =SUM(1,2), и при необходимости переводим.
 */
function fx_(f) {
  if (fx_.semi === undefined) {
    const cell = SpreadsheetApp.getActive().getSheetByName(SH.SETTINGS).getRange(1, 3);
    cell.setFormula('=SUM(1,2)');
    SpreadsheetApp.flush();
    fx_.semi = cell.getValue() !== 3;
    cell.clearContent();
  }
  if (!fx_.semi) return f;
  let out = '', q = null;
  const stack = [];
  for (let i = 0; i < f.length; i++) {
    const ch = f[i];
    if (q) { if (ch === q) q = null; out += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; out += ch; continue; }
    if (ch === '(' || ch === '{') stack.push(ch);
    if (ch === ')' || ch === '}') stack.pop();
    if (ch === ',') { out += stack[stack.length - 1] === '{' ? '\\' : ';'; continue; }
    if (ch === '.' && /\d/.test(f[i - 1] || '') && /\d/.test(f[i + 1] || '')) { out += ','; continue; }
    out += ch;
  }
  return out;
}

function ensureSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/** Тёмный фон, без сетки и рамок, единый шрифт — на весь лист. */
function paint_(sh) {
  const rows = sh.getMaxRows(), cols = sh.getMaxColumns();
  sh.getRange(1, 1, rows, cols)
    .setBackground(THEME.bg).setFontColor(THEME.text)
    .setFontFamily(THEME.font).setFontSize(THEME.size).setFontWeight('normal')
    .setVerticalAlignment('middle').setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP)
    .setBorder(false, false, false, false, false, false);
  sh.setHiddenGridlines(true);
  sh.setRowHeightsForced(1, rows, THEME.rowH);
}

/** Подгоняет сетку листа ровно под rows × cols (лишнее удаляет, недостающее добавляет). */
function fitGrid_(sh, rows, cols) {
  const mr = sh.getMaxRows(), mc = sh.getMaxColumns();
  if (mc > cols) sh.deleteColumns(cols + 1, mc - cols);
  else if (mc < cols) sh.insertColumnsAfter(mc, cols - mc);
  if (mr > rows) sh.deleteRows(rows + 1, mr - rows);
  else if (mr < rows) sh.insertRowsAfter(mr, rows - mr);
}

/** Последняя строка, где в колонке col есть значение (галочки и формулы-массивы не в счёт). */
function lastDataRow_(sh, first, col) {
  const n = sh.getMaxRows() - first + 1;
  if (n < 1) return first - 1;
  const v = sh.getRange(first, col, n, 1).getValues();
  for (let i = n - 1; i >= 0; i--) if (v[i][0] !== '' && v[i][0] !== null) return first + i;
  return first - 1;
}

function toast_(msg) {
  SpreadsheetApp.getActive().toast(msg, 'Журнал', 4);
}
/**
 * Moex.gs — всё, что ходит в MOEX ISS: справочник инструментов и котировки.
 * Данные ISS без подписки идут с задержкой ~15 минут.
 */

const ISS = 'https://iss.moex.com/iss';
const ISS_FUT = ISS + '/engines/futures/markets/forts/securities.json';
const ISS_STK = ISS + '/engines/stock/markets/shares/boards/TQBR/securities.json';

// ---------------------------------------------------------------- справочник

/** Меню: Журнал → Обновить справочник MOEX. */
function refreshReference() { refreshReference_(false); }

/**
 * Перезаливает лист «Справочник»: фьючерсы FORTS (без истёкших) + акции TQBR.
 * Если ответ MOEX подозрительно мал — старый справочник не трогаем.
 * Инструменты, по которым ещё есть открытые позиции или заявки, сохраняются,
 * даже если пропали из выдачи MOEX (иначе формулы этих строк сломаются).
 */
function refreshReference_(silent) {
  const ss = SpreadsheetApp.getActive();
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) { if (!silent) toast_('Справочник уже обновляется'); return; }
  try {
    const [fut, stk] = issFetchAll_([
      issUrl_(ISS_FUT, {
        'iss.meta': 'off', 'iss.only': 'securities',
        'securities.columns': 'SECID,SHORTNAME,MINSTEP,STEPPRICE,INITIALMARGIN,LASTTRADEDATE,DECIMALS,PREVSETTLEPRICE,ASSETCODE',
      }),
      issUrl_(ISS_STK, {
        'iss.meta': 'off', 'iss.only': 'securities',
        'securities.columns': 'SECID,SHORTNAME,LOTSIZE,MINSTEP,DECIMALS,PREVPRICE,ISIN',
      }),
    ]);
    const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

    // Фьючерсы: по базовому активу, внутри — по дате экспирации (ближний контракт первым).
    const futRows = issRows_(fut.securities)
      .filter(r => r.LASTTRADEDATE >= today && r.MINSTEP > 0 && r.STEPPRICE > 0)
      .sort((a, b) => String(a.ASSETCODE).localeCompare(String(b.ASSETCODE)) || a.LASTTRADEDATE.localeCompare(b.LASTTRADEDATE))
      .map(r => refRow_(r.SECID, r.SHORTNAME, 'F', r.MINSTEP, r.STEPPRICE, 1, r.INITIALMARGIN, r.LASTTRADEDATE, r.DECIMALS, r.PREVSETTLEPRICE, ''));

    const stkRows = issRows_(stk.securities)
      .filter(r => r.LOTSIZE > 0 && r.MINSTEP > 0)
      .sort((a, b) => a.SECID.localeCompare(b.SECID))
      .map(r => refRow_(r.SECID, r.SHORTNAME, 'S', r.MINSTEP, r.MINSTEP * r.LOTSIZE, r.LOTSIZE, '', '', r.DECIMALS, r.PREVPRICE, r.ISIN));

    if (futRows.length < 50 || stkRows.length < 50) {
      throw new Error('MOEX вернул слишком мало инструментов (фьючерсы ' + futRows.length +
        ', акции ' + stkRows.length + '). Справочник оставлен как был.');
    }

    const sh = ss.getSheetByName(SH.REF);
    const fresh = new Set(futRows.concat(stkRows).map(r => r[0]));
    const used = usedTickers_();
    const old = lastDataRow_(sh, 2, 1) >= 2
      ? sh.getRange(2, 1, lastDataRow_(sh, 2, 1) - 1, REF_COLS.length).getValues() : [];
    const keep = old.filter(r => used.has(r[0]) && !fresh.has(r[0]));

    const rows = stkRows.concat(futRows, keep);
    fitGrid_(sh, rows.length + 1, REF_COLS.length);
    sh.getRange(2, 1, rows.length, 1).setNumberFormat('@');
    sh.getRange(2, RC.LASTTRADEDATE, rows.length, 1).setNumberFormat('@');
    sh.getRange(2, 1, rows.length, REF_COLS.length).setValues(rows);

    ss.getRangeByName('SET_REF_UPDATED').setValue(new Date());
    loadRef_.cache = null;
    if (!silent) toast_('Справочник: фьючерсов ' + futRows.length + ', акций ' + stkRows.length);
  } catch (e) {
    if (silent) throw e;
    SpreadsheetApp.getUi().alert('Справочник MOEX', String(e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);
  } finally {
    lock.releaseLock();
  }
}

/** Строка справочника в порядке REF_COLS; PTVALUE считается в одном месте — makeSpec_. */
function refRow_(secid, name, type, minstep, stepprice, lot, im, lastTrade, decimals, prev, isin) {
  const pv = makeSpec_({ type, minstep, stepprice, lot }).pv;
  return [secid, name, type, minstep, stepprice, lot, im === null ? '' : im, lastTrade || '',
    decimals === null ? '' : decimals, pv, prev === null ? '' : prev, isin || ''];
}

/** Тикеры, которые сейчас используются в «Открытых» и «Заявках». */
function usedTickers_() {
  const ss = SpreadsheetApp.getActive();
  const set = new Set();
  [[SH.OPEN, OPEN], [SH.ORDERS, ORDERS]].forEach(([name, layout]) => {
    const sh = ss.getSheetByName(name);
    if (!sh) return;
    const last = lastDataRow_(sh, layout.FIRST, C_(layout).TICKER);
    if (last < layout.FIRST) return;
    sh.getRange(layout.FIRST, C_(layout).TICKER, last - layout.FIRST + 1, 1).getValues()
      .forEach(r => r[0] && set.add(String(r[0]).trim()));
  });
  return set;
}

// ---------------------------------------------------------------- котировки

/**
 * Меню: Журнал → Обновить всё. Одна кнопка на все данные MOEX:
 * справочник (только если сегодня ещё не обновлялся) + котировки открытых позиций.
 * Никаких фоновых триггеров — запросы к MOEX уходят только по вашему нажатию.
 */
function refreshAll() {
  const upd = SpreadsheetApp.getActive().getRangeByName('SET_REF_UPDATED').getValue();
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  if (!(upd instanceof Date) || Utilities.formatDate(upd, TZ, 'yyyy-MM-dd') !== today) refreshReference_(true);
  const n = updateQuotes_();
  if (n < 0) toast_('Журнал занят другой операцией, нажмите ещё раз через пару секунд');
  else toast_('Обновлено. Котировок: ' + n + (n ? '' : ' (нет открытых позиций)'));
}

/**
 * Пишет текущие цены в колонку «Текущая». Запрашивает у MOEX только тикеры открытых позиций
 * (максимум два запроса: FORTS и TQBR), около секунды.
 * Возвращает число обновлённых строк, −1 если лист занят другой операцией.
 */
function updateQuotes_() {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) return -1;
  try {
    const sh = SpreadsheetApp.getActive().getSheetByName(SH.OPEN);
    const c = C_(OPEN);
    const last = lastDataRow_(sh, OPEN.FIRST, c.TICKER);
    if (last < OPEN.FIRST) { stampQuotes_(sh); return 0; }

    const n = last - OPEN.FIRST + 1;
    const tickers = sh.getRange(OPEN.FIRST, c.TICKER, n, 1).getValues().map(r => String(r[0]).trim());
    const ref = loadRef_();
    const uniq = type => [...new Set(tickers.filter(t => ref[t] && ref[t].type === type))];
    const prices = fetchPrices_(uniq('F'), uniq('S'));

    const range = sh.getRange(OPEN.FIRST, c.PRICE, n, 1);
    let updated = 0;
    const out = range.getValues().map((row, i) => {
      const p = prices[tickers[i]];
      if (p) { updated++; return [p]; }
      return row; // нет цены — оставляем прежнюю
    });
    range.setValues(out);
    stampQuotes_(sh);
    return updated;
  } finally {
    lock.releaseLock();
  }
}

/** Последняя цена; если сделок сегодня не было — расчётная/цена закрытия прошлого дня. */
function fetchPrices_(fut, stk) {
  const urls = [];
  if (fut.length) urls.push(issUrl_(ISS_FUT, {
    'iss.meta': 'off', 'iss.only': 'securities,marketdata', securities: fut.join(','),
    'securities.columns': 'SECID,PREVSETTLEPRICE', 'marketdata.columns': 'SECID,LAST',
  }));
  if (stk.length) urls.push(issUrl_(ISS_STK, {
    'iss.meta': 'off', 'iss.only': 'securities,marketdata', securities: stk.join(','),
    'securities.columns': 'SECID,PREVPRICE', 'marketdata.columns': 'SECID,LAST,LCURRENTPRICE',
  }));
  const out = {};
  if (!urls.length) return out;
  issFetchAll_(urls).forEach(j => {
    const prev = {};
    issRows_(j.securities).forEach(r => { prev[r.SECID] = r.PREVSETTLEPRICE || r.PREVPRICE; });
    issRows_(j.marketdata).forEach(r => {
      const p = r.LAST || r.LCURRENTPRICE || prev[r.SECID];
      if (p) out[r.SECID] = p;
    });
  });
  return out;
}

function stampQuotes_(sh) {
  sh.getRange(OPEN.SUMMARY, C_(OPEN).PNLR).setValue(new Date());
}


// ---------------------------------------------------------------- ISS helpers

function issUrl_(base, params) {
  return base + '?' + Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&');
}

/** Параллельные запросы к ISS; ошибка HTTP — исключение с понятным текстом. */
function issFetchAll_(urls) {
  const res = UrlFetchApp.fetchAll(urls.map(url => ({ url, muteHttpExceptions: true })));
  return res.map((r, i) => {
    if (r.getResponseCode() !== 200) throw new Error('MOEX ISS: HTTP ' + r.getResponseCode() + ' — ' + urls[i]);
    return JSON.parse(r.getContentText());
  });
}

/** Блок ISS {columns, data} → массив объектов {SECID: ..., ...}. */
function issRows_(block) {
  if (!block || !block.data) return [];
  const cols = block.columns;
  return block.data.map(row => cols.reduce((o, c, i) => (o[c] = row[i], o), {}));
}
/**
 * Calc.gs — торговая математика (та же, что в формулах листов) и проверка формул.
 * Скрипт пользуется этими функциями, когда «замораживает» PnL при закрытии сделки (этап 2).
 *
 *   ₽ за пункт (pv):  фьючерс = STEPPRICE / MINSTEP;  акция = LOTSIZE
 *   движение ₽     = Δцены × pv × объём
 *   PnL ₽          = направление × движение − комиссия входа − комиссия выхода
 *   Риск ₽         = |вход − SL| × pv × объём
 *   PnL R          = PnL / плановый риск
 *   ГО             фьючерс = INITIALMARGIN × контракты;  акция = цена × LOTSIZE × лоты
 *   Комиссия (одна сторона): фьючерс = контракты × (брокер ₽ + биржевой сбор % × цена × pv);
 *                            акция = цена × LOTSIZE × лоты × %
 */

/** Добавляет к спецификации pv — стоимость 1 пункта цены на 1 единицу объёма. */
function makeSpec_(s) {
  s.pv = s.type === 'F' ? s.stepprice / s.minstep : s.lot;
  return s;
}

function dir_(side) { return side === 'S' ? -1 : 1; }

function moveRub_(spec, delta, qty) { return delta * spec.pv * qty; }

function feeSide_(spec, price, qty, set) {
  return spec.type === 'F'
    ? qty * (set.commFut + price * spec.pv * (set.exchFut || 0))
    : price * spec.lot * qty * set.commStk;
}

function feeTotal_(spec, entry, exit, qty, set) {
  return feeSide_(spec, entry, qty, set) + feeSide_(spec, exit, qty, set);
}

function pnlRub_(spec, side, entry, exit, qty, set) {
  return dir_(side) * moveRub_(spec, exit - entry, qty) - feeTotal_(spec, entry, exit, qty, set);
}

function riskRub_(spec, entry, sl, qty) { return Math.abs(moveRub_(spec, entry - sl, qty)); }

function marginRub_(spec, price, qty) { return spec.type === 'F' ? spec.im * qty : price * spec.lot * qty; }

function rr_(entry, sl, tp) { return Math.abs(tp - entry) / Math.abs(entry - sl); }

// ---------------------------------------------------------------- данные

/** Справочник в памяти: { SECID: spec }. Кэш живёт одно выполнение скрипта. */
function loadRef_() {
  if (loadRef_.cache) return loadRef_.cache;
  const sh = SpreadsheetApp.getActive().getSheetByName(SH.REF);
  const map = {};
  const last = lastDataRow_(sh, 2, 1);
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, REF_COLS.length).getValues().forEach(r => {
      map[r[0]] = {
        secid: r[0], name: r[RC.SHORTNAME - 1], type: r[RC.TYPE - 1],
        minstep: r[RC.MINSTEP - 1], stepprice: r[RC.STEPPRICE - 1], lot: r[RC.LOTSIZE - 1],
        im: r[RC.INITIALMARGIN - 1], lastTrade: r[RC.LASTTRADEDATE - 1],
        decimals: r[RC.DECIMALS - 1], pv: r[RC.PTVALUE - 1], prev: r[RC.PREVPRICE - 1], isin: r[RC.ISIN - 1],
      };
    });
  }
  return (loadRef_.cache = map);
}

/** Код из справочника без учёта регистра: «SIZ6», «siz6» → «SiZ6». Не найден — ''. */
function refSecid_(ticker) {
  const t = String(ticker || '').trim(), ref = loadRef_();
  if (ref[t]) return t;
  const up = t.toUpperCase();
  return Object.keys(ref).find(k => String(k).toUpperCase() === up) || '';
}

function getSpec_(secid) {
  const s = loadRef_()[secid];
  if (!s) throw new Error('Тикера ' + secid + ' нет в справочнике. Обновите справочник MOEX.');
  return s;
}

/** Настройки из именованных диапазонов листа «Настройки». */
function getSettings_() {
  if (getSettings_.cache) return getSettings_.cache;
  const ss = SpreadsheetApp.getActive();
  const g = n => { const r = ss.getRangeByName(n); return r ? r.getValue() : ''; };
  return (getSettings_.cache = {
    deposit: Number(g('SET_DEPOSIT')) || 0,
    commFut: Number(g('SET_COMM_FUT')) || 0,
    exchFut: Number(g('SET_EXCH_FUT')) || 0,
    repoShort: Number(g('SET_REPO_SHORT')) || 0,
    repoLong: Number(g('SET_REPO_LONG')) || 0,
    futLev: Number(g('SET_FUT_LEV')) || 0,
    commStk: Number(g('SET_COMM_STK')) || 0,
    riskTrade: Number(g('SET_RISK_TRADE')) || 0,
    riskTotal: Number(g('SET_RISK_TOTAL')) || 0,
    apiKey: String(g('SET_API_KEY')),
  });
}

// ---------------------------------------------------------------- проверка формул

/** Три эталонных примера. Ожидаемые числа посчитаны вручную (см. инструкцию). */
const TEST_CASES = [
  { t: 'RIZ6', side: 'L', qty: 2,  entry: 92000,  sl: 91500,  tp: 93500,  exit: 93000,
    spec: { type: 'F', minstep: 10, stepprice: 16.57008, lot: 1, im: 24664.13 },
    exp: { risk: 1657.01, fee: 8, pnl: 3306.02, r: 2.00, rr: 3.00, margin: 49328.26 } },
  { t: 'SiZ6', side: 'S', qty: 3,  entry: 84000,  sl: 84300,  tp: 83400,  exit: 83700,
    spec: { type: 'F', minstep: 1, stepprice: 1, lot: 1, im: 13350.73 },
    exp: { risk: 900, fee: 12, pnl: 888, r: 0.99, rr: 2.00, margin: 40052.19 } },
  { t: 'GAZP', side: 'L', qty: 50, entry: 110.80, sl: 108.50, tp: 116.00, exit: 114.20,
    spec: { type: 'S', minstep: 0.01, stepprice: 0.1, lot: 10 },
    exp: { risk: 1150, fee: 56.25, pnl: 1643.75, r: 1.43, rr: 2.26, margin: 55400 } },
];

/**
 * Меню: Журнал → Проверить формулы.
 * 1) JS-расчёт против ручного (фиксированные спецификации, комиссия 2 ₽ и 0,05 %).
 * 2) Формулы листа «Открытые» против JS-расчёта на живом справочнике и ваших настройках:
 *    лист копируется во временный, туда пишутся три сделки (текущая цена = цена выхода),
 *    результат сравнивается, временный лист удаляется. Ваши данные не затрагиваются.
 */
function runFormulaTests() {
  const r2 = x => Math.round(x * 100) / 100;
  const ok = (a, b) => Math.abs(a - b) < 0.011;
  const lines = [];
  let fails = 0;

  // ---- 1. Движок против ручного расчёта
  lines.push('1) Расчёт скрипта vs ручной (комиссия 2 ₽ / 0,05 %)');
  const fixedSet = { commFut: 2, exchFut: 0, commStk: 0.0005 };
  TEST_CASES.forEach(tc => {
    const s = makeSpec_(Object.assign({}, tc.spec));
    const risk = riskRub_(s, tc.entry, tc.sl, tc.qty);
    const got = {
      risk, fee: feeTotal_(s, tc.entry, tc.exit, tc.qty, fixedSet),
      pnl: pnlRub_(s, tc.side, tc.entry, tc.exit, tc.qty, fixedSet),
      rr: rr_(tc.entry, tc.sl, tc.tp), margin: marginRub_(s, tc.entry, tc.qty),
    };
    got.r = got.pnl / risk;
    const bad = Object.keys(tc.exp).filter(k => !ok(r2(got[k]), tc.exp[k]));
    fails += bad.length;
    lines.push((bad.length ? '✗ ' : '✓ ') + tc.t + ': риск ' + r2(got.risk) + ', комиссия ' + r2(got.fee) +
      ', PnL ' + r2(got.pnl) + ', ' + r2(got.r) + 'R, R:R ' + r2(got.rr) + ', ГО ' + r2(got.margin) +
      (bad.length ? '  ← не сошлось: ' + bad.join(', ') : ''));
  });

  // ---- 2. Формулы листа против движка (живые данные)
  lines.push('', '2) Формулы листа «Открытые» vs скрипт (живой справочник, ваши комиссии)');
  const ref = loadRef_();
  const live = TEST_CASES.filter(tc => ref[tc.t]);
  if (live.length < TEST_CASES.length) {
    lines.push('нет в справочнике: ' + TEST_CASES.filter(tc => !ref[tc.t]).map(tc => tc.t).join(', ') +
      ' (контракт истёк — поменяйте тикеры в TEST_CASES)');
  }
  if (live.length) {
    const set = getSettings_();
    const sheetRes = sheetFormulaProbe_(live);
    live.forEach((tc, i) => {
      const s = ref[tc.t];
      const exp = {
        pnl: pnlRub_(s, tc.side, tc.entry, tc.exit, tc.qty, set),
        risk: riskRub_(s, tc.entry, tc.sl, tc.qty),
        margin: marginRub_(s, tc.exit, tc.qty),
      };
      exp.r = exp.pnl / exp.risk;
      const got = sheetRes[i];
      const bad = Object.keys(exp).filter(k => !ok(r2(got[k]), r2(exp[k])));
      fails += bad.length;
      lines.push((bad.length ? '✗ ' : '✓ ') + tc.t + ' (pv ' + s.pv + '): PnL ' + r2(got.pnl) + ', ' + r2(got.r) +
        'R, до стопа ' + r2(got.risk) + ', ГО ' + r2(got.margin) + (bad.length ? '  ← скрипт: ' +
        bad.map(k => k + ' ' + r2(exp[k])).join(', ') : ''));
    });
  }

  lines.unshift(fails ? 'Есть расхождения: ' + fails : 'Все проверки пройдены', '');
  SpreadsheetApp.getUi().alert('Проверка формул', lines.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

/** Копирует «Открытые», пишет тестовые сделки, читает результаты формул, удаляет копию. */
function sheetFormulaProbe_(cases) {
  const ss = SpreadsheetApp.getActive();
  const tmp = ss.getSheetByName(SH.OPEN).copyTo(ss).setName('_проверка_' + Date.now());
  try {
    const c = C_(OPEN), f = OPEN.FIRST, n = cases.length;
    if (tmp.getMaxRows() < f + n - 1) tmp.insertRowsAfter(tmp.getMaxRows(), f + n - 1 - tmp.getMaxRows());
    const rows = tmp.getMaxRows() - f + 1;
    OPEN.cols.forEach((col, i) => { if (!col.f) tmp.getRange(f, i + 1, rows, 1).clearContent(); });

    tmp.getRange(f, c.TICKER, n, 7).setValues(cases.map(tc => [tc.t, tc.side, tc.qty, tc.entry, tc.exit, tc.sl, tc.tp]));
    tmp.getRange(f, c.SL0, n, 1).setValues(cases.map(tc => [tc.sl]));
    SpreadsheetApp.flush();

    const get = k => tmp.getRange(f, c[k], n, 1).getValues().map(r => Number(r[0]));
    const pnl = get('PNL'), r = get('PNLR'), risk = get('RISK'), margin = get('MARGIN');
    return cases.map((_, i) => ({ pnl: pnl[i], r: r[i], risk: risk[i], margin: margin[i] }));
  } finally {
    ss.deleteSheet(tmp);
  }
}
/**
 * Trades.gs — движение сделок: заявка → открытая → закрытая.
 *
 * Правила надёжности:
 *  - строка ищется по ID, а не по номеру (номера сдвигаются);
 *  - любая операция идёт под блокировкой документа (LockService);
 *  - перенос: сначала запись в лист-приёмник, проверка, потом удаление из источника;
 *    при ошибке запись в приёмнике откатывается — сделка не теряется и не задваивается;
 *  - повторная отправка того же диалога отсекается одноразовым токеном.
 */

// ---------------------------------------------------------------- правки и галочки

/** Устанавливаемый триггер onEdit (ставит installTriggers_). Простой onEdit не умеет открывать диалоги. */
function handleEdit(e) {
  if (!e || !e.range) return;
  const r = e.range, sh = r.getSheet(), name = sh.getName();
  const layout = name === SH.OPEN ? OPEN : name === SH.ORDERS ? ORDERS : null;
  if (!layout) return;

  const row = r.getRow(), col = r.getColumn();
  const single = r.getNumRows() === 1 && r.getNumColumns() === 1;
  const checked = single && e.value === 'TRUE';
  const c = C_(layout);

  if (name === SH.OPEN && row === OPEN.SUMMARY && col === REFRESH_COL) {
    if (checked) { r.setValue(false); refreshAll(); }
    return;
  }
  if (row < layout.FIRST) return;

  if (checked && name === SH.OPEN && col === c.CLOSE) { r.setValue(false); openCloseDialog_(row); return; }
  if (checked && name === SH.ORDERS && col === c.FILL) { r.setValue(false); openFillDialog_(row); return; }
  if (checked && name === SH.ORDERS && col === c.CANCEL) { r.setValue(false); confirmCancel_(row); return; }

  // Ручной ввод/вставка: выдать ID и время, запомнить исходный SL, формат цены, запасная строка.
  normalizeRows_(sh, layout, row, r.getNumRows());
}

/** Доводит строки до порядка: ID, время, SL план, формат цены; держит одну пустую строку внизу. */
function normalizeRows_(sh, layout, first, n) {
  const c = C_(layout);
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) return;
  try {
    const width = layout.cols.length;
    const vals = sh.getRange(first, 1, n, width).getValues();
    let id = null;
    vals.forEach((v, i) => {
      if (v[c.TICKER - 1] === '') return;
      const rowN = first + i;
      if (v[c.ID - 1] === '') {
        id = id === null ? nextId_() : id + 1;
        sh.getRange(rowN, c.ID).setValue(id);
      }
      const tCol = layout === OPEN ? c.OPENED : c.CREATED;
      if (v[tCol - 1] === '') sh.getRange(rowN, tCol).setValue(new Date());
      if (layout === OPEN && v[c.SL0 - 1] === '' && v[c.SL - 1] !== '') sh.getRange(rowN, c.SL0).setValue(v[c.SL - 1]);
    });
    applyPriceFormat_(sh, layout, first, n);
    ensureBlankRows_(sh, layout, 1);
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------- операции (вызываются из диалогов)

/** Заявка исполнена → «Открытые». d: {id, price, qty, time, note, token} */
function fillOrder(d) {
  return locked_(d.token, () => {
    const ord = findById_(SH.ORDERS, ORDERS, d.id);
    const already = findById_(SH.OPEN, OPEN, d.id);
    if (!ord) {
      if (already) return 'Сделка #' + d.id + ' уже в «Открытых»';
      throw new Error('Заявка #' + d.id + ' не найдена');
    }
    const o = ord.obj;
    if (!already) {
      appendRows_(SH.OPEN, OPEN, [{
        TICKER: o.TICKER, SIDE: o.SIDE, QTY: num_(d.qty), ENTRY: num_(d.price), SL: o.SL, TP: o.TP,
        ID: o.ID, OPENED: parseTime_(d.time), STRATEGY: d.strategy || o.STRATEGY, NOTE: joinNote_(o.NOTE, d.note), SL0: o.SL, TAG: o.TAG || '',
      }]);
      SpreadsheetApp.flush();
      if (!findById_(SH.OPEN, OPEN, d.id)) throw new Error('Не удалось записать в «Открытые», заявка оставлена');
    }
    deleteById_(SH.ORDERS, ORDERS, d.id);
    return 'Заявка #' + d.id + ' → «Открытые»';
  });
}

/** Отмена заявки (после подтверждения). */
function cancelOrder(id) {
  return locked_(null, () => {
    if (!deleteById_(SH.ORDERS, ORDERS, id)) return 'Заявка уже удалена';
    return 'Заявка #' + id + ' отменена';
  });
}

/**
 * Закрытие позиции целиком или частично. d: {id, price, qty, time, note, token}
 * Закрытая часть уходит в «Закрытые» с зафиксированными PnL, комиссией и ₽/пункт;
 * остаток остаётся в «Открытых» с тем же ID.
 */
function closePosition(d) {
  return locked_(d.token, () => {
    const pos = findById_(SH.OPEN, OPEN, d.id);
    if (!pos) throw new Error('Позиция #' + d.id + ' не найдена в «Открытых»');
    const p = pos.obj;
    const total = Number(p.QTY), q = Math.min(num_(d.qty), total);
    if (!(q > 0)) throw new Error('Объём должен быть больше нуля');

    const row = closedRow_(p, q, num_(d.price), parseTime_(d.time), joinNote_(p.NOTE, d.note));
    row.EXIT_STRAT = String(d.exitStrategy || '').trim();
    const at = appendRows_(SH.CLOSED, CLOSED, [row]);
    try {
      const sh = sheet_(SH.OPEN);
      if (q >= total) deleteDataRow_(sh, OPEN, pos.row);
      else sh.getRange(pos.row, C_(OPEN).QTY).setValue(total - q);
    } catch (e) {
      deleteDataRow_(sheet_(SH.CLOSED), CLOSED, at);   // откат: в «Закрытых» не остаётся лишней строки
      throw e;
    }
    const left = total - q;
    return '#' + d.id + ' ' + p.TICKER + ': закрыто ' + q + (left ? ', осталось ' + left : '') +
      ', PnL ' + fmtRub_(row.PNL);
  });
}

/** Строка для «Закрытых» по позиции. pnl/fee можно передать готовыми (из отчёта брокера). */
function closedRow_(p, q, exit, time, note, pnlOverride, feeOverride) {
  const spec = loadRef_()[p.TICKER];
  const set = getSettings_();
  let fee = feeOverride, pnl = pnlOverride;
  if (spec) {
    if (fee === '' || fee == null) fee = feeTotal_(spec, p.ENTRY, exit, q, set);
    if (pnl === '' || pnl == null) pnl = dir_(p.SIDE) * moveRub_(spec, exit - p.ENTRY, q) - fee;
  } else if (pnl === '' || pnl == null) {
    throw new Error('Тикера ' + p.TICKER + ' нет в справочнике MOEX (истёк?) — укажите PnL ₽ вручную');
  }
  return {
    ID: p.ID, OPENED: p.OPENED, CLOSED: time, TICKER: p.TICKER, SIDE: p.SIDE, QTY: q,
    ENTRY: p.ENTRY, EXIT: exit, SL: p.SL0 !== '' && p.SL0 != null ? p.SL0 : p.SL, TP: p.TP,
    FEE: round2_(fee || 0), PNL: round2_(pnl), STRATEGY: p.STRATEGY, NOTE: note, SHOT: p.SHOT, TAG: p.TAG || '',
    PV: spec ? spec.pv : '',
  };
}

/** Ручное добавление из боковой панели. d — поля формы. */
function addTrade(d) {
  return locked_(d.token, () => {
    const raw = String(d.ticker || '').trim();
    if (!raw) throw new Error('Укажите тикер');
    const t = refSecid_(raw) || raw.toUpperCase();
    if (d.side !== 'L' && d.side !== 'S') throw new Error('Укажите L или S');
    const p = {
      ID: nextId_(), TICKER: t, SIDE: d.side, QTY: num_(d.qty), ENTRY: num_(d.entry),
      SL: optNum_(d.sl), TP: optNum_(d.tp), SL0: optNum_(d.sl), OPENED: parseTime_(d.opened),
      STRATEGY: d.strategy || '', NOTE: d.note || '', SHOT: d.shot || '', TAG: d.tag || '',
    };
    if (!(p.QTY > 0) || !(p.ENTRY > 0)) throw new Error('Объём и цена входа должны быть больше нуля');

    if (d.toClosed) {
      const row = closedRow_(p, p.QTY, num_(d.exit), parseTime_(d.closed), p.NOTE, optNum_(d.pnl), optNum_(d.fee));
      appendRows_(SH.CLOSED, CLOSED, [row]);
      return '#' + p.ID + ' ' + t + ' → «Закрытые», PnL ' + fmtRub_(row.PNL);
    }
    if (!loadRef_()[t]) throw new Error('Тикера ' + t + ' нет в справочнике MOEX — открытую позицию по нему не посчитать');
    appendRows_(SH.OPEN, OPEN, [p]);
    return '#' + p.ID + ' ' + t + ' → «Открытые»';
  });
}

// ---------------------------------------------------------------- работа со строками

/** Добавляет строки в конец данных (на место пустых). Пишет только колонки без формул. Возвращает первую строку. */
function appendRows_(name, layout, objs) {
  const sh = sheet_(name);
  const n = objs.length;
  const first = ensureBlankRows_(sh, layout, n + 1); // n под данные + одна запасная

  // Сплошные отрезки колонок без формул — формулы-массивы в шапке трогать нельзя.
  const segs = [];
  layout.cols.forEach((col, i) => {
    if (col.f) return;
    const last = segs[segs.length - 1];
    if (last && last.end === i - 1) last.end = i; else segs.push({ start: i, end: i });
  });
  segs.forEach(sg => {
    const data = objs.map(o => layout.cols.slice(sg.start, sg.end + 1).map(col => {
      const v = o[col.k];
      if (col.t === 'check') return false;
      return v === undefined || v === null ? '' : v;
    }));
    sh.getRange(first, sg.start + 1, n, sg.end - sg.start + 1).setValues(data);
  });
  applyPriceFormat_(sh, layout, first, n);
  if (name === SH.CLOSED) ensureStatsRows_();
  return first;
}

/**
 * Гарантирует need пустых строк после данных; возвращает первую пустую.
 * Новые строки вставляются ПЕРЕД последней пустой строкой: так они попадают внутрь
 * диапазонов подсветки и списков, а ссылки формул в шапке (A3:A) не сдвигаются.
 * Если так нельзя (пустых строк нет или осталась одна первая) — вставка в конец и
 * переустановка подсветки на весь лист.
 */
function ensureBlankRows_(sh, layout, need) {
  const ncols = layout.cols.length;
  const last = lastDataRow_(sh, layout.FIRST, keyCol_(layout));
  const first = Math.max(last + 1, layout.FIRST);
  const maxR = sh.getMaxRows();
  const have = maxR - first + 1;
  if (have >= need) return first;

  const add = need - have;
  const inside = have >= 1 && maxR > layout.FIRST;
  if (inside) sh.insertRowsBefore(maxR, add); else sh.insertRowsAfter(maxR, add);

  const end = sh.getMaxRows();
  const tplRow = inside ? end : maxR;              // строка-образец оформления
  const tpl = sh.getRange(tplRow, 1, 1, ncols);
  const dest = sh.getRange(first, 1, end - first + 1, ncols);
  tpl.copyTo(dest, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  tpl.copyTo(dest, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
  if (!inside) applyConditional_(sh, layout, sh.getName());
  return first;
}

/** Удаляет строку данных, оставляя в листе минимум две строки под данные (иначе ломается вставка). */
function deleteDataRow_(sh, layout, row) {
  const maxR = sh.getMaxRows();
  if (maxR - layout.FIRST + 1 <= 2) {
    sh.insertRowsAfter(maxR, 1);
    const tpl = sh.getRange(maxR, 1, 1, layout.cols.length), dest = sh.getRange(maxR + 1, 1, 1, layout.cols.length);
    tpl.copyTo(dest, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    tpl.copyTo(dest, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    sh.deleteRow(row);
    applyConditional_(sh, layout, sh.getName());
    return;
  }
  sh.deleteRow(row);
}

/** Ищет строку по ID. Возвращает {row, obj} или null. */
function findById_(name, layout, id) {
  const sh = sheet_(name);
  const c = C_(layout);
  const last = lastDataRow_(sh, layout.FIRST, c.TICKER);
  if (last < layout.FIRST) return null;
  const vals = sh.getRange(layout.FIRST, 1, last - layout.FIRST + 1, layout.cols.length).getValues();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][c.ID - 1]) === String(id)) {
      const obj = {};
      layout.cols.forEach((col, j) => obj[col.k] = vals[i][j]);
      return { row: layout.FIRST + i, obj };
    }
  }
  return null;
}

function deleteById_(name, layout, id) {
  const f = findById_(name, layout, id);
  if (!f) return false;
  deleteDataRow_(sheet_(name), layout, f.row);
  return true;
}

/** Следующий ID: максимум по всем трём листам + 1. */
function nextId_() {
  let max = 0;
  [[SH.OPEN, OPEN], [SH.ORDERS, ORDERS], [SH.CLOSED, CLOSED]].forEach(([name, layout]) => {
    const sh = sheet_(name);
    const n = sh.getMaxRows() - layout.FIRST + 1;
    if (n < 1) return;
    sh.getRange(layout.FIRST, C_(layout).ID, n, 1).getValues()
      .forEach(r => { const v = Number(r[0]); if (v > max) max = v; });
  });
  return max + 1;
}

/**
 * Выполняет fn под блокировкой; token защищает от повторной отправки одной формы.
 * Возвращает {ok, msg} — так диалог всегда получает понятный ответ.
 */
function locked_(token, fn) {
  const cache = CacheService.getDocumentCache();
  if (token && cache.get('tok:' + token)) return { ok: true, msg: 'Уже выполнено' };
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(20000)) return { ok: false, msg: 'Журнал занят другой операцией, попробуйте ещё раз' };
  try {
    loadRef_.cache = null; getSettings_.cache = null;
    const msg = fn();
    SpreadsheetApp.flush();
    if (token) cache.put('tok:' + token, String(msg || '1'), 21600);   // результат — для проверки из калькулятора
    return { ok: true, msg };
  } catch (e) {
    return { ok: false, msg: String(e.message || e) };
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------- мелочи

function sheet_(name) { return SpreadsheetApp.getActive().getSheetByName(name); }

function num_(v) {
  const n = Number(String(v).replace(/\s/g, '').replace(',', '.'));
  if (!isFinite(n)) throw new Error('Не число: ' + v);
  return n;
}

function optNum_(v) { return v === '' || v === null || v === undefined ? '' : num_(v); }

function round2_(x) { return Math.round(x * 100) / 100; }

function joinNote_(a, b) { return [a, b].filter(Boolean).join(' · '); }

function fmtRub_(x) { return (x > 0 ? '+' : '') + Math.round(x).toLocaleString('ru-RU') + ' ₽'; }

/** 'yyyy-MM-ddTHH:mm' (из формы, московское время) → Date. Пусто → сейчас. */
function parseTime_(s) {
  if (s instanceof Date) return s;
  if (!s) return new Date();
  return Utilities.parseDate(String(s).replace('T', ' ').slice(0, 16), TZ, 'yyyy-MM-dd HH:mm');
}

/** Date → значение для поля datetime-local. */
function timeInput_(d) {
  return Utilities.formatDate(d instanceof Date ? d : new Date(), TZ, "yyyy-MM-dd'T'HH:mm");
}
/**
 * Ui.gs — диалоги и боковая панель. HTML собирается здесь же, чтобы проект оставался одним файлом.
 * Оформление берётся из THEME (Config.gs).
 */

const UI_CSS = `
*{box-sizing:border-box}
body{margin:0;padding:12px 14px;font:13px '${THEME.font}',Roboto,system-ui,sans-serif;color:${THEME.text};background:${THEME.bg}}
h3{margin:0 0 6px;font-size:14px;font-weight:500}
.sub{color:${THEME.muted};font-size:12px;margin-bottom:6px}
label{display:block;font-size:11px;color:${THEME.muted};margin:8px 0 3px}
input,select,textarea{width:100%;padding:6px 8px;border:1px solid ${THEME.line};border-radius:${THEME.radius}px;background:${THEME.head};
  color:${THEME.text};font:13px '${THEME.mono}','Roboto Mono',ui-monospace,monospace}
input:focus,select:focus,textarea:focus{outline:none;border-color:${THEME.accent}}
.row{display:flex;gap:8px}.row>div{flex:1;min-width:0}
.seg{display:flex;border:1px solid ${THEME.line};border-radius:${THEME.radius}px;overflow:hidden}
.seg input{display:none}.seg label{flex:1;margin:0;padding:6px 0;text-align:center;cursor:pointer;font-size:13px;color:${THEME.text}}
.seg input:checked+label.l{background:${THEME.profit};color:${THEME.onAccent}}.seg input:checked+label.s{background:${THEME.loss};color:${THEME.onAccent}}
.btns{display:flex;gap:8px;margin-top:14px}
button{border:0;border-radius:${THEME.radius}px;padding:8px 14px;font:500 13px '${THEME.font}',Roboto,system-ui;cursor:pointer;background:${THEME.accent};color:${THEME.onAccent}}
button.sec{background:${THEME.head};color:${THEME.text}}
button:disabled{opacity:.5;cursor:default}
.pv{margin-top:10px;padding:8px;background:${THEME.head};border-radius:${THEME.radius}px;font:12px '${THEME.mono}','Roboto Mono',monospace}
.pos{color:${THEME.profit}}.neg{color:${THEME.loss}}
.msg{margin-top:10px;font-size:12px;white-space:pre-wrap}.ok{color:${THEME.profit}}.err{color:${THEME.loss}}
.chk{display:flex;align-items:center;gap:6px;margin-top:12px;font-size:13px;color:${THEME.text}}
.chk input{width:auto}
.hidden{display:none}
`;

/** Общий каркас страницы: стили + данные D + общие функции. */
function page_(body, script, data) {
  const json = JSON.stringify(data || {}).replace(/</g, '\\u003c');
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><base target="_top"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet"><style>' + UI_CSS + '</style></head><body>' + body +
    '<script>const D=' + json + ';const TOKEN=Math.random().toString(36).slice(2)+Date.now();' +
    'const $=id=>document.getElementById(id);' +
    'const n=v=>Number(String(v).replace(/\\s/g,"").replace(",","."));' +
    'const rub=x=>(x>0?"+":"")+Math.round(x).toLocaleString("ru-RU")+" ₽";' +
    'function say(t,ok){const m=$("msg");m.textContent=t;m.className="msg "+(ok?"ok":"err")}' +
    'function busy(b){document.querySelectorAll("button").forEach(x=>x.disabled=b)}' +
    'function call(fn,arg,done){busy(true);say("…",true);google.script.run' +
    '.withSuccessHandler(r=>{busy(false);say(r.msg,r.ok);if(r.ok&&done)done(r)})' +
    '.withFailureHandler(e=>{busy(false);say(String(e.message||e),false)})[fn](arg)}' +
    script + '</script></body></html>');
}

/** Расчёт PnL в браузере для предпросмотра (та же формула, что в Calc.gs). */
const UI_PNL_JS = `
function pnlCalc(s,side,entry,exit,q){
  if(!s||!(q>0)||!(entry>0)||!(exit>0))return null;
  const fee=s.type==="F"?q*(D.set.commFut*2+(entry+exit)*s.pv*D.set.exchFut):(entry+exit)*s.lot*q*D.set.commStk;
  return (side==="S"?-1:1)*(exit-entry)*s.pv*q-fee;
}`;

// ---------------------------------------------------------------- закрытие позиции

function openCloseDialog_(row) {
  const sh = sheet_(SH.OPEN);
  normalizeRows_(sh, OPEN, row, 1);
  const p = rowObj_(sh, OPEN, row);
  if (!p.TICKER) return;
  const spec = loadRef_()[p.TICKER] || null;
  const set = getSettings_();
  const data = {
    id: p.ID, ticker: p.TICKER, side: p.SIDE, qty: p.QTY, entry: p.ENTRY,
    price: p.PRICE || p.ENTRY, now: timeInput_(), spec, set: { commFut: set.commFut, exchFut: set.exchFut, commStk: set.commStk },
  };
  const body = `
<h3>Закрыть #${p.ID} ${p.TICKER} ${p.SIDE}</h3>
<div class="sub">Вход ${p.ENTRY}, объём ${p.QTY}</div>
<div class="row">
  <div><label>Цена выхода</label><input id="price" inputmode="decimal"></div>
  <div><label>Объём (из ${p.QTY})</label><input id="qty" inputmode="decimal"></div>
</div>
<label>Время выхода (МСК)</label><input id="time" type="datetime-local">
<label>Заметка</label><input id="note" placeholder="необязательно">
<div class="pv" id="pv"></div>
<div class="btns"><button id="go">Закрыть позицию</button><button class="sec" onclick="google.script.host.close()">Отмена</button></div>
<div id="msg" class="msg"></div>`;
  const script = UI_PNL_JS + `
$("price").value=D.price;$("qty").value=D.qty;$("time").value=D.now;
function upd(){const q=n($("qty").value),x=n($("price").value);const v=pnlCalc(D.spec,D.side,D.entry,x,q);
  $("pv").innerHTML=v===null?"PnL: —":"PnL ≈ <span class='"+(v>=0?"pos":"neg")+"'>"+rub(v)+"</span>"+(q<D.qty?" · останется "+(D.qty-q):"")}
["price","qty"].forEach(i=>$(i).addEventListener("input",upd));upd();
$("go").onclick=()=>call("closePosition",{id:D.id,price:$("price").value,qty:$("qty").value,time:$("time").value,
  note:$("note").value,token:TOKEN},()=>setTimeout(()=>google.script.host.close(),900));
$("price").select();`;
  SpreadsheetApp.getUi().showModalDialog(page_(body, script, data).setWidth(340).setHeight(330), 'Закрытие позиции');
}

// ---------------------------------------------------------------- исполнение заявки

function openFillDialog_(row) {
  const sh = sheet_(SH.ORDERS);
  normalizeRows_(sh, ORDERS, row, 1);
  const o = rowObj_(sh, ORDERS, row);
  if (!o.TICKER) return;
  const data = { id: o.ID, qty: o.QTY, price: o.ENTRY, now: timeInput_() };
  const body = `
<h3>Исполнена #${o.ID} ${o.TICKER} ${o.SIDE}</h3>
<div class="sub">План: вход ${o.ENTRY}, SL ${o.SL}, TP ${o.TP}</div>
<div class="row">
  <div><label>Фактическая цена входа</label><input id="price" inputmode="decimal"></div>
  <div><label>Объём</label><input id="qty" inputmode="decimal"></div>
</div>
<label>Время входа (МСК)</label><input id="time" type="datetime-local">
<label>Заметка</label><input id="note" placeholder="необязательно">
<div class="btns"><button id="go">В «Открытые»</button><button class="sec" onclick="google.script.host.close()">Отмена</button></div>
<div id="msg" class="msg"></div>`;
  const script = `
$("price").value=D.price;$("qty").value=D.qty;$("time").value=D.now;$("price").select();
$("go").onclick=()=>call("fillOrder",{id:D.id,price:$("price").value,qty:$("qty").value,time:$("time").value,
  note:$("note").value,token:TOKEN},()=>setTimeout(()=>google.script.host.close(),900));`;
  SpreadsheetApp.getUi().showModalDialog(page_(body, script, data).setWidth(340).setHeight(290), 'Заявка исполнена');
}

// ---------------------------------------------------------------- отмена заявки

function confirmCancel_(row) {
  const sh = sheet_(SH.ORDERS);
  normalizeRows_(sh, ORDERS, row, 1);
  const o = rowObj_(sh, ORDERS, row);
  if (!o.TICKER) return;
  const ui = SpreadsheetApp.getUi();
  const ans = ui.alert('Отменить заявку?', '#' + o.ID + ' ' + o.TICKER + ' ' + o.SIDE + ' ' + o.QTY + ' по ' + o.ENTRY +
    '\nСтрока будет удалена.', ui.ButtonSet.YES_NO);
  if (ans !== ui.Button.YES) return;
  toast_(cancelOrder(o.ID).msg);
}

// ---------------------------------------------------------------- боковая панель «Добавить сделку»

function showAddSidebar() {
  const ref = loadRef_();
  const set = getSettings_();
  const strategies = SpreadsheetApp.getActive().getRangeByName('STRATEGIES').getValues()
    .map(r => r[0]).filter(String);
  const data = {
    now: timeInput_(), strategies, set: { commFut: set.commFut, exchFut: set.exchFut, commStk: set.commStk },
    specs: Object.keys(ref).reduce((o, k) => (o[k] = { type: ref[k].type, pv: ref[k].pv, lot: ref[k].lot, name: ref[k].name }, o), {}),
  };
  const body = `
<h3>Добавить сделку</h3>
<label>Тикер (код или название)</label><input id="ticker" list="tl" autocomplete="off" placeholder="RIZ6, Si, Газпром…">
<datalist id="tl"></datalist><div class="sub" id="tinfo"></div>
<label>Направление</label>
<div class="seg"><input type="radio" name="side" id="sL" value="L" checked><label class="l" for="sL">Long</label>
<input type="radio" name="side" id="sS" value="S"><label class="s" for="sS">Short</label></div>
<div class="row"><div><label>Объём</label><input id="qty" inputmode="decimal"></div>
<div><label>Цена входа</label><input id="entry" inputmode="decimal"></div></div>
<div class="row"><div><label>SL</label><input id="sl" inputmode="decimal"></div>
<div><label>TP</label><input id="tp" inputmode="decimal"></div></div>
<label>Вход, время (МСК)</label><input id="opened" type="datetime-local">
<label>Стратегия</label><select id="strategy"><option value=""></option></select>
<label>Заметка</label><input id="note">
<label>Ссылка на скрин</label><input id="shot" placeholder="https://…">
<div class="chk"><input type="checkbox" id="toClosed"><label for="toClosed" style="margin:0;font-size:13px;color:inherit">Сразу в «Закрытые»</label></div>
<div id="closedBox" class="hidden">
  <div class="row"><div><label>Цена выхода</label><input id="exit" inputmode="decimal"></div>
  <div><label>Выход, время</label><input id="closed" type="datetime-local"></div></div>
  <div class="row"><div><label>PnL ₽ (из отчёта)</label><input id="pnl" placeholder="авто"></div>
  <div><label>Комиссия ₽</label><input id="fee" placeholder="авто"></div></div>
  <div class="pv" id="pv"></div>
</div>
<div class="btns"><button id="go">Добавить</button><button class="sec" onclick="google.script.host.close()">Закрыть</button></div>
<div id="msg" class="msg"></div>`;
  const script = UI_PNL_JS + `
$("opened").value=D.now;$("closed").value=D.now;
const tl=$("tl");Object.keys(D.specs).forEach(k=>{const o=document.createElement("option");o.value=k;o.label=D.specs[k].name;tl.appendChild(o)});
D.strategies.forEach(s=>{const o=document.createElement("option");o.textContent=s;$("strategy").appendChild(o)});
const side=()=>document.querySelector("input[name=side]:checked").value;
function spec(){const v=$("ticker").value.trim(),u=v.toUpperCase();return D.specs[v]||D.specs[Object.keys(D.specs).find(k=>k.toUpperCase()===u)]}
function upd(){const s=spec();$("tinfo").textContent=s?(s.name+" · "+(s.type==="F"?"фьючерс, ₽/пункт "+(+s.pv.toFixed(5)):"акция, лот "+s.lot)):"";
  if(!$("toClosed").checked)return;const v=pnlCalc(s,side(),n($("entry").value),n($("exit").value),n($("qty").value));
  $("pv").innerHTML=$("pnl").value?"PnL из отчёта: "+rub(n($("pnl").value)):v===null?(s?"PnL: —":"Тикера нет в справочнике — укажите PnL ₽"):"PnL ≈ <span class='"+(v>=0?"pos":"neg")+"'>"+rub(v)+"</span>"}
document.querySelectorAll("input").forEach(i=>i.addEventListener("input",upd));
$("toClosed").onchange=()=>{$("closedBox").classList.toggle("hidden",!$("toClosed").checked);upd()};
$("go").onclick=()=>{const f={token:TOKEN+Math.random(),side:side(),toClosed:$("toClosed").checked};
  ["ticker","qty","entry","sl","tp","opened","strategy","note","shot","exit","closed","pnl","fee"].forEach(k=>f[k]=$(k).value);
  call("addTrade",f,()=>{["qty","entry","sl","tp","note","shot","exit","pnl","fee"].forEach(k=>$(k).value="");upd()})};`;
  SpreadsheetApp.getUi().showSidebar(page_(body, script, data).setTitle('Добавить сделку'));
}

// ---------------------------------------------------------------- импорт отчёта брокера

function showImportDialog() {
  const body = `
<h3>Импорт брокерского отчёта (.xls)</h3>
<div class="sub">Брокерский отчёт «Финама» (.xls) за период. Учитываются позиции на начало периода и точный биржевой сбор.
Сделки собираются в позиции: закрытые → «Закрытые», незакрытые → «Открытые».
Уже загруженное пропускается — можно грузить отчёты внахлёст.</div>
<label>Файл отчёта</label><input type="file" id="file" accept=".xls,.html,.htm">
<label>…или вставьте содержимое файла</label><textarea id="text" rows="5"></textarea>
<div class="btns"><button id="check" class="sec">Проверить</button><button id="go" disabled>Импортировать</button></div>
<div id="msg" class="msg"></div>`;
  const script = `
$("file").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$("text").value=r.result;$("go").disabled=true;$("check").click()};r.readAsText(f,"utf-8")};
$("text").oninput=()=>$("go").disabled=true;
// Сжатие: нужны только таблицы и текст ячеек — стили и атрибуты убираем (отчёт за квартал весит 5+ МБ).
const slim=t=>t.replace(/<(style|script|head)[\\s\\S]*?<\\/\\1>/gi,"").replace(/<(t[dhr]|table|br)\\b[^>]*>/gi,"<$1>").replace(/<(?!\\/?(t[dhr]|table|br)\\b)[^>]+>/gi,"").replace(/[ \\t]+/g," ");
$("check").onclick=()=>call("previewImport",slim($("text").value),r=>{$("go").disabled=!r.count});
// Токен — на каждый файл: повторное нажатие не задвоит импорт, а второй отчёт в том же окне пройдёт.
const tokenFor=t=>{let h=0;for(let i=0;i<t.length;i+=97)h=(h*31+t.charCodeAt(i))|0;return TOKEN+":"+t.length+":"+h};
$("go").onclick=()=>{const t=slim($("text").value);call("runImport",{text:t,token:tokenFor(t)},()=>{$("go").disabled=true})};`;
  SpreadsheetApp.getUi().showModalDialog(page_(body, script).setWidth(520).setHeight(470), 'Импорт');
}

// ---------------------------------------------------------------- помощники

function rowObj_(sh, layout, row) {
  const v = sh.getRange(row, 1, 1, layout.cols.length).getValues()[0];
  const o = {};
  layout.cols.forEach((col, i) => o[col.k] = v[i]);
  return o;
}
/**
 * Import.gs — импорт сделок из брокерского отчёта «Финама» (.xls — внутри это HTML-таблицы).
 *
 * Берётся из отчёта:
 *  - позиции на начало периода (фьючерсы — таблица позиций по ПФИ; акции — плановые позиции,
 *    в них видны и шорты, перенесённые через РЕПО);
 *  - сделки с фьючерсами и акциями (РЕПО-перенос не берётся);
 *  - точный биржевой сбор по каждой фьючерсной сделке (+ брокерская ₽/контракт из «Настроек»);
 *  - стоимость пункта на день сделки = сумма сделки в ₽ / (цена × объём) — точно и для
 *    долларовых контрактов, и для истёкших (их код ищется в MOEX: MIX-9.26 → MXU6).
 *
 * Как собираются сделки (по каждому тикеру, по времени):
 *  - позиция на начало периода: если такая же уже есть в «Открытых» — продолжается она (тот же ID);
 *    иначе заводится сделка «открыта до периода» с ценой входа = цена закрытия (расчётная цена)
 *    MOEX за последний торговый день до периода — это та же база, от которой брокер считает
 *    вариационную маржу, поэтому PnL в журнале = результат за период;
 *  - исполнения с одинаковыми временем и направлением склеиваются (средняя цена, сумма комиссий);
 *  - добор → средняя цена; сокращение → строка в «Закрытые» с тем же ID; переворот → закрытие + новая;
 *  - что не закрыто к концу отчёта → «Открытые».
 * Доходы/расходы вне сделок (плечо, перенос через РЕПО, пени, дивиденды) → лист «Расходы».
 * Повторный импорт не дублирует: совпадение тикер+вход+выход+объём (закрытые), тикер+вход (открытые),
 * дата+вид+сумма (расходы).
 */

function previewImport(text) {
  try {
    loadRef_.cache = null; getSettings_.cache = null;
    const plan = buildImportPlan_(text);
    const L = [
      'Период отчёта: ' + plan.period + (plan.periodEnd ? ' — ' + plan.periodEnd : ''),
      'Сделок в отчёте: фьючерсы ' + plan.nFut + ', акции ' + plan.nStk,
      'Новых строк в «Закрытые»: ' + plan.closed.length + (plan.dupClosed ? ' (уже есть: ' + plan.dupClosed + ')' : ''),
      'Новых позиций в «Открытые»: ' + plan.open.length + (plan.dupOpen ? ' (уже есть: ' + plan.dupOpen + ')' : ''),
    ];
    if (plan.expenses.length || plan.dupExp) L.push('Доходы/расходы вне сделок: ' + plan.expenses.length + ' записей на ' +
      fmtRub_(plan.expenses.reduce((s, r) => s + r.AMOUNT, 0)) + (plan.dupExp ? ' (уже есть: ' + plan.dupExp + ')' : ''));
    if (plan.updates.length) L.push('Изменится в «Открытых»: ' + plan.updates.map(u => '#' + u.id + (u.qty ? ' → ' + u.qty : ' закрыта')).join(', '));
    if (plan.closed.length) L.push('PnL новых закрытых: ' + fmtRub_(plan.closed.reduce((s, r) => s + r.PNL, 0)) +
      ', комиссия ' + Math.round(plan.closed.reduce((s, r) => s + r.FEE, 0)).toLocaleString('ru-RU') + ' ₽');
    if (plan.starts.length) L.push('Позиции на начало периода: ' + plan.starts.join(', '));
    if (plan.small.length) L.push('Мелкие остатки акций (< 10 000 ₽) в «Открытые» не переносятся: ' + plan.small.join(', '));
    if (plan.unknown.length) L.push('Не найдены в справочнике MOEX (пропущены): ' + plan.unknown.join(', '));
    plan.open.forEach(p => L.push('  откроется: ' + p.TICKER + ' ' + p.SIDE + ' ' + p.QTY + ' по ' + round6_(p.ENTRY)));
    return { ok: true, msg: L.join('\n'), count: plan.closed.length + plan.open.length + plan.updates.length + plan.expenses.length };
  } catch (e) {
    return { ok: false, msg: String(e.message || e) };
  }
}

function runImport(d) {
  return locked_(d.token, () => {
    const plan = buildImportPlan_(d.text);
    const wmBefore = importWatermark_();
    // Сначала дописываем, потом меняем «Открытые» (снизу вверх, чтобы номера строк не сдвигались).
    // Если что-то упадёт на дописывании — уже записанное удаляется, журнал остаётся как был.
    const added = [];
    try {
      [[SH.CLOSED, CLOSED, plan.closed], [SH.OPEN, OPEN, plan.open], [SH.EXP, EXP, plan.expenses]].forEach(([n, l, rows]) => {
        if (!rows.length) return;
        const at = appendRows_(n, l, rows);
        added.push([n, at, rows.length]);
      });
    } catch (e) {
      added.reverse().forEach(([n, at, cnt]) => sheet_(n).deleteRows(at, cnt));
      throw new Error('Импорт отменён, журнал не изменён: ' + (e.message || e));
    }
    const sh = sheet_(SH.OPEN);
    plan.updates
      .map(u => Object.assign(u, { row: (findById_(SH.OPEN, OPEN, u.id) || {}).row }))
      .filter(u => u.row).sort((a, b) => b.row - a.row)
      .forEach(u => { if (u.qty) sh.getRange(u.row, C_(OPEN).QTY).setValue(u.qty); else deleteDataRow_(sh, OPEN, u.row); });
    if (wmBefore || plan.closed.length || plan.open.length) setImportWatermark_(plan.maxTime);
    return 'Загружено: в «Закрытые» ' + plan.closed.length + ', в «Открытые» ' + plan.open.length +
      (plan.updates.length ? ', изменено открытых ' + plan.updates.length : '') +
      (plan.expenses.length ? ', в «Расходы» ' + plan.expenses.length : '') +
      (plan.dupClosed + plan.dupOpen ? '. Пропущено как уже загруженные: ' + (plan.dupClosed + plan.dupOpen) : '');
  });
}

// ---------------------------------------------------------------- разбор отчёта

/** Разбирает отчёт и строит изменения журнала (без записи). */
function buildImportPlan_(text) {
  const rows = htmlRows_(String(text || ''));
  if (rows.length < 10) throw new Error('Не похоже на брокерский отчёт (.xls). Выберите файл отчёта.');
  const ref = loadRef_();
  const byName = {}, byIsin = {};
  Object.keys(ref).forEach(k => { byName[ref[k].name] = k; if (ref[k].isin) byIsin[ref[k].isin] = k; });
  const set = getSettings_();
  const unknown = new Set();

  // Период: «Начало периода 01.10.2026» / «На конец периода 19.10.2026».
  let period = null, periodEnd = null;
  rows.some(r => r.some(c => { const m = c.match(/начало периода (\d\d)\.(\d\d)\.(\d{4})/i); if (m) period = m[3] + '-' + m[2] + '-' + m[1]; return !!m; }));
  rows.some(r => r.some(c => { const m = c.match(/конец периода (\d\d)\.(\d\d)\.(\d{4})/i); if (m) periodEnd = m[1] + '.' + m[2] + '.' + m[3]; return !!m; }));
  if (!period) throw new Error('В отчёте не найдена дата начала периода');
  const periodStart = Utilities.parseDate(period + ' 00:00:00', TZ, 'yyyy-MM-dd HH:mm:ss');

  const fills = [], start = {}, traded = new Set(), plannedSeen = {}, other = [];
  const endDate = periodEnd ? dateRu_(periodEnd) : new Date();
  let nFut = 0, nStk = 0, mode = null, hdr = null;

  rows.forEach(r => {
    // --- заголовки таблиц
    if (r[0] === 'Вид договора, явл. ПФИ' && r[1] === 'Код') { mode = 'futPos'; return; }
    if (/^Инструмент.*Вид договора, являющегося ПФИ/.test(r[0])) { mode = 'plan'; return; }
    if (/^Инструмент \(вид, тип/.test(r[0]) && r[2] === 'ISIN') { mode = 'hold'; return; }
    if (r[0] === 'Дата сделки' && r.indexOf('Вид договора, явл. ПФИ') >= 0) { mode = 'futTr'; hdr = idx_(r); return; }
    if (r[0] === 'Дата сделки' && r.indexOf('Вид сделки/ Операция') >= 0 && r.indexOf('ISIN') >= 0) { mode = 'stkTr'; hdr = idx_(r); return; }
    if (r[0] === 'Дата' && r[1] === 'Тип операции') { mode = 'ops'; return; }
    if (r[0] === 'Тип операции' && r[2] === 'Количество' && r.length === 4) { mode = 'repoCost'; return; }
    if (r[0] === 'Дата сделки' || /^Вид сделки переноса/.test(r[0]) || r[0] === 'Дата' || r[0] === 'Тип операции') { mode = null; return; }
    if (/^(Входящий|ИТОГО|ГО срочного)/.test(r[0])) return;

    if (mode === 'ops' && /^\d\d\.\d\d\.\d{4}$/.test(r[0]) && r[1]) {
      const amount = numRu_(r[4]) - numRu_(r[5]);
      if (amount) other.push({ DATE: dateRu_(r[0]), KIND: otherKind_(r[1], r[9] || ''), AMOUNT: round2_(amount), NOTE: r[9] || '' });
    }
    if (mode === 'repoCost' && r[0] && r[2]) {
      const amount = -numRu_(r[2]);
      if (amount) other.push({ DATE: endDate, KIND: 'Перенос позиций (РЕПО)', AMOUNT: round2_(amount), NOTE: r[0] + '. ' + (r[3] || '') });
    }
    if (mode === 'futPos' && r.length >= 11 && r[1]) {
      const q = numRu_(r[2]);
      if (!q) return;
      const t = byName[r[1]] || resolveFuture_(r[1], ref, byName);
      if (!t) { unknown.add(r[1] + ' (позиция на начало)'); return; }
      start[t] = { qty: q, always: true };            // фьючерсы на начало берутся всегда
    }
    if ((mode === 'plan' || mode === 'hold') && r.length >= 4 && /^[A-Z]{2}[A-Z0-9]{9}\d$/.test(r[2])) {
      const t = byIsin[r[2]];
      if (!t) return;                                  // бумаги не с TQBR (ETF, ДР и т.п.) — не трейдинг
      const q = numRu_(r[3]) / (ref[t].lot || 1);
      if (mode === 'plan') { plannedSeen[t] = true; start[t] = { qty: q }; }
      else if (!plannedSeen[t]) start[t] = { qty: q };
    }
    if (mode === 'futTr' && /^\d\d\.\d\d\.\d{4}$/.test(r[0]) && /^(Покупка|Продажа)$/.test(r[hdr['Вид сделки/ Операция']])) {
      const code = r[hdr['Код']];
      const posDate = r[hdr['Дата изменения позиции']] || r[0];
      if (dateRu_(posDate) < periodStart) return;     // вечерняя сессия накануне — относится к прошлому периоду
      const t = byName[code] || resolveFuture_(code, ref, byName);
      if (!t) { unknown.add(code); return; }
      const q = numRu_(r[hdr['Количество (шт.)']]);
      const price = numRu_(r[hdr['Цена исполнения/ Размер премии по опциону']]);
      const sum = numRu_(r[hdr['Сумма сделки']]);
      nFut++;
      fills.push({ t, time: dtRu_(r[0], r[1]), sign: r[hdr['Вид сделки/ Операция']] === 'Покупка' ? 1 : -1, q, price,
        pv: sum && price ? sum / (price * q) : ref[t].pv,
        fee: numRu_(r[hdr['Вознаграждение Брокера, биржевой сбор']]) + set.commFut * q });
      traded.add(t);
    }
    if (mode === 'stkTr' && /^\d\d\.\d\d\.\d{4}$/.test(r[0]) && /^(Покупка|Продажа)$/.test(r[hdr['Вид сделки/ Операция']])) {
      if (dateRu_(r[0]) < periodStart) return;        // сделка до периода (расчёты T+ в периоде) — уже в позиции на начало
      const t = byIsin[r[hdr['ISIN']]] || byName[r[hdr['Краткое наименование инструмента']]];
      if (!t) { unknown.add(r[hdr['Краткое наименование инструмента']]); return; }
      const spec = ref[t];
      const q = numRu_(r[hdr['Количество (шт.)']]) / (spec.lot || 1);
      const price = numRu_(r[hdr['Цена сделки']]);
      nStk++;
      fills.push({ t, time: dtRu_(r[0], r[1]), sign: r[hdr['Вид сделки/ Операция']] === 'Покупка' ? 1 : -1, q, price,
        pv: spec.pv, fee: feeSide_(spec, price, q, set) });
      traded.add(t);
    }
  });

  // Позиции на начало: фьючерсы — все ненулевые, акции — только те, что торговались в периоде.
  const starts = Object.keys(start).filter(t => start[t].qty && (start[t].always || traded.has(t)))
    .map(t => ({ t, qty: start[t].qty }));
  const plan = reconstruct_(fills, starts, periodStart, periodEnd, nFut, nStk, unknown);
  const haveExp = expenseKeys_();
  plan.expenses = other.filter(o => !haveExp.has(expenseKey_(o)));
  plan.dupExp = other.length - plan.expenses.length;
  return plan;
}

/**
 * Код фьючерса, которого нет в справочнике (истёк): ищем в MOEX по краткому названию (MIX-9.26 → MXU6)
 * и добавляем в справочник этого запуска. Стоимость пункта возьмётся из сумм сделок в отчёте.
 */
function resolveFuture_(code, ref, byName) {
  const miss = resolveFuture_.miss = resolveFuture_.miss || {};
  if (miss[code]) return null;
  const register = (secid, twin) => {
    ref[secid] = { secid, name: code, type: 'F', lot: 1, pv: twin ? twin.pv : null, minstep: twin ? twin.minstep : null,
      decimals: twin ? twin.decimals : null, im: 0, isin: '', expired: true };
    byName[code] = secid;
    return secid;
  };
  const shortOf = secid => {
    try {
      const j = issFetchAll_([ISS + '/securities/' + secid + '.json?iss.meta=off&iss.only=description&description.columns=name,value'])[0];
      const d = {}; (j.description.data || []).forEach(r => d[r[0]] = r[1]);
      return d.SHORTNAME;
    } catch (e) { return null; }
  };
  // 1) По шаблону: код актива действующего контракта + буква месяца + цифра года (MIX-3.26 → MXH6).
  const m = code.match(/^(.+)-(\d{1,2})\.(\d{2})$/);
  const twin = m && Object.keys(ref).map(k => ref[k]).find(s => s.type === 'F' && !s.expired && String(s.name).indexOf(m[1] + '-') === 0);
  if (twin) {
    const secid = twin.secid.slice(0, -2) + 'FGHJKMNQUVXZ'[Number(m[2]) - 1] + (Number(m[3]) % 10);
    if (shortOf(secid) === code) return register(secid, twin);
  }
  // 2) Поиском MOEX (выдача забита опционами — листаем несколько страниц).
  try {
    for (let start = 0; start < 500; start += 100) {
      const j = issFetchAll_([ISS + '/securities.json?iss.meta=off&q=' + encodeURIComponent(code) + '&start=' + start +
        '&securities.columns=secid,shortname,group'])[0];
      const rows = issRows_(j.securities);
      const hit = rows.find(r => r.shortname === code && r.group === 'futures_forts');
      if (hit) return register(hit.secid, twin);
      if (rows.length < 100) break;
    }
  } catch (e) { /* сеть — считаем неизвестным */ }
  miss[code] = true;
  return null;
}

/**
 * Отметка «загружено до»: время последнего импортированного исполнения.
 * Если новый отчёт начинается не позже отметки, позиции берутся из «Открытых», а уже загруженные
 * исполнения пропускаются — отчёты можно грузить встык и внахлёст. Пустой журнал отметку обнуляет.
 */
function importWatermark_() {
  const empty = [[SH.CLOSED, CLOSED], [SH.OPEN, OPEN]].every(([n, l]) => lastDataRow_(sheet_(n), l.FIRST, keyCol_(l)) < l.FIRST);
  if (empty) return 0;
  return Number(PropertiesService.getDocumentProperties().getProperty('importWatermark')) || 0;
}

function setImportWatermark_(ms) {
  if (!ms) return;
  const p = PropertiesService.getDocumentProperties();
  const cur = importWatermark_();
  if (ms > cur) p.setProperty('importWatermark', String(ms));
}

/** Понятное название операции вне сделок. */
function otherKind_(type, comment) {
  if (/недостаточност|поддержание открытых позиций/i.test(comment)) return 'Плечо (перенос позиций)';
  if (/^Пеня/i.test(type)) return 'Пени';
  if (/^Дивиденд/i.test(type)) return 'Дивиденды';
  if (/^Купон|НКД/i.test(type)) return 'Купоны';
  return type;
}

function expenseKey_(o) { return [+new Date(o.DATE), o.KIND, round2_(Number(o.AMOUNT))].join('|'); }

function expenseKeys_() {
  const out = new Set();
  const sh = sheet_(SH.EXP);
  if (!sh) return out;
  const last = lastDataRow_(sh, EXP.FIRST, keyCol_(EXP));
  if (last < EXP.FIRST) return out;
  sh.getRange(EXP.FIRST, 1, last - EXP.FIRST + 1, EXP.cols.length).getValues().forEach(v => {
    const o = {};
    EXP.cols.forEach((col, i) => o[col.k] = v[i]);
    out.add(expenseKey_(o));
  });
  return out;
}

/** Собирает сделки из исполнений с учётом позиций на начало периода и уже открытых в журнале. */
function reconstruct_(fills, starts, periodStart, periodEnd, nFut, nStk, unknown) {
  const openNow = currentOpen_();
  const maxTime = fills.reduce((mx, f) => Math.max(mx, f.time.getTime()), 0);
  // Продолжение: отчёт начинается не позже уже загруженного — состояние из «Открытых», старые исполнения пропускаем.
  const wm = importWatermark_();
  const cont = wm > 0 && periodStart.getTime() <= wm;
  if (cont) {
    const manual = manualCloses_();
    fills = fills.filter(f => f.time.getTime() > wm && !manual.has(f.t + '|' + Math.floor(f.time.getTime() / 6e4)));
    starts = Object.keys(openNow).map(t => ({ t, qty: (openNow[t].SIDE === 'S' ? -1 : 1) * Number(openNow[t].QTY) }));
  }
  const startPrices = startPrices_(starts.filter(s => !openNow[s.t]).map(s => s.t), periodStart);
  const prevDay = Utilities.formatDate(new Date(periodStart.getTime() - 864e5), TZ, 'dd.MM.yyyy');
  const startDay = Utilities.formatDate(periodStart, TZ, 'dd.MM.yyyy');

  // Склейка исполнений: тикер|время|знак.
  const g = {};
  fills.forEach(f => {
    const k = f.t + '|' + f.time.getTime() + '|' + f.sign;
    const x = g[k] || (g[k] = { t: f.t, time: f.time, sign: f.sign, q: 0, cost: 0, rub: 0, fee: 0 });
    x.q += f.q; x.cost += f.q * f.price; x.rub += f.q * f.price * (f.pv || 0); x.fee += f.fee;
  });
  const byT = {};
  Object.values(g).sort((a, b) => a.time - b.time).forEach(x => (byT[x.t] = byT[x.t] || []).push(x));
  starts.forEach(s => { byT[s.t] = byT[s.t] || []; });

  const trades = [], startNames = [];
  Object.keys(byT).forEach(t => {
    let cur = null;
    const s = starts.find(z => z.t === t);
    if (s) {
      const side = s.qty > 0 ? 'L' : 'S', q = Math.abs(s.qty);
      const ex = openNow[t];
      if (ex && ex.SIDE === side) {
        const spec = loadRef_()[t];
        cur = { t, side, qty: Number(ex.QTY), avg: Number(ex.ENTRY), opened: ex.OPENED, id: ex.ID, existing: true,
          origQty: Number(ex.QTY), exits: [], src: ex,
          feeIn: spec ? feeSide_(spec, Number(ex.ENTRY), Number(ex.QTY), getSettings_()) : 0 }; // комиссия входа — оценка
        if (!cont) startNames.push(t + ' ' + side + ' ' + q + ' (уже в журнале #' + ex.ID + ')');
      } else {
        const p = startPrices[t];
        if (!p) throw new Error('Нет цены ' + t + ' на ' + prevDay + ' в MOEX — не могу оценить позицию на начало периода');
        cur = { t, side, qty: q, avg: p, opened: periodStart, feeIn: 0, exits: [],
          note: 'открыта до ' + startDay + ', вход = цена закрытия ' + prevDay };
        startNames.push(t + ' ' + side + ' ' + q + ' по ' + p);
      }
      trades.push(cur);
    }
    byT[t].forEach(x => {
      let q = round6_(x.q);
      const price = x.cost / x.q, side = x.sign > 0 ? 'L' : 'S', feeUnit = x.fee / x.q;
      const pv = x.rub && x.cost ? x.rub / x.cost : (loadRef_()[t] || {}).pv;
      while (q > 0) {
        if (!cur) {
          cur = { t, side, qty: q, avg: price, opened: x.time, feeIn: feeUnit * q, exits: [] };
          trades.push(cur); q = 0;
        } else if (cur.side === side) {
          cur.avg = (cur.avg * cur.qty + price * q) / (cur.qty + q);
          cur.feeIn += feeUnit * q; cur.qty = round6_(cur.qty + q); q = 0;
        } else {
          const n = Math.min(q, cur.qty);
          const feeIn = cur.feeIn * n / cur.qty;
          cur.exits.push({ q: n, price, time: x.time, entry: cur.avg, fee: feeIn + feeUnit * n, pv });
          cur.feeIn -= feeIn; cur.qty = round6_(cur.qty - n); q = round6_(q - n);
          if (cur.qty === 0) cur = null;
        }
      }
    });
  });

  const have = existingKeys_();
  let id = nextId_();
  const closed = [], open = [], updates = [];
  let dupClosed = 0, dupOpen = 0;
  const small = [];
  trades.sort((a, b) => a.opened - b.opened).forEach(tr => {
    const tid = tr.id || id++;
    const base = tr.src || {};
    let added = 0;
    tr.exits.forEach(x => {
      const p = { ID: tid, TICKER: tr.t, SIDE: tr.side, ENTRY: round6_(x.entry), OPENED: tr.opened,
        SL: base.SL || '', SL0: base.SL0 || '', TP: base.TP || '', STRATEGY: base.STRATEGY || '', SHOT: base.SHOT || '' };
      const pnl = (tr.side === 'S' ? -1 : 1) * (x.price - x.entry) * x.pv * x.q - x.fee;   // pv — на день выхода
      const row = closedRow_(p, x.q, round6_(x.price), x.time, joinNote_(base.NOTE || tr.note, 'импорт: отчёт брокера'), pnl, x.fee);
      row.PV = round6_(x.pv);
      if (have.closed.has(closedKey_(row))) { dupClosed++; return; }
      closed.push(row); added++;
    });
    if (tr.existing) {
      if (added) updates.push({ id: tid, qty: tr.qty });
      return;
    }
    if (tr.qty > 0) {
      const spec = loadRef_()[tr.t] || {};
      if (spec.type === 'S' && tr.qty * (spec.lot || 1) * tr.avg < 10000) { small.push(tr.t + ' ' + tr.qty); return; } // остаток, не трейдинг
      const o = { ID: tid, TICKER: tr.t, SIDE: tr.side, QTY: tr.qty, ENTRY: round6_(tr.avg), OPENED: tr.opened,
        NOTE: joinNote_(tr.note, 'импорт: отчёт брокера') };
      if (have.open.has(openKey_(o))) dupOpen++; else open.push(o);
    }
  });
  closed.sort((a, b) => a.CLOSED - b.CLOSED);
  if (cont) startNames.unshift('продолжение журнала: позиции из «Открытых», сделки до ' +
    Utilities.formatDate(new Date(wm), TZ, 'dd.MM.yyyy HH:mm') + ' уже загружены');
  return { period: startDay, periodEnd, nFut, nStk, closed, open, updates, dupClosed, dupOpen, maxTime,
    starts: startNames, unknown: [...unknown], small };
}

/** Закрытия, внесённые вручную (тикер|минута выхода) — чтобы импорт не повторил их по исполнению брокера. */
function manualCloses_() {
  const out = new Set();
  const sh = sheet_(SH.CLOSED);
  const last = lastDataRow_(sh, CLOSED.FIRST, keyCol_(CLOSED));
  if (last < CLOSED.FIRST) return out;
  const c = C_(CLOSED);
  sh.getRange(CLOSED.FIRST, 1, last - CLOSED.FIRST + 1, CLOSED.cols.length).getValues().forEach(v => {
    if (!/импорт/.test(String(v[c.NOTE - 1])) && v[c.CLOSED - 1] instanceof Date)
      out.add(v[c.TICKER - 1] + '|' + Math.floor(v[c.CLOSED - 1].getTime() / 6e4));
  });
  return out;
}

/** Позиции «Открытых»: { тикер: строка } (если по тикеру несколько — берётся первая). */
function currentOpen_() {
  const sh = sheet_(SH.OPEN);
  const last = lastDataRow_(sh, OPEN.FIRST, C_(OPEN).TICKER);
  const out = {};
  if (last < OPEN.FIRST) return out;
  sh.getRange(OPEN.FIRST, 1, last - OPEN.FIRST + 1, OPEN.cols.length).getValues().forEach(v => {
    const o = {};
    OPEN.cols.forEach((col, i) => o[col.k] = v[i]);
    if (o.TICKER && !out[o.TICKER]) out[o.TICKER] = o;
  });
  return out;
}

/** Цена закрытия (акции) / расчётная цена (фьючерсы) за последний торговый день до даты. */
function startPrices_(tickers, before) {
  const ref = loadRef_();
  const from = Utilities.formatDate(new Date(before.getTime() - 10 * 864e5), TZ, 'yyyy-MM-dd');
  const till = Utilities.formatDate(new Date(before.getTime() - 864e5), TZ, 'yyyy-MM-dd');
  const urls = tickers.map(t => ISS + '/history/engines/' + (ref[t].type === 'F'
    ? 'futures/markets/forts/securities/' : 'stock/markets/shares/boards/TQBR/securities/') + t +
    '.json?iss.meta=off&from=' + from + '&till=' + till + '&history.columns=TRADEDATE,CLOSE,SETTLEPRICE');
  const out = {};
  if (!urls.length) return out;
  issFetchAll_(urls).forEach((j, i) => {
    const rows = issRows_(j.history).filter(r => r.SETTLEPRICE || r.CLOSE);
    const last = rows[rows.length - 1];
    if (last) out[tickers[i]] = ref[tickers[i]].type === 'F' ? (last.SETTLEPRICE || last.CLOSE) : (last.CLOSE || last.SETTLEPRICE);
  });
  return out;
}

function closedKey_(r) { return [r.TICKER, +new Date(r.OPENED), +new Date(r.CLOSED), round6_(r.QTY)].join('|'); }
function openKey_(r) { return [r.TICKER, +new Date(r.OPENED)].join('|'); }

function existingKeys_() {
  const out = { closed: new Set(), open: new Set() };
  [[SH.CLOSED, CLOSED, 'closed', closedKey_], [SH.OPEN, OPEN, 'open', openKey_]].forEach(([name, layout, k, fn]) => {
    const sh = sheet_(name);
    const last = lastDataRow_(sh, layout.FIRST, C_(layout).TICKER);
    if (last < layout.FIRST) return;
    sh.getRange(layout.FIRST, 1, last - layout.FIRST + 1, layout.cols.length).getValues().forEach(v => {
      const o = {};
      layout.cols.forEach((col, i) => o[col.k] = v[i]);
      out[k].add(fn(o));
      if (k === 'closed') out.open.add(openKey_(o)); // позиция уже закрыта в журнале — открывать заново не нужно
    });
  });
  return out;
}

// ---------------------------------------------------------------- мелочи разбора

/** HTML-таблицы → массив строк (массивов текстов ячеек). */
function htmlRows_(html) {
  const out = [];
  html.split(/<tr[\s>]/i).slice(1).forEach(tr => {
    const body = tr.split(/<\/tr>/i)[0];
    const cells = [];
    body.replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, (_, c) => { cells.push(cellText_(c)); return ''; });
    if (cells.some(Boolean)) out.push(cells);
  });
  return out;
}

function cellText_(c) {
  return c.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/[\s ]+/g, ' ').trim();
}

function idx_(r) { return r.reduce((o, h, i) => (o[h] = i, o), {}); }

/** «1 234,56» → 1234.56 */
function numRu_(s) {
  const v = String(s || '').replace(/[\s ]/g, '').replace(',', '.');
  return v === '' ? 0 : Number(v);
}

/** «01.10.2026» или «2026-10-01» → Date (полночь МСК). */
function dateRu_(s) {
  const m = String(s).match(/^(\d\d)\.(\d\d)\.(\d{4})/);
  const iso = m ? m[3] + '-' + m[2] + '-' + m[1] : String(s).slice(0, 10);
  return Utilities.parseDate(iso + ' 00:00:00', TZ, 'yyyy-MM-dd HH:mm:ss');
}

function dtRu_(d, t) {
  const m = d.match(/^(\d\d)\.(\d\d)\.(\d{4})$/);
  const hms = (String(t || '00:00:00').trim() + ':00:00').split(':').slice(0, 3).map(x => x.padStart(2, '0')).join(':');
  return Utilities.parseDate(m[3] + '-' + m[2] + '-' + m[1] + ' ' + hms, TZ, 'yyyy-MM-dd HH:mm:ss');
}

function round6_(x) { return Math.round(x * 1e6) / 1e6; }
/**
 * Api.gs — веб-приложение для калькулятора позиции.
 *   GET  ?key=…            → настройки (депозит, лимиты, комиссии, стратегии) и текущий риск открытых
 *   GET  ?key=…&token=…    → дошла ли заявка с этим token
 *   POST {key, token, …}   → новая строка в «Заявках»
 * Ключ — «Ключ доступа для калькулятора» из «Настроек». Без него запрос отклоняется.
 * Повтор POST с тем же token не создаёт вторую заявку.
 */

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!apiKeyOk_(p.key)) return json_({ ok: false, error: 'Неверный ключ доступа' });
  // ?token=… — дошла ли заявка с этим token (ответ на POST иногда теряется на переадресации Google)
  if (p.action === 'snapshot') return json_(snapshot_());
  if (p.token) {
    const v = CacheService.getDocumentCache().get('tok:' + p.token);
    return v ? json_({ ok: true, id: /^\d+$/.test(v) ? Number(v) : null, checked: true })
             : json_({ ok: false, error: 'Заявка не дошла до журнала' });
  }
  const s = getSettings_();
  const strategies = SpreadsheetApp.getActive().getRangeByName('STRATEGIES').getValues().map(r => r[0]).filter(String);
  const open = openTotals_();
  return json_({
    ok: true, deposit: s.deposit, riskTrade: s.riskTrade, riskTotal: s.riskTotal,
    commFut: s.commFut, exchFut: s.exchFut, commStk: s.commStk, strategies,
    repoShort: s.repoShort, repoLong: s.repoLong, futLev: s.futLev,
    openRisk: open.risk, openMargin: open.margin, openCount: open.n,
  });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'Запрос не в формате JSON' }); }
  if (!apiKeyOk_(d.key)) return json_({ ok: false, error: 'Неверный ключ доступа' });
  let out;
  try {
    out = d.action && d.action !== 'order' ? appAction_(d) : postOrder_(d);   // приложение «Журнал» / заявка из калькулятора
  } catch (err) {
    out = { ok: false, error: 'Ошибка журнала: ' + (err.message || err) };
  }
  logEvent_(d, out);
  return json_(out);
}

/** Новая заявка из калькулятора. */
function postOrder_(d) {
  const res = locked_(d.token, () => {
    const t = refSecid_(d.ticker);
    if (!t) throw new Error('Тикера ' + String(d.ticker || '').trim() + ' нет в справочнике журнала');
    if (d.side !== 'L' && d.side !== 'S') throw new Error('Направление должно быть L или S');
    const qty = num_(d.qty), entry = num_(d.entry);
    if (!(qty > 0) || !(entry > 0)) throw new Error('Объём и цена входа должны быть больше нуля');
    if (d.strategy) addStrategy_(String(d.strategy).trim());
    const id = nextId_();
    appendRows_(SH.ORDERS, ORDERS, [{
      CREATED: new Date(), TICKER: t, SIDE: d.side, QTY: qty, ENTRY: entry,
      SL: optNum_(d.sl), TP: optNum_(d.tp), STRATEGY: d.strategy || '', ID: id, NOTE: d.note || '',
    }]);
    return String(id);
  });
  if (!res.ok) return { ok: false, error: res.msg };
  return { ok: true, id: res.msg === 'Уже выполнено' ? null : Number(res.msg), duplicate: res.msg === 'Уже выполнено' };
}

/** Новая стратегия из калькулятора — в список «Настроек» (иначе выпадающий список сочтёт её ошибкой). */
function addStrategy_(name) {
  if (!name) return;
  const r = SpreadsheetApp.getActive().getRangeByName('STRATEGIES');
  const vals = r.getValues().map(v => String(v[0]).trim());
  if (vals.some(v => v.toLowerCase() === name.toLowerCase())) return;
  const i = vals.indexOf('');
  if (i >= 0) r.getCell(i + 1, 1).setValue(name);
}

/** Сумма «До стопа» и ГО по «Открытым» (значения формул). */
function openTotals_() {
  const sh = sheet_(SH.OPEN);
  const c = C_(OPEN);
  const last = lastDataRow_(sh, OPEN.FIRST, c.TICKER);
  if (last < OPEN.FIRST) return { risk: 0, margin: 0, n: 0 };
  const n = last - OPEN.FIRST + 1;
  const sum = col => sh.getRange(OPEN.FIRST, col, n, 1).getValues().reduce((s, r) => s + (Number(r[0]) || 0), 0);
  return { risk: sum(c.RISK), margin: sum(c.MARGIN), n };
}

function apiKeyOk_(key) {
  const k = getSettings_().apiKey;
  return !!k && String(key || '') === k;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** Меню: Журнал → Калькулятор: ссылка и ключ. */
function showApiInfo() {
  let url = '';
  try { url = ScriptApp.getService().getUrl() || ''; } catch (e) { /* нет развёртывания */ }
  const ui = SpreadsheetApp.getUi();
  ui.alert('Калькулятор', (url ? 'Адрес веб-приложения:\n' + url : 'Веб-приложение ещё не развёрнуто.') +
    '\n\nКлюч доступа:\n' + getSettings_().apiKey + '\n\nВставьте оба значения в настройки калькулятора (⚙).', ui.ButtonSet.OK);
}
/**
 * App.gs — данные и действия для приложения «Журнал» (PWA на GitHub Pages).
 *   GET  ?key=…&action=snapshot      → открытые, заявки, закрытые, расходы, настройки, спецификации
 *   POST {key, action, token, …}     → add | fill | cancel | close | edit | editOrder | refresh | settings | expense | import (+ snapshot)
 *                                      importPreview — только проверка отчёта, без записи
 * Ключ тот же, что у калькулятора. Операции — те же функции, что у диалогов в Таблице.
 */

function rows_(name, layout) {
  const sh = sheet_(name);
  const c = C_(layout);
  const last = lastDataRow_(sh, layout.FIRST, keyCol_(layout));
  if (last < layout.FIRST) return [];
  return sh.getRange(layout.FIRST, 1, last - layout.FIRST + 1, layout.cols.length).getValues()
    .map(v => layout.cols.reduce((o, col, j) => (o[col.k] = v[j] === '' ? null : v[j], o), {}))
    .filter(o => o[layout.KEY || 'TICKER'] != null);
}

/** lite — без истории сделок и расходов (быстрее; после действий с заявками и стопами она не меняется). */
function snapshot_(lite) {
  dedupeOpenIds_();
  SpreadsheetApp.flush();
  const ref = loadRef_();
  const open = rows_(SH.OPEN, OPEN).map(o => ({
    id: o.ID, ticker: o.TICKER, name: o.NAME, side: o.SIDE, qty: o.QTY, entry: o.ENTRY, price: o.PRICE,
    sl: o.SL, tp: o.TP, sl0: o.SL0, pnl: o.PNL, r: o.PNLR, stop: o.STOPPNL, margin: o.MARGIN, risk: o.RISK,
    opened: o.OPENED, strategy: o.STRATEGY, note: o.NOTE, tag: o.TAG,
  }));
  const orders = rows_(SH.ORDERS, ORDERS).map(o => ({
    id: o.ID, created: o.CREATED, ticker: o.TICKER, side: o.SIDE, qty: o.QTY, entry: o.ENTRY,
    sl: o.SL, tp: o.TP, risk: o.RISK, rr: o.RR, strategy: o.STRATEGY, note: o.NOTE, tag: o.TAG,
  }));
  const closed = lite ? null : rows_(SH.CLOSED, CLOSED).map(o => ({
    id: o.ID, opened: o.OPENED, closed: o.CLOSED, ticker: o.TICKER, side: o.SIDE, qty: o.QTY,
    entry: o.ENTRY, exit: o.EXIT, sl: o.SL, tp: o.TP, fee: o.FEE, pnl: o.PNL, r: o.PNLR,
    strategy: o.STRATEGY, note: o.NOTE, exitStrat: o.EXIT_STRAT, tag: o.TAG,
  }));
  const expenses = lite ? null : rows_(SH.EXP, EXP).map(o => ({ date: o.DATE, kind: o.KIND, amount: o.AMOUNT, note: o.NOTE }));
  const specs = {};
  open.concat(orders).forEach(p => {
    const s = ref[p.ticker];
    if (s) specs[p.ticker] = { type: s.type, pv: s.pv, lot: s.lot, minstep: s.minstep, decimals: s.decimals, im: s.im, name: s.name };
  });
  const s = getSettings_();
  const quotesAt = sheet_(SH.OPEN).getRange(OPEN.SUMMARY, C_(OPEN).PNLR).getValue();
  const refAt = SpreadsheetApp.getActive().getRangeByName('SET_REF_UPDATED').getValue();
  const strategies = SpreadsheetApp.getActive().getRangeByName('STRATEGIES').getValues().map(r => r[0]).filter(String);
  const list = (name, def) => { const r = SpreadsheetApp.getActive().getRangeByName(name); return r ? r.getValues().map(x => x[0]) : def; };
  const exitStrategies = list('EXIT_STRATEGIES', EXIT_STRATEGY_DEFAULTS).filter(String);
  const tagNames = list('TAG_NAMES', TAGS.map(t => t[2])).map(String);
  return { log: lastLog_(30), exitStrategies, tags: TAGS.map((t, i) => ({ code: t[0], color: t[1], name: tagNames[i] || '' })),
    ok: true, lite: !!lite, at: new Date(), quotesAt: quotesAt instanceof Date ? quotesAt : null,
    refAt: refAt instanceof Date ? refAt : null, importedTo: importWatermark_() || null,
    settings: { deposit: s.deposit, riskTrade: s.riskTrade, riskTotal: s.riskTotal, commFut: s.commFut,
      exchFut: s.exchFut, commStk: s.commStk, repoShort: s.repoShort, repoLong: s.repoLong, futLev: s.futLev },
    strategies, open, orders, closed, expenses, specs,
  };
}

/**
 * В «Открытых» у каждой сделки должен быть свой ID: по нему закрывают и правят стоп.
 * Если ID повторяется (строку скопировали вручную), второй и следующим даём новый.
 */
function dedupeOpenIds_() {
  const sh = sheet_(SH.OPEN), c = C_(OPEN);
  const last = lastDataRow_(sh, OPEN.FIRST, c.TICKER);
  if (last < OPEN.FIRST) return;
  const ids = sh.getRange(OPEN.FIRST, c.ID, last - OPEN.FIRST + 1, 1).getValues();
  const seen = new Set(), dup = [];
  ids.forEach((r, i) => { const v = String(r[0]); if (v === '') return; if (seen.has(v)) dup.push(i); else seen.add(v); });
  if (!dup.length) return;
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(10000)) return;
  try {
    let next = nextId_();
    dup.forEach(i => { sh.getRange(OPEN.FIRST + i, c.ID).setValue(next++); });
  } finally { lock.releaseLock(); }
}

/** Действие из приложения. Возвращает {ok, msg, snapshot}. */
function appAction_(d) {
  let res;
  switch (d.action) {
    case 'add':    res = addTrade({ ticker: d.ticker, side: d.side, qty: d.qty, entry: d.entry, sl: d.sl, tp: d.tp,
                     opened: d.time, strategy: d.strategy || '', note: d.note || '', tag: d.tag || '', token: d.token });
                   if (res.ok && d.strategy) addStrategy_(String(d.strategy).trim()); break;
    case 'editOrder': res = locked_(d.token, () => editOrder_(d)); break;
    case 'fill':   res = fillOrder({ id: d.id, price: d.price, qty: d.qty, time: d.time, note: d.note || '', strategy: d.strategy || '', token: d.token });
                   if (res.ok && d.strategy) addStrategy_(String(d.strategy).trim()); break;
    case 'cancel': res = locked_(d.token, () => {
                     if (!deleteById_(SH.ORDERS, ORDERS, d.id)) return 'Заявка уже удалена';
                     return 'Заявка #' + d.id + ' отменена';
                   }); break;
    case 'close':  res = closePosition({ id: d.id, price: d.price, qty: d.qty, time: d.time, note: d.note || '', exitStrategy: d.exitStrategy || '', token: d.token });
                   if (res.ok && d.exitStrategy) addListItem_('EXIT_STRATEGIES', d.exitStrategy); break;
    case 'tag':    res = locked_(d.token, () => setTag_(d)); break;
    case 'edit':   res = locked_(d.token, () => editOpen_(d)); break;
    case 'settings': res = locked_(d.token, () => saveSettings_(d)); break;
    case 'expense':  res = locked_(d.token, () => addExpense_(d)); break;
    case 'importPreview': { const p = previewImport(d.text); return { ok: p.ok, msg: p.msg, count: p.count, error: p.ok ? undefined : p.msg, snapshot: null }; }
    case 'import':   res = runImport({ text: d.text, token: d.token }); break;
    case 'refresh': {
      const upd = SpreadsheetApp.getActive().getRangeByName('SET_REF_UPDATED').getValue();     // справочник — раз в день
      const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
      if (!(upd instanceof Date) || Utilities.formatDate(upd, TZ, 'yyyy-MM-dd') !== today) { try { refreshReference_(true); } catch (e) { /* не страшно */ } }
      const n = updateQuotes_();
      res = n < 0 ? { ok: false, msg: 'Журнал занят, попробуйте через пару секунд' } : { ok: true, msg: 'Котировок обновлено: ' + n };
      break;
    }
    default: return { ok: false, error: 'Неизвестное действие: ' + d.action };
  }
  loadRef_.cache = null; getSettings_.cache = null;
  const out = res.ok ? { ok: true, msg: res.msg } : { ok: false, error: res.msg };
  out.snapshot = snapshot_(!['close', 'import', 'expense'].includes(d.action));   // история меняется только при закрытии, импорте, расходе
  return out;
}

/** Настройки из приложения. Проценты приходят долями (0.01 = 1%). Стратегии — список строк. */
function saveSettings_(d) {
  const ss = SpreadsheetApp.getActive(), map = {
    deposit: 'SET_DEPOSIT', riskTrade: 'SET_RISK_TRADE', riskTotal: 'SET_RISK_TOTAL', commFut: 'SET_COMM_FUT', exchFut: 'SET_EXCH_FUT',
    commStk: 'SET_COMM_STK', repoShort: 'SET_REPO_SHORT', repoLong: 'SET_REPO_LONG', futLev: 'SET_FUT_LEV' };
  const s = d.settings || {};
  Object.keys(map).forEach(k => {
    if (!(k in s)) return;
    const v = num_(s[k]);
    if (!(v >= 0)) throw new Error('Неверное значение: ' + k);
    ss.getRangeByName(map[k]).setValue(v);
  });
  const writeList = (name, arr) => {
    const r = ss.getRangeByName(name); if (!r) return;
    const n = r.getNumRows(), list = [...new Set(arr.map(x => String(x).trim()).filter(Boolean))].slice(0, n);
    r.setValues(Array.from({ length: n }, (_, i) => [list[i] || '']));
  };
  if (Array.isArray(d.strategies)) writeList('STRATEGIES', d.strategies);
  if (Array.isArray(d.exitStrategies)) writeList('EXIT_STRATEGIES', d.exitStrategies);
  if (Array.isArray(d.tagNames)) {
    const r = ss.getRangeByName('TAG_NAMES');
    if (r) r.setValues(Array.from({ length: r.getNumRows() }, (_, i) => [String(d.tagNames[i] || '').trim()]));
  }
  return 'Настройки сохранены';
}

const TAG_CODES = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'];
/** Цветная метка на заявке, открытой позиции или закрытой сделке (на все строки с этим ID). '' — снять. */
function setTag_(d) {
  const tag = String(d.tag || '');
  if (tag && !TAG_CODES.includes(tag)) throw new Error('Неизвестный цвет: ' + tag);
  const kinds = { orders: [SH.ORDERS, ORDERS], open: [SH.OPEN, OPEN], closed: [SH.CLOSED, CLOSED] };
  const k = kinds[d.kind]; if (!k) throw new Error('Неизвестно, где метка: ' + d.kind);
  const ids = (Array.isArray(d.ids) ? d.ids : [d.id]).map(String);
  const sh = sheet_(k[0]), c = C_(k[1]);
  const last = lastDataRow_(sh, k[1].FIRST, keyCol_(k[1]));
  if (last < k[1].FIRST) throw new Error('Не найдено');
  const n = last - k[1].FIRST + 1, rng = sh.getRange(k[1].FIRST, c.ID, n, 1).getValues();
  let cnt = 0;
  rng.forEach((r, i) => { if (ids.includes(String(r[0]))) { sh.getRange(k[1].FIRST + i, c.TAG).setValue(tag); cnt++; } });
  if (!cnt) throw new Error('Не найдено: #' + ids.join(', #'));
  return tag ? 'Метка поставлена' : 'Метка снята';
}

/** Добавить значение в именованный список (если его там нет). */
function addListItem_(name, value) {
  const r = SpreadsheetApp.getActive().getRangeByName(name); if (!r) return;
  const vals = r.getValues().map(v => String(v[0]).trim()), v = String(value).trim();
  if (!v || vals.some(x => x.toLowerCase() === v.toLowerCase())) return;
  const i = vals.indexOf(''); if (i >= 0) r.getCell(i + 1, 1).setValue(v);
}

/** Доход/расход вне сделок → «Расходы». amount: расход со знаком минус. */
function addExpense_(d) {
  const amount = num_(d.amount);
  if (!amount) throw new Error('Укажите сумму');
  if (!String(d.kind || '').trim()) throw new Error('Укажите вид');
  appendRows_(SH.EXP, EXP, [{ DATE: parseTime_(d.date), KIND: String(d.kind).trim(), AMOUNT: amount, NOTE: String(d.note || '') }]);
  return (amount > 0 ? 'Доход ' : 'Расход ') + fmtRub_(amount) + ' записан';
}

/** Правка заявки: вход, объём, стоп, тейк, стратегия, заметка. Пустой стоп/тейк — убрать. */
function editOrder_(d) {
  const f = findById_(SH.ORDERS, ORDERS, d.id);
  if (!f) throw new Error('Заявка #' + d.id + ' не найдена');
  const sh = sheet_(SH.ORDERS), c = C_(ORDERS), parts = [];
  const set = (k, v, label) => { sh.getRange(f.row, c[k]).setValue(v); parts.push(label); };
  if ('entry' in d) { const v = num_(d.entry); if (!(v > 0)) throw new Error('Цена входа должна быть больше нуля'); set('ENTRY', v, 'вход ' + v); }
  if ('qty' in d)   { const v = num_(d.qty);   if (!(v > 0)) throw new Error('Объём должен быть больше нуля');      set('QTY', v, 'объём ' + v); }
  if ('sl' in d) set('SL', optNum_(d.sl), 'стоп ' + (d.sl === '' ? '—' : d.sl));
  if ('tp' in d) set('TP', optNum_(d.tp), 'тейк ' + (d.tp === '' ? '—' : d.tp));
  if ('strategy' in d) { const s = String(d.strategy || '').trim(); if (s) addStrategy_(s); set('STRATEGY', s, 'стратегия'); }
  if ('note' in d) set('NOTE', String(d.note || ''), 'заметка');
  return 'Заявка #' + d.id + ' ' + f.obj.TICKER + ': ' + parts.join(', ');
}

// ---------------------------------------------------------------- лог действий и ошибок

const LOG_SHEET = 'Лог';
const LOG_KEEP = 3000;   // сколько последних строк хранить

/** Запись в лист «Лог»: время, устройство, действие, детали, результат. Ошибка записи лога ни на что не влияет. */
function logEvent_(d, out) {
  try {
    if (d.action === 'refresh' && out.ok) return;                       // обновление котировок — не засоряем
    if (d.action === 'importPreview' && out.ok) return;
    const ss = SpreadsheetApp.getActive();
    let sh = ss.getSheetByName(LOG_SHEET);
    if (!sh) {
      sh = ss.insertSheet(LOG_SHEET);
      sh.getRange(1, 1, 1, 6).setValues([['Время', 'Устройство', 'Действие', 'Что', 'Итог', 'Сообщение']]).setFontWeight('bold');
      sh.setFrozenRows(1);
      [120, 80, 110, 260, 60, 360].forEach((w, i) => sh.setColumnWidth(i + 1, w));
    }
    const what = ['ticker', 'side', 'qty', 'entry', 'price', 'sl', 'tp', 'id'].filter(k => d[k] !== undefined && d[k] !== '')
      .map(k => k + '=' + d[k]).join(' ');
    sh.appendRow([new Date(), String(d.dev || '').slice(0, 20), d.action || 'order', what, out.ok ? 'ok' : 'ОШИБКА',
      String(out.ok ? (out.msg || (out.id ? 'заявка #' + out.id : '')) : out.error || '').slice(0, 300)]);
    const extra = sh.getLastRow() - 1 - LOG_KEEP;
    if (extra > 200) sh.deleteRows(2, extra);
  } catch (e) { /* лог не должен ломать работу */ }
}

/** Последние записи лога для экрана «Последние события» в ⚙. */
function lastLog_(n) {
  const sh = SpreadsheetApp.getActive().getSheetByName(LOG_SHEET);
  if (!sh || sh.getLastRow() < 2) return [];
  const k = Math.min(n, sh.getLastRow() - 1);
  return sh.getRange(sh.getLastRow() - k + 1, 1, k, 6).getValues().reverse()
    .map(r => ({ at: r[0], dev: r[1], action: r[2], what: r[3], ok: r[4] === 'ok', msg: r[5] }));
}

/** Правка открытой позиции: стоп, тейк, заметка. Пустое значение стопа/тейка — убрать. */
function editOpen_(d) {
  const pos = findById_(SH.OPEN, OPEN, d.id);
  if (!pos) throw new Error('Позиция #' + d.id + ' не найдена');
  const sh = sheet_(SH.OPEN), c = C_(OPEN), parts = [];
  if ('sl' in d) { sh.getRange(pos.row, c.SL).setValue(optNum_(d.sl)); parts.push('SL ' + (d.sl === '' ? '—' : d.sl)); }
  if ('tp' in d) { sh.getRange(pos.row, c.TP).setValue(optNum_(d.tp)); parts.push('TP ' + (d.tp === '' ? '—' : d.tp)); }
  if ('note' in d) { sh.getRange(pos.row, c.NOTE).setValue(String(d.note || '')); parts.push('заметка'); }
  if ('strategy' in d) { const st = String(d.strategy || '').trim(); sh.getRange(pos.row, c.STRATEGY).setValue(st); if (st) addStrategy_(st); parts.push('стратегия'); }
  return '#' + d.id + ' ' + pos.obj.TICKER + ': ' + parts.join(', ');
}
/**
 * Stats.gs — лист «Статистика». Только формулы по «Закрытым» и «Расходам», скрипт лишь расставляет их.
 *
 * Сделка = все строки «Закрытых» с одним ID, выход которых попал в период (частичные выходы
 * складываются). Период выбирается в строке 1: «Месяц» (список месяцев из данных),
 * «Всё время» или «Диапазон» (даты «с» и «по»).
 *
 * Раскладка:
 *   строки 1–2   выбор периода и его даты
 *   строки 4–11  показатели (A:C слева, F:H справа)
 *   строки 13–27 график капитала
 *   строки 29+   таблицы: стратегии + месяцы (A:D), тикеры + L/S (F:I)
 *   K:S          служебная таблица сделок периода (свёрнутая группа)
 */

const ST = { KPI: 4, CHART: 13, TABLES: 29, TRADES: 5, HELP: 11 }; // HELP — первая служебная колонка (K)

function buildStats_(ss) {
  const sh = ensureSheet_(ss, SH.STATS);
  const keep = sh.getMaxColumns() >= 9 ? sh.getRange(1, 2, 1, 8).getValues()[0] : null; // выбор периода пользователя

  sh.setFrozenRows(0);
  sh.getCharts().forEach(ch => sh.removeChart(ch));
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).breakApart().clear().clearDataValidations();
  fitGrid_(sh, statsRowsNeeded_(), 19);
  paint_(sh);
  [130, 100, 60, 80, 12, 130, 100, 60, 80, 16, 44, 86, 62, 32, 110, 80, 80, 70, 90]
    .forEach((w, i) => sh.setColumnWidth(i + 1, w));

  const F = statsFormulas_();
  const R = (a1) => sh.getRange(a1);
  const label = a1 => R(a1).setFontColor(THEME.muted).setFontSize(9);
  const mono = a1 => R(a1).setFontFamily(THEME.mono).setHorizontalAlignment('right');

  // ---- период
  label('A1').setValue('Период');
  R('B1').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Месяц', 'Всё время', 'Диапазон'], true).build());
  R('C1:D1').merge().setNumberFormat('mmmm yyyy').setHorizontalAlignment('left')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInRange(R('U2:U'), true).setAllowInvalid(true).build());
  label('F1').setValue('Диапазон: с').setHorizontalAlignment('right');
  label('H1').setValue('по').setHorizontalAlignment('right');
  [R('G1'), R('I1')].forEach(r => r.setNumberFormat('dd.mm.yyyy').setFontFamily(THEME.mono)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireDate().build()));
  label('A2').setValue('Даты');
  R('B2').setFormula(fx_('=$K$1')).setNumberFormat('dd.mm.yyyy').setFontFamily(THEME.mono).setFontColor(THEME.muted);
  R('C2:D2').merge().setFormula(fx_('=$L$1-1')).setNumberFormat('"— "dd.mm.yyyy').setFontFamily(THEME.mono).setFontColor(THEME.muted);
  sh.getRange(1, 1, 2, 9).setBackground(THEME.head);
  sh.setRowHeight(1, 28);

  // Значения пользователя (или по умолчанию — текущий месяц).
  const firstMonth = Utilities.parseDate(Utilities.formatDate(new Date(), TZ, 'yyyy-MM') + '-01', TZ, 'yyyy-MM-dd');
  R('B1').setValue(keep && keep[0] ? keep[0] : 'Месяц');
  const keptMonth = keep && keep[1] instanceof Date && Utilities.formatDate(keep[1], TZ, 'd') === '1' ? keep[1] : null;
  R('C1').setValue(keptMonth || firstMonth);
  if (keep && keep[5] instanceof Date) R('G1').setValue(keep[5]);
  if (keep && keep[7] instanceof Date) R('I1').setValue(keep[7]);

  // ---- служебное: границы периода, список месяцев, сделки периода
  R('K1').setFormula(fx_(F.start)).setNumberFormat('dd.mm.yyyy');
  R('L1').setFormula(fx_(F.end)).setNumberFormat('dd.mm.yyyy');
  R('U1').setValue('Месяцы'); R('U2').setFormula(fx_(F.months)); sh.getRange('U2:U').setNumberFormat('mmmm yyyy');
  const th = ['ID', 'Выход', 'Тикер', 'L/S', 'Стратегия', 'PnL ₽', 'Риск ₽', 'Комиссия', 'Капитал'];
  sh.getRange(ST.TRADES - 1, ST.HELP, 1, th.length).setValues([th]).setBackground(THEME.head).setFontColor(THEME.muted).setFontSize(9);
  R('K5').setFormula(fx_(F.trades));
  R('S5').setFormula(fx_(F.equity));
  sh.getRange('L5:L').setNumberFormat('dd.mm.yy hh:mm');
  sh.getRange('P5:R').setNumberFormat('#,##0');
  sh.getRange('S5:S').setNumberFormat('#,##0');
  sh.getRange('K5:S').setFontFamily(THEME.mono).setFontSize(9);

  // ---- показатели
  const kpi = [
    // [метка слева, формула, формат, подпись-формула] , [метка справа, ...]
    [['PnL сделок', F.pnl, 'rub'], ['Сделок', F.n, 'int', F.nSub]],
    [['Вне сделок', F.other, 'rub', F.otherSub], ['Винрейт', F.win, 'pct']],
    [['Итог', F.total, 'rub', F.totalSub], ['Profit factor', F.pf, 'dec']],
    [['Ср. выигрыш', F.avgWin, 'rub'], ['Ср. проигрыш', F.avgLoss, 'rub']],
    [['Матожидание ₽', F.expRub, 'rub'], ['Матожидание R', F.expR, 'r', F.expRSub]],
    [['Макс. просадка', F.dd, 'rub', F.ddSub], ['Лучшая сделка', F.best, 'rub', F.worstSub]],
    [['Серия побед', F.winStreak, 'int'], ['Серия поражений', F.lossStreak, 'int']],
    [['Комиссия', F.fees, 'rub'], ['Ср. время в сделке', F.avgDur, 'dur']],
  ];
  const fmt = { rub: '+#,##0" ₽";-#,##0" ₽";0" ₽"', int: '0', pct: '0.0%', dec: '0.00', r: '+0.00"R";-0.00"R";0.00"R"', dur: '[h]:mm' };
  kpi.forEach((pair, i) => {
    const row = ST.KPI + i;
    pair.forEach((k, j) => {
      const col = j ? 6 : 1;
      sh.getRange(row, col).setValue(k[0]).setFontColor(THEME.muted).setFontSize(9);
      sh.getRange(row, col + 1).setFormula(fx_(k[1])).setNumberFormat(fmt[k[2]])
        .setFontFamily(THEME.mono).setHorizontalAlignment('right').setFontSize(11);
      if (k[3]) sh.getRange(row, col + 2, 1, 2).merge().setFormula(fx_(k[3])).setFontColor(THEME.muted).setFontSize(9);
    });
    sh.setRowHeight(row, 26);
  });
  R('B6').setFontWeight('bold');

  // ---- таблицы
  R('A' + ST.TABLES).setFormula(fx_(F.tableLeft));
  R('F' + ST.TABLES).setFormula(fx_(F.tableRight));
  sh.getRange(ST.TABLES, 2, sh.getMaxRows() - ST.TABLES + 1, 3).setFontFamily(THEME.mono).setHorizontalAlignment('right');
  sh.getRange(ST.TABLES, 7, sh.getMaxRows() - ST.TABLES + 1, 3).setFontFamily(THEME.mono).setHorizontalAlignment('right');
  sh.getRange(ST.TABLES, 1, sh.getMaxRows() - ST.TABLES + 1, 1).setNumberFormat('mmm yyyy');
  sh.getRange(ST.TABLES, 3, sh.getMaxRows() - ST.TABLES + 1, 1).setNumberFormat('0%');
  sh.getRange(ST.TABLES, 8, sh.getMaxRows() - ST.TABLES + 1, 1).setNumberFormat('0%');
  sh.getRange(ST.TABLES, 4, sh.getMaxRows() - ST.TABLES + 1, 1).setNumberFormat('+#,##0;-#,##0;0');
  sh.getRange(ST.TABLES, 9, sh.getMaxRows() - ST.TABLES + 1, 1).setNumberFormat('+#,##0;-#,##0;0');

  statsConditional_(sh);
  statsChart_(sh);

  // Служебные колонки — в свёрнутую группу.
  if (sh.getColumnGroupDepth(ST.HELP) === 0) sh.getRange(1, ST.HELP, 1, 11).shiftColumnGroupDepth(1);
  sh.setColumnGroupControlPosition(SpreadsheetApp.GroupControlTogglePosition.BEFORE);
  try { sh.getColumnGroup(ST.HELP, 1).collapse(); } catch (e) { /* нет группы */ }
  sh.setFrozenRows(2);

  // Формулы защищены «мягко» (предупреждение); выбор периода и свёртка колонок — свободно.
  sh.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(p => p.remove());
  sh.getProtections(SpreadsheetApp.ProtectionType.RANGE).filter(p => p.getDescription() === 'journal-stats').forEach(p => p.remove());
  [R('A2:I2'), sh.getRange(ST.KPI, 1, 8, 9), sh.getRange(ST.TABLES, 1, sh.getMaxRows() - ST.TABLES + 1, 9)]
    .forEach(r => r.protect().setDescription('journal-stats').setWarningOnly(true));
}

/** Формулы (синтаксис с запятыми; fx_ переводит под локаль Таблицы). */
function statsFormulas_() {
  const X = k => "'" + SH.CLOSED + "'!$" + L_(CLOSED, k) + '$' + CLOSED.FIRST + ':$' + L_(CLOSED, k);
  const E = k => "'" + SH.EXP + "'!$" + L_(EXP, k) + '$' + EXP.FIRST + ':$' + L_(EXP, k);
  const A = X('ID'), C = X('CLOSED');
  const inP = 'exc,">="&st,exc,"<"&en';
  const p = 'FILTER($P$5:$P,$K$5:$K<>"")';
  const per = (expr) => 'MAP(ids,LAMBDA(i,' + expr + '))';
  const sumP = col => per('SUMIFS(' + X(col) + ',idc,i,' + inP + ')');
  const first = col => per('LET(v,XLOOKUP(i,idc,' + X(col) + ',""),IF(v="","—",v))');

  // Таблица «группа → сделок, винрейт, PnL» по массиву групп g (с сортировкой по PnL или по группе).
  const group = (title, g, sortCol, asc) =>
    'LET(g,' + g + ',p,' + p + ',u,UNIQUE(g),' +
    'n,MAP(u,LAMBDA(x,SUM(--(g=x)))),w,MAP(u,LAMBDA(x,SUM((g=x)*(p>0)))),s,MAP(u,LAMBDA(x,SUM((g=x)*p))),' +
    'VSTACK({"' + title + '","Сделок","Винрейт","PnL ₽"},SORT(HSTACK(u,n,w/n,s),' + sortCol + ',' + asc + ')))';
  const gStrat = 'FILTER($O$5:$O,$K$5:$K<>"")', gTick = 'FILTER($M$5:$M,$K$5:$K<>"")',
        gSide = 'FILTER($N$5:$N,$K$5:$K<>"")', gMonth = 'ARRAYFORMULA(EOMONTH(FILTER($L$5:$L,$K$5:$K<>""),-1)+1)';
  const blank = '{"","","",""}';

  return {
    start: '=IF($B$1="Всё время",IFERROR(INT(MIN(' + C + ')),TODAY()),IF($B$1="Диапазон",$G$1,$C$1))',
    end: '=IF($B$1="Всё время",IFERROR(INT(MAX(' + C + '))+1,TODAY()+1),IF($B$1="Диапазон",$I$1+1,EDATE($C$1,1)))',
    months: '=ARRAYFORMULA(IFERROR(SORT(UNIQUE(FILTER(EOMONTH(' + C + ',-1)+1,' + C + '<>"")),1,FALSE),""))',
    trades: '=ARRAYFORMULA(IFERROR(LET(st,$K$1,en,$L$1,idc,' + A + ',exc,' + C + ',' +
      'ids,UNIQUE(FILTER(idc,idc<>"",exc>=st,exc<en)),' +
      'ex,' + per('MAXIFS(exc,idc,i,' + inP + ')') + ',' +
      'SORT(HSTACK(ids,ex,' + first('TICKER') + ',' + first('SIDE') + ',' + first('STRATEGY') + ',' +
      sumP('PNL') + ',' + sumP('RISK') + ',' + sumP('FEE') + '),2,TRUE)),""))',
    equity: '=ARRAYFORMULA(IFERROR(SCAN(0,' + p + ',LAMBDA(a,x,a+x)),""))',

    n: '=COUNT($K$5:$K)',
    nSub: '=IF(COUNT($K$5:$K),"+"&COUNTIF($P$5:$P,">0")&" / −"&COUNTIF($P$5:$P,"<0"),"")',
    pnl: '=SUM($P$5:$P)',
    other: '=SUMIFS(' + E('AMOUNT') + ',' + E('DATE') + ',">="&$K$1,' + E('DATE') + ',"<"&$L$1)',
    otherSub: '="записей: "&COUNTIFS(' + E('DATE') + ',">="&$K$1,' + E('DATE') + ',"<"&$L$1)',
    total: '=B4+B5',
    totalSub: '=IFERROR(ROUND(B6/SET_DEPOSIT*100,2)&"% депозита","")',
    win: '=IFERROR(COUNTIF($P$5:$P,">0")/COUNT($K$5:$K),"")',
    pf: '=IFERROR(SUMIF($P$5:$P,">0")/-SUMIF($P$5:$P,"<0"),"")',
    avgWin: '=IFERROR(AVERAGEIF($P$5:$P,">0"),"")',
    avgLoss: '=IFERROR(AVERAGEIF($P$5:$P,"<0"),"")',
    expRub: '=IFERROR(SUM($P$5:$P)/COUNT($K$5:$K),"")',
    expR: '=IFERROR(ARRAYFORMULA(AVERAGE(FILTER($P$5:$P/$Q$5:$Q,$Q$5:$Q>0))),"")',
    expRSub: '="по "&COUNTIF($Q$5:$Q,">0")&" со стопом"',
    dd: '=IFERROR(ARRAYFORMULA(LET(eq,SCAN(0,' + p + ',LAMBDA(a,x,a+x)),pk,SCAN(0,eq,LAMBDA(a,x,MAX(a,x))),MIN(eq-pk))),"")',
    ddSub: '=IFERROR(ROUND(B9/SET_DEPOSIT*100,2)&"% депозита","")',
    best: '=IFERROR(MAX(' + p + '),"")',
    worstSub: '=IFERROR("худшая "&FIXED(MIN(' + p + '),0)&" ₽","")',
    winStreak: '=IFERROR(MAX(SCAN(0,' + p + ',LAMBDA(a,x,IF(x>0,a+1,0)))),0)',
    lossStreak: '=IFERROR(MAX(SCAN(0,' + p + ',LAMBDA(a,x,IF(x<0,a+1,0)))),0)',
    fees: '=-SUM($R$5:$R)',
    avgDur: '=IFERROR(AVERAGE(FILTER(' + X('DUR') + ',' + C + '>=$K$1,' + C + '<$L$1)),"")',

    tableLeft: '=IFERROR(ARRAYFORMULA(VSTACK(' + group('Стратегия', gStrat, 4, 'FALSE') + ',' + blank + ',' + group('Месяц', gMonth, 1, 'TRUE') + ')),"")',
    tableRight: '=IFERROR(ARRAYFORMULA(VSTACK(' + group('Тикер', gTick, 4, 'FALSE') + ',' + blank + ',' + group('L/S', gSide, 1, 'TRUE') + ')),"")',
  };
}

/** Подсветка: знак результата, строки-заголовки таблиц. */
function statsConditional_(sh) {
  const CF = SpreadsheetApp.newConditionalFormatRule;
  const rules = [];
  const signed = ['B4', 'B5', 'B6', 'B8', 'G8', 'G9'].map(a => sh.getRange(a))
    .concat([sh.getRange(ST.TABLES, 4, sh.getMaxRows() - ST.TABLES + 1, 1), sh.getRange(ST.TABLES, 9, sh.getMaxRows() - ST.TABLES + 1, 1)]);
  rules.push(CF().whenNumberGreaterThan(0).setFontColor(THEME.profit).setRanges(signed).build());
  rules.push(CF().whenNumberLessThan(0).setFontColor(THEME.loss).setRanges(signed).build());
  rules.push(CF().whenNumberLessThan(0).setFontColor(THEME.loss).setRanges([sh.getRange('G7'), sh.getRange('B9')]).build());
  rules.push(CF().whenNumberGreaterThan(0).setFontColor(THEME.profit).setRanges([sh.getRange('B7')]).build());
  const n = sh.getMaxRows() - ST.TABLES + 1;
  rules.push(CF().whenFormulaSatisfied(fx_('=$B' + ST.TABLES + '="Сделок"')).setFontColor(THEME.muted).setBackground(THEME.head)
    .setRanges([sh.getRange(ST.TABLES, 1, n, 4)]).build());
  rules.push(CF().whenFormulaSatisfied(fx_('=$G' + ST.TABLES + '="Сделок"')).setFontColor(THEME.muted).setBackground(THEME.head)
    .setRanges([sh.getRange(ST.TABLES, 6, n, 4)]).build());
  sh.setConditionalFormatRules(rules);
}

/** Кривая капитала: дата выхода → накопленный PnL сделок периода. */
function statsChart_(sh) {
  const n = sh.getMaxRows() - ST.TRADES + 2;
  const chart = sh.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(sh.getRange(ST.TRADES - 1, ST.HELP + 1, n, 1))   // L: дата выхода
    .addRange(sh.getRange(ST.TRADES - 1, ST.HELP + 8, n, 1))   // S: капитал
    .setNumHeaders(1)
    .setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.SHOW_BOTH) // данные в свёрнутых колонках
    .setPosition(ST.CHART, 1, 0, 4)
    .setOption('title', 'Кривая капитала (PnL сделок, ₽)')
    .setOption('titleTextStyle', { color: THEME.muted, fontSize: 11 })
    .setOption('legend', { position: 'none' })
    .setOption('colors', [THEME.chart])
    .setOption('backgroundColor', THEME.bg)
    .setOption('hAxis.textStyle', { color: THEME.muted, fontSize: 9 })
    .setOption('vAxis.textStyle', { color: THEME.muted, fontSize: 9 })
    .setOption('width', 700).setOption('height', 300)
    .build();
  sh.insertChart(chart);
}

/** Строк на «Статистике» должно хватать для таблицы сделок и таблиц-разрезов. */
function statsRowsNeeded_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SH.CLOSED);
  const closed = sh ? Math.max(0, lastDataRow_(sh, CLOSED.FIRST, keyCol_(CLOSED)) - CLOSED.FIRST + 1) : 0;
  return Math.max(120, ST.TRADES + closed + 40);
}

function ensureStatsRows_() {
  const sh = SpreadsheetApp.getActive().getSheetByName(SH.STATS);
  if (!sh) return;
  const need = statsRowsNeeded_();
  if (sh.getMaxRows() < need) {
    sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
    sh.getCharts().forEach(ch => sh.removeChart(ch));   // диапазон графика — под новое число строк
    statsChart_(sh);
  }
}
/**
 * Menu.gs — меню «Журнал» и триггер правок.
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Журнал')
    .addItem('⟳ Обновить всё', 'refreshAll')
    .addItem('Добавить сделку…', 'showAddSidebar')
    .addItem('Импорт брокерского отчёта (.xls)…', 'showImportDialog')
    .addItem('Калькулятор: ссылка и ключ', 'showApiInfo')
    .addSeparator()
    .addItem('Проверить формулы (RIZ6, SiZ6, GAZP)', 'runFormulaTests')
    .addSubMenu(ui.createMenu('Сервис')
      .addItem('Перезагрузить справочник MOEX', 'refreshReference')
      .addItem('Установить / починить оформление', 'setupJournal'))
    .addToUi();
}

/**
 * Устанавливаемый триггер правок (один на Таблицу). Нужен для галочек «Исполнена», «Отменить»,
 * «Закрыть» и ⟳: простой onEdit не умеет открывать диалоги. Фоновых триггеров по времени нет.
 */
function installTriggers_() {
  const exists = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === EDIT_HANDLER);
  if (!exists) ScriptApp.newTrigger(EDIT_HANDLER).forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
}
