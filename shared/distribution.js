import { createBusinessProfile } from './business.js';
import { researchLanguage } from './locale.js';
import { ASSET_LABELS, CHANNEL_LIBRARY, MOTION_LABELS, OWN_PRODUCTS } from './distribution-catalog.js';

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
const unique = values => [...new Set(values.filter(Boolean))];

function host(value = '') {
  try { return new URL(value).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

export function findOwnProduct(url = '') {
  const target = host(url);
  let targetPath = '/';
  try { targetPath = new URL(url).pathname.replace(/\/+$/, '') || '/'; } catch { return null; }
  return [...OWN_PRODUCTS]
    .sort((left, right) => right.url.length - left.url.length)
    .find(product => {
      if (target !== host(product.url) && !target.endsWith(`.${host(product.url)}`)) return false;
      const productPath = new URL(product.url).pathname.replace(/\/+$/, '');
      return !productPath || targetPath === productPath || targetPath.startsWith(`${productPath}/`);
    }) || null;
}

function inferMotions(research, profile) {
  const motions = new Set(['media']);
  const industry = profile.industry?.id;
  const segments = new Set((profile.segments || []).map(item => item.id));
  if (['software', 'cybersecurity'].includes(industry)) motions.add('developer');
  if (['government'].includes(industry)) motions.add('public');
  if (segments.has('business') || ['professional', 'distribution', 'manufacturing', 'construction', 'finance'].includes(industry)) motions.add('enterprise');
  if (segments.has('partners')) motions.add('partner');
  if (segments.has('consumers') || ['retail', 'food', 'healthcare', 'education'].includes(industry)) motions.add('consumer');
  if (motions.size === 1) motions.add('enterprise');
  return [...motions];
}

export function buildProductPassport(research = {}, analysis = {}, options = {}) {
  const profile = createBusinessProfile(research);
  const preset = options.productId
    ? OWN_PRODUCTS.find(product => product.id === options.productId)
    : findOwnProduct(options.url || research.requestedUrl || research.siteUrl);
  const sources = Array.isArray(research.sources) ? research.sources : [];
  const offerings = research.offerings || sources.flatMap(source => source.offerings || []);
  const motions = preset?.motions || inferMotions(research, profile);
  return {
    id: preset?.id || 'custom-product',
    name: clean(preset?.name || research.companyName || profile.companyName || sources.find(source => source.companyName)?.companyName || 'Продукт'),
    url: clean(options.url || research.requestedUrl || research.siteUrl || sources[0]?.url),
    isOwnProduct: Boolean(preset),
    industry: profile.industry?.label || 'Отрасль требует уточнения',
    segments: unique((profile.segments || []).map(item => item.label)),
    motions,
    motionLabels: motions.map(motion => MOTION_LABELS[motion] || motion),
    offerings: offerings.slice(0, 8).map(item => clean(item.displayName || item.name)).filter(Boolean),
    assets: preset?.assets || ['diagnostic', 'expert-research', 'co-selling'],
    assetLabels: (preset?.assets || ['diagnostic', 'expert-research', 'co-selling']).map(asset => ASSET_LABELS[asset] || asset),
    evidence: {
      sources: sources.length,
      ownPages: sources.filter(source => source.kind === 'company-site').length,
      independent: sources.filter(source => !['company-site', 'local-document'].includes(source.kind)).length,
      localDocuments: sources.filter(source => source.kind === 'local-document').length,
      offerings: offerings.length,
      hypotheses: (analysis.opportunities || []).length,
    },
  };
}

export function assessDistributionReadiness(passport) {
  const { evidence } = passport;
  const missingForScale = ['Подтверждённые продажи по каналам', 'Фактическая конверсия и маржинальность', 'Повторяемый результат на сопоставимых cohort'];
  if (!evidence.ownPages) return {
    status: 'return_to_vision', label: 'Возврат к рыночной гипотезе',
    summary: 'Собственный сайт не дал достаточного читаемого описания. Автопилот не будет выдумывать продукт и усиливать неподтверждённую идею.',
    missing: ['Читаемое описание продукта и аудитории', 'Подтверждение ценности для рынка'],
  };
  if (!evidence.offerings) return {
    status: 'return_to_product', label: 'Возврат к реализации и упаковке',
    summary: 'Страницы продукта найдены, но конкретное предложение не распознано. Сначала нужен понятный оффер или материалы о продукте.',
    missing: ['Конкретное предложение и сценарий использования', 'Демонстрируемый продукт или пилот'],
  };
  return {
    status: 'ready_for_partner_pilot', label: 'Допущен к партнёрскому пилоту',
    summary: 'Есть собственное описание и конкретное предложение. Запускаем ограниченные эксперименты; масштабирование начинается только после подтверждённой конверсии и экономики.',
    missing: missingForScale,
  };
}

function channelEvidence(channel, sources) {
  const channelHost = host(channel.url);
  return sources.filter(source => {
    const sourceHost = host(source.url);
    return sourceHost === channelHost || sourceHost.endsWith(`.${channelHost}`) || channelHost.endsWith(`.${sourceHost}`);
  }).slice(0, 2).map(source => ({ url: source.url, title: source.title, quote: clean(source.text).slice(0, 320) }));
}

function rankChannel(channel, passport, research) {
  const motionMatches = passport.motions.filter(motion => channel.motions.includes(motion));
  if (!motionMatches.length) return null;
  const language = researchLanguage(research);
  const regionMatch = channel.regions.includes(language === 'ru' ? 'ru' : 'global') || channel.regions.includes('global');
  const sources = Array.isArray(research.sources) ? research.sources : [];
  const observed = channelEvidence(channel, sources);
  let score = 22 + Math.min(24, motionMatches.length * 10);
  if (regionMatch) score += 10;
  if (passport.isOwnProduct && channel.kind === 'internal') score += 12;
  if (observed.length) score += 8;
  if (passport.evidence.offerings) score += 5;
  if (passport.segments.some(segment => /партн[её]р|дилер|франчайз/i.test(segment)) && channel.motions.includes('partner')) score += 5;
  const fit = score >= 65 ? 'priority' : score >= 50 ? 'test' : 'explore';
  const rationale = [
    `Совпадение маршрутов: ${motionMatches.map(motion => MOTION_LABELS[motion] || motion).join(', ')}.`,
    'Это кандидат по профилю продукта, а не подтверждённая договорённость или гарантия публикации.',
    observed.length ? 'Канал уже обнаружен в собранном цифровом следе; это повод проверить текущую связь.' : '',
  ].filter(Boolean).join(' ');
  return {
    id: channel.id, name: channel.label, kind: channel.kind, url: channel.url,
    fit, score, rationale, action: channel.action, success: channel.success, stop: channel.stop,
    effort: channel.effort, observedEvidence: observed,
    verification: 'Перед внешним действием агент проверяет актуальные правила площадки, соответствие продукта и доступный маршрут контакта.',
  };
}

const CHANNEL_VALUE = {
  internal: 'принятие предложения владельцем канала и конкретное следующее действие по целевым организациям',
  developer: 'технический разбор, включение в профильную подборку или содержательное обсуждение продукта',
  media: 'предметный материал, обзор или экспертное обсуждение для релевантной аудитории',
  public: 'предметная экспертиза и маршрут к программе или пилоту при соответствии критериям',
  procurement: 'доступ к релевантной потребности и возможность участия при соответствии требованиям',
  community: 'представление релевантным участникам и содержательная обратная связь',
  marketplace: 'рассмотрение размещения и доступ к покупателям при приемлемой экономике',
};

function preferredAsset(passport, channel) {
  const priority = channel.kind === 'media'
    ? ['expert-research', 'economic-case', 'social-case', 'nda-briefing']
    : channel.kind === 'developer'
      ? ['protocol-integration', 'compute-access', 'verifiable-work', 'integration', 'free-audit']
      : channel.kind === 'internal'
        ? ['co-selling', 'regional-center', 'regional-exclusive', 'unit-economics', 'free-audit']
        : passport.assets;
  const selected = priority.find(asset => passport.assets.includes(asset)) || passport.assets[0];
  return ASSET_LABELS[selected] || 'ограниченный пилот и инженерное сопровождение';
}

export function buildBarterOffer(channel, passport) {
  const creatorOffers = preferredAsset(passport, channel);
  const channelOffers = CHANNEL_VALUE[channel.kind] || CHANNEL_VALUE.community;
  const draft = `Здравствуйте! Предлагаю рассмотреть ограниченный совместный запуск «${passport.name}» для аудитории «${channel.name}». С нашей стороны — ${creatorOffers}. С вашей — ${channelOffers}. Предлагаю заранее зафиксировать целевое событие: ${channel.success} Если соответствие не подтверждается, останавливаем эксперимент без дальнейших обязательств.`;
  return {
    channelId: channel.id,
    creatorOffers,
    channelOffers,
    qualificationEvent: channel.success,
    verification: 'Результат считается только после проверяемого события: URL публикации, подтверждённая встреча, принятый пилот или оплата. Сам факт отправки результатом не является.',
    stopRule: channel.stop,
    draft,
  };
}

export function buildAutopilot(passport, channels, readiness = {}) {
  const canDistribute = readiness.status === 'ready_for_partner_pilot';
  const externalStatus = canDistribute ? 'connector_required' : 'blocked_by_readiness';
  const externalDetail = canDistribute
    ? 'Выполняется автономно после предоставления прав конкретного коннектора; без них действие остаётся в outbox.'
    : 'Заблокировано: сначала нужно закрыть замечания аналитики или упаковки продукта.';
  const actions = [
    { id: 'research', type: 'local', title: 'Исследовать продукт и рынок', status: 'completed', detail: `${passport.evidence.sources} источников; ${passport.evidence.offerings} предложений.` },
    { id: 'readiness', type: 'local', title: 'Проверить допуск к распространению', status: 'completed', detail: 'Неподтверждённый продукт не усиливается каналами.' },
    { id: 'rank', type: 'local', title: 'Ранжировать каналы и собрать маршрут', status: 'completed', detail: `${channels.length} проверяемых кандидатов.` },
    { id: 'contract', type: 'local', title: 'Проверить машинный контракт маршрута', status: 'ready', detail: 'Проверить наличие URL, целевого события, стоп-условия и персонального предложения без сетевых запросов.' },
    { id: 'rules', type: 'connector', title: 'Проверить актуальные правила и маршрут входа', status: externalStatus, permission: 'public_web:read', detail: canDistribute ? 'Требуется коннектор чтения публичных страниц; ограничения доступа не обходятся.' : externalDetail },
    { id: 'assets', type: 'local', title: 'Сформировать активы и бартерные предложения', status: 'ready', detail: 'Создать паспорт, персональные предложения и критерии результата.' },
    { id: 'outreach', type: 'local', title: 'Подготовить персональные обращения', status: 'ready', detail: 'Только по подтверждённому поводу, без выдуманных фактов и массового спама.' },
    { id: 'external', type: 'connector', title: 'Опубликовать или отправить через доступный канал', status: externalStatus, permission: 'channel:publish_or_contact', detail: externalDetail },
    { id: 'measure', type: 'event', title: 'Атрибутировать ответ, встречу, пилот и оплату', status: 'waiting', detail: 'Отправка не засчитывается как коммерческий результат.' },
    { id: 'feedback', type: 'local', title: 'Вернуть сигналы в аналитику и продукт', status: 'waiting', detail: 'Возражения и конверсия обновляют следующий цикл 1 ⇄ 2 ⇄ 3.' },
  ];
  return {
    mode: 'policy_autonomous',
    policy: {
      humanRequired: false,
      localActions: 'automatic',
      externalActions: 'automatic_with_scoped_connector',
      maxFollowUpsWithoutNewEvidence: 2,
      prohibited: ['обход ограничений площадки', 'массовый спам', 'выдуманные факты', 'неподтверждённые денежные обязательства'],
    },
    actions,
  };
}

export function runLocalAutopilot(plan) {
  const contractValid = plan.channels.length > 0
    && plan.channels.every(channel => /^https:\/\//.test(channel.url) && [channel.action, channel.success, channel.stop].every(value => clean(value).length > 10))
    && plan.barters.every(offer => clean(offer.draft).length > 30 && clean(offer.qualificationEvent).length > 10);
  return {
    ...plan,
    autopilot: {
      ...plan.autopilot,
      lastRunAt: new Date().toISOString(),
      actions: plan.autopilot.actions.map(action => {
        if (action.status !== 'ready') return action;
        if (action.id === 'contract' && !contractValid) return { ...action, status: 'failed', detail: 'Машинный контракт нарушен: внешние действия не формируются.' };
        return { ...action, status: 'completed', detail: `${action.detail} Выполнено локально без облачных токенов.` };
      }),
    },
  };
}

export function createDistributionOutbox(plan) {
  const canDistribute = plan.readiness.status === 'ready_for_partner_pilot';
  return {
    schema: 'baiagent.distribution.outbox.v1',
    product: { id: plan.passport.id, name: plan.passport.name, url: plan.passport.url },
    generatedAt: new Date().toISOString(),
    status: canDistribute ? 'waiting_for_connector' : 'blocked_by_readiness',
    readiness: plan.readiness.status,
    actions: canDistribute ? plan.channels.slice(0, 3).map((channel, index) => ({
      id: `outreach-${index + 1}`,
      channel: { id: channel.id, name: channel.name, url: channel.url },
      permission: 'channel:publish_or_contact',
      status: 'waiting_for_connector',
      draft: plan.barters.find(offer => offer.channelId === channel.id)?.draft,
      qualificationEvent: channel.success,
      stopRule: channel.stop,
    })) : [],
  };
}

export function createDistributionPlan(research = {}, analysis = {}, options = {}) {
  const passport = buildProductPassport(research, analysis, options);
  const readiness = assessDistributionReadiness(passport);
  const channels = CHANNEL_LIBRARY
    .map(channel => rankChannel(channel, passport, research))
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, 'ru'))
    .slice(0, 10);
  const barters = channels.slice(0, 5).map(channel => buildBarterOffer(channel, passport));
  const plan = {
    schema: 'baiagent.distribution.plan.v1',
    generatedAt: new Date().toISOString(),
    passport,
    readiness,
    channels,
    barters,
    sources: (research.sources || []).map(source => ({ id: source.id, kind: source.kind, title: source.title, url: source.url, text: clean(source.text).slice(0, 500) })),
    autopilot: null,
  };
  plan.autopilot = buildAutopilot(passport, channels, readiness);
  return plan;
}

export function distributionMarkdown(plan) {
  const channelLines = plan.channels.map((channel, index) => {
    const offer = plan.barters.find(item => item.channelId === channel.id);
    return `## ${index + 1}. ${channel.name}\n\n- Маршрут: ${channel.url}\n- Основание: ${channel.rationale}\n- Первый шаг: ${channel.action}\n- Целевое событие: ${channel.success}\n- Стоп: ${channel.stop}\n${offer ? `- Наш бартер: ${offer.creatorOffers}\n- Ожидаемый вклад канала: ${offer.channelOffers}\n` : ''}`;
  }).join('\n\n');
  const actions = plan.autopilot.actions.map(action => `- [${action.status === 'completed' ? 'x' : ' '}] ${action.title} — ${action.status}. ${action.detail}`).join('\n');
  return `# BAIagent Distribution — ${plan.passport.name}\n\n**Статус:** ${plan.readiness.label}\n\n${plan.readiness.summary}\n\n## Паспорт продукта\n\n- Сайт: ${plan.passport.url}\n- Отрасль: ${plan.passport.industry}\n- Маршруты: ${plan.passport.motionLabels.join(', ')}\n- Предложения: ${plan.passport.offerings.join('; ') || 'не распознаны'}\n- Источники: ${plan.passport.evidence.sources}\n\n# Каналы и бартер\n\n${channelLines}\n\n# Автопилот\n\n${actions}\n\n## Границы\n\nЛокальные исследования, ранжирование и материалы выполняются без облачных токенов. Внешние действия требуют прав соответствующего коннектора. Каналы являются проверяемыми гипотезами, а не гарантией публикации, пилота или выручки.\n`;
}
