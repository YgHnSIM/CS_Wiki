---
title: In-Datacenter Performance Analysis of a Tensor Processing Unit
aliases: [TPU paper, Jouppi et al. 2017, Tensor Processing Unit performance]
summary: "Google의 1세대 TPU를 실제 데이터센터 신경망 추론 작업으로 평가해 도메인 특화 하드웨어의 성능·에너지·꼬리 지연 이점을 분석한 2017년 논문."
tags: [type/reference, domain/computer-architecture, domain/machine-learning, status/active]
created: 2026-07-16
updated: 2026-07-16
sources: ["ISCA 2017 proceedings paper", "arXiv:1704.04760", "Google Research publication page"]
source_id: ref-042
source_kind: external
primary_sources: ["ISCA 2017 proceedings paper"]
supporting_sources: ["arXiv:1704.04760", "Google Research publication page"]
source_urls: ["https://doi.org/10.1145/3079856.3080246", "https://arxiv.org/abs/1704.04760", "https://research.google/pubs/in-datacenter-performance-analysis-of-a-tensor-processing-unit/"]
retrieved: 2026-07-16
version: "ISCA 2017; arXiv v1"
snapshot_status: external-only
status: active
---

## 개요

[[In-Datacenter Performance Analysis of a Tensor Processing Unit]]는 Norman P. Jouppi와 Google 연구진이 2017년에 발표한 1세대 Tensor Processing Unit(TPU) 평가 논문이다. 2015년부터 데이터센터 신경망 추론에 배치된 맞춤형 ASIC을 동시대 서버급 CPU와 GPU에 비교한다.

TPU의 핵심은 65,536개의 8비트 곱셈-누산기(MAC)를 갖춘 행렬 곱셈 장치와 28 MiB의 소프트웨어 관리 온칩 메모리다. 논문은 최고 92 TOPS라는 연산률뿐 아니라 실제 서비스의 MLP, CNN, LSTM 작업과 [[꼬리 지연 시간|99백분위 응답 시간]] 제약을 평가한다.

논문이 보고한 구성과 작업 부하에서는 TPU가 비교 대상 CPU·GPU보다 평균 약 15–30배 빠르고, TOPS/W는 약 30–80배 높았다. 이 수치는 TPU라는 범주의 보편적 우월성을 뜻하지 않는다. 특정 세대의 하드웨어, 8비트 추론, Google의 생산 작업 부하와 데이터센터 지연 시간 조건에 대한 결과다.

TPU는 범용 프로세서의 캐시, 비순차 실행, 분기 예측 같은 복잡한 기능을 줄이고 행렬 연산과 예측 가능한 실행에 자원을 집중한다. 이 선택은 [[도메인 특화 가속기]]가 범용성을 일부 포기해 특정 작업에서 더 높은 성능과 에너지 효율을 얻는 방식을 구체적으로 보여준다.

## 주요 인사이트

- 도메인 특화 성능은 연산기 수뿐 아니라 데이터 경로와 메모리 관리 방식에서 나온다.
- 데이터센터 추론은 평균 처리량과 함께 99백분위 지연 시간을 요구한다.
- 실제 생산 작업 부하를 사용해야 최고 연산률과 달성 성능의 차이를 평가할 수 있다.
- 논문의 속도·효율 배수는 정해진 비교 대상과 측정 조건에 한정된다.
- 가속기의 가치는 하드웨어와 상위 프레임워크, 서비스 요구 조건의 공동 설계에 있다.

## 인용할 만한 구절

> 비용·에너지·성능의 큰 개선은 도메인 특화 하드웨어에서 올 수 있다.

논문 초록의 문제의식을 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[도메인 특화 가속기]]의 대표 사례이자, [[컴퓨팅 능력이란 무엇인가]]에서 작업 부하·정밀도·꼬리 지연·에너지 조건을 함께 기록해야 하는 이유를 보여준다. [[컴퓨팅 능력의 발달사]]에서는 범용 단일 코어 향상 이후 성능이 특정 도메인과 전체 소프트웨어 스택의 공동 설계로 이동한 사례로 사용한다. 평균과 높은 백분위가 다른 성능 질문이라는 점은 [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]에서 확장한다.

## 출처

- ACM, [DOI record](https://doi.org/10.1145/3079856.3080246)
- arXiv, [1704.04760](https://arxiv.org/abs/1704.04760)
- Google Research, [publication page](https://research.google/pubs/in-datacenter-performance-analysis-of-a-tensor-processing-unit/)

## 관련 항목

- [[도메인 특화 가속기]]
- [[The Datacenter as a Computer]]
- [[The Tail at Scale]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
- [[꼬리 지연 시간]]
- [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]
