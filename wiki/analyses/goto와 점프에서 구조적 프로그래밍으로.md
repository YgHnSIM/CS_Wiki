---
title: goto와 점프에서 구조적 프로그래밍으로
aliases: [goto/점프에서 구조적 프로그래밍으로, jump to structured programming, goto에서 구조적 프로그래밍으로]
tags: [type/analysis, domain/software-engineering, domain/programming-languages, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["A Case against the GO TO Statement", "Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules", "Structured Programming", "Structured Programming with go to Statements"]
status: active
---

## 핵심 주장

[[goto와 점프에서 구조적 프로그래밍으로]]는 제어 흐름의 역사를 "어디로 뛰는가"에서 "어떤 구조 안에서 실행이 진행되는가"로 옮겨 보는 분석이다. 초기 컴퓨터의 점프는 실행을 구현하는 필수 장치였지만, 고급 언어의 무제한 [[GOTO 문]]은 프로그램 이해를 어렵게 만들었다. [[구조적 프로그래밍]]은 이 문제를 계산 능력의 문제가 아니라 이해 가능성과 검증 가능성의 문제로 재정의했다.

## 계층별 전환

| 층위 | 대표 형태 | 핵심 문제 |
|---|---|---|
| 기계 점프 | 주소 분기, 명령어 점프 | 다음에 실행할 위치를 바꾸는 방법 |
| 호출 점프 | [[Wheeler Jump]], [[복귀 주소]], [[스택]] | 호출 후 어디로 돌아올 것인가 |
| 언어 표면 | [[GOTO 문]], 라벨 | 실행 흐름이 텍스트 구조와 어떻게 대응되는가 |
| 구조화 | [[제어 구조]], 순차·선택·반복 | 사람이 추적 가능한 실행 경로를 어떻게 보장할 것인가 |
| 설계 방법 | [[단계적 정제]], 프로그램 변환 | 올바르고 읽기 쉬운 구조를 어떻게 효율적 구현으로 다듬을 것인가 |

## 분석

초기 컴퓨터에서 점프는 선택 사항이 아니라 실행 자체의 일부였다. [[EDSAC]]의 [[Wheeler Jump]]는 단순한 분기가 아니라, 호출 위치 다음으로 돌아오기 위한 복귀 점프를 만들어내는 기법이었다. 이 단계의 문제는 제어 흐름을 어떻게 구현할 것인가였다.

고급 언어의 `goto` 논쟁은 다른 문제를 드러냈다. 프로그램 작성자가 어디로든 직접 이동할 수 있으면, 실행 과정은 더 이상 텍스트의 중첩 구조와 잘 맞지 않는다. Dijkstra가 문제 삼은 지점은 바로 이 간극이다. 프로그램을 어느 지점까지 실행했는지 설명할 의미 있는 좌표가 사라지면, 변수 값의 의미와 프로그램의 올바름도 설명하기 어려워진다.

[[Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules]]는 `goto` 없이도 계산 절차를 표현할 수 있다는 이론적 배경을 제공한다. 그러나 이 정리는 표현 가능성을 말할 뿐, 자동으로 좋은 프로그램을 만들어주지는 않는다. 임의 흐름도를 기계적으로 점프 없는 형태로 바꾸어도, 구조가 투명하지 않으면 실천적 가치는 낮다.

1970년대의 구조적 프로그래밍 논의는 이론을 방법론으로 옮긴다. [[Structured Programming]]은 프로그램을 이해 가능한 단위로 나누고, 작은 구조의 올바름을 쌓아 전체 프로그램을 구성하려는 방향을 제시했다. [[Structured Programming with go to Statements]]는 여기에 균형을 더한다. 핵심은 `goto`라는 단어를 금지하는 것이 아니라, 반복, 오류 탈출, 다중 선택 같은 흐름을 더 명확한 제어 구조로 표현하고 필요한 경우 올바름을 보존하며 효율적인 코드로 변환하는 것이다.

## 의미

따라서 `goto/점프`에서 구조적 프로그래밍으로의 전환은 제어 명령 하나의 유행 변화가 아니다. 그것은 소프트웨어가 기계 실행을 직접 지시하는 명령열에서, 사람이 읽고 추론하고 검증할 수 있는 구조적 텍스트로 바뀌는 과정이다. 이 전환은 [[프로그래밍 언어]] 설계, [[소프트웨어 공학]], 테스트와 검증, API와 모듈화의 역사와 직접 연결된다.

## 출처

- [[A Case against the GO TO Statement]]
- [[Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules]]
- [[Structured Programming]]
- [[Structured Programming with go to Statements]]

## 관련 항목

- [[GOTO 문]]
- [[제어 흐름]]
- [[제어 구조]]
- [[구조적 프로그래밍]]
- [[구조화 프로그램 정리]]
- [[단계적 정제]]
- [[Wheeler Jump]]
- [[복귀 주소]]
- [[스택]]
- [[프로그래밍 언어]]
- [[소프트웨어 공학]]
