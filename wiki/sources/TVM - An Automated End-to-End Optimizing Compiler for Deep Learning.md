---
schema_version: 2
id: ref-099
kind: reference
title: "TVM: An Automated End-to-End Optimizing Compiler for Deep Learning"
aliases:
  - "TVM: An Automated End-to-End Optimizing Compiler for Deep Learning"
  - TVM
  - Chen et al. 2018
  - TVM compiler
summary: 계산 그래프와 텐서 연산자 수준의 최적화를 결합하고 대상 하드웨어별 코드 탐색을 자동화해 딥러닝 작업의 성능 이식성을 추구한 2018년 TVM 논문.
domains:
  - machine-learning
  - software-engineering
  - computer-architecture
  - performance
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:85935f5cc254f27d19e13f01b2eff7f542e8754555a395bfad08754963454783
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - programmability
  - realized-performance
  - resource-efficiency
history:
  publication_year: 2018
  layer: software
redirect_from:
  - /references/tvm-an-automated-end-to-end-optimizing-compiler-for-deep-learning/
  - /sources/tvm-an-automated-end-to-end-optimizing-compiler-for-deep-learning/
origin: external
works:
  primary:
    - citation: "Tianqi Chen et al., TVM: An Automated End-to-End Optimizing Compiler for Deep Learning, OSDI 2018"
      genre: other
      identifiers: []
      edition: OSDI '18, pp. 578–594
  supporting:
    - citation: USENIX OSDI 2018 presentation record and open-access conference paper PDF
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://www.usenix.org/conference/osdi18/presentation/chen
    retrieved: 2026-07-25
    version: OSDI '18, pp. 578–594
  - kind: url
    role: mirror
    url: https://www.usenix.org/system/files/osdi18-chen.pdf
    retrieved: 2026-07-25
    version: OSDI '18, pp. 578–594
---

## 개요

[[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning|TVM]]은 Tianqi Chen 등 연구진이 2018년 OSDI에서 발표한 딥러닝 컴파일러 논문이다. 논문은 고수준 프레임워크가 정의한 계산 그래프를 받아 그래프 수준 최적화와 연산자 수준 코드 생성을 연결하고, CPU·GPU·FPGA 기반 가속기처럼 서로 다른 백엔드를 대상으로 최적화된 모듈을 만들려 했다.

TVM의 문제 설정은 딥러닝 모델이 같은 수학적 연산을 표현해도 하드웨어마다 유리한 연산기, 메모리 구조, 데이터 배치와 병렬화 방식이 다르다는 데 있다. 고정된 공급업체 라이브러리만으로는 새 연산자·새 장치를 포괄하기 어렵기 때문에, 계산 그래프 변환·연산자 융합·데이터 배치·저수준 스케줄 탐색을 하나의 컴파일 파이프라인에 둔다.

## 자동 탐색과 성능 이식성

TVM은 텐서 연산의 선언과 대상별 변환을 분리하고, 비용 모델을 이용해 타일링·루프 순서·메모리 접근·스레드 배치 같은 후보를 탐색한다. 여기서 성능 이식성은 같은 소스가 변경 없이 모든 장치에서 같은 속도를 낸다는 뜻이 아니다. 동일한 계산의 의미를 유지하면서도 각 대상의 측정된 특성에 맞는 구현을 찾아, 손으로 튜닝한 라이브러리와 비교 가능한 실행을 목표로 한다는 뜻이다.

논문의 성능 결과는 명시된 연산자, 장치, 프레임워크와 비교 기준에 대한 결과다. 후대의 모델·드라이버·컴파일러 버전이나 다른 입력 형태에 대한 일반 보장으로 읽으면 안 된다. 자동 탐색의 비용과 재현성, 품질·수치 정확성의 계약도 배포 환경에서 별도로 기록해야 한다.

## 위키 반영

이 자료는 [[성능 이식성]]과 [[이기종 실행 모델]]의 직접 근거다. [[중간 표현]]의 관점에서는 계산 그래프·텐서 표현·저수준 코드 생성을 하나의 계층으로 축소하지 않고, 서로 다른 추상화 수준에서 최적화를 수행하는 사례다. [[알고리즘과 스케줄 분리]]에서는 Halide의 계산/스케줄 분리 관점이 자동화된 연산자 탐색으로 확장되는 지점을 보여 준다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[성능 이식성]] | 그래프·연산자 수준 최적화와 대상별 자동 탐색을 결합해 다양한 하드웨어 백엔드에서 경쟁력 있는 실행을 목표로 한다. | [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning]] |
| implements | [[중간 표현]] | 계산 그래프, 텐서 연산 표현, 최적화된 저수준 루프 프로그램을 서로 다른 변환 단계의 표현으로 사용한다. | [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning]] |
| enables | [[이기종 실행 모델]] | CPU·GPU·가속기별 계산 원시 연산과 메모리 구조에 맞춰 코드와 실행 모듈을 생성할 수 있게 한다. | [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- USENIX, [OSDI 2018 presentation and bibliographic record](https://www.usenix.org/conference/osdi18/presentation/chen)
- USENIX, [open-access conference paper PDF](https://www.usenix.org/system/files/osdi18-chen.pdf)

## 관련 항목

- [[성능 이식성]] — 여러 하드웨어에서 컴파일 가능함과 경쟁력 있는 실행을 구분하는 목표다.
- [[중간 표현]] — 계산 그래프와 저수준 코드 사이에서 분석·변환을 유지하는 표현 계층을 설명한다.
- [[이기종 실행 모델]] — 서로 다른 연산기와 메모리 계층에 작업을 배치하는 소프트웨어 모델을 다룬다.
- [[알고리즘과 스케줄 분리]] — 계산 정의와 대상별 실행 선택을 분리하는 설계 원리를 정리한다.
- [[도메인 특화 가속기]] — TVM이 대상으로 삼는 가속기의 범용성·효율 교환을 설명한다.
