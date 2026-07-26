---
title: "Dynamo: Amazon's Highly Available Key-value Store"
aliases: ["Dynamo - Amazon's Highly Available Key-value Store", Dynamo 논문, DeCandia et al. 2007, Amazon Dynamo]
summary: "지속적인 서버·네트워크 구성 요소 실패를 전제로, 일관된 해싱·복제·버전 벡터·정족수형 통신·애플리케이션 보조 충돌 해결을 조합한 Amazon의 2007년 고가용 키-값 저장소 연구."
tags: [type/reference, domain/distributed-systems, domain/database, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2007
historical_layer: service
capability_layers: [scalability, reliable-results]
sources: ["Dynamo - Amazon's Highly Available Key-value Store"]
source_id: ref-104
source_kind: external
primary_sources: ["Giuseppe DeCandia, Deniz Hastorun, Madan Jampani, Gunavardhan Kakulapati, Avinash Lakshman, Alex Pilchin, Swaminathan Sivasubramanian, Peter Vosshall, and Werner Vogels, Dynamo: Amazon's Highly Available Key-value Store, SOSP 2007, pp. 205–220"]
supporting_sources: ["Amazon Science publication record and author-hosted paper PDF"]
source_urls: ["https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store", "https://cdn.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf"]
retrieved: 2026-07-25
version: "SOSP 2007 proceedings, pp. 205–220"
snapshot_status: external-only
status: active
graph_id: reference-dynamo-highly-available-key-value-store
graph_visibility: public
---

## 개요

[[Dynamo - Amazon's Highly Available Key-value Store]]는 Giuseppe DeCandia 등 Amazon 연구진이 2007년에 발표한 분산 키-값 저장소 연구다. 논문은 대규모 서비스에서 서버와 네트워크 구성 요소의 실패가 지속적으로 발생한다는 조건 아래, 단순한 기본 키 기반 읽기·쓰기 인터페이스에 높은 가용성과 확장성을 제공하려 했다.

Dynamo는 일관된 해싱으로 데이터를 분할·배치하고 여러 노드에 복제한다. 업데이트 중 복제본 사이의 충돌과 일시적 분할을 다루기 위해 객체 버전, 정족수형 통신, 힌티드 핸드오프, 안티엔트로피 같은 기법을 조합하며, 일부 충돌 해결을 응용에 노출한다.

## 가용성과 일관성의 선택

논문은 특정 실패 상황에서 높은 가용성을 얻기 위해 강한 일관성을 희생한다고 명시한다. 이는 “항상 최신의 한 값”이 필요한 작업과, 일시적인 버전 병존을 받아들이고 나중에 해결할 수 있는 작업을 같은 저장 계약으로 취급하지 않는다는 뜻이다.

객체 버전과 응용 보조 충돌 해결은 시스템이 모든 동시 갱신을 보이지 않게 덮어쓰는 대신, 충돌의 존재를 드러내고 도메인별 병합 책임을 남기는 방식이다. 따라서 Dynamo의 가용성은 데이터 손실·중복·충돌 해결·읽기 의미가 모두 사라진다는 뜻이 아니라, 그 비용과 책임이 어떤 계층에 놓이는지를 바꾼 선택이다.

## 해석 경계

Dynamo는 오늘날의 DynamoDB나 모든 NoSQL 제품의 정확한 구현 명세가 아니다. 논문의 인터페이스, 실패 가정, 복제 파라미터, 당시의 부하와 운영 환경을 보존한 사례다. 또한 높은 가용성이라는 말은 특정 키·연산·실패 조건에서의 서비스 약속을 뜻하며, 사용자 SLO·지연 백분위·트랜잭션 의미를 자동으로 보장하지 않는다.

이 자료는 [[CAP 정리]]의 형식적 결과를 구현 하나로 환원하기보다, 실제 시스템이 분할·복제·버전·응용 병합의 선택을 어떻게 드러내는지 보여 주는 사례로 읽는 것이 적절하다.

## 인용할 만한 구절

> “failure handling as the normal case”

대규모 서비스에서 고장을 특별한 예외가 아니라 정상적인 운영 조건으로 받아들이는 태도를 압축한다.

## 위키 반영

이 자료는 [[부분 실패]]에서 응답·복제·버전이 일부 노드의 상태에 따라 갈라질 수 있는 분산 저장의 사례다. [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]]에는 단일한 로컬 쓰기 결과가 원격 복제 환경에서는 버전·정족수·충돌 해결 계약으로 바뀌는 사례를 제공한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[부분 실패]] | 지속적인 서버·네트워크 구성 요소 실패 속에서 복제·버전·응용 보조 충돌 해결을 조합한 저장 시스템 사례를 제공한다. | [[Dynamo - Amazon's Highly Available Key-value Store]] |
| enables | [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]] | 단일 키 갱신의 결과가 원격 복제 환경에서는 버전 병존·정족수·충돌 해결의 계약으로 바뀌는 사례를 제공한다. | [[Dynamo - Amazon's Highly Available Key-value Store]] |

## 출처

- Amazon Science, [publication record](https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store)
- Amazon Science, [paper PDF](https://cdn.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf)

## 관련 항목

- [[부분 실패]] — 일부 노드·통신 경로의 실패가 남긴 버전·응답·복구 상태를 설명한다.
- [[CAP 정리]] — 분할 중 응답 보장과 원자적 일관성의 이론적 경계를 정의한다.
- [[복제 로그와 합의]] — 한 순서를 확정하는 강한 복제 계층과 비교한다.
- [[외부 일관성과 시간 불확실성]] — 버전 병존과 다른 전역 시간 순서 계약을 다룬다.
