---
title: A Symbolic Analysis of Relay and Switching Circuits
aliases: [Shannon 1938, Symbolic Analysis, relay and switching circuits]
summary: "Shannon의 릴레이·스위칭 회로 논문을 바탕으로 불 대수, 논리 게이트, 이진 덧셈 회로, 이진 표현의 회로적 기반을 정리한 참고 자료."
tags: [type/reference, domain/computer-history, domain/computer-architecture, domain/computer-science, status/active]
created: 2026-07-10
updated: 2026-07-18
publication_year: 1938
historical_layer: architecture
sources: ["MIT DSpace: 34541425-MIT.pdf", "Transactions AIEE 1938"]
source_id: ref-008
source_kind: external
primary_sources: ["Transactions AIEE 1938"]
supporting_sources: ["MIT DSpace: 34541425-MIT.pdf", "IEEE Xplore record", "PDF copy"]
source_urls: ["https://dspace.mit.edu/entities/publication/2dffdeb7-2862-4575-8a8e-b29fb59319e5", "https://harrymoreno.com/assets/greatPapersInCompSci/3.2_-_A_Symbolic_analysis_of_rela_and_switching_circuits-Claude_E._Shannon.pdf", "https://ieeexplore.ieee.org/document/5057767/"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[A Symbolic Analysis of Relay and Switching Circuits]]는 [[클로드 섀넌]]이 MIT 석사 논문을 바탕으로 1938년에 발표한 논문이다. 이 문헌은 [[릴레이 회로]]와 스위치의 열림·닫힘 상태를 기호 변수로 표현하고, 그 조합을 [[불 대수]]와 같은 방식으로 조작할 수 있음을 보였다.

핵심은 전기 회로의 물리적 상태와 논리식의 기호 조작을 연결한 데 있다. Shannon은 릴레이 접점과 스위치로 이루어진 회로가 어느 순간 열림 또는 닫힘이라는 두 상태를 갖는다고 두고, 직렬 연결과 병렬 연결을 대수 연산으로 대응시켰다. 이렇게 하면 회로를 먼저 그리고 해석하는 대신, 원하는 동작을 식으로 쓰고 식을 단순화한 뒤 회로로 옮길 수 있다.

## 주요 인사이트

- 스위칭 회로는 열림/닫힘이라는 두 상태를 가지므로 [[이진법]]과 [[비트와 바이트]]의 물리적 기반과 잘 맞는다.
- 직렬 연결과 병렬 연결은 불 대수의 연산과 대응될 수 있다.
- 회로 설계는 수작업 배선 기술만이 아니라 기호식을 다루는 수학적 문제로 바뀐다.
- 논리식 단순화는 더 적은 접점과 스위치로 같은 동작을 하는 회로를 찾는 최적화 문제가 된다.
- 논문의 말미에는 이진수를 더하는 전기식 덧셈 회로가 제시되어, 논리 회로가 산술 연산을 구현할 수 있음을 보여준다.

## 위키 반영

이 자료는 기존 [[이진법]], [[비트와 바이트]], [[데이터 표현]], [[비트 연산]], [[비트 패턴과 해석 규칙]]을 회로 수준과 연결하는 데 사용한다. 새 분석 페이지 [[논리 회로와 이진 표현]]은 0/1 표현이 단순한 표기법을 넘어 물리적 스위치, 논리식, 산술 회로를 잇는 구조임을 정리한다.

## 출처

- MIT DSpace, [A symbolic analysis of relay and switching circuits](https://dspace.mit.edu/entities/publication/2dffdeb7-2862-4575-8a8e-b29fb59319e5)
- PDF copy, [A Symbolic Analysis of Relay and Switching Circuits](https://harrymoreno.com/assets/greatPapersInCompSci/3.2_-_A_Symbolic_analysis_of_rela_and_switching_circuits-Claude_E._Shannon.pdf)
- IEEE Xplore, [A symbolic analysis of relay and switching circuits](https://ieeexplore.ieee.org/document/5057767/)

## 관련 항목

- [[클로드 섀넌]]
- [[불 대수]]
- [[릴레이 회로]]
- [[스위칭 회로]]
- [[논리 게이트]]
- [[이진 덧셈 회로]]
- [[이진법]]
- [[비트와 바이트]]
- [[논리 회로와 이진 표현]]
