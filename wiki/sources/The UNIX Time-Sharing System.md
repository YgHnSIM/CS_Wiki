---
title: The UNIX Time-Sharing System
aliases: [UNIX Time-Sharing System, Unix 1974, Ritchie Thompson Unix paper]
tags: [type/reference, domain/computer-history, domain/operating-systems, domain/software-engineering, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["Communications of the ACM 1974", "Bell System Technical Journal reprint"]
source_id: ref-018
source_kind: external
primary_sources: ["Communications of the ACM 1974"]
supporting_sources: ["Bell System Technical Journal reprint", "PDF copy", "Wiley record"]
source_urls: ["https://dl.acm.org/doi/10.1145/361011.361061", "https://dsf.berkeley.edu/cs262/unix.pdf", "https://onlinelibrary.wiley.com/doi/abs/10.1002/j.1538-7305.1978.tb02136.x"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[The UNIX Time-Sharing System]]은 [[데니스 리치]]와 [[켄 톰프슨]]이 1974년에 발표한 [[Unix]] 논문이다. 이 문헌은 Unix를 [[PDP-11]] 계열 컴퓨터에서 동작하는 범용, 다중 사용자, 대화형 [[운영체제]]로 설명하고, 파일 시스템과 사용자 명령 인터페이스를 중심으로 구조를 제시한다.

이 논문에서 중요한 점은 Unix가 거대한 시스템보다 작고 단순한 구조로도 강력한 대화형 환경을 제공할 수 있음을 보였다는 데 있다. 계층적 [[파일 시스템]], 장치와 파일의 통합, 프로세스 간 I/O, 비동기 프로세스, 사용자별 셸, 다양한 유틸리티가 하나의 일관된 환경으로 결합된다.

## 주요 인사이트

- Unix는 계층적 파일 시스템을 중심으로 프로그램과 데이터를 조직한다.
- 일반 파일, 디렉터리, 특수 파일을 통해 디스크 파일과 장치를 같은 I/O 모델로 다룬다.
- [[시스템 호출]]은 파일, 프로세스, 파이프 같은 커널 자원에 접근하는 표준 인터페이스를 제공한다.
- [[유닉스 파이프]]는 관련 프로세스들이 `read`와 `write`를 통해 데이터를 주고받게 하며, 사용자는 이를 파일 I/O와 비슷하게 다룰 수 있다.
- 셸은 명령을 해석하고 프로그램을 실행하는 사용자 수준 프로그램으로 설명된다.

## 위키 반영

이 자료는 [[Unix]], [[운영체제]], [[파일 시스템]], [[시스템 호출]], [[유닉스 파이프]], [[시스템 프로그래밍]]을 정리하는 데 사용한다. [[Unix와 C]] 분석에서는 이 문헌을 통해 Unix의 구조가 C와 결합되기 전부터 파일·프로세스·셸이라는 단순하고 조합 가능한 모델을 갖추고 있었음을 정리한다.

## 출처

- ACM Digital Library, [The UNIX time-sharing system](https://dl.acm.org/doi/10.1145/361011.361061)
- PDF copy, [The UNIX Time-Sharing System](https://dsf.berkeley.edu/cs262/unix.pdf)
- Wiley Online Library, [The UNIX Time-Sharing System](https://onlinelibrary.wiley.com/doi/abs/10.1002/j.1538-7305.1978.tb02136.x)

## 관련 항목

- [[Unix]]
- [[데니스 리치]]
- [[켄 톰프슨]]
- [[PDP-11]]
- [[운영체제]]
- [[파일 시스템]]
- [[시스템 호출]]
- [[유닉스 파이프]]
- [[시스템 프로그래밍]]
- [[Unix와 C]]
