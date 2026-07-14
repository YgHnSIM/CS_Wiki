---
title: On the Computational Complexity of Algorithms
aliases: [Hartmanis-Stearns 1965, computational complexity of algorithms]
summary: "계산 가능한 대상들 사이에도 필요한 시간 자원에 따른 본질적 난이도 차이가 있음을 형식화하고 시간 복잡도 계층을 제시한 1965년 논문."
tags: [type/reference, domain/computer-science, domain/computer-history, status/active]
created: 2026-07-15
updated: 2026-07-15
sources: ["1965_Hartmanis_Stearns_Computational_Complexity.pdf", "Transactions of the American Mathematical Society 117 (1965)"]
source_id: ref-031
source_kind: external
primary_sources: ["Transactions of the American Mathematical Society 117 (1965)"]
supporting_sources: ["1965_Hartmanis_Stearns_Computational_Complexity.pdf", "American Mathematical Society DOI record", "Johannes Kepler University access copy"]
source_urls: ["https://doi.org/10.1090/S0002-9947-1965-0170805-7", "https://www3.risc.jku.at/people/schreine/courses/compcomp/HartmanisStearns1965.pdf"]
retrieved: 2026-07-15
version: null
snapshot_status: archived
status: active
---

## 개요

[[On the Computational Complexity of Algorithms]]는 Juris Hartmanis와 Richard E. Stearns가 1965년에 발표한 논문이다. [[앨런 튜링]]의 작업이 수열과 함수가 기계적 절차로 계산 가능한지를 구분했다면, 이 논문은 계산 가능한 대상 사이에도 계산하기 쉬운 것과 어려운 것이 있다는 문제를 별도로 다룬다.

저자들은 다중 테이프 [[튜링 기계]]가 수열의 앞부분을 출력하는 데 필요한 연산 수를 시간 함수로 삼아 복잡도 클래스를 정의한다. 고정된 상수배 속도 향상은 같은 복잡도 클래스를 유지하지만, 더 큰 시간 자원을 허용하면 기존 클래스에 속하지 않는 계산 가능한 수열이 나타날 수 있음을 보여준다. 이는 실제 부품의 절대 속도보다 입력이나 출력 규모에 따라 자원 요구량이 어떻게 증가하는지를 보려는 관점이다.

논문은 기계 모델의 차이가 복잡도에 미치는 영향도 분석한다. 한 테이프 기계와 여러 테이프 기계, 여러 헤드, 다차원 테이프 사이의 모사 비용을 비교하고, 수열뿐 아니라 수·함수·언어 인식 문제로 분류 방식을 확장한다. 이로써 계산 가능성과 계산 자원이라는 서로 다른 질문을 연결한다.

## 주요 인사이트

- 계산 가능하다는 사실만으로 계산이 실용적인 시간 안에 끝난다는 뜻은 아니다.
- 시간 복잡도는 부품의 절대 속도보다 문제 규모에 따른 연산 수 증가를 분류한다.
- 고정된 상수배 속도 차이는 같은 복잡도 클래스를 만들 수 있지만, 점근적으로 더 많은 시간은 더 넓은 계산 대상을 허용할 수 있다.
- 계산 모델 사이의 모사 비용을 명시해야 서로 다른 기계에서 얻은 복잡도 주장을 비교할 수 있다.
- 복잡도 분류는 수열에서 함수와 언어 인식 문제로 확장될 수 있다.

## 인용할 만한 구절

> “some computable sequences are very easy to compute whereas other computable sequences seem to have an inherent complexity”

## 위키 반영

이 자료는 [[계산 가능성]]과 실제 컴퓨터 성능 사이에 계산 복잡도라는 중간 층위가 필요함을 보여준다. “컴퓨팅 능력이란 무엇인가”를 설명할 때 원리적 계산 가능성, 자원 증가율, 특정 기계에서 측정한 실행 성능을 구분하는 직접 근거로 사용할 수 있다.

## 출처

- 로컬 보존본: `raw/assets/1965_Hartmanis_Stearns_Computational_Complexity.pdf`
- American Mathematical Society, [On the Computational Complexity of Algorithms](https://doi.org/10.1090/S0002-9947-1965-0170805-7)
- Johannes Kepler University access copy, [HartmanisStearns1965.pdf](https://www3.risc.jku.at/people/schreine/courses/compcomp/HartmanisStearns1965.pdf)

## 관련 항목

- [[On Computable Numbers with an Application to the Entscheidungsproblem]]
- [[계산 가능성]]
