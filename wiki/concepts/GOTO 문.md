---
title: GOTO 문
aliases: [goto, go to statement, 점프 문, 무조건 분기]
summary: "프로그램 실행을 지정된 라벨이나 주소로 직접 이동시키는 제어문."
tags: [type/concept, domain/programming-languages, domain/software-engineering, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["A Case against the GO TO Statement", "Structured Programming with go to Statements"]
status: active
---

## 개요

[[GOTO 문]]은 프로그램 실행을 지정된 라벨이나 주소로 직접 이동시키는 제어문이다. 기계어의 분기 명령과 닮았기 때문에 초기 고급 언어에서도 자연스럽게 쓰였지만, 무제한으로 사용하면 프로그램의 [[제어 흐름]]이 텍스트 구조와 어긋나 추적하기 어려워진다.

## 점프와의 차이

모든 점프가 같은 문제를 만드는 것은 아니다. [[Wheeler Jump]]는 [[복귀 주소]]를 만들어 [[서브루틴]] 호출 후 원래 위치로 돌아오기 위한 저수준 구현 기법이었다. 반면 고급 언어의 `goto`는 프로그램 작성자가 임의 위치로 실행을 이동시킬 수 있게 하므로, 프로그램 구조를 언어가 제한해 주지 않을 때 복잡성이 빠르게 커질 수 있다.

## 논쟁의 핵심

Dijkstra의 비판은 `goto`가 계산 능력에 필요 없다는 주장에 머물지 않는다. 더 중요한 문제는 무제한 `goto`가 실행 진행을 설명할 독립적 좌표계를 흐리게 만든다는 점이다. Knuth는 이후 논쟁을 정리하며, 더 나은 반복 구문과 오류 탈출 구문이 많은 `goto` 사용을 대체할 수 있지만 모든 경우를 단순 금지 규칙으로 처리하는 것도 충분하지 않다고 보았다.

## 출처

- [[A Case against the GO TO Statement]]
- [[Structured Programming with go to Statements]]

## 관련 항목

- [[제어 흐름]]
- [[제어 구조]]
- [[구조적 프로그래밍]]
- [[구조화 프로그램 정리]]
- [[Wheeler Jump]]
- [[goto와 점프에서 구조적 프로그래밍으로]]
- [[도널드 커누스]]
- [[소프트웨어 공학]]
- [[에츠허르 데이크스트라]]
- [[주세페 야코피니]]
- [[프로그래밍 언어]]
