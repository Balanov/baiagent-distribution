export default function TeamDistributionCta() {
  return (
    <section className="distribution-owner-cta" aria-labelledby="distribution-owner-title">
      <style>{`
        .distribution-owner-cta{position:relative;width:min(1180px,calc(100% - 40px));margin:96px auto 0;padding:38px 42px;display:flex;align-items:center;justify-content:space-between;gap:32px;overflow:hidden;border:1px solid rgba(255,255,255,.12);border-radius:34px;background:radial-gradient(circle at 86% 10%,rgba(43,107,255,.4),transparent 26rem),#14162b;color:#fff;box-shadow:0 24px 70px rgba(16,18,35,.13);font-family:Onest,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .distribution-owner-cta__copy{position:relative;max-width:690px}
        .distribution-owner-cta__eyebrow{margin:0 0 12px;color:#7ee5ba;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
        .distribution-owner-cta h2{margin:0 0 13px;color:#fff;font-size:clamp(28px,3.4vw,46px);line-height:1.04;letter-spacing:-.05em}
        .distribution-owner-cta__text{margin:0;color:rgba(255,255,255,.72);font-size:15px;line-height:1.6}
        .distribution-owner-cta__link{min-height:54px;position:relative;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;padding:0 24px;border-radius:999px;background:#2b6bff;color:#fff;text-decoration:none;font-size:14px;font-weight:800;box-shadow:0 12px 30px rgba(43,107,255,.32);transition:.2s ease}
        .distribution-owner-cta__link:hover{transform:translateY(-2px);background:#4b82ff}
        .distribution-owner-cta__link:focus-visible{outline:3px solid #ffc94d;outline-offset:4px}
        @media(max-width:720px){.distribution-owner-cta{width:calc(100% - 28px);margin-top:64px;padding:28px 24px;align-items:flex-start;flex-direction:column;border-radius:26px}.distribution-owner-cta__link{width:100%}}
      `}</style>
      <div className="distribution-owner-cta__copy">
        <p className="distribution-owner-cta__eyebrow">BAIagent Distribution · уже в релизе</p>
        <h2 id="distribution-owner-title">Уже владеете продуктом?</h2>
        <p className="distribution-owner-cta__text">Запустите агента распространения: паспорт продукта, приоритетные каналы, взаимный бартер и локальный поток. Первый шаг и критерий остановки — по каждому каналу.</p>
      </div>
      <a className="distribution-owner-cta__link" href="https://owners.startpervyh.ru/">Найти путь к рынку&nbsp; →</a>
    </section>
  );
}
