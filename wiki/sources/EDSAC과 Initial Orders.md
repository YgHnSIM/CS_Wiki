---
title: EDSAC과 Initial Orders
aliases: [EDSAC Initial Orders source]
summary: "Initial Orders를 초기 로더·어셈블러·재배치 로더·원시적 링커로 해석하고 EDSAC의 실행 계층을 정리한 소스."
tags: [type/source, domain/computer-history, domain/software-engineering, status/active]
created: 2026-05-04
updated: 2026-07-10
sources: ["EDSAC과 Initial Orders.md", "EDSAC과 Initial Orders_해설.md"]
source_id: src-003
source_kind: raw
primary_sources: ["EDSAC과 Initial Orders.md"]
supporting_sources: ["EDSAC과 Initial Orders_해설.md"]
source_urls: []
retrieved: 2026-07-10
version: null
snapshot_status: local
status: active
---

## 핵심 요약

[[EDSAC]]과 [[Initial Orders]]는 초기 저장 프로그램 컴퓨터에서 프로그램 실행을 가능하게 한 하드웨어와 소프트웨어의 결합 사례다. 이 소스는 EDSAC 자체보다 종이 테이프의 문자 표기를 읽고, 명령어로 조립하고, 메모리에 적재한 뒤 실행을 넘기는 Initial Orders의 역할을 중심에 둔다.

Initial Orders 1은 약 31개의 명령으로 [[로더]]와 [[어셈블러]]의 핵심 기능을 수행했다. `A100S` 같은 사람이 읽을 수 있는 명령 표기는 opcode, 주소, 길이 비트로 조립되어 메모리에 저장되었고, 저장 위치는 `m[25]`의 저장 명령을 고치는 [[자기 수정 코드]]로 갱신되었다.

Initial Orders 2는 고정 주소의 한계를 넘어 [[재배치]] 기능을 도입했다. `θ`는 현재 서브루틴이 적재되는 기준 주소를 뜻하며, 상대 주소에 `θ`를 더해 실제 주소를 만든다. 이 방식은 현대 [[링커]]나 로더의 완전한 기능을 갖춘 것은 아니지만, 위치에 덜 종속적인 서브루틴 로딩과 초기 링킹의 원형을 보여준다.

또한 이 소스는 [[Wheeler Jump]]를 [[서브루틴]] 호출과 모듈화의 초기 형태로 연결한다. EDSAC에는 현대적 `CALL`/`RET` 명령이 없었기 때문에, 복귀 주소를 명령어 안에 만들어 넣는 방식이 사용되었다. 이는 명령어도 메모리의 값이라는 [[저장 프로그램 컴퓨터]]의 성질을 적극적으로 활용한 사례다.

## 주요 인사이트

- Initial Orders는 단순한 입력 루틴이 아니라, 로더와 어셈블러가 아직 분화되기 전의 압축된 소프트웨어 계층이다.
- `m[25]` 자기 수정 저장 명령은 현대적 관점에서 적재 포인터 갱신에 해당한다.
- Initial Orders 2의 `θ`는 주소를 적재 시점에 결정하게 하여 서브루틴 재사용의 기반을 넓혔다.
- IO2는 완전한 현대 링커가 아니라, 순차적 결합과 주소 보정을 수행하는 원시적 링커로 보는 편이 정확하다.
- EDSAC 사례는 프로그램을 실행하기 위해 또 다른 프로그램이 필요하다는 소프트웨어 계층화의 초기 증거다.

## 인용할 만한 구절

> Initial Orders는 이 둘을 분리된 프로그램으로 갖고 있지 않았다. 작은 초기 명령열 하나가 로더이면서 어셈블러였다.

> Initial Orders 2는 주소를 나중에 결정하는 프로그래밍을 가능하게 한 초기 시스템이다.

> 소프트웨어는 기계 명령의 나열에서 시작했지만, 곧바로 "명령을 다루는 명령", "코드를 배치하는 코드", "복귀 주소를 만들어내는 코드"로 발전했다.

## 관련 위키 페이지

- [[EDSAC]]
- [[Initial Orders]]
- [[로더]]
- [[어셈블러]]
- [[자기 수정 코드]]
- [[재배치]]
- [[링커]]
- [[Wheeler Jump]]
- [[초기 소프트웨어의 계층화]]

## 출처

- `raw/EDSAC과 Initial Orders.md`
- `raw/EDSAC과 Initial Orders_해설.md`

## 관련 항목

- [[초기 소프트웨어의 탄생]]
- [[저장 프로그램 컴퓨터]]
- [[서브루틴]]
- [[라이브러리]]
