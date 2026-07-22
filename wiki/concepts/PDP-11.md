---
title: PDP-11
aliases: [DEC PDP-11, PDP-11/40, PDP-11/45]
summary: "초기 Unix와 C 언어가 실용화된 DEC 미니컴퓨터 계열."
tags: [type/concept, domain/computer-history, domain/computer-architecture, status/review]
created: 2026-07-10
updated: 2026-07-22
sources: ["The UNIX Time-Sharing System", "The Development of the C Language", "The Evolution of the Unix Time-sharing System", "Portability of C Programs and the UNIX System"]
status: review
graph_id: concept-18a0ce4363c25093
event_start: 1970
historical_layer: machine
historical_note: "PDP-11이 출시된 1970년을 대표 시점으로 둔다."
---

## 개요

[[PDP-11]]은 초기 [[Unix]]와 [[C 언어]]가 실용화된 DEC의 미니컴퓨터 계열이다. 1974년 Unix 논문은 Unix를 PDP-11/40과 PDP-11/45에서 동작하는 운영체제로 설명한다.

## C와의 관계

PDP-11은 C의 발전에 중요한 영향을 주었다. B와 BCPL의 단일 워드 중심 모델은 바이트 주소 지정과 문자 처리, 포인터 표현에서 한계를 드러냈고, Ritchie는 이를 해결하기 위해 `char`와 타입 구조를 갖춘 C를 발전시켰다.

다만 C의 모든 문법이 PDP-11의 기능에서 직접 나온 것은 아니다. 예를 들어 `++`와 `--`는 PDP-11 이전 B에서 이미 등장했으며, Ritchie는 이를 역사적 오해로 구분한다.

## 출처

- [[The UNIX Time-Sharing System]]
- [[The Development of the C Language]]
- [[The Evolution of the Unix Time-sharing System]]
- [[Portability of C Programs and the UNIX System]]

## 관련 항목

- [[Unix]] — 파일, 프로세스, 셸, 파이프, 시스템 호출을 중심으로 구성된 Bell Labs의 다중 사용자 대화형 운영체제.
- [[C 언어]] — Unix 구현을 위해 발전한 시스템 프로그래밍 언어로, 포인터와 바이트 단위 제어를 고급 언어 구조와 결합한 언어.
- [[시스템 프로그래밍]] — 운영체제, 컴파일러, 셸, 장치 제어처럼 기반 소프트웨어를 작성하는 프로그래밍 영역.
- [[데니스 리치]] — C 언어를 설계하고 Unix 개발에 참여해 운영체제 구현 언어와 이식성의 전환을 이끈 Bell Labs 연구자.
- [[켄 톰프슨]] — 초기 Unix 개발과 B 언어를 주도하며 Unix와 C 언어 흐름의 바탕을 만든 Bell Labs 연구자.
