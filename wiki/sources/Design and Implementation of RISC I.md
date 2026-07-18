---
title: Design and Implementation of RISC I
aliases: [RISC I report, UCB/CSD-82-106, Berkeley RISC I]
summary: "초기 VLSI 제약에서 단순하고 규칙적인 명령어 집합, 레지스터 윈도, 컴파일러와 구현 도구를 함께 설계하고 시뮬레이션과 실제 칩의 차이까지 보고한 1982년 기술 보고서."
tags: [type/reference, domain/computer-architecture, domain/computer-history, status/active]
created: 2026-07-16
updated: 2026-07-18
publication_year: 1982
historical_layer: architecture
capability_layers: [realized-performance, resource-efficiency]
sources: ["UC Berkeley Technical Report UCB/CSD-82-106", "UC Berkeley EECS report page", "UC Berkeley Digital Collections record"]
source_id: ref-044
source_kind: external
primary_sources: ["UC Berkeley Technical Report UCB/CSD-82-106"]
supporting_sources: ["UC Berkeley EECS report page", "UC Berkeley Digital Collections record"]
source_urls: ["https://www2.eecs.berkeley.edu/Pubs/TechRpts/1982/5449.html", "https://www2.eecs.berkeley.edu/Pubs/TechRpts/1982/Archive/CSD-82-106.pdf", "https://digicoll.lib.berkeley.edu/record/136008"]
retrieved: 2026-07-16
version: "UCB/CSD-82-106, October 1982"
snapshot_status: external-only
status: active
---

## 개요

[[Design and Implementation of RISC I]]은 Carlo H. Séquin과 David A. Patterson이 1982년에 발표한 UC Berkeley 기술 보고서다. 초기 단일 칩 VLSI의 면적, 배선, 핀과 설계 시간 제약 속에서 명령어 집합, 데이터 경로, 레지스터, 컴파일러와 설계 도구를 함께 선택한 [[축소 명령어 집합 컴퓨터|RISC I]]의 설계와 구현을 다룬다.

보고서의 RISC는 단순히 명령어의 개수가 적다는 뜻이 아니다. 제한된 명령과 주소 지정 방식, 레지스터 간 연산, 메모리를 `LOAD`와 `STORE`로만 접근하는 구조, 규칙적인 고정 길이 형식과 작은 제어부를 결합해 흔한 실행 경로를 짧게 만들려는 설계다. 동시에 컴파일러가 지연 분기 슬롯을 채우고 레지스터를 활용할 수 있어야 이 잠재력이 실제 성능으로 이어진다.

## 작업 부하에서 출발한 설계

연구팀은 C와 Pascal 프로그램의 정적 명령 수보다 실행 중의 동적 빈도를 살폈다. 단순 스칼라 변수와 프로시저 호출이 자주 나타나고, 호출·복귀 과정에서 매개변수와 지역 변수를 메모리로 옮기는 비용이 크다고 보았다. RISC I은 겹치는 레지스터 윈도(register window)를 두어 호출할 때 새 지역 레지스터 집합을 제공하고 인접 호출 사이의 매개변수를 겹치는 영역으로 전달했다.

레지스터 윈도와 지연 분기(delayed jump)는 RISC I의 구체적인 선택이지 모든 RISC의 필수 정의는 아니다. 핵심은 당시의 작업 부하와 VLSI 비용을 바탕으로 어느 기능을 하드웨어에 둘지, 어느 책임을 컴파일러와 소프트웨어에 맡길지 결정했다는 데 있다.

## 단순화가 만든 교환 관계

RISC I의 단순한 제어와 규칙적 데이터 경로는 짧은 사이클, 파이프라인, 설계 검증과 컴파일러 생성을 쉽게 하려는 선택이었다. 그러나 단순화에는 비용도 있었다. 보고서는 고정 길이 인코딩과 지연 슬롯의 `NOP` 때문에 명령어 접근 수와 코드 크기가 늘 수 있다고 인정한다. 데이터 메모리 접근은 줄여도 명령어 인출 부담이 커질 수 있으며, 결론에서는 완전한 효율을 위해 명령어 캐시가 필요하다고 설명한다.

부동소수점 명령이 없는 점도 RISC 일반의 성질이 아니라 RISC I 구현의 범위 선택이다. 저자들은 필요할 때 보조 프로세서가 특수 기능을 맡는 구성을 제안했다. 이 사례는 “복잡성을 제거했다”기보다 ISA, 마이크로아키텍처, 컴파일러, 메모리와 보조 장치 사이에 다시 배분했다고 해석할 수 있다.

## 시뮬레이션과 실제 칩의 차이

보고서의 표 4에서 RISC I 실행 시간은 400ns 기계 사이클을 가정한 시뮬레이션 결과이고, VAX 11/780과 Z8000의 시간은 실제 측정값이다. 비교 대상도 여섯 개 C 프로그램과 당시의 서로 다른 컴파일러에 한정된다. 따라서 이 표는 RISC가 다른 모든 구조보다 본질적으로 빠르다는 실측 증명이 아니다.

실제 RISC I 칩은 처음 예상하지 못한 긴 신호 경로 때문에 목표 사이클에 미치지 못했다. 보고서는 가장 빠른 칩이 진단 프로그램을 1.5MHz 클럭에서 실행했으며, 저자들이 이를 RISC I 명령 하나당 약 2μs로 환산했다고 적는다. 기능 오류가 없는 칩을 얻기까지 여러 제작·검사 문제가 있었고, 타이밍 검증 도구가 더 필요하다는 교훈도 기록했다.

이 차이는 설계상의 최고치와 실제 실리콘의 달성 성능을 구분해야 함을 보여준다. ISA의 규칙성, 회로의 임계 경로, 제조 수율, 테스트, 컴파일러와 작업 부하는 모두 결과에 참여한다.

## 주요 인사이트

- RISC I은 명령 수보다 흔한 실행 경로와 구현 복잡성에 초점을 둔 공동 설계다.
- 레지스터 간 연산과 `LOAD`/`STORE` 구조는 느린 외부 데이터 접근을 줄이려는 선택이었다.
- 컴파일러는 지연 슬롯 채우기, 레지스터 배치와 코드 생성을 통해 하드웨어의 잠재력을 실현한다.
- 단순한 명령어 집합도 코드 크기와 명령어 인출 증가라는 비용을 가질 수 있다.
- 시뮬레이션 성능, 실제 칩 진단 결과와 제한된 벤치마크의 범위를 구분해야 한다.

## 인용할 만한 구절

> 높은 성능은 작은 명령어 집합 하나가 아니라 그에 맞는 마이크로아키텍처와 소프트웨어의 결합에서 나온다.

보고서의 설계 논지를 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[축소 명령어 집합 컴퓨터]]를 “적은 명령어”라는 표어가 아니라 VLSI 면적, 메모리 트래픽, 레지스터, 파이프라인과 [[컴파일러 최적화]] 사이의 복잡성 배분으로 해석하는 직접 근거다. [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]에서는 목표 사이클과 시뮬레이션, 실제 칩의 결과가 달랐던 사례를 통해 잠재 성능과 실현 성능을 구분한다.

## 출처

- UC Berkeley EECS, [report page](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1982/5449.html)
- UC Berkeley EECS, [UCB/CSD-82-106 PDF](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1982/Archive/CSD-82-106.pdf)
- UC Berkeley Digital Collections, [catalog record](https://digicoll.lib.berkeley.edu/record/136008)

## 관련 항목

- [[축소 명령어 집합 컴퓨터]]
- [[컴파일러 최적화]]
- [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]
