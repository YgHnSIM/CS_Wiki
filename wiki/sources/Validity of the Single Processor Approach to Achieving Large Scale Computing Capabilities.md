---
title: Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities
aliases: [Amdahl 1967, Amdahl single processor paper]
summary: "병렬화되지 않는 순차 작업과 데이터 관리 오버헤드가 다중 프로세서의 전체 가속을 제한한다는 주장을 제시해 암달의 법칙의 기원이 된 1967년 논문."
tags: [type/reference, domain/computer-architecture, domain/computer-history, status/active]
created: 2026-07-15
updated: 2026-07-15
sources: ["1967_Amdahl_Single_Processor_Approach.pdf", "AFIPS Spring Joint Computer Conference 1967"]
source_id: ref-035
source_kind: external
primary_sources: ["AFIPS Spring Joint Computer Conference 1967"]
supporting_sources: ["1967_Amdahl_Single_Processor_Approach.pdf", "ACM DOI record", "Carnegie Mellon University access copy"]
source_urls: ["https://doi.org/10.1145/1465482.1465560", "https://www.cs.cmu.edu/~18742/papers/Amdahl1967.pdf"]
retrieved: 2026-07-15
version: null
snapshot_status: archived
status: active
---

## 개요

[[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]는 Gene M. Amdahl이 1967년 Spring Joint Computer Conference에서 발표한 짧은 논문이다. 여러 프로세서를 연결하면 큰 계산 능력을 얻을 수 있다는 주장에 맞서, 실제 문제의 순차적 데이터 관리 작업과 불규칙성이 전체 성능 향상을 제한한다고 논증한다.

Amdahl은 당시 생산 프로그램에서 데이터 관리 housekeeping이 상당한 비율을 차지하며, 이 부분은 병렬 처리하기 어렵다고 보았다. 병렬화할 수 있는 부분만 매우 빠르게 만들어도 순차 처리율이 함께 개선되지 않으면 전체 처리량의 향상은 제한된다. 오늘날 암달의 법칙으로 정리되는 핵심 직관은 전체 작업 중 개선되지 않는 비율이 전체 가속의 상한을 정한다는 것이다.

논문은 현실의 물리 계산이 규칙적인 격자 연산만으로 이루어지지 않는다는 점도 강조한다. 불규칙한 경계, 비균질한 내부, 상태 의존 계산, 서로 다른 전파 속도와 데이터 재배치는 단순한 병렬 기계 모델이 예상하는 성능을 떨어뜨린다. 따라서 프로세서 수나 이론적 병렬 연산률만으로 실제 컴퓨팅 능력을 판단할 수 없다.

## 주요 인사이트

- 전체 성능 향상은 가속한 부분이 아니라 가속하지 못한 부분의 비율에도 좌우된다.
- 병렬 연산 장치의 성능만 높이고 순차 처리율을 개선하지 않으면 전체 가속은 제한된다.
- 데이터 관리, 동기화와 메모리 충돌 같은 오버헤드는 병렬 처리의 유효 성능을 낮춘다.
- 규칙적인 시험 문제에서 얻은 병렬 성능이 불규칙한 실제 문제에 그대로 이어지지 않을 수 있다.
- 컴퓨팅 능력의 확장성은 자원 수보다 작업의 병렬화 가능한 구조로 평가해야 한다.

## 인용할 만한 구절

> “effort expended on achieving high parallel processing rates is wasted unless it is accompanied by achievements in sequential processing rates”

## 위키 반영

이 자료는 [[제어 흐름]], [[서브루틴]], [[스택]]처럼 순차적 의존성을 갖는 실행 구조가 병렬 성능과 어떤 관계를 갖는지 확장한다. “컴퓨팅 능력이란 무엇인가”에서는 자원을 추가했을 때의 확장성과 이론적 최대 가속의 한계를 설명하는 근거로 사용할 수 있다.

## 출처

- 로컬 보존본: `raw/assets/1967_Amdahl_Single_Processor_Approach.pdf`
- ACM, [Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities](https://doi.org/10.1145/1465482.1465560)
- Carnegie Mellon University access copy, [Amdahl1967.pdf](https://www.cs.cmu.edu/~18742/papers/Amdahl1967.pdf)

## 관련 항목

- [[Roofline An Insightful Visual Performance Model]]
