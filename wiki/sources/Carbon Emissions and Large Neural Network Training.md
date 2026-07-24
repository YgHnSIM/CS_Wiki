---
title: Carbon Emissions and Large Neural Network Training
aliases: [Patterson et al. 2021, 대형 신경망 학습 탄소 배출, ML training carbon emissions]
summary: "대형 신경망 학습의 에너지와 CO₂e를 모델 구조, 프로세서, 데이터센터 효율, 지역 전력망 조건과 함께 추정·비교한 2021년 연구."
tags: [type/reference, domain/machine-learning, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2021
historical_layer: measurement
capability_layers: [resource-efficiency, realized-performance, reliable-results]
sources: [Carbon Emissions and Large Neural Network Training]
source_id: ref-110
source_kind: external
primary_sources: ["David Patterson et al., Carbon Emissions and Large Neural Network Training, arXiv:2104.10350, 2021"]
supporting_sources: ["Google Research author publication record"]
source_urls: ["https://arxiv.org/abs/2104.10350", "https://research.google/people/jeff/"]
retrieved: 2026-07-25
version: "arXiv v1, 2021-04-21"
snapshot_status: external-only
status: active
graph_id: reference-ml-training-carbon-emissions
graph_visibility: public
---

## 개요

[[Carbon Emissions and Large Neural Network Training]]은 David Patterson 등이 대형 신경망 학습의 에너지 사용과 CO₂e를 추정하고, 모델 구조·프로세서·데이터센터·지역 전력 조건이 결과를 바꾼다고 분석한 2021년 연구다. 저자들은 T5, Meena, GShard, Switch Transformer, GPT-3 등의 사례를 비교하면서 에너지와 탄소를 보고하려면 단순한 파라미터 수나 연산량만으로 충분하지 않다고 설명한다.

논문은 희소 활성화 모델, 데이터센터 인프라, 가속기, 전력망의 탄소 집약도가 결과를 크게 바꿀 수 있음을 제시한다. 보고된 배수는 논문이 다룬 모델·장비·위치·측정 가정의 결과이므로, 모든 학습이나 추론 워크로드의 보편적 절감률로 사용하지 않는다.

## 측정 벡터

에너지와 CO₂e는 서로 다른 지표다. 같은 kWh라도 전력망·시간·조달 조건에 따라 CO₂e가 달라지고, 같은 모델 정확도라도 계산 구조와 가속기·시설의 효율이 다를 수 있다. 수명 주기 논의에서는 여기에 장비 제조와 서비스 수명·활용률까지 더해야 한다.

| 기록할 값 | 역할 | 빠지면 생기는 오해 |
|---|---|---|
| 작업·품질 | 어떤 모델이 어떤 목표를 달성했는가 | 더 적은 에너지가 더 낮은 품질을 숨김 |
| 에너지 | 장비·시설 경계에서 소비한 전력량 | 전력 효율과 탄소를 혼동 |
| 탄소 집약도 | 지역·시간·조달 조건의 CO₂e/kWh | 같은 kWh를 같은 배출로 가정 |
| 시스템 구성 | 모델, 프로세서, 데이터센터 | 한 구성의 수치를 모든 학습에 일반화 |

## 위키 반영

이 자료는 [[운영 탄소와 내재 탄소]]에서 운영 단계의 에너지와 CO₂e를 구분하는 직접 근거다. [[LLM 추론 에너지 지표]]와 함께 읽으면 학습·추론 모두에서 작업·품질·장비·시설·전력망의 경계를 선언해야 비교할 수 있음을 보인다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[운영 탄소와 내재 탄소]] | 학습 작업의 에너지 사용과 전력망·시설 조건에 따른 운영 CO₂e를 비교하는 측정 예를 제공한다. | [[Carbon Emissions and Large Neural Network Training]] |
| constrains | [[LLM 추론 에너지 지표]] | 특정 장비의 에너지 수치를 탄소 영향으로 읽으려면 위치·시간·시설과 작업 품질 조건을 추가해야 함을 보인다. | [[Carbon Emissions and Large Neural Network Training]] |

## 출처

- arXiv, [paper record](https://arxiv.org/abs/2104.10350)
- Google Research, [author publication record](https://research.google/people/jeff/)

## 관련 항목

- [[운영 탄소와 내재 탄소]] — 운영 에너지와 탄소 배출의 관계를 수명 주기 맥락에 둔다.
- [[LLM 추론 에너지 지표]] — 추론의 장비·노드·전체 시스템 경계를 비교한다.
- [[수명 주기 평가 경계]] — 운영 단계 측정을 전체 환경 주장에 연결하기 전의 조건을 확인한다.
