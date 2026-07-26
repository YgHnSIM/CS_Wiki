---
schema_version: 2
id: ref-092
kind: reference
title: Cooperating Sequential Processes
aliases:
  - Dijkstra 1968
  - EWD 123
  - Cooperating sequential processes
  - 협력하는 순차 프로세스
summary: 공유 변수와 통신을 통해 협력하는 순차 프로세스의 상호 배제, 세마포어, 대기 조건과 교착 상태를 다룬 Dijkstra의 1968년 고전적 동시성 연구.
domains:
  - computer-science
  - operating-systems
  - software-engineering
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:492a8d26e835d845c90a7bef4bb2241407ad6a0870c9aeab50bcc044f4a1dcb7
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - scalability
  - reliable-results
history:
  publication_year: 1968
  note: EWD 123 초고의 논의를 바탕으로 1968년 NATO Advanced Study Institute의 Programming Languages 수록본을 기준 판본으로 삼는다.
  layer: theory
redirect_from:
  - /references/cooperating-sequential-processes/
  - /sources/cooperating-sequential-processes/
origin: external
works:
  primary:
    - citation: "Edsger W. Dijkstra, Cooperating Sequential Processes, in Programming Languages: NATO Advanced Study Institute, ed. F. Genuys, Academic Press, 1968, pp. 43–112"
      genre: other
      identifiers: []
      edition: "Programming Languages: NATO Advanced Study Institute, 1968, pp. 43–112"
  supporting:
    - citation: E.W. Dijkstra Archive EWD 123 transcription
      genre: official-record
      identifiers: []
      edition: null
    - citation: E.W. Dijkstra Archive BibTeX index
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://www.cs.utexas.edu/~EWD/transcriptions/EWD01xx/EWD123.html
    retrieved: 2026-07-25
    version: "Programming Languages: NATO Advanced Study Institute, 1968, pp. 43–112"
  - kind: url
    role: mirror
    url: https://www.cs.utexas.edu/~EWD/indexBibTeX.html
    retrieved: 2026-07-25
    version: "Programming Languages: NATO Advanced Study Institute, 1968, pp. 43–112"
---

## 개요

[[Cooperating Sequential Processes]]는 Edsger W. Dijkstra가 여러 순차 프로세스가 제한된 통신 수단과 공유 상태를 통해 협력할 때 생기는 논리적 문제를 다룬 연구다. 1968년 수록본은 단일 순차 과정의 실행 순서와, 여러 과정이 서로의 속도 비율을 가정하지 않고 협력해야 하는 상황을 구분한다.

이 자료는 한 번에 하나의 프로세스만 임계 구역(critical section)에 들어가게 하는 [[상호 배제와 동기화]] 문제를 단계적으로 검토한다. 공유 변수의 읽기와 쓰기를 분리해 조합하면 두 프로세스가 모두 안전하다고 판단해 임계 구역에 들어갈 수 있음을 보이고, 이를 피하기 위한 동기화 원시 연산과 세마포어를 논의한다.

또한 일반 세마포어, 유한 버퍼, 상태 변수, 교착 상태(deadly embrace), 은행원 알고리즘을 함께 다룬다. 따라서 이 글은 특정 운영체제 API의 사양이라기보다, 공유 자원 접근·대기·진행 조건을 분리해 추론하는 초기 틀로 읽는 편이 정확하다.

## 주요 인사이트

- 여러 실행 주체가 협력할 때 각 주체 내부의 순서만으로는 공유 상태의 안전성을 설명할 수 없다.
- 상호 배제는 임계 구역의 동시 진입을 막는 안전성 조건이며, 한 프로세스의 정지가 다른 프로세스의 영구 대기를 일으키지 않게 하는 진행 조건과 구분해야 한다.
- 공유 변수의 관찰·갱신을 어떤 원자적 단위로 가정하는지가 알고리즘의 올바름 증명에 직접 들어간다.
- 세마포어와 상태 변수는 실행 속도 비율을 전제하지 않고 대기와 재개를 표현하려는 수단으로 제시된다.
- 이 자료의 예시를 현대 언어·하드웨어의 정확한 메모리 모형이나 공정성 보장으로 그대로 확대해서는 안 된다.

## 인용할 만한 구절

> “the cooperation between two or more sequential processes”
<!-- wiki-v2:quote-locator evidence="ref-092" locator="wiki/sources/Cooperating Sequential Processes.md:line-19#인용할-만한-구절" status="recorded" -->

자료가 다루는 대상은 하나의 빠른 계산이 아니라 여러 순차 과정 사이의 협력이다.

## 위키 반영

이 자료는 [[동시성]]에서 병렬 실행과 협력 실행의 문제를 분리하는 출발점이며, [[상호 배제와 동기화]]에서 임계 구역·대기·진행 조건을 다루는 직접 근거다. [[한 프로그램의 순서는 여러 실행 주체에서 어떻게 보존되는가]]는 이 틀을 메모리 순서와 객체 수준 결과 계약으로 이어서 비교한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[동시성]] | 여러 순차 프로세스가 속도 비율 가정 없이 통신·공유 상태를 통해 협력하는 문제를 정식 탐구 대상으로 제시한다. | [[Cooperating Sequential Processes]] |
| enables | [[상호 배제와 동기화]] | 임계 구역의 동시 진입 방지, 대기 조건, 세마포어를 통해 공유 자원 접근을 조정하는 문제를 구체화한다. | [[Cooperating Sequential Processes]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- E.W. Dijkstra Archive, [EWD 123 transcription](https://www.cs.utexas.edu/~EWD/transcriptions/EWD01xx/EWD123.html)
- E.W. Dijkstra Archive, [BibTeX index](https://www.cs.utexas.edu/~EWD/indexBibTeX.html)

## 관련 항목

- [[동시성]] — 독립적으로 진행하는 실행 주체 사이의 순서·공유 상태 문제를 개념적으로 정리한다.
- [[상호 배제와 동기화]] — 임계 구역, 대기 조건과 진행성의 경계를 분리한다.
- [[운영체제]] — 프로세스·자원·입출력 조정이 시스템 소프트웨어에서 만나는 위치를 확인한다.
- [[한 프로그램의 순서는 여러 실행 주체에서 어떻게 보존되는가]] — 단일 제어 흐름에서 공유 상태 계약으로 넘어가는 논리를 종합한다.
