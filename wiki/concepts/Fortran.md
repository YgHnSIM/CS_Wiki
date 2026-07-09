---
title: Fortran
aliases: [FORTRAN, Formula Translation, 포트란]
tags: [type/concept, domain/programming-languages, domain/computer-history, status/active]
created: 2026-05-04
updated: 2026-07-10
sources: ["초기 소프트웨어의 탄생.md", "초기 소프트웨어의 탄생_해설.md", "FORTRAN Automatic Coding System for the IBM 704 EDPM", "The FORTRAN Automatic Coding System", "The History of FORTRAN I, II, and III"]
status: active
---

## 개요

[[Fortran]]은 수학적 수식과 과학 계산의 표현을 기계 실행 절차로 번역하려 한 초기 고급 [[프로그래밍 언어]]다. 이름은 Formula Translation에서 왔고, 초기 FORTRAN 시스템은 [[IBM 704]]에서 실행되는 자동 코딩 시스템으로 설계되었다.

## 언어와 컴파일러

Fortran의 중요성은 프로그래밍을 기계 내부 상태를 직접 지시하는 일에서, 사람이 쓰는 수학적 표현을 번역하는 일로 옮긴 데 있다. 사용자는 FORTRAN 언어로 [[소스 프로그램]]을 작성하고, FORTRAN 시스템은 이를 704 기계어 [[목적 프로그램]]으로 바꾸었다. 이 점에서 Fortran은 언어와 [[컴파일러]]가 함께 실용화된 사례다.

초기 문헌은 Fortran 목적 프로그램이 좋은 프로그래머가 손으로 작성한 코드에 가까운 효율을 내야 한다는 기대를 분명히 제시한다. 그래서 Fortran의 성공은 문법의 편의성만이 아니라 [[컴파일러 최적화]]와도 연결된다.

## 언어 기능

초기 Fortran은 산술식, 변수, 배열 첨자, 함수, `DO` 반복, `IF`, `GO TO`, 입출력, `FORMAT`, 라이브러리 루틴 결합을 제공했다. 특히 `DO` 문과 첨자 변수는 과학 계산의 반복과 배열 처리를 기계 명령 수준의 주소 계산에서 분리했다.

Fortran의 `GO TO`는 후대의 [[구조적 프로그래밍]] 논쟁과도 연결된다. 초기 Fortran은 실용적인 수치 계산 표현을 제공했지만, 이후 프로그래밍 언어 설계는 이런 제어 흐름을 더 구조화된 [[제어 구조]]로 제한하는 방향으로 발전했다.

## 의미

Fortran은 [[Initial Orders]]에서 보이던 인간 표기와 기계 실행 사이의 번역 계층이 더 높은 수준의 언어 설계로 확장된 사례다. 동시에 [[자동 프로그래밍]]이 주소 보정과 서브루틴 조립을 넘어, 수식과 반복 구조 전체를 목적 프로그램으로 변환하는 컴파일러 체계로 발전할 수 있음을 보여준다.

## 출처

- [[초기 소프트웨어의 탄생]]
- [[FORTRAN Automatic Coding System for the IBM 704 EDPM]]
- [[The FORTRAN Automatic Coding System]]
- [[The History of FORTRAN I, II, and III]]

## 관련 항목

- [[존 배커스]]
- [[IBM 704]]
- [[프로그래밍 언어]]
- [[컴파일러]]
- [[소스 프로그램]]
- [[목적 프로그램]]
- [[컴파일러 최적화]]
- [[자동 프로그래밍]]
- [[제어 구조]]
- [[기호 조작]]
- [[소프트웨어 공학]]
- [[초기 소프트웨어의 계층화]]
- [[Fortran과 컴파일러]]
