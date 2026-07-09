---
title: Fortran과 컴파일러
aliases: [FORTRAN과 컴파일러, Fortran compiler, Fortran and compiler]
tags: [type/analysis, domain/programming-languages, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["FORTRAN Automatic Coding System for the IBM 704 EDPM", "The FORTRAN Automatic Coding System", "The History of FORTRAN I, II, and III"]
status: active
---

## 핵심 주장

[[Fortran과 컴파일러]]는 Fortran의 역사적 의미를 고급 [[프로그래밍 언어]] 하나의 등장보다 넓게 본다. Fortran은 사람이 쓰는 수학적 절차를 [[소스 프로그램]]으로 만들고, [[컴파일러]]가 이를 [[IBM 704]]의 [[목적 프로그램]]으로 바꾸는 체계를 실용화했다. 핵심은 "쓰기 쉬운 언어"와 "충분히 효율적인 번역기"가 동시에 필요했다는 점이다.

## 전환 구조

| 층위 | Fortran 이전의 부담 | Fortran의 전환 |
|---|---|---|
| 표현 | 기계어·어셈블리 언어 중심 | 수학식, 배열, 함수, 반복으로 표현 |
| 번역 | 사람이 기계 명령과 주소를 직접 관리 | 컴파일러가 소스 프로그램을 목적 프로그램으로 변환 |
| 최적화 | 숙련 프로그래머가 손으로 수행 | 번역기가 식, 반복, 인덱스 사용을 분석 |
| 디버깅 | 기계 상태와 명령 수준 추적 | 소스 문장과 출력 결과 중심의 오류 수정 |
| 신뢰 | 고급 표기는 느릴 것이라는 의심 | 손코딩에 가까운 효율을 목표로 설계 |

## 분석

초기 자동 프로그래밍은 주소 보정, 서브루틴 조립, 부동 주소 처리처럼 기계어 프로그래밍의 사무적 부담을 줄이는 방향으로 시작했다. [[The Preparation of Programs for an Electronic Digital Computer]]에서 보이는 [[자동 프로그래밍]]은 이 흐름의 초기 단계다. Fortran은 이 흐름을 더 높은 수준으로 끌어올려, 사용자가 문제를 수학에 가까운 언어로 쓰고 시스템이 실제 기계 프로그램을 만들게 했다.

1956년 IBM 704 매뉴얼은 FORTRAN을 704에서 실행되는 프로그램으로 설명한다. 이 프로그램은 FORTRAN 언어 소스를 받아 704 기계어 목적 프로그램을 만든다. 이 정의는 현대 컴파일러 개념의 핵심과 맞닿아 있다. 소스 언어, 목적 언어, 번역기, 실행 대상 기계가 분명하게 구분되기 때문이다.

1957년 논문은 컴파일러가 단순한 문장 변환기가 아니었음을 보여준다. 번역기는 산술식뿐 아니라 `DO` 반복, 첨자 변수, 입출력, FORMAT, 제어 흐름, 인덱스 레지스터 제약을 처리했다. 즉 Fortran 컴파일러의 어려움은 수학식을 기계 명령으로 옮기는 일보다, 사람이 숨기고 싶어 하는 "bookkeeping"을 기계가 대신 처리하게 만드는 데 있었다.

따라서 Fortran의 성공은 [[컴파일러 최적화]]와 분리할 수 없다. 고급 언어가 편하더라도 목적 프로그램이 지나치게 느리면 과학·공학 계산 사용자에게 받아들여지기 어렵다. Fortran은 컴파일러가 기계의 세부 제약을 흡수하면서도 실행 효율을 유지할 수 있음을 보여 주어, 고급 언어의 실용성을 설득했다.

## 의미

Fortran 이후 프로그래밍의 중심은 사람이 기계 명령을 직접 나열하는 일에서, 사람이 읽을 수 있는 프로그램 텍스트와 이를 처리하는 도구 체계를 함께 설계하는 일로 옮겨간다. 이 변화는 [[어셈블러]], [[링커]], 컴파일러, 빌드 도구, IDE, 정적 분석기까지 이어지는 소프트웨어 도구 사슬의 출발점으로 볼 수 있다.

## 출처

- [[FORTRAN Automatic Coding System for the IBM 704 EDPM]]
- [[The FORTRAN Automatic Coding System]]
- [[The History of FORTRAN I, II, and III]]

## 관련 항목

- [[Fortran]]
- [[존 배커스]]
- [[IBM 704]]
- [[컴파일러]]
- [[소스 프로그램]]
- [[목적 프로그램]]
- [[컴파일러 최적화]]
- [[자동 프로그래밍]]
- [[프로그래밍 언어]]
- [[소프트웨어 공학]]
