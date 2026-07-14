---
title: Mass Produced Software Components
aliases: [Mass-Produced Software Components, 대량 생산 소프트웨어 컴포넌트, McIlroy software components]
summary: "McIlroy의 1968년 발표를 바탕으로 소프트웨어 컴포넌트 제품군, 카탈로그, 재사용 산업화 구상을 정리한 참고 자료."
tags: [type/reference, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["NATO Software Engineering Conference 1968", "Dartmouth text copy"]
source_id: ref-002
source_kind: external
primary_sources: ["NATO Software Engineering Conference 1968"]
supporting_sources: ["Dartmouth text copy"]
source_urls: ["https://www.cs.dartmouth.edu/~doug/components.txt"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[Mass Produced Software Components]]는 [[더글러스 매킬로이]]가 1968년 NATO Software Engineering Conference에서 발표한 글이다. 이 문헌은 [[소프트웨어 재사용]]을 단순한 복사나 우연한 코드 공유가 아니라, 품질이 검증된 [[소프트웨어 컴포넌트]]를 카탈로그화하고 필요에 맞게 선택하는 산업적 체계로 제안한다.

McIlroy의 핵심 문제의식은 소프트웨어 생산이 하드웨어나 기계 부품 산업처럼 표준 부품, 제품군, 카탈로그, 품질 보증을 갖추지 못했다는 데 있다. 소프트웨어는 복제가 쉬우므로 "대량 생산"의 의미가 단순 복제일 수 없다. 여기서 대량 생산은 같은 기능을 여러 정밀도, 견고성, 일반성, 시간-공간 성능 조건에 맞춰 제공하는 제품군 생산을 뜻한다.

## 주요 인사이트

- 재사용 가능한 루틴은 서로 다른 기계와 사용자에게 적용될 수 있도록 제품군 형태로 제공되어야 한다.
- 사용자는 "무엇을 새로 만들 것인가"보다 "어떤 메커니즘을 사용할 것인가"를 물을 수 있어야 한다.
- 컴포넌트는 블랙박스처럼 다룰 수 있어야 하며, 내부 구현보다 카탈로그와 인터페이스가 중요하다.
- 수치 루틴, 입출력 변환, 텍스트 처리, 저장 공간 관리 같은 영역은 표준화된 컴포넌트 후보로 제시된다.
- 성공 조건은 기술적 생성 능력만이 아니라 배포, 카탈로그화, 제품군 기획, 품질 신뢰다.

## 위키 반영

이 자료는 [[소프트웨어 재사용]], [[소프트웨어 컴포넌트]], [[라이브러리]], [[API]], [[소프트웨어 공학]]을 정리하는 근거로 사용한다. [[소프트웨어 재사용의 역사]]에서는 EDSAC의 서브루틴 라이브러리 이후, 재사용이 개별 루틴의 보관을 넘어 컴포넌트 산업과 제품군 사고로 확장되는 전환점으로 다룬다.

## 출처

- Douglas McIlroy, [Mass Produced Software Components](https://www.cs.dartmouth.edu/~doug/components.txt)

## 관련 항목

- [[더글러스 매킬로이]]
- [[소프트웨어 재사용]]
- [[소프트웨어 컴포넌트]]
- [[라이브러리]]
- [[API]]
- [[소프트웨어 공학]]
- [[소프트웨어 재사용의 역사]]
