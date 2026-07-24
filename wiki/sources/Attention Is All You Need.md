---
title: Attention Is All You Need
aliases: [Vaswani et al. 2017, Transformer paper]
summary: "순환이나 합성곱 없이 어텐션을 중심으로 인코더와 디코더를 구성해 시퀀스 위치의 병렬 계산 가능성과 전역 의존성 모델링을 결합한 2017년 Transformer 논문."
tags: [type/reference, domain/machine-learning, domain/computer-architecture, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2017
historical_layer: architecture
capability_layers: [realized-performance, scalability]
sources: ["Attention Is All You Need"]
source_id: ref-073
source_kind: external
primary_sources: ["Ashish Vaswani et al., Attention Is All You Need, NIPS 2017"]
supporting_sources: ["NeurIPS proceedings abstract and bibliographic record"]
source_urls: ["https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html", "https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf"]
retrieved: 2026-07-24
version: "NIPS 2017 proceedings"
snapshot_status: external-only
status: active
graph_id: reference-attention-is-all-you-need
graph_visibility: public
---

## 개요

[[Attention Is All You Need]]은 Vaswani 등 연구진이 2017년에 발표한 Transformer 논문이다. 당시 주요 시퀀스 변환 모델은 순환 신경망이나 합성곱 신경망을 중심으로 구성되었다. 저자들은 순환과 합성곱을 제거하고, 여러 층의 어텐션과 위치별 피드포워드 네트워크로 인코더와 디코더를 구성했다.

이 구조의 중요한 계산적 변화는 학습할 때 한 시퀀스 안의 여러 위치를 순환 상태의 시간 순서에 묶지 않고 함께 처리할 수 있다는 점이다. 그러나 원 논문의 디코더도 출력을 한 원소씩 생성하는 자동회귀 구조다. 그러므로 “Transformer는 병렬화하기 쉽다”는 주장을 학습 단계의 위치 계산과 생성 단계의 순차적 디코딩을 구분하지 않은 채 일반화하면 안 된다.

논문이 제시한 scaled dot-product attention은 질의 `Q`, 키 `K`, 값 `V`에 대해 다음 형태로 계산한다.

`Attention(Q, K, V) = softmax(QKᵀ / √dₖ)V`

여러 attention head는 서로 다른 투영 공간에서 이 계산을 병렬로 수행한다. 반면 밀집 자기 주의는 모든 위치 쌍의 상호작용을 계산하므로 시퀀스 길이가 커질수록 연산량과 중간 데이터가 빠르게 증가한다. 이 후속 병목은 [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]이 메모리 계층과 입출력 복잡도의 문제로 다룬다.

## 주요 인사이트

- Transformer는 순환 상태를 중심으로 한 시퀀스 계산을 어텐션과 행렬 연산 중심으로 재구성했다.
- 자기 주의는 같은 시퀀스의 위치들에서 질의·키·값을 만들고 각 위치의 표현을 다른 위치와의 관계로 갱신한다.
- 학습 시 위치 병렬성과 자동회귀 생성 시 토큰 순차성은 서로 다른 성질이다.
- 밀집 자기 주의의 전역 연결은 짧은 의존 경로를 제공하지만, 시퀀스 길이에 따른 이차 연산·중간 행렬 비용을 만든다.
- 논문의 번역 품질과 학습 비용 수치는 WMT 2014 작업, 당시 모델 구성과 8개 P100 GPU라는 조건에 한정된다.

## 인용할 만한 구절

> “relying entirely on an attention mechanism”

Transformer가 순환이나 합성곱 대신 무엇을 중심 계산으로 삼았는지를 압축한 표현이다.

## 위키 반영

이 자료는 [[Transformer]]와 [[자기 주의]]의 직접 근거다. [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]]에서는 학습 병렬성과 생성 순차성을 분리하고, 전역 어텐션의 계산 구조가 후대의 메모리·입출력 최적화 문제를 어떻게 만들었는지 분석한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[Transformer]] | 어텐션과 위치별 피드포워드 층으로 구성한 원 논문의 인코더·디코더 구조를 제시한다. | [[Attention Is All You Need]] |
| exemplifies | [[자기 주의]] | 같은 시퀀스에서 생성한 질의·키·값으로 위치 사이 관계를 계산하는 세 가지 어텐션 용례를 설명한다. | [[Attention Is All You Need]] |
| precedes | [[입출력 인지 어텐션]] | 전역 자기 주의가 만든 계산 구조는 후대에 GPU 메모리 계층을 고려한 정확한 어텐션 구현의 대상이 되었다. | [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]] |

## 출처

- NeurIPS Proceedings, [abstract and bibliographic record](https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html)
- NeurIPS Proceedings, [conference paper PDF](https://proceedings.neurips.cc/paper_files/paper/2017/file/3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf)

## 관련 항목

- [[Transformer]] — 원 논문의 계산 구조와 학습·생성 단계의 차이를 정리한다.
- [[자기 주의]] — 질의·키·값을 이용해 같은 시퀀스의 위치 관계를 계산한다.
- [[입출력 인지 어텐션]] — 어텐션의 수학적 결과를 유지하면서 GPU 메모리 이동을 줄이는 구현 관점을 다룬다.
- [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]] — 연산량, 메모리 이동과 생성 순차성을 함께 분석한다.
