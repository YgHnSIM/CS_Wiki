---
title: The FORTRAN Automatic Coding System
aliases: [Backus 1957 FORTRAN paper, FORTRAN automatic coding paper]
summary: "Backus 팀의 1957년 논문을 바탕으로 Fortran 언어와 번역기, 제어 흐름 분석, 인덱스 레지스터 최적화를 정리한 참고 자료."
tags: [type/reference, domain/programming-languages, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-24
publication_year: 1957
historical_layer: software
capability_layers: [programmability, realized-performance]
sources: ["Western Computer Proceedings 1957", "Computer History Museum archive"]
source_id: ref-016
source_kind: external
primary_sources: ["Western Computer Proceedings 1957"]
supporting_sources: ["Computer History Museum archive", "ACM DOI", "Bitsavers copy"]
source_urls: ["https://archive.computerhistory.org/resources/text/Fortran/102663113.05.01.acc.pdf", "https://dl.acm.org/doi/10.1145/1455567.1455599", "https://bitsavers.trailing-edge.com/pdf/ibm/704/FORTRAN_paper_1957.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[The FORTRAN Automatic Coding System]]은 [[존 배커스]]를 비롯한 IBM FORTRAN 팀이 1957년에 발표한 논문이다. 이 문헌은 FORTRAN 프로젝트가 1954년 여름에 시작되었고, 과학·공학 문제를 IBM 704용 프로그램으로 준비하는 비용과 시간을 크게 줄이는 것을 목표로 했다고 설명한다.

논문의 핵심은 FORTRAN이 언어와 번역기를 함께 갖춘 시스템이라는 점이다. 사용자는 수학식에 가까운 언어로 수치 절차를 쓰고, 번역기 또는 executive routine이 이를 704 프로그램으로 변환한다. 따라서 Fortran은 고급 [[프로그래밍 언어]]의 역사인 동시에 [[컴파일러]]의 역사다.

## 주요 인사이트

- 프로젝트의 목표는 프로그래머가 수치 절차를 수학에 가까운 간결한 언어로 지정하면, 효율적인 704 프로그램을 자동으로 얻는 것이었다.
- FORTRAN 시스템은 프로그램을 쓰는 언어와 이를 704 프로그램으로 번역하는 루틴이라는 두 구성요소로 설명된다.
- 번역기는 산술식 처리, `DO`와 첨자 변수에서 생기는 인덱싱 처리, 목적 프로그램 병합, 제어 흐름 분석, 704의 세 인덱스 레지스터로의 변환, 재배치 가능한 바이너리 조립 단계를 포함했다.
- 산술식 번역뿐 아니라 반복, 첨자, 입출력, `FORMAT` 같은 "housekeeping" 작업이 번역기의 큰 부담이었다.
- Fortran의 성공은 편리한 문법만이 아니라, 출력 프로그램의 효율과 소스 수준 디버깅 가능성에 달려 있었다.

## 위키 반영

이 자료는 [[컴파일러 최적화]]와 [[Fortran과 컴파일러]]의 중심 근거다. 특히 초기 컴파일러가 단순한 텍스트 치환기가 아니라, 제어 흐름과 레지스터 제약을 분석해 실행 가능한 목적 프로그램을 만드는 복합 소프트웨어였음을 보여준다. 또한 고급 표기가 반복적인 기계어 표현 비용을 줄여도 요구사항·설계·검증 전체의 생산성을 코드량 하나로 판정할 수 없다는 점에서 [[개발자 생산성]]의 역사적 사례로 연결된다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| responds_to | [[프로그래밍 가능성]] | 수식 중심 문제를 기계어로 직접 옮기던 작성·검증 비용에 자동 번역과 최적화로 대응한다. | [[The FORTRAN Automatic Coding System]] |
| enables | [[Fortran]] | 수학에 가까운 소스 표기를 IBM 704 목적 프로그램으로 번역하는 언어·컴파일러 체계를 실현한다. | [[The FORTRAN Automatic Coding System]] |

## 출처

- Computer History Museum, [The Fortran Automatic Coding System](https://archive.computerhistory.org/resources/text/Fortran/102663113.05.01.acc.pdf)
- ACM Digital Library, [The FORTRAN Automatic Coding System](https://dl.acm.org/doi/10.1145/1455567.1455599)
- Bitsavers, [FORTRAN paper 1957](https://bitsavers.trailing-edge.com/pdf/ibm/704/FORTRAN_paper_1957.pdf)

## 관련 항목

- [[존 배커스]]
- [[Fortran]]
- [[IBM 704]]
- [[컴파일러]]
- [[컴파일러 최적화]]
- [[목적 프로그램]]
- [[자동 프로그래밍]]
- [[Fortran과 컴파일러]]
