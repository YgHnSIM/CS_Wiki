---
title: LLM 추론 에너지 지표
aliases: [LLM inference energy metrics, LLM energy per token, LLM 요청당 에너지, LLM 추론 전력 지표]
summary: "LLM 추론의 전력과 에너지를 GPU·노드·전체 시스템 경계, 프리필·디코드 단계와 품질·지연 조건에 맞춰 요청·입력 토큰·출력 토큰당 자원으로 기록하는 측정 체계."
tags: [type/concept, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2021
historical_note: "MLPerf Inference v1.0의 첫 전력 결과가 공개된 2021년을 대표 시점으로 두고, 2026년 TokenPowerBench의 단계별 LLM 계측을 후속 구체화로 본다."
historical_layer: measurement
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["TokenPowerBench - Benchmarking the Power Consumption of LLM Inference", "MLPerf Inference Power Measurement", "MLPerf Inference Benchmark"]
status: active
graph_id: concept-llm-inference-energy-metrics
graph_visibility: public
---

## 개요

[[LLM 추론 에너지 지표]]는 대화형 모델의 자원 사용을 순간 전력 한 값이나 합계 토큰당 에너지 하나로 압축하지 않는 측정 체계다. 같은 모델이라도 요청 길이, [[프리필과 디코드]], 배치, 병렬화와 [[LLM 추론 서비스 지표|TTFT·TPOT SLO]]가 바뀌면 전력 곡선·실행 시간·유효 처리량이 함께 달라진다.

비교의 기본 단위는 **어떤 결과 계약을 만족한 작업에, 어느 시스템 경계에서, 얼마의 에너지와 가속기 시간이 들었는가**다. 전력(W), 에너지(J), 입력·출력 토큰당 J, 요청당 J와 가속기 시간은 서로 다른 질문에 답하므로 원시값과 분모를 함께 보존한다.

## 전력과 에너지

전력은 에너지를 쓰는 속도이며 에너지는 측정 구간의 전력을 시간에 따라 적분한 양이다.

`E(J) = ∫ P(t) dt`

전력이 비교적 안정적인 구간에서는 다음 근사로 계산할 수 있다.

`E(J) ≈ 평균 전력(W) × 실행 시간(s)`

같은 전력으로 더 오래 실행하면 에너지가 늘고, 더 높은 전력으로 충분히 빨리 끝내면 총에너지가 줄 수도 있다. 따라서 첨두·평균 전력만으로 효율을 판정하거나 에너지만 보고 사용자 지연을 지우지 않는다.

## 분모를 나누는 이유

| 지표 | 계산 또는 의미 | 반드시 함께 기록할 조건 |
|---|---|---|
| 평균·첨두 전력(W) | 측정 구간의 소비 속도 | 구간, 샘플링 주기, 시스템 경계 |
| 실행 에너지(J) | 전력의 시간 적분 | 시작·종료 이벤트, 워밍업·유휴 포함 여부 |
| 요청당 에너지(J/request) | 총에너지 ÷ 완료 요청 | 성공·실패·SLO 판정 규칙 |
| 입력 토큰당 에너지(J/input token) | 프롬프트 처리 에너지 ÷ 입력 토큰 | 토크나이저, 입력 길이 분포, 프리필 귀속 |
| 출력 토큰당 에너지(J/output token) | 생성 에너지 ÷ 출력 토큰 | 출력 길이·종료 규칙, 디코드 귀속 |
| 유효 요청당 에너지(J/good request) | 총에너지 ÷ 품질·SLO를 만족한 요청 | 품질, TTFT·TPOT 한계, 달성 목표 |
| 유효 요청당 가속기 시간 | 가속기 수 × 측정 시간 ÷ 유효 요청 | 장치 종류·수, 예약과 실제 사용 경계 |

입력 토큰과 출력 토큰은 같은 “토큰”이어도 실행 단계와 사용자 가치가 다르다. 합계 토큰당 J만 보고하면 긴 입력이 많은 부하와 긴 출력을 생성한 부하를 구분할 수 없다. 요청당 J도 모델이 더 짧은 답을 내거나 요청을 거부해 분모를 유리하게 만들 수 있으므로 품질·출력 길이와 완료 규칙을 고정해야 한다.

## 유효 요청당 자원

서비스 비교에서는 품질과 TTFT·TPOT SLO를 모두 통과한 요청을 `good request`로 정의할 수 있다.

`J/good request = 측정 구간 총에너지 / good requests`

`accelerator-hour/good request = (가속기 수 × 측정 구간 시간[h]) / good requests`

첫 식은 전력과 시간을 함께 반영하고, 둘째 식은 전력 계측과 별개로 제한된 가속기 점유를 나타낸다. 전력 효율이 좋아도 더 많은 가속기나 긴 시간이 필요할 수 있으므로 두 값을 함께 보고한다. 거부·시간 초과·오류 요청에 쓴 자원은 총에너지와 총 가속기 시간에 남기되 유효 요청 분모에는 넣지 않는다.

## 시스템 경계

| 경계 | 포함하는 대표 값 | 장점 | 빠지는 것 |
|---|---|---|---|
| GPU 텔레메트리 | 가속기 보드 또는 칩 전력 | 단계별 고주파 관찰이 쉽다 | CPU·DRAM·네트워크·전원 변환 |
| 노드 | GPU, CPU, DRAM과 노드 구성요소 | 서버 내부 비용을 함께 본다 | 외부 스위치·로드밸런서·시설 |
| 전체 SUT | 요청 처리에 쓰인 서버·네트워크 장비 | 분산 추론 경계를 반영한다 | LoadGen·클라이언트나 시설은 규칙에 따라 다름 |
| 벽면 AC | 전력 분석기에서 본 전체 시스템 입력 | 전원 변환 손실을 포함한 재현 가능한 경계 | 시설 냉각·상위 전력 분배는 별도일 수 있음 |

[[MLPerf Inference Power Measurement]]는 성능 실행과 같은 구간의 벽면 AC 전체 시스템 전력을 공식 비교 경계로 삼는다. [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]]는 GPU·노드·시스템 계측을 나란히 수집해 경계가 바뀔 때 값이 어떻게 달라지는지 분석한다. 두 방식은 경쟁 지표가 아니라 관찰 해상도와 포함 범위가 다른 계측 층이다.

