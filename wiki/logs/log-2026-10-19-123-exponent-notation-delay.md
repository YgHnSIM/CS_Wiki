---
schema_version: 2
id: log-2026-10-19-123
kind: meta
title: "2026-10-19 ingest | 지수 기호가 늦은 이유와 구문론의 두 의미"
aliases: []
summary: 1,877년 지수 기호 해설을 스냅샷으로 보존하고, 종-수량 쌍과 위첨자 지수 표기, 그 둘을 잇는 분석 초안을 기호 계보 앞에 추가한 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-19
updated: 2026-10-19
review:
  mode: pending
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

## 작업 범위

- **불변 스냅샷 (`raw/assets/`)**:
  - `raw/assets/why_1877_years_to_invent_x_squared.html` (웹 페이지 HTML, 153,285바이트)
- **근거 소스 (`wiki/sources/`, 1종)**:
  - `src-009`: [[지수 기호 하나를 얻기까지 왜 1877년이나 걸렸는가]]
- **개념 (`wiki/concepts/`, 2종)**:
  - [[종-수량 쌍]]: 수를 종의 형용사로 읽는 전근대 존재론
  - [[위첨자 지수 표기]]: 밑과 차수를 분리해 새 수학적 대상을 식으로 만드는 구문
- **분석 (`wiki/analyses/`, 1종)**:
  - [[거듭제곱 법칙을 알고도 지수 기호는 왜 늦게 생겼는가]]
- **기존 문서 연결**:
  - [[기호는 어떻게 생각의 보조 도구에서 계산 엔진이 되었는가]]: 계보의 앞자리를 한 문장으로 가리킴
  - [[중국어 방과 구문-의미 간극]]: 형성으로서의 의미와 이해로서의 의미를 구분하는 모순 노트
- **학습 경로**:
  - `computing-origins`에서 홉스 앞에 두 개념과 분석을 배치

## 판단

해설 전체를 위키 본문으로 옮기지 않았다. 전기, 1,877년이라는 서사 숫자, 슈케의 $12^0 = 12$라는 등식, 미대조 원전은 소스의 한계로 남겼다. 그래프에 올린 주장은 세 가지다. 코식 이름은 손계산 절차였다. 수는 종-수량 쌍이었다. 위첨자 구문은 음수·분수 지수를 식으로 먼저 만든다. 마지막 주장은 설의 구문-의미 간극과 다른 표적의 의미론으로 적었다.

## 검증

- `npm run lint:wiki`
- `npm run maintenance:generate`
- `npm run maintenance:check`
- `npm run build`
- `npm run verify:site`

원본 HTML에는 저자가 적은 `[!NOTE]` 콜아웃 문자가 그대로 있다. `verify:site`의 위키 마크업 누출 검사는 생성 페이지만 보고, `assets/raw/`로 복사된 원본은 제외한다.

## 주요 생성 및 수정 파일

- `raw/assets/why_1877_years_to_invent_x_squared.html`
- `wiki/sources/지수 기호 하나를 얻기까지 왜 1877년이나 걸렸는가.md`
- `wiki/concepts/종-수량 쌍.md`
- `wiki/concepts/위첨자 지수 표기.md`
- `wiki/analyses/거듭제곱 법칙을 알고도 지수 기호는 왜 늦게 생겼는가.md`
- `wiki/analyses/기호는 어떻게 생각의 보조 도구에서 계산 엔진이 되었는가.md`
- `wiki/concepts/중국어 방과 구문-의미 간극.md`
- `site/catalog.mjs`
- `wiki/logs/log-2026-10-19-123-exponent-notation-delay.md`
