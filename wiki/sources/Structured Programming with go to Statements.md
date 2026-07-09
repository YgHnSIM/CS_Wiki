---
title: Structured Programming with go to Statements
aliases: [Knuth 1974, structured programming with goto]
tags: [type/reference, domain/software-engineering, domain/programming-languages, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["ACM Computing Surveys 1974"]
status: active
---

## 개요

[[Structured Programming with go to Statements]]는 [[도널드 커누스]]가 1974년에 발표한 논문이다. 이 글은 Dijkstra 이후의 `goto` 논쟁을 정리하면서, 신뢰 가능하고 잘 구조화된 프로그램과 효율적인 프로그램 사이의 긴장을 여러 사례로 검토한다.

Knuth의 핵심은 `goto`를 무조건 되살리자는 것이 아니다. 더 나은 반복 구문과 오류 탈출 구문이 있다면 많은 프로그램을 `goto` 없이 명확하고 효율적으로 쓸 수 있지만, 모든 상황을 단순한 금지 규칙으로 처리하는 것도 좋은 설계 방법은 아니라는 점을 강조한다.

## 주요 인사이트

- `goto` 논쟁의 실제 쟁점은 제어문 하나의 사용 여부보다, 프로그램을 읽고 검증할 수 있는 구조로 만들 수 있느냐에 있다.
- 개선된 반복 구문과 오류 탈출 구문은 `goto` 없이도 더 많은 프로그램을 명확하게 표현하게 한다.
- 설계 방법론은 먼저 읽기 쉽고 올바른 프로그램을 만들고, 필요하면 올바름을 유지하며 효율적인 형태로 변환하는 방향을 취할 수 있다.
- `goto` 폐지를 둘러싼 양쪽 주장에는 모두 일정한 타당성이 있다.
- 구조적 프로그래밍의 본질은 금지 목록이 아니라 언어 설계, 프로그램 변환, 검증 가능성의 균형이다.

## 위키 반영

이 자료는 [[GOTO 문]]과 [[구조적 프로그래밍]]을 교조적으로 대립시키지 않도록 균형을 잡는 데 쓰인다. [[goto와 점프에서 구조적 프로그래밍으로]]에서는 Knuth의 논의를 바탕으로, 구조적 프로그래밍을 `goto`의 단순 제거가 아니라 더 좋은 [[제어 구조]]를 설계하려는 흐름으로 정리한다.

## 출처

- ACM Digital Library, [Structured Programming with go to Statements](https://dl.acm.org/doi/10.1145/356635.356640)
- OpenAIRE, [Structured Programming with go to Statements](https://oamonitor.ireland.openaire.eu/national/search/publication?pid=10.1145%2F356635.356640)
- PDF copy, [Structured Programming with go to Statements](https://pic.plover.com/knuth-GOTO.pdf)

## 관련 항목

- [[도널드 커누스]]
- [[GOTO 문]]
- [[구조적 프로그래밍]]
- [[제어 구조]]
- [[단계적 정제]]
- [[소프트웨어 공학]]
- [[goto와 점프에서 구조적 프로그래밍으로]]
