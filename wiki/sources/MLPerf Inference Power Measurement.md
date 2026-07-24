---
title: MLPerf Inference Power Measurement
aliases: [MLPerf Inference Power, MLPerf 추론 전력 측정, MLPerf power methodology]
summary: "MLPerf Inference의 성능 실행과 같은 구간에서 인증 전력 분석기와 SPEC PTDaemon으로 전체 시스템의 벽면 AC 전력·에너지를 측정하는 공식 방법론."
tags: [type/reference, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2021
historical_note: "MLPerf Inference v1.0은 2021년에 첫 선택적 전력 측정을 공개했다. 이 페이지는 2026-07-25에 확인한 v6.0 세대의 공식 문서와 master 규칙을 그 최초 공개 시점과 구분한다."
historical_layer: measurement
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["MLPerf Inference Power Measurement"]
source_id: ref-084
source_kind: external
primary_sources: ["MLCommons MLPerf Inference power measurement documentation", "MLCommons MLPerf Inference rules", "MLPerf Inference v1.0 first power measurements announcement"]
supporting_sources: ["MLCommons Inference Datacenter results and power metric description"]
source_urls: ["https://docs.mlcommons.org/inference/power/", "https://mlcommons.org/benchmarks/inference-datacenter/", "https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc", "https://mlcommons.org/2021/04/mlperf-inference-v1-0-results-with-first-power-measurements/"]
retrieved: 2026-07-25
version: "MLPerf Inference v1.0 first power methodology; current v6.0-era documentation and master rules as retrieved"
snapshot_status: external-only
status: active
graph_id: reference-mlperf-inference-power
graph_visibility: public
---

## 개요

[[MLPerf Inference Power Measurement]]는 [[MLPerf Inference Benchmark]]의 성능 실행과 같은 구간에서 시스템이 실제로 끌어온 전력과 에너지를 재현 가능하게 측정하는 공식 방법론이다. MLCommons는 2021년 Inference v1.0 결과에서 처음으로 선택적 전력 측정을 공개했고, 이후 전력 계측 문서와 제출 규칙을 벤치마크 판본에 맞춰 유지한다.

공식 방법은 전원 공급 경로에 인증된 전력 분석기를 연결하고 SPEC PTDaemon을 통해 샘플을 수집한다. 공개 결과의 전력 열은 Server·Offline에서는 시스템 평균 전력, 스트림 시나리오에서는 스트림당 에너지로 해석된다. 값은 벤치마크 실행 동안 벽면에서 측정한 전체 시스템 AC 전력 또는 에너지에 기반한다.

이 경계는 GPU의 소프트웨어 텔레메트리나 TDP, 전원 장치 정격과 다르다. MLCommons가 검증하는 전력 결과는 제출 시스템 전체의 실측값이며, 구성요소 명목 사양을 대신 검증하지 않는다. 네트워크형 SUT에서는 LoadGen 밖에서 추론 요청을 처리하는 서버·스위치·로드밸런서 등의 포함 범위를 규칙에 따라 문서화해야 한다.

전력 결과도 성능 계약과 분리할 수 없다. 모델·데이터셋·품질, 시나리오, TTFT·TPOT 같은 지연 조건과 시스템 구성이 같은 실행에서 측정되어야 한다. 따라서 최저 W가 아니라 요구 조건을 만족한 작업량당 J 또는 성능/W가 비교 대상이며, 다른 판본·시나리오·작업을 한 표의 동일 작업처럼 취급해서는 안 된다.

## 주요 인사이트

- 전력 분석기와 공통 수집 데몬은 소프트웨어 센서와 다른 벽면 AC 시스템 경계를 제공한다.
- 성능 구간과 전력 구간을 맞춰야 처리량당 전력이나 요청당 에너지를 계산할 수 있다.
- 전체 시스템 전력은 GPU TDP나 PSU 정격을 측정값으로 대체하지 않는다.
- Server·Offline의 평균 전력과 스트림 시나리오의 에너지 지표는 분모와 실행 방식이 다르다.
- 전력 결과는 같은 모델 품질·시나리오·지연 규칙을 통과한 성능 결과와 함께 해석해야 한다.

## 인용할 만한 구절

> “System Power”

공식 결과의 전력값이 개별 가속기 사양이 아니라 제출 시스템 전체의 계측 경계를 가리킨다는 점이 중요하다.

## 위키 반영

이 자료는 [[LLM 추론 에너지 지표]]에서 전체 시스템·벽면 AC 경계와 성능 실행 구간의 결합을 뒷받침한다. [[같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가]]에서는 품질과 지연 조건을 통과한 요청당 에너지와 가속기 시간을 같은 분모로 비교하는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[LLM 추론 에너지 지표]] | 인증 전력 분석기와 공통 수집 절차로 벤치마크 실행 구간의 전체 시스템 AC 전력·에너지를 측정한다. | [[MLPerf Inference Power Measurement]] |
| measures | [[LLM 추론 서비스 지표]] | 모델 품질·요청 시나리오와 지연 조건을 통과한 추론 성능에 시스템 전력·에너지 측정을 결합한다. | [[MLPerf Inference Power Measurement]] |
| exemplifies | [[컴퓨팅 능력이란 무엇인가]] | 지정 작업과 결과 계약, 시스템 경계를 고정한 뒤 성능과 자원 효율을 함께 비교하는 사례다. | [[MLPerf Inference Power Measurement]] |

## 출처

- MLCommons, [official inference power measurement documentation](https://docs.mlcommons.org/inference/power/)
- MLCommons, [Inference Datacenter benchmark and power metric description](https://mlcommons.org/benchmarks/inference-datacenter/)
- MLCommons, [current MLPerf Inference rules](https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc)
- MLCommons, [Inference v1.0 results with first power measurements](https://mlcommons.org/2021/04/mlperf-inference-v1-0-results-with-first-power-measurements/)

## 관련 항목

- [[LLM 추론 에너지 지표]] — 공식 계측 절차를 단위·분모·시스템 경계의 일반 측정 체계에 배치한다.
- [[MLPerf Inference Benchmark]] — 전력 결과와 함께 고정되는 모델·품질·시나리오 계약을 설명한다.
- [[LLM 추론 서비스 지표]] — 전력 측정과 결합할 TTFT·TPOT·goodput 조건을 정리한다.
- [[같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가]] — 전체 시스템 에너지와 가속기 시간을 유효 요청당 비용으로 비교한다.
