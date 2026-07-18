---
title: The Landscape of Parallel Computing Research - A View from Berkeley
aliases: [Berkeley View, Berkeley parallel computing report, 병렬 컴퓨팅의 전망]
summary: "전력·명령 수준 병렬성·메모리 병목으로 단일 프로세서 성능 향상의 수익이 감소한 상황에서 병렬 하드웨어와 소프트웨어를 함께 재설계해야 한다고 제안한 2006년 보고서."
tags: [type/reference, domain/computer-architecture, domain/computer-science, status/active]
created: 2026-07-16
updated: 2026-07-18
publication_year: 2006
historical_layer: system
capability_layers: [scalability, resource-efficiency]
sources: ["UC Berkeley Technical Report EECS-2006-183", "UC Berkeley report page"]
source_id: ref-040
source_kind: external
primary_sources: ["UC Berkeley Technical Report EECS-2006-183"]
supporting_sources: ["UC Berkeley report page"]
source_urls: ["https://www2.eecs.berkeley.edu/Pubs/TechRpts/2006/EECS-2006-183.pdf", "https://www2.eecs.berkeley.edu/Pubs/TechRpts/2006/EECS-2006-183.html"]
retrieved: 2026-07-16
version: "EECS-2006-183, December 2006"
snapshot_status: external-only
status: active
---

## 개요

[[The Landscape of Parallel Computing Research - A View from Berkeley]]는 Krste Asanović, Ras Bodik, James Demmel, David Patterson 등 UC Berkeley 연구자들이 2006년에 발표한 보고서다. 2005년 무렵 산업이 단일 프로세서의 클럭·명령 수준 병렬성 향상에서 멀티코어로 방향을 바꾼 상황을 출발점으로 삼는다.

보고서는 전력, 메모리, 명령 수준 병렬성(instruction-level parallelism)의 한계를 서로 분리된 문제가 아니라 단일 프로세서 성능 향상의 수익 감소를 만드는 결합된 제약으로 본다. 트랜지스터를 더 많이 사용할 수 있어도 범용 코어를 복잡하게 만드는 방식만으로는 성능과 에너지 효율을 같은 속도로 높이기 어려워졌다.

대안은 단순히 코어 수를 늘리는 것이 아니다. 실제 응용의 병렬 구조를 파악하고, 프로그래밍 모델·언어·컴파일러·운영체제·구조를 함께 설계해야 한다. 보고서는 다양한 응용을 계산·통신 패턴에 따라 13개의 “dwarf”로 분류해, 몇 개의 작은 벤치마크가 아니라 반복되는 병렬 패턴을 연구 단위로 삼자고 제안한다.

이 자료의 역사적 의미는 컴퓨팅 능력 향상의 기본 경로가 자동적인 단일 스레드 가속에서 **명시적 병렬성, 데이터 이동 관리, 에너지 효율과 응용 맞춤 설계**로 이동했음을 체계적으로 기록했다는 데 있다. 다만 이 보고서는 2006년의 연구 의제이므로 이후 멀티코어 생태계의 실제 결과와 구분해 읽어야 한다.

## 주요 인사이트

- 2005년 전후 멀티코어 전환은 단순한 제품 선택이 아니라 단일 프로세서 개선의 수익 감소에 대한 대응이었다.
- 병렬 하드웨어는 병렬 프로그래밍 모델과 소프트웨어 지원 없이 자동으로 성능을 제공하지 않는다.
- 전력 장벽, 메모리 장벽과 명령 수준 병렬성의 한계는 서로 얽혀 있다.
- 응용의 반복되는 계산·통신 패턴은 병렬 시스템 설계와 평가의 유용한 단위다.
- 성능의 중심은 클럭 하나에서 하드웨어·소프트웨어 공동 설계로 이동한다.

## 인용할 만한 구절

> 병렬 컴퓨팅의 성공은 응용, 소프트웨어와 하드웨어를 함께 다루는 데 달려 있다.

보고서의 연구 방향을 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[Dennard 스케일링]] 이후의 전력 제약, [[메모리 장벽]], 멀티코어와 [[도메인 특화 가속기]]의 부상을 하나의 전환으로 연결한다. [[컴퓨팅 능력의 발달사]]에서는 “더 빠른 코어”에서 “더 많은 병렬 자원과 더 나은 소프트웨어 매핑”으로 성능 향상 방식이 바뀐 근거로 사용한다. [[병렬 확장성]]과 [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]에서는 암달·Gustafson의 이상 모델에 통신, 동기화와 소프트웨어 공동 설계의 실제 비용을 더하는 자료로 사용한다.

## 출처

- UC Berkeley, [technical report PDF](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2006/EECS-2006-183.pdf)
- UC Berkeley, [report page](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2006/EECS-2006-183.html)

## 관련 항목

- [[Dennard 스케일링]]
- [[메모리 장벽]]
- [[도메인 특화 가속기]]
- [[컴퓨팅 능력의 발달사]]
- [[병렬 확장성]]
- [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]
