---
title: FORTRAN Automatic Coding System for the IBM 704 EDPM
aliases: [FORTRAN Programmer's Reference Manual, IBM 704 FORTRAN Manual, FORTRAN 704 Reference Manual]
tags: [type/reference, domain/programming-languages, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["IBM 704 Programmer's Reference Manual 1956", "Computer History Museum archive"]
source_id: ref-015
source_kind: external
primary_sources: ["IBM 704 Programmer's Reference Manual 1956"]
supporting_sources: ["Computer History Museum archive", "IBM history page"]
source_urls: ["https://archive.computerhistory.org/resources/text/Fortran/102649787.05.01.acc.pdf", "https://www.ibm.com/history/fortran"]
retrieved: 2026-07-10
version: "1956-10-15"
snapshot_status: external-only
status: active
---

## 개요

[[FORTRAN Automatic Coding System for the IBM 704 EDPM]]은 IBM이 1956년 10월 15일에 낸 [[IBM 704]]용 [[Fortran]] 프로그래머 참고 매뉴얼이다. 이 문헌은 FORTRAN을 "수학 공식 번역 시스템"이자 자동 코딩 시스템으로 설명하며, [[소스 프로그램]]을 받아 704 기계어 [[목적 프로그램]]을 만들어내는 프로그램으로 정의한다.

이 매뉴얼의 중요성은 Fortran을 단순한 문법이 아니라 실행 가능한 시스템으로 보여준다는 데 있다. 사용자는 수학 표기에 가까운 언어로 계산 절차를 쓰고, FORTRAN 시스템은 이를 실제 704에서 실행할 기계어 프로그램으로 바꾼다.

## 주요 인사이트

- FORTRAN은 704 프로그램이며, FORTRAN 언어로 쓴 소스 프로그램을 받아 704 기계어 목적 프로그램을 산출한다.
- 매뉴얼은 목적 프로그램이 좋은 프로그래머가 손으로 작성한 코드에 가까운 효율을 낼 것이라고 제시한다.
- 언어에는 산술식, 함수, 배열 첨자, `DO`, `IF`, `GO TO`, 입출력, `FORMAT`, 라이브러리 루틴 결합이 포함된다.
- `FREQUENCY` 문은 분기나 반복의 예상 빈도를 알려 주어 목적 프로그램의 인덱스 레지스터 사용 최적화에 도움을 주는 장치였다.
- Fortran의 컴파일러 관점은 기계어 작성 부담을 줄이는 데서 끝나지 않고, 오류를 소스 수준에서 발견하고 수정하게 하는 개발 방식의 변화로 이어진다.

## 위키 반영

이 자료는 [[Fortran]], [[컴파일러]], [[목적 프로그램]], [[컴파일러 최적화]], [[IBM 704]]를 정리하는 데 사용한다. 특히 Fortran의 역사적 의의는 고급 표기를 허용했다는 점뿐 아니라, 그 표기를 실제 기계에서 충분히 빠르게 실행되는 코드로 번역했다는 점에 있다.

## 출처

- Computer History Museum, [The FORTRAN Automatic Coding System for the IBM 704 EDPM](https://archive.computerhistory.org/resources/text/Fortran/102649787.05.01.acc.pdf)
- IBM, [Fortran](https://www.ibm.com/history/fortran)

## 관련 항목

- [[Fortran]]
- [[IBM 704]]
- [[컴파일러]]
- [[소스 프로그램]]
- [[목적 프로그램]]
- [[컴파일러 최적화]]
- [[자동 프로그래밍]]
- [[Fortran과 컴파일러]]
