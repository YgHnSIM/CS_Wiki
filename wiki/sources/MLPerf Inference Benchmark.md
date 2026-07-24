---
title: MLPerf Inference Benchmark
aliases: [MLPerf Inference, MLPerf 추론 벤치마크, MLPerf Inference rules, Reddi et al. 2020]
summary: "모델·데이터셋·품질 문턱·시스템 유형과 요청 시나리오를 고정해 기계학습 추론 성능을 재현 가능하게 비교하고, 현대 LLM에는 TTFT·TPOT 지연 조건을 적용하는 MLCommons 벤치마크."
tags: [type/reference, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2020
historical_note: "원 벤치마크 논문은 2019년 arXiv에 제출되고 2020년 ISCA에 출판되었다. 현재 규칙과 작업 부하는 판본별로 바뀌므로 2026년 v6.0 문서·결과를 별도로 확인했다."
historical_layer: measurement
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["MLPerf Inference Benchmark"]
source_id: ref-078
source_kind: external
primary_sources: ["Vijay Janapa Reddi et al., MLPerf Inference Benchmark, ISCA 2020", "MLCommons MLPerf Inference Rules and official benchmark repository"]
supporting_sources: ["MLCommons MLPerf Inference v6.0 results announcement"]
source_urls: ["https://arxiv.org/abs/1911.02549", "https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc", "https://docs.mlcommons.org/inference/submission/", "https://mlcommons.org/2026/04/mlperf-inference-v6-0-results/"]
retrieved: 2026-07-24
version: "ISCA 2020 / arXiv v2; MLPerf Inference v6.0 rules and suite"
snapshot_status: external-only
status: active
graph_id: reference-mlperf-inference
graph_visibility: public
---

## 개요

[[MLPerf Inference Benchmark]]는 기계학습 추론 시스템을 공통 작업과 규칙으로 비교하기 위한 MLCommons 벤치마크다. 원 논문은 벤치마크가 아키텍처에 종속되지 않으면서 대표성·재현성과 비교 가능성을 갖춰야 한다는 설계 원칙을 제시했다. 현재 제품·연구 결과는 고정된 하나의 시험이 아니라 버전이 붙은 모델, 데이터셋, 품질 문턱, 시나리오와 제출 규칙의 묶음이다.

벤치마크 실행은 시스템 유형, 모델·데이터셋과 품질 요구, 시나리오를 먼저 고정한다. LoadGen은 질의 생성·스케줄링, 지연 기록, 정확성 검증과 최종 지표 계산을 맡는다. Closed division은 같은 참조 설정에 해당하는 구현을 비교하도록 제약하고, Open division은 모델 대체나 재학습 같은 변화를 허용하되 결과를 별도 범주로 둔다. 따라서 유효한 점수는 하드웨어 이름만이 아니라 제출 구분, 전체 시스템 구성과 해당 판본의 규칙에 속한다.

시나리오는 요청이 들어오는 방식과 보고 지표를 바꾼다. SingleStream은 이전 질의가 끝난 뒤 하나를 보내며 높은 백분위 지연을, MultiStream은 묶음 질의의 높은 백분위 지연을 본다. Offline은 표본을 한꺼번에 제공해 처리량을 측정한다. Server/Interactive는 포아송 과정으로 질의를 보내고 벤치마크별 지연 조건을 만족하는 최대 도착률을 측정한다. 같은 시스템도 오프라인 처리량과 서버 시나리오 성능이 같지 않으므로 시나리오 이름을 뺀 “MLPerf 성능”은 불완전하다.

현행 규칙은 여러 LLM 작업의 Server 또는 Interactive 조건에 첫 토큰 시간(TTFT)과 출력 토큰당 시간(TPOT) 한계를 둔다. 모델마다 데이터셋, 품질 기준과 지연 한계가 다르고, 생성 길이도 참조 결과의 일정 범위 안에 있어야 하는 작업이 있다. 이런 계약은 출력 토큰/초만 높이기 위해 결과를 짧게 만들거나 사용자 응답 지연을 악화시키는 최적화를 성능 향상으로 세지 않게 한다.

MLPerf는 운영 중인 모든 LLM 서비스를 그대로 복제하지 않는다. 고정된 모델·데이터셋·도착 과정과 품질 규칙은 시스템 사이의 반복 가능한 비교를 가능하게 하는 대신, 실제 서비스의 프롬프트·출력 길이, 사용자 지역, 요청 급증, 캐시 적중, 비용과 장애 조건을 모두 대표하지 않는다. 공개 결과는 해당 버전과 시나리오의 비교 증거이며 임의의 운영 부하에서의 성능 보증은 아니다.

## 주요 인사이트

- 추론 성능 점수는 모델·데이터셋·품질 문턱·시나리오·시스템 구성·벤치마크 판본을 포함한 계약 안에서만 비교할 수 있다.
- Offline 처리량, Server/Interactive 최대 도착률과 SingleStream/MultiStream 백분위 지연은 서로 다른 능력을 측정한다.
- 현대 LLM 규칙은 TTFT와 TPOT 조건 및 생성 품질·길이 기준을 처리량과 함께 적용한다.
- LoadGen의 공통 질의·기록·검증 절차는 제출 시스템 사이의 측정 차이를 줄인다.
- 표준 벤치마크의 대표성과 실제 제품 부하의 외적 타당성은 같은 문제가 아니다.

## 인용할 만한 구절

> “fair, useful, and reproducible”

원 논문의 목표는 하나의 최고 속도를 만드는 것이 아니라, 시스템이 달라도 의미 있는 조건에서 결과를 다시 비교할 수 있게 하는 데 있다.

## 위키 반영

이 자료는 [[LLM 추론 서비스 지표]]에서 처리량·지연·품질을 하나의 버전화된 측정 계약으로 묶는 근거다. [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]]에서는 같은 토큰률도 시나리오, 요청 길이, TTFT·TPOT와 품질 문턱이 다르면 같은 서비스 능력으로 비교할 수 없다는 점을 보강한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[LLM 추론 서비스 지표]] | LLM 작업의 품질·생성 길이와 TTFT·TPOT 조건 아래 시나리오별 처리량을 계산한다. | [[MLPerf Inference Benchmark]] |
| measures | [[꼬리 지연 시간]] | Server/Interactive와 스트림 시나리오에서 높은 백분위 지연 또는 지연 제한을 성능 계약에 포함한다. | [[MLPerf Inference Benchmark]] |
| measures | [[컴퓨팅 능력이란 무엇인가]] | 하드웨어와 소프트웨어를 포함한 시스템이 지정 작업·품질·시나리오에서 달성한 추론 능력을 비교한다. | [[MLPerf Inference Benchmark]] |
| constrains | [[목표 품질 도달 시간]] | 학습의 품질 도달 시간과 달리 추론에서는 이미 정한 모델 품질·출력 조건을 통과한 실행의 지연·처리량만 유효하게 센다. | [[MLPerf Inference Benchmark]] |

