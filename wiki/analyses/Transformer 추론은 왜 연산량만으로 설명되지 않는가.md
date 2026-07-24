---
title: Transformer 추론은 왜 연산량만으로 설명되지 않는가
aliases: [Transformer IO 병목, Transformer inference beyond FLOPs, 어텐션 메모리 병목]
summary: "Transformer의 학습 병렬성·자동회귀 생성 순차성·밀집 어텐션 산술량을 구분하고, FlashAttention이 더 많은 재계산으로도 메모리 이동을 줄여 실제 시간을 단축하는 이유를 분석한다."
tags: [type/analysis, domain/machine-learning, domain/computer-architecture, domain/systems, status/active]
created: 2026-07-24
updated: 2026-07-24
historical_layer: architecture
capability_layers: [realized-performance, scalability, resource-efficiency]
sources: ["Attention Is All You Need", "FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness", "Hitting the Memory Wall", "Roofline An Insightful Visual Performance Model"]
status: active
graph_id: analysis-transformer-io-bottleneck
graph_visibility: public
---

## 문제 제기

Transformer의 연산량을 알면 추론 속도를 설명할 수 있는가. FLOP 수는 중요한 출발점이지만 충분하지 않다. 같은 산술량이라도 데이터를 어디에서 읽고 쓰는지, 중간 행렬을 구체화하는지, 가속기의 병렬 연산기를 채울 만큼 작업이 있는지, 생성 토큰이 앞 토큰에 의존하는지가 실제 지연과 처리량을 바꾼다.

[[Attention Is All You Need]]은 순환을 제거해 학습 시 시퀀스 위치를 함께 계산할 수 있는 [[Transformer]]를 제시했다. [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]은 후대의 GPU에서 같은 정확 어텐션을 더 적은 HBM 이동으로 실행할 수 있음을 보였다. 두 자료를 함께 읽으면 모델의 계산 그래프와 시스템의 실행 비용이 서로 다른 층위임을 알 수 있다.

## 1. 학습 병렬성은 생성 순차성의 제거가 아니다

훈련에서는 입력과 정답 출력 시퀀스가 주어지므로 마스크를 적용한 여러 위치를 행렬로 묶어 처리할 수 있다. 순환 상태를 위치별 시간 단계로 전파하지 않아도 되므로 가속기의 병렬 연산 자원을 활용하기 쉽다.

하지만 자동회귀 생성에서는 다음 토큰이 앞서 생성한 토큰에 의존한다. 한 요청 안의 토큰 생성 단계는 순차적으로 이어진다. 여러 요청을 배치하거나 한 단계의 행렬 연산을 병렬화할 수는 있어도, 아직 생성하지 않은 다음 토큰들을 일반적으로 한 번에 확정할 수는 없다. 따라서 학습 시간의 병렬화 결과를 대화형 생성 지연에 그대로 옮겨서는 안 된다.

## 2. 이차 산술량과 실제 메모리 사용량은 다른 질문이다

길이 `N`인 밀집 [[자기 주의]]는 모든 허용 위치 쌍의 점수를 계산한다. 산술량은 대략 `O(N²d)`이며, 표준 구현이 점수와 확률 행렬을 저장하면 `O(N²)` 부가 메모리를 요구할 수 있다.

FlashAttention은 정확한 밀집 어텐션의 위치 쌍을 생략하지 않으므로 이차 산술량을 선형으로 바꾸지 않는다. 대신 타일링·온라인 softmax·재계산을 사용해 큰 `N × N` 행렬을 HBM에 쓰고 읽는 일을 피한다. 그 결과 부가 메모리는 시퀀스 길이에 선형으로 증가할 수 있지만 산술 복잡도는 여전히 이차다.

| 질문 | 답하는 지표 | FlashAttention이 바꾸는 것 |
|---|---|---|
| 몇 번의 산술 연산이 필요한가 | FLOP, 점근 산술 복잡도 | 정확한 밀집 어텐션의 이차 산술은 유지 |
| 얼마의 중간 저장 공간이 필요한가 | 최대 메모리, 부가 메모리 복잡도 | 큰 점수·확률 행렬의 HBM 구체화를 피함 |
| 메모리 계층을 얼마나 오가는가 | HBM 바이트·읽기·쓰기, 산술 집약도 | 타일링과 융합으로 HBM 트래픽 감소 |
| 실제로 얼마나 걸리는가 | 커널·종단 벽시계 시간 | 하드웨어·길이·정밀도·구현에 따라 달라짐 |

