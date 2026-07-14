---
title: Unicode Text Segmentation
aliases: [UAX #29, Unicode Standard Annex #29, Unicode text boundaries]
summary: "UAX #29를 바탕으로 그래핌 클러스터, 단어·문장 경계, 사용자 지각 문자 단위를 정리한 참고 자료."
tags: [type/reference, domain/computer-science, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["Unicode Standard Annex #29"]
source_id: ref-025
source_kind: external
primary_sources: ["Unicode Standard Annex #29, Unicode 17.0.0, Revision 47"]
supporting_sources: ["Unicode Standard Annex #29 latest-version pointer"]
source_urls: ["https://www.unicode.org/reports/tr29/tr29-47.html", "https://www.unicode.org/reports/tr29/"]
retrieved: 2026-07-10
version: "Unicode 17.0.0 / Revision 47"
snapshot_status: external-only
status: active
---

## 개요

[[Unicode Text Segmentation]]은 Unicode Standard Annex #29로, 텍스트를 사용자 지각 문자, 단어, 문장 같은 의미 있는 단위로 나누는 기본 경계를 설명한다. 이 문헌은 [[그래핌 클러스터]]를 "사용자가 문자 하나로 인식하는 단위"에 대한 프로그램 가능한 근사로 다룬다.

핵심은 코드 포인트 하나가 항상 사용자가 생각하는 문자 하나가 아니라는 점이다. 예를 들어 기본 문자와 결합 부호가 합쳐진 글자, 한글 자모 시퀀스, 일부 인도계 문자, 이모지 ZWJ sequence는 여러 코드 포인트가 하나의 사용 단위처럼 동작할 수 있다.

## 주요 인사이트

- 텍스트 경계는 사용자 지각 문자, 단어, 문장 단위로 다르게 정의된다.
- extended grapheme cluster는 기본 그래핌 클러스터 모델이며, 편집기 이동, 삭제, 선택, 문자 수 계산에 중요하다.
- 기본 알고리즘은 언어별 맞춤 처리가 필요할 수 있다.
- 단어 경계와 문장 경계는 그래핌 클러스터 내부에서 생기지 않아야 한다.

## 위키 반영

이 자료는 [[그래핌 클러스터]], [[유니코드]], [[유니코드 정규화]], [[인코딩 심화]]를 정리하는 데 사용한다. 특히 "문자열 길이"를 어떤 단위로 세는지 명확히 해야 한다는 소프트웨어 설계 문제와 연결한다.

## 출처

- Unicode Consortium, [UAX #29 Revision 47 — Unicode 17.0.0](https://www.unicode.org/reports/tr29/tr29-47.html)
- Unicode Consortium, [UAX #29 최신 판본 포인터](https://www.unicode.org/reports/tr29/)

## 관련 항목

- [[그래핌 클러스터]]
- [[유니코드]]
- [[코드 포인트]]
- [[코드 유닛]]
- [[유니코드 정규화]]
- [[인코딩 심화]]
