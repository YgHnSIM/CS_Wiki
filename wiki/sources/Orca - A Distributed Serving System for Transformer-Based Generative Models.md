---
title: "Orca: A Distributed Serving System for Transformer-Based Generative Models"
aliases: ["Orca: A Distributed Serving System for Transformer-Based Generative Models", Orca, ORCA, Yu et al. 2022, Orca serving system]
summary: "자동회귀 생성 요청을 고정 배치가 끝날 때까지 묶는 대신 모델 반복마다 실행 대상을 다시 선택하고, 선택적 배칭으로 서로 다른 길이의 요청을 함께 처리한 2022년 분산 Transformer 서빙 연구."
tags: [type/reference, domain/machine-learning, domain/systems, domain/distributed-systems, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2022
historical_layer: system
capability_layers: [realized-performance, scalability, resource-efficiency]
sources: ["Orca: A Distributed Serving System for Transformer-Based Generative Models"]
source_id: ref-075
source_kind: external
primary_sources: ["Gyeong-In Yu et al., Orca: A Distributed Serving System for Transformer-Based Generative Models, OSDI 2022"]
supporting_sources: ["USENIX OSDI 2022 presentation and bibliographic record"]
source_urls: ["https://www.usenix.org/conference/osdi22/presentation/yu", "https://www.usenix.org/system/files/osdi22-yu.pdf"]
retrieved: 2026-07-24
version: "OSDI '22 proceedings, pp. 521-538"
snapshot_status: external-only
status: active
graph_id: reference-orca-serving-system
graph_visibility: public
---

## 개요

[[Orca - A Distributed Serving System for Transformer-Based Generative Models]]는 Yu 등 연구진이 2022년 OSDI에서 발표한 대규모 Transformer 생성 모델 서빙 시스템 연구다. 자동회귀 모델은 한 요청을 한 번 실행해 끝내지 않고, 앞서 생성한 토큰을 다음 입력으로 삼아 모델을 여러 번 반복한다. 기존 요청 단위 스케줄러가 길이가 다른 요청을 하나의 배치로 묶어 끝까지 실행하면 먼저 끝난 요청은 반환을 기다리고, 뒤늦게 도착한 요청은 현재 배치가 모두 끝날 때까지 큐에 머문다.

Orca의 첫 번째 핵심은 **반복 단위 스케줄링**(iteration-level scheduling)이다. 스케줄러는 모델 한 번의 반복만 실행 엔진에 맡기고, 출력 토큰을 받은 뒤 다음 반복에 포함할 요청 집합을 다시 고른다. 완료된 요청은 즉시 제거하고 새 요청은 진행 중인 요청과 다음 반복부터 합칠 수 있다. 오늘날 흔히 [[연속 배칭]]이라고 부르는 계열의 핵심 동작을 이 논문은 반복 단위 스케줄링으로 명시했다.

두 번째 핵심은 **선택적 배칭**(selective batching)이다. 입력 길이와 현재 토큰 위치가 다른 요청은 모든 연산을 전통적인 배치 텐서 하나로 합치기 어렵다. Orca는 선형층·정규화처럼 토큰별로 처리할 수 있는 비어텐션 연산은 토큰 축으로 합치고, 요청별 과거 키·값을 구분해야 하는 어텐션 연산은 요청 단위를 보존한다. 이 공동 설계는 스케줄러가 임의의 요청 집합을 고르는 유연성과 GPU의 행렬 연산 효율을 함께 노린다.

논문은 모델 내부 병렬성과 모델 층 사이 파이프라인을 결합해 수백억·수천억 매개변수 모델을 여러 GPU와 기계에 분산했다. GPT-3 175B 평가에서는 FasterTransformer 기반 요청 단위 배칭과 비교해 같은 지연 수준에서 최대 36.9배 처리량 향상을 보고했다. 이 수치는 논문의 모델·하드웨어·요청 추적·비교 스케줄러 조건에 속하며, 모든 모델이나 현대 서빙 엔진에 적용되는 보편 배수가 아니다.

## 주요 인사이트

- 자동회귀 요청은 한 번의 모델 실행이 아니라 출력 토큰 수만큼 이어지는 다중 반복 작업이다.
- 배치를 요청 수명 전체에 고정하면 짧은 요청의 완료와 새 요청의 합류가 긴 요청에 막힌다.
- 반복마다 활성 요청 집합을 다시 구성하면 배치 크기를 유지하면서 완료·도착 시점의 차이를 흡수할 수 있다.
- 서로 다른 길이의 요청을 함께 처리하려면 스케줄러뿐 아니라 어텐션과 비어텐션 연산의 배칭 경계를 실행 엔진과 공동 설계해야 한다.
- 반복 단위 스케줄링은 요청별 키·값 상태를 계속 보존해야 하므로 [[KV 캐시]]의 용량과 배치 가능한 동시 요청 수를 자동으로 해결하지 않는다.

## 인용할 만한 구절

> “iteration-level scheduling”

요청 전체가 아니라 모델 한 번의 반복을 스케줄링 단위로 삼는 논문의 핵심 설계를 가장 짧게 드러내는 표현이다.

## 위키 반영

이 자료는 [[연속 배칭]]의 직접 근거이며, [[Transformer]]의 학습 위치 병렬성과 자동회귀 서빙의 요청 간 배칭을 구분한다. [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]]에서는 반복마다 배치를 다시 구성해도 요청별 상태가 GPU 메모리를 차지하므로 스케줄링과 메모리 관리가 결합되어야 한다는 출발점으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[연속 배칭]] | 모델 한 번의 반복마다 완료·대기·신규 요청을 반영해 다음 활성 배치를 다시 구성한다. | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| implements | [[Transformer]] | 자동회귀 Transformer의 어텐션 상태와 비어텐션 연산을 구분한 분산 서빙 엔진을 구현한다. | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| precedes | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] | 반복 단위 스케줄링을 확립했지만 KV 캐시의 연속 할당과 단편화 문제는 후속 PagedAttention 연구의 비교 기준이 되었다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |

## 출처

- USENIX, [OSDI 2022 presentation and bibliographic record](https://www.usenix.org/conference/osdi22/presentation/yu)
- USENIX, [open-access paper PDF](https://www.usenix.org/system/files/osdi22-yu.pdf)

## 관련 항목

- [[연속 배칭]] — 요청 수명 전체가 아니라 모델 반복마다 활성 배치를 다시 구성하는 원리를 정리한다.
- [[KV 캐시]] — 반복 사이에 보존해야 하는 요청별 어텐션 상태와 메모리 비용을 설명한다.
- [[Transformer]] — 자동회귀 생성에서 모델을 여러 번 실행해야 하는 구조적 배경을 제공한다.
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] — 반복 단위 스케줄링의 처리량을 제한하는 KV 캐시 할당 문제를 이어서 다룬다.
- [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]] — 스케줄링 유연성과 GPU 메모리 수용량을 하나의 처리량 문제로 종합한다.
