---
title: LLM 추론 서비스 지표
aliases: [LLM inference service metrics, LLM serving metrics, TTFT와 TPOT, LLM goodput, LLM 서비스 성능 지표]
summary: "LLM 추론 서비스를 첫 토큰 시간·출력 토큰당 시간·종단 지연, 요청·토큰 처리량, SLO 달성률과 goodput으로 나누고 작업·품질·시나리오 조건을 함께 기록하는 측정 체계."
tags: [type/concept, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2024
historical_note: "TTFT와 토큰 간 지연은 더 앞선 시스템에도 있었지만, 두 SLO를 만족하는 goodput을 명시한 DistServe의 2024년 출판을 대표 시점으로 둔다. MLPerf 규칙은 판본별로 갱신된다."
historical_layer: measurement
capability_layers: [realized-performance, scalability, resource-efficiency, reliable-results]
sources: ["DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving", "MLPerf Inference Benchmark", "The Tail at Scale"]
status: active
graph_id: concept-llm-inference-service-metrics
graph_visibility: public
---

## 개요

[[LLM 추론 서비스 지표]]는 자동회귀 모델의 속도를 하나의 토큰/초로 압축하지 않고, 사용자가 기다리는 단계와 서비스가 완료한 유효 작업을 나눠 기록하는 체계다. 같은 [[Transformer]]라도 [[프리필과 디코드]], 요청 길이와 도착 과정, 배치·캐시 정책에 따라 첫 응답·연속 생성·전체 처리량이 서로 다르게 움직인다.

지표는 숫자만으로 완성되지 않는다. 모델·토크나이저와 정밀도, 입력·출력 길이 분포, 품질 기준, 도착 과정, 동시성, 하드웨어·소프트웨어와 측정 구간을 함께 고정해야 한다. 이 계약이 다르면 같은 이름의 “토큰”과 “요청”도 작업량이 다르다.

## 지연 지표

- **첫 토큰 시간(TTFT)**: 요청이 서비스 경계에 들어온 때부터 첫 출력 토큰을 받을 때까지다. 큐, 프리필과 반환 경로가 포함되는지 명시한다.
- **출력 토큰당 시간(TPOT)**: DistServe에서는 첫 토큰을 제외한 출력 토큰의 평균 시간으로 정의한다. 개별 토큰 사이 간격(inter-token latency)의 분포와 같은 값은 아니므로 집계 규칙을 밝힌다.
- **종단 지연**: 요청 수신부터 마지막 출력 또는 종료 신호까지다. TTFT, 이후 토큰 수와 토큰 간 시간이 함께 영향을 준다.
- **백분위와 기한 초과**: 평균뿐 아니라 p50·p95·p99와 SLO 위반률을 보고한다. 스트리밍 요청은 요청별 TTFT·TPOT를 먼저 계산한 뒤 어떤 요청 분위수를 취했는지 구분한다.

TTFT가 짧아도 이후 토큰이 느릴 수 있고, TPOT가 짧아도 큐에서 오래 기다릴 수 있다. 종단 지연이 같아도 출력 길이가 다르면 토큰 생성 속도가 다르다. 따라서 한 지표를 다른 지표의 대리값으로 사용하지 않는다.

## 처리량과 goodput

**요청 처리량**은 단위 시간에 완료한 요청 수, **토큰 처리량**은 처리한 토큰 수다. 토큰 처리량은 입력·출력·전체 토큰 중 무엇을 세는지 밝혀야 한다. 긴 프롬프트는 입력 토큰률을, 긴 생성은 출력 토큰률을 키울 수 있으므로 요청 혼합이 바뀌면 시스템이 같아도 값이 달라진다.

**goodput**은 성능 조건을 통과한 유효 작업량이다. DistServe는 TTFT와 TPOT SLO를 모두 만족한 요청의 비율이 목표에 도달하는 최대 요청 도착률을 goodput으로 정의하고, 이를 GPU 수로 나눈 GPU당 goodput도 사용한다. 이 정의에는 다음 네 요소가 필요하다.

1. TTFT와 TPOT의 수치 한계
2. 두 한계를 모두 만족해야 하는 요청 단위 판정
3. 만족해야 할 요청 비율인 SLO attainment 목표
4. 최대 요청률을 찾는 부하 생성·관측 규칙

goodput은 실패·시간 초과·지연 위반 요청을 원시 처리량과 구분하지만, 모든 서비스의 유일한 정의는 아니다. 품질, 안전, 가용성과 비용을 판정에 포함하려면 그 조건을 별도로 명시해야 한다.

## 벤치마크 계약

[[MLPerf Inference Benchmark]]는 모델·데이터셋·품질 문턱과 시스템 유형을 고정하고, 요청 생성 시나리오에 따라 지연 또는 처리량을 측정한다. Offline은 모든 표본을 한꺼번에 제공한 처리량, Server/Interactive는 정해진 도착 과정과 지연 조건 아래의 최대 처리율, 스트림 시나리오는 높은 백분위 지연을 중심으로 본다. 현대 LLM 작업에는 모델별 TTFT·TPOT 조건과 출력 품질·길이 요구가 적용된다.

이 표준화는 재현 가능한 비교를 돕지만 실제 운영 부하 전체를 대표하지 않는다. 벤치마크 점수를 서비스 용량 계획에 쓰려면 실제 프롬프트·출력 길이, 급증·지역, 캐시, 비용과 오류 조건의 차이를 별도로 검증해야 한다.

## 최소 측정 벡터

| 범주 | 최소 기록 |
|---|---|
| 작업·품질 | 모델·토크나이저·정밀도, 데이터/요청 종류, 품질·출력 길이 조건 |
| 부하 | 입력·출력 길이 분포, 도착 과정과 목표 요청률, 동시성, 워밍업·측정 시간 |
| 사용자 지연 | TTFT·TPOT/토큰 간 지연·종단 지연의 집계 규칙과 p50·p95·p99 |
| 유효 처리량 | 요청/초, 입력·출력 토큰/초, SLO 한계·달성 목표와 goodput |
| 시스템 경계 | GPU 종류·수, 메모리, 병렬화, 네트워크, 런타임·스케줄러·캐시 정책 |
| 자원 비용 | GPU 시간, 메모리 점유, 전력·에너지와 요청 또는 유효 토큰당 비용 |
| 실패 처리 | 거부·취소·시간 초과·오류·재시도와 불완전 결과를 세는 규칙 |

## 흔한 오해

- 출력 토큰/초가 높다고 TTFT·TPOT와 높은 백분위가 자동으로 낮은 것은 아니다.
- 평균 TPOT는 개별 토큰 간 지연의 변동과 긴 멈춤을 숨길 수 있다.
- 입력 토큰과 출력 토큰은 계산 단계와 사용자 가치가 달라 합계만으로 비교하기 어렵다.
- SLO 수치가 같아도 달성 목표가 90%인지 99%인지에 따라 goodput이 달라진다.
- Offline 결과와 Server/Interactive 결과는 요청 도착과 지연 계약이 달라 직접 교환할 수 없다.
- 모델·토크나이저·품질·출력 길이가 다른 토큰률은 같은 작업량의 비교가 아니다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[프리필과 디코드]] | 첫 토큰과 이후 토큰 생성의 지연을 TTFT와 TPOT로 나눠 관찰한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| measures | [[연속 배칭]] | 동적 배칭이 요청·토큰 처리량을 늘리면서 지연 SLO를 얼마나 유지하는지 평가한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| measures | [[KV 캐시]] | 캐시 수용량과 배치 정책의 효과를 동일 부하·지연 조건의 goodput과 자원 비용으로 연결한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| narrower | [[컴퓨팅 능력이란 무엇인가]] | LLM 서비스를 지정 작업·결과 계약·시스템 경계 안에서 비교하는 특화된 측정 틀이다. | [[MLPerf Inference Benchmark]] |

## 출처

- [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]
- [[MLPerf Inference Benchmark]]
- [[The Tail at Scale]]

## 관련 항목

- [[프리필과 디코드]] — TTFT와 TPOT가 대응하는 실행 단계와 단계 간 간섭을 설명한다.
- [[꼬리 지연 시간]] — 평균이 숨기는 높은 백분위와 기한 초과를 일반 서비스 관점에서 다룬다.
- [[연속 배칭]] — 동적 부하에서 요청 사이 계산 슬롯을 재사용하는 방법이다.
- [[KV 캐시]] — 동시 요청과 활성 토큰 수를 제한하는 요청별 메모리 상태다.
- [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]] — 지표 벡터가 필요한 이유를 단일 처리량 수치의 한계에서 분석한다.
