---
title: API
aliases: [Application Programming Interface, 응용 프로그래밍 인터페이스, 인터페이스]
summary: "기능 제공자와 사용자 사이의 동작, 호출 규약, 비용, 전제 조건을 정리한 프로그래밍 인터페이스."
tags: [type/concept, domain/software-engineering, status/active]
created: 2026-07-09
updated: 2026-07-22
sources: ["The Preparation of Programs for an Electronic Digital Computer", "The UNIX Time-Sharing System", "On the Criteria To Be Used in Decomposing Systems into Modules", "Software Reuse"]
status: active
graph_id: concept-2ff6633d43e61407
---

## 개요

[[API]](Application Programming Interface)는 어떤 기능을 제공하는 코드와 그 기능을 사용하는 코드 사이의 명시적 약속이다. API는 단순한 함수 이름 목록이 아니라, 무엇을 할 수 있는지, 어떻게 호출해야 하는지, 어떤 입력과 출력이 오가는지, 어떤 전제 조건과 비용이 있는지를 정리한 인터페이스다.

## 역사적 전사

[[The Preparation of Programs for an Electronic Digital Computer]]에서 설명된 EDSAC [[라이브러리 카탈로그]]는 API라는 용어를 쓰지는 않지만 API적 사고를 선명하게 보여준다. 사용자는 [[서브루틴]]의 내부 구현이나 정확한 수치 알고리즘을 모두 알 필요 없이, 루틴의 동작과 사용법에 대한 간결한 명세를 보고 프로그램을 구성할 수 있었다.

이때 중요한 것은 구현 코드와 사용 명세의 분리다. 라이브러리는 루틴의 전체 명령열을 보존하지만, 프로그래머에게 우선 필요한 것은 "이 루틴은 무엇을 하고, 어떤 조건에서, 얼마나 많은 시간과 저장 공간을 쓰며, 어떤 정밀도를 제공하는가"였다. 이 분리는 현대 API 문서, 표준 라이브러리 설명, 패키지 문서의 원형에 가깝다.

## 설계 요소

- 이름: 기능을 식별할 수 있는 안정적인 표기.
- 동작 명세: 호출하면 무엇이 일어나는지에 대한 설명.
- 사용 규약: 입력 위치, 출력 위치, 호출 순서, 필요한 전제 조건.
- 비용 정보: 실행 시간, 저장 공간, 정밀도, 부작용.
- 구현 은닉: 내부 명령열을 몰라도 사용할 수 있는 경계.
- 교체 가능성: 같은 기능의 다른 구현을 조건에 따라 선택할 수 있는 구조.

## 현대적 의미

현대 API는 함수 호출, 운영체제 시스템 호출, 웹 API, 라이브러리 패키지, 프레임워크 확장점 등 다양한 형태를 갖는다. 그러나 핵심은 EDSAC 라이브러리와 같다. 복잡한 구현을 직접 다루지 않고, 문서화된 약속을 통해 재사용 가능한 단위를 조합하는 것이다.

[[Unix]]의 [[시스템 호출]]은 운영체제 API의 고전적 사례다. 파일, 장치, 파이프가 파일 디스크립터와 `read`/`write` 같은 공통 호출로 다뤄지면, 프로그램은 커널 내부 구현을 알지 않아도 일관된 인터페이스에 기대어 동작할 수 있다.

API는 [[소프트웨어 공학]]의 추상화와 책임 분리를 구체화한다. 좋은 API는 사용자가 모든 내부 세부를 알지 않아도 올바른 프로그램을 만들 수 있게 하고, 제공자는 내부 구현을 바꾸더라도 약속된 동작을 유지할 수 있게 한다.

[[On the Criteria To Be Used in Decomposing Systems into Modules]]의 [[정보 은닉]] 관점에서 API는 변경 가능한 설계 결정을 감추는 경계다. [[Software Reuse]]의 관점에서는 재사용할 산출물을 선택하고 통합할 수 있게 하는 고수준 설명이다. 따라서 API는 단순 호출 목록이 아니라 [[소프트웨어 재사용]]을 가능하게 하는 계약이다.

## 출처

- [[The Preparation of Programs for an Electronic Digital Computer]]
- [[The UNIX Time-Sharing System]]
- [[On the Criteria To Be Used in Decomposing Systems into Modules]]
- [[Software Reuse]]

## 관련 항목

- [[라이브러리]]
- [[라이브러리 카탈로그]]
- [[서브루틴]]
- [[자동 프로그래밍]]
- [[프로그래밍 언어]]
- [[시스템 호출]]
- [[Unix]]
- [[모듈화]]
- [[정보 은닉]]
- [[소프트웨어 재사용]]
- [[소프트웨어 컴포넌트]]
- [[소프트웨어 공학]]
- [[서브루틴 라이브러리에서 API로]]
- [[소프트웨어 재사용의 역사]]
- [[EDSAC]]
- [[더글러스 매킬로이]]
- [[데이비드 파나스]]
- [[데이비드 휠러]]
- [[모리스 윌크스]]
- [[스탠리 길]]
- [[찰스 W. 크루거]]
- [[초기 소프트웨어의 계층화]]
