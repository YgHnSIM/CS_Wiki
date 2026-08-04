---
schema_version: 2
id: concept-ai-computing-bottlenecks
kind: concept
title: AI 컴퓨팅 병목
aliases:
  - AI bottlenecks
  - 인공지능 컴퓨팅 병목
summary: AI 시스템의 성능과 비용이 연산기 최고 처리율이 아니라 메모리 이동, 통신, 입출력, 전력·냉각과 같은 가장 느린 경로에 의해 제한되는 현상.
domains:
  - machine-learning
  - computer-architecture
  - systems
editorial_status: draft
publication_visibility: public
graph_visibility: public
created: 2026-08-04
updated: 2026-08-04
review:
  mode: pending
  revision: sha256:6406ec1d4d68eacc36c36d9b2ca0e1106cb43d4bfb92066f61639b7005d66029
  reviewed_at: null
  reviewed_by: null
evidence_ids:
  - ref-034
  - ref-039
  - ref-070
  - ref-077
  - ref-084
  - ref-042
capability_layers:
  - realized-performance
  - scalability
  - resource-efficiency
---

## 개요

[[AI 컴퓨팅 병목]]은 AI 모델을 실행할 때 연산 장치의 이론적 FLOP/s가 아니라 시스템 전체의 가장 제한적인 자원이나 경로가 실제 처리량·지연·비용을 결정하는 현상이다. 병목은 하나의 고정된 결함이 아니라 모델 단계, 입력 길이, 배치, 하드웨어 구성과 운영 목표에 따라 이동한다.

## 병목의 층위

| 층위 | 대표 제약 | 관찰할 지표 |
|---|---|---|
| 메모리 | HBM 대역폭, 용량, KV 캐시, 단편화 | HBM 바이트, 메모리 사용량, 대역폭 |
| 통신 | GPU 간 all-reduce·all-to-all, 동기화 | 링크 사용률, 통신 시간, 유휴 시간 |
| 입출력 | 데이터 로딩, 체크포인트, 저장소 지연 | 입력 대기, checkpoint 시간, goodput |
| 전력·시설 | 전력 한도, 냉각, 랙·전력망 용량 | W, 에너지/작업, PUE, 열 제한 |

[[Roofline An Insightful Visual Performance Model]]은 연산 지붕과 메모리 대역폭 지붕 중 낮은 쪽이 달성 성능을 제한한다는 기준을 준다. AI에서는 여기에 분산 통신과 시설 자원의 지붕을 추가해야 한다. TPU의 데이터센터 측정은 칩의 peak가 아니라 실제 모델 실행과 시스템 구성이 성능을 결정함을 보여주며, [[MLPerf Training Benchmark]]와 [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]는 학습·서빙을 종단 지표로 측정하려는 이유를 보여준다.

## 병목은 단계별로 다르다

LLM 학습에서는 장치 간 gradient·parameter 통신, 입력 파이프라인, 체크포인트가 계산과 겹치지 못할 때 시간이 늘어난다. 추론에서는 프리필이 큰 행렬 계산과 입력 읽기에 가까운 반면 디코드는 토큰별 순차 의존성과 KV 캐시 접근, 동시 요청의 스케줄링에 민감하다. 따라서 “모델의 FLOP가 얼마인가”만으로 학습과 온라인 생성의 비용을 비교할 수 없다.

## 측정 원칙

1. 학습·프리필·디코드·체크포인트 가운데 측정 경계를 명시한다.
2. 지연시간, 처리량, goodput, 에너지/토큰을 사용 목적에 맞게 구분한다.
3. 연산률뿐 아니라 메모리 바이트, 통신 시간, 입력·저장소 대기와 전력 제한을 기록한다.
4. 병목을 완화한 뒤 새로 지배적이 된 자원을 다시 측정한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[메모리 장벽]] | AI의 메모리 용량·대역폭 제약을 일반적인 프로세서-메모리 격차와 연결한다. | [[Hitting the Memory Wall]] |
| synthesizes | [[병렬 확장성]] | 자원 증가가 통신·동기화 비용을 함께 키우는 조건을 포함한다. | [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]] |
| measures | [[LLM 추론 서비스 지표]] | 지연·처리량·goodput을 실제 서비스 병목의 관측값으로 사용한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| constrains | [[에너지 비례 컴퓨팅]] | AI 시설의 전력과 냉각이 자원 효율과 배치 가능성을 제한한다. | [[MLPerf Inference Power Measurement]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-034`
- `ref-039`
- `ref-070`
- `ref-077`
- `ref-084`
- `ref-042`
<!-- wiki-v2:evidence-end -->

- [[Roofline An Insightful Visual Performance Model]]
- [[Hitting the Memory Wall]]
- [[MLPerf Training Benchmark]]
- [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]
- [[MLPerf Inference Power Measurement]]
- [[In-Datacenter Performance Analysis of a Tensor Processing Unit]]

## 관련 항목

- [[메모리 이동과 병목 이동]] — AI 최적화가 병목을 계산에서 메모리·통신·시설로 이동시키는 과정을 구체화한다.
- [[계산-통신 중첩]] — 분산 학습에서 통신을 계산과 겹쳐 노출 시간을 줄이는 원리를 설명한다.
- [[AI 인프라의 병목 계보]] — memory wall과 병렬 확장성에서 오늘의 AI 시설 제약까지 계보를 잇는다.
