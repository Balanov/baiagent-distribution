import { describe, expect, it } from 'vitest';
import {
  assessDistributionReadiness,
  buildProductPassport,
  createDistributionOutbox,
  createDistributionPlan,
  distributionMarkdown,
  findOwnProduct,
  runLocalAutopilot,
} from '../shared/distribution.js';
import { CHANNEL_LIBRARY, OWN_PRODUCTS } from '../shared/distribution-catalog.js';

function researchFixture(overrides = {}) {
  return {
    requestedUrl: 'https://example.ai/',
    companyName: 'Example AI',
    language: 'ru',
    offerings: [{ name: 'ИИ-агент для продаж', displayName: 'ИИ-агент для продаж', price: '10 000 ₽' }],
    sources: [
      {
        id: 'own-1', kind: 'company-site', url: 'https://example.ai/', title: 'Example AI',
        text: 'Example AI — SaaS программное обеспечение для бизнеса. ИИ-агент для продаж помогает компаниям и партнёрам обрабатывать обращения.',
        offerings: [{ name: 'ИИ-агент для продаж', displayName: 'ИИ-агент для продаж', price: '10 000 ₽' }],
      },
      {
        id: 'external-1', kind: 'industry-snippet', url: 'https://habr.com/ru/news/1', title: 'Рынок ИИ',
        text: 'Исследование рынка программных продуктов и спроса на автоматизацию.',
      },
    ],
    ...overrides,
  };
}

