---
title: Unicode scalar value
aliases: [유니코드 스칼라 값, 스칼라 값, scalar value]
summary: "Unicode 코드 포인트 가운데 surrogate 영역을 제외해 UTF 인코딩 형식의 입력이 되는 값."
tags: [type/concept, domain/computer-science, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["The Unicode Standard 17.0.0", "RFC 3629 UTF-8"]
status: active
graph_id: concept-be5e965404a672d3
---

## 개요

[[Unicode scalar value]]는 Unicode [[코드 포인트]] 가운데 surrogate code point 범위 `U+D800`–`U+DFFF`를 제외한 값이다. 따라서 범위는 `U+0000`–`U+D7FF`와 `U+E000`–`U+10FFFF`이며, UTF-8·UTF-16·UTF-32 같은 Unicode encoding form이 코드 유닛 시퀀스로 인코딩하는 대상이 된다.

## 코드 포인트와의 차이

Unicode 코드 포인트 공간은 `U+0000`부터 `U+10FFFF`까지이며 surrogate 영역도 포함한다. 반면 scalar value는 이 영역을 제외한다. UTF-16에서는 높은 surrogate와 낮은 surrogate라는 두 [[코드 유닛]]이 한 scalar value를 표현할 수 있지만, 각 surrogate 코드 포인트 자체가 scalar value가 되는 것은 아니다.

scalar value라고 해서 반드시 현재 문자에 배정된 값이라는 뜻도 아니다. 아직 할당되지 않은 코드 포인트와 noncharacter 가운데에도 surrogate가 아닌 값은 scalar value에 포함된다. 따라서 scalar value, 배정된 문자, 사용자가 인식하는 문자 단위는 서로 구분해야 한다.

## 인코딩에서의 역할

[[UTF-8]]은 하나의 scalar value를 1–4개의 8비트 코드 유닛으로, [[UTF-16]]은 하나 또는 두 개의 16비트 코드 유닛으로 표현한다. 올바른 UTF 인코딩은 독립된 surrogate 값을 입력 문자처럼 인코딩하지 않는다. 이 구분은 잘못된 문자열을 검증하고, 코드 포인트 수·코드 유닛 수·[[그래핌 클러스터]] 수를 정확히 해석하는 데 필요하다.

## 출처

- [[The Unicode Standard 17.0.0]]
- [[RFC 3629 UTF-8]]

## 관련 항목

- [[유니코드]] — 다양한 문자와 기호를 코드 포인트, 인코딩 형식, 정규화, 텍스트 경계 문제로 포괄하는 문자 체계.
- [[인코딩]] — 정보를 매체와 목적에 맞는 기호·비트 체계로 변환하고, 디코딩 정책과 텍스트 처리 층위를 함께 다루는 과정.
- [[코드 포인트]] — Unicode 문자 공간에서 특정 위치를 가리키는 숫자 값과 scalar value의 구분을 정리한 개념.
- [[코드 유닛]] — UTF-8, UTF-16 같은 인코딩 형식이 문자열을 저장·전송할 때 사용하는 최소 단위.
- [[UTF-8]] — Unicode scalar value를 1-4개의 8비트 코드 유닛으로 표현하는 ASCII 호환 가변 길이 인코딩.
