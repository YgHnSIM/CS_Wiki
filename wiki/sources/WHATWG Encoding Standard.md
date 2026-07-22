---
title: WHATWG Encoding Standard
aliases: [WHATWG Encoding, Web Encoding Standard]
summary: "웹 플랫폼의 바이트-문자 변환 알고리즘, 인코딩 라벨, BOM, 오류 대체 정책을 정리한 참고 자료."
tags: [type/reference, domain/computer-science, domain/web, domain/text-processing, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["WHATWG Encoding Standard"]
source_id: ref-026
source_kind: external
primary_sources: ["WHATWG Encoding Living Standard"]
supporting_sources: ["Commit snapshot a985b62a9b45c17da3e17a9f0a0b4e30c34c4a8a"]
source_urls: ["https://encoding.spec.whatwg.org/", "https://encoding.spec.whatwg.org/commit-snapshots/a985b62a9b45c17da3e17a9f0a0b4e30c34c4a8a/"]
retrieved: 2026-07-10
version: "Living Standard / snapshot 2026-05-21 (a985b62a)"
snapshot_status: external-only
status: active
publication_year: 2026
historical_note: "Living Standard의 2026-05-21 고정 스냅샷을 기준으로 한 연도다."
---

## 개요

[[WHATWG Encoding Standard]]는 웹 플랫폼에서 바이트와 Unicode scalar value 사이를 변환하는 알고리즘, 인코딩 이름, 레이블, JavaScript 노출 API를 정의한다. 이 문헌은 현대 웹에서 [[UTF-8]]을 기본 교환 인코딩으로 두면서도, 오래된 웹 콘텐츠와의 호환을 위해 legacy encoding 처리 규칙을 함께 명시한다.

웹에서 인코딩 문제는 단순히 어떤 문자 집합을 쓸지의 문제가 아니다. 서버 헤더, HTML 메타데이터, BOM, 브라우저의 인코딩 탐지와 오류 대체 정책이 모두 실제 문자열 해석에 영향을 준다. 따라서 같은 바이트열도 문맥에 따라 다른 문자열로 보일 수 있고, 잘못된 해석은 [[인코딩 오류]]와 보안 문제를 만든다.

## 주요 인사이트

- 표준은 바이트에서 scalar value로, scalar value에서 바이트로 가는 알고리즘을 정의한다.
- 새 형식은 UTF-8 decode/encode 알고리즘을 사용해야 한다.
- UTF-8 BOM은 일부 알고리즘에서 입력 앞의 `EF BB BF`로 감지되어 처리된다.
- 웹 호환성 때문에 BOM이 라벨보다 우선하는 경우가 있다.
- 잘못된 바이트는 fatal 처리 또는 replacement 처리로 다룰 수 있다.

## 위키 반영

이 자료는 [[인코딩 오류]], [[바이트 순서 표식]], [[UTF-8]], [[유니코드]], [[인코딩 심화]]를 정리하는 데 사용한다. 특히 텍스트 처리에서 "정상적으로 디코딩할 것인가, 실패시킬 것인가, 대체 문자로 넘길 것인가"가 설계 선택이라는 점을 보강한다.

## 출처

- WHATWG, [Encoding Living Standard](https://encoding.spec.whatwg.org/)
- WHATWG, [2026-05-21 commit snapshot](https://encoding.spec.whatwg.org/commit-snapshots/a985b62a9b45c17da3e17a9f0a0b4e30c34c4a8a/)

## 관련 항목

- [[인코딩 오류]]
- [[바이트 순서 표식]]
- [[UTF-8]]
- [[유니코드]]
- [[코드 포인트]]
- [[인코딩 심화]]