## 프리필·디코드와 유휴

프리필 에너지는 입력 길이, 청크와 병렬 연산에 크게 좌우되고, 디코드 에너지는 출력 길이, 활성 요청 수와 반복적인 가중치·KV 접근에 좌우된다. 단계별 에너지를 얻으려면 전력 샘플을 요청 이벤트와 정렬하고, 겹친 배치에서는 여러 요청에 귀속하는 규칙을 명시해야 한다. 공배치된 프리필·디코드를 임의로 완전히 분리한 값처럼 보고해서는 안 된다.

유휴 전력도 서비스 비용이다. 총 측정 에너지인 **총량(gross)**을 기본값으로 보존하고, 필요하면 `총량 - 유휴 기준 전력 × 시간`으로 **증분(incremental)** 에너지를 함께 계산한다. 증분값은 최적화가 추가한 동적 비용을 보여주지만, 대기 용량을 유지하는 실제 에너지를 지우므로 총량을 대체하지 않는다.

## 최소 측정 벡터

1. 모델·토크나이저·정밀도와 품질·출력 길이 기준
2. 입력·출력 길이 분포, 도착 과정, 동시성, 워밍업과 측정 시간
3. TTFT·TPOT·종단 지연의 백분위와 good request 판정
4. 프리필·디코드·유휴의 시작·종료와 중첩 귀속 규칙
5. GPU·노드·전체 SUT·벽면 AC 중 계측 경계와 샘플링 방법
6. 평균·첨두 W, 총 J, 입력/출력 토큰당 J, good request당 J
7. 가속기 종류·수, 가속기 시간, 실패·거부·취소·재시도 처리

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[프리필과 디코드]] | 전력 샘플을 입력 처리·생성 구간과 맞춰 단계별 에너지와 토큰 분모를 구분한다. | [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]] |
| narrower | [[LLM 추론 서비스 지표]] | LLM 서비스의 품질·지연·처리량 계약에 전력·에너지와 가속기 시간 축을 구체화한다. | [[MLPerf Inference Power Measurement]] |
| measures | [[컴퓨팅 능력이란 무엇인가]] | 동일 작업·품질·SLO 아래의 전체 시스템 에너지와 제한 자원 시간을 자원 효율로 측정한다. | [[MLPerf Inference Power Measurement]] |

## 출처

- [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]]
- [[MLPerf Inference Power Measurement]]
- [[MLPerf Inference Benchmark]]

## 관련 항목

- [[같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가]] — 측정값을 유효 요청당 물리 자원 비용으로 종합한다.
- [[LLM 추론 서비스 지표]] — 에너지 분모를 성립시키는 품질·TTFT·TPOT·goodput 계약을 설명한다.
- [[프리필과 디코드]] — 입력과 출력 토큰 에너지의 실행 단계 차이를 제공한다.
- [[에너지 비례 컴퓨팅]] — 유휴부터 첨두까지 전력이 작업량을 얼마나 따라가는지 묻는다.
- [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]] — 원시 처리량만으로 사용자 가치와 자원 비용을 판단할 수 없는 이유를 분석한다.
