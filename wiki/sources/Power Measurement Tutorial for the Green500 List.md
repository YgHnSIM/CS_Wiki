---
title: Power Measurement Tutorial for the Green500 List
aliases: [Green500 power tutorial 2007]
summary: "LINPACK 달성 성능과 같은 실행 구간의 평균 전력을 결합해 GFLOPS/W를 산출하는 Green500의 2007년 전력 측정 지침."
tags: [type/reference, domain/computer-architecture, domain/computer-science, status/active]
created: 2026-07-15
updated: 2026-07-15
sources: ["Green500_Power_Measurement_Tutorial.pdf", "Power Measurement Tutorial for the Green500 List (2007)"]
source_id: ref-036
source_kind: external
primary_sources: ["Power Measurement Tutorial for the Green500 List (2007)"]
supporting_sources: ["Green500_Power_Measurement_Tutorial.pdf", "TOP500-hosted access copy"]
source_urls: ["https://top500.org/files/green500/tutorial.pdf"]
retrieved: 2026-07-15
version: "2007-06-27"
snapshot_status: archived
status: active
---

## 개요

[[Power Measurement Tutorial for the Green500 List]]는 Rong Ge, Xizhou Feng, H. Pyla, Kirk Cameron, Wu-chun Feng이 2007년에 작성한 Green500 제출용 전력 측정 지침이다. TOP500이 LINPACK 달성 성능을 중심으로 시스템을 비교한다면, Green500은 같은 작업을 수행할 때의 성능당 전력을 통해 에너지 효율이라는 보완적 관점을 제시한다.

이 문서는 성능당 전력(PPW)을 LINPACK의 달성 최고 성능 `Rmax`를 그 실행 구간의 평균 시스템 전력 `P̄(Rmax)`로 나눈 GFLOPS/W로 정의한다. 성능과 전력은 동일한 시스템 규모와 동일한 문제 크기에서 측정해야 하며, 순간 전력이나 장비 정격 전력 대신 충분히 긴 실행 동안의 평균 AC RMS 전력을 사용한다.

전체 시스템 전력을 직접 측정하기 어려울 때는 균일한 노드·섀시·랙 가운데 측정 단위를 정하고, 작업 부하가 균등하며 단위들이 동일하다는 가정 아래 전체 전력을 추정한다. 여러 단위를 측정하고 반복 실행해 분산을 줄이는 절차도 제시한다. 이 조건들은 GFLOPS/W가 단순한 하드웨어 명목 수치가 아니라 작업 부하와 측정 경계에 의존하는 값임을 보여준다.

이 자료는 2007년판 역사 문서다. Green500의 현재 제출 규칙이나 전력 측정 수준을 그대로 대표하는 최신 규정으로 사용하지 않고, 컴퓨팅 능력 평가에 에너지 효율이 도입된 초기 측정 논리를 설명하는 근거로 한정한다.

## 주요 인사이트

- 성능당 전력은 성능과 전력을 동일한 작업·규모·시간 구간에서 측정해야 의미가 있다.
- 순간 전력, 정격 전력과 실제 작업 실행 중 평균 전력은 서로 다른 값이다.
- GFLOPS/W는 특정 LINPACK 작업에 대한 효율 지표이며 모든 응용의 에너지 효율을 대표하지 않는다.
- 측정에 포함할 시스템 경계와 제외할 장치를 명시해야 결과를 재현할 수 있다.
- 계산 능력은 최대 속도뿐 아니라 제한된 전력으로 달성할 수 있는 유효 작업량으로도 평가할 수 있다.

## 인용할 만한 구절

> “There is no ideal power-performance efficiency metric for supercomputers.”

## 위키 반영

이 자료는 [[The Linpack Benchmark]]의 성능 측정에 전력이라는 자원 제약을 추가한다. “컴퓨팅 능력이란 무엇인가”에서는 절대 성능과 효율을 구분하고, 지표의 작업 부하·시스템 경계·측정 구간을 함께 기록해야 하는 이유를 설명하는 데 사용할 수 있다.

## 출처

- 로컬 보존본: `raw/assets/Green500_Power_Measurement_Tutorial.pdf`
- TOP500-hosted copy, [Power Measurement Tutorial for the Green500 List](https://top500.org/files/green500/tutorial.pdf)

## 관련 항목

- [[The Linpack Benchmark]]
