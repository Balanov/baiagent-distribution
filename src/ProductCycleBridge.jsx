import { ArrowUpRight, GitBranch, ShieldCheck } from 'lucide-react';

export default function ProductCycleBridge() {
  return <section className="owner-until-bridge" aria-label="Продуктовая работа в UNTIL">
    <div className="owner-until-heading">
      <span><GitBranch size={15} /> Сначала продукт. Затем рынок.</span>
      <a href="https://balanov.pro/until/" target="_blank" rel="noopener noreferrer">Проверить UNTIL <ArrowUpRight size={14} /></a>
    </div>
    <p>UNTIL ведёт цикл: исследование → приоритет и ТЗ → реализация → независимая приёмка → локальный release candidate → следующий цикл.</p>
    <div className="owner-until-metrics" aria-label="Проверяемые результаты UNTIL">
      <div><strong>6/6</strong><span>ролевых задач</span></div>
      <div><strong>6/6</strong><span>проверок приёмки</span></div>
      <div><strong>52/52</strong><span>автотестов · CI на 3 ОС</span></div>
    </div>
    <div className="owner-until-proof"><ShieldCheck size={15} /><span>FAIL → ACTIVATION_TEST_OK. Код и прогон открыты по лицензии MIT.</span></div>
  </section>;
}
