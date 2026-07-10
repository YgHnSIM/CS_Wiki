---
title: Unicode Security Mechanisms
aliases: [UTS #39, Unicode Technical Standard #39, 유니코드 보안 메커니즘]
tags: [type/reference, domain/computer-science, domain/security, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["Unicode Technical Standard #39"]
source_id: ref-027
source_kind: external
primary_sources: ["Unicode Technical Standard #39, Version 17.0.0, Revision 32"]
supporting_sources: ["Unicode Technical Standard #39 latest-version pointer"]
source_urls: ["https://www.unicode.org/reports/tr39/tr39-32.html", "https://www.unicode.org/reports/tr39/"]
retrieved: 2026-07-10
version: "17.0.0 / Revision 32"
snapshot_status: external-only
status: active
---

## 개요

[[Unicode Security Mechanisms]]는 Unicode Technical Standard #39로, Unicode 텍스트에서 생길 수 있는 보안 문제를 줄이기 위한 메커니즘을 정의한다. 이 위키에서는 특히 [[동형이의 문자]]와 mixed-script 탐지를 다루는 근거로 사용한다.

Unicode는 다양한 문자 체계를 포괄하기 때문에, 서로 다른 코드 포인트가 사람 눈에는 매우 비슷하게 보일 수 있다. 이는 국제화된 식별자, 도메인 이름, 사용자 이름, 프로그래밍 언어 식별자에서 스푸핑 문제로 이어질 수 있다.

## 주요 인사이트

- confusables 데이터는 두 문자열이 시각적으로 혼동될 수 있는지 판단하는 데 쓰인다.
- confusable은 single-script, mixed-script, whole-script 유형으로 나뉜다.
- 예를 들어 라틴 문자와 키릴 문자처럼 서로 다른 문자 체계의 비슷한 글자가 같은 식별자로 오인될 수 있다.
- 실무 시스템은 정규화만으로 충분하지 않으며, 식별자 허용 범위와 스크립트 혼합 정책을 함께 정해야 한다.

## 위키 반영

이 자료는 [[동형이의 문자]], [[유니코드 정규화]], [[인코딩 오류]], [[인코딩 심화]]를 정리하는 데 사용한다. 특히 "같은 바이트인가"뿐 아니라 "같아 보이는가"도 보안 경계가 될 수 있다는 관점을 보강한다.

## 출처

- Unicode Consortium, [UTS #39 Revision 32 — Version 17.0.0](https://www.unicode.org/reports/tr39/tr39-32.html)
- Unicode Consortium, [UTS #39 최신 판본 포인터](https://www.unicode.org/reports/tr39/)

## 관련 항목

- [[동형이의 문자]]
- [[유니코드]]
- [[유니코드 정규화]]
- [[인코딩 오류]]
- [[소프트웨어 공학]]
- [[인코딩 심화]]
