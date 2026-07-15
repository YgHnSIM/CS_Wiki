---
title: Dennard 스케일링
aliases: [Dennard scaling, 데나드 스케일링, 일정 전계 스케일링, constant-field scaling]
summary: "MOSFET의 치수와 전압을 함께 축소해 회로 속도와 집적도를 높이면서 이상적인 전력 밀도를 일정하게 유지하는 소자 스케일링 규칙."
tags: [type/concept, domain/computer-history, domain/computer-architecture, status/active]
created: 2026-07-16
updated: 2026-07-16
sources: ["Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions", "Cramming More Components onto Integrated Circuits", "The Landscape of Parallel Computing Research - A View from Berkeley"]
status: active
---

## 개요

[[Dennard 스케일링]](Dennard scaling)은 MOSFET의 치수와 공급 전압을 같은 비율로 낮춰 내부 전기장을 일정하게 유지하는 축소 규칙이다. Robert Dennard와 IBM 연구진의 [[Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions]]에서 제시되었으며, 일정 전계 스케일링(constant-field scaling)이라고도 한다.

## 이상적 축소 규칙

선형 치수를 `1/κ`로 줄일 때 전압도 `1/κ`로 낮추고 도핑 농도를 높인다고 하자. 이상적인 모델에서는 다음 변화가 함께 일어난다.

| 항목 | 이상적 변화 | 의미 |
|---|---:|---|
| 선형 치수 | `1/κ` | 소자가 작아진다 |
| 면적 | `1/κ²` | 같은 면적에 더 많은 소자를 넣는다 |
| 전압 | `1/κ` | 전기장을 일정하게 유지한다 |
| 회로 지연 | 약 `1/κ` | 스위칭이 빨라진다 |
| 회로당 전력 | 약 `1/κ²` | 소자 하나의 전력이 줄어든다 |
| 전력 밀도 | 대체로 일정 | 집적도 증가를 열 증가 없이 흡수한다 |

이 관계가 성립하면 트랜지스터 수, 동작 속도와 에너지 효율을 동시에 개선할 수 있다. [[무어의 법칙]]이 관찰한 집적도 증가가 오랫동안 클럭과 단일 코어 성능 향상으로 전환될 수 있었던 중요한 이유다.

## 무어의 법칙과의 차이

무어의 법칙은 경제적으로 유리한 집적 회로의 부품 수가 시간에 따라 증가한다는 경험적 추세다. Dennard 스케일링은 소자 치수·전압·도핑을 어떻게 함께 바꾸면 전기장과 전력 밀도를 관리할 수 있는지를 설명하는 설계 규칙이다. 하나는 산업의 시간 추세, 다른 하나는 이상적인 물리 축소 관계이므로 어느 한쪽의 성립이 다른 쪽을 자동으로 보장하지 않는다.

## 약화와 전력 장벽

소자가 작아질수록 임계 전압과 공급 전압을 같은 속도로 계속 낮추기 어려워졌다. 누설 전류, 변동성, 절연막과 신뢰성, 배선 지연도 더 큰 비중을 차지했다. 전압 축소가 치수 축소를 따라가지 못하면 소자당 전력이 충분히 줄지 않고, 모든 트랜지스터를 동시에 높은 주파수로 사용할 때 전력 밀도와 발열이 증가한다.

이 변화는 단일 코어 클럭 상승의 둔화와 멀티코어 전환의 배경이다. [[The Landscape of Parallel Computing Research - A View from Berkeley]]가 기록하듯, 더 많은 트랜지스터를 복잡한 단일 코어에 투입하는 방식의 수익이 줄면서 병렬 하드웨어, 에너지 효율과 소프트웨어 공동 설계가 중심 과제가 되었다.

## 출처

- [[Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions]]
- [[Cramming More Components onto Integrated Circuits]]
- [[The Landscape of Parallel Computing Research - A View from Berkeley]]

## 관련 항목

- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