## 출처

- arXiv, [MLPerf Inference Benchmark paper record 1911.02549](https://arxiv.org/abs/1911.02549)
- MLCommons, [current MLPerf Inference rules](https://github.com/mlcommons/inference_policies/blob/master/inference_rules.adoc)
- MLCommons, [official submission guide](https://docs.mlcommons.org/inference/submission/)
- MLCommons, [MLPerf Inference v6.0 results announcement](https://mlcommons.org/2026/04/mlperf-inference-v6-0-results/)

## 관련 항목

- [[LLM 추론 서비스 지표]] — 벤치마크가 고정하는 작업·품질·시나리오와 TTFT·TPOT를 측정 벡터로 정리한다.
- [[꼬리 지연 시간]] — 높은 백분위와 지연 제한이 평균 속도와 다른 서비스 계약인 이유를 설명한다.
- [[MLPerf Training Benchmark]] — 추론의 고정 품질 아래 성능과 학습의 목표 품질 도달 시간을 비교할 수 있다.
- [[컴퓨팅 능력이란 무엇인가]] — 작업·결과 계약·시스템 경계·고정 조건을 함께 기록하는 상위 측정 틀이다.
- [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]] — 토큰률을 품질과 사용자 지연을 포함한 비교 가능한 문장으로 다시 쓴다.
