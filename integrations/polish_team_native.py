#!/usr/bin/env python3
"""Polish the current native team-page integration without changing its structure.

Usage: python3 polish_team_native.py current.js current.css output.js output.css
The source bundles are never overwritten.
"""
from pathlib import Path
import sys

if len(sys.argv) != 5:
    raise SystemExit("Usage: polish_team_native.py current.js current.css output.js output.css")

source_js, source_css, output_js, output_css = map(Path, sys.argv[1:])
js = source_js.read_text(encoding="utf-8")
css = source_css.read_text(encoding="utf-8")


def replace_block(start: str, end: str, replacement: str) -> None:
    global js
    if js.count(start) != 1:
        raise RuntimeError(f"Block start expected once: {start}")
    start_index = js.index(start)
    end_index = js.find(end, start_index)
    if end_index < 0:
        raise RuntimeError(f"Block end not found after {start}: {end}")
    js = js[:start_index] + replacement + js[end_index:]


replace_block(
    "const dv=[",
    ";function ov()",
    'const dv=[{icon:U6,text:"Спринты — часы"},{icon:G6,text:"Масштаб без найма"},{icon:D6,text:"Личная ответственность"},{icon:w6,text:"Продукт — платформа"}]',
)
replace_block(
    "const zv=[",
    ";function xv()",
    'const zv=[{title:"100% удалённо",tip:"Работай оттуда, где эффективен. Офис — по желанию."},{title:"Без учёта часов",tip:"Считаем результат, а не часы."},{title:"Созвоны по делу",tip:"Встречи — только когда их требует результат."},{title:"Официальный договор",tip:"Договор и выплаты с первого месяца. Всё чисто и официально."},{title:"Модели и кластер",tip:"Готовая инфраструктура экосистемы. Ничего не нужно собирать с нуля."},{title:"Агент распространения",tip:"Каналы, бартер и поток действий — в рабочей системе владельца."}]',
)

old_link = 'children:"Рабочая система владельца →"'
if js.count(old_link) != 1:
    raise RuntimeError("Expected the current hero owner-system link exactly once")
js = js.replace(old_link, 'children:"Система владельца →"', 1)

if "Без личных вложений" in js:
    raise RuntimeError("The removed personal-investment chip is still present")
if js.count("https://owners.startpervyh.ru/") != 3:
    raise RuntimeError("The three native owner-system links must be preserved")

