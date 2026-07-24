---
title: "TokenPowerBench: Benchmarking the Power Consumption of LLM Inference"
aliases: ["TokenPowerBench: Benchmarking the Power Consumption of LLM Inference", TokenPowerBench, LLM inference power benchmark, 토큰파워벤치]
summary: "LLM 추론의 GPU·노드·전체 시스템 전력을 같은 실행 구간에서 수집하고 프리필·디코드에 맞춰 에너지와 토큰당 줄을 분석하는 2026년 AAAI 연구."
tags: [type/reference, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2026
historical_layer: measurement
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["TokenPowerBench: Benchmarking the Power Consumption of LLM Inference"]
source_id: ref-083
source_kind: external
primary_sources: ["TokenPowerBench: Benchmarking the Power Consumption of LLM Inference, AAAI-26"]
supporting_sources: ["AAAI proceedings metadata record", "DOI metadata"]
source_urls: ["https://ojs.aaai.org/index.php/AAAI/article/view/40535", "https://ojs.aaai.org/index.php/AAAI/article/download/40535/44496", "https://doi.org/10.1609/aaai.v40i38.40535"]
retrieved: 2026-07-25
version: "AAAI-26, vol. 40 no. 38, pp. 32582-32590"
snapshot_status: external-only
status: active
graph_id: reference-tokenpowerbench
graph_visibility: public
---

## 개요

[[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]]는 LLM 추론의 처리량과 지연뿐 아니라 전력과 에너지를 실행 단계에 맞춰 수집하는 벤치마크 방법을 제시한다. 논문은 GPU 텔레메트리, CPU·DRAM 계측, 노드와 전원 분배 장치 계측을 조합해 GPU·노드·전체 시스템처럼 서로 다른 경계의 값을 구분한다.

핵심은 순간 전력과 누적 에너지를 혼동하지 않는 것이다. 전력 샘플을 시간에 따라 적분해야 실행 에너지를 얻으며, 같은 평균 전력이라도 실행 시간이 다르면 총에너지가 달라진다. 논문은 이 값을 처리한 토큰으로 정규화해 `J/token`을 보고하지만, 입력 토큰과 출력 토큰의 작업 특성이 다르므로 어떤 토큰을 분모로 삼았는지 함께 기록해야 한다.

또한 계측 구간을 [[프리필과 디코드]] 및 유휴 상태와 맞춘다. 프리필은 입력 길이와 큰 병렬 연산의 영향을, 디코드는 출력 길이와 반복적인 가중치·KV 상태 접근의 영향을 받는다. 두 단계를 한 평균으로 합치면 모델·배치·문맥 길이·병렬화·양자화가 어느 단계의 에너지를 바꿨는지 알기 어렵다.

이 연구는 다양한 구성에서 전력 불균형, 토큰당 에너지와 에너지–지연 결합 지표를 분석할 수 있는 계측 틀을 제공한다. 특정 모델이나 장치의 수치를 모든 LLM 서비스에 일반화하기보다, 같은 모델 품질·요청 분포·지연 조건과 시스템 경계에서 다시 측정하는 기준으로 사용하는 편이 적절하다.

## 주요 인사이트

- GPU 전력만으로는 CPU, DRAM, 네트워크, 전원 변환과 유휴 기저 전력을 포함한 서비스 에너지를 설명할 수 없다.
- 평균 전력(W)은 에너지(J)가 아니며, 실행 구간과 시간을 함께 기록해야 한다.
- 프리필과 디코드의 에너지 기여를 분리하면 입력·출력 길이와 최적화 효과를 더 정확히 해석할 수 있다.
- `J/token`은 토큰 종류, 모델 품질, 배치와 시스템 경계가 같을 때만 비교 가능한 분모다.
- 전력·지연·처리량은 어느 하나로 환원되지 않으므로 같은 실행의 측정 벡터로 보존해야 한다.

## 인용할 만한 구절

> “GPU-, node-, and system-level power”

전력 계측이 한 장치의 센서값에서 끝나지 않고 비교 목적에 맞는 시스템 경계를 요구한다는 점을 압축한다.

## 위키 반영

이 자료는 [[LLM 추론 에너지 지표]]에서 전력·에너지 단위, GPU·노드·전체 시스템 경계와 프리필·디코드 귀속을 정리하는 직접 근거다. [[같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가]]에서는 품질과 지연 목표를 만족한 요청을 분모로 두고 유휴 전력과 실패 요청까지 포함하는 자원 회계를 설계하는 출발점으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[LLM 추론 에너지 지표]] | 전력 샘플을 실행 단계와 맞추고 GPU·노드·시스템 경계의 에너지와 토큰당 에너지를 계산한다. | [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]] |
| measures | [[프리필과 디코드]] | 유휴·프리필·디코드 구간에 전력 샘플을 맞춰 단계별 에너지 기여를 구분한다. | [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]] |
| exemplifies | [[컴퓨팅 능력이란 무엇인가]] | LLM 추론 능력을 지연·처리량뿐 아니라 지정 경계의 전력과 에너지로 측정하는 사례다. | [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]] |

## 출처

- AAAI, [article and proceedings record](https://ojs.aaai.org/index.php/AAAI/article/view/40535)
- AAAI, [open-access paper PDF](https://ojs.aaai.org/index.php/AAAI/article/download/40535/44496)
- DOI, [10.1609/aaai.v40i38.40535](https://doi.org/10.1609/aaai.v40i38.40535)

## 관련 항목

- [[LLM 추론 에너지 지표]] — 논문의 계측 경계와 단계별 값을 비교 가능한 지표 체계로 정리한다.
- [[프리필과 디코드]] — 전력 샘플을 귀속할 두 실행 단계의 작업 특성을 설명한다.
- [[LLM 추론 서비스 지표]] — 에너지와 함께 고정해야 할 품질·지연·처리량 계약을 제공한다.
- [[같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가]] — 계측값을 유효 요청당 자원 비용으로 해석한다.
