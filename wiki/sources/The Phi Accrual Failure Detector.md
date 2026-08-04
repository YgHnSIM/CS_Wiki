---
schema_version: 2
id: ref-119
kind: reference
title: The Phi Accrual Failure Detector
aliases:
  - phi accrual failure detector
  - φ-accrual failure detector
  - phi 장애 감지기
summary: heartbeat 도착 간격의 통계적 분포에서 연속적인 suspicion 값을 계산해 장애 탐지 민감도와 거짓 양성의 절충을 설명하는 failure detector 연구 보고서.
domains:
  - distributed-systems
  - systems
  - computer-science
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-05
updated: 2026-08-05
review:
  mode: pending
  revision: sha256:9eaaa06ea96db77a79e984367d35d2b5916604bdbc35d6886195c6754d91f9cc
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers:
  - reliable-results
history:
  publication_year: 2004
  layer: theory
origin: external
works:
  primary:
    - citation: Hayashibara, Défago, Yared, and Katayama, The φ Accrual Failure Detector, IS-RR-2004-010
      genre: primary-literature
      identifiers: []
      edition: JAIST technical report, 2004
  supporting: []
access:
  - kind: url
    role: mirror
    url: https://dspace.jaist.ac.jp/dspace/bitstream/10119/4784/1/IS-RR-2004-010.pdf
    retrieved: 2026-08-05
    version: IS-RR-2004-010
---

## 개요

[[The Phi Accrual Failure Detector]]는 failure detector가 “고장이 참인지”를 직접 아는 대신, heartbeat가 예상보다 늦게 도착할 가능성을 관찰해 suspicion 값을 연속적으로 계산하는 방법을 제안한다. 시스템은 하나의 고정 timeout 대신 suspicion threshold를 정책에 맞게 선택할 수 있다.

임계값을 낮추면 탐지 지연을 줄일 수 있지만 정상적인 지연·스케줄링 변동을 고장으로 판단할 가능성이 커진다. 임계값을 높이면 거짓 양성을 줄이는 대신 실제 장애를 늦게 격리할 수 있다. 이 절충은 failure detector가 완전한 장애 진실(oracle)이 아니라 불완전한 관찰 계층임을 보여준다.

## 위키 반영

이 자료는 [[장애 감지]]에서 completeness·accuracy를 단일 timeout의 성공 여부가 아니라 suspicion threshold와 관찰 분포의 선택 문제로 설명하는 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[장애 감지]] | heartbeat 관찰을 연속 suspicion 값과 threshold 정책으로 바꾸는 모델을 제공한다. | [[The Phi Accrual Failure Detector]] |
| constrains | [[꼬리 지연 시간]] | 정상적인 tail latency와 heartbeat 지연이 장애 의심을 만들 수 있으므로 지연 분포를 함께 관찰하게 한다. | [[The Phi Accrual Failure Detector]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- JAIST, [The Phi Accrual Failure Detector](https://dspace.jaist.ac.jp/dspace/bitstream/10119/4784/1/IS-RR-2004-010.pdf)

## 관련 항목

- [[장애 감지]] — suspicion과 실제 semantic failure의 경계를 정리한다.
- [[꼬리 지연 시간]] — 느린 응답이 사용자 기한과 감지 threshold에 미치는 효과를 설명한다.
- [[부분 실패]] — 관찰자가 전체 시스템 상태를 즉시 확정할 수 없는 조건을 다룬다.
