---
title: KV 캐시
aliases: [KV cache, key-value cache, 키-값 캐시, 어텐션 KV 캐시]
summary: "자동회귀 Transformer가 이전 토큰의 어텐션 키와 값을 층별로 보존해 재계산을 피하는 대신, 시퀀스 길이와 동시 요청 수에 비례하는 GPU 메모리를 요구하는 실행 상태."
tags: [type/concept, domain/machine-learning, domain/systems, domain/computer-architecture, status/active]
created: 2026-07-24
updated: 2026-07-25
publication_year: 2022
historical_note: "Transformer의 키·값 재사용은 이전부터 가능했지만, 자동회귀 서빙의 요청별 상태와 스케줄링 문제를 명시한 Orca의 2022년 출판을 대표 시점으로 둔다."
historical_layer: system
capability_layers: [realized-performance, scalability, resource-efficiency]
sources: ["Orca - A Distributed Serving System for Transformer-Based Generative Models", "Efficient Memory Management for Large Language Model Serving with PagedAttention", "SGLang - Efficient Execution of Structured Language Model Programs"]
status: active
graph_id: concept-kv-cache
graph_visibility: public
---

## 개요

[[KV 캐시]](key-value cache)는 자동회귀 [[Transformer]]가 이전 토큰에 대해 계산한 어텐션 키(key)와 값(value)을 각 층에 보존하는 실행 상태다. 새 토큰을 생성할 때 과거 토큰의 키와 값을 다시 계산하지 않고, 새 질의와 저장된 키·값을 사용해 [[자기 주의]]를 수행한다. 계산을 줄이는 대신 요청이 살아 있는 동안 GPU 메모리에 누적 상태를 유지해야 한다.

기본 재사용 범위는 한 요청 안의 과거 토큰이지만, 같은 모델·토크나이저·어댑터·실행 설정에서 토큰 단위로 동일한 프롬프트 접두사가 반복되면 [[접두사 KV 캐싱]]으로 요청·호출 사이의 상태도 공유할 수 있다. 이 재사용은 의미 유사성이 아니라 동일한 토큰 상태에 근거하며, 완료 뒤 캐시를 남길 메모리와 검색·퇴거 정책을 추가로 요구한다.

표준적인 다중 헤드 어텐션에서 캐시 바이트는 대략 다음 항목의 곱에 비례한다.

`2 × 층 수 × 저장 토큰 수 × KV head 수 × head 차원 × 원소 바이트`

앞의 `2`는 키와 값을 각각 저장하기 때문이다. 다중 질의·그룹 질의 어텐션처럼 KV head 수를 줄이는 구조는 이 항을 낮출 수 있지만, 기본 원리는 같다. 동시 요청이 많거나 문맥과 출력이 길수록 전체 캐시가 커진다.

## 계산 절감과 메모리 비용

캐시가 없으면 새 토큰을 생성할 때마다 이미 처리한 접두사의 키·값을 다시 만들게 된다. 캐시는 이 중복 계산을 피하므로 토큰별 디코딩에 필수적인 최적화다. 그러나 모델 매개변수는 서비스 수명 동안 거의 고정된 반면, KV 캐시는 요청의 도착·완료와 토큰 생성에 따라 계속 늘고 줄어든다.

이 차이가 배치 수용량을 결정한다. 모델 가중치를 적재한 뒤 남은 GPU 메모리에 요청별 캐시가 들어가야 하며, 캐시 한 요청의 최대 크기를 보수적으로 선예약하면 짧게 끝나는 요청의 미사용 공간도 다른 요청이 쓸 수 없다. [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]은 평가한 기존 시스템에서 실제 토큰 상태가 KV 캐시 예약 공간의 20.4–38.2%만 차지한 조건을 보고했다. 이 수치는 해당 모델·추적·할당 방식의 결과이지 모든 서빙 시스템의 고정 낭비율은 아니다.

## 블록 관리와 공유

PagedAttention은 논리 캐시를 고정 크기 블록으로 나누고 각 논리 블록을 비연속 물리 GPU 블록에 매핑한다. 요청이 성장할 때 필요한 블록만 할당하므로 최대 길이 전체를 미리 연속 예약하지 않는다. 마지막 블록의 남은 슬롯을 제외하면 내부 단편화가 작고, 같은 크기 블록을 재사용하므로 외부 단편화도 줄어든다.

공통 프롬프트에서 갈라지는 병렬 샘플이나 빔은 접두사의 물리 블록을 공유할 수 있다. 어느 분기가 공유 블록에 새 상태를 쓸 때만 복사하는 쓰기 시 복사 방식은 큰 접두사를 미리 복제하는 비용을 피한다. 반면 블록 표 조회와 비연속 접근은 커널 오버헤드를 만들며, 블록 크기는 병렬 처리 효율과 단편화 사이의 절충이다.

## 스케줄러와의 결합

[[연속 배칭]]은 반복마다 활성 요청을 바꿀 수 있지만, 각 요청의 캐시가 메모리에 들어가야 다음 반복에 참여할 수 있다. 따라서 스케줄러의 “빈 자리”는 단순 요청 개수가 아니라 남은 KV 블록, 새 입력·출력이 요구할 토큰 수와 선점 시 복구 비용으로 결정된다. 메모리가 부족하면 요청 승인을 미루거나, 실행 중인 요청을 선점해 캐시를 CPU로 옮기거나, 접두사를 버리고 나중에 재계산해야 한다.

결국 캐시는 개별 토큰의 계산량을 줄이면서 서비스 전체의 동시성을 제한할 수 있다. 이 이중성 때문에 캐시 적중 여부만이 아니라 **유효 캐시 점유량, 단편화, 활성 토큰 수, 선점·재계산과 지연 목표 아래 처리량**을 함께 측정해야 한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[자기 주의]] | 이전 위치의 키와 값을 보존해 새 질의가 과거 문맥을 참조하는 증분 어텐션을 구현한다. | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| enables | [[연속 배칭]] | 요청별 어텐션 상태를 반복 사이에 유지해 스케줄러가 선택한 요청만 다음 토큰으로 전진시킬 수 있게 한다. | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| enables | [[접두사 KV 캐싱]] | 동일 토큰 접두사의 키·값 상태를 요청·호출 사이에 보존해 프리필 재계산을 피할 수 있게 한다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |
| exemplifies | [[메모리 장벽]] | GPU 메모리 용량·단편화·데이터 배치가 연산기의 잠재 처리량보다 활성 배치 수를 먼저 제한할 수 있다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| constrains | [[컴퓨팅 능력이란 무엇인가]] | 토큰당 계산 절감과 요청당 상태 증가가 같은 시스템의 지연·처리량·자원 효율을 서로 다르게 바꾼다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |

## 출처

- [[Orca - A Distributed Serving System for Transformer-Based Generative Models]]
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]
- [[SGLang - Efficient Execution of Structured Language Model Programs]]

## 관련 항목

- [[연속 배칭]] — 보존된 요청 상태를 사용해 반복마다 활성 배치를 다시 구성한다.
- [[메모리 장벽]] — 캐시 용량과 데이터 배치가 실제 처리량을 제한하는 일반 원리를 제공한다.
- [[입출력 인지 어텐션]] — 어텐션 중간 데이터의 HBM 이동을 줄이는 커널 관점과 요청 수명 상태 관점을 비교할 수 있다.
- [[접두사 KV 캐싱]] — 같은 토큰 접두사의 상태를 여러 요청·호출에서 재사용하는 조건을 설명한다.
- [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]] — 계산 절감과 동시성 제한이 동시에 생기는 이유를 종합한다.
