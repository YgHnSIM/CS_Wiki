---
title: On Computable Numbers with an Application to the Entscheidungsproblem
aliases: [On Computable Numbers, Turing 1936, computable numbers]
summary: "Turing의 1936년 논문을 바탕으로 튜링 기계, 보편 튜링 기계, 계산 가능성, 정지 문제, Entscheidungsproblem을 정리한 참고 자료."
tags: [type/reference, domain/computer-history, domain/computer-science, status/active]
created: 2026-07-10
updated: 2026-07-18
publication_year: 1937
event_start: 1936
event_end: 1937
historical_layer: theory
historical_note: "1936년 제출·1937년 출판을 구분한다."
capability_layers: [computability]
sources: ["1936_Turing_On_Computable_Numbers.pdf", "Proceedings of the London Mathematical Society 1937", "Turing Digital Archive AMT-B-12"]
source_id: ref-009
source_kind: external
primary_sources: ["Proceedings of the London Mathematical Society 1937"]
supporting_sources: ["1936_Turing_On_Computable_Numbers.pdf", "Turing Digital Archive AMT-B-12", "Wiley record", "PDF copy"]
source_urls: ["https://turingarchive.kings.cam.ac.uk/publications-lectures-and-talks-amtb/amt-b-12", "https://londmathsoc.onlinelibrary.wiley.com/doi/10.1112/plms/s2-42.1.230", "https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: archived
status: active
---

## 개요

[[On Computable Numbers with an Application to the Entscheidungsproblem]]은 [[앨런 튜링]]이 1936년에 제출하고 1937년에 출판한 논문이다. 이 문헌은 "유한한 수단으로 계산 가능하다"는 직관을 [[튜링 기계]]라는 단순한 기계 모델로 분석하고, [[보편 튜링 기계]]와 계산 불가능성의 핵심 논증을 제시한다.

논문의 표면 주제는 계산 가능한 실수이지만, 실제 중요성은 계산 절차 자체를 수학적 대상으로 만든 데 있다. Turing은 사람이 종이에 기호를 쓰고 지우며 일정한 규칙을 따르는 계산 과정을 테이프, 상태, 기호, 전이 규칙으로 모델링했다. 이 모델은 이후 [[계산 가능성]] 이론의 중심 언어가 되었다.

## 주요 인사이트

- 계산은 사람이 직관적으로 수행하는 무한히 다양한 활동이 아니라, 유한한 상태와 유한한 규칙으로 분석될 수 있다.
- [[튜링 기계]]는 무한한 테이프, 현재 읽는 칸, 내부 상태, 전이 규칙을 통해 계산 절차를 형식화한다.
- [[보편 튜링 기계]]는 다른 기계의 기술(description)을 입력으로 받아 그 기계의 동작을 흉내낼 수 있다.
- 잘 정의된 문제 중에도 정답을 산출하는 일반 판정 절차가 존재하지 않는 문제가 있다.
- 이 논증은 Hilbert의 [[Entscheidungsproblem]]이 일반적으로 풀릴 수 없다는 결론으로 이어진다.

## 위키 반영

이 자료는 [[알고리즘적 사고]], [[기호 조작]], [[프로그래밍 언어]], [[저장 프로그램 컴퓨터]]의 이론적 기반을 확장하는 데 쓰인다. 새 분석 페이지 [[기계가 계산한다는 말의 이론적 의미]]는 Turing의 기계 모델이 "계산한다"는 말을 어떻게 제한하고 정밀하게 만드는지 정리한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| responds_to | [[Entscheidungsproblem]] | 모든 수학 명제에 적용되는 기계적 판정 절차가 존재하는지 묻는 결정 문제에 형식적으로 대응한다. | [[On Computable Numbers with an Application to the Entscheidungsproblem]] |
| enables | [[계산 가능성]] | 유한한 규칙을 수행하는 기계 모델로 “기계적으로 계산 가능하다”는 범위를 분석할 수 있게 한다. | [[On Computable Numbers with an Application to the Entscheidungsproblem]] |

## 출처

- 로컬 보존본: `raw/assets/1936_Turing_On_Computable_Numbers.pdf`
- Turing Digital Archive, [AMT/B/12](https://turingarchive.kings.cam.ac.uk/publications-lectures-and-talks-amtb/amt-b-12)
- Wiley, [On Computable Numbers, with an Application to the Entscheidungsproblem](https://londmathsoc.onlinelibrary.wiley.com/doi/10.1112/plms/s2-42.1.230)
- PDF copy, [On Computable Numbers, with an Application to the Entscheidungsproblem](https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf)

## 관련 항목

- [[앨런 튜링]]
- [[튜링 기계]]
- [[보편 튜링 기계]]
- [[계산 가능성]]
- [[정지 문제]]
- [[Entscheidungsproblem]]
- [[처치-튜링 논제]]
- [[기계가 계산한다는 말의 이론적 의미]]
- [[On the Computational Complexity of Algorithms]]
- [[컴퓨팅 능력이란 무엇인가]]
