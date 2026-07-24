---
title: NP-완전
aliases: [NP-complete, NP 완전성, NP complete]
summary: "지정한 다항 시간 환원 아래 NP에 속하고 NP의 모든 문제를 그 문제로 환원할 수 있을 때 부여하는, 문제 클래스 안의 대표 난이도 개념."
tags: [type/concept, domain/computer-science, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 1971
historical_layer: theory
capability_layers: [complexity]
sources: ["The Complexity of Theorem-Proving Procedures", "Reducibility Among Combinatorial Problems"]
status: active
graph_id: concept-np-completeness
graph_visibility: public
---

## 개요

[[NP-완전]](NP-complete)은 어떤 결정 문제가 두 조건을 만족할 때 쓰는 복잡도 이론의 분류다. 첫째, 그 문제는 NP에 속한다. 둘째, NP의 모든 문제가 지정한 다항 시간 환원 아래 그 문제로 환원된다. 이때 그 문제는 NP 안의 대표적인 난이도를 갖는다고 말한다.

[[The Complexity of Theorem-Proving Procedures]]은 다항 시간 비결정적 계산과 대표 문제의 환원 관계를 연결했고, [[Reducibility Among Combinatorial Problems]]은 이 틀을 여러 조합적 결정 문제로 넓혔다. 다만 두 원전이 사용하는 환원 모형과 표기는 현대 교재의 정식화와 완전히 같지 않을 수 있으므로, 이 개념을 적용할 때는 어떤 환원을 썼는지 함께 적어야 한다.

## 무엇을 뜻하는가

| 항목 | 뜻 |
|---|---|
| NP에 속함 | 제시된 후보 해답을 다항 시간 안에 검증할 수 있는 결정 문제라는 조건이다. |
| NP-난해성 | NP의 모든 문제가 그 문제로 환원된다는 조건이다. |
| NP-완전 | 위 두 조건을 모두 만족한다는 뜻이다. |

이 정의는 결정 문제의 예·아니오 답을 대상으로 한다. 최적화·검색 문제를 설명할 때는 보통 임계값을 둔 결정형으로 바꾸거나, 어떤 관계를 이용하는지 별도로 밝혀야 한다.

## 자주 생기는 오해

- NP는 “다항 시간이 아니다”의 약자가 아니며, P와 NP가 같은지는 알려지지 않았다.
- NP-완전은 특정 입력을 반드시 느리게 푼다는 실측 주장이나, 모든 휴리스틱·근사 알고리즘이 쓸모없다는 뜻이 아니다.
- NP-완전성은 환원 종류와 문제 정의에 의존한다. 결정형을 생략하거나 환원 방향을 뒤집으면 의미가 바뀐다.
- 빠른 하드웨어가 있어도 이론적 분류가 바로 바뀌지는 않지만, 실제로 처리 가능한 입력 규모와 구현의 교차점은 바뀔 수 있다.

## 컴퓨팅 능력과의 관계

NP-완전성은 “더 빠른 기계”라는 말을 해석할 때 입력 규모와 알고리즘을 먼저 물어야 하는 이유를 제공한다. 하드웨어가 일정 배 빨라지면 같은 알고리즘의 상수는 줄어들 수 있다. 하지만 [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]]가 분석하듯, 알고리즘·문제 공식화·근사 허용 여부를 바꾸면 증가율과 결과 계약 자체가 달라질 수 있다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| narrower | [[계산 복잡도]] | NP-완전성은 복잡도 클래스와 지정한 다항 시간 환원으로 정의되는 대표 난이도다. | [[The Complexity of Theorem-Proving Procedures]] |
| prerequisite_for | [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]] | 하드웨어 속도 향상과 알고리즘·문제 구조의 변화가 서로 다른 질문임을 판단하는 이론적 기준을 제공한다. | [[Reducibility Among Combinatorial Problems]] |

## 출처

- [[The Complexity of Theorem-Proving Procedures]]
- [[Reducibility Among Combinatorial Problems]]

## 관련 항목

- [[다항 시간 환원]] — NP-완전성을 정의하는 환원 관계의 방향과 종류를 확인한다.
- [[계산 복잡도]] — NP·완전성·점근 자원 분석이 놓이는 더 넓은 이론을 정리한다.
- [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]] — 이론 분류를 실제 성능·입력 규모와 연결해 분석한다.
