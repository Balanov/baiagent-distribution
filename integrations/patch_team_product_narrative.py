#!/usr/bin/env python3
"""Integrate the verified product cycle into the existing team page bundle.

The reviewed source bundle is immutable. Every replacement must occur once.
Usage: python patch_team_product_narrative.py current.js output.js
"""
from hashlib import sha256
from pathlib import Path
import json
import sys

if len(sys.argv) != 3:
    raise SystemExit("Usage: patch_team_product_narrative.py current.js output.js")
source, output = map(Path, sys.argv[1:])
js = source.read_text(encoding="utf-8")
expected_source = "beae000ae64c612ae8f2730cb7ad97e7b54b95ab179f36278d3140797e53974b"
actual_source = sha256(source.read_bytes()).hexdigest()
if actual_source != expected_source:
    raise RuntimeError(f"Unexpected source hash: {actual_source}")


def replace_once(old: str, new: str) -> None:
    global js
    count = js.count(old)
    if count != 1:
        raise RuntimeError(f"Expected one match, found {count}: {old[:120]}")
    js = js.replace(old, new, 1)


replace_once(
    'className:"team-hero-lead",children:"Свои продукты, модели и агентные контуры: от проверяемой продуктовой работы до выхода на рынок. Вы задаёте направление — системы берут на себя циклы, проверки и рутину."',
    'className:"team-hero-lead",children:"Уже готово для владельца: UNTIL берёт на себя исследование, приоритет, ТЗ, реализацию и независимую приёмку. Distribution строит продвижение. Вы задаёте результат — не координируете каждый шаг команды."',
)
replace_once('children:"UNTIL — продуктовый фреймворк →"', 'children:"Как система ведёт продукт →"')
replace_once('children:"Агент распространения →"', 'children:"Как система продвигает продукт →"')
replace_once(
    'title:"Один владелец. Рой агентов",lead:"Вы задаёте направление и критерии. Собственные контуры ведут продуктовую работу и распространение, оставляя проверяемый след."',
    'title:"Ваша цель. Дальше — готовая система.",lead:"Исследование, продуктовые решения, реализация, проверка и продвижение связаны в один рабочий цикл. Вам не нужно координировать его вручную."',
)
replace_once('{"code-path":"src/pages/Home.tsx:679:15",children:"Человек"}', '{"code-path":"src/pages/Home.tsx:679:15",children:"Вы задаёте результат"}')
replace_once('{"code-path":"src/pages/Home.tsx:680:15",children:"решает, что и зачем"}', '{"code-path":"src/pages/Home.tsx:680:15",children:"что, зачем и ограничения"}')
replace_once('{"code-path":"src/pages/Home.tsx:685:15",children:"Рой агентов"}', '{"code-path":"src/pages/Home.tsx:685:15",children:"UNTIL ведёт продуктовый цикл"}')
replace_once('{"code-path":"src/pages/Home.tsx:686:15",children:"исполняет быстро и проверяемо"}', '{"code-path":"src/pages/Home.tsx:686:15",children:"исследование → ТЗ → реализация → приёмка"}')
replace_once('{"code-path":"src/pages/Home.tsx:691:15",children:"Результат"}', '{"code-path":"src/pages/Home.tsx:691:15",children:"Distribution выводит на рынок"}')
replace_once('{"code-path":"src/pages/Home.tsx:692:15",children:"цифры, за которые отвечает владелец"}', '{"code-path":"src/pages/Home.tsx:692:15",children:"каналы → действия → метрики"}')
replace_once(
    'const v4=[{icon:Yd,text:"Спринты — часы"},{icon:Nd,text:"Масштаб без найма"},{icon:Td,text:"Личная ответственность"},{icon:Cd,text:"Продукт — платформа"}]',
    'const v4=[{icon:Yd,text:"Цель вместо статус-встреч"},{icon:Nd,text:"Независимая приёмка"},{icon:Td,text:"Права у каждой роли"},{icon:Cd,text:"Результат → следующий цикл"}]',
)
replace_once('children:"Собственный фреймворк · MIT"', 'children:"Продуктовая работа · MIT"')
replace_once('className:"team-agent-system-version",children:"v0.2.0"', 'className:"team-agent-system-version",children:"Открытый код"')
replace_once('children:"UNTIL: продуктовая работа с доказательством"', 'children:"UNTIL: от цели до проверенного кандидата"')
replace_once(
    'children:"Агенты получают задачу, проходят автономные циклы и проверяют JSON-артефакты по схеме. Результат — не «я поработал», а файл, verdict и trace."',
    'children:"Не список агентов, а рабочий цикл: исследование сигналов, приоритет и ТЗ, реализация, независимая приёмка и следующий цикл по результату."',
)
replace_once('children:"0/6 → 6/6"', 'children:"6/6"')
replace_once('children:"held-out: v0.1 → v0.2"', 'children:"ролевых задач"')
replace_once('children:"48"', 'children:"6/6"')
replace_once('children:"реальных запусков"', 'children:"проверок приёмки"')
replace_once('children:"102"', 'children:"52/52"')
replace_once('children:"файла доказательств"', 'children:"автотестов · CI на 3 ОС"')
replace_once(
    'children:"Узкий JSON-benchmark, не замена команды: direct тоже 6/6 и быстрее в 3,281×."',
    'children:"Реальный Node-тест: FAIL → ACTIVATION_TEST_OK. 2 файла в локальном candidate · 14/14 proof checks. Не production-деплой."',
)
replace_once('children:"Код, запуски и ограничения →"', 'children:"Код, прогон и доказательства →"')
replace_once('children:"Рабочий контур · local-first"', 'children:"Продвижение · для владельца"')
replace_once('children:"BAIagent: путь продукта к рынку"', 'children:"Distribution: продвижение продукта"')
replace_once(
    'children:"Изучает продукт, предлагает каналы и бартер, формирует исполняемый outbox. Отправка не выдаётся за выручку."',
    'children:"Изучает продукт, выбирает каналы, предлагает бартер и собирает действия в исполняемый outbox. Внешние действия — только в выданных правах."',
)
replace_once('children:"01 · Паспорт и допуск"', 'children:"01 · Продукт и готовность"')
replace_once('children:"02 · Каналы и бартер"', 'children:"02 · Каналы и бартер"')
replace_once('children:"03 · Outbox и метрики"', 'children:"03 · Действия и метрики"')
replace_once('children:"Направление владельца"', 'children:"Цель владельца"')
replace_once('children:"Проверенный артефакт"', 'children:"Проверенный release candidate"')
replace_once('children:"Канал и действие"', 'children:"Продвижение"')
replace_once('children:"Измеренный результат"', 'children:"Метрики результата"')
replace_once(
    '{title:"Агент распространения",tip:"Каналы, бартер и поток действий — в рабочей системе владельца."}',
    '{title:"Продвижение продукта",tip:"Каналы, бартер и исполняемый outbox — в системе владельца."}',
)
replace_once(
    'lead:"Возглавляешь процесс — мы даём инфраструктуру, модели и агентов."',
    'lead:"Возглавляешь результат — продуктовый цикл, инфраструктура и продвижение уже готовы."',
)

for forbidden in (
    "Свои продукты, модели и агентные контуры",
    "Один владелец. Рой агентов",
    "Спринты — часы",
    "Масштаб без найма",
    "Проверенный артефакт",
    "0/6 → 6/6",
    "48 реальных запусков",
):
    if forbidden in js:
        raise RuntimeError(f"Outdated narrative remains: {forbidden}")
for required in ("6/6", "52/52", "ACTIVATION_TEST_OK", "Не production-деплой", "Как система ведёт продукт →"):
    if required not in js:
        raise RuntimeError(f"Required proof missing: {required}")
if js.count("https://balanov.pro/until/") != 3 or js.count("https://owners.startpervyh.ru/") != 3:
    raise RuntimeError("The three native links to each system must be preserved")

output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(js, encoding="utf-8")
print(json.dumps({
    "status": "TEAM_PRODUCT_NARRATIVE_OK",
    "source_sha256": actual_source,
    "output_sha256": sha256(output.read_bytes()).hexdigest(),
    "until_links": js.count("https://balanov.pro/until/"),
    "distribution_links": js.count("https://owners.startpervyh.ru/"),
}, ensure_ascii=False, indent=2))
