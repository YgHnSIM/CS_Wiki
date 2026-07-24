---
title: Mixed Precision Training
aliases: [Micikevicius et al. 2018, mixed-precision deep learning]
summary: "반정밀도 저장·연산과 단정밀도 마스터 가중치·손실 스케일링을 결합해 심층 신경망 학습의 메모리 사용량과 계산 비용을 줄이는 방법을 제시한 2018년 ICLR 논문."
tags: [type/reference, domain/machine-learning, domain/computer-architecture, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2018
historical_layer: software
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["Mixed Precision Training"]
source_id: ref-069
source_kind: external
primary_sources: ["Paulius Micikevicius et al., Mixed Precision Training, ICLR 2018"]
supporting_sources: ["arXiv:1710.03740", "OpenReview ICLR 2018 record"]
source_urls: ["https://arxiv.org/abs/1710.03740", "https://openreview.net/forum?id=r1gs9JgRZ"]
retrieved: 2026-07-24
version: "arXiv v3, 15 February 2018; ICLR 2018"
snapshot_status: external-only
status: active
graph_id: reference-mixed-precision-training
graph_visibility: public
---

## 개요

[[Mixed Precision Training]]은 Paulius Micikevicius 등 연구진이 2018년에 발표한 심층 신경망 학습 방법 논문이다. 저자들은 가중치·활성값·그래디언트를 IEEE 반정밀도 형식으로 저장하면서도, 최적화 단계에서 갱신을 누적하는 단정밀도 마스터 가중치를 유지하는 구성을 제시했다.

반정밀도는 단정밀도보다 표현 범위가 좁다. 논문은 이 손실을 다루기 위해 마스터 가중치와 손실 스케일링(loss scaling)을 함께 사용한다. 따라서 이 논문의 주장은 “모든 학습을 낮은 정밀도로 바꾸어도 결과가 같다”가 아니라, 정해진 모델·데이터·학습 절차에서 수치적 위험을 관리하는 구성으로 메모리 사용량과 계산 비용을 줄일 수 있다는 것이다.

저자들은 이 구성을 합성곱 신경망, 순환 신경망, 생성 적대 신경망 등 여러 모델에 적용했고, 큰 모델에서도 동작함을 보였다. 논문 초록은 메모리 사용량을 거의 절반으로 줄일 수 있다고 보고하며, 반정밀도 하드웨어 단위가 있는 프로세서에서는 계산 가속 가능성도 제시한다. 해당 수치는 논문이 다룬 구성의 결과이며, 모든 모델·가속기·학습 목표에 대한 보편 성능 보장은 아니다.

## 주요 인사이트

- 낮은 정밀도는 메모리 용량·대역폭과 일부 연산 비용을 줄이는 수단이지만, 표현 범위와 반올림 오차의 위험도 함께 바꾼다.
- 혼합 정밀도는 하나의 형식을 일괄 적용하는 방식이 아니라, 어느 값·연산을 어떤 형식으로 유지할지 정하는 수치 설계다.
- 마스터 가중치와 손실 스케일링은 낮은 정밀도 그래디언트에서 정보가 사라질 수 있는 문제를 완화하는 장치다.
- 학습의 유효성은 비트 단위 동일성이 아니라, 사전에 정의한 모델 품질·수렴 조건과 함께 판단해야 한다.
- 메모리 절감이나 연산 가속 가능성은 데이터, 모델, 옵티마이저, 하드웨어와 구현에 의존한다.

## 인용할 만한 구절

> “maintaining a single-precision copy of the weights”

저자들이 반정밀도 학습의 정보 손실을 다루기 위해 제시한 핵심 장치를 짧게 나타낸 표현이다.

## 위키 반영

이 자료는 [[혼합 정밀도]]에서 표현 형식의 역할 분담을 설명하고, [[낮은 정밀도는 AI의 컴퓨팅 능력을 어떻게 바꾸는가]]에서 속도·메모리 이득이 어떤 결과 계약을 전제로 하는지 분석하는 직접 근거다. [[부동소수점 정확성]]의 비트 일치·수치 오차·과업 품질 구분을 학습 작업으로 확장한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[혼합 정밀도]] | 반정밀도 저장과 단정밀도 마스터 가중치·손실 스케일링을 조합한 학습 구성을 제시한다. | [[Mixed Precision Training]] |
| constrains | [[부동소수점 정확성]] | 낮은 정밀도의 범위·반올림 손실을 관리하지 않으면 학습 결과 계약을 만족하지 못할 수 있음을 보여준다. | [[Mixed Precision Training]] |

## 출처

- arXiv, [1710.03740](https://arxiv.org/abs/1710.03740)
- OpenReview, [ICLR 2018 record](https://openreview.net/forum?id=r1gs9JgRZ)

## 관련 항목

- [[혼합 정밀도]] — 낮은 형식과 높은 형식의 역할 분담을 개념적으로 정리한다.
- [[목표 품질 도달 시간]] — 학습 성능을 품질 목표까지 걸린 시간으로 측정하는 방법을 다룬다.
- [[부동소수점 정확성]] — 비트 일치와 과업 수준 결과 계약을 구분한다.
- [[낮은 정밀도는 AI의 컴퓨팅 능력을 어떻게 바꾸는가]] — 혼합 정밀도의 이득과 검증 조건을 종합한다.
