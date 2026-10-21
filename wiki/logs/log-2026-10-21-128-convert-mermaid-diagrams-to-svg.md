---
schema_version: 2
id: log-2026-10-21-128
kind: meta
title: "2026-10-21 update | 머메이드 차트의 SVG 벡터 그래픽 전면 전환"
aliases: []
summary: 정적 사이트 렌더러에서 렌더링되지 않던 위키 내 머메이드 다이어그램 2종을 다크/라이트 모드 자동 대응형 고품질 독립 SVG 에셋으로 전면 전환한 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-21
updated: 2026-10-21
review:
  mode: legacy-baseline
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

## 작업 배경 및 목적

- 사용자의 요청:
  1. `wiki/analyses/기호는 어떻게 생각의 보조 도구에서 계산 엔진이 되었는가.md` 문서 내 머메이드(Mermaid) 차트가 정적 사이트에서 렌더링되지 않는 문제를 해결하기 위해 SVG 벡터 그래픽으로 전환.
  2. 위키 전반에 걸쳐 렌더링되지 않는 다른 머메이드 차트가 있는지 전수 조사하고 동일하게 전환 조치.
- 현황 분석:
  - 사이트 빌드 엔진(`site/build.mjs`, `site/markdown.mjs`)은 `markdown-it` 기반으로 동작하며, 클라이언트 사이드 머메이드 런타임이 없어 마크다운 내 ```` ```mermaid ```` 코드 블록이 다이어그램이 아닌 일반 텍스트 코드 블록으로 노출되는 문제가 있었다.
  - 반면 위키 이미지 임베드 문법(`![[...svg|...]]`)은 `raw/assets/`의 SVG 에셋을 빌드 시 `dist/assets/raw/`로 복사하여 완벽하게 렌더링한다.
  - 위키 전체 Markdown 문서 전수 조사 결과, 머메이드 블록을 포함한 위키 문서는 다음 2건이었다:
    1. `wiki/analyses/기호는 어떻게 생각의 보조 도구에서 계산 엔진이 되었는가.md`
    2. `wiki/analyses/17세기 해석기하학은 어떻게 디스플레이 픽셀과 지도가 되었는가.md`
    (참고: `raw/`의 불변 원본 파일 내 머메이드 차트는 보존 원칙에 따라 수정 대상에서 제외)

## 작업 범위

- **독립형 SVG 에셋 2종 신규 제작 (`raw/assets/`)**:
  - `raw/assets/diagram_symbolic_computation_engine_llm.svg`: 입력 기호열(구문) $\to$ 맹목적 연산 엔진(LLM 임베딩 & Self-Attention 행렬 곱셈) $\to$ 출력 기호열(구문) $\to$ 인간 주체의 의미 검증 노동(의미론 & 책임) 구조 시각화.
  - `raw/assets/diagram_analytic_geometry_to_mobile_systems.svg`: 17세기 수학 혁명(데카르트 좌표계, 페르마 극값, 뉴턴-라이프니츠 미적분학)이 현대 모바일 컴퓨팅 3대 기둥(디스플레이/GPU, 터치스크린/물리엔진, 위치인식/모바일 지도)으로 육화되는 수치 해석 파이프라인 매핑 시각화.
  - 두 SVG 에셋 모두 `@media (prefers-color-scheme: dark)` CSS 미디어 쿼리를 내장하여 시스템 다크/라이트 테마에 완전 자동 감응하도록 제작.
- **분석 문서 본문 다이어그램 참조 교체**:
  - `wiki/analyses/기호는 어떻게 생각의 보조 도구에서 계산 엔진이 되었는가.md` 본문의 머메이드 코드 블록을 `![[diagram_symbolic_computation_engine_llm.svg|구문 조작 엔진(LLM)과 인간 주체의 의미 검증 구조]]`로 교체.
  - `wiki/analyses/17세기 해석기하학은 어떻게 디스플레이 픽셀과 지도가 되었는가.md` 본문의 머메이드 코드 블록을 `![[diagram_analytic_geometry_to_mobile_systems.svg|17세기 수학 혁명과 현대 모바일 컴퓨팅 3대 기둥 매핑]]`로 교체.
- **운영 페이지 및 동기화**:
  - `scripts/update_wiki_updated.mjs`를 통해 수정된 문서들의 `updated` 및 `review.revision` SHA-256 해시 갱신.
  - `npm run maintenance:generate`를 통해 `wiki/index.md`, `wiki/overview.md`, `wiki/log.md` 운영 색인 재생성.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- [[기호는 어떻게 생각의 보조 도구에서 계산 엔진이 되었는가]]
- [[17세기 해석기하학은 어떻게 디스플레이 픽셀과 지도가 되었는가]]

## 관련 항목

- [[기호는 어떻게 생각의 보조 도구에서 계산 엔진이 되었는가]] — 구문 조작 엔진과 의미 검증 다이어그램이 SVG로 전환된 분석 문서.
- [[17세기 해석기하학은 어떻게 디스플레이 픽셀과 지도가 되었는가]] — 17세기 수학과 모바일 하드웨어 3대 기둥 매핑 다이어그램이 SVG로 전환된 분석 문서.
- [[위키 개요]] — 전체 운영 페이지 규모 및 검증 상태를 확인한다.
