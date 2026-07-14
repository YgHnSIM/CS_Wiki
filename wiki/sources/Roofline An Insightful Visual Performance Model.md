---
title: Roofline An Insightful Visual Performance Model
aliases: [Williams-Waterman-Patterson 2009, Roofline performance model paper]
summary: "연산 집약도와 메모리 대역폭을 결합해 프로그램의 달성 가능한 성능 상한과 계산·메모리 병목을 시각화한 Roofline 모델 논문."
tags: [type/reference, domain/computer-architecture, domain/computer-science, status/active]
created: 2026-07-15
updated: 2026-07-15
sources: ["2009_Williams_Waterman_Patterson_Roofline.pdf", "Communications of the ACM 52(4), 2009"]
source_id: ref-034
source_kind: external
primary_sources: ["Communications of the ACM 52(4), 2009"]
supporting_sources: ["2009_Williams_Waterman_Patterson_Roofline.pdf", "UC Berkeley access copy", "Berkeley Lab Roofline overview"]
source_urls: ["https://doi.org/10.1145/1498765.1498785", "https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf", "https://amcr.lbl.gov/departments/computer-science-department/ppan/roofline-performance-model/"]
retrieved: 2026-07-15
version: "Revised October 2008"
snapshot_status: archived
status: active
---

## 개요

[[Roofline An Insightful Visual Performance Model]]은 Samuel Williams, Andrew Waterman, David Patterson가 부동소수점 프로그램과 멀티코어 시스템의 성능 상한과 병목을 설명하기 위해 제안한 모델이다. 정확한 실행 시간을 예측하기보다 어떤 자원이 성능을 제한하는지 드러내고, 다음 최적화의 방향을 선택하게 하는 bound-and-bottleneck 모델이다.

핵심 변수인 operational intensity는 캐시를 통과해 DRAM과 주고받은 바이트당 수행한 연산 수다. 한 커널의 달성 가능한 성능은 프로세서의 최고 연산 성능과 `메모리 대역폭 × operational intensity` 가운데 더 작은 값으로 제한된다. 그래프의 수평 지붕에 닿으면 계산 성능 제한, 기울어진 지붕에 닿으면 메모리 대역폭 제한으로 해석한다.

논문은 단일 최고 FLOPS가 실제 프로그램 성능을 설명하지 못한다는 점을 네 종류의 멀티코어와 네 계산 커널로 보여준다. 같은 기계에서도 메모리 접근 패턴, 캐시 미스, SIMD 사용, 명령 수준 병렬성, 메모리 배치와 프리페칭에 따라 달성 성능이 달라진다. 모델에 여러 최적화 ceiling을 추가하면 어떤 최적화가 다음 성능 상한을 열어 주는지도 비교할 수 있다.

Roofline은 원래 부동소수점 연산과 DRAM 트래픽을 사용하지만, 논문은 작업에 맞는 계산 지표와 데이터 이동 지표로 축을 바꾸면 다른 종류의 커널에도 확장할 수 있다고 설명한다. 따라서 이 자료의 더 일반적인 의미는 컴퓨팅 능력이 연산기 하나의 속도가 아니라 계산과 데이터 이동의 균형이라는 점이다.

## 주요 인사이트

- 달성 가능한 성능은 최고 연산률과 메모리 대역폭 가운데 현재 커널에 더 강한 제약을 받는다.
- operational intensity는 연산량을 DRAM 데이터 이동량과 연결한다.
- 같은 하드웨어에서도 커널의 데이터 접근 방식과 소프트웨어 최적화에 따라 병목이 달라진다.
- ridge point는 최고 성능에 도달하기 위해 필요한 최소 operational intensity를 나타낸다.
- 최고 FLOPS나 클럭보다 병목과 작업 특성을 함께 보는 편이 실제 성능을 더 잘 설명한다.

## 인용할 만한 구절

> “A model need not be perfect, just insightful.”

## 위키 반영

이 자료는 [[비트와 바이트]], [[컴파일러 최적화]], [[비트 연산]]에서 다룬 데이터 표현과 소프트웨어 변환을 실제 성능 병목에 연결한다. “컴퓨팅 능력이란 무엇인가”에서는 최고 성능과 달성 성능, 계산 제한과 메모리 제한을 구분하는 핵심 모델로 사용할 수 있다.

## 출처

- 로컬 보존본: `raw/assets/2009_Williams_Waterman_Patterson_Roofline.pdf`
- ACM, [Roofline: An Insightful Visual Performance Model](https://doi.org/10.1145/1498765.1498785)
- UC Berkeley access copy, [RooflineVyNoYellow.pdf](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf)
- Berkeley Lab, [The Roofline Model](https://amcr.lbl.gov/departments/computer-science-department/ppan/roofline-performance-model/)

## 관련 항목

- [[The Linpack Benchmark]]
- [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]
- [[컴퓨팅 능력이란 무엇인가]]
