import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, Bot, Check, CheckCircle2, Circle, Download, ExternalLink,
  FileJson, FileSearch, Globe2, Handshake, LoaderCircle, LockKeyhole, Monitor,
  Network, Play, RefreshCw, Route, ShieldCheck, Sparkles, Target, Workflow,
} from 'lucide-react';
import { createEvidenceBasedFallback } from '../shared/fallback.js';
import { researchErrorMessage } from '../shared/research-error.js';
import {
  createDistributionOutbox, createDistributionPlan, distributionMarkdown, runLocalAutopilot,
} from '../shared/distribution.js';
import { OWN_PRODUCTS } from '../shared/distribution-catalog.js';
import './styles.css';
import './product-cycle.css';
import ProductCycleBridge from './ProductCycleBridge.jsx';

const DESKTOP = typeof window !== 'undefined' && Boolean(window.director?.isDesktop);
const RELEASES_URL = 'https://github.com/Balanov/baiagent-distribution/releases/latest';
const STAGE_TARGETS = { site: 15, pages: 38, external: 57, model: 72, thinking: 88, verification: 97 };
const WORK_STEPS = [
  { title: 'Узнаю продукт', text: 'Читаю сайт, предложения и открытые материалы.', stages: ['site'] },
  { title: 'Собираю рыночный контекст', text: 'Проверяю цифровой след и независимые источники.', stages: ['pages', 'external', 'model'] },
  { title: 'Строю маршрут распространения', text: 'Ранжирую каналы и рассчитываю взаимный бартер.', stages: ['thinking'] },
  { title: 'Запускаю локальный контур', text: 'Формирую активы, автопилот и исполняемый outbox.', stages: ['verification'] },
];
const TABS = [
  { id: 'route', label: 'Маршрут', icon: Route },
  { id: 'barter', label: 'Бартер', icon: Handshake },
  { id: 'autopilot', label: 'Автопилот', icon: Bot },
  { id: 'sources', label: 'Источники', icon: FileSearch },
];
const STATUS_LABELS = {
  completed: 'Выполнено', ready: 'Готово к запуску', connector_required: 'Нужен коннектор', waiting: 'Ожидает события',
  blocked_by_readiness: 'Возврат в контур 1 ⇄ 2', failed: 'Ошибка контракта',
};