## 3. 더 많은 연산이 더 빠를 수 있는 이유

[[Roofline An Insightful Visual Performance Model]]은 달성 성능이 최고 연산률과 `메모리 대역폭 × 연산 집약도` 가운데 작은 쪽에 제한될 수 있음을 설명한다. GPU 연산기가 중간값을 기다리는 동안 쉬고 있다면 FLOP를 조금 줄이는 것보다 HBM 이동을 줄이는 편이 더 중요하다.

FlashAttention의 재계산은 산술을 추가하지만 중간 행렬의 저장·복원을 제거한다. 이는 [[메모리 장벽]] 환경에서 계산과 이동의 교환이 달라진 사례다. “연산 수 증가”와 “실행 시간 증가”가 항상 같은 방향이라고 가정할 수 없는 이유다.

## 4. 정확한 어텐션과 같은 비트는 동일하지 않다

논문의 exact attention은 근사·희소 어텐션과 달리 원래의 밀집 어텐션 정의를 계산한다는 뜻이다. 타일링과 융합은 부동소수점 연산 순서를 바꿀 수 있으므로 비트 단위 결과까지 같다는 별도 검증 없이 동일성을 주장하면 안 된다.

또한 긴 문맥을 실행할 수 있다는 사실은 모든 과업의 품질이 좋아진다는 보장이 아니다. 처리 가능한 길이, 실제 입력 길이 분포, 모델 품질, 지연과 메모리 비용을 함께 보고해야 한다.

## 최소 비교 형식

1. 모델 구조, head 수·차원, 입력·출력 길이 분포와 배치 크기를 기록한다.
2. 학습, 입력 처리와 자동회귀 생성 가운데 어느 단계를 측정했는지 밝힌다.
3. 정밀도, GPU·메모리 용량, 커널·프레임워크 버전과 융합 범위를 기록한다.
4. FLOP뿐 아니라 HBM 트래픽, 최대 메모리, 벽시계 시간과 결과 검증을 함께 보고한다.
5. 논문의 특정 GPU·모델 속도 배수를 다른 세대·작업의 보편적 이점으로 일반화하지 않는다.

## 결론

Transformer의 컴퓨팅 능력은 모델의 산술 복잡도만으로 결정되지 않는다. 학습과 생성의 의존 구조, 메모리 계층, 중간값을 저장하거나 재계산하는 방식과 실제 가속기 이용률이 함께 결과를 만든다. 정확한 표현은 “FlashAttention이 어텐션의 이차 계산을 없앴다”가 아니라, **정확한 밀집 어텐션의 실행 순서를 메모리 계층에 맞춰 바꾸어 부가 메모리와 HBM 이동을 줄였다**는 것이다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[Transformer]] | 학습 위치의 병렬 계산과 자동회귀 생성의 순차 의존성을 한 실행 경계에서 구분한다. | [[Attention Is All You Need]] |
| synthesizes | [[입출력 인지 어텐션]] | 타일링·재계산이 산술량보다 데이터 이동을 줄여 실제 시간을 바꾸는 원리를 종합한다. | [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]] |
| responds_to | [[메모리 장벽]] | Transformer 성능 비교에 HBM 이동·부가 메모리와 벽시계 시간을 포함한다. | [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]] |

## 출처

- [[Attention Is All You Need]]
- [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]
- [[Hitting the Memory Wall]]
- [[Roofline An Insightful Visual Performance Model]]

## 관련 항목

- [[Transformer]] — 모델 구조와 학습·생성 단계의 차이를 설명한다.
- [[자기 주의]] — 시퀀스 길이에 따른 어텐션 산술 구조를 정리한다.
- [[입출력 인지 어텐션]] — 메모리 계층을 고려한 정확 어텐션 구현을 다룬다.
- [[메모리 장벽]] — 데이터 이동이 연산보다 실제 성능을 제한하는 일반 문제다.
- [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]] — 한 커널의 메모리 이동에서 여러 요청의 캐시 수용량과 연속 배칭으로 분석 경계를 넓힌다.
