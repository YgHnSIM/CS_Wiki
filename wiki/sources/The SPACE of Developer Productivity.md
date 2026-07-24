---
title: The SPACE of Developer Productivity
aliases: [Forsgren et al. 2021, SPACE framework, SPACE 생산성 프레임워크, 개발자 생산성 SPACE]
summary: "개발자 생산성을 만족·웰빙, 성과, 활동, 소통·협업, 효율·몰입의 다섯 차원으로 다루며 단일 지표 측정의 한계를 설명한 2021년 ACM Queue 논문."
tags: [type/reference, domain/software-engineering, domain/computer-science, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2021
historical_layer: measurement
capability_layers: [programmability, reliable-results]
sources: ["The SPACE of Developer Productivity"]
source_id: ref-072
source_kind: external
primary_sources: ["Nicole Forsgren et al., The SPACE of Developer Productivity: There’s more to it than you think, ACM Queue 19(1), 2021, pp. 20–48"]
supporting_sources: ["Microsoft Research publication page"]
source_urls: ["https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity-theres-more-to-it-than-you-think/", "https://queue.acm.org/detail.cfm?id=3454124"]
retrieved: 2026-07-24
version: "ACM Queue 19(1), February 2021, pp. 20–48"
snapshot_status: external-only
status: active
graph_id: reference-space-developer-productivity
graph_visibility: public
---

## 개요

[[The SPACE of Developer Productivity]]는 Nicole Forsgren 등 연구진이 2021년에 발표한 개발자 생산성 프레임워크 논문이다. 저자들은 개인 활동량이나 소프트웨어 전달 시스템의 효율만으로 개발자 생산성을 정의할 수 없으며, 단일 지표·단일 차원으로 측정할 수도 없다고 주장한다.

SPACE는 다섯 차원을 제안한다. 만족과 웰빙(Satisfaction and well-being), 성과(Performance), 활동(Activity), 소통과 협업(Communication and collaboration), 효율과 몰입(Efficiency and flow)이다. 각 차원은 어느 하나가 전체 생산성의 대리값이라는 뜻이 아니다. 목적과 맥락에 맞춰 여러 차원의 지표를 함께 선택하고, 서로 충돌할 수 있는 결과를 해석해야 한다.

이 논문은 코드 줄 수, 커밋 수, 배포 횟수 같은 활동 지표를 금지하는 규칙이 아니다. 그런 지표는 활동이라는 한 차원에서 특정 질문에 유용할 수 있다. 다만 활동량만 높고 성과·품질·협업·몰입이 나빠지는 상황을 생산성 향상으로 오해하지 않도록 측정 목적과 보조 지표를 명시해야 한다.

## 주요 인사이트

- 개발자 생산성은 개인의 키 입력량이나 개발 시스템의 처리량 하나로 환원되지 않는다.
- 활동은 SPACE의 한 차원일 뿐, 성과·웰빙·협업·흐름과 교환 관계에 있을 수 있다.
- 좋은 측정은 감시용 만능 순위표가 아니라 팀의 의사결정과 개선 질문에 맞춰 설계한다.
- 같은 지표라도 개인·팀·조직 중 어느 수준을 설명하는지 구분해야 한다.
- 여러 지표는 서로 긴장할 수 있으므로, 한 지표를 올리기 위해 다른 중요한 결과를 악화시키지 않는지 확인해야 한다.

## 인용할 만한 구절

> “cannot be measured by a single metric or dimension”

저자들은 개발자 생산성을 단일 수치로 정리할 수 없다는 점을 논문의 출발점으로 둔다.

## 위키 반영

이 자료는 [[개발자 생산성]]과 [[코드 생산량은 왜 개발 생산성을 설명하지 못하는가]]의 직접 근거다. [[프로그래밍 가능성]]이 낮추려는 인간의 표현·변경 비용을 실제로 평가할 때, 활동량과 결과·협업·몰입을 구분해야 한다는 기준을 제공한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[개발자 생산성]] | 만족·웰빙, 성과, 활동, 소통·협업, 효율·몰입의 다섯 차원으로 측정 질문을 구성한다. | [[The SPACE of Developer Productivity]] |
| constrains | [[코드 생산량은 왜 개발 생산성을 설명하지 못하는가]] | 코드량·커밋 등 활동 지표를 전체 생산성의 단일 대리값으로 쓰지 않게 한다. | [[The SPACE of Developer Productivity]] |

## 출처

- Microsoft Research, [publication page](https://www.microsoft.com/en-us/research/publication/the-space-of-developer-productivity-theres-more-to-it-than-you-think/)
- ACM Queue, [article page](https://queue.acm.org/detail.cfm?id=3454124)

## 관련 항목

- [[개발자 생산성]] — 생산성의 측정 단위와 다차원 지표를 정리한다.
- [[본질적 복잡성과 부수적 복잡성]] — 도구가 줄일 수 있는 비용과 개념 구조의 어려움을 구분한다.
- [[코드 생산량은 왜 개발 생산성을 설명하지 못하는가]] — 활동량을 다른 결과 차원과 함께 읽는 방법을 분석한다.
- [[프로그래밍 가능성]] — 표현·변경·재사용 비용을 낮추는 소프트웨어 계층을 다룬다.
