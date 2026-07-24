---
title: "FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"
aliases: ["FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness", FlashAttention, Dao et al. 2022, IO-aware exact attention]
summary: "GPU의 HBM과 온칩 SRAM 사이 데이터 이동을 고려해 타일링과 재계산으로 큰 어텐션 중간 행렬의 구체화를 피하는 2022년 입출력 인지 정확 어텐션 논문."
tags: [type/reference, domain/machine-learning, domain/computer-architecture, domain/systems, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2022
historical_layer: software
capability_layers: [realized-performance, resource-efficiency]
sources: ["FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness"]
source_id: ref-074
source_kind: external
primary_sources: ["Tri Dao et al., FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness, NeurIPS 2022"]
supporting_sources: ["NeurIPS proceedings abstract, paper PDF, and supplemental record"]
source_urls: ["https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html", "https://proceedings.neurips.cc/paper_files/paper/2022/file/67d57c32e20fd0a7a302cb81d36e40d5-Paper-Conference.pdf"]
retrieved: 2026-07-24
version: "NeurIPS 2022 main conference"
snapshot_status: external-only
status: active
graph_id: reference-flashattention
graph_visibility: public
---

## 개요

[[FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness]]은 Dao 등 연구진이 2022년에 발표한 GPU 어텐션 알고리즘 논문이다. 저자들은 어텐션 최적화를 부동소수점 연산 수만 줄이는 문제로 보지 않고, GPU 고대역폭 메모리(HBM)와 더 작고 빠른 온칩 SRAM 사이의 읽기·쓰기 횟수까지 포함하는 입출력 복잡도 문제로 다룬다.

표준 구현은 `QKᵀ`와 softmax 결과에 해당하는 큰 `N × N` 중간 행렬을 HBM에 쓰고 다시 읽을 수 있다. FlashAttention은 `Q`, `K`, `V`를 블록으로 나누어 SRAM에서 부분 softmax를 계산하고, 필요한 정규화 통계만 보존한 뒤 일부 값을 재계산한다. 이 방식은 큰 어텐션 행렬을 HBM에 구체화하지 않아 메모리 이동과 부가 메모리를 줄인다.

논문에서 “exact attention”은 저랭크·희소화처럼 어텐션 정의를 근사하지 않는다는 뜻이다. 실행 순서와 커널이 달라질 수 있으므로 모든 구현이 비트 단위로 동일한 부동소수점 결과를 낸다는 의미는 아니다. 또한 정확한 밀집 어텐션의 산술 연산량은 여전히 시퀀스 길이에 대해 이차적으로 증가한다. FlashAttention의 핵심은 더 많은 연산을 허용하더라도 훨씬 비싼 HBM 이동을 줄여 실제 시간을 단축할 수 있다는 데 있다.

저자들은 A100 GPU와 논문에 명시된 모델·시퀀스 길이에서 학습과 어텐션 커널의 속도·메모리 이점을 보고했다. 이 배수는 현대의 모든 GPU, 모델, 정밀도와 커널 버전에 대한 보편적 수치가 아니다.

## 주요 인사이트

- 실제 실행 시간은 FLOP 수뿐 아니라 메모리 계층 사이의 데이터 이동량에 좌우된다.
- 타일링은 작업 집합을 SRAM에 맞는 블록으로 나누고, 온라인 softmax를 이용해 전체 점수 행렬 없이 결과를 누적한다.
- 재계산은 연산 수를 늘릴 수 있지만 중간 행렬의 HBM 읽기·쓰기를 줄여 전체 시간을 낮출 수 있다.
- 정확한 밀집 어텐션의 이차 산술 복잡도와 구현의 선형 부가 메모리를 구분해야 한다.
- 단일 GPU 안의 HBM–SRAM 최적화는 여러 GPU 사이 통신 비용을 자동으로 해결하지 않는다.

## 인용할 만한 구절

> “computes exact attention with far fewer memory accesses”

수학적 어텐션을 근사하지 않으면서 병목을 메모리 접근에서 줄인다는 논문의 핵심을 나타낸다.

## 위키 반영

이 자료는 [[입출력 인지 어텐션]]의 직접 근거이며, [[메모리 장벽]]과 [[Roofline An Insightful Visual Performance Model]]의 데이터 이동 관점을 Transformer 작업에 연결한다. [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]]에서는 산술 복잡도, 부가 메모리와 실제 벽시계 시간을 분리하는 사례로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[입출력 인지 어텐션]] | 타일링·온라인 softmax·재계산으로 HBM 접근을 줄이는 정확 어텐션 구현을 제시한다. | [[FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness]] |
| responds_to | [[메모리 장벽]] | FLOP 감소보다 HBM–SRAM 데이터 이동이 실제 어텐션 시간을 제한할 수 있다는 문제에 대응한다. | [[FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness]] |
| implements | [[자기 주의]] | 어텐션 정의를 근사하지 않고 밀집 자기 주의를 메모리 계층에 맞게 재구성한다. | [[FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness]] |

## 출처

- NeurIPS Proceedings, [abstract and bibliographic record](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html)
- NeurIPS Proceedings, [conference paper PDF](https://proceedings.neurips.cc/paper_files/paper/2022/file/67d57c32e20fd0a7a302cb81d36e40d5-Paper-Conference.pdf)

## 관련 항목

- [[입출력 인지 어텐션]] — 연산 수와 데이터 이동을 함께 최적화하는 설계 원리를 정리한다.
- [[자기 주의]] — FlashAttention이 계산하는 원래 어텐션 연산의 구조를 설명한다.
- [[메모리 장벽]] — 연산기보다 데이터 공급이 실제 성능을 제한하는 일반 문제를 다룬다.
- [[Roofline An Insightful Visual Performance Model]] — 연산 집약도와 메모리 대역폭으로 병목을 구분한다.
- [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]] — Transformer의 병렬성·산술량·메모리 이동을 종합한다.
