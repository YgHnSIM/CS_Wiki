---
title: There's Plenty of Room at the Top
aliases: ["There’s plenty of room at the Top: What will drive computer performance after Moore’s law?", Leiserson et al. 2020, 포스트 무어 시대의 성능]
summary: "반도체 미세화 둔화 이후 성능 향상의 주요 여지를 소프트웨어, 알고리즘과 하드웨어 아키텍처의 공동 개선에서 찾는 Leiserson 등 연구진의 2020년 Science 논문."
tags: [type/reference, domain/computer-architecture, domain/computer-science, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2020
historical_layer: architecture
capability_layers: [complexity, realized-performance, resource-efficiency]
sources: ["There's Plenty of Room at the Top"]
source_id: ref-068
source_kind: external
primary_sources: ["Charles E. Leiserson et al., There’s plenty of room at the Top: What will drive computer performance after Moore’s law?, Science 368(6495), 2020"]
supporting_sources: ["Science article landing page"]
source_urls: ["https://doi.org/10.1126/science.aam9744"]
retrieved: 2026-07-24
version: "Science 368(6495), 5 June 2020"
snapshot_status: external-only
status: active
graph_id: reference-plenty-room-at-top
graph_visibility: public
---

## 개요

[[There's Plenty of Room at the Top]]은 Charles E. Leiserson 등 연구진이 2020년에 발표한 Science 논문이다. 논문은 오랜 기간 컴퓨터 성능 향상을 이끈 반도체 트랜지스터 미세화가 한계에 가까워지는 상황에서, 성능 향상의 중요한 여지를 컴퓨팅 스택의 ‘위쪽’, 즉 소프트웨어·알고리즘·하드웨어 아키텍처의 개선에서 찾는다.

저자들은 이 경로의 개선이 자동적이거나 균일하지 않다고 명시한다. 미세화가 주던 비교적 지속적인 향상과 달리, 상위 스택의 개선은 기회주의적이고 불균등하며 산발적일 수 있고 수확 체감의 영향을 받는다. 따라서 이 논문은 “알고리즘이 언제나 하드웨어보다 중요하다”는 명제가 아니라, 성능을 높이는 수단이 공정 미세화만으로 환원되지 않는다는 분석이다.

논문은 큰 시스템 구성요소(big components)를 이러한 공동 개선을 다룰 유망한 맥락으로 제시한다. 실제 효과는 작업 정의, 입력 규모, 알고리즘·구현 변경, 하드웨어 특성, 에너지와 품질 조건을 같이 측정해야 판단할 수 있다.

## 주요 인사이트

- 반도체 미세화가 둔화할수록 성능 향상은 소프트웨어·알고리즘·아키텍처의 공동 개선에 더 의존한다.
- 상위 스택의 개선은 자동적인 세대별 향상이 아니라 기회·도메인·구현 조건에 따라 불균등하게 나타난다.
- 알고리즘 개선은 연산 수의 증가율을 바꿀 수 있지만, 실제 성능은 데이터 이동, 병렬성, 구현과 하드웨어의 제약을 함께 받는다.
- 하드웨어 아키텍처의 변화도 작업과 소프트웨어가 이용할 수 있을 때만 유효한 성능으로 전환된다.
- 성능 향상은 속도만이 아니라 자원 효율과 큰 시스템 구성의 설계 문제로 다뤄야 한다.

## 인용할 만한 구절

> “opportunistic, uneven, and sporadic”

저자들은 상위 스택에서의 성능 향상이 미세화 시대의 자동적인 개선과 다르다고 설명한다.

## 위키 반영

이 자료는 [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]]에서 알고리즘·소프트웨어·아키텍처의 개선을 경쟁하는 단일 지표가 아니라 함께 측정해야 할 수단으로 다룬다. [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]의 실현 성능 조건과 [[계산 복잡도]]의 점근적 자원 증가를 현대 성능 맥락에서 잇는 보조 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[계산 복잡도]] | 알고리즘의 자원 증가율과 실제 하드웨어·소프트웨어 설계의 개선을 함께 성능 향상 수단으로 다룬다. | [[There's Plenty of Room at the Top]] |
| responds_to | [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]] | 공정 미세화 둔화 뒤 성능 향상을 소프트웨어·알고리즘·아키텍처의 공동 문제로 재구성한다. | [[There's Plenty of Room at the Top]] |

## 출처

- Science, [DOI record and article page](https://doi.org/10.1126/science.aam9744)

## 관련 항목

- [[계산 복잡도]] — 알고리즘이 요구하는 자원의 증가율을 분리해 본다.
- [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]] — 알고리즘·하드웨어 개선의 비교 조건을 분석한다.
- [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]] — 하드웨어 잠재력이 실제 실행 시간으로 바뀌는 조건을 다룬다.
- [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]] — 성능 향상의 제약이 전력과 자원 효율로 확장되는 흐름을 다룬다.