js += r'''

/* Team page visual polish: decorative, pointer-transparent, reduced-motion aware. */
(() => {
  const mountOwnerVisual = () => {
    const hero = document.querySelector('.team-hero');
    if (!hero) return false;
    if (hero.querySelector('.team-hero-system-visual')) return true;
    const visual = document.createElement('div');
    visual.className = 'team-hero-system-visual';
    visual.setAttribute('aria-hidden', 'true');
    visual.innerHTML = `<svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="team-owner-core-glow">
          <stop offset="0" stop-color="#2B6BFF" stop-opacity=".22"/>
          <stop offset=".58" stop-color="#2B6BFF" stop-opacity=".055"/>
          <stop offset="1" stop-color="#2B6BFF" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="team-owner-line" x1="120" y1="100" x2="500" y2="510" gradientUnits="userSpaceOnUse">
          <stop stop-color="#8CE5BD" stop-opacity=".7"/>
          <stop offset=".5" stop-color="#7EA2FF" stop-opacity=".42"/>
          <stop offset="1" stop-color="#7EA2FF" stop-opacity=".06"/>
        </linearGradient>
      </defs>
      <circle cx="300" cy="300" r="252" fill="url(#team-owner-core-glow)"/>
      <g class="team-owner-visual-grid" stroke="rgba(255,255,255,.055)">
        <circle cx="300" cy="300" r="230"/><circle cx="300" cy="300" r="154"/><circle cx="300" cy="300" r="78"/>
        <path d="M70 300H530M300 70V530"/>
      </g>
      <g class="team-owner-visual-orbit team-owner-visual-orbit--outer">
        <circle cx="300" cy="300" r="224" stroke="url(#team-owner-line)" stroke-width="1.2" stroke-dasharray="3 15 66 28"/>
      </g>
      <g class="team-owner-visual-orbit team-owner-visual-orbit--inner">
        <circle cx="300" cy="300" r="150" stroke="rgba(126,162,255,.32)" stroke-width="1" stroke-dasharray="1 12 44 20"/>
      </g>
      <g class="team-owner-visual-connectors" stroke="url(#team-owner-line)" stroke-width="1.2">
        <path d="M300 300L300 76L498 198L474 438L300 524L108 416L96 184Z"/>
        <path d="M300 300L498 198M300 300L474 438M300 300L300 524M300 300L108 416M300 300L96 184M300 300V76"/>
      </g>
      <g class="team-owner-visual-flow" stroke="#B8F3D6" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 22">
        <path d="M300 300L498 198L474 438L300 300L108 416L96 184L300 300V76"/>
      </g>
      <g class="team-owner-visual-node" transform="translate(300 76)"><circle class="team-owner-visual-halo" r="17" fill="#8CE5BD" fill-opacity=".08"/><circle r="5" fill="#B8F3D6"/></g>
      <g class="team-owner-visual-node" transform="translate(498 198)"><circle class="team-owner-visual-halo" r="15" fill="#7EA2FF" fill-opacity=".1"/><circle r="4.5" fill="#9DBCFF"/></g>
      <g class="team-owner-visual-node" transform="translate(474 438)"><circle class="team-owner-visual-halo" r="15" fill="#8CE5BD" fill-opacity=".08"/><circle r="4.5" fill="#8CE5BD"/></g>
      <g class="team-owner-visual-node" transform="translate(300 524)"><circle class="team-owner-visual-halo" r="14" fill="#7EA2FF" fill-opacity=".09"/><circle r="4" fill="#7EA2FF"/></g>
      <g class="team-owner-visual-node" transform="translate(108 416)"><circle class="team-owner-visual-halo" r="15" fill="#7EA2FF" fill-opacity=".09"/><circle r="4.5" fill="#9DBCFF"/></g>
      <g class="team-owner-visual-node" transform="translate(96 184)"><circle class="team-owner-visual-halo" r="15" fill="#8CE5BD" fill-opacity=".08"/><circle r="4.5" fill="#8CE5BD"/></g>
      <g class="team-owner-visual-core">
        <circle class="team-owner-visual-core-pulse" cx="300" cy="300" r="46" stroke="#8CE5BD" stroke-opacity=".22"/>
        <circle cx="300" cy="300" r="33" fill="#101A38" stroke="#7EA2FF" stroke-opacity=".52"/>
        <circle cx="300" cy="300" r="19" fill="#2B6BFF" fill-opacity=".22" stroke="#B8F3D6" stroke-opacity=".7"/>
        <circle cx="300" cy="300" r="5" fill="#D5F8E8"/>
      </g>
    </svg>`;
    hero.prepend(visual);

    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (finePointer.matches && !reducedMotion.matches) {
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;
      const render = () => {
        frame = 0;
        visual.style.setProperty('--team-shift-x', `${pointerX * 12}px`);
        visual.style.setProperty('--team-shift-y', `${pointerY * 10}px`);
      };
      hero.addEventListener('pointermove', event => {
        const bounds = hero.getBoundingClientRect();
        pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
        pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (!frame) frame = requestAnimationFrame(render);
      }, { passive: true });
      hero.addEventListener('pointerleave', () => {
        pointerX = 0;
        pointerY = 0;
        if (!frame) frame = requestAnimationFrame(render);
      }, { passive: true });
    }
    return true;
  };

  if (!mountOwnerVisual()) {
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(() => {
      if (mountOwnerVisual()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
  }
})();
'''

