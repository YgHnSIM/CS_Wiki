---
title: Unix
aliases: [UNIX, 유닉스]
summary: "파일, 프로세스, 셸, 파이프, 시스템 호출을 중심으로 구성된 Bell Labs의 다중 사용자 대화형 운영체제."
tags: [type/concept, domain/operating-systems, domain/computer-history, domain/software-engineering, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["The UNIX Time-Sharing System", "The Development of the C Language", "The Evolution of the Unix Time-sharing System", "Portability of C Programs and the UNIX System"]
status: active
graph_id: concept-092a889f122121cb
event_start: 1969
historical_layer: system
historical_note: "초기 Unix 시스템 개발이 시작된 1969년을 대표 시점으로 둔다."
---

## 개요

[[Unix]]는 Bell Labs에서 개발된 범용, 다중 사용자, 대화형 [[운영체제]]다. 초기 Unix는 작은 하드웨어 환경에서 출발했지만, 계층적 [[파일 시스템]], 프로세스, 셸, [[유닉스 파이프]], 장치와 파일의 통합 같은 단순한 모델을 통해 강력한 도구 환경을 제공했다.

## 구조

Unix의 핵심은 모든 기능을 하나의 거대한 프로그램 안에 넣기보다, 작은 프로그램과 일관된 인터페이스를 조합할 수 있게 만든 데 있다. 파일은 특별한 내부 구조를 강요받지 않고 바이트열처럼 취급되며, 장치도 특수 파일로 노출된다. 프로세스는 `fork` 같은 [[시스템 호출]]을 통해 생성되고, 파이프는 프로세스 사이의 데이터를 파일 I/O와 비슷한 방식으로 연결한다.

## C와의 결합

초기 Unix는 어셈블리 언어로 시작했지만, 1973년 커널을 [[C 언어]]로 다시 작성하면서 현대적 형태를 갖추었다. 이 전환은 Unix가 특정 기계의 어셈블리 코드에 묶이지 않고, C 컴파일러와 함께 다른 기계로 옮겨질 수 있는 기반을 만들었다.

## 출처

- [[The UNIX Time-Sharing System]]
- [[The Development of the C Language]]
- [[The Evolution of the Unix Time-sharing System]]
- [[Portability of C Programs and the UNIX System]]

## 관련 항목

- [[데니스 리치]] — C 언어를 설계하고 Unix 개발에 참여해 운영체제 구현 언어와 이식성의 전환을 이끈 Bell Labs 연구자.
- [[켄 톰프슨]] — 초기 Unix 개발과 B 언어를 주도하며 Unix와 C 언어 흐름의 바탕을 만든 Bell Labs 연구자.
- [[PDP-11]] — 초기 Unix와 C 언어가 실용화된 DEC 미니컴퓨터 계열.
- [[운영체제]] — 하드웨어 자원과 사용자 프로그램 사이에서 파일, 프로세스, 장치, 입출력을 관리하는 시스템 소프트웨어.
- [[파일 시스템]] — 파일 이름, 디렉터리, 저장 위치, 접근 권한, 장치 연결을 관리하는 운영체제 구성 요소.
