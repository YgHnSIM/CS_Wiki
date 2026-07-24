---
title: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity
aliases: [METR developer productivity RCT, METR 2025 AI 생산성 연구, experienced OSS developers and AI]
summary: "숙련된 오픈소스 기여자가 익숙한 대규모 저장소의 실제 이슈를 수행할 때 초기 2025년 AI 도구 사용 허용 여부를 무작위 배정해 시간을 비교한 METR의 2025년 연구."
tags: [type/reference, domain/software-engineering, domain/machine-learning, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2025
historical_layer: measurement
capability_layers: [programmability, reliable-results]
sources: [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity]
source_id: ref-107
source_kind: external
primary_sources: ["Joel Becker, Nate Rush, Beth Barnes, and David Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity, METR, 2025"]
supporting_sources: ["METR, We are Changing our Developer Productivity Experiment Design, 2026"]
source_urls: ["https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/", "https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf", "https://metr.org/blog/2026-02-24-uplift-update/"]
retrieved: 2026-07-25
version: "early-2025 tool setting; 2026 methodology update recorded as supporting material"
snapshot_status: external-only
status: active
graph_id: reference-metr-ai-open-source-productivity
graph_visibility: public
---

## 개요

[[Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity]]은 METR가 숙련된 오픈소스 개발자가 자신이 오랫동안 기여한 대규모 저장소에서 실제 이슈를 처리할 때 AI 도구 사용이 시간을 어떻게 바꾸는지 조사한 무작위 대조 연구다. 16명의 개발자가 246개 과제를 수행했고, 과제마다 AI 사용 허용 또는 금지를 무작위로 배정했다.

연구는 초기 2025년 도구 조건에서 AI 사용이 허용된 과제가 평균 19% 더 오래 걸렸다고 보고한다. 저자들은 이 결과를 당시의 숙련된 기여자, 친숙한 대형 저장소, 약 20분에서 4시간인 실제 이슈, 사용 도구와 작업 방식에 대한 관찰로 한정한다. 이것은 AI가 어떤 개발자에게도 유용하지 않다는 일반 명제가 아니다.

## 시간 변화와 시점의 경계

이 연구의 보조 자료인 2026년 방법론 갱신은 더 최신 도구로 시도한 후속 실험에서 참가자 선택 편향 때문에 현재 생산성 효과를 신뢰성 있게 추정하기 어렵다고 설명한다. 따라서 이 페이지는 초기 2025년 결과와 2026년의 불확실성 기록을 구분한다. 최신 모델의 효과를 과거 실험값으로 갱신하거나, 후속 설계 변경을 새로운 속도 수치로 읽지 않는다.

| 비교 차원 | 이 연구의 조건 | 일반화할 때 남는 질문 |
|---|---|---|
| 개발자 | 자신이 잘 아는 대형 오픈소스 저장소의 숙련 기여자 | 초보자·새 코드베이스·사내 개발 환경에도 같은가 |
| 과제 | 실제 버그 수정·기능·리팩터링 이슈 | 독립적이고 짧은 구현 과제와 어떻게 다른가 |
| 성공 정의 | 사람이 만족할 PR, 스타일·테스트·문서 포함 | 자동 벤치마크 통과와 어떤 차이가 있는가 |
| 도구 시점 | 2025년 2–6월의 주된 도구 설정 | 이후 모델·에이전트·작업 방식 변화가 만든 차이 |

## 위키 반영

이 자료는 [[AI 코딩 지원]]의 효과를 벤치마크 성공률이나 자기평가만으로 판단하지 말고, 실제 저장소 맥락·검토 기준·도구 시점을 기록해야 함을 보여 준다. [[검증 노동]]에서는 테스트, 문서, 스타일과 통합이 시간 측정에 포함될 때 자동 생성의 이득이 달라질 수 있다는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| constrains | [[개발자 생산성]] | 숙련도, 코드베이스 친숙도, 작업 정의, 도구 시점이 다른 시간 결과를 하나의 보편 생산성 수치로 읽지 않게 한다. | [[Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity]] |
| exemplifies | [[검증 노동]] | 사람이 만족할 PR의 성공 정의가 테스트·문서·스타일과 통합 비용을 시간 측정에 포함한다. | [[Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity]] |

## 출처

- METR, [study page](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- METR, [study paper PDF](https://metr.org/Early_2025_AI_Experienced_OS_Devs_Study-paper.pdf)
- METR, [2026 methodology update](https://metr.org/blog/2026-02-24-uplift-update/)

## 관련 항목

- [[AI 코딩 지원]] — 도구의 효과를 사람·과제·완료 조건과 함께 본다.
- [[검증 노동]] — 생성 이후의 테스트·문서·통합 작업을 분리한다.
- [[The Impact of AI on Developer Productivity: Evidence from GitHub Copilot]] — 독립 구현 과제의 통제 실험과 비교한다.