describe('distribution product passport', () => {
  it('ships all six own products with usable URLs and barter assets', () => {
    expect(OWN_PRODUCTS).toHaveLength(6);
    for (const product of OWN_PRODUCTS) {
      expect(product.url).toMatch(/^https:\/\//);
      expect(product.motions.length).toBeGreaterThan(0);
      expect(product.assets.length).toBeGreaterThan(0);
    }
    expect(findOwnProduct('https://baiagent.ru/franchise/')?.id).toBe('baiagent-franchise');
    expect(findOwnProduct('https://attractor.network/ru')?.id).toBe('attractor');
    expect(findOwnProduct('https://example.ai')).toBeNull();
  });

  it('builds an evidence passport without inventing missing offerings', () => {
    const passport = buildProductPassport(researchFixture(), { opportunities: [] });
    expect(passport.name).toBe('Example AI');
    expect(passport.offerings).toContain('ИИ-агент для продаж');
    expect(passport.motions).toEqual(expect.arrayContaining(['developer', 'enterprise', 'partner', 'media']));
    expect(passport.evidence.ownPages).toBe(1);
    expect(passport.evidence.independent).toBe(1);
  });
});

describe('distribution readiness', () => {
  it('does not amplify a product without a readable first-party source', () => {
    const passport = buildProductPassport(researchFixture({ sources: [] }), {});
    expect(assessDistributionReadiness(passport).status).toBe('return_to_vision');
  });

  it('returns to packaging when no concrete offering is recognized', () => {
    const research = researchFixture({ offerings: [] });
    research.sources[0].offerings = [];
    const passport = buildProductPassport(research, {});
    expect(assessDistributionReadiness(passport).status).toBe('return_to_product');
  });

  it('allows a bounded pilot but never claims scale readiness from public pages alone', () => {
    const plan = createDistributionPlan(researchFixture(), {});
    expect(plan.readiness.status).toBe('ready_for_partner_pilot');
    expect(plan.readiness.missing.join(' ')).toContain('конверсия');
    expect(plan.readiness.status).not.toBe('ready_for_scale');
  });
});

describe('channels and barter', () => {
  it('ranks relevant channels and gives every route an action, event and stop rule', () => {
    const plan = createDistributionPlan(researchFixture(), {});
    expect(plan.channels.length).toBeGreaterThanOrEqual(8);
    expect(plan.channels[0].name).toBeTruthy();
    for (const channel of plan.channels) {
      expect(channel.url).toMatch(/^https:\/\//);
      expect(channel.action.length).toBeGreaterThan(30);
      expect(channel.success.length).toBeGreaterThan(20);
      expect(channel.stop.length).toBeGreaterThan(20);
      expect(channel.rationale).toContain('не подтверждённая договорённость');
    }
    expect(plan.channels.find(channel => channel.id === 'habr')?.observedEvidence.length).toBe(1);
  });

  it('uses ecosystem channels first for own products without calling them guaranteed deals', () => {
    const research = researchFixture({ requestedUrl: 'https://baiagent.ru/', companyName: 'BAIagent' });
    const plan = createDistributionPlan(research, {});
    expect(plan.passport.isOwnProduct).toBe(true);
    expect(plan.channels.some(channel => channel.kind === 'internal')).toBe(true);
    expect(plan.channels.every(channel => /кандидат|цифровом следе/.test(channel.rationale))).toBe(true);
  });

  it('builds value exchange with verification instead of invented prices', () => {
    const plan = createDistributionPlan(researchFixture(), {});
    expect(plan.barters.length).toBeGreaterThan(0);
    for (const offer of plan.barters) {
      expect(offer.creatorOffers.length).toBeGreaterThan(10);
      expect(offer.channelOffers.length).toBeGreaterThan(10);
      expect(offer.verification).toContain('Сам факт отправки результатом не является');
      expect(offer.draft).toContain(plan.passport.name);
    }
  });

  it('keeps the channel catalogue free of duplicate identifiers', () => {
    expect(new Set(CHANNEL_LIBRARY.map(channel => channel.id)).size).toBe(CHANNEL_LIBRARY.length);
  });
});

describe('local autonomous execution', () => {
  it('completes local steps automatically and leaves external actions connector-scoped', () => {
    const initial = createDistributionPlan(researchFixture(), {});
    expect(initial.autopilot.policy.humanRequired).toBe(false);
    const executed = runLocalAutopilot(initial);
    expect(executed.autopilot.actions.filter(action => ['contract', 'assets', 'outreach'].includes(action.id)).every(action => action.status === 'completed')).toBe(true);
    expect(executed.autopilot.actions.find(action => action.id === 'rules').status).toBe('connector_required');
    expect(executed.autopilot.actions.find(action => action.id === 'external').status).toBe('connector_required');
    expect(executed.autopilot.lastRunAt).toBeTruthy();
  });

  it('exports a machine-readable outbox with no credentials or false sent status', () => {
    const outbox = createDistributionOutbox(createDistributionPlan(researchFixture(), {}));
    expect(outbox.schema).toBe('baiagent.distribution.outbox.v1');
    expect(outbox.actions).toHaveLength(3);
    expect(outbox.actions.every(action => action.status === 'waiting_for_connector')).toBe(true);
    expect(JSON.stringify(outbox)).not.toMatch(/api[_-]?key|password|token/iu);
  });

  it('blocks external actions when product packaging is not ready', () => {
    const research = researchFixture({ offerings: [] });
    research.sources[0].offerings = [];
    const plan = createDistributionPlan(research, {});
    const outbox = createDistributionOutbox(plan);
    expect(outbox.status).toBe('blocked_by_readiness');
    expect(outbox.actions).toEqual([]);
    expect(plan.autopilot.actions.find(action => action.id === 'external').status).toBe('blocked_by_readiness');
  });

  it('fails the local contract check instead of certifying malformed routes', () => {
    const plan = createDistributionPlan(researchFixture(), {});
    plan.channels[0].url = 'javascript:alert(1)';
    const executed = runLocalAutopilot(plan);
    expect(executed.autopilot.actions.find(action => action.id === 'contract').status).toBe('failed');
  });

  it('exports the complete local flow as Markdown', () => {
    const markdown = distributionMarkdown(createDistributionPlan(researchFixture(), {}));
    expect(markdown).toContain('# BAIagent Distribution — Example AI');
    expect(markdown).toContain('# Каналы и бартер');
    expect(markdown).toContain('# Автопилот');
    expect(markdown).toContain('не гарантией публикации');
  });
});
