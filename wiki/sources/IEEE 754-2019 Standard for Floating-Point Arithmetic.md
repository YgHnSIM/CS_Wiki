---
title: IEEE 754-2019 Standard for Floating-Point Arithmetic
aliases: [IEEE 754-2019, IEEE Standard for Floating-Point Arithmetic, IEEE 부동소수점 표준]
summary: "이진·십진 부동소수점의 교환·산술 형식과 연산 방법, 예외 조건을 규정하는 현행 IEEE 754-2019의 공개 범위와 보장 경계를 정리한 공식 표준 기록."
tags: [type/reference, domain/computer-architecture, domain/mathematics, status/active]
created: 2026-07-16
updated: 2026-07-16
sources: ["IEEE 754-2019 official standard record", "IEEE P754 official project record", "ISO/IEC/IEEE 60559-2020 official standard record", "IEEE SA copyright and permissions policy"]
source_id: ref-051
source_kind: external
primary_sources: ["IEEE 754-2019 official standard record", "IEEE P754 official project record", "ISO/IEC/IEEE 60559-2020 official standard record"]
supporting_sources: ["IEEE SA copyright and permissions policy"]
source_urls: ["https://standards.ieee.org/ieee/754/6210/", "https://standards.ieee.org/ieee/754/11684/", "https://standards.ieee.org/ieee/60559/10226/", "https://standards.ieee.org/ipr/stdspermission/"]
retrieved: 2026-07-16
version: "IEEE Std 754-2019; P754 revision project active as of 2026-07-16"
snapshot_status: external-only
status: active
---

## 개요

[[IEEE 754-2019 Standard for Floating-Point Arithmetic]]은 컴퓨터 프로그래밍 환경에서 이진·십진 부동소수점의 교환 형식, 산술 형식과 연산 방법을 규정하는 현행 IEEE 표준의 공식 기록이다. IEEE Standards Association은 이 판본을 `Active Standard`로 표시하며, 754-2008을 대체한 표준으로 기록한다. IEEE Standards Board 승인일은 2019년 6월 13일, 발행일은 2019년 7월 22일이다.

공개된 공식 범위는 부동소수점 형식과 산술 방법, 예외 조건과 기본 처리 방식을 포함한다. 구현은 하드웨어, 소프트웨어 또는 둘의 결합일 수 있다. 이 점은 부동소수점 의미가 특정 프로세서 회로에만 속하지 않고 언어 실행 환경과 소프트웨어 구현까지 공유할 수 있는 인터페이스임을 보여준다.

## 무엇을 결정하는가

IEEE의 공개 설명에 따르면 규범부가 지정한 연산의 수치 결과와 예외는 다음 조건이 정해졌을 때 유일하게 결정된다.

- 입력 데이터의 값
- 수행한 연산의 순서
- 결과를 저장할 목적 형식
- 표준이 사용자 제어 대상으로 둔 관련 선택

이 조건 목록은 보장의 강도와 한계를 동시에 보여준다. 같은 입력이라도 컴파일러가 식을 다른 순서로 평가하거나 병렬 합산 순서가 바뀌거나 중간 결과의 목적 형식이 달라지면, 서로 다른 결과가 표준 위반 없이 나올 수 있다. IEEE 754 준수는 지정된 연산의 의미를 공통화하지만 임의의 두 프로그램 실행이 마지막 비트까지 같다는 보장은 아니다.

또한 표준 연산이 정해져 있다고 해서 전체 수치 알고리즘이 참값에 충분히 가깝다는 뜻은 아니다. 알고리즘의 조건과 안정성, 입력 오차, 라이브러리, 종료 조건과 결과 검증은 별도의 층위다. 이 산술 규범이 [[부동소수점 정확성]]을 추론할 토대를 제공하고, 프로그램과 벤치마크가 그 위에 더 구체적인 정확성 계약을 세운다.

## 판본과 개정 상태

- `IEEE 754-1985`는 초기 이진 부동소수점 표준이며 2008년판에 대체되었다.
- `IEEE 754-2008`은 2019년판에 대체되었다.
- `IEEE 754-2019`가 2026년 7월 16일 현재 활성 표준이다.
- `ISO/IEC/IEEE 60559-2020`은 IEEE 754-2019를 국제표준으로 채택한 판본이며 더 최신인 별도 기술 개정으로 세지 않는다.
- `P754`는 2024년 6월 6일 승인된 차기 전면 개정 프로젝트인 `Active PAR`다. 아직 발행 표준이 아니므로 754-2019를 대체하지 않는다.

IEEE의 공개 카탈로그에는 754-2019에 별도 amendment나 corrigendum이 표시되지 않는다. 향후 P754가 실제 표준으로 발행되면 판본 상태를 다시 확인해야 한다.

## 자료 범위와 저작권 경계

이 페이지는 IEEE SA가 공개한 표준·프로젝트 메타데이터와 공개 초록의 범위만 요약한다. 구매 또는 구독이 필요한 표준 전문의 조항, 표, 그림이나 형식 표를 재현·번역하지 않는다. IEEE의 표준 재사용 정책에 따르면 표준 본문의 복제·번역에는 별도 허가가 필요하므로, 이 위키는 원문 PDF를 `raw/`에 배포하지 않고 `snapshot_status: external-only`로 관리한다.

세부 산술을 학습할 때는 역사적 해설인 [[What Every Computer Scientist Should Know About Floating-Point Arithmetic]]과 함께 읽되, 그 논문이 설명하는 표준은 754-1985라는 점을 유지한다. 현재 준수 여부를 판단해야 하는 구현 작업에서는 반드시 754-2019의 정식 표준 문서와 해당 언어·플랫폼 규칙을 확인해야 한다.

## 주요 인사이트

- 현행 판본은 IEEE 754-2019이며 P754는 진행 중인 개정 프로젝트다.
- 표준은 이진·십진 형식, 산술 방법, 예외 조건과 기본 처리를 공통화한다.
- 규정 연산의 결정성은 입력값, 연산 순서와 목적 형식이 정해졌다는 조건을 포함한다.
- 표준 준수, 전체 프로그램의 비트 재현성과 알고리즘의 수치 정확성은 서로 다른 주장이다.
- 하드웨어와 소프트웨어 구현이 같은 산술 인터페이스를 공유하게 한 것이 역사적 핵심이다.

## 위키 반영

이 자료는 [[부동소수점 정확성]]에서 산술 규범과 전체 프로그램의 정확성 계약을 구분하는 직접 근거다. [[더 빠른 계산은 같은 답을 내는가]]에서는 연산 순서를 바꾸는 최적화와 병렬화가 왜 성능뿐 아니라 결과 동등성의 정의를 요구하는지 분석한다.

## 출처

- IEEE Standards Association, [IEEE 754-2019](https://standards.ieee.org/ieee/754/6210/)
- IEEE Standards Association, [P754 revision project](https://standards.ieee.org/ieee/754/11684/)
- IEEE Standards Association, [ISO/IEC/IEEE 60559-2020](https://standards.ieee.org/ieee/60559/10226/)
- IEEE Standards Association, [Copyright and permissions](https://standards.ieee.org/ipr/stdspermission/)

## 관련 항목

- [[What Every Computer Scientist Should Know About Floating-Point Arithmetic]]
- [[부동소수점 정확성]]
- [[컴파일러 최적화]]
- [[The Linpack Benchmark]]
- [[SPEC CPU 2026 Overview]]
- [[더 빠른 계산은 같은 답을 내는가]]
