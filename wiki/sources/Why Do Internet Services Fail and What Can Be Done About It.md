---
title: Why Do Internet Services Fail and What Can Be Done About It
aliases: ["Why Do Internet Services Fail, and What Can Be Done About It?", Oppenheimer Ganapathi Patterson 2003, 인터넷 서비스는 왜 실패하는가]
summary: "세 대형 인터넷 서비스의 장애 보고를 분석해 하드웨어·소프트웨어·네트워크·운영자 오류와 탐지·복구 시간을 함께 다룬 Oppenheimer, Ganapathi, Patterson의 2003년 연구."
tags: [type/reference, domain/systems, domain/internet, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2003
historical_layer: service
capability_layers: [reliable-results]
sources: ["Why Do Internet Services Fail and What Can Be Done About It"]
source_id: ref-064
source_kind: external
primary_sources: ["David Oppenheimer, Archana Ganapathi, and David A. Patterson, Why Do Internet Services Fail, and What Can Be Done About It?, 4th USENIX Symposium on Internet Technologies and Systems (USITS '03), 2003"]
supporting_sources: ["USENIX conference record", "USENIX full-text HTML and PDF"]
source_urls: ["https://www.usenix.org/conference/usits-03/why-do-internet-services-fail-and-what-can-be-done-about-it", "https://www.usenix.org/legacy/events/usits03/tech/full_papers/oppenheimer/oppenheimer_html/index.html", "https://www.usenix.org/legacy/events/usits03/tech/full_papers/oppenheimer/oppenheimer.pdf"]
retrieved: 2026-07-24
version: "USITS '03, 2003"
snapshot_status: external-only
status: active
graph_id: reference-internet-service-failures
graph_visibility: public
---

## 개요

[[Why Do Internet Services Fail and What Can Be Done About It]]은 David Oppenheimer, Archana Ganapathi, David A. Patterson이 2003년에 발표한 현장 장애 연구다. Online, Content, ReadMostly라는 세 인터넷 서비스의 장애 보고와 운영 자료를 바탕으로, 구성요소의 고장뿐 아니라 운영자와 설정 변경을 서비스 장애 분석에 포함한다.

연구는 하드웨어·소프트웨어·네트워크·운영자를 서비스 구성요소로 보고, 사용자에게 품질 저하가 나타난 사건을 서비스 장애로 구분한다. 중복은 하드웨어·소프트웨어·네트워크 구성요소의 일부 장애를 가릴 수 있었지만, 잘못된 설정·운영 절차는 중복된 구성요소에 같은 오류를 적용할 수 있어 덜 가려졌다는 결과를 보고한다.

저자들은 장애 대응을 고장 예방, 고장이 사용자에게 보이는 실패가 되는 일의 방지, 사용자 영향의 감소, 탐지 시간(time to detect)의 감소, 복구 시간(time to repair)의 감소로 나눈다. 여기서 복구 시간은 장애가 탐지된 뒤 서비스 품질이 돌아올 때까지의 시간이다. 이 구분은 평균 지연과 처리량만으로 서비스 능력을 설명할 수 없다는 점을 구체적인 운영 관찰로 보완한다.

## 주요 인사이트

- 서비스 장애의 원인은 하드웨어·소프트웨어·네트워크에 한정되지 않으며, 운영자와 구성 변경도 분석 단위에 포함해야 한다.
- 중복은 모든 실패 원인을 동일하게 가리지 않는다. 공통 설정과 운영 절차는 여러 복제본에 동시에 영향을 줄 수 있다.
- 서비스 품질의 회복은 오류 발생 시점만이 아니라 탐지, 진단, 복구의 시간을 분리해 봐야 한다.
- 온라인 시험, 구성 점검, 격리, 모니터링, 고장 주입과 재시작 같은 기법은 서로 다른 단계의 위험을 줄인다.
- 사례 수치와 우선순위는 2003년 당시 세 서비스의 기록에 기반하므로, 모든 현대 서비스의 원인 비율이나 효과 크기로 일반화할 수 없다.

## 인용할 만한 구절

> “What can be done about it?”

논문은 장애 원인 분류에 그치지 않고, 예방·탐지·복구 단계별 대응의 여지를 함께 묻는다.

## 위키 반영

이 자료는 [[가용성과 복구]]에서 탐지와 복구 시간을 분리하는 직접 근거이며, [[결함 허용]]에서 중복과 공통 원인·운영 오류를 구분하는 데 사용한다. [[빠른 서비스는 왜 가용한 서비스를 보장하지 않는가]]에서는 종단 지연의 분포와 서비스 장애·복구를 같은 측정표에서 함께 기록해야 하는 이유를 설명한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[가용성과 복구]] | 서비스 장애의 탐지와 품질 회복 시간을 구분해 운영상 측정 경계를 제시한다. | [[Why Do Internet Services Fail and What Can Be Done About It]] |
| constrains | [[결함 허용]] | 중복이 운영자·설정 오류처럼 공통 원인을 가진 실패를 자동으로 가리지 못함을 관찰한다. | [[Why Do Internet Services Fail and What Can Be Done About It]] |

## 출처

- USENIX, [conference record](https://www.usenix.org/conference/usits-03/why-do-internet-services-fail-and-what-can-be-done-about-it)
- USENIX, [full-text HTML](https://www.usenix.org/legacy/events/usits03/tech/full_papers/oppenheimer/oppenheimer_html/index.html)
- USENIX, [PDF](https://www.usenix.org/legacy/events/usits03/tech/full_papers/oppenheimer/oppenheimer.pdf)

## 관련 항목

- [[가용성과 복구]] — 탐지·복구 시간과 서비스 품질의 회복을 개념적으로 정리한다.
- [[결함 허용]] — 중복, 격리와 운영 절차를 결함 모형과 함께 읽는다.
- [[꼬리 지연 시간]] — 느린 요청과 실제 장애·복구 사건을 같은 종단 관찰에서 구분한다.
- [[Recovery-Oriented Computing (ROC)]] — 복구 시간을 설계와 평가의 중심으로 옮기는 관점을 보강한다.
