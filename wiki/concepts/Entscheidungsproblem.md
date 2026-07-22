---
title: Entscheidungsproblem
aliases: [결정 문제, decision problem, Hilbert's Entscheidungsproblem, 힐베르트 결정 문제]
summary: "수학 명제의 증명 가능성을 일반 기계 절차로 판정할 수 있는지를 묻는 결정 문제."
tags: [type/concept, domain/computer-science, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["On Computable Numbers with an Application to the Entscheidungsproblem", "An Unsolvable Problem of Elementary Number Theory"]
status: active
graph_id: concept-145622bcdc913103
---

## 개요

[[Entscheidungsproblem]]은 형식 논리의 명제가 주어졌을 때, 그 명제가 논리적으로 타당한지(동등하게 적절한 형식 체계에서 증명 가능한지)를 유한한 단계로 항상 판정하는 일반적 절차가 존재하는가를 묻는 문제다. Hilbert 프로그램의 맥락에서 제기된 이 질문은 임의의 수학적 질문의 진위를 판정하라는 요구가 아니라, 일차 논리의 공식에 적용할 보편적 판정 방법을 요구한 것이다.

## Turing의 결론

[[On Computable Numbers with an Application to the Entscheidungsproblem]]에서 [[앨런 튜링]]은 자신의 계산 기계 모델을 사용해 Entscheidungsproblem에 요구되는 일반 절차가 존재하지 않음을 보였다. 논문의 계산 불가능성 결과를 형식 논리의 판정 문제로 환원하면, 그러한 절차가 존재한다는 가정으로부터 이미 불가능하다고 증명한 기계 판정 절차를 만들 수 있기 때문이다.

## Church와의 연결

[[알론조 처치]]도 [[An Unsolvable Problem of Elementary Number Theory]]에서 효과적 계산 가능성의 형식화를 통해 유사한 결론에 도달했다. Turing은 자신의 계산 가능성과 Church의 effective calculability가 동등하다고 설명했다.

## 의미

Entscheidungsproblem의 부정적 해결은 계산 가능성 이론의 핵심 전환이다. 이는 단순히 아직 좋은 알고리즘을 찾지 못했다는 뜻이 아니라, 명확히 형식화된 문제 중에도 모든 입력에 답하는 일반적 기계 절차가 존재하지 않는 문제가 있음을 의미한다. 개별 공식의 타당성을 증명하거나 반증할 수 있는 경우가 있다는 사실과, 모든 공식에 통하는 하나의 판정 절차가 없다는 사실은 구분해야 한다.

## 출처

- [[On Computable Numbers with an Application to the Entscheidungsproblem]]
- [[An Unsolvable Problem of Elementary Number Theory]]

## 관련 항목

- [[계산 가능성]]
- [[튜링 기계]]
- [[정지 문제]]
- [[처치-튜링 논제]]
- [[앨런 튜링]]
- [[알론조 처치]]
- [[기계가 계산한다는 말의 이론적 의미]]
