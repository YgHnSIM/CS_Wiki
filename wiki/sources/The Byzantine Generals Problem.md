---
title: The Byzantine Generals Problem
aliases: [비잔틴 장군 문제, Lamport Shostak Pease 1982]
summary: "서로 다른 정보를 보내는 결함 구성요소가 있어도 분산된 참여자가 일관된 결정을 내리기 위한 조건과 한계를 정식화한 Lamport, Shostak, Pease의 1982년 논문."
tags: [type/reference, domain/computer-science, domain/systems, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 1982
historical_layer: theory
capability_layers: [scalability, reliable-results]
sources: ["The Byzantine Generals Problem"]
source_id: ref-063
source_kind: external
primary_sources: ["Leslie Lamport, Robert Shostak, and Marshall Pease, The Byzantine Generals Problem, ACM Transactions on Programming Languages and Systems 4(3), 1982, pp. 382–401"]
supporting_sources: ["Microsoft Research publication page and author-hosted PDF", "ACM DOI record"]
source_urls: ["https://doi.org/10.1145/357172.357176", "https://www.microsoft.com/en-us/research/?p=338450", "https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/The-Byzantine-Generals-Problem.pdf"]
retrieved: 2026-07-24
version: "ACM Transactions on Programming Languages and Systems 4(3), July 1982, pp. 382–401"
snapshot_status: external-only
status: active
graph_id: reference-byzantine-generals-problem
graph_visibility: public
---

## 개요

[[The Byzantine Generals Problem]]은 Leslie Lamport, Robert Shostak, Marshall Pease가 1982년에 발표한 논문으로, 일부 참여자가 서로 모순되는 정보를 보내거나 임의로 행동할 수 있는 분산 환경에서 충성스러운 참여자들이 어떻게 같은 결정을 내릴 수 있는지를 다룬다. 논문은 이를 장군과 전령의 비유로 설명하지만, 핵심은 [[비잔틴 장애]]라는 실패 모형과 합의 조건의 경계를 분명히 하는 데 있다.

저자들은 모든 충성스러운 부관이 같은 명령을 따라야 하고, 충성스러운 지휘관의 명령은 충성스러운 부관에게 전달되어야 한다는 두 일관성 조건을 둔다. 서명 없는 구두 메시지(oral messages) 모형에서는 최대 `m`명의 배신자가 있을 때 장군 수가 `3m + 1`보다 많아야 해결할 수 있음을 보인다. 이는 특정 구현의 성능 수치가 아니라, 메시지 위조·전달 실패·시간에 관한 가정을 둔 이론적 경계다.

서명된 메시지(signed messages) 모형에서는 서명의 위조 불가능성과 검증 가능성을 추가한다. 이때 논문은 서로 다른 알고리즘과 가능 조건을 제시한다. 따라서 “서명이 있으면 모든 분산 장애가 해결된다”가 아니라, 실패 모형과 신뢰할 수 있는 인증 수단을 바꾸면 가능한 합의의 조건도 바뀐다는 점이 핵심이다.

## 주요 인사이트

- 결함은 단순한 정지나 누락만이 아니라, 참여자마다 서로 다른 잘못된 정보를 보내는 임의 행동일 수 있다.
- 일관된 결정의 가능 여부는 참여자 수뿐 아니라 메시지 인증, 전달과 시간에 관한 가정에 의존한다.
- 구두 메시지 모형의 `3m + 1` 조건은 해당 모형의 상한·하한 결과이며, 임의의 실제 시스템에 그대로 대입할 운영 규칙이 아니다.
- 비잔틴 합의가 보장하는 것은 충성스러운 참여자 사이의 일관성이지, 처음 입력된 명령 자체가 의미 있거나 올바르다는 보장은 아니다.
- 시간 제한을 이용하는 구현은 최대 전달 지연과 시계 오차에 관한 추가 가정을 명시해야 한다.

## 인용할 만한 구절

> “reliable computer systems must handle malfunctioning components”

신뢰할 수 있는 컴퓨터 시스템은 오작동하는 구성요소를 다뤄야 한다는 논문의 출발점이다.

## 위키 반영

이 자료는 [[결함 허용]]을 단순한 중복 배치보다 넓은 실패 모형의 문제로 확장한다. [[비잔틴 장애]]에서는 구두·서명 메시지 모형의 조건을 구분하고, [[빠른 서비스는 왜 가용한 서비스를 보장하지 않는가]]에서는 빠른 응답의 측정과 일관된 결과·장애 복구의 측정을 분리하는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[비잔틴 장애]] | 상호 모순된 메시지를 보내는 참여자를 포함하는 실패 모형과 합의 조건을 정식화한다. | [[The Byzantine Generals Problem]] |
| constrains | [[결함 허용]] | 가능한 보장의 범위가 실패 모형과 인증·시간 가정에 따라 달라짐을 보인다. | [[The Byzantine Generals Problem]] |

## 출처

- ACM, [DOI record](https://doi.org/10.1145/357172.357176)
- Microsoft Research, [publication page](https://www.microsoft.com/en-us/research/?p=338450)
- Microsoft Research, [author-hosted PDF](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/The-Byzantine-Generals-Problem.pdf)

## 관련 항목

- [[비잔틴 장애]] — 논문의 실패 모형과 보장 조건을 일반 개념으로 정리한다.
- [[결함 허용]] — 장애가 있어도 서비스 목표를 유지하려는 더 넓은 시스템 설계 문제를 연결한다.
- [[가용성과 복구]] — 합의 보장과 사용자가 관측하는 서비스 복구 지표를 구분해 읽는다.
- [[빠른 서비스는 왜 가용한 서비스를 보장하지 않는가]] — 속도 측정과 장애·복구 측정을 함께 비교한다.
