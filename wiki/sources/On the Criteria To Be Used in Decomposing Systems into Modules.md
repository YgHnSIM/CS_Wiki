---
title: On the Criteria To Be Used in Decomposing Systems into Modules
aliases: [Criteria for Modularization, 모듈 분해 기준, Parnas modularization paper]
summary: "Parnas의 1972년 논문을 바탕으로 모듈화, 정보 은닉, 변경 가능한 설계 결정 중심의 분해 기준을 정리한 참고 자료."
tags: [type/reference, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["Communications of the ACM 1972", "ACM DOI", "PDF copy"]
source_id: ref-003
source_kind: external
primary_sources: ["Communications of the ACM 1972"]
supporting_sources: ["ACM DOI", "PDF copy"]
source_urls: ["https://dl.acm.org/doi/10.1145/361598.361623", "https://wstomv.win.tue.nl/edu/2ip30/references/criteria_for_modularization.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[On the Criteria To Be Used in Decomposing Systems into Modules]]는 [[데이비드 파나스]]가 1972년에 발표한 [[모듈화]] 논문이다. 이 문헌은 시스템을 모듈로 나누는 기준이 단순한 실행 단계나 순서도가 아니라, 변경 가능성이 큰 설계 결정을 감추는 방식이어야 한다고 주장한다.

논문은 KWIC 색인 시스템 예제를 통해 두 가지 분해 방식을 비교한다. 첫 번째 방식은 입력, 순환 이동, 정렬, 출력처럼 처리 단계별로 나눈다. 두 번째 방식은 저장 표현, 순환 이동 표현, 정렬 방식 같은 설계 결정을 감추는 모듈로 나눈다. Parnas는 두 번째 방식이 변경 가능성, 독립 개발, 이해 가능성에서 더 유리하다고 분석한다.

## 주요 인사이트

- 모듈은 하나 이상의 서브루틴이 아니라 책임 할당 단위로 봐야 한다.
- 모듈화의 기대 이점은 개발 시간 단축, 변경 유연성, 이해 가능성이다.
- 처리 단계별 분해는 내부 데이터 표현을 여러 모듈에 노출시켜 변경 비용을 키울 수 있다.
- [[정보 은닉]] 기준의 분해는 변경 가능성이 큰 설계 결정을 한 모듈 안에 가둔다.
- 좋은 모듈 경계는 실행 순서와 항상 일치하지 않는다.

## 위키 반영

이 자료는 [[모듈화]], [[정보 은닉]], [[소프트웨어 재사용]], [[API]], [[소프트웨어 공학]]을 정리하는 근거로 사용한다. [[소프트웨어 재사용의 역사]]에서는 재사용 가능한 코드를 많이 모으는 것만으로는 충분하지 않고, 변경 가능한 세부를 숨기는 모듈 경계가 재사용의 전제가 된다는 전환으로 다룬다.

## 출처

- ACM Digital Library, [On the criteria to be used in decomposing systems into modules](https://dl.acm.org/doi/10.1145/361598.361623)
- PDF copy, [On the Criteria To Be Used in Decomposing Systems into Modules](https://wstomv.win.tue.nl/edu/2ip30/references/criteria_for_modularization.pdf)

## 관련 항목

- [[데이비드 파나스]]
- [[모듈화]]
- [[정보 은닉]]
- [[소프트웨어 재사용]]
- [[API]]
- [[소프트웨어 공학]]
- [[소프트웨어 재사용의 역사]]