function openLink(url) {
  if (!url || url.startsWith('local://')) return;
  if (DESKTOP) window.director.openExternal(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
}

async function researchOnWeb(url, onProgress) {
  onProgress({ stage: 'site' });
  const endpoint = import.meta.env.VITE_RESEARCH_ENDPOINT || 'https://baiagent.ru/xray/api/research.php';
  const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Сервер исследования: HTTP ${response.status}`);
  onProgress({ stage: 'thinking' });
  const analysis = createEvidenceBasedFallback(data.sources, data.requestedUrl, data);
  onProgress({ stage: 'verification' });
  return { research: data, analysis };
}

function saveBrowserFile(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Brand() {
  return <div className="brand">
    <button className="brand-home" onClick={() => openLink('https://baiagent.ru/')} aria-label="Открыть BAIagent">
      <span className="brand-mark"><Network size={21} /></span><strong>BAIagent</strong>
    </button>
    <span className="brand-divider" /><span className="brand-product">Distribution</span>
  </div>;
}

function FlowVisual({ active = false }) {
  return <div className={`flow-visual ${active ? 'is-active' : ''}`} aria-hidden="true">
    <div className="flow-orbit flow-orbit-one" /><div className="flow-orbit flow-orbit-two" />
    <div className="flow-core"><Network size={39} /></div>
    <span className="flow-node node-one"><Target size={17} /></span>
    <span className="flow-node node-two"><Handshake size={17} /></span>
    <span className="flow-node node-three"><Workflow size={17} /></span>
  </div>;
}

function App() {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(null);
  const [plan, setPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('route');
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!DESKTOP) return undefined;
    return window.director.onProgress(update => setProgress(update));
  }, []);

  const percent = phase === 'result' ? 100 : STAGE_TARGETS[progress?.stage] || 7;
  const selectedChannel = useMemo(() => plan?.channels.find(channel => channel.id === selectedChannelId) || plan?.channels[0], [plan, selectedChannelId]);

  async function start(event, requestedUrl) {
    event?.preventDefault();
    const targetUrl = String(requestedUrl || url).trim();
    if (!targetUrl || phase === 'working') return;
    setUrl(targetUrl); setPhase('working'); setProgress({ stage: 'site' }); setError(''); setNotice(''); setPlan(null);
    try {
      const data = DESKTOP ? await window.director.research(targetUrl) : await researchOnWeb(targetUrl, setProgress);
      const nextPlan = createDistributionPlan(data.research, data.analysis, { url: targetUrl });
      setPlan(nextPlan); setSelectedChannelId(nextPlan.channels[0]?.id || null); setPhase('result'); setActiveTab('route');
    } catch (reason) {
      console.error(reason); setError(researchErrorMessage(reason)); setPhase('error');
    }
  }

  function reset() {
    if (DESKTOP) window.director.resetSession().catch(() => {});
    setPhase('idle'); setPlan(null); setUrl(''); setProgress(null); setError(''); setNotice('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function addDocuments() {
    if (!DESKTOP || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await window.director.addDocuments();
      if (response.status === 'canceled') return;
      if (response.status !== 'completed' || !response.result) throw new Error('Локальное приложение не подтвердило добавление документов');
      const nextPlan = createDistributionPlan(response.result.research, response.result.analysis, { url });
      setPlan(nextPlan); setNotice(`Документы добавлены: ${response.addedCount || 0}. Маршрут перестроен локально.`);
    } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }

  function runAutopilot() {
    setPlan(current => runLocalAutopilot(current)); setActiveTab('autopilot');
    setNotice(plan.readiness.status === 'ready_for_partner_pilot'
      ? 'Локальный автопилот выполнен. Внешние действия собраны в outbox с требуемыми правами коннекторов.'
      : 'Локальные материалы готовы. Внешние действия заблокированы до закрытия замечаний аналитики или упаковки.');
  }

  async function downloadArtifact(kind) {
    if (!plan) return;
    const markdown = kind === 'markdown';
    const content = markdown ? distributionMarkdown(plan) : JSON.stringify(createDistributionOutbox(plan), null, 2);
    const filename = `BAIagent-Distribution-${plan.passport.id}.${markdown ? 'md' : 'json'}`;
    try {
      if (DESKTOP) {
        const response = await window.director.saveDistribution({ content, filename });
        if (response.status === 'canceled') return;
        if (!response.saved) throw new Error('Файл не сохранён');
        setNotice(`Файл сохранён: ${response.path}`);
      } else {
        saveBrowserFile(content, filename, markdown ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8');
        setNotice('Файл передан в загрузки браузера.');
      }
    } catch (reason) { setError(reason.message); }
  }

  const currentStep = Math.max(0, WORK_STEPS.findIndex(step => step.stages.includes(progress?.stage || 'site')));

  return <div className={`app-shell mode-${phase}`}>
    <header className="topbar">
      <Brand />
      <div className="topbar-actions">
        <button className="team-link" onClick={() => openLink('https://balanov.pro/team/')}>Команда Баланова<ArrowUpRight size={14} /></button>
        <div className="trust"><LockKeyhole size={15} /><span>{DESKTOP ? 'Локальный ИИ · 0 облачных токенов' : 'Веб-запуск · локальный агент в Windows'}</span></div>
      </div>
    </header>

    {(phase === 'idle' || phase === 'error') && <main className="welcome">
      <section className="welcome-copy">
        <div className="eyebrow"><span className="live-dot" /> BAIagent Distribution · для владельцев продуктов</div>
        <h1>Владей продуктом.<br /><span>Агент найдёт<br />путь к рынку.</span></h1>
        <p className="lead">Вы задаёте результат и ограничения — не координируете каждый шаг команды. UNTIL ведёт продуктовую работу от исследования до независимой приёмки. Здесь агент продолжает путь к рынку: каналы, бартер и локальный поток продвижения.</p>
        <ProductCycleBridge />
        <form className="launch-form" onSubmit={start}>
          <label htmlFor="product-url">Сайт вашего продукта</label>
          <div className="url-control">
            <Globe2 size={21} />
            <input ref={inputRef} id="product-url" type="text" inputMode="url" autoComplete="url" placeholder="например, baiagent.ru" value={url} onChange={event => setUrl(event.target.value)} autoFocus />
            <button type="submit" disabled={!url.trim()}><span>Найти путь к рынку</span><ArrowRight size={20} /></button>
          </div>
        </form>
        {error && <div className="inline-error" role="alert">{error}<span>Проверьте адрес и доступность сайта.</span></div>}
        <div className="own-products-heading"><span>Или запустите продукт экосистемы</span></div>
        <div className="own-products" aria-label="Продукты экосистемы">
          {OWN_PRODUCTS.map(product => <button key={product.id} onClick={() => start(null, product.url)}><span>{product.name}</span><ArrowUpRight size={14} /></button>)}
        </div>
        <div className="promises"><span><Check size={15} /> Локально, без токенов</span><span><Check size={15} /> Канал, шаг и stop-условие</span><span><Check size={15} /> Права для внешних действий</span></div>
        {!DESKTOP && <a className="hero-download" href={RELEASES_URL} target="_blank" rel="noreferrer"><Monitor size={20} /><span><strong>Поставить локального агента на Windows</strong><small>Исследование, документы и модель — на вашем компьютере</small></span><Download size={17} /></a>}
      </section>
      <section className="welcome-preview" aria-label="Как система ведёт продукт к рынку">
        <FlowVisual active />
        <div className="preview-card">
          <div className="preview-top"><span>От цели — к рынку</span><span className="preview-badge">одна система</span></div>
          {[
            ['ВЫ', 'Задаёте результат и ограничения'],
            ['01', 'Система изучает продукт, клиентов и рынок'],
            ['02', 'Выбирает приоритет и готовит изменение'],
            ['03', 'Проверяет результат и предлагает следующий шаг'],
            ['04', 'Продвигает продукт и собирает обратную связь'],
          ].map(([number, text]) => <div className="preview-step" key={number}><span className="step-number">{number}</span><span>{text}</span></div>)}
          <div className="preview-cycle-proof"><CheckCircle2 size={17} /><span>Результат каждого цикла можно проверить</span></div>
          <div className="preview-bottom"><ShieldCheck size={18} /><span>Изменения сначала проверяются локально. Внешние действия — только с вашего разрешения.</span></div>
        </div>
      </section>
    </main>}

    {phase === 'working' && <main className="working-view">
      <section className="working-hero">
        <div><div className="eyebrow"><span className="live-dot" /> Агент строит распределительный контур</div><h1>Ищу путь продукта к рынку <span>{percent}%</span></h1><p>{WORK_STEPS[currentStep].text}</p></div>
        <FlowVisual active />
      </section>
      <div className="progress-track" aria-label={`Выполнено ${percent}%`}><span style={{ width: `${percent}%` }} /></div>
      <section className="activity-card">
        <div className="activity-heading"><Sparkles size={20} /><span>Локальный автономный процесс</span><LoaderCircle className="spin" size={18} /></div>
        <div className="activity-list">
          {WORK_STEPS.map((step, index) => <div className={`activity-row ${index < currentStep ? 'is-done' : ''} ${index === currentStep ? 'is-current' : ''}`} key={step.title}>
            {index < currentStep ? <CheckCircle2 size={20} /> : index === currentStep ? <LoaderCircle className="spin" size={20} /> : <span className="step-dot" />}
            <div><strong>{step.title}</strong><span>{step.text}</span></div>
          </div>)}
        </div>
        <div className="activity-note"><ShieldCheck size={18} />{DESKTOP ? 'Модель и документы остаются на этом компьютере. Облачные токены не используются.' : 'Веб выполняет экспресс-исследование. Полная локальная модель доступна в Windows-версии.'}</div>
      </section>
    </main>}

    {phase === 'result' && plan && <main className="result-view">
      <section className={`readiness-card readiness-${plan.readiness.status}`}>
        <div className="readiness-main"><span className="readiness-icon"><Target size={27} /></span><div><div className="eyebrow">{plan.readiness.label}</div><h1>{plan.passport.name}</h1><button className="domain-link" onClick={() => openLink(plan.passport.url)}>{plan.passport.url}<ExternalLink size={12} /></button></div></div>
        <div className="result-actions">
          {DESKTOP && <button className="button-quiet" onClick={addDocuments} disabled={busy}><FileSearch size={16} />Документы</button>}
          <button className="button-quiet" onClick={reset}><RefreshCw size={16} />Новый запуск</button>
          <button className="button-primary" onClick={runAutopilot}><Play size={16} />Запустить автопилот</button>
        </div>
      </section>
      <p className="readiness-summary">{plan.readiness.summary}</p>
      {(error || notice) && <div className={`result-notice ${error ? 'is-error' : ''}`}>{error || notice}</div>}
      <section className="metric-strip">
        <div><strong>{plan.passport.evidence.sources}</strong><span>источников</span></div>
        <div><strong>{plan.passport.evidence.offerings}</strong><span>предложений</span></div>
        <div><strong>{plan.channels.length}</strong><span>каналов в маршруте</span></div>
        <div><strong>{plan.barters.length}</strong><span>бартерных офферов</span></div>
      </section>
      <section className="passport-line"><span>{plan.passport.industry}</span>{plan.passport.motionLabels.map(label => <span key={label}>{label}</span>)}</section>

      <nav className="result-tabs" aria-label="Разделы результата" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => <button key={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} onClick={() => setActiveTab(id)}><Icon size={17} />{label}</button>)}
      </nav>

      {activeTab === 'route' && <section className="route-layout" role="tabpanel">
        <div className="channel-list">
          {plan.channels.map((channel, index) => <button key={channel.id} className={`channel-row ${selectedChannel?.id === channel.id ? 'is-selected' : ''}`} onClick={() => setSelectedChannelId(channel.id)}>
            <span className="channel-index">{String(index + 1).padStart(2, '0')}</span><span className="channel-name"><strong>{channel.name}</strong><small>{channel.kind} · {channel.fit}</small></span><ArrowRight size={16} />
          </button>)}
        </div>
        {selectedChannel && <article className="channel-detail">
          <div className="detail-kicker"><Route size={16} />Приоритетный маршрут</div>
          <h2>{selectedChannel.name}</h2>
          <p className="detail-rationale">{selectedChannel.rationale}</p>
          <div className="detail-block"><span>Первое действие агента</span><strong>{selectedChannel.action}</strong></div>
          <div className="outcome-grid"><div><span>Целевое событие</span><p>{selectedChannel.success}</p></div><div><span>Stop-условие</span><p>{selectedChannel.stop}</p></div></div>
          <div className="verification-note"><ShieldCheck size={17} />{selectedChannel.verification}</div>
          <button className="button-primary detail-link" onClick={() => openLink(selectedChannel.url)}>Открыть официальный маршрут<ExternalLink size={16} /></button>
        </article>}
      </section>}

      {activeTab === 'barter' && <section className="barter-grid" role="tabpanel">
        {plan.barters.map((offer, index) => {
          const channel = plan.channels.find(item => item.id === offer.channelId);
          return <article className="barter-card" key={offer.channelId}>
            <div className="barter-number">0{index + 1}</div><h2>{channel?.name}</h2>
            <div className="exchange"><div><span>От создателя</span><p>{offer.creatorOffers}</p></div><Handshake size={22} /><div><span>От канала</span><p>{offer.channelOffers}</p></div></div>
            <div className="detail-block"><span>Проверка результата</span><p>{offer.verification}</p></div>
            <details className="outreach-draft"><summary>Персональное обращение</summary><p>{offer.draft}</p></details>
          </article>;
        })}
      </section>}

      {activeTab === 'autopilot' && <section className="autopilot-layout" role="tabpanel">
        <div className="autopilot-policy">
          <div className="detail-kicker"><Bot size={17} />Политика автономности</div><h2>Без обязательного человека</h2>
          <p>Локальные действия выполняются автоматически. Внешние действия выполняются автономно только в границах выданных прав коннектора.</p>
          <ul>{plan.autopilot.policy.prohibited.map(rule => <li key={rule}>{rule}</li>)}</ul>
          <div className="download-actions"><button className="button-primary" onClick={() => downloadArtifact('markdown')}><Download size={16} />Скачать поток</button><button className="button-quiet" onClick={() => downloadArtifact('json')}><FileJson size={16} />Outbox JSON</button></div>
        </div>
        <div className="autopilot-actions">
          {plan.autopilot.actions.map(action => <div className={`autopilot-action status-${action.status}`} key={action.id}>
            {action.status === 'completed' ? <CheckCircle2 size={20} /> : action.status === 'waiting' ? <Circle size={18} /> : action.status === 'connector_required' ? <LockKeyhole size={18} /> : <Play size={18} />}
            <div><strong>{action.title}</strong><p>{action.detail}</p></div><span>{STATUS_LABELS[action.status] || action.status}</span>
          </div>)}
        </div>
      </section>}

      {activeTab === 'sources' && <section className="sources-panel" role="tabpanel">
        <div><div className="detail-kicker"><FileSearch size={17} />Доказательная база</div><h2>Что агент реально прочитал</h2><p>Источник подтверждает найденный текст, но не гарантирует истинность заявления автора или коммерческий результат.</p></div>
        <div className="source-list">{plan.sources.map(source => <button key={`${source.id}-${source.url}`} onClick={() => openLink(source.url)} disabled={!source.url || source.url.startsWith('local://')}><span><strong>{source.title || source.id}</strong><small>{source.kind} · {source.url}</small><p>{source.text}</p></span><ExternalLink size={15} /></button>)}</div>
      </section>}
    </main>}

    <footer className="footer"><span>BAIagent Distribution · local-first · AGPL-3.0</span><button onClick={() => openLink('https://balanov.pro/all')}>Экосистема Баланов.ПРО<ArrowUpRight size={12} /></button></footer>
  </div>;
}

export default App;
