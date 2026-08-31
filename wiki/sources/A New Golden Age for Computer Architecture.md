---
schema_version: 2
id: ref-138
kind: reference
title: A New Golden Age for Computer Architecture
aliases:
  - Hennessy-Patterson 2019
  - Turing Lecture 2018
  - A New Golden Age for Computer Architecture
  - Domain-Specific Architectures
summary: 무어의 법칙과 Dennard 스케일링의 종성 이후 도메인 특화 아키텍처와 하드웨어-소프트웨어 공동 설계가 혁신을 이끌 것임을 선언한 튜링상 강연 논문.
domains:
  - computer-architecture
  - computer-history
  - machine-learning
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-31
updated: 2026-08-31
review:
  mode: attested
  revision: sha256:3010abb01e777fd5e9fa7c3fb6208acceb45f3d72b020228dc1e89b9eb5d869a
  reviewed_at: 2026-08-31
  reviewed_by: antigravity
evidence_ids: []
capability_layers:
  - realized-performance
  - resource-efficiency
  - programmability
history:
  publication_year: 2019
  layer: architecture
redirect_from:
  - /references/a-new-golden-age-for-computer-architecture/
  - /sources/a-new-golden-age-for-computer-architecture/
origin: external
works:
  primary:
    - citation: John L. Hennessy and David A. Patterson, A New Golden Age for Computer Architecture, Communications of the ACM 62(2), February 2019, pp. 48-60.
      genre: primary-literature
      identifiers: []
      edition: CACM 62(2), February 2019
  supporting:
    - citation: ACM Digital Library DOI record
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: doi
    url: https://doi.org/10.1145/3282307
    retrieved: 2026-08-31
    version: CACM 62(2), February 2019
  - kind: url
    role: canonical
    url: https://dl.acm.org/doi/10.1145/3282307
    retrieved: 2026-08-31
    version: CACM 62(2), February 2019
---

## 개요

[[A New Golden Age for Computer Architecture]]는 컴퓨터 구조의 선구자인 존 헤네시(John L. Hennessy)와 데이비드 패터슨(David A. Patterson)이 2018년 ACM 튜링상(A.M. Turing Award)을 수상하며 발표한 기념 강연 논문이다. 저자들은 반도체 미세화와 클록 속도 향상을 이끌던 [[무어의 법칙]]과 [[Dennard 스케일링]]이 물리적 한계에 부딪히며 단일 범용 프로세서(CPU) 중심의 성능 향상 시대가 종언을 고했다고 진단했다.

논문은 이러한 한계를 돌파하기 위한 유일한 해법으로 **도메인 특화 아키텍처(DSA, Domain-Specific Architectures)**와 프로그래밍 언어·컴파일러·하드웨어의 공동 설계를 제시한다. 모든 작업을 두루 처리하려던 범용 프로세서의 오버헤드를 덜어내고, 특정 문제 영역(머신러닝, 그래픽스, 신호 처리 등)의 연산 패턴에 직접 맞춘 전용 실행 엔진을 구축함으로써 수십~수백 배의 에너지 효율과 처리량을 달성할 수 있음을 역설한다.

## 핵심 통찰

- **범용 스케일링의 종언과 암달의 법칙**: 전력 장벽(Power Wall)과 암달의 법칙(Amdahl's Law)으로 인해 범용 멀티코어만으로는 지속적인 성능 성장이 불가능해졌다.
- **도메인 특화 아키텍처(DSA)**: 특정 도메인에 자원을 집중하기 위해 더 특화된 연산 단위(예: 시스톨릭 어레이), 메모리 대역폭 최적화(SRAM 및 소프트웨어 관리 버퍼), 낮은 정밀도 연산(INT8, FP16/BF16)을 채택한다.
- **범용성과 효율의 교환**: DSA는 높은 에너지 효율을 얻는 대신 알고리즘 변화에 대한 유연성을 희생한다. 따라서 시스템은 범용 호스트 CPU와 도메인 특화 가속기가 협력하는 이종(Heterogeneous) 구조로 수렴한다.
- **새로운 황금기**: 하드웨어 설계가 소프트웨어 및 고급 언어와 다시 밀접하게 결합하면서, 컴퓨터 구조는 새로운 혁신의 기회를 맞이하고 있다.

## 인용할 만한 구절

> 무어의 법칙이 쇠퇴함에 따라 범용 성능을 높이던 마법은 끝났다. 다음 세대의 성능과 효율은 도메인 특화 아키텍처와 하드웨어-소프트웨어 공동 설계에서 나와야 한다.
<!-- wiki-v2:quote-locator evidence="ref-138" locator="wiki/sources/A New Golden Age for Computer Architecture.md:line-21#인용할-만한-구절" status="recorded" -->

## 위키 반영

이 논문은 [[계산기와 컴퓨터의 차이]]에서 특수 목적 연산기(차분 기관 / DSA / TPU)와 범용 기호 제어기(해석 기관 / CPU)의 구분이 현대 AI 시스템에서 어떻게 재현되는지 설명하는 핵심 근거로 사용된다. 또한 [[도메인 특화 가속기]], [[이기종 실행 모델]], [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]의 이론적 토대를 제공한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[도메인 특화 가속기]] | 범용 프로세서의 한계를 극복하기 위해 특정 도메인 연산에 하드웨어를 최적화하는 DSA 개념을 제시한다. | [[A New Golden Age for Computer Architecture]] |
| synthesizes | [[이기종 실행 모델]] | 범용 호스트 CPU와 특화 가속기가 분업하는 이종 컴퓨팅 구조의 필연성을 분석한다. | [[A New Golden Age for Computer Architecture]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- ACM Digital Library, [DOI record](https://doi.org/10.1145/3282307)
- Communications of the ACM, [Turing Lecture Page](https://cacm.acm.org/magazines/2019/2/234352-a-new-golden-age-for-computer-architecture/fulltext)

## 관련 항목

- [[도메인 특화 가속기]] — 특정 연산 패턴에 하드웨어를 고정해 효율을 얻는 가속기 개념.
- [[이기종 실행 모델]] — CPU 호스트와 특화 가속기가 제어와 연산을 분담하는 구조.
- [[계산기와 컴퓨터의 차이]] — 특수 목적 계산기와 범용 기호 조작 기계의 역사적·현대적 비교.
- [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]] — 클록 스케일링의 한계와 아키텍처 다변화의 배경.
- [[In-Datacenter Performance Analysis of a Tensor Processing Unit]] — DSA 원리를 실제 데이터센터 신경망 추론에 적용한 TPU 논문.
