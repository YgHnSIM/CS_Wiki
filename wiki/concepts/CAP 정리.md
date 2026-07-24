---
title: CAP 정리
aliases: [CAP theorem, CAP, Brewer 정리, 일관성 가용성 분할 허용성]
summary: "비동기 네트워크 분할 모형에서 선형화 가능한 원자적 일관성과 모든 비고장 노드의 응답 보장을 동시에 만족할 수 없다는 분산 시스템의 불가능성 정리."
tags: [type/concept, domain/computer-science, domain/distributed-systems, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2002
historical_layer: theory
capability_layers: [scalability, reliable-results]
sources: ["Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"]
status: active
graph_id: concept-cap-theorem
graph_visibility: public
---

## 개요

[[CAP 정리]]는 네트워크가 비동기적이고 메시지가 임의로 유실될 수 있는 분할 모형에서, 원자적 일관성(atomic consistency), 가용성(availability), 분할 허용성(partition tolerance)을 동시에 보장하는 구현은 없다는 결과다. 이 정리는 복제된 상태를 여러 노드가 바꿀 때 어떤 응답 약속이 서로 충돌하는지를 형식적으로 제한한다.

여기서 일관성은 흔한 “데이터가 대체로 맞다”는 말보다 강한 선형화 가능성이다. 각 연산은 호출과 응답 사이의 한 시점에 일어난 것처럼 보여야 하고 실제 시간 순서도 보존해야 한다. 가용성은 고장 나지 않은 노드에 도착한 요청이 **결국** 응답을 받는 성질이다. 응답이 몇 밀리초 안에 끝나야 한다는 SLO나 월간 가동률과는 다른 정의다.

## 세 성질을 읽는 방법

| 성질 | 이 정리에서의 의미 | 운영에서 추가로 정해야 할 것 |
|---|---|---|
| 원자적 일관성 | 연산이 하나의 전역 순서로, 실제 시간 순서를 보존하며 보인다 | 읽기·쓰기·트랜잭션의 범위와 충돌·오래된 읽기 허용 여부 |
| 가용성 | 비고장 노드에 도착한 요청은 언젠가 응답을 받는다 | 기한, 실패 응답의 의미, 재시도·거부·부분 기능 규칙 |
| 분할 허용성 | 네트워크 메시지가 유실돼 참여자 사이 통신이 갈라질 수 있다 | 분할 감지, 복구 뒤 병합, 데이터 손실·중복 처리 |

따라서 CAP은 “C·A·P 중 두 가지를 한 번 고른다”는 고정된 선택표가 아니다. 분할이 일어나는 동안 해당 일관성을 지킬지, 일부 요청의 응답 보장을 포기할지, 또는 둘의 정의를 어떻게 약화할지를 묻는 경계다. 분할이 없는 정상 상태에서의 평균 지연·처리량이나 장애 이후의 사용자 복구 시간을 직접 계산하지는 않는다.

## 서비스 가용성과의 구분

[[가용성과 복구]]가 묻는 것은 사용자가 기능·품질·기한을 받는지와 장애 뒤 얼마나 안전하게 되돌아오는지다. CAP의 가용성은 훨씬 좁고 형식적인 응답 성질이다. 예를 들어 오래된 값을 반환하거나 충돌을 나중에 해결하는 응답이 CAP 모형에서는 가용할 수 있어도, 특정 제품의 정확성 계약이나 사용자 SLO에는 맞지 않을 수 있다.

반대로 일관성을 위해 리더·정족수·트랜잭션 조정을 기다리는 설계는 분할과 실패 조건에서 일부 요청을 거부·지연시킬 수 있다. 이 지연을 “CAP 비용” 하나로 환원할 수는 없다. [[복제 로그와 합의]]의 안전성·진행성 조건, [[외부 일관성과 시간 불확실성]]의 전역 순서·시간 대기, 그리고 실제 운영의 재시도·복구 정책을 각각 기록해야 한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[가용성과 복구]] | 분할 중의 응답 보장은 복제 상태의 선형화 가능성과 독립적으로 주장할 수 없으므로, 운영 가용성의 정의에 일관성·응답 의미를 함께 명시하게 한다. | [[Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services]] |

## 출처

- [[Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services]]

## 관련 항목

- [[복제 로그와 합의]] — 정지 장애 모형에서 여러 복제본의 명령 순서를 맞추는 계층을 다룬다.
- [[외부 일관성과 시간 불확실성]] — 전역 순서와 시간 불확실성이 만드는 추가 계약을 설명한다.
- [[가용성과 복구]] — 사용자 품질·탐지·복구 시간을 운영 지표로 분리한다.
- [[분산 서비스는 빠른 응답과 같은 상태를 어떻게 함께 보장하는가]] — CAP의 형식적 경계와 실제 서비스 측정을 종합한다.
