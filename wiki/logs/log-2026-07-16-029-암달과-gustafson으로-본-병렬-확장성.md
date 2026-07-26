---
schema_version: 2
id: log-2026-07-16-029
kind: meta
title: 2026-07-16 reference | 암달과 Gustafson으로 본 병렬 확장성
aliases: []
summary: 2026-07-16에 수행한 reference 작업의 변경 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-07-16
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:272b70cadb8fa4e56fc8f49c807ee9eadff5f62b556a9600569a8f452a9304ca
  reviewed_at: null
  reviewed_by: migration:v2
evidence_ids: []
capability_layers: []
---

컴퓨팅 능력 주제의 단계적 보강 가운데 3단계를 수행했다. [[Reevaluating Amdahl's Law]]을 `ref-045`로 등록하고, [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]와 대조해 병렬 자원을 늘릴 때 무엇을 고정하는지에 따라 가속의 의미가 달라진다는 관점을 보강했다.

암달의 고정 크기 모델은 같은 문제의 실행 시간을 줄이는 정도를 묻고, Gustafson–Barsis의 확대 크기 모델은 병렬 실행 시간을 고정한 채 자원에 맞춰 문제의 병렬 부분을 키울 때 같은 시간에 얼마나 더 큰 계산을 하는지 묻는다. 두 모델의 순차 비율은 분모가 다르며, Gustafson의 직렬 기준선은 확대된 문제에 대한 가상 실행 시간이므로 같은 값을 두 식에 대입하거나 동일 입력의 가속비로 해석하지 않도록 정리했다.

새 개념 [[병렬 확장성]]은 고정 크기·확대 크기 모델과 현대의 강한·약한 확장 용어를 구분하고, 통신·동기화·입출력과 부하 불균형을 포함한 측정 조건을 제시한다. 새 분석 [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]는 동일 작업의 지연 시간 감소와 같은 시간에 더 큰 문제를 해결하는 능력을 서로 다른 성과로 종합한다. 웹에는 14번째 학습 경로 `병렬 확장성의 두 질문`을 추가했다.

변경된 페이지:

- 참고 자료: [[Reevaluating Amdahl's Law]]
- 개념: [[병렬 확장성]]
- 분석: [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]
- 보강: [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]], [[The Landscape of Parallel Computing Research - A View from Berkeley]], [[컴퓨팅 능력이란 무엇인가]], [[컴퓨팅 능력의 발달사]]
- 갱신: [[index]], [[overview]], [[log]]
- 웹 탐색: `site/catalog.mjs`의 14번째 학습 경로

### 검증

- Gustafson 1988 원문 3쪽을 텍스트와 페이지 이미지로 대조하고 임시 렌더링 파일을 제거함
- `npm run check`: 위키 lint, 유지보수 dry-run, Node 8개·Python 11개 테스트, 191개 페이지 빌드 통과
- `python scripts/wiki_lint.py --json`: 오류 0건, 경고 0건
- `python scripts/wiki_maintenance.py --check`: 변경 필요 항목 0건
- `git diff --check`: 공백 오류 없음
- `raw/` 원본 변경 없음

### 출처

- [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]
- [[Reevaluating Amdahl's Law]]
- [[The Landscape of Parallel Computing Research - A View from Berkeley]]

### 관련 항목

- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
- [[index]]
- [[overview]]
