---
title: No Silver Bullet—Essence and Accidents of Software Engineering
aliases: [No Silver Bullet, Brooks 1987, 은탄환은 없다, 소프트웨어 공학의 본질과 부수성]
summary: "소프트웨어 개발의 본질적 어려움과 표현·도구상의 부수적 어려움을 구분하고, 단일 기술이나 관리 기법이 생산성·신뢰성·단순성을 한 번에 10배 높일 것이라는 기대를 비판한 Brooks의 1987년 논문."
tags: [type/reference, domain/software-engineering, domain/computer-history, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 1987
historical_layer: software
capability_layers: [programmability, reliable-results]
sources: ["No Silver Bullet—Essence and Accidents of Software Engineering"]
source_id: ref-071
source_kind: external
primary_sources: ["Frederick P. Brooks, Jr., No Silver Bullet—Essence and Accidents of Software Engineering, Computer 20(4), 1987, pp. 10–19"]
supporting_sources: ["IEEE Xplore record", "text transcription for access"]
source_urls: ["https://doi.org/10.1109/MC.1987.1663532", "https://ieeexplore.ieee.org/document/1663532", "https://www.cin.ufpe.br/~phmb/ip/MaterialDeEnsino/BrooksNoSilverBullet.html"]
retrieved: 2026-07-24
version: "Computer 20(4), April 1987; earlier IFIP 1986 invited-paper version"
snapshot_status: external-only
status: active
graph_id: reference-no-silver-bullet
graph_visibility: public
---

## 개요

[[No Silver Bullet—Essence and Accidents of Software Engineering]]은 Frederick P. Brooks, Jr.가 1987년에 발표한 소프트웨어 공학 논문이다. Brooks는 앞으로 10년 안에 단일 기술이나 관리 기법 하나가 생산성·신뢰성·단순성을 한 자릿수 이상 개선할 것이라고 기대하기 어렵다고 주장했다. 이 주장은 개선이 불가능하다는 뜻이 아니라, 소프트웨어 문제의 성질과 개선 수단의 범위를 구분하자는 제안이다.

논문의 중심 구분은 본질적(essential) 어려움과 부수적(accidental) 어려움이다. 본질적 어려움은 요구사항·데이터·알고리즘·인터페이스가 이루는 개념 구조 자체에 있고, 부수적 어려움은 그 구조를 특정 언어·기계·도구로 표현하고 다루는 방식에서 생긴다. 고급 언어, 시분할, 통합 개발 환경 같은 발전은 부수적 어려움을 크게 줄였지만, 개념 구조 자체를 결정·설계·검증하는 일을 자동으로 없애지는 않는다.

Brooks는 본질적 어려움의 성질로 복잡성, 적합성(conformity), 변경성(changeability), 비가시성(invisibility)을 들었다. 이 목록은 모든 현대 프로젝트의 고정된 측정표가 아니라, 코드 작성량 외의 요구사항·통합·변경·이해 비용이 생산성·품질에 왜 영향을 주는지를 설명하는 역사적 틀이다.

## 주요 인사이트

- 생산성·신뢰성·단순성은 한 도구의 산출량으로 동시에 판정할 수 없는 서로 다른 결과다.
- 언어·자동화·통합 도구는 표현과 피드백의 부수적 어려움을 줄일 수 있다.
- 요구사항을 정교화하고 개념 구조를 설계·시험하는 일은 도구만으로 제거되지 않는 본질적 부담을 포함한다.
- 소프트웨어의 변화 압력은 성공적으로 사용되는 제품의 새 용도, 인터페이스와 환경의 변화에서 계속 발생한다.
- 단일 혁신을 기다리기보다 여러 개선을 규율 있게 축적하는 접근이 필요하다.

## 인용할 만한 구절

> “There is no royal road, but there is a road.”

Brooks는 마법 같은 단일 해법을 부정하면서도, 누적적 개선의 가능성까지 부정하지는 않았다.

## 위키 반영

이 자료는 [[본질적 복잡성과 부수적 복잡성]]의 직접 근거이며, [[코드 생산량은 왜 개발 생산성을 설명하지 못하는가]]에서 활동량 지표가 개념 설계·품질·협업을 대체하지 못하는 이유를 설명한다. [[프로그래밍 가능성]]과 [[소프트웨어 공학]]에서 언어·컴파일러·재사용이 줄이는 비용의 범위를 한정하는 데도 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[본질적 복잡성과 부수적 복잡성]] | 소프트웨어의 개념 구조와 그 표현·도구 과정에서 생기는 어려움을 구분한다. | [[No Silver Bullet—Essence and Accidents of Software Engineering]] |
| constrains | [[개발자 생산성]] | 단일 기술·관리 기법이나 활동량만으로 생산성·신뢰성·단순성을 함께 판단할 수 없게 한다. | [[No Silver Bullet—Essence and Accidents of Software Engineering]] |

## 출처

- IEEE Xplore, [article record](https://ieeexplore.ieee.org/document/1663532)
- IEEE, [DOI record](https://doi.org/10.1109/MC.1987.1663532)
- Access copy, [text transcription](https://www.cin.ufpe.br/~phmb/ip/MaterialDeEnsino/BrooksNoSilverBullet.html)

## 관련 항목

- [[본질적 복잡성과 부수적 복잡성]] — Brooks의 구분을 적용 범위와 함께 정리한다.
- [[개발자 생산성]] — 개발 활동·성과·협업·흐름을 분리해 측정하는 개념을 다룬다.
- [[코드 생산량은 왜 개발 생산성을 설명하지 못하는가]] — 단일 활동량 지표의 한계를 분석한다.
- [[소프트웨어 공학]] — 본질적 문제와 도구·과정 개선의 역할을 함께 다룬다.
