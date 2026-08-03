---
schema_version: 2
id: analysis-ai-bottleneck-lineage
kind: analysis
title: AI 인프라의 병목 계보
aliases:
  - AI bottleneck lineage
  - 컴퓨팅 병목의 역사
summary: Amdahl의 순차 부분, memory wall, Roofline, 도메인 특화 가속기와 데이터센터 컴퓨팅을 연결해 현재 AI 병목이 과거 개념의 단절이 아니라 계층화된 연속임을 분석한다.
domains:
  - computer-architecture
  - machine-learning
  - systems
editorial_status: draft
publication_visibility: public
graph_visibility: public
created: 2026-08-04
updated: 2026-08-04
review:
  mode: pending
  revision: sha256:71cf795e0915fe867165766e8c93c60c879ab230fee350b144cd3c45b62a26bc
  reviewed_at: null
  reviewed_by: null
evidence_ids:
  - ref-035
  - ref-039
  - ref-034
  - ref-042
  - ref-046
  - ref-041
capability_layers:
  - realized-performance
  - scalability
  - resource-efficiency
---

## 질문

현재 AI의 컴퓨팅 병목은 새로 생긴 문제인가. 결론부터 말하면 새 규모와 조합은 새롭지만 핵심 구조는 오래된 개념들의 연장이다. 병렬 자원을 늘릴수록 순차 구간이 지배한다는 Amdahl의 관점, 프로세서와 메모리의 격차를 말하는 memory wall, 연산 집약도와 대역폭을 비교하는 Roofline이 서로 다른 계층에서 같은 질문을 한다. “어떤 자원이 다음 작업을 기다리게 하는가?”라는 질문이다.

## 계보

1. **순차성**: Amdahl은 병렬화되지 않는 부분이 가속 상한을 만든다고 보았다. AI에서는 동기화, 데이터 준비, 디코드의 토큰 의존성이 이 부분으로 나타난다.
2. **메모리 격차**: memory wall은 빠른 연산기가 느린 메모리 계층을 기다리는 구조를 명명했다. 대규모 모델에서는 가중치와 KV 상태를 읽는 HBM 트래픽이 이 문제를 반복한다.
3. **균형점**: Roofline은 peak FLOP를 달성 성능과 동일시하지 않고 연산 집약도와 메모리 대역폭의 균형점으로 보게 했다.
4. **맞춤 경로**: TPU의 사례는 데이터 흐름과 메모리·네트워크를 모델에 맞춰 설계하면 범용 장치의 유휴를 줄일 수 있지만, 병목을 시스템의 다른 경로로 이동시킬 수 있음을 보여준다.
5. **시설 규모**: [[The Datacenter as a Computer]]는 데이터센터를 하나의 컴퓨터처럼 다룬다. AI에서는 전력·냉각·랙·네트워크가 계산 장치와 같은 설계 대상이 된다.

## AI에서의 재조합

AI 학습은 대규모 행렬 계산만의 문제가 아니다. 장치 수가 늘면 통신과 동기화가 등장하고, 모델 크기가 커지면 메모리 용량과 대역폭이 등장하며, 서비스가 커지면 요청 스케줄링과 시설 전력이 등장한다. [[The Case for Energy-Proportional Computing]]과 [[MLPerf Inference Power Measurement]]는 성능을 에너지와 분리할 수 없음을 보강한다.

따라서 AI 병목을 “GPU 부족”으로 단일화하면 개선 순서를 잘못 잡는다. 메모리 이동을 줄인 뒤 네트워크가 병목이 될 수 있고, 통신을 겹친 뒤 전력 한도가 배치 규모를 제한할 수 있다. 병목은 계층화되고, 최적화는 그 계층 사이에서 이동한다.

## 분석 결론

현재 AI의 차별점은 병목의 종류보다 병목이 동시에 작동하는 규모와 운영 목표의 다양성이다. 역사적 개념은 폐기된 것이 아니라 측정 경계를 넓히는 도구가 된다. 단일 peak 지표 대신 단계별 시간 분해, 데이터 이동, 통신 노출, 에너지와 goodput을 함께 기록해야 과거 개념과 현재 시스템을 정직하게 연결할 수 있다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[병렬 확장성]] | Amdahl식 순차 구간과 AI의 통신·동기화 비용을 연결한다. | [[Reevaluating Amdahl's Law]] |
| synthesizes | [[메모리 장벽]] | memory wall을 대규모 모델의 가중치·상태 이동으로 확장한다. | [[Hitting the Memory Wall]] |
| synthesizes | [[AI 컴퓨팅 병목]] | 역사적 개념들을 현대 AI의 종단 병목 분류로 종합한다. | [[In-Datacenter Performance Analysis of a Tensor Processing Unit]] |
| constrains | [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]] | 시설 전력과 에너지를 성능의 외부 조건이 아닌 병목 계층으로 본다. | [[MLPerf Inference Power Measurement]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-035`
- `ref-039`
- `ref-034`
- `ref-042`
- `ref-046`
- `ref-041`
<!-- wiki-v2:evidence-end -->

- [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]
- [[Hitting the Memory Wall]]
- [[Roofline An Insightful Visual Performance Model]]
- [[In-Datacenter Performance Analysis of a Tensor Processing Unit]]
- [[The Case for Energy-Proportional Computing]]
- [[The Datacenter as a Computer]]

## 관련 항목

- [[AI 컴퓨팅 병목]] — 계보를 현재 AI 시스템의 병목 층위로 정리한다.
- [[메모리 이동과 병목 이동]] — 최적화가 병목을 다음 계층으로 옮기는 메커니즘을 설명한다.
- [[계산-통신 중첩]] — 병렬성의 통신 비용에 대한 현대적 대응을 다룬다.
- [[컴퓨팅 능력의 발달사]] — 컴퓨팅 능력의 장기적 역사 맥락을 제공한다.
