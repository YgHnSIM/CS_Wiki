---
title: "A Proof for the Queuing Formula: L = λ W"
aliases: ["A Proof for the Queuing Formula L = λW", "Little의 법칙 원 논문", "John D. C. Little 1961", "Little 1961 queueing proof"]
summary: "시스템 안의 평균 작업 수, 평균 처리율, 평균 체류 시간의 관계 L = λW를 유한 평균·정상성·비영 평균 도착 과정의 조건 아래 증명한 John D. C. Little의 1961년 대기열 이론 논문."
tags: [type/reference, domain/mathematics, domain/performance, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 1961
historical_layer: theory
capability_layers: [realized-performance, scalability]
sources: ["A Proof for the Queuing Formula L = λW"]
source_id: ref-085
source_kind: external
primary_sources: ["John D. C. Little, A Proof for the Queuing Formula: L = λ W, Operations Research 9(3), pp. 383–387, 1961"]
supporting_sources: ["INFORMS article record and DOI metadata"]
source_urls: ["https://pubsonline.informs.org/doi/abs/10.1287/opre.9.3.383?journalCode=opre", "https://doi.org/10.1287/opre.9.3.383"]
retrieved: 2026-07-25
version: "Operations Research 9(3), pp. 383–387"
snapshot_status: external-only
status: active
graph_id: reference-littles-law-proof
graph_visibility: public
---

## 개요

[[A Proof for the Queuing Formula L = λW]]는 John D. C. Little이 1961년에 발표한 대기열 이론 논문이다. 논문은 한 시스템에서 단위 시간당 평균 도착률의 역수를 `1/λ`, 시스템 안의 평균 단위 수를 `L`, 한 단위가 시스템 안에 머무는 평균 시간을 `W`로 두고 다음 관계를 보인다.

`L = λW`

여기서 `L`은 대기열 길이만이 아니라 서비스 중인 작업을 포함하는 **시스템 안의 평균 작업 수**이고, `W`는 대기와 서비스를 포함하는 **평균 체류 시간**이다. 따라서 같은 경계에서 관찰한 평균 작업 수·완료율·체류 시간 중 둘을 알면 셋째 값을 점검할 수 있다.

## 성립 범위

원 논문은 세 평균이 유한하고, 대응 확률 과정이 엄격 정상이며, 도착 과정이 0이 아닌 평균을 가진 metrically transitive 과정이라는 조건을 명시한다. 이 조건은 `L = λW`가 임의의 짧은 시간 창이나 매 순간의 수치에 그대로 적용되는 식이 아님을 뜻한다.

실무에서는 유한 관측 창에서 비슷한 유량 관계를 회계 점검에 사용할 수 있다. 다만 관측 구간, 작업 단위, 입장·완료 규칙과 시작·종료 경계를 고정해야 한다. 요청 수를 `L`로 세면서 `λ`에는 출력 토큰/초를 넣거나, 대기 시간만 `W`로 쓰고 실행 시간을 제외하면 같은 단위를 연결한 것이 아니다.

## 무엇을 말하지 않는가

이 식은 평균의 관계이며 지연 분포를 제공하지 않는다. `L`, `λ`, `W`가 일치해도 p95·p99, 기한 초과, 요청별 공정성, 일시적 급증의 크기는 서로 다를 수 있다. 특히 도착률이 서비스 능력을 지속적으로 넘는 과부하에서는 큐가 커지고 관측 평균의 안정적 해석 자체가 어려워진다.

따라서 [[꼬리 지연 시간]]과 서비스 수준 목표(SLO)는 이 법칙을 대체하지 않는다. 평균 유량 관계는 “얼마나 많은 작업이 시스템에 쌓였는가”를 점검하는 한 축이고, 높은 백분위와 기한 초과는 사용자에게 유효한 결과가 제시간에 도착했는지를 보는 다른 축이다.

## LLM 서빙에 주는 질문

LLM 서빙에서는 요청·활성 시퀀스·토큰처럼 서로 다른 단위가 함께 움직인다. 각 단위에 별도의 경계를 두어야 한다. 예를 들어 요청 경계에서는 평균 활성 요청 수, 승인된 요청률, 요청 종단 지연을 함께 기록할 수 있다. 디코드 반복이나 토큰 경계에서는 활성 시퀀스·토큰 수, 토큰 처리율, 해당 단위의 체류 시간을 별도로 정의해야 한다.

[[연속 배칭]]은 활성 집합을 키워 장치 이용률을 높일 수 있지만, 평균 체류 시간을 얼마나 늘리는지는 도착률·[[KV 캐시]] 수용량·배치 정책·요청 길이와 승인 규칙에 달려 있다. 이 자료는 특정 정책의 성능을 예측하지 않는다. 대신 [[대기열과 부하 제어]]가 같은 서비스 경계의 유량과 지연을 함께 관찰해야 하는 이유를 제공한다.

## 인용할 만한 구절

> “L = λ W.”

논문의 제목과 결론을 이루는 식으로, 평균 시스템 내 작업 수·처리율·체류 시간의 관계를 압축한다.

## 위키 반영

이 자료는 [[리틀의 법칙]]의 직접 근거이며, [[LLM 추론 서비스 지표]]에서 요청 처리율·활성 요청·종단 지연을 같은 경계에서 기록하게 하는 회계 원리다. [[LLM 서빙에서 처리량과 지연은 왜 함께 움직이는가]]에서는 배칭으로 처리율을 높일 때 평균 체류 시간과 동시에 확인해야 할 값으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[리틀의 법칙]] | 시스템 안의 평균 작업 수, 평균 처리율, 평균 체류 시간을 같은 경계에서 연결하는 정리를 제공한다. | [[A Proof for the Queuing Formula L = λW]] |
| enables | [[대기열과 부하 제어]] | 입장·대기·서비스를 포함한 작업 수와 체류 시간을 유량과 함께 점검할 수 있게 한다. | [[A Proof for the Queuing Formula L = λW]] |

## 출처

- INFORMS, [article record](https://pubsonline.informs.org/doi/abs/10.1287/opre.9.3.383?journalCode=opre)
- [DOI: 10.1287/opre.9.3.383](https://doi.org/10.1287/opre.9.3.383)

## 관련 항목

- [[리틀의 법칙]] — 원 논문의 평균 유량 관계를 서비스 측정에 적용하는 개념을 정리한다.
- [[대기열과 부하 제어]] — 유량 관계를 SLO·승인·큐 제한 정책과 결합한다.
- [[꼬리 지연 시간]] — 평균 관계만으로 알 수 없는 높은 백분위와 기한 초과를 다룬다.
- [[LLM 추론 서비스 지표]] — 요청·토큰·지연의 경계를 구체적인 서비스 측정 항목으로 만든다.
- [[LLM 서빙에서 처리량과 지연은 왜 함께 움직이는가]] — 배칭·큐·자원 여유의 교환을 종합한다.
