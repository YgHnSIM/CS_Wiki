---
title: In Search of an Understandable Consensus Algorithm
aliases: [Raft, Raft 논문, Ongaro Ousterhout 2014, Raft consensus paper]
summary: "리더 선출, 로그 복제, 안전성을 분리해 강한 리더 기반 복제 로그 합의를 설명한 Ongaro와 Ousterhout의 2014년 Raft 논문."
tags: [type/reference, domain/computer-science, domain/distributed-systems, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2014
historical_layer: system
capability_layers: [scalability, reliable-results]
sources: [In Search of an Understandable Consensus Algorithm]
source_id: ref-088
source_kind: external
primary_sources: ["Diego Ongaro and John Ousterhout, In Search of an Understandable Consensus Algorithm, USENIX ATC 2014, pp. 305–319"]
supporting_sources: ["USENIX ATC 2014 presentation and open-access proceedings record"]
source_urls: ["https://www.usenix.org/conference/atc14/technical-sessions/presentation/ongaro", "https://www.usenix.org/system/files/conference/atc14/atc14-paper-ongaro.pdf"]
retrieved: 2026-07-25
version: "USENIX ATC '14 proceedings, pp. 305–319"
snapshot_status: external-only
status: active
graph_id: reference-raft-consensus
graph_visibility: public
---

## 개요

[[In Search of an Understandable Consensus Algorithm]]은 Diego Ongaro와 John Ousterhout가 2014년 USENIX ATC에서 발표한 Raft 합의 알고리즘 논문이다. Raft는 여러 서버가 동일한 명령 순서를 가진 로그를 유지하게 하여, 각 서버가 같은 결정적 상태 기계를 실행할 수 있게 하는 복제 로그 합의 알고리즘이다.

저자들은 합의 문제를 리더 선출, 로그 복제, 안전성으로 나누고 강한 리더(leader) 구조를 택한다. 클라이언트 명령은 리더가 로그에 받아 팔로워에게 복제하며, 필요한 확인 뒤에만 적용 가능하다고 알린다. 리더가 실패하면 새 선출을 통해 로그를 이어받는 리더를 정한다. 이 분해는 다중 Paxos와 동등한 합의 범주를 더 이해하기 쉬운 구조로 제시하려는 설계 선택이다.

## 안전성과 생존성의 구분

Raft의 안전성은 같은 로그 위치에 서로 다른 명령이 확정되는 일을 막고, 확정된 항목이 이후 리더에게 보존되도록 하는 성질이다. 그러나 안전한 로그가 즉시 응답한다는 뜻은 아니다. 리더를 선출하지 못하거나 필요한 통신이 끊기면 진행(liveness)이 멈출 수 있다. 요청 기한, 재시도, 거부 정책과 사용자에게 보이는 가용성은 이 프로토콜 조건 위에서 별도로 설계·측정해야 한다.

또한 Raft는 정지·재시작·메시지 지연·유실을 다루는 crash fault 계열의 합의 알고리즘이다. 임의로 거짓 메시지를 만들거나 서로 다른 참여자에게 모순된 상태를 보내는 [[비잔틴 장애]]를 견디는 프로토콜이 아니다. 이 실패 모형의 차이를 숨긴 채 “합의가 있으니 결과가 안전하다”고 일반화해서는 안 된다.

## 상태 기계와 서비스 경계

복제 로그는 상태 변경 명령의 **순서**를 맞추는 수단이다. 명령 자체가 올바른 입력인지, 애플리케이션 로직이 결정적인지, 외부 부작용을 중복 없이 처리하는지, 읽기와 다중 로그 트랜잭션이 어떤 일관성을 요구하는지는 추가 계약이다. [[Spanner - Google's Globally-Distributed Database]]는 여러 Paxos 그룹의 데이터와 전역 트랜잭션을 조합할 때 복제 로그만으로 충분하지 않은 계층을 보여 준다.

## 인용할 만한 구절

> “leader election, log replication, and safety”

Raft가 합의 문제를 세 부분으로 분해해 설명하는 핵심 구성을 압축한다.

## 위키 반영

이 자료는 [[복제 로그와 합의]]에서 리더 선출·복제·확정·적용의 흐름과 crash fault 경계를 설명하는 직접 근거다. [[분산 서비스는 빠른 응답과 같은 상태를 어떻게 함께 보장하는가]]에서는 안전성과 진행성, 그리고 사용자 기한을 같은 성질로 합치지 않는 기준으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[복제 로그와 합의]] | 리더 선출, 리더에서 팔로워로의 로그 복제, 확정된 로그의 안전성이라는 Raft의 구조를 제공한다. | [[In Search of an Understandable Consensus Algorithm]] |
| constrains | [[결함 허용]] | 정지·재시작을 가정한 Raft의 보장을 비잔틴 행동까지 포함하는 일반 결함 허용으로 확대하지 않도록 실패 모형을 제한한다. | [[In Search of an Understandable Consensus Algorithm]] |

## 출처

- USENIX, [ATC 2014 presentation and bibliographic record](https://www.usenix.org/conference/atc14/technical-sessions/presentation/ongaro)
- USENIX, [open-access paper PDF](https://www.usenix.org/system/files/conference/atc14/atc14-paper-ongaro.pdf)

## 관련 항목

- [[복제 로그와 합의]] — Raft의 구조를 일반적인 상태 기계 복제의 경계 안에서 설명한다.
- [[결함 허용]] — 합의 프로토콜의 실패 가정과 서비스 복구를 구분한다.
- [[비잔틴 장애]] — Raft가 다루지 않는 임의·모순 행동의 실패 모형이다.
- [[외부 일관성과 시간 불확실성]] — 복제 로그 위에 다중 그룹 트랜잭션·전역 순서가 더해지는 층을 다룬다.
