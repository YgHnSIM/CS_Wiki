---
title: The Linpack Benchmark
aliases: [TOP500 Linpack benchmark page, LINPACK benchmark overview]
summary: "고밀도 선형방정식 풀이를 통해 부동소수점 실행률을 측정하는 LINPACK의 범위와 Rmax·Rpeak의 차이, 단일 벤치마크 수치의 한계를 설명하는 TOP500 공식 자료."
tags: [type/reference, domain/computer-architecture, domain/computer-science, status/active]
created: 2026-07-15
updated: 2026-07-15
sources: ["TOP500_Linpack_Benchmark.html", "TOP500_Linpack_FAQ.html", "TOP500 The Linpack Benchmark page", "TOP500 Linpack FAQ"]
source_id: ref-033
source_kind: external
primary_sources: ["TOP500 The Linpack Benchmark page", "TOP500 Linpack FAQ"]
supporting_sources: ["TOP500_Linpack_Benchmark.html", "TOP500_Linpack_FAQ.html"]
source_urls: ["https://www.top500.org/project/linpack/", "https://www.top500.org/resources/frequently-asked-questions/"]
retrieved: 2026-07-15
version: null
snapshot_status: archived
status: active
---

## 개요

[[The Linpack Benchmark]]는 TOP500이 고성능 컴퓨터를 비교할 때 사용하는 LINPACK 벤치마크의 대상, 측정값과 한계를 설명하는 공식 자료다. TOP500용 High Performance LINPACK(HPL)은 무작위 고밀도 행렬로 표현한 선형방정식계를 LU 분해와 부분 피벗팅으로 풀며, 64비트 부동소수점 연산의 실제 실행률을 측정한다.

`Rpeak`는 하드웨어 사양으로 계산한 이론적 최고 부동소수점 실행률이고, `Rmax`는 허용된 문제 크기와 최적화된 소프트웨어를 사용해 실제로 달성한 최고 LINPACK 성능이다. `Nmax`는 Rmax를 얻은 문제 크기이며 `N1/2`는 Rmax의 절반에 도달하는 문제 크기다. 따라서 최고 사양과 달성 성능, 그리고 충분한 성능을 끌어내는 데 필요한 문제 규모를 구분할 수 있다.

그러나 LINPACK은 규칙적인 고밀도 선형대수 작업에 특화되어 있다. TOP500 자체도 이 수치가 시스템 전체 성능을 대표하지 않으며, 응용 프로그램, 알고리즘, 문제 크기, 언어, 구현, 컴파일러, 운영체제, 메모리와 하드웨어 특성이 실제 성능을 함께 결정한다고 설명한다. 정확도와 64비트 정밀도 조건도 충족해야 하므로 단순히 연산 횟수만 빠르게 보고하는 시험이 아니다.

## 주요 인사이트

- 이론적 최고 성능 Rpeak와 실제 달성 성능 Rmax는 구분해야 한다.
- 벤치마크 점수는 특정 작업 부하와 정확도·정밀도 규칙 아래에서만 의미가 있다.
- 동일한 프로세서도 컴파일러 옵션, 캐시, 메모리 대역폭과 시스템 부하에 따라 결과가 달라질 수 있다.
- LINPACK은 고밀도 선형대수 성능의 기준점이지 컴퓨터 전체 능력의 단일 척도가 아니다.
- 성능 비교에는 실행한 알고리즘, 문제 크기, 소프트웨어와 측정 조건을 함께 기록해야 한다.

## 인용할 만한 구절

> “This performance does not reflect the overall performance of a given system, as no single number ever can.”

## 위키 반영

이 자료는 [[Fortran]], [[컴파일러 최적화]], 데이터 이동과 실제 하드웨어 성능을 하나의 측정 사례로 연결한다. “컴퓨팅 능력이란 무엇인가”에서는 최고 성능과 달성 성능의 차이, 작업별 벤치마크의 범위, 정확도 조건을 설명하는 핵심 사례로 사용할 수 있다.

## 출처

- 로컬 보존본: `raw/assets/TOP500_Linpack_Benchmark.html`
- 로컬 보존본: `raw/assets/TOP500_Linpack_FAQ.html`
- TOP500, [The Linpack Benchmark](https://www.top500.org/project/linpack/)
- TOP500, [Frequently Asked Questions](https://www.top500.org/resources/frequently-asked-questions/)

## 관련 항목

- [[SPEC CPU 2026 Overview]]
- [[Roofline An Insightful Visual Performance Model]]
- [[Power Measurement Tutorial for the Green500 List]]
- [[컴퓨팅 능력이란 무엇인가]]
