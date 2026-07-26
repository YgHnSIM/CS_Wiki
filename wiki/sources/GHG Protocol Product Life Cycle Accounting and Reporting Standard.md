---
title: GHG Protocol Product Life Cycle Accounting and Reporting Standard
aliases: [GHG Protocol Product Standard, 제품 수명 주기 회계 표준, Product Life Cycle Standard]
summary: "제품의 원료·제조·사용·폐기 단계를 포괄하는 온실가스 배출량을 일관되게 회계·보고하기 위한 GHG Protocol의 2011년 제품 수명 주기 표준."
tags: [type/reference, domain/systems, domain/software-engineering, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2011
historical_layer: measurement
capability_layers: [resource-efficiency, reliable-results]
sources: [GHG Protocol Product Life Cycle Accounting and Reporting Standard]
source_id: ref-108
source_kind: external
primary_sources: ["Greenhouse Gas Protocol, Product Life Cycle Accounting and Reporting Standard, 2011"]
supporting_sources: ["GHG Protocol Product Standard landing page and 2026 ISO joint-update notice"]
source_urls: ["https://ghgprotocol.org/product-standard", "https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard-EReader_041613_0.pdf"]
retrieved: 2026-07-25
version: "2011 Product Life Cycle Accounting and Reporting Standard"
snapshot_status: external-only
status: active
graph_id: reference-ghg-product-lifecycle-standard
graph_visibility: public
---

## 개요

[[GHG Protocol Product Life Cycle Accounting and Reporting Standard]]은 제품의 수명 주기 전반에서 발생하는 온실가스 배출을 측정·보고하기 위한 GHG Protocol의 2011년 표준이다. 이 표준은 제품 자체의 사용 단계만 떼어 보지 않고 원료, 제조, 운송, 사용, 폐기 등 수명 주기의 단계를 회계 경계 안에서 정의하도록 요구한다.

컴퓨팅 맥락에서 이 표준은 서버·가속기·저장장치·네트워크·냉각 설비를 포함하는 시스템의 환경 주장을 만들 때, 관찰한 전력량 하나를 전체 환경 영향으로 바꾸지 않게 하는 기준이다. 다만 이 문서는 특정 데이터센터나 모델의 탄소 수치를 제공하는 실험 논문이 아니라 회계 경계와 보고 방식을 정하는 표준이다.

## 경계·기능 단위·비교 가능성

수명 주기 회계는 무엇을 한 단위의 서비스 또는 제품으로 셀지, 어느 단계를 포함할지, 공동 자원을 어떻게 배분할지를 먼저 정해야 한다. 서로 다른 기능 단위나 경계에서 나온 `CO₂e` 값을 그대로 비교하면, 효율 개선이 실제 감소인지 배출의 다른 단계로의 이동인지 알 수 없다.

| 먼저 고정할 항목 | 컴퓨팅에서의 예 | 고정하지 않을 때의 혼동 |
|---|---|---|
| 기능 단위 | 유효 요청, 학습 완료 모델, 서버 수명 동안 제공한 서비스 | 요청당과 장비당 결과를 같은 분모로 합침 |
| 시스템 경계 | 칩·서버·랙·냉각·건물 가운데 포함 범위 | IT 장비 전력만 시설 전체 영향으로 오인 |
| 배분·기간 | 장비 수명, 공유 시설의 배분 방식, 지역·시간 | 제조 영향과 특정 기간의 운영 영향을 임의로 합침 |

## 판본 상태

이 위키는 2011년 표준을 직접 근거로 사용한다. GHG Protocol 웹사이트가 2026년에 ISO와의 제품 수준 표준 갱신 작업을 알렸지만, 진행 중인 갱신을 현행 2011년 판본의 확정된 규칙으로 바꾸어 읽지 않는다.

## 위키 반영

이 자료는 [[수명 주기 평가 경계]]가 제품·서비스의 환경 영향을 비교하기 전에 기능 단위와 포함 범위를 선언해야 한다는 직접 근거다. [[운영 탄소와 내재 탄소]]에서는 운영 중 전력 배출과 제조·인프라 영향을 같은 회계 체계 안에서 구분할 때의 상위 기준으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[수명 주기 평가 경계]] | 제품 생애주기의 단계, 기능 단위와 보고 경계를 명시하는 회계 틀을 제공한다. | [[GHG Protocol Product Life Cycle Accounting and Reporting Standard]] |
| constrains | [[운영 탄소와 내재 탄소]] | 운영 단계만 관찰한 값을 제품·서비스 전체 수명 주기 영향으로 일반화하지 않게 한다. | [[GHG Protocol Product Life Cycle Accounting and Reporting Standard]] |

## 출처

- GHG Protocol, [Product Standard page](https://ghgprotocol.org/product-standard)
- GHG Protocol, [2011 standard PDF](https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard-EReader_041613_0.pdf)

## 관련 항목

- [[수명 주기 평가 경계]] — 기능 단위와 시스템 경계를 컴퓨팅 사례에 적용한다.
- [[운영 탄소와 내재 탄소]] — 운영·제조·인프라 배출을 구분한다.
- [[전력 사용 효율]] — 시설 효율 지표가 수명 주기 전체를 뜻하지 않는 이유를 확인한다.
