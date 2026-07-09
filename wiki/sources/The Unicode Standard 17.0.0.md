---
title: The Unicode Standard 17.0.0
aliases: [Unicode 17.0.0, The Unicode Standard, Unicode Standard]
tags: [type/reference, domain/computer-science, domain/systems, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["Unicode 17.0.0 Core Specification"]
status: active
---

## 개요

[[The Unicode Standard 17.0.0]]은 전 세계 문자와 텍스트를 일관된 방식으로 표현하기 위한 문자 인코딩 표준이다. 이 위키에서는 특히 Chapter 3의 정의를 중심으로 [[코드 포인트]], Unicode scalar value, [[코드 유닛]], UTF-8, UTF-16, UTF-32, well-formed encoding의 구분을 정리하는 근거로 사용한다.

Unicode 17.0.0은 2025년 9월 9일 발표되었고, 이전 버전을 대체한다. 이 버전은 핵심 명세, 코드 차트, Unicode Standard Annexes, Unicode Character Database로 구성된다. 문자 추가보다 이 위키에서 중요한 부분은 텍스트 처리 모델 자체다.

## 주요 인사이트

- encoded character는 추상 문자와 코드 포인트의 대응이다.
- Unicode scalar value는 surrogate code point를 제외한 코드 포인트 범위이며, UTF 인코딩 형식은 scalar value를 코드 유닛 시퀀스로 대응시킨다.
- UTF-8은 scalar value를 1-4바이트 시퀀스로 표현한다.
- UTF-16은 BMP 영역 대부분을 16비트 코드 유닛 하나로, U+10000 이상을 surrogate pair로 표현한다.
- UTF-16과 UTF-32는 바이트 직렬화 시 엔디언 문제가 생기며, [[바이트 순서 표식]]이 이를 구분하는 데 쓰일 수 있다.
- UTF-8에는 바이트 순서 문제가 없고 BOM이 필수도 아니다.

## 위키 반영

이 자료는 [[유니코드]], [[코드 포인트]], [[코드 유닛]], [[UTF-8]], [[UTF-16]], [[바이트 순서 표식]], [[인코딩 심화]]를 정리하는 데 사용한다. 특히 "문자 수", "바이트 수", "코드 포인트 수", "코드 유닛 수", "사용자가 보는 글자 수"가 서로 다를 수 있다는 점을 설명하는 기준 문헌으로 둔다.

## 출처

- Unicode Consortium, [The Unicode Standard, Version 17.0.0](https://www.unicode.org/versions/Unicode17.0.0/)
- Unicode Consortium, [Chapter 3, Conformance](https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-3/)

## 관련 항목

- [[유니코드]]
- [[인코딩]]
- [[코드 포인트]]
- [[코드 유닛]]
- [[UTF-8]]
- [[UTF-16]]
- [[바이트 순서 표식]]
- [[유니코드 정규화]]
- [[그래핌 클러스터]]
- [[인코딩 심화]]
