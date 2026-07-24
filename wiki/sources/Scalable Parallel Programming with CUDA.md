---
title: Scalable Parallel Programming with CUDA
aliases: [CUDA, "Scalable Parallel Programming with CUDA", "Nickolls et al. 2008", CUDA programming model]
summary: "다수 코어 GPU의 병렬 자원을 일반 응용 프로그램이 활용하도록 커널·스레드 계층·메모리 계층을 노출한 CUDA 프로그래밍 모델을 설명한 2008년 논문."
tags: [type/reference, domain/software-engineering, domain/programming-languages, domain/computer-architecture, domain/performance, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2008
historical_layer: software
capability_layers: [programmability, realized-performance, scalability]
sources: [Scalable Parallel Programming with CUDA]
source_id: ref-097
source_kind: external
primary_sources: ["John Nickolls, Ian Buck, Michael Garland, and Kevin Skadron, Scalable Parallel Programming with CUDA, ACM Queue, 2008"]
supporting_sources: ["NVIDIA Research publication record and ACM Digital Library DOI record"]
source_urls: ["https://research.nvidia.com/publication/2008-03_scalable-parallel-programming-cuda", "https://doi.org/10.1145/1365490.1365500"]
retrieved: 2026-07-25
version: "ACM Queue 6(2), March/April 2008"
snapshot_status: external-only
status: active
graph_id: reference-cuda-programming-model-2008
graph_visibility: public
---

## 개요

[[Scalable Parallel Programming with CUDA]]는 John Nickolls, Ian Buck, Michael Garland, Kevin Skadron이 2008년 발표한 CUDA 프로그래밍 모델 소개 논문이다. 저자들은 멀티코어 CPU와 다수 코어 GPU가 병렬 시스템이 된 상황에서, 응용 프로그램이 코어 수가 다른 GPU에서도 병렬 작업을 확장할 수 있는 소프트웨어 모델을 제안했다.

CUDA는 호스트 코드와 GPU에서 실행되는 커널을 구분하고, 커널의 작업을 스레드·스레드 블록·그리드 계층으로 나눈다. 프로그래머와 컴파일러는 계산을 어느 단위로 나누고, 어떤 데이터를 어느 메모리 공간에 두며, 어떤 동기화가 필요한지를 함께 다뤄야 한다. 즉 가속기의 병렬성은 자동으로 얻어지는 속성이 아니라, 프로그램 표현과 실행 모델에 드러난 배치 선택이다.

## 확장성과 노출된 비용

논문은 동일한 병렬 프로그램이 서로 다른 수의 코어를 가진 GPU에서 작업을 확장할 수 있는 가능성을 강조한다. 그러나 실행 모델의 계층이 곧 모든 대상에서 같은 성능을 보장한다는 뜻은 아니다. 스레드 묶음의 크기, 메모리 접근 패턴, 데이터 전송, 제어 흐름의 분기와 실제 장치의 자원은 프로그램별로 다르다.

따라서 CUDA는 성능 이식성을 완성한 표준이라기보다, 이기종 하드웨어의 자원과 프로그램 구조를 연결하는 한 실행 모델이다. 같은 결과를 내는 두 커널도 타일링, 데이터 배치와 동기화 방법에 따라 전혀 다른 실행 시간을 보일 수 있다.

## 위키 반영

이 자료는 [[이기종 실행 모델]]에서 소스 수준의 병렬 작업을 가속기 자원에 매핑할 때 필요한 계층을 보여 주는 직접 사례다. [[도메인 특화 가속기]]에서는 하드웨어의 행렬·벡터 자원이 실제 성능이 되려면 상위 소프트웨어가 계산과 메모리 이동을 맞춰야 함을 보강한다. [[성능 이식성]]은 이 모델의 목표와 한계를 구분해, 컴파일 가능성과 여러 장치에서 경쟁력 있는 실행을 분리한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[이기종 실행 모델]] | 호스트·커널과 스레드·블록·그리드 계층을 통해 GPU 자원에 병렬 작업을 배치하는 구체적 실행 모델을 제시한다. | [[Scalable Parallel Programming with CUDA]] |
| enables | [[성능 이식성]] | 서로 다른 코어 수의 GPU에서 병렬 작업을 확장할 수 있는 프로그램 구조를 제공하지만, 실제 성능은 대상별 배치와 메모리 선택에 달려 있음을 드러낸다. | [[Scalable Parallel Programming with CUDA]] |

## 출처

- NVIDIA Research, [publication record](https://research.nvidia.com/publication/2008-03_scalable-parallel-programming-cuda)
- ACM Digital Library, [DOI record](https://doi.org/10.1145/1365490.1365500)

## 관련 항목

- [[이기종 실행 모델]] — 서로 다른 연산기와 메모리 계층에 작업을 배치하는 소프트웨어 계약을 정리한다.
- [[도메인 특화 가속기]] — GPU를 포함한 특화 하드웨어가 범용성과 효율을 교환하는 이유를 다룬다.
- [[성능 이식성]] — 여러 대상에서 실행될 수 있는 코드와 실제로 경쟁력 있는 실행을 구분한다.
- [[알고리즘과 스케줄 분리]] — 계산 정의와 타일링·병렬화·메모리 배치 선택을 분리하는 방법을 설명한다.
- [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning|TVM]] — CUDA를 포함한 여러 백엔드에 연산자 코드를 생성하는 컴파일러 사례다.