css += r'''

/* Visual polish: equal chips, compact owner link and a quiet interactive system map. */
.team-hero-inner{z-index:2}
.team-hero-actions{margin-bottom:24px}
.team-hero-tool-link{min-height:36px;box-sizing:border-box;margin:0 0 28px;padding:7px 13px;border:1px solid rgba(184,243,214,.24);border-radius:999px;background:rgba(184,243,214,.055);font-size:13px;line-height:1.35;transition:color .2s ease,border-color .2s ease,background .2s ease,transform .2s ease}
.team-hero-tool-link:hover{color:#fff;border-color:rgba(184,243,214,.65);background:rgba(184,243,214,.1);transform:translateY(-1px)}
.team-model-chips{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.team-model-chips .team-model-chip{min-width:0;height:62px;box-sizing:border-box;justify-content:center;padding:14px 16px;text-align:center;line-height:1.35;white-space:normal;transition:border-color .2s ease,background .2s ease,transform .2s ease}
.team-model-chip>svg,.team-chip>svg{flex:0 0 auto}
.team-chips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.team-chips>*{min-width:0}
.team-chips .team-chip{width:100%;min-width:0;height:62px;box-sizing:border-box;justify-content:center;padding:15px 18px;text-align:center;line-height:1.35;white-space:normal;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease}
.team-hero-system-visual{--team-shift-x:0px;--team-shift-y:0px;position:absolute;z-index:1;top:34px;right:max(36px,calc((100vw - 1180px)/2));width:min(34vw,480px);aspect-ratio:1;pointer-events:none;user-select:none;opacity:.9;transform:translate3d(var(--team-shift-x),var(--team-shift-y),0);transition:transform .7s cubic-bezier(.2,.7,.2,1);will-change:transform}
.team-hero-system-visual svg{display:block;width:100%;height:100%;overflow:visible}
.team-owner-visual-orbit{transform-origin:300px 300px;transform-box:view-box;animation:teamOwnerOrbit 44s linear infinite}
.team-owner-visual-orbit--inner{animation-duration:31s;animation-direction:reverse}
.team-owner-visual-flow{animation:teamOwnerFlow 12s linear infinite;opacity:.7}
.team-owner-visual-halo{transform-box:fill-box;transform-origin:center;animation:teamOwnerNode 4.8s ease-in-out infinite}
.team-owner-visual-node:nth-of-type(2n) .team-owner-visual-halo{animation-delay:-2.4s}
.team-owner-visual-core-pulse{transform-box:fill-box;transform-origin:center;animation:teamOwnerCore 4.2s ease-out infinite}
@keyframes teamOwnerOrbit{to{transform:rotate(360deg)}}
@keyframes teamOwnerFlow{to{stroke-dashoffset:-240}}
@keyframes teamOwnerNode{0%,100%{opacity:.45;transform:scale(.82)}50%{opacity:1;transform:scale(1.25)}}
@keyframes teamOwnerCore{0%{opacity:.7;transform:scale(.72)}80%,100%{opacity:0;transform:scale(1.45)}}
@media(hover:hover){
  .team-model-chips .team-model-chip:hover{border-color:rgba(140,229,189,.42);background:rgba(255,255,255,.085);transform:translateY(-2px)}
  .team-chips .team-chip:hover{border-color:rgba(43,107,255,.3);box-shadow:0 12px 28px rgba(24,32,65,.09);transform:translateY(-2px)}
}
@media(max-width:1199px){.team-hero-system-visual{display:none}}
@media(max-width:900px){.team-model-chips{grid-template-columns:repeat(2,minmax(0,1fr))}.team-chips{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){
  .team-hero-actions{margin-bottom:24px}
  .team-hero-tool-link{min-height:34px;margin-bottom:24px;font-size:12px}
  .team-model-chips,.team-chips{gap:10px}
  .team-model-chips .team-model-chip,.team-chips .team-chip{min-height:58px;padding:12px 10px;font-size:13px}
}
@media(max-width:380px){.team-model-chips .team-model-chip,.team-chips .team-chip{font-size:12px}}
@media(prefers-reduced-motion:reduce){
  .team-hero-system-visual{transform:none;transition:none;will-change:auto}
  .team-hero-system-visual *{animation:none!important}
  .team-hero-tool-link,.team-model-chips .team-model-chip,.team-chips .team-chip{transition:none}
}
'''

output_js.parent.mkdir(parents=True, exist_ok=True)
output_js.write_text(js, encoding="utf-8")
output_css.write_text(css, encoding="utf-8")
print("TEAM_POLISH_OK chips=6 model_chips=4 owner_links=3 visual=1")
