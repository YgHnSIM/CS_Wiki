---
title: "Expectation vs. Experience: Evaluating the Usability of Code Generation Tools Powered by Large Language Models"
aliases: ["Expectation vs. Experience: Evaluating the Usability of Code Generation Tools Powered by Large Language Models", Copilot usability study, Vaithilingam Zhang Glassman 2022, AI 코드 생성 도구 사용성]
summary: "Copilot과 일반 코드 완성을 비교한 24명 대상 사용자 연구로, AI 코드 생성 도구의 선호와 작업 완료·이해·편집·디버깅 부담을 함께 다룬 2022년 CHI 연구."
tags: [type/reference, domain/software-engineering, domain/machine-learning, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2022
historical_layer: measurement
capability_layers: [programmability, reliable-results]
sources: ["Expectation vs. Experience — Evaluating the Usability of Code Generation Tools Powered by Large Language Models"]
source_id: ref-105
source_kind: external
primary_sources: ["Priyan Vaithilingam, Tianyi Zhang, and Elena L. Glassman, Expectation vs. Experience: Evaluating the Usability of Code Generation Tools Powered by Large Language Models, CHI EA 2022, Article 332, pp. 1–7"]
supporting_sources: ["ACM Digital Library record and authors' open PDF"]
source_urls: ["https://dl.acm.org/doi/10.1145/3491101.3519665", "https://glassmanlab.seas.harvard.edu/papers/copilot_lbw_chi22.pdf"]
retrieved: 2026-07-25
version: "CHI '22 Extended Abstracts, Article 332"
snapshot_status: external-only
status: active
graph_id: reference-ai-code-generation-usability
graph_visibility: public
---

## 개요

[[Expectation vs. Experience: Evaluating the Usability of Code Generation Tools Powered by Large Language Models]]은 Priyan Vaithilingam, Tianyi Zhang, Elena L. Glassman이 2022년 CHI Extended Abstracts에 발표한 사용자 연구다. 연구는 Python 과제를 수행하는 24명의 참가자가 GitHub Copilot과 VS Code IntelliSense를 사용할 때의 경험을 비교해, 코드 생성 도구를 평가할 때 생성량이나 완성 시간만으로 충분한지 묻는다.

참가자들은 Copilot이 검색을 줄이고 초안 출발점을 제공한다는 이유로 일상 작업에서 사용하고 싶다고 답했지만, 과제 완료 시간이나 성공률이 반드시 개선되지는 않았다. 특히 생성된 코드를 이해하고, 수정하고, 디버깅하는 일이 과제 해결을 어렵게 할 수 있었다. 이 결과는 도구가 문자를 생산하는 속도와 사람이 결과를 검증·통합하는 능력을 같은 생산성으로 보지 않게 한다.

## 측정 경계

이 연구의 비교 대상은 Copilot이 아니라 일반적인 모든 AI 코딩 지원 도구가 아니다. Python 과제, 참가자 구성, 당시의 모델·IDE 통합, IntelliSense와의 비교, 과제 완료와 사용자 선호라는 조건 안에서 읽어야 한다. 참가자의 선호가 곧 완성 시간 단축이나 코드 품질의 보장은 아니며, 반대로 완료 시간에 차이가 없다는 사실도 탐색·학습·만족 같은 다른 가치를 부정하지 않는다.

| 관찰 대상 | 이 연구가 직접 보여 주는 것 | 이 연구만으로 판단할 수 없는 것 |
|---|---|---|
| 생성 초안 | 검색과 초기 작성의 일부 부담을 줄일 수 있는 출발점 | 대규모 코드베이스에서 장기 유지보수에 미치는 효과 |
| 사람의 작업 | 이해·편집·디버깅이 별도 비용이 될 수 있음 | 모든 숙련도와 언어에서의 평균 시간 변화 |
| 선호 | 일부 사용자는 일상 작업에 도구를 쓰고 싶어 함 | 선호가 품질·보안·책임 이전을 자동으로 보장함 |

## 위키 반영

이 자료는 [[AI 코딩 지원]]을 단순 자동 완성 기능이 아니라 생성·이해·수정·검증이 결합된 인간-도구 작업 흐름으로 설명하는 직접 근거다. [[검증 노동]]에서는 도구가 생성한 코드의 확인과 통합이 사라진 일이 아니라 다른 단계로 이동한 일일 수 있음을 검토하는 근거로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[AI 코딩 지원]] | Copilot 사용 경험을 통해 코드 생성 도구가 초안 생성과 사람의 검토·편집을 함께 요구하는 작업 방식을 보인다. | [[Expectation vs. Experience: Evaluating the Usability of Code Generation Tools Powered by Large Language Models]] |
| enables | [[검증 노동]] | 생성된 제안을 이해·수정·디버깅해야 한다는 관찰은 검증과 통합을 독립 작업으로 분석할 근거를 제공한다. | [[Expectation vs. Experience: Evaluating the Usability of Code Generation Tools Powered by Large Language Models]] |

## 출처

- ACM, [DOI record](https://dl.acm.org/doi/10.1145/3491101.3519665)
- Glassman Lab, [open paper PDF](https://glassmanlab.seas.harvard.edu/papers/copilot_lbw_chi22.pdf)

## 관련 항목

- [[AI 코딩 지원]] — 생성 제안을 사람이 어떻게 사용·검토하는지의 개념 경계를 정한다.
- [[검증 노동]] — 생성 이후에 남는 이해·편집·테스트·리뷰 작업을 구분한다.
- [[개발자 생산성]] — 시간 하나로 환원되지 않는 개발 결과의 측정 틀을 확인한다.
