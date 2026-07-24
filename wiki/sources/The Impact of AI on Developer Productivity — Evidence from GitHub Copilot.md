---
title: "The Impact of AI on Developer Productivity: Evidence from GitHub Copilot"
aliases: ["The Impact of AI on Developer Productivity: Evidence from GitHub Copilot", Peng et al. 2023, GitHub Copilot productivity experiment, Copilot 생산성 실험]
summary: "JavaScript HTTP 서버 구현 과제에서 GitHub Copilot 접근 여부를 무작위 배정해 완료 시간을 비교한 2023년 통제 실험."
tags: [type/reference, domain/software-engineering, domain/machine-learning, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2023
historical_layer: measurement
capability_layers: [programmability, realized-performance]
sources: ["The Impact of AI on Developer Productivity — Evidence from GitHub Copilot"]
source_id: ref-106
source_kind: external
primary_sources: ["Sida Peng, Eirini Kalliamvakou, Peter Cihon, and Mert Demirer, The Impact of AI on Developer Productivity: Evidence from GitHub Copilot, arXiv:2302.06590, 2023"]
supporting_sources: []
source_urls: ["https://arxiv.org/abs/2302.06590"]
retrieved: 2026-07-25
version: "arXiv v1, 2023-02-13"
snapshot_status: external-only
status: active
graph_id: reference-github-copilot-productivity
graph_visibility: public
---

## 개요

[[The Impact of AI on Developer Productivity: Evidence from GitHub Copilot]]은 Sida Peng 등 4인이 GitHub Copilot의 생산성 효과를 통제 실험으로 조사한 2023년 연구다. 모집된 개발자는 JavaScript HTTP 서버를 구현했고, 연구는 참가자에게 AI 페어 프로그래머 접근 권한을 무작위로 부여해 과제 완료 시간을 비교했다.

논문은 Copilot 접근 집단이 이 과제를 통제 집단보다 55.8% 빠르게 완료했다고 보고한다. 이 수치는 JavaScript의 독립 구현 과제, 해당 도구와 실험 절차, 완료 시간이라는 결과 정의에 속한다. 복잡한 장기 프로젝트, 코드 리뷰, 배포·운영, 보안 검증까지 포함한 모든 개발 활동의 평균 향상률로 확대할 수는 없다.

## 시간 결과와 결과 계약

생산성 주장은 작업·완료 조건·품질 문턱을 고정해야 비교할 수 있다. 이 연구는 특정 구현 과제를 얼마나 빨리 끝냈는가를 측정하지만, 생성된 코드가 유지보수·협업·시스템 맥락에서 가지는 비용까지 직접 측정하지는 않는다. 따라서 [[The SPACE of Developer Productivity]]의 다차원 틀과 함께 읽으면, 시간 단축과 전체 개발 성과를 구분할 수 있다.

| 비교 항목 | 이 연구의 고정 조건 | 별도로 확인할 조건 |
|---|---|---|
| 작업 | JavaScript HTTP 서버 구현 | 실제 저장소의 요구사항·변경 이력·의존성 |
| 도구 | 당시 GitHub Copilot 접근 여부 | 모델·에이전트·IDE 통합의 후속 변화 |
| 결과 | 과제 완료 시간 | 리뷰, 테스트, 결함, 운영·유지보수 비용 |

## 위키 반영

이 자료는 [[AI 코딩 지원]]이 독립적이고 경계가 분명한 구현 과제의 완료 시간을 바꿀 수 있다는 직접 근거다. 「자동화는 계산 노동을 없애는가 책임을 옮기는가」에서는 이 결과를 [[Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity]]와 비교해, 서로 다른 과제와 결과 계약을 하나의 보편 배수로 합치지 않는다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[AI 코딩 지원]] | 무작위 배정 실험으로 특정 구현 과제에서 AI 페어 프로그래머 접근과 완료 시간을 비교한다. | [[The Impact of AI on Developer Productivity: Evidence from GitHub Copilot]] |
| measures | [[개발자 생산성]] | 과제 완료 시간을 생산성의 한 측정값으로 제공하지만 전체 개발 성과를 대신하지는 않는다. | [[The Impact of AI on Developer Productivity: Evidence from GitHub Copilot]] |

## 출처

- arXiv, [paper record](https://arxiv.org/abs/2302.06590)

## 관련 항목

- [[AI 코딩 지원]] — 생산성 주장에 앞서 도구·역할·사람의 검토 경계를 확인한다.
- [[개발자 생산성]] — 완료 시간을 품질·협업·흐름과 분리해 읽는다.
- [[Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity]] — 친숙한 대규모 저장소 과제에서 다른 측정 결과를 제시한다.
