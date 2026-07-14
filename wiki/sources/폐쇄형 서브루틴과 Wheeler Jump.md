---
title: 폐쇄형 서브루틴과 Wheeler Jump
aliases: [Closed Subroutine and Wheeler Jump]
summary: "EDSAC의 폐쇄형 서브루틴과 Wheeler Jump의 호출·복귀 구조를 단계별로 설명한 소스."
tags: [type/source, domain/computer-history, domain/software-engineering, status/active]
created: 2026-05-04
updated: 2026-07-10
sources: ["폐쇄형 서브루틴과 Wheeler Jump.md"]
source_id: src-005
source_kind: raw
primary_sources: ["폐쇄형 서브루틴과 Wheeler Jump.md"]
supporting_sources: []
source_urls: []
retrieved: 2026-07-10
version: null
snapshot_status: local
status: active
---

## 핵심 요약

이 소스는 [[EDSAC]]에서 사용된 폐쇄형 [[서브루틴]]과 [[Wheeler Jump]]를 단계별로 설명한다. 핵심 질문은 `CALL`/`RET` 명령과 호출 스택이 없던 환경에서 서브루틴이 어떻게 호출 지점 다음으로 돌아왔는가다.

폐쇄형 서브루틴은 호출, 실행, 복귀까지의 제어 흐름이 하나의 루틴 안에서 완결되는 구조다. 고정된 위치로만 돌아가는 코드는 여러 곳에서 재사용하기 어렵기 때문에, 호출 위치에 따라 다른 [[복귀 주소]]를 만들어내는 방법이 필요했다.

Wheeler Jump는 호출부의 첫 명령 `A m F`를 accumulator에 넣고, 서브루틴 시작부에서 특수 상수 `Memory[3]`을 더해 `E (m+2) F` 형태의 복귀 점프 명령으로 바꾼다. 이어 `T p F` 명령으로 이 점프를 서브루틴 끝의 위치에 저장한다. 이 과정은 명령어를 데이터처럼 다루는 [[자기 수정 코드]]의 전형적인 사례다.

이 방식은 같은 서브루틴을 여러 호출 위치에서 재사용할 수 있게 했지만, 복귀 명령을 저장하는 자리가 하나뿐이면 중첩 호출과 재귀 호출에서 덮어쓰기 문제가 생긴다. 따라서 이 소스는 Wheeler Jump를 현대 함수 호출의 조상인 동시에, 이후 [[스택]] 기반 호출 구조가 필요해진 이유를 보여주는 사례로 정리할 수 있다.

## 주요 인사이트

- 폐쇄형 서브루틴의 핵심은 호출 위치가 달라져도 호출 지점 다음으로 스스로 복귀한다는 점이다.
- Wheeler Jump는 호출부 명령어를 복귀 점프 명령의 재료로 사용한다.
- `A m F + Memory[3] = E (m+2) F`는 opcode와 주소 필드를 한 번의 덧셈으로 바꾸는 기법이다.
- 이 방식은 명령어도 메모리에 저장된 값이라는 저장 프로그램 컴퓨터의 전제를 활용한다.
- 중첩 호출과 재귀의 어려움은 스택 기반 호출 구조의 필요성을 드러낸다.

## 인용할 만한 구절

> 호출부의 명령어를 이용해 복귀 점프 명령을 생성

> `A m F + Memory[3] = E (m+2) F`

> 호출, 실행, 복귀까지의 제어 흐름이 서브루틴 내부에서 완결된다는 뜻이다.

## 관련 위키 페이지

- [[서브루틴]]
- [[Wheeler Jump]]
- [[복귀 주소]]
- [[자기 수정 코드]]
- [[스택]]
- [[데이비드 휠러]]

## 출처

- `raw/폐쇄형 서브루틴과 Wheeler Jump.md`

## 관련 항목

- [[서브루틴과 스택(Stack)의 원리]]
- [[EDSAC과 Initial Orders]]
- [[초기 소프트웨어의 탄생]]
