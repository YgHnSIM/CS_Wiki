---
title: RFC 3629 UTF-8
aliases: [RFC 3629, UTF-8 RFC, UTF-8 a transformation format of ISO 10646]
summary: "IETF의 UTF-8 표준을 바탕으로 ASCII 호환성, 1-4 octet 구조, 잘못된 바이트열 처리 문제를 정리한 참고 자료."
tags: [type/reference, domain/computer-science, domain/internet, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["RFC 3629"]
source_id: ref-023
source_kind: external
primary_sources: ["RFC 3629"]
supporting_sources: []
source_urls: ["https://datatracker.ietf.org/doc/html/rfc3629"]
retrieved: 2026-07-10
version: "RFC 3629"
snapshot_status: external-only
status: active
publication_year: 2003
---

## 개요

[[RFC 3629 UTF-8]]은 UTF-8을 ISO/IEC 10646의 transformation format으로 규정한 IETF 표준 문서다. 이 문헌은 [[UTF-8]]이 문자 값을 1-4개의 octet으로 표현하며, ASCII와 호환되는 바이트 구조를 갖는다는 점을 정리한다.

RFC 3629의 중요한 의미는 UTF-8을 인터넷 프로토콜과 파일 형식에서 안정적으로 교환 가능한 텍스트 인코딩으로 제한하고 정리했다는 데 있다. 특히 잘못된 선행 바이트, 너무 긴 표현, surrogate 영역, Unicode 범위 밖의 값을 허용하지 않는다는 점이 보안과 상호운용성에 중요하다.

## 주요 인사이트

- UTF-8은 문자 값에 따라 필요한 octet 수가 달라지는 가변 길이 인코딩이다.
- 1바이트 ASCII 범위는 기존 US-ASCII와 같은 바이트 값을 유지한다.
- 멀티바이트 시퀀스의 첫 octet은 전체 길이를 알려 준다.
- `C0`, `C1`, `F5`-`FF` 같은 octet 값은 UTF-8에서 나타나지 않는다.
- 올바르지 않은 UTF-8을 받아들일지 거부할지는 보안 경계와 연결된다.

## 위키 반영

이 자료는 [[UTF-8]], [[인코딩 오류]], [[ASCII]], [[바이트 순서 표식]], [[인코딩 심화]]를 정리하는 데 사용한다. 특히 UTF-8이 "유니코드 전체를 담는 바이트 직렬화 방식"이지 "문자 집합 자체"가 아니라는 구분을 보강한다.

## 출처

- IETF Datatracker, [RFC 3629 - UTF-8, a transformation format of ISO 10646](https://datatracker.ietf.org/doc/html/rfc3629)

## 관련 항목

- [[UTF-8]]
- [[ASCII]]
- [[유니코드]]
- [[코드 포인트]]
- [[코드 유닛]]
- [[인코딩 오류]]
- [[바이트 순서 표식]]
- [[인코딩 심화]]
