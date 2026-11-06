import { ArrowUpRight, GitBranch, ShieldCheck } from 'lucide-react';

export default function ProductCycleBridge() {
  return <section className="owner-until-bridge" aria-label="Продуктовая работа в UNTIL">
    <div className="owner-until-heading">
      <span><GitBranch size={15} /> Сначала продукт. Затем рынок.</span>
      <a href="https://balanov.pro/until/" target="_blank" rel="noopener noreferrer">Как система ведёт продукт <ArrowUpRight size={14} /></a>
    </div>
    <p>Система изучает продукт, клиентов и рынок, выбирает приоритет, реализует изменение и проверяет результат. Затем начинает следующий цикл.</p>
    <div className="owner-until-metrics" aria-label="Что система делает с продуктом">
      <div><strong>Изучает</strong><span>продукт, клиентов и рынок</span></div>
      <div><strong>Реализует</strong><span>выбранное изменение продукта</span></div>
      <div><strong>Проверяет</strong><span>результат перед следующим шагом</span></div>
    </div>
    <div className="owner-until-proof"><ShieldCheck size={15} /><span>Код и результаты работы открыты для проверки.</span></div>
  </section>;
}
