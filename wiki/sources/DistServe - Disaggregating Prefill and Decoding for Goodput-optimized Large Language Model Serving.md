---
title: "DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving"
aliases: ["DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving", DistServe, DistServe paper, Zhong et al. 2024]
summary: "LLM 요청의 프리필과 디코드 단계를 서로 다른 GPU에 배치해 단계 간 간섭과 자원 결합을 줄이고, TTFT·TPOT 서비스 수준 목표를 만족하는 goodput을 최적화한 2024년 OSDI 연구."
tags: [type/reference, domain/machine-learning, domain/systems, domain/distributed-systems, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2024
historical_layer: service
capability_layers: [realized-performance, scalability, resource-efficiency, reliable-results]
sources: ["DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving"]
source_id: ref-077
source_kind: external
primary_sources: ["Yinmin Zhong et al., DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving, OSDI 2024"]
supporting_sources: ["USENIX OSDI 2024 presentation and proceedings record"]
source_urls: ["https://www.usenix.org/conference/osdi24/presentation/zhong-yinmin", "https://www.usenix.org/system/files/osdi24-zhong-yinmin.pdf"]
retrieved: 2026-07-24
version: "OSDI '24 proceedings, pp. 193–210"
snapshot_status: external-only
status: active
graph_id: reference-distserve
graph_visibility: public
---

## 개요

[[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]는 Zhong 등 연구진이 OSDI 2024에서 발표한 LLM 서빙 시스템 연구다. 자동회귀 요청을 한 종류의 반복 작업으로 보지 않고, 입력 토큰을 병렬로 처리해 첫 토큰과 [[KV 캐시]]를 만드는 **프리필(prefill)**과 이후 토큰을 순차 생성하는 **디코드(decode)**로 나눈다.

두 단계는 같은 Transformer 연산을 사용하지만 자원 특성이 다르다. 충분히 긴 입력의 프리필은 큰 행렬 연산으로 계산 자원을 활용하기 쉽고, 요청별로 한 토큰씩 진행하는 디코드는 단독 실행 시 메모리 대역폭과 배치 구성의 영향을 크게 받는다. 두 단계를 같은 GPU와 [[연속 배칭]] 안에 함께 두면 긴 프리필이 디코드 토큰 간 지연을 늘리거나, 디코드를 우선한 스케줄링이 첫 토큰 대기를 늘릴 수 있다. 또한 두 단계에 같은 병렬화와 복제 수를 적용해야 해 각 단계의 자원 구성을 독립적으로 고르기 어렵다.

DistServe는 [[프리필과 디코드]]를 서로 다른 GPU 군에 배치한다. 프리필 군이 입력을 처리한 뒤 생성한 KV 캐시를 디코드 군으로 보내고, 각 군의 병렬화와 복제 정도를 해당 단계의 지연 목표에 맞춘다. 배치 알고리즘은 단계별 GPU 수뿐 아니라 두 군 사이의 네트워크 대역폭과 배치를 함께 고려한다. 이 설계는 모델 가중치를 두 군에 중복 적재하고 KV 상태를 전송해야 하므로, 분리는 무료가 아니라 간섭 감소와 추가 메모리·통신 비용의 교환이다.

논문은 첫 토큰 시간(time to first token, TTFT)과 첫 토큰 이후 평균 토큰 시간(time per output token, TPOT)에 각각 서비스 수준 목표(SLO)를 두고, 목표 비율의 요청이 두 조건을 모두 만족하는 최대 도착률을 goodput으로 측정한다. 특히 **GPU당 goodput**은 이 최대 요청률을 배치한 GPU 수로 나눠 비용 효율을 비교한다. 이는 완료한 모든 토큰을 합한 처리량보다 사용자가 요구한 응답성 안에서 완료한 요청을 세는 지표다.

평가에서 DistServe는 논문이 사용한 모델, 요청 추적, GPU와 SLO 조건에서 기존 공배치 시스템보다 최대 7.4배 많은 요청을 처리하거나 같은 비용에서 최대 12.6배 더 엄격한 SLO를 만족했다고 보고했다. 이 최대값은 모든 모델·클러스터·네트워크의 보편적 배수가 아니다. KV 전송이 전체 지연에서 매우 작았다는 결과도 평가한 배치와 네트워크의 결과이며, 느린 연결·짧은 요청·작은 배치에서는 분리 비용의 비중이 커질 수 있다.

## 주요 인사이트

- LLM 추론 요청은 계산 특성과 사용자 지연 의미가 다른 프리필과 디코드 단계로 나눠 측정해야 한다.
- 같은 GPU에 두 단계를 공배치하면 TTFT와 TPOT가 서로 간섭하고 자원·병렬화 선택도 결합된다.
- 단계 분리는 각 단계의 자원을 독립적으로 조정하지만 모델 가중치 중복, KV 캐시 전송과 배치 제약을 추가한다.
- goodput은 단순 요청/초가 아니라 지정한 TTFT·TPOT SLO와 달성 비율을 지키는 최대 요청률이다.
- 최대 개선 배수와 전송 오버헤드는 모델, 길이 분포, 도착 과정, GPU·네트워크와 SLO에 한정해 읽어야 한다.

## 인용할 만한 구절

> “prefill-decoding interference”

핵심은 두 단계가 각각 느리다는 것이 아니라, 서로 다른 자원 특성을 가진 단계가 공배치될 때 한 단계의 작업이 다른 단계의 서비스 지연을 흔든다는 점이다.

## 위키 반영

이 자료는 [[프리필과 디코드]]의 실행 경계와 [[LLM 추론 서비스 지표]]의 TTFT·TPOT·SLO 달성률·goodput 정의를 직접 뒷받침한다. [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]]에서는 총 토큰 처리량이 첫 응답 대기, 토큰 간 속도와 목표 달성 요청 비율을 숨기는 이유를 DistServe의 측정 경계로 분석한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[프리필과 디코드]] | 입력 병렬 처리와 순차 토큰 생성을 서로 다른 GPU 군에 배치해 두 실행 단계의 차이를 시스템 구조로 드러낸다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| measures | [[LLM 추론 서비스 지표]] | TTFT·TPOT SLO와 목표 달성 비율을 동시에 만족하는 최대 요청률을 goodput으로 측정한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| responds_to | [[연속 배칭]] | 프리필과 디코드를 한 GPU 배치에 함께 넣을 때 생기는 단계 간 간섭과 결합된 자원 구성을 분리한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| constrains | [[KV 캐시]] | 단계 분리 뒤에도 프리필에서 만든 요청별 KV 상태를 디코드 군으로 옮겨 보존해야 한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |

## 출처

- USENIX, [OSDI 2024 presentation and proceedings record](https://www.usenix.org/conference/osdi24/presentation/zhong-yinmin)
- USENIX, [open-access proceedings paper](https://www.usenix.org/system/files/osdi24-zhong-yinmin.pdf)

## 관련 항목

- [[프리필과 디코드]] — 한 요청 안의 두 실행 단계가 계산·메모리와 사용자 지연에서 어떻게 다른지 설명한다.
- [[LLM 추론 서비스 지표]] — TTFT·TPOT·SLO 달성률·goodput을 비교 가능한 측정 벡터로 정리한다.
- [[연속 배칭]] — 단계 분리 전 공배치 시스템이 요청 사이 계산 슬롯을 재사용하는 방식을 보여준다.
- [[KV 캐시]] — 프리필에서 생성되어 디코드 군으로 전달되는 요청별 상태와 그 비용을 설명한다.
- [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]] — 원시 토큰 처리량과 사용자가 체감하는 유효 서비스 능력을 비교한다.
