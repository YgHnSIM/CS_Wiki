---
title: LLM 서빙에서 처리량과 지연은 왜 함께 움직이는가
aliases: [LLM throughput latency queueing analysis, LLM 대기열과 SLO, LLM 서빙 부하 제어 분석]
summary: "LLM 서빙에서 배칭과 동시성을 높여 원시 처리량을 키울수록 활성 작업·큐·메모리 수용량과 요청별 기한이 함께 바뀌는 이유를 Little의 법칙, SLO 기반 스케줄링, 프리필·디코드와 에너지 여유의 관점에서 분석."
tags: [type/analysis, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
historical_layer: service
capability_layers: [realized-performance, scalability, resource-efficiency, reliable-results]
sources: ["A Proof for the Queuing Formula L = λW", "Serving DNNs like Clockwork Performance Predictability from the Bottom Up", "Orca - A Distributed Serving System for Transformer-Based Generative Models", "DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving", "The Tail at Scale", "The Case for Energy-Proportional Computing"]
status: active
graph_id: analysis-llm-throughput-latency-queueing
graph_visibility: public
---

## 문제 제기

LLM 서비스의 처리량을 높이는 방법은 흔히 더 많은 요청을 활성 배치에 넣는 것이다. 같은 GPU에서 더 큰 행렬 연산을 만들고 유휴 구간을 줄일 수 있기 때문이다. 하지만 활성 요청이 늘면 각 요청은 큐, [[KV 캐시]] 메모리와 반복 스케줄러를 더 오래 공유한다. 따라서 처리량과 지연은 서로 반대인 두 숫자가 아니라 **같은 대기열·자원 상태를 다른 방향에서 관찰한 값**이다.

핵심 질문은 “처리량을 올릴 것인가, 지연을 줄일 것인가”가 아니다. 어떤 요청 단위와 서비스 경계에서, 얼마의 부하와 자원을 두고, 어느 SLO를 만족하는 요청을 유효하게 셀 것인가다. 이 질문이 빠지면 높은 토큰률은 긴 큐, 짧은 답변, 낮은 품질, 기한을 넘긴 요청 또는 더 많은 대기 장비를 숨길 수 있다.

## 1. 유량 관계는 같은 단위에서만 읽힌다

[[리틀의 법칙]]은 평균 시스템 내 작업 수 `L`, 평균 처리율 `λ`, 평균 체류 시간 `W`를 `L = λW`로 연결한다. 요청을 단위로 잡으면 `L`은 활성·대기 요청 수, `λ`는 승인 또는 완료 요청률, `W`는 요청의 종단 체류 시간이 된다. 이 세 값은 모두 같은 입장·완료 경계에 속해야 한다.

LLM에서는 요청과 토큰을 섞기 쉽다. 입력 토큰은 [[프리필과 디코드]] 중 프리필에서 병렬 처리되고, 출력 토큰은 디코드 반복으로 순차 생성된다. 요청 처리율과 출력 토큰/초가 동시에 유용할 수 있지만, 하나의 `L = λW`에 무심코 넣을 수 있는 동일한 단위는 아니다. 요청·활성 시퀀스·토큰 각각에 별도의 측정 경계를 두고, 값을 섞을 때는 변환 규칙을 밝혀야 한다.

이 관계는 p99를 계산해 주지 않는다. 평균 활성 요청과 평균 체류 시간이 같아도 도착 급증, 긴 프롬프트, 캐시 교체와 공유 자원 경합 때문에 지연 분포는 크게 다를 수 있다. [[꼬리 지연 시간]]과 기한 초과율은 별도 측정값으로 남는다.

## 2. 배칭은 큐를 없애지 않고 위치를 바꾼다

[[연속 배칭]]은 완료된 요청의 자리를 새 요청이 이어받게 해 장치 유휴를 줄인다. 이 방식은 고정 배치가 만든 대기를 완화할 수 있지만, 활성 집합을 무한히 늘리지는 못한다. 요청별 [[KV 캐시]]가 GPU 메모리를 차지하고, 긴 프리필과 디코드 반복이 계산 슬롯을 공유하며, 새 요청은 승인 정책과 배치 경계에 따라 기다린다.

따라서 배치 크기를 키운 결과를 최소한 두 축으로 읽어야 한다.

| 축 | 확인할 값 |
|---|---|
| 원시 작업률 | 요청/초, 입력·출력 토큰/초, 장치 이용률, 활성 요청·토큰 수 |
| 사용자 계약 | TTFT·TPOT·종단 지연의 분포, 기한 초과·거부·취소, SLO를 통과한 goodput |

첫 축만 좋아지면 더 많은 작업을 시작했을 수 있다. 둘째 축까지 좋아져야 같은 결과 계약에서 더 많은 유효 작업을 처리한 것이다. [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]가 TTFT와 TPOT를 따로 두고 goodput을 정의한 이유가 여기에 있다.

## 3. 승인 제어는 실패를 숨기는 장치가 아니다

[[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]]의 Clockwork는 예측한 실행 시간으로 요청 기한을 만족할 수 없는 경우, 불필요한 추론을 예약하지 않는 방식을 보였다. 이는 이미 기한을 놓친 작업에 자원을 계속 쓰지 않는 한 방법이다. 그러나 거부·취소된 요청은 성공이 아니며, goodput·실패율·원시 처리량을 구분해 기록해야 한다.

LLM 서빙은 Clockwork가 다룬 단발 DNN 추론보다 상태와 반복이 많다. 그럼에도 [[대기열과 부하 제어]]의 원칙은 같다. 승인 정책은 서비스가 보장할 수 있는 요청을 명확히 하고, 확실히 불가능한 작업이 뒤 요청까지 밀어내는 일을 줄인다. 대신 기준이 너무 보수적이면 거부율이 늘고, 너무 공격적이면 큐와 꼬리가 커진다. 정책의 가치는 승인률 하나가 아니라 동일한 요청 혼합에서의 SLO 달성률과 공정성·자원 비용으로 평가해야 한다.

## 4. 여유 용량은 지연의 해법이면서 에너지 비용이다

큐를 짧게 유지하려면 평균 부하보다 더 많은 계산·메모리·네트워크 여유를 둘 수 있다. [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]]도 대기 시간을 줄이기 위한 과잉 자원 배정이 이용률·효율과 교환됨을 지적한다. [[에너지 비례 컴퓨팅]]의 관점에서는 그 여유 장비가 낮은 부하에서도 기저 전력을 소비할 수 있다.

