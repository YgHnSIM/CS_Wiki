---
title: "Spanner: Google's Globally-Distributed Database"
aliases: ["Spanner - Google's Globally-Distributed Database", Spanner, Spanner 논문, Corbett et al. 2012]
summary: "Paxos 복제와 시간 불확실성 범위를 노출하는 TrueTime을 결합해 전역 분산 데이터베이스의 외부 일관성 트랜잭션을 구현한 Corbett 등의 2012년 Spanner 논문."
tags: [type/reference, domain/distributed-systems, domain/systems, domain/database, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2012
historical_layer: service
capability_layers: [scalability, reliable-results]
sources: ["Spanner - Google's Globally-Distributed Database"]
source_id: ref-089
source_kind: external
primary_sources: ["James C. Corbett et al., Spanner: Google's Globally-Distributed Database, OSDI 2012, pp. 251–264"]
supporting_sources: ["USENIX OSDI 2012 presentation and open-access proceedings record"]
source_urls: ["https://www.usenix.org/conference/osdi12/technical-sessions/presentation/corbett", "https://www.usenix.org/system/files/conference/osdi12/osdi12-final-16.pdf"]
retrieved: 2026-07-25
version: "OSDI '12 proceedings, pp. 251–264"
snapshot_status: external-only
status: active
graph_id: reference-spanner-globally-distributed-database
graph_visibility: public
---

## 개요

[[Spanner - Google's Globally-Distributed Database]]는 James C. Corbett 등 연구진이 2012년 OSDI에서 발표한 전역 분산 데이터베이스 연구다. Spanner는 데이터를 Paxos 상태 기계들로 샤딩·동기 복제하고, 다중 버전 저장과 분산 트랜잭션을 제공한다. 논문은 이를 대규모 지리적 분산 환경에서 외부 일관성(external consistency)을 제공하는 시스템으로 설명한다.

외부 일관성은 완료된 트랜잭션의 실제 시간 순서와 관측 가능한 직렬 순서가 어긋나지 않게 하는 성질이다. 이는 복제본이 “대체로 최신”이라는 말보다 강한 계약이다. Spanner는 각 Paxos 그룹의 리더가 쓰기를 순서화하고, 여러 그룹을 건너는 트랜잭션에는 2단계 커밋을 사용한다. 따라서 복제 로그의 순서 보장과 다중 그룹의 트랜잭션 조정은 같은 단계가 아니다.

## TrueTime과 대기 비용

Spanner의 TrueTime API는 하나의 정확한 현재 시각 대신 실제 시간이 들어 있다고 보장되는 시간 구간을 돌려준다. 이 시간 불확실성은 숨겨진 오차가 아니라 시스템이 관찰·대기할 수 있는 값이다. 커밋 뒤에는 외부 일관성을 보존하려고 불확실성 범위가 지나갈 때까지 기다리는 commit wait가 필요할 수 있다.

따라서 TrueTime은 네트워크 지연이나 합의 비용을 없애는 마법의 전역 시계가 아니다. 더 강한 시간 순서 계약을 제공하는 대신, 시계 불확실성·복제·트랜잭션 조정이 종단 지연의 일부가 되게 한다. 실제 대기 시간은 배치, 리더 위치, 네트워크, 부하, 시간 불확실성에 따라 달라지며 논문의 수치를 다른 서비스에 일반화할 수 없다.

## 무엇과 구분해야 하는가

- Paxos 그룹의 복제와 장애 조치는 데이터 조각의 상태 기계 복제 계층이다.
- 다중 Paxos 그룹의 원자적 커밋은 여러 조각을 함께 바꾸는 트랜잭션 계층이다.
- TrueTime은 시간 불확실성의 경계를 드러내 외부 일관성의 순서 판단을 돕는 시간 계층이다.
- 이 논문은 모든 분산 서비스가 전역 동기 시계를 가져야 한다거나, 강한 일관성이 항상 가장 좋은 제품 선택이라고 주장하지 않는다.

## 인용할 만한 구절

> “bounded time uncertainty”

TrueTime이 시간 오차를 무시하지 않고 경계가 있는 구간으로 시스템에 노출한다는 핵심을 압축한다.

## 위키 반영

이 자료는 [[외부 일관성과 시간 불확실성]]에서 시간 구간·커밋 대기·전역 순서의 관계를 직접 뒷받침한다. [[꼬리 지연 시간]]과 [[분산 서비스는 빠른 응답과 같은 상태를 어떻게 함께 보장하는가]]에는 강한 상태 계약이 종단 지연의 측정 경계를 넓히는 사례로 연결한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[외부 일관성과 시간 불확실성]] | Paxos 상태 기계, 다중 그룹 트랜잭션, TrueTime 불확실성·commit wait를 결합한 외부 일관성 사례를 제공한다. | [[Spanner - Google's Globally-Distributed Database]] |
| implements | [[복제 로그와 합의]] | 데이터 조각을 Paxos 상태 기계로 동기 복제하고 리더가 쓰기를 순서화하는 구현 계층을 보여 준다. | [[Spanner - Google's Globally-Distributed Database]] |

## 출처

- USENIX, [OSDI 2012 presentation and bibliographic record](https://www.usenix.org/conference/osdi12/technical-sessions/presentation/corbett)
- USENIX, [open-access paper PDF](https://www.usenix.org/system/files/conference/osdi12/osdi12-final-16.pdf)

## 관련 항목

- [[외부 일관성과 시간 불확실성]] — 실제 시간 순서와 커밋 대기를 분리해 설명한다.
- [[복제 로그와 합의]] — 상태 기계 복제와 다중 그룹 트랜잭션의 계층을 구분한다.
- [[CAP 정리]] — 분할 중 일관성과 가용성의 이론적 경계를 확인한다.
- [[꼬리 지연 시간]] — 강한 상태 계약에 포함되는 대기·조정 비용을 서비스 분포에서 측정한다.
