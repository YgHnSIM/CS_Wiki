---
title: LLM 가중치 양자화
aliases: [LLM weight quantization, weight-only quantization, LLM PTQ, 저비트 LLM 가중치]
summary: "학습된 LLM 가중치를 보정 데이터와 스케일·제로포인트·그룹 규칙으로 낮은 비트 표현에 매핑해 모델 용량과 가중치 메모리 이동을 줄이되 품질과 커널 지원을 함께 관리하는 방법."
tags: [type/concept, domain/machine-learning, domain/computer-architecture, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2023
historical_note: "신경망 양자화는 더 오래된 기법이지만, GPTQ의 ICLR 2023 출판을 대규모 생성 Transformer의 3–4비트 가중치 PTQ를 대표하는 시점으로 둔다."
historical_layer: system
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers", "AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration"]
status: active
graph_id: concept-llm-weight-quantization
graph_visibility: public
---

## 개요

[[LLM 가중치 양자화]]는 학습된 대규모 언어 모델의 부동소수점 가중치를 더 적은 비트의 이산 값과 스케일 정보로 표현하는 방법이다. 목표는 모델 파일과 장치 메모리 점유, 추론 중 가중치를 메모리에서 읽는 바이트를 줄이는 것이다. 훈련을 다시 하지 않고 보정 데이터로 양자화 파라미터를 정하면 **사후 학습 양자화**(post-training quantization, PTQ)다.

**가중치 전용 양자화**는 가중치만 2–4비트 같은 낮은 비트로 저장하고 활성값과 누산은 FP16·BF16 등 더 높은 정밀도로 처리한다. 이는 활성값까지 정수화하는 weight–activation 양자화와 다르다. 또한 자동회귀 요청 상태인 [[KV 캐시]]의 정밀도를 줄이는 KV 캐시 양자화와도 대상·수명·품질 오차가 다르다.

## 설계 변수

- **비트 폭**: 낮을수록 압축은 커지지만 표현 가능한 값 수가 줄어 오차가 커지기 쉽다.
- **스케일·제로포인트**: 실제 값 범위를 정수 격자에 대응시키는 파라미터다. 대칭·비대칭 표현의 비용과 커널 지원이 다르다.
- **그룹 크기**: 한 스케일을 공유하는 가중치 수다. 작은 그룹은 지역 범위에 잘 맞아 품질에 유리할 수 있지만 스케일 메타데이터와 커널 복잡도가 늘어난다.
- **보정 데이터**: 입력 활성값과 오차 민감도를 추정하는 표본이다. 모델 사용 분포와 너무 다르면 선택한 스케일이 실제 과업을 대표하지 못할 수 있다.
- **중요도 보호**: GPTQ는 근사 2차 정보로 양자화 오차를 남은 가중치에 보상한다. AWQ는 활성값을 관찰해 중요한 채널의 스케일을 조정한다.

## 저장 형식과 실행 형식

낮은 비트로 저장했다는 사실만으로 연산기가 그 형식을 직접 곱하는 것은 아니다. 여러 가중치를 워드에 패킹하고, 커널이 읽을 때 언패킹·역양자화해 활성값과 곱할 수 있다. 전용 융합 커널은 이 변환을 레지스터나 공유 메모리에서 수행해 HBM 바이트 감소를 살리려 한다.

커널이 없으면 가중치를 높은 정밀도로 풀어 별도 버퍼에 저장하거나 범용 연산 경로를 사용해 압축 이득을 잃을 수 있다. 따라서 모델 파일 크기, 런타임 메모리, 실제 HBM 트래픽과 종단 지연을 각각 측정해야 한다.

## 품질 계약

양자화 품질은 perplexity 하나로 끝나지 않는다. 같은 평균 언어 모델링 손실이어도 지시 따르기, 긴 문맥, 코드·수학, 다중 모달과 희귀 토큰에서 오류가 다르게 나타날 수 있다. 최소한 다음을 고정한다.

1. 원 모델·토크나이저·가중치 판본
2. 양자화 알고리즘, 비트 폭, 그룹 크기와 스케일 규칙
3. 보정 데이터와 표본 수
4. 평가 데이터·과업 지표와 생성 설정
5. 추론 커널·런타임·하드웨어와 배치·문맥 길이

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| narrower | [[혼합 정밀도]] | LLM의 가중치 저장·전송에 낮은 비트를 배치하고 활성값·누산에는 더 높은 정밀도를 유지하는 특화 설계다. | [[GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers]] |
| responds_to | [[메모리 장벽]] | 모델 가중치의 용량과 HBM 읽기 바이트를 줄여 생성 단계의 가중치 대역폭 제약에 대응한다. | [[GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers]] |
| implements | [[Transformer]] | Transformer 선형층의 가중치 표현을 낮은 비트와 그룹별 스케일로 바꾸되 모델 구조는 유지한다. | [[AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration]] |
| constrains | [[컴퓨팅 능력이란 무엇인가]] | 압축률·커널 속도와 모델 과업 품질을 함께 만족한 실행만 유효한 능력 향상으로 셀 수 있다. | [[AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration]] |

## 출처

- [[GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers]]
- [[AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration]]

## 관련 항목

- [[혼합 정밀도]] — 가중치·활성값·누산에 서로 다른 수치 형식을 배치하는 상위 설계다.
- [[메모리 장벽]] — 가중치 바이트 감소가 실제 성능으로 이어질 수 있는 병목 조건을 설명한다.
- [[KV 캐시]] — 가중치와 달리 요청 수명 동안 커지는 상태이며 별도 양자화 대상이다.
- [[낮은 정밀도는 AI의 컴퓨팅 능력을 어떻게 바꾸는가]] — 낮은 정밀도의 자원 이득과 품질 계약을 넓은 AI 관점에서 분석한다.
- [[낮은 비트는 왜 LLM 추론 속도를 보장하지 않는가]] — 패킹·역양자화·커널·하드웨어 조건을 종합한다.