반대로 높은 이용률만 노리면 배치와 큐가 길어지고, SLO 위반·재시도·취소가 늘어 유효 처리량과 요청당 에너지가 나빠질 수 있다. 그러므로 에너지 비교는 GPU 전력 한 값이 아니라 같은 품질·TTFT·TPOT 조건에서 전체 시스템 에너지, 활성·대기 자원, 거부와 실패 요청에 사용한 자원을 함께 분자로 둬야 한다.

## 비교 가능한 운영 문장

“처리량을 30% 높였다”는 주장을 다음처럼 바꾼다.

> 같은 모델·정밀도·입력/출력 길이 분포와 도착 과정에서, 지정한 TTFT·TPOT·품질 SLO를 만족한 요청 goodput이 얼마였고, 활성 요청·토큰, 거부·시간 초과, GPU·KV 메모리, 전체 시스템 에너지가 어떻게 변했는가?

이 문장은 처리율을 버리지 않는다. 오히려 처리율이 어느 작업 단위의 유량이며, 지연·유효성·자원 비용과 어떤 관계를 가지는지 다시 확인하게 한다.

## 결론

LLM 서빙의 처리량과 지연은 같은 시스템을 두 번 보는 값이다. 처리율을 높이면 평균 체류 시간이 반드시 늘어난다고 단정할 수는 없고, 더 나은 스케줄링·메모리 관리로 둘을 함께 개선할 수도 있다. 하지만 그 주장은 요청·토큰 단위, 큐·실행·네트워크 경계, SLO와 실패 처리, 자원·에너지 조건을 같은 측정 문장에 넣을 때만 검증할 수 있다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[리틀의 법칙]] | 평균 활성 작업·유효 처리율·체류 시간을 같은 단위와 서비스 경계에서 해석해 처리율과 지연의 공동 변화를 설명한다. | [[A Proof for the Queuing Formula L = λW]] |
| synthesizes | [[대기열과 부하 제어]] | 배치·승인·거부·큐 상한이 처리율과 기한 초과를 함께 바꾸는 운영 선택임을 종합한다. | [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]], [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| synthesizes | [[LLM 추론 서비스 지표]] | 요청·토큰 처리율을 TTFT·TPOT·goodput과 같은 측정 벡터 안에 배치한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| responds_to | [[꼬리 지연 시간]] | 평균 토큰률이 숨기는 높은 백분위와 기한 초과를 SLO 통과 요청의 유효 처리량에 다시 포함한다. | [[The Tail at Scale]] |
| constrains | [[에너지 비례 컴퓨팅]] | 짧은 큐를 위한 여유 용량이 낮은 부하의 기저 전력과 자원 비용을 남긴다는 조건을 서비스 처리량 비교에 포함한다. | [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]], [[The Case for Energy-Proportional Computing]] |

## 출처

- [[A Proof for the Queuing Formula L = λW]]
- [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]]
- [[Orca - A Distributed Serving System for Transformer-Based Generative Models]]
- [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]
- [[The Tail at Scale]]
- [[The Case for Energy-Proportional Computing]]

## 관련 항목

- [[대기열과 부하 제어]] — 승인·대기·배치·거부를 SLO와 자원 상태로 결정하는 운영 개념이다.
- [[리틀의 법칙]] — 평균 유량과 체류 시간을 같은 경계에서 연결하는 출발점이다.
- [[LLM 추론 서비스 지표]] — TTFT·TPOT·goodput·자원 비용을 함께 기록하는 측정 체계다.
- [[연속 배칭]] — 활성 집합을 반복마다 갱신해 처리율과 대기 분포를 바꾸는 방식이다.
- [[같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가]] — 유효 요청당 에너지와 가속기 시간을 포함한 자원 회계를 다룬다.
