const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMobileNav() {
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
}

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  mobileNav.hidden = isOpen;
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileNav));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileNav();
});

const demoTabs = [...document.querySelectorAll('[data-demo]')];
const demoPanels = [...document.querySelectorAll('[data-panel]')];

function activateDemoTab(tab) {
  const target = tab.dataset.demo;
  demoTabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  demoPanels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== target;
  });
}

demoTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateDemoTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % demoTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + demoTabs.length) % demoTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = demoTabs.length - 1;
    activateDemoTab(demoTabs[nextIndex]);
    demoTabs[nextIndex].focus();
  });
});

const readinessForm = document.querySelector('#readiness-form');
const readinessResult = document.querySelector('#readiness-result');
const leadVerdict = document.querySelector('#lead-verdict');
const readinessQuestions = ['vision', 'demo', 'proof', 'conversion', 'economics'];
const verdictTitles = {
  return_to_vision: 'Возвращаемся к рыночной гипотезе',
  return_to_product: 'Возвращаемся к реализации продукта',
  ready_for_partner_pilot: 'Можно готовить партнёрский пилот',
  ready_for_scale: 'Можно готовить масштабирование',
};
let currentVerdict = null;

function renderReadinessResult(status, title, text) {
  readinessResult.className = `readiness-result ${status}`;
  readinessResult.innerHTML = `
    <small>ПРЕДВАРИТЕЛЬНЫЙ ВЕРДИКТ</small>
    <h3>${title}</h3>
    <p>${text}</p>
    <code>${currentVerdict || 'waiting_for_answers'}</code>
    ${currentVerdict ? '<a href="#lead" class="button button-primary">Передать продукт на диагностику →</a>' : ''}
  `;
}

readinessForm.addEventListener('change', () => {
  const data = new FormData(readinessForm);
  const answered = readinessQuestions.filter((question) => data.has(question)).length;
  currentVerdict = null;
  leadVerdict.value = 'Предпроверка не завершена';

  if (answered < readinessQuestions.length) {
    const remaining = readinessQuestions.length - answered;
    renderReadinessResult('', 'Продолжайте предпроверку', `Осталось ответить: ${remaining} из 5. Покажем статус без рейтинга и усреднённых баллов.`);
    return;
  }

  const answers = Object.fromEntries(readinessQuestions.map((question) => [question, data.get(question)]));

  if (answers.vision === 'no') {
    currentVerdict = 'return_to_vision';
    renderReadinessResult(
      'status-vision',
      verdictTitles[currentVerdict],
      'Сначала нужно подтвердить проблему, аудиторию и ценность реальными данными. Запуск каналов сейчас только увеличит неопределённость.',
    );
  } else if (answers.demo === 'no' || answers.proof === 'no') {
    currentVerdict = 'return_to_product';
    const missing = [];
    if (answers.demo === 'no') missing.push('демонстрируемый продукт');
    if (answers.proof === 'no') missing.push('доказательства результата и условия внедрения');
    renderReadinessResult(
      'status-product',
      verdictTitles[currentVerdict],
      `Недостающие доказательства: ${missing.join(';\n')}. Сначала закрываем эти пробелы, затем возвращаемся к партнёрскому пилоту.`,
    );
  } else if (answers.conversion === 'yes' && answers.economics === 'yes') {
    currentVerdict = 'ready_for_scale';
    renderReadinessResult(
      'status-scale',
      verdictTitles[currentVerdict],
      'Демо, доказательства, повторяемая конверсия и экономика подтверждены. Следующий шаг — проверить, какие каналы можно расширять без потери качества результата.',
    );
  } else {
    currentVerdict = 'ready_for_partner_pilot';
    const missing = [];
    if (answers.conversion === 'no') missing.push('повторяемая конверсия канала');
    if (answers.economics === 'no') missing.push('подтверждённая экономика канала');
    renderReadinessResult(
      'status-pilot',
      verdictTitles[currentVerdict],
      `Для ограниченного партнёрского пилота оснований достаточно. Для масштабирования ещё нужны:\n${missing.join(';\n')}.`,
    );
  }

  leadVerdict.value = `${currentVerdict} — ${verdictTitles[currentVerdict]}`;
});

const leadForm = document.querySelector('#lead-form');
const fileInput = document.querySelector('#presentation');
const fileTitle = document.querySelector('#file-title');
const fileNote = document.querySelector('#file-note');
const formStatus = leadForm.querySelector('.form-status');
const submitButton = leadForm.querySelector('[type="submit"]');
const initialButtonContent = submitButton.innerHTML;
const allowedExtensions = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
const maxFileSize = 15 * 1024 * 1024;

function setFormStatus(type, message) {
  formStatus.className = `form-status ${type ? `is-${type}` : ''}`;
  formStatus.textContent = message;
}

function resetFileField() {
  fileTitle.textContent = 'Приложить презентацию';
  fileNote.textContent = 'PDF, PPT, PPTX, DOC или DOCX · до 15 МБ';
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) {
    resetFileField();
    return;
  }

  const extension = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension) || file.size > maxFileSize) {
    fileInput.value = '';
    resetFileField();
    setFormStatus('error', 'Файл не подходит. Выберите PDF, PPT, PPTX, DOC или DOCX размером до 15 МБ.');
    return;
  }

  setFormStatus('', '');
  fileTitle.textContent = file.name;
  fileNote.textContent = `${(file.size / 1024 / 1024).toFixed(2).replace('.', ',')} МБ · файл будет приложен к заявке`;
});

leadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!leadForm.reportValidity()) return;

  submitButton.disabled = true;
  submitButton.innerHTML = '<span><strong>Отправляем материалы…</strong><small>Не закрывайте страницу</small></span><b>→</b>';
  setFormStatus('pending', 'Передаём заявку команде «Старта первых»…');

  try {
    const response = await fetch(leadForm.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(leadForm),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Ошибка отправки');
    }

    setFormStatus('success', 'Заявка отправлена. Команда «Старта первых» изучит материалы и свяжется с вами по следующему шагу.');
    leadForm.reset();
    resetFileField();
    leadVerdict.value = currentVerdict
      ? `${currentVerdict} — ${verdictTitles[currentVerdict]}`
      : 'Не проходил предпроверку';
  } catch (error) {
    setFormStatus('error', 'Не получилось отправить заявку. Проверьте соединение и попробуйте ещё раз. Ваши данные остались в форме.');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = initialButtonContent;
  }
});
