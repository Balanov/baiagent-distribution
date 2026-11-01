#!/usr/bin/env python3
"""Apply the reviewed owner-infrastructure update to the existing team bundle.

The source bundle is never overwritten. Every replacement is required exactly once.
Usage: python3 patch_team_native.py source.js source.css output.js output.css
"""
from pathlib import Path
import sys

if len(sys.argv) != 5:
    raise SystemExit("Usage: patch_team_native.py source.js source.css output.js output.css")

source_js, source_css, output_js, output_css = map(Path, sys.argv[1:])
js = source_js.read_text(encoding="utf-8")
css = source_css.read_text(encoding="utf-8")
replacements = []


def patch(old: str, new: str) -> None:
    replacements.append((old, new))


patch(
    '''v.jsxs("p",{"code-path":"src/pages/Home.tsx:134:11",className:"team-hero-lead",children:["Продукты в",re,"релизе, свои модели и",re,"кластер. Владельцу — доля и",re,"вся мощь экосистемы."]})''',
    '''v.jsx("p",{"code-path":"src/pages/Home.tsx:134:11",className:"team-hero-lead",children:"Готовые продукты, свои модели, кластер и агент распространения. Возглавляешь процесс — получаешь оплату выше рынка и долю."})''',
)

patch(
    '''v.jsx("button",{"code-path":"src/pages/Home.tsx:141:13",type:"button",className:"team-btn team-btn-ghost team-btn-ghost-dark",onClick:()=>u1("products"),children:"Смотреть продукты"})]})]}),v.jsxs(Ne,{"code-path":"src/pages/Home.tsx:146:9"''',
    '''v.jsx("button",{"code-path":"src/pages/Home.tsx:141:13",type:"button",className:"team-btn team-btn-ghost team-btn-ghost-dark",onClick:()=>u1("products"),children:"Смотреть продукты"})]}),v.jsx("a",{className:"team-hero-tool-link",href:"https://owners.startpervyh.ru/",target:"_blank",rel:"noopener noreferrer",children:"Рабочая система владельца →"})]}),v.jsxs(Ne,{"code-path":"src/pages/Home.tsx:146:9"''',
)

patch(
    '''essence:"Твоя ниша. Модели, кластер и рои экосистемы."''',
    '''essence:"Твоя ниша. Наши модели, кластер и распространение."''',
)

patch(
    '''{id:"budget",label:"Собственный бюджет",bonus:.1,hint:"соинвестиция в рост продукта"},''',
    '''''',
)

patch(
    '''qi=.35,Zi=.05''',
    '''qi=.28,Zi=.05''',
)

patch(
    '''{id:"idea-budget",label:"Ниша + клиенты + бюджет",share:.12,text:"соинвестиция ускоряет запуск и поднимает долю"}''',
    '''{id:"idea-partnership",label:"Ниша + клиенты + партнёрство",share:.12,text:"экспертиза, спрос и партнёрские ресурсы усиливают запуск"}''',
)

patch(
    '''budget:{label:"Свой бюджет",hint:"Соинвестиция в рост продукта."},''',
    '''''',
)

patch(
    '''"idea-budget":"Ниша + клиенты + бюджет"''',
    '''"idea-partnership":"Ниша + клиенты + партнёрство"''',
)

patch(
    '''},u.text))}),v.jsxs("div",{"code-path":"src/pages/Home.tsx:703:11"''',
    '''},u.text))}),v.jsxs("div",{className:"team-owner-system",children:[v.jsxs("div",{children:[v.jsx("span",{className:"team-owner-system-label",children:"Уже работает"}),v.jsx("b",{children:"Агент распространения"}),v.jsx("p",{children:"Изучает продукт, предлагает каналы и бартер, готовит поток действий. Локальные модели — без оплаты облачных токенов."})]}),v.jsx("a",{className:"team-owner-system-link",href:"https://owners.startpervyh.ru/",target:"_blank",rel:"noopener noreferrer",children:"Открыть систему →"})]}),v.jsxs("div",{"code-path":"src/pages/Home.tsx:703:11"''',
)

patch(
    '''{title:"Свои модели и кластер",tip:"Технологии экосистемы — в распоряжении владельца и в его развитии."}''',
    '''{title:"Свои модели и кластер",tip:"Готовая инфраструктура экосистемы. Ничего не нужно собирать с нуля."},{title:"Агент распространения",tip:"Каналы, бартер и поток действий — в рабочей системе владельца."},{title:"Без личных вложений",tip:"Инфраструктуру и инструменты предоставляет экосистема."}''',
)

