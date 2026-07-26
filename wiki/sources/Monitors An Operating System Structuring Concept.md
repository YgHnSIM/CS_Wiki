---
schema_version: 2
id: ref-093
kind: reference
title: "Monitors: An Operating System Structuring Concept"
aliases:
  - Hoare monitors
  - Hoare 1974
  - "Monitors: An Operating System Structuring Concept"
  - Monitors An Operating System Structuring Concept
  - 운영체제 구조화 개념으로서의 모니터
summary: 공유 자원의 상태와 접근 절차를 모듈 안에 묶고 상호 배제와 조건 대기를 제공하는 모니터를 운영체제 구조화 방법으로 제시한 Hoare의 1974년 논문.
domains:
  - operating-systems
  - software-engineering
  - computer-science
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:0f8f67e581fc1a3292722b263c79ef8a2320fc1d7107a59dfd4f74deb2f0af71
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - scalability
  - reliable-results
history:
  publication_year: 1974
  layer: system
redirect_from:
  - /references/monitors-an-operating-system-structuring-concept/
  - /sources/monitors-an-operating-system-structuring-concept/
origin: external
works:
  primary:
    - citation: "C. A. R. Hoare, Monitors: An Operating System Structuring Concept, Communications of the ACM 17(10), 1974, pp. 549–557"
      genre: other
      identifiers: []
      edition: Communications of the ACM 17(10), October 1974, pp. 549–557
  supporting:
    - citation: ACM Digital Library publication record
      genre: official-record
      identifiers: []
      edition: null
    - citation: University of Oxford author publication record
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://dl.acm.org/doi/10.1145/355620.361161
    retrieved: 2026-07-25
    version: Communications of the ACM 17(10), October 1974, pp. 549–557
  - kind: url
    role: mirror
    url: https://www.cs.ox.ac.uk/publications/publication8229-abstract.html
    retrieved: 2026-07-25
    version: Communications of the ACM 17(10), October 1974, pp. 549–557
---

## 개요

[[Monitors: An Operating System Structuring Concept]]은 C. A. R. Hoare가 1974년에 제시한 모니터(monitor) 개념을 다룬 논문이다. 모니터는 공유 자원의 상태를 보관하는 지역 변수와 그 자원에 접근하는 절차를 하나의 모듈로 묶고, 한 번에 하나의 프로세스만 그 절차 안에서 실행하게 하는 구조다.

논문은 상호 배제만으로는 충분하지 않은 경우를 조건 변수(condition variable)의 `wait`와 `signal` 연산으로 다룬다. 어떤 조건이 아직 성립하지 않으면 실행을 미루고, 조건이 바뀌었을 때 대기한 실행 주체를 재개하는 방식으로 자원 접근의 안전성과 대기 흐름을 함께 표현한다.

Hoare의 모니터는 특정 언어의 `synchronized` 키워드나 현대 런타임의 구현 세부와 동일시할 수 없다. 이 논문의 핵심은 공유 상태를 임의의 전역 변수로 흩어 두지 않고, 접근 규칙·대기 조건·증명 규칙을 모듈 경계에 함께 두려는 구조화 원칙이다.

## 주요 인사이트

- 공유 자원의 상태와 접근 절차를 한 모듈에 묶으면 누가 어떤 조건에서 상태를 바꾸는지 추론하기 쉬워진다.
- 모니터의 상호 배제는 같은 자원 상태를 동시에 조작하는 실행을 제한한다.
- 조건 변수는 잠금 보유 여부와 별개로, 어떤 조건이 만족될 때까지 기다리는 일을 표현한다.
- 안전한 상호 배제와 대기 중인 작업의 진행·공정성은 같은 보장이 아니므로 조건 재확인과 스케줄링 정책을 분리해 다뤄야 한다.
- 모니터는 운영체제뿐 아니라 공유 상태를 가진 모듈의 인터페이스 설계에도 영향을 준 구조화 방법이다.

## 인용할 만한 구절

> “a method of structuring an operating system”
<!-- wiki-v2:quote-locator evidence="ref-093" locator="wiki/sources/Monitors An Operating System Structuring Concept.md:line-19#인용할-만한-구절" status="recorded" -->

제목의 표현처럼 모니터는 잠금 하나가 아니라 운영체제 구조를 조직하는 방법으로 제안됐다.

## 위키 반영

이 자료는 [[상호 배제와 동기화]]에서 임계 구역과 조건 대기를 모듈 경계에 함께 두는 방법의 직접 근거다. [[운영체제]]에는 프로세스와 공유 자원을 단순한 자원 목록이 아니라 접근 규칙을 가진 구성 요소로 볼 수 있게 하는 사례로 연결한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[상호 배제와 동기화]] | 지역 상태·절차·조건 변수로 공유 자원에 대한 배타적 접근과 조건 대기를 모듈 안에서 구현한다. | [[Monitors: An Operating System Structuring Concept]] |
| exemplifies | [[운영체제]] | 공유 자원 관리와 프로세스 대기를 운영체제의 구조화 문제로 다루는 사례를 제시한다. | [[Monitors: An Operating System Structuring Concept]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- ACM Digital Library, [Monitors: An Operating System Structuring Concept](https://dl.acm.org/doi/10.1145/355620.361161)
- University of Oxford, [author publication record](https://www.cs.ox.ac.uk/publications/publication8229-abstract.html)

## 관련 항목

- [[상호 배제와 동기화]] — 모니터가 해결하려는 임계 구역·대기 조건·진행성의 구분을 정리한다.
- [[동시성]] — 여러 실행 주체의 겹치는 진행과 공유 상태를 다루는 상위 개념이다.
- [[운영체제]] — 모니터가 제안된 시스템 소프트웨어의 자원 관리 맥락을 확인한다.
- [[한 프로그램의 순서는 여러 실행 주체에서 어떻게 보존되는가]] — 모듈 안의 배타적 접근과 메모리·객체 수준 순서 계약을 비교한다.
