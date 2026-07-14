---
title: C 문자열
aliases: [C string, C-style string, Null terminator, 널 종단 문자열]
summary: "Null terminator로 문자열 경계를 표시하는 C 스타일 문자열 표현."
tags: [type/concept, domain/software-engineering, domain/security, status/active]
created: 2026-05-12
updated: 2026-07-10
sources: ["데이터 표현과 인코딩.md", "The Development of the C Language"]
status: active
---

## 개요

[[C 문자열]]은 별도의 길이 정보를 기본적으로 저장하지 않고, 문자열 끝을 Null terminator(`\0`)로 표시하는 문자열 표현 방식이다. `\0`은 문자 `0`이 아니라 수치상 0인 널 바이트이다.

[[C 언어]]의 문자열 표현은 바이트 단위 문자 처리와 포인터 연산에 밀접하게 연결된다. Ritchie의 C 발전사는 [[PDP-11]] 환경에서 `char`와 포인터가 C의 중요한 변화였음을 보여주며, C 문자열은 이 저수준 표현 모델의 대표 사례다.

## 경계 관리

`printf`의 `%s` 같은 함수는 `\0`을 만날 때까지 메모리를 순차적으로 읽는다. 문자열에 널 종단이 없으면 함수가 버퍼 경계를 넘어 다음 0 값을 만날 때까지 계속 읽을 수 있다. 이 경우 버퍼 오버리드와 정보 유출이 발생할 수 있고, 쓰기 연산과 결합되면 버퍼 오버플로우로 이어질 수 있다.

## 시스템적 의미

C 문자열은 [[데이터 표현]]에서 경계 정보가 얼마나 중요한지 보여주는 사례다. 같은 바이트 배열도 어디까지가 유효한 문자열인지 알 수 없다면 안정적으로 처리할 수 없다. 따라서 문자열 처리에는 버퍼 크기, 길이 제한, 종단 문자, 경계 검사가 함께 필요하다.

## 출처

- [[데이터 표현과 인코딩]]
- [[The Development of the C Language]]

## 관련 항목

- [[비트와 바이트]]
- [[C 언어]]
- [[메모리 안전성]]
- [[정수 오버플로]]
- [[소프트웨어 공학]]
- [[Unix와 C]]
- [[비트 패턴과 해석 규칙]]
