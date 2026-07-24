---
title: Transformer
aliases: [트랜스포머, Transformer architecture, Transformer 모델]
summary: "순환 상태 대신 자기 주의와 위치별 피드포워드 층을 중심으로 시퀀스를 처리해 학습 위치의 병렬 계산과 전역 의존성 모델링을 결합한 신경망 구조."
tags: [type/concept, domain/machine-learning, domain/computer-architecture, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2017
historical_layer: architecture
capability_layers: [realized-performance, scalability]
sources: ["Attention Is All You Need", "FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness", "Orca - A Distributed Serving System for Transformer-Based Generative Models", "Efficient Memory Management for Large Language Model Serving with PagedAttention"]
status: active
graph_id: concept-transformer
graph_visibility: public
---

## 개요

[[Transformer]]는 시퀀스의 위치별 표현을 [[자기 주의]]와 위치별 피드포워드 네트워크로 갱신하는 신경망 구조다. 2017년 [[Attention Is All You Need]]은 순환이나 합성곱을 중심 계산으로 사용하지 않는 인코더–디코더 Transformer를 제시했다. 각 층은 어텐션, 피드포워드 연산, 잔차 연결과 정규화를 조합한다.

순환 모델은 한 위치의 상태가 앞선 위치의 상태에 의존하므로 학습 시 시퀀스 안의 계산이 시간 순서를 따른다. Transformer의 자기 주의는 한 층에서 여러 위치의 질의·키·값을 행렬 연산으로 함께 계산할 수 있다. 이 성질은 가속기의 병렬 연산 자원을 활용하기 쉽게 하지만, 모든 실행 단계가 병렬이라는 뜻은 아니다.

## 학습과 생성의 서로 다른 병렬성

훈련에서는 정답 시퀀스가 주어지므로 마스킹된 디코더의 여러 위치도 한 번의 행렬 연산으로 처리할 수 있다. 반면 자동회귀 생성은 새 토큰이 이전에 생성한 토큰에 의존한다. 한 요청의 다음 토큰들을 미리 모두 계산할 수 없으므로 생성 단계에는 순차적 반복이 남는다.

이 차이는 Transformer의 컴퓨팅 능력을 평가할 때 중요하다.

| 단계 | 병렬화 가능한 것 | 남는 제약 |
|---|---|---|
| 학습 | 배치와 시퀀스 위치의 행렬 연산 | 전체 시퀀스의 활성값·중간 결과 메모리 |
| 입력 처리 | 주어진 입력 토큰의 표현 계산 | 시퀀스 길이에 따른 어텐션 비용 |
| 자동회귀 생성 | 여러 요청·head·행렬 연산 | 한 요청 안에서 다음 토큰을 기다리는 순차성 |

자동회귀 생성의 순차성은 요청 **사이**의 병렬성까지 없애지는 않는다. [[Orca - A Distributed Serving System for Transformer-Based Generative Models]]는 모델 반복마다 서로 다른 요청을 다시 묶는 [[연속 배칭]]으로 이 병렬성을 활용했다. 다만 각 요청은 이전 토큰의 키와 값을 [[KV 캐시]]에 보존해야 하므로, [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]이 보여주듯 활성 배치의 상한은 GPU 메모리 용량과 캐시 배치 방식에도 달려 있다.

## 전역 연결의 비용

밀집 자기 주의는 한 위치가 같은 시퀀스의 모든 허용 위치를 참조할 수 있게 한다. 의존 거리와 무관하게 직접 상호작용할 수 있지만, 길이 `N`인 시퀀스의 점수 행렬은 `N × N`이다. 따라서 시퀀스가 길어질수록 산술 연산과 중간 데이터 이동이 빠르게 증가한다.

[[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]은 이 계산의 수학적 정의를 근사하지 않고, 큰 중간 행렬을 HBM에 저장하지 않도록 타일링한다. 이는 Transformer의 능력이 모델 구조만이 아니라 커널, 메모리 계층과 데이터 이동 구현에 의존한다는 사례다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[자기 주의]] | 인코더와 디코더 층에서 같은 시퀀스 위치 사이의 의존성을 계산하는 핵심 연산으로 사용한다. | [[Attention Is All You Need]] |
| enables | [[연속 배칭]] | 한 요청의 토큰은 순차적으로 생성하되 서로 다른 요청의 현재 반복을 같은 실행 배치로 묶을 수 있다. | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| constrains | [[KV 캐시]] | 자동회귀 디코딩은 과거 위치의 키·값 상태를 요청별로 유지하므로 동시 요청 수가 GPU 메모리에 제한된다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |

## 출처

- [[Attention Is All You Need]]
- [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]
- [[Orca - A Distributed Serving System for Transformer-Based Generative Models]]
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]

## 관련 항목

- [[자기 주의]] — Transformer가 시퀀스 위치 사이 관계를 계산하는 핵심 연산이다.
- [[입출력 인지 어텐션]] — 어텐션을 GPU 메모리 계층에 맞게 실행하는 구현 관점을 제공한다.
- [[연속 배칭]] — 여러 자동회귀 요청의 현재 반복을 동적으로 묶어 요청 사이 병렬성을 활용한다.
- [[KV 캐시]] — 이전 토큰의 어텐션 상태를 재사용하는 대신 동시 요청 수를 제한하는 메모리 비용을 만든다.
- [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]] — 학습 병렬성, 생성 순차성과 메모리 병목을 종합한다.
