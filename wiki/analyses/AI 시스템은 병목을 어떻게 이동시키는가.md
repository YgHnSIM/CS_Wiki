---
schema_version: 2
id: analysis-ai-bottleneck-shifting
kind: analysis
title: AI 시스템은 병목을 어떻게 이동시키는가
aliases:
  - AI bottleneck shifting
  - 병목 이동 분석
summary: FlashAttention, PagedAttention, 프리필·디코드 분리, 분산 학습과 전력 측정 사례를 비교해 AI 최적화가 병목을 제거하기보다 다른 계층으로 이동시키는 조건을 분석한다.
domains:
  - machine-learning
  - systems
  - computer-architecture
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-04
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:c3cad614a147f952fe4e8c22b7dfc2ec01097ab52d3e6f8dbf3d0cf6adc087be
  reviewed_at: null
  reviewed_by: null
evidence_ids:
  - ref-074
  - ref-076
  - ref-077
  - ref-070
  - ref-084
  - ref-046
capability_layers:
  - realized-performance
  - scalability
  - resource-efficiency
---

## 분석 틀

AI 시스템 최적화는 “무엇을 빨리 만들었는가”보다 “어느 대기 시간을 어느 자원으로 바꾸었는가”로 읽을 수 있다. 이 분석은 같은 시스템의 전후를 단일 처리량으로 비교하지 않고, 병목의 위치·노출 시간·새로 부담하는 자원을 추적한다.

## 사례 비교

| 대응 | 줄어드는 비용 | 새로 확인해야 할 비용 |
|---|---|---|
| FlashAttention | 중간 어텐션 행렬의 HBM 왕복 | 타일 크기, 재계산, 커널 점유율 |
| PagedAttention | KV 캐시 단편화와 낭비 | 총 KV 용량, HBM 대역폭, 스케줄링 |
| 프리필·디코드 분리 | 서로 다른 단계의 자원 간섭 | KV 전송, 라우팅, 복제와 균형 |
| 분산 학습 확장 | 단일 장치의 계산·메모리 한계 | all-reduce/all-to-all, 동기화, 입력·체크포인트 |
| 전력 측정 | peak 성능만으로 숨겨진 운영 비용 | 에너지/작업, 냉각, 전력 밀도와 배치 한도 |

[[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]은 산술량을 유지하면서 메모리 이동을 줄인다. [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]은 캐시 배치를 개선해 더 많은 요청을 수용하지만 캐시 자체의 총량을 없애지 않는다. [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]은 프리필과 디코드의 자원 간섭을 분리하는 대신 단계 사이의 상태 이동과 스케줄링을 중요한 비용으로 만든다.

## 학습과 서빙의 공통 구조

학습의 통신 중첩과 서빙의 연속 배칭은 서로 다른 기법이지만 공통적으로 유휴 시간을 줄이기 위해 작업을 재배치한다. 이때 평균 지연만 좋아진다고 전체 시스템이 좋아지는 것은 아니다. 꼬리 지연, 완료한 유효 작업량, 전력과 오류 복구까지 측정 경계에 포함해야 한다. [[MLPerf Training Benchmark]]와 [[MLPerf Inference Power Measurement]]는 이러한 종단 비교의 기준을 제공한다.

## 결론과 불확실성

AI 병목 최적화의 핵심은 첫 병목을 찾고, 그 최적화가 만든 새로운 병목을 재측정하는 폐루프다. 한 논문의 속도 향상을 다른 GPU·길이·배치·전력 조건에 일반화해서는 안 된다. 특히 메모리 절감이 통신 증가로 이어지거나, 처리량 증가가 전력·냉각 한도로 상쇄될 수 있으므로 시스템 경계와 운영 목표를 명시해야 한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[메모리 이동과 병목 이동]] | 메모리 최적화가 다음 계층의 비용을 드러내는 공통 구조를 분석한다. | [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]] |
| synthesizes | [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]] | 커널 수준 IO와 서비스 수준 캐시·단계 분리를 함께 읽는다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| synthesizes | [[AI 컴퓨팅 병목]] | 메모리·통신·입출력·전력 병목을 하나의 관측 틀로 묶는다. | [[MLPerf Inference Power Measurement]] |
| responds_to | [[병렬 확장성]] | 자원 확장으로 생기는 통신·동기화 비용에 대응하는 재배치 전략을 분석한다. | [[MLPerf Training Benchmark]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-074`
- `ref-076`
- `ref-077`
- `ref-070`
- `ref-084`
- `ref-046`
<!-- wiki-v2:evidence-end -->

- [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]
- [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]
- [[MLPerf Training Benchmark]]
- [[MLPerf Inference Power Measurement]]
- [[The Case for Energy-Proportional Computing]]

## 관련 항목

- [[AI 컴퓨팅 병목]] — 병목의 종류와 측정 지표를 정의한다.
- [[메모리 이동과 병목 이동]] — 데이터 이동 최적화의 연쇄 효과를 설명한다.
- [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]] — FLOP와 IO를 분리한 커널 수준 분석이다.
- [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]] — 요청 수준 캐시 용량과 처리량을 분석한다.