patch(
    '''lead:"Автономия полная. Планка результата — жёсткая."''',
    '''lead:"Возглавляешь процесс — мы даём инфраструктуру, модели и агентов."''',
)

patch(
    '''v.jsx("div",{"code-path":"src/pages/Home.tsx:989:11",children:v.jsx(M1,{"code-path":"src/pages/Home.tsx:990:13",num:"09",eyebrow:"Заявка",title:"Стань владельцем продукта"})})''',
    '''v.jsxs("div",{"code-path":"src/pages/Home.tsx:989:11",children:[v.jsx(M1,{"code-path":"src/pages/Home.tsx:990:13",num:"09",eyebrow:"Заявка",title:"Стань владельцем продукта"}),v.jsxs("p",{className:"team-apply-ready",children:["Начинаешь не с нуля: продукт, модели, кластер и распространение уже готовы. ",v.jsx("a",{href:"https://owners.startpervyh.ru/",target:"_blank",rel:"noopener noreferrer",children:"Открыть рабочую систему →"})]})]})''',
)

for index, (old, new) in enumerate(replacements, start=1):
    count = js.count(old)
    if count != 1:
        raise RuntimeError(f"Replacement {index} expected once, found {count}")
    js = js.replace(old, new, 1)

for forbidden in ("Свой бюджет", "Собственный бюджет", "Ниша + клиенты + бюджет", "соинвестиция"):
    if forbidden in js:
        raise RuntimeError(f"Forbidden budget copy remains: {forbidden}")

if js.count("https://owners.startpervyh.ru/") != 3:
    raise RuntimeError("Expected three native owner-system links")

css += r'''

/* Owner infrastructure: native, compact proofs inside the existing page. */
.team-hero-tool-link{display:inline-flex;align-items:center;width:fit-content;margin-top:22px;color:#b8f3d6;font-size:14px;font-weight:700;line-height:1.4;text-decoration:none;border-bottom:1px solid rgba(184,243,214,.45);padding-bottom:3px;transition:color .2s ease,border-color .2s ease}
.team-hero-tool-link:hover{color:#fff;border-color:#fff}
.team-hero-tool-link:focus-visible,.team-owner-system-link:focus-visible,.team-apply-ready a:focus-visible{outline:2px solid #f6c453;outline-offset:4px}
.team-owner-system{display:flex;align-items:center;justify-content:space-between;gap:32px;margin-top:30px;padding-top:28px;border-top:1px solid rgba(255,255,255,.14)}
.team-owner-system>div{max-width:700px}
.team-owner-system-label{display:block;margin-bottom:8px;color:#8ce5bd;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
.team-owner-system b{display:block;color:#fff;font-size:22px;line-height:1.2;letter-spacing:-.02em}
.team-owner-system p{margin:9px 0 0;color:rgba(255,255,255,.7);font-size:14px;line-height:1.55}
.team-owner-system-link{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;min-height:48px;padding:0 20px;border-radius:12px;background:#2b6bff;color:#fff;font-size:14px;font-weight:800;text-decoration:none;white-space:nowrap;transition:background .2s ease,transform .2s ease}
.team-owner-system-link:hover{background:#4b82ff;transform:translateY(-1px)}
.team-apply-ready{max-width:480px;margin:26px 0 0;color:#59627a;font-size:15px;line-height:1.65}
.team-apply-ready a{display:inline-block;margin-top:8px;color:#245fe5;font-weight:800;text-decoration:none;border-bottom:1px solid rgba(36,95,229,.3)}
.team-apply-ready a:hover{color:#123eaa;border-color:currentColor}
@media(max-width:720px){.team-hero-tool-link{margin-top:20px;font-size:13px}.team-owner-system{align-items:flex-start;flex-direction:column;gap:20px;margin-top:24px;padding-top:24px}.team-owner-system b{font-size:20px}.team-owner-system-link{width:100%;box-sizing:border-box}.team-apply-ready{margin-top:20px;font-size:14px}}
'''

output_js.parent.mkdir(parents=True, exist_ok=True)
output_js.write_text(js, encoding="utf-8")
output_css.write_text(css, encoding="utf-8")
print(f"NATIVE_TEAM_PATCH_OK replacements={len(replacements)} owner_links=3")
