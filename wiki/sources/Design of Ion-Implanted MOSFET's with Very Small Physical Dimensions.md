---
title: Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions
aliases: [Dennard scaling paper, Dennard et al. 1974, 작은 MOSFET 설계]
summary: "MOSFET의 치수와 전압을 함께 축소할 때 회로 지연과 전력은 낮추면서 전력 밀도를 일정하게 유지할 수 있음을 분석한 1974년 논문."
tags: [type/reference, domain/computer-architecture, domain/computer-history, status/active]
created: 2026-07-16
updated: 2026-07-18
publication_year: 1974
historical_layer: architecture
capability_layers: [realized-performance, resource-efficiency]
sources: ["IEEE Journal of Solid-State Circuits 9(5), 1974", "Stanford University access copy"]
source_id: ref-038
source_kind: external
primary_sources: ["IEEE Journal of Solid-State Circuits 9(5), 1974"]
supporting_sources: ["Stanford University access copy"]
source_urls: ["https://doi.org/10.1109/JSSC.1974.1050511", "https://web.stanford.edu/class/cs114/readings/dennard.pdf"]
retrieved: 2026-07-16
version: "IEEE JSSC 9(5), October 1974"
snapshot_status: external-only
status: active
---

## 개요

[[Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions]]는 Robert H. Dennard와 IBM 연구진이 1974년에 발표한 MOSFET 축소 설계 논문이다. 오늘날 [[Dennard 스케일링]] 또는 일정 전계 스케일링(constant-field scaling)이라 부르는 규칙의 직접 근거다.

논문은 소자의 수평·수직 치수를 계수 `κ`만큼 줄일 때 전압도 같은 비율로 낮추고 도핑 농도는 높이는 축소 규칙을 제시한다. 이 조건에서는 내부 전기장이 과도하게 커지지 않으면서 회로 지연은 약 `1/κ`, 회로 하나의 전력은 약 `1/κ²`로 감소한다. 면적당 회로 수가 `κ²`만큼 늘어도 이상적인 전력 밀도는 대체로 일정하게 유지된다.

이 결합은 더 작은 트랜지스터를 더 많이 집적하면서 각 소자를 더 빠르게 동작시킬 수 있었던 중요한 배경이다. 집적도 증가를 관찰한 [[Cramming More Components onto Integrated Circuits]]와 달리, 이 논문은 소자 치수·전압·도핑을 함께 바꾸는 물리적 설계 규칙을 다룬다.

논문 자체도 모든 요소가 이상적으로 축소되는 것은 아니라고 설명한다. 배선 저항과 접촉, 절연막 신뢰성, 제조 공정은 별도의 제약을 만들며, 특히 장거리 배선은 소자와 같은 방식으로 지연이 줄지 않을 수 있다. 후대의 전압 축소 정체와 전력 밀도 문제는 이 이상적 규칙이 무한히 지속될 수 없음을 보여준다.

## 주요 인사이트

- 트랜지스터 치수만이 아니라 전압과 도핑을 함께 조정해야 일정 전계 축소가 성립한다.
- 이상적인 축소에서는 회로 지연과 회로당 전력이 동시에 감소한다.
- 면적당 소자 수가 늘어도 전력 밀도를 일정하게 유지할 수 있다는 예측이 핵심이다.
- 배선, 접촉, 절연막과 제조 공정은 이상적 축소에서 벗어나는 제약이다.
- 무어의 법칙과 Dennard 스케일링은 서로 관련되지만 같은 명제가 아니다.

## 인용할 만한 구절

> 치수와 전압을 함께 축소하면 지연은 줄고 이상적인 전력 밀도는 유지된다.

논문의 스케일링 결과를 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[Dennard 스케일링]]의 정의와 성립 조건을 제공한다. [[컴퓨팅 능력의 발달사]]에서는 집적도 증가가 오랫동안 클럭과 단일 코어 성능 향상으로 이어질 수 있었던 이유, 그리고 전압 축소가 멈추면서 전력 장벽이 부상한 배경을 설명하는 데 사용한다.

## 출처

- IEEE, [DOI record](https://doi.org/10.1109/JSSC.1974.1050511)
- Stanford University, [access copy](https://web.stanford.edu/class/cs114/readings/dennard.pdf)

## 관련 항목

- [[Dennard 스케일링]]
- [[무어의 법칙]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
