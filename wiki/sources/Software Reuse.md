---
title: Software Reuse
aliases: [Krueger Software Reuse, ACM Computing Surveys Software Reuse, 소프트웨어 재사용 Krueger]
summary: "Krueger의 1992년 조사 논문을 바탕으로 재사용을 추상화, 선택, 특수화, 통합의 문제로 정리한 참고 자료."
tags: [type/reference, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["ACM Computing Surveys 1992", "ACM DOI", "PDF copy"]
source_id: ref-004
source_kind: external
primary_sources: ["ACM Computing Surveys 1992"]
supporting_sources: ["ACM DOI", "PDF copy"]
source_urls: ["https://dl.acm.org/doi/10.1145/130844.130856", "https://grosskurth.ca/bib/1992/krueger.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
publication_year: 1992
---

## 개요

[[Software Reuse]]는 [[찰스 W. 크루거]]가 1992년에 발표한 [[소프트웨어 재사용]] 조사 논문이다. 이 문헌은 소프트웨어 재사용을 기존 소프트웨어로 새 시스템을 만드는 과정으로 정의하고, 1968년 McIlroy 이후에도 재사용이 표준 실천으로 자리 잡기 어려웠던 이유를 정리한다.

Krueger의 핵심 틀은 재사용 기법을 재사용 산출물과 그 산출물을 추상화, 선택, 특수화, 통합하는 방식으로 비교하는 것이다. 재사용은 라이브러리에서 코드 조각을 찾는 문제만이 아니라, 사용자가 이해할 수 있는 추상화와 검색 체계, 필요한 변형 지점, 최종 시스템에 결합하는 절차를 함께 요구한다.

## 주요 인사이트

- 재사용의 목표는 처음부터 모든 것을 새로 만들지 않고 기존 소프트웨어 산출물을 바탕으로 시스템을 구성하는 것이다.
- 고급 언어, 설계·코드 수집, 소스 코드 컴포넌트, 소프트웨어 스키마, 응용 생성기, 초고급 언어, 변환 시스템, 소프트웨어 아키텍처가 재사용 기술의 범주로 정리된다.
- 효과적인 재사용은 인지적 거리, 즉 최초 구상에서 실행 가능한 구현까지 가는 지적 노력을 줄여야 한다.
- 재사용 산출물을 선택하려면 그것이 무엇을 하는지 알아야 하며, 새로 만드는 것보다 빨리 찾을 수 있어야 한다.
- 대형 범용 컴포넌트보다 수학 라이브러리, 추상 자료형, 도메인별 생성기처럼 공유 추상화가 강한 영역에서 재사용이 더 성공하기 쉽다.

## 위키 반영

이 자료는 [[소프트웨어 재사용]], [[소프트웨어 컴포넌트]], [[모듈화]], [[API]], [[소프트웨어 공학]]을 정리하는 근거로 사용한다. [[소프트웨어 재사용의 역사]]에서는 재사용의 초점이 코드 보관에서 추상화, 검색, 특수화, 통합으로 넓어지는 단계를 설명하는 데 사용한다.

## 출처

- ACM Digital Library, [Software reuse](https://dl.acm.org/doi/10.1145/130844.130856)
- PDF copy, [Software Reuse](https://grosskurth.ca/bib/1992/krueger.pdf)

## 관련 항목

- [[찰스 W. 크루거]]
- [[소프트웨어 재사용]]
- [[소프트웨어 컴포넌트]]
- [[모듈화]]
- [[API]]
- [[소프트웨어 공학]]
- [[소프트웨어 재사용의 역사]]
