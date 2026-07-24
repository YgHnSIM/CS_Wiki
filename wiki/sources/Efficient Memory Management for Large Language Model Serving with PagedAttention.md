---
title: Efficient Memory Management for Large Language Model Serving with PagedAttention
aliases: [PagedAttention, vLLM paper, Kwon et al. 2023, PagedAttention paper]
summary: "동적으로 커지는 LLM의 KV 캐시를 고정 크기 블록과 논리–물리 매핑으로 관리해 단편화와 중복 복사를 줄이고 더 많은 요청을 배치에 수용한 2023년 vLLM 연구."
tags: [type/reference, domain/machine-learning, domain/systems, domain/operating-systems, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2023
historical_layer: system
capability_layers: [realized-performance, scalability, resource-efficiency]
sources: ["Efficient Memory Management for Large Language Model Serving with PagedAttention"]
source_id: ref-076
source_kind: external
primary_sources: ["Woosuk Kwon et al., Efficient Memory Management for Large Language Model Serving with PagedAttention, SOSP 2023"]
supporting_sources: ["ACM proceedings record and arXiv open-access version 2309.06180"]
source_urls: ["https://doi.org/10.1145/3600006.3613165", "https://arxiv.org/abs/2309.06180"]
retrieved: 2026-07-24
version: "SOSP '23 proceedings; arXiv 2309.06180"
snapshot_status: external-only
status: active
graph_id: reference-pagedattention
graph_visibility: public
---

## 개요

[[Efficient Memory Management for Large Language Model Serving with PagedAttention]]은 Kwon 등 연구진이 2023년 SOSP에서 발표한 LLM 서빙 메모리 관리 연구다. 자동회귀 생성은 각 층의 과거 토큰 키와 값을 [[KV 캐시]]에 보존해 같은 상태의 재계산을 피한다. 그러나 요청마다 입력·출력 길이가 다르고 출력이 한 토큰씩 늘어나므로 캐시 크기는 동적으로 변한다. 기존 시스템이 최대 길이에 맞춘 큰 연속 공간을 미리 예약하면 실제 토큰 상태보다 훨씬 많은 메모리가 내부·외부 단편화로 낭비될 수 있다.

논문은 운영체제의 가상 메모리와 페이징에서 영감을 받은 **PagedAttention**을 제안한다. 각 요청의 논리 KV 캐시를 고정 크기 블록으로 나누고, 블록 표가 논리 블록을 GPU 메모리의 비연속 물리 블록에 연결한다. 새 토큰이 블록을 채울 때만 다음 물리 블록을 할당하므로 최대 출력 길이 전체를 미리 예약할 필요가 없고, 한 요청의 미사용 공간은 마지막 블록 안으로 제한된다.

이 매핑은 병렬 샘플링·빔 탐색이나 공통 프롬프트처럼 여러 시퀀스가 같은 접두 상태를 공유할 때도 유용하다. 물리 블록을 참조 횟수와 함께 공유하고 쓰기가 발생할 때 복사하면 큰 연속 캐시를 시퀀스마다 중복할 필요가 줄어든다. 논문은 이 알고리즘 위에 중앙 스케줄러, 블록 관리자와 분산 GPU 작업자를 갖춘 vLLM을 구현했다.

평가에서 vLLM은 FasterTransformer와 Orca 계열 기준선보다 같은 지연 수준에서 2–4배 처리량 향상을 보고했다. 긴 시퀀스·큰 모델·복잡한 디코딩에서 이점이 더 컸지만, 캐시 여유가 크고 시퀀스가 짧아 계산 병목이 된 조건에서는 차이가 작았다. 블록 표 조회와 불규칙 접근은 논문의 미세 벤치마크에서 최적화된 연속 메모리 어텐션보다 커널 지연을 20–26% 늘렸으며, 블록이 너무 작으면 병렬성이 낮고 너무 크면 단편화가 늘었다. 따라서 페이징은 비용 없는 가속이 아니라 작은 실행 오버헤드와 더 높은 메모리 수용량을 교환하는 설계다.

## 주요 인사이트

- KV 캐시는 모델 매개변수와 달리 요청 수명 동안 동적으로 늘고 줄어드는 대형 GPU 상태다.
- 최대 길이만큼 연속 공간을 선예약하면 실제 길이 차이, 외부 단편화와 디코딩 분기 복제가 동시 요청 수를 줄인다.
- 논리–물리 블록 매핑은 비연속 메모리에서도 어텐션이 과거 키·값을 찾게 하고 필요한 시점에만 공간을 할당한다.
- 블록 공유와 쓰기 시 복사는 공통 접두어나 빔 사이의 중복 KV 캐시를 줄인다.
- 더 효율적인 캐시 관리는 같은 GPU에서 더 큰 활성 배치를 허용하지만, 효과는 요청 길이 분포·모델·메모리 여유·블록 크기와 지연 목표에 따라 달라진다.

## 인용할 만한 구절

> “near-zero waste in KV cache memory”

논문이 목표로 한 것은 KV 캐시 자체를 없애는 것이 아니라, 실제 토큰 상태 밖의 예약·단편화·중복 낭비를 최소화하는 것이다.

## 위키 반영

이 자료는 [[KV 캐시]]의 동적 크기와 단편화가 배치 크기를 제한하는 직접 근거다. [[연속 배칭]]이 반복마다 요청을 유연하게 선택하더라도 메모리에 수용할 수 있는 활성 요청 수가 부족하면 처리량이 늘지 않는다는 점을 보강한다. [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]]에서는 페이징의 처리량 이점과 블록 매핑 오버헤드를 함께 비교한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[KV 캐시]] | 논리 KV 블록을 비연속 물리 블록에 매핑하고 필요할 때 할당·공유·해제하는 관리 방식을 구현한다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| responds_to | [[메모리 장벽]] | GPU 메모리 용량과 단편화 때문에 활성 배치가 제한되는 LLM 서빙 병목에 대응한다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| enables | [[연속 배칭]] | 캐시 낭비를 줄여 반복마다 선택할 수 있는 동시 요청 수와 배치 수용량을 늘린다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| responds_to | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] | Orca의 반복 단위 스케줄링을 비교 기준으로 삼고, 연속 KV 공간 예약이 남긴 메모리 비효율을 보완한다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |

## 출처

- ACM Digital Library, [SOSP 2023 proceedings record](https://doi.org/10.1145/3600006.3613165)
- arXiv, [open-access paper record 2309.06180](https://arxiv.org/abs/2309.06180)

## 관련 항목

- [[KV 캐시]] — 토큰마다 누적되는 키·값 상태의 계산 절감과 메모리 비용을 설명한다.
- [[연속 배칭]] — 동적으로 변하는 활성 요청 집합이 왜 유연한 캐시 할당을 요구하는지 보여준다.
- [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] — 반복 단위 스케줄링을 먼저 정립한 비교 기준이다.
- [[메모리 장벽]] — 연산기보다 메모리 용량·배치·데이터 배치가 처리량을 제한하는 일반 문제로 연결한다.
- [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]] — 캐시 재사용, 동시성, 단편화와 페이징 오버헤드를 함께 종합한다.
