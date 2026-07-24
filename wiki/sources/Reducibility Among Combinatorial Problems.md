---
title: Reducibility Among Combinatorial Problems
aliases: [Karp 1972, Karp's 21 problems, 조합 문제 사이의 환원성]
summary: "만족 가능성 문제에서 여러 조합적 결정 문제로의 다항시간 변환을 구성해 완전성 결과를 확장한 Richard M. Karp의 1972년 논문."
tags: [type/reference, domain/computer-science, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 1972
historical_layer: theory
capability_layers: [complexity]
sources: ["Reducibility Among Combinatorial Problems"]
source_id: ref-067
source_kind: external
primary_sources: ["Richard M. Karp, Reducibility Among Combinatorial Problems, in Complexity of Computer Computations, 1972, pp. 85–103"]
supporting_sources: ["Springer chapter record", "Richard M. Karp introduction and reprint access copy"]
source_urls: ["https://doi.org/10.1007/978-1-4684-2001-2_9", "https://link.springer.com/chapter/10.1007/978-1-4684-2001-2_9", "https://www.cs.umd.edu/~gasarch/BLOGPAPERS/Karp.pdf"]
retrieved: 2026-07-24
version: "Complexity of Computer Computations, 1972, pp. 85–103"
snapshot_status: external-only
status: active
graph_id: reference-karp-combinatorial-reducibility
graph_visibility: public
---

## 개요

[[Reducibility Among Combinatorial Problems]]은 Richard M. Karp이 1972년에 발표한 장으로, 만족 가능성 문제에서 출발해 여러 조합적 결정 문제 사이의 다항 시간 환원을 구성한다. 이 작업은 “어려워 보이는 문제”라는 직관을 개별 문제의 인상이나 구현 난이도가 아니라, 다른 문제에서 변환할 수 있는지로 비교하는 방식을 넓혔다.

Karp이 사용한 환원은 입력 `x`를 다항 시간 안에 `f(x)`로 바꾸어, 원래 문제의 예 인스턴스가 변환된 문제의 예 인스턴스와 정확히 대응하도록 하는 다대일 변환의 형태로 읽는다. 이는 Cook 논문의 질의 기계 기반 P-환원보다 더 제한적인 관계다. 따라서 두 논문은 모두 다항 시간 환원을 다루지만, 같은 환원 정의를 쓰지 않는다.

논문이 보여 주는 핵심은 한 대표 문제의 다항 시간 해법이 존재한다면, 그 대표 문제로 환원된 조합적 문제들도 다항 시간 해법을 얻게 된다는 조건부 연결이다. 이 결과는 실제 입력 분포에서의 평균 실행 시간, 근사 해법의 유용성, 특정 인스턴스의 난이도를 직접 예측하지는 않는다.

## 주요 인사이트

- 다항 시간 변환은 서로 다른 조합적 문제의 난이도를 비교하고 전달하는 도구다.
- 한 문제에서 다른 문제로의 환원 방향은 중요하다. `A`가 `B`로 환원되면 `B`의 빠른 해법이 `A`의 빠른 해법을 준다.
- Karp식 다대일 변환은 오라클 질의를 허용하는 Cook식 P-환원과 구분해야 한다.
- 완전성은 선택한 문제 클래스와 환원 종류에 대해 정의되며, 이름만 같은 모든 최적화·검색 문제에 자동으로 적용되지 않는다.
- 어려운 최악 사례의 존재는 특정 입력의 실행 시간, 휴리스틱의 성능이나 근사 품질을 단정하지 않는다.

## 인용할 만한 구절

> “Reducibility Among Combinatorial Problems”

제목 그대로 이 장의 대상은 개별 조합 문제를 공통 환원 관계 안에서 비교하는 일이다.

## 위키 반영

이 자료는 [[다항 시간 환원]]에서 변환의 방향과 현대적 다대일 해석을 설명하는 중심 근거다. [[NP-완전]]에서는 대표 문제 하나의 개선이 여러 문제로 전달되는 조건을, [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]]에서는 문제 구조를 바꾸는 알고리즘 개선과 단순한 기계 속도 향상을 구분하는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[다항 시간 환원]] | 만족 가능성 문제와 여러 조합적 결정 문제 사이의 다항 시간 변환을 구성한다. | [[Reducibility Among Combinatorial Problems]] |
| exemplifies | [[NP-완전]] | 대표 완전 문제에서 조합적 결정 문제로 완전성 결과를 확장하는 사례를 제공한다. | [[Reducibility Among Combinatorial Problems]] |

## 출처

- Springer Nature, [DOI record](https://doi.org/10.1007/978-1-4684-2001-2_9)
- Springer Nature, [chapter record](https://link.springer.com/chapter/10.1007/978-1-4684-2001-2_9)
- University of Maryland, [Karp introduction and reprint access copy](https://www.cs.umd.edu/~gasarch/BLOGPAPERS/Karp.pdf)

## 관련 항목

- [[다항 시간 환원]] — 환원의 방향, 다대일 변환과 질의 기반 환원을 구분한다.
- [[NP-완전]] — 조합적 결정 문제의 완전성이 무엇을 의미하는지 정리한다.
- [[The Complexity of Theorem-Proving Procedures]] — 환원과 완전성의 초기 틀을 제시한 원전이다.
- [[계산 복잡도]] — 입력 규모에 따른 자원 증가율을 분류하는 더 넓은 이론을 제공한다.
