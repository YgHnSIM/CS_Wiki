---
title: "Serving DNNs like Clockwork: Performance Predictability from the Bottom Up"
aliases: ["Serving DNNs like Clockwork Performance Predictability from the Bottom Up", Clockwork, "Clockwork serving system", "Gujarati et al. 2020"]
summary: "DNN 추론의 예측 가능한 실행 시간을 바탕으로 요청별 기한을 만족할 수 있는 작업만 예약하고, 처리량·꼬리 지연·요청별 SLO를 함께 평가한 2020년 OSDI 모델 서빙 시스템 연구."
tags: [type/reference, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2020
historical_layer: service
capability_layers: [realized-performance, scalability, reliable-results]
sources: ["Serving DNNs like Clockwork Performance Predictability from the Bottom Up"]
source_id: ref-086
source_kind: external
primary_sources: ["Arpan Gujarati et al., Serving DNNs like Clockwork: Performance Predictability from the Bottom Up, OSDI 2020"]
supporting_sources: ["USENIX OSDI 2020 presentation and open-access proceedings record"]
source_urls: ["https://www.usenix.org/conference/osdi20/presentation/gujarati", "https://www.usenix.org/system/files/osdi20-gujarati.pdf"]
retrieved: 2026-07-25
version: "OSDI '20 proceedings, pp. 443–462"
snapshot_status: external-only
status: active
graph_id: reference-clockwork-serving
graph_visibility: public
---

## 개요

[[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]]는 Gujarati 등 연구진이 2020년 OSDI에서 발표한 DNN 모델 서빙 시스템 연구다. 논문은 개별 DNN 추론의 실행 시간이 충분히 예측 가능하다는 관찰에서 출발해, 그 예측 가능성을 상위 계층까지 잃지 않도록 자원 소비와 스케줄링 선택을 중앙화하는 Clockwork를 설계했다.

Clockwork의 핵심은 요청이 지정된 지연 SLO 안에 끝날 수 있다고 판단될 때만 추론을 예약하는 방식이다. 작업을 더 크게 배치하면 처리 효율은 좋아질 수 있지만 실행 시간이 길어진다. 시스템은 작업자·모델·배치 크기별 실행 시간을 바탕으로 대기 중인 요청의 기한을 계산하고, 이미 기한을 만족할 수 없는 요청에는 더 많은 자원을 쓰지 않도록 한다. 이런 거절은 실패를 없애는 것이 아니라, 만족할 수 없는 요청의 작업을 goodput과 구분하는 정책이다.

## SLO·goodput·격리

논문에서 goodput은 목표 SLO 안에 성공한 요청 수만 센다. 기한을 넘겨 응답한 요청과 시간 초과 요청은 제외한다. 따라서 원시 요청 처리율과 goodput은 다를 수 있으며, 엄격한 SLO에서 두 지표의 차이가 커질 수 있다.

또한 Clockwork는 하나의 GPU에서 많은 모델과 요청을 다루며, 지연에 민감한 요청과 배경 작업의 간섭을 줄이는 요청 수준 성능 격리를 목표로 했다. 저자들은 프로덕션 추적 기반 평가에서 수천 개 모델을 지원하면서 매우 엄격한 100ms 목표를 높은 비율의 요청에 만족한 결과를 보고했다. 이 수치는 논문에서 사용한 DNN 모델, 추적, 배치와 하드웨어의 결과이며, 모든 모델 서빙 시스템의 일반적인 보장이나 LLM의 토큰별 생성 성능을 뜻하지 않는다.

## LLM 서빙으로 옮길 때의 경계

Clockwork의 대상은 보통 한 번의 DNN 실행으로 끝나는 요청이며, 자동회귀 LLM은 프리필 뒤 여러 디코드 반복과 요청별 [[KV 캐시]]를 가진다. 따라서 Clockwork의 실행 시간 프로파일이나 배치 정책을 LLM에 그대로 옮길 수 없다.

그럼에도 논문은 공통 질문을 제공한다. (1) 어떤 요청이 정해진 기한 안에 끝날 수 있는가, (2) 효율을 위한 배치 확대가 어떤 요청의 기한을 깨는가, (3) 이미 만족할 수 없는 요청에 자원을 계속 배정할 것인가다. [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]가 TTFT와 TPOT의 두 SLO로 LLM에 이 질문을 재구성한 이유도 여기서 읽을 수 있다.

## 인용할 만한 구절

> “only execute an inference request if it is confident”

요청을 받은 뒤 무조건 실행하는 대신, 기한을 만족할 수 있는지 먼저 판단한다는 Clockwork의 스케줄링 원칙을 보여 준다.

## 위키 반영

이 자료는 [[대기열과 부하 제어]]에서 승인·취소·배치 크기를 SLO와 함께 다루는 직접 사례이며, [[꼬리 지연 시간]]에서 평균 처리율과 기한 초과를 분리해야 하는 이유를 보강한다. [[LLM 서빙에서 처리량과 지연은 왜 함께 움직이는가]]에서는 LLM과의 실행 차이를 밝힌 뒤, goodput과 요청별 기한의 관계를 비교 축으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[대기열과 부하 제어]] | 예측된 작업 시간과 요청 기한을 사용해 배치·예약·취소를 판단하는 SLO 지향 제어 사례를 제공한다. | [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]] |
| measures | [[꼬리 지연 시간]] | 목표 기한을 만족한 요청만 세는 goodput과 모든 요청의 지연 분포를 구분해 평가한다. | [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]] |

## 출처

- USENIX, [OSDI 2020 presentation and bibliographic record](https://www.usenix.org/conference/osdi20/presentation/gujarati)
- USENIX, [open-access paper PDF](https://www.usenix.org/system/files/osdi20-gujarati.pdf)

## 관련 항목

- [[대기열과 부하 제어]] — 요청 기한과 예측된 실행 시간을 입장·배치·취소 결정에 연결한다.
- [[리틀의 법칙]] — 평균 작업 수·처리율·체류 시간을 같은 경계에서 점검하는 유량 관계를 제공한다.
- [[꼬리 지연 시간]] — SLO, 기한 초과와 원시 처리율의 차이를 서비스 분포로 해석한다.
- [[LLM 추론 서비스 지표]] — LLM에서는 TTFT·TPOT와 goodput을 별도로 관찰하는 측정 체계다.
- [[LLM 서빙에서 처리량과 지연은 왜 함께 움직이는가]] — DNN 서빙의 기한 기반 제어를 자동회귀 LLM의 큐·배칭 문제와 비교한다.
