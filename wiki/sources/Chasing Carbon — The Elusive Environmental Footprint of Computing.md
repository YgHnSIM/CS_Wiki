---
title: "Chasing Carbon: The Elusive Environmental Footprint of Computing"
aliases: ["Chasing Carbon: The Elusive Environmental Footprint of Computing", Gupta et al. 2021, Chasing Carbon, 컴퓨팅 탄소 발자국]
summary: "컴퓨팅의 운영 에너지와 하드웨어 제조·인프라에서 나오는 탄소를 구분하고, 성능·전력 효율 개선만으로 전체 환경 영향을 판단할 수 없음을 분석한 2021년 HPCA 논문."
tags: [type/reference, domain/computer-architecture, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2021
historical_note: "HPCA 2021 발표를 기준 시점으로 두며, 2022년 IEEE Micro 확장판은 보조 판본으로 기록한다."
historical_layer: measurement
capability_layers: [resource-efficiency, scalability, reliable-results]
sources: ["Chasing Carbon — The Elusive Environmental Footprint of Computing"]
source_id: ref-109
source_kind: external
primary_sources: ["Udit Gupta et al., Chasing Carbon: The Elusive Environmental Footprint of Computing, IEEE HPCA 2021, pp. 854–867"]
supporting_sources: ["Udit Gupta et al., IEEE Micro 42(4), 2022 expanded version"]
source_urls: ["https://arxiv.org/abs/2011.02839", "https://hsienhsinlee.github.io/MARS/pub/hpca2021-carbon.pdf", "https://doi.org/10.1109/MM.2022.3163226"]
retrieved: 2026-07-25
version: "HPCA 2021; IEEE Micro 2022 expanded version"
snapshot_status: external-only
status: active
graph_id: reference-chasing-carbon
graph_visibility: public
---

## 개요

[[Chasing Carbon: The Elusive Environmental Footprint of Computing]]은 Udit Gupta 등이 컴퓨팅 시스템의 탄소 영향을 운영 중 에너지 소비와 하드웨어 제조·인프라의 영향으로 나누어 분석한 2021년 HPCA 논문이다. 논문은 알고리즘·소프트웨어·하드웨어 효율이 운영 배출을 낮출 수 있어도, 장비 제조와 시설 인프라를 포함한 전체 환경 영향은 별도 경계에서 측정해야 한다고 주장한다.

이 논문은 공개된 산업 수명 주기 자료를 사용해 개인 기기와 데이터센터 장비의 탄소 구성을 분석한다. 따라서 특정 플랫폼의 비율이나 미래 예측을 모든 컴퓨팅 장비의 보편값으로 읽기보다, 운영 효율·전력 조달·장비 교체·제조·시설이 서로 다른 시간 규모에서 영향을 만든다는 구조적 구분을 얻는 데 적합하다.

## 운영·제조·시설의 분리

낮은 전력이나 높은 작업/J는 실행 중 에너지의 측정에 중요하지만, 장비를 새로 제조하고 데이터센터 인프라를 확장하는 비용까지 자동으로 낮추지는 않는다. 반대로 제조 비중이 높다는 관찰도 어떤 서버의 사용 기간, 작업 부하, 전력망, 재사용 가능성을 고정하지 않으면 단일 설계 선택의 우열을 결정하지 못한다.

| 층 | 묻는 질문 | 단일 지표의 한계 |
|---|---|---|
| 운영 | 요청·학습·서비스를 제공하며 얼마의 에너지와 탄소가 드는가 | 장비·시설 제조 영향이 빠짐 |
| 장비 제조 | 칩·메모리·저장장치·서버를 만드는 과정의 영향은 무엇인가 | 사용 기간·작업량 배분이 필요함 |
| 시설 인프라 | 랙·전력·냉각·건물의 영향은 어떻게 배분되는가 | IT 장비만 재면 누락됨 |

## 위키 반영

이 자료는 [[운영 탄소와 내재 탄소]]의 직접 근거이며, [[에너지 비례 컴퓨팅]]이나 [[LLM 추론 에너지 지표]]가 다루는 실행 중 에너지 경계를 수명 주기 전체와 구분하게 한다. 「낮은 운영 에너지는 지속 가능한 컴퓨팅을 보장하는가」에서는 효율 개선이 유효하지 않다는 결론이 아니라, 어떤 경계·수명·배분 아래 유효한지 물어야 한다는 연결로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[운영 탄소와 내재 탄소]] | 운영 전력과 하드웨어 제조·인프라에서 나오는 탄소를 별도 항으로 분석할 근거를 제공한다. | [[Chasing Carbon: The Elusive Environmental Footprint of Computing]] |
| constrains | [[에너지 비례 컴퓨팅]] | 부하에 따른 운영 전력 개선을 전체 수명 주기 환경 영향의 충분조건으로 확대하지 않게 한다. | [[Chasing Carbon: The Elusive Environmental Footprint of Computing]] |

## 출처

- arXiv, [paper record](https://arxiv.org/abs/2011.02839)
- authors, [HPCA 2021 paper PDF](https://hsienhsinlee.github.io/MARS/pub/hpca2021-carbon.pdf)
- IEEE, [2022 expanded version DOI](https://doi.org/10.1109/MM.2022.3163226)

## 관련 항목

- [[운영 탄소와 내재 탄소]] — 수명 주기 안에서 두 배출 경로를 구분한다.
- [[수명 주기 평가 경계]] — 어떤 단계·자산·기간을 회계에 포함할지 정한다.
- [[에너지 비례 컴퓨팅]] — 운영 중 부하와 전력의 관계를 다룬다.
