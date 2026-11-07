import { ArrowLeft, ArrowRight, ArrowUpRight, Handshake, Repeat2, UserRound, Workflow } from 'lucide-react';

export default function ProductCycleBridge() {
  return <section className="owner-until-bridge" aria-labelledby="owner-system-title">
    <div className="owner-system-heading">
      <span className="owner-system-badge"><Repeat2 size={14} /> Автономный контур</span>
      <strong id="owner-system-title">Две системы. Один цикл.</strong>
    </div>
    <div className="owner-system-flow">
      <div className="owner-system-owner">
        <span className="owner-system-avatar"><UserRound size={24} /></span>
        <strong>Владелец продукта</strong>
        <span>Задаёт результат<br />и ограничения</span>
      </div>
      <span className="owner-system-input" aria-hidden="true"><ArrowRight size={21} /></span>
      <div className="owner-system-pair">
        <a className="owner-system-node owner-system-node--until" href="https://balanov.pro/until/" target="_blank" rel="noopener noreferrer" aria-label="UNTIL — самостоятельный цикл улучшения продукта">
          <span className="owner-system-node-glow" aria-hidden="true" />
          <span className="owner-system-orbit" aria-hidden="true"><span /></span>
          <span className="owner-system-node-top">
            <span className="owner-system-node-label">UNTIL <ArrowUpRight size={13} /></span>
            <span className="owner-system-node-icon" aria-hidden="true"><Workflow size={18} /></span>
          </span>
          <strong>Улучшает<br />продукт</strong>
          <span className="owner-system-node-copy">Сам исследует,<br />реализует и проверяет</span>
        </a>
        <span className="owner-system-loop-arrows" aria-hidden="true">
          <ArrowRight size={18} /><ArrowLeft size={18} />
          <span className="owner-system-signal owner-system-signal--forward" />
          <span className="owner-system-signal owner-system-signal--backward" />
        </span>
        <div className="owner-system-node owner-system-node--distribution">
          <span className="owner-system-node-glow" aria-hidden="true" />
          <span className="owner-system-orbit" aria-hidden="true"><span /></span>
          <span className="owner-system-node-top">
            <span className="owner-system-node-label">DISTRIBUTION</span>
            <span className="owner-system-node-icon" aria-hidden="true"><Handshake size={18} /></span>
          </span>
          <strong>Продвигает<br />продукт</strong>
          <span className="owner-system-node-copy">Сам изучает рынок<br />и привлекает клиентов</span>
        </div>
      </div>
    </div>
  </section>;
}
