---
title: 초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가
aliases: [tokens per second is not enough, LLM 토큰 처리량의 한계, 토큰률과 LLM 서비스 능력]
summary: "초당 토큰 수가 토큰 종류·요청 길이·사용자 지연·품질·SLO 위반을 숨기는 이유를 프리필·디코드, goodput과 MLPerf의 시나리오 계약으로 분석한다."
tags: [type/analysis, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-24
updated: 2026-07-25
historical_layer: measurement
capability_layers: [realized-performance, scalability, resource-efficiency, reliable-results]
sources: ["Orca - A Distributed Serving System for Transformer-Based Generative Models", "Efficient Memory Management for Large Language Model Serving with PagedAttention", "DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving", "MLPerf Inference Benchmark", "The Tail at Scale", "A Proof for the Queuing Formula L = λW", "Serving DNNs like Clockwork Performance Predictability from the Bottom Up"]
status: active
graph_id: analysis-token-rate-service-capability
graph_visibility: public
---

## 문제 제기

“이 LLM 서버는 초당 몇 토큰을 생성하는가?”는 필요한 질문이지만 충분한 질문은 아니다. 합계 토큰률은 시스템이 일정 시간에 처리한 작업량을 보여주지만, 사용자가 첫 답을 언제 보았는지, 이후 토큰이 얼마나 고르게 도착했는지, 몇 요청이 기한을 넘겼는지와 결과 품질이 같았는지를 말하지 않는다.

[[Orca - A Distributed Serving System for Transformer-Based Generative Models]]와 [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]은 요청 사이의 계산 슬롯과 [[KV 캐시]] 메모리 슬롯을 재사용해 처리량을 높인다. [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]는 여기서 한 단계 더 나아가 [[프리필과 디코드]]의 지연 목표를 분리한다. [[MLPerf Inference Benchmark]]는 모델·품질·요청 시나리오를 고정하지 않은 처리량 비교가 왜 재현되기 어려운지 보여준다.

## 1. 토큰이라는 분모가 같지 않다

토큰은 모델의 토크나이저가 정한 단위다. 같은 텍스트도 토크나이저와 언어에 따라 토큰 수가 달라질 수 있다. 모델 구조, 정밀도, 어휘와 출력 규칙이 다른 시스템의 토큰/초는 동일한 의미 단위나 동일한 계산량을 보장하지 않는다.

한 모델 안에서도 **입력 토큰**, **출력 토큰**, 둘의 합계는 서로 다른 작업을 센다. 입력 토큰은 프리필에서 병렬 처리되고, 출력 토큰은 디코드에서 순차 생성된다. 긴 프롬프트를 많이 처리한 시스템은 총 토큰률이 높아도 첫 토큰이 늦을 수 있고, 짧은 답을 내는 설정은 출력 토큰률과 요청/초를 높이면서 사용자가 요구한 완전성을 잃을 수 있다.

따라서 토큰률에는 최소한 토큰의 종류, 모델·토크나이저, 입력·출력 길이 분포와 품질·종료 조건이 붙어야 한다.

## 2. 합계 처리량은 한 요청의 시간축을 지운다

자동회귀 서비스에서 사용자는 평균 GPU 이용률을 경험하지 않는다. 요청 뒤 첫 토큰까지의 TTFT, 이후 토큰 사이의 지연, 마지막까지의 종단 시간을 경험한다. 시스템이 많은 요청을 한꺼번에 배치하면 합계 토큰률은 오르지만 개별 요청이 배치 기회를 기다리는 시간이 길어질 수 있다.

같은 1,000 출력 토큰/초도 다음처럼 다를 수 있다.

- 소수 요청이 매우 빠르고 다수 요청은 큐에서 오래 기다린다.
- 모든 요청의 첫 토큰은 빠르지만 이후 토큰 사이에 긴 정지가 있다.
- 평균은 같지만 일부 요청의 TTFT나 TPOT가 SLO를 크게 넘는다.
- 짧은 출력이 대부분이라 요청/초는 높지만 긴 대화 요청은 굶는다.

평균 토큰률만으로는 이 분포를 복원할 수 없다. [[꼬리 지연 시간]]과 마찬가지로 요청별 지연을 직접 측정하고 백분위·기한 초과를 함께 보고해야 한다.

## 3. 프리필과 디코드의 간섭이 같은 합계 뒤에 숨는다

프리필은 프롬프트를 처리해 첫 토큰과 초기 캐시를 만들고, 디코드는 그 상태를 읽으며 이후 토큰을 하나씩 생성한다. 두 단계를 같은 GPU에 공배치하면 긴 프리필이 디코드 반복을 지연시키거나, 디코드 우선 정책이 새 요청의 TTFT를 늘릴 수 있다. 합계 토큰률이 유지되어도 어느 사용자 집단의 지연이 악화됐는지는 달라진다.

DistServe의 단계 분리는 TTFT와 TPOT를 각각 최적화할 수 있게 하지만 모델 가중치 중복과 KV 전송을 추가한다. 따라서 “토큰률이 더 높다”보다 **어떤 입력·출력 길이와 도착률에서, 어느 TTFT·TPOT 목표를 지키며, 몇 GPU로 얼마의 요청을 처리했는가**가 비교에 적합하다.

## 4. 원시 처리량과 유효 처리량은 다르다

처리량은 완료한 모든 작업을 세지만, 서비스는 결과가 제시간에 도착하고 품질 조건을 만족해야 유용하다. DistServe의 goodput은 TTFT와 TPOT SLO를 모두 지킨 요청의 목표 비율을 만족하는 최대 요청률이다. 예를 들어 같은 요청/초라도 한 시스템이 목표를 90%의 요청에서, 다른 시스템이 99%에서 지켰다면 같은 유효 용량이 아니다.

goodput도 조건 없는 보편 점수는 아니다. SLO 수치, 달성 목표, 부하 생성 방식과 실패 처리 규칙이 바뀌면 값이 바뀐다. 품질·안전·비용을 판정에 넣지 않았다면 그것들도 별도 축으로 남는다. 핵심은 유효 처리량의 판정 계약을 먼저 밝히는 것이다.

## 5. 표준 벤치마크도 시나리오 이름까지 읽어야 한다

MLPerf Inference는 모델·데이터셋·품질과 생성 길이 기준, 시스템 구성과 요청 시나리오를 규정한다. Offline 시나리오는 모든 표본을 준비한 대량 처리량을, Server/Interactive는 정해진 도착 과정과 지연 조건 아래 최대 처리율을 본다. 현대 LLM 작업은 모델별 TTFT·TPOT 한계도 둔다.

따라서 같은 MLPerf라도 Offline 결과와 Server 결과는 같은 숫자의 다른 표기가 아니다. 하나는 준비된 작업의 대량 처리 능력에, 다른 하나는 동적 요청과 지연 계약에 답한다. 반대로 MLPerf Server 결과도 임의의 제품 트래픽을 자동으로 대표하지 않는다. 표준 부하와 운영 부하 사이의 길이·도착·품질·지역·캐시 차이를 확인해야 한다.

## 비교 가능한 최소 문장

단일 토큰률 주장을 다음 요소를 가진 문장으로 바꾼다.

1. **작업**: 모델·토크나이저·정밀도, 데이터와 품질·출력 길이 조건
2. **부하**: 입력·출력 길이 분포, 요청 도착 과정·동시성·측정 시간
3. **처리량**: 요청/초와 입력·출력 토큰/초를 분리
4. **사용자 지연**: TTFT·TPOT 또는 토큰 간 지연·종단 지연의 p50·p95·p99
5. **유효성**: SLO 수치·달성 목표, 오류·거부·취소를 세는 규칙
6. **자원**: GPU 종류·수, 메모리·네트워크, 전력·에너지와 비용

예를 들어 “A는 B보다 토큰/초가 2배다”보다 “같은 모델·정밀도와 입력/출력 길이 분포에서, A는 p99 TTFT·TPOT 한계와 동일 품질을 99%의 요청에서 지키며 GPU당 요청 goodput이 B보다 높다”가 비교 가능한 주장에 가깝다. 실제 수치와 경계는 해당 시험이 증명한 범위만 넣어야 한다.

## 결론

초당 토큰 수는 LLM 시스템의 원시 작업률이지 서비스 능력 전체가 아니다. 토큰의 종류와 요청 혼합을 밝히고, 프리필의 첫 응답과 디코드의 연속 생성을 분리하며, 지연 분포·품질·SLO 달성 요청과 자원 비용을 함께 셀 때 비로소 사용자와 운영자가 사용할 수 있는 능력에 가까워진다.

[[LLM 추론 서비스 지표]]는 이 조건을 하나의 측정 벡터로 정리한다. 목표는 토큰률을 버리는 것이 아니라, 토큰률이 답하는 질문과 답하지 않는 질문을 분명히 하는 것이다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[LLM 추론 서비스 지표]] | 토큰률을 TTFT·TPOT·종단 지연, SLO 달성률·goodput과 자원 비용의 벡터 안에 배치한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]; [[MLPerf Inference Benchmark]] |
| synthesizes | [[프리필과 디코드]] | 입력과 출력 토큰이 서로 다른 병렬성·지연 의미를 가진 두 단계에서 처리됨을 비교한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |
| synthesizes | [[연속 배칭]] | 배치 처리량 향상이 개별 요청의 큐·토큰 지연과 같은 방향으로 움직이지 않을 수 있음을 설명한다. | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| synthesizes | [[KV 캐시]] | 캐시 메모리 효율이 활성 배치와 처리량을 바꾸지만 사용자 SLO 충족 여부를 단독으로 보장하지 않음을 설명한다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| responds_to | [[꼬리 지연 시간]] | 평균 토큰률이 숨기는 요청별 높은 백분위와 기한 초과를 서비스 능력에 다시 포함한다. | [[The Tail at Scale]] |
| synthesizes | [[대기열과 부하 제어]] | 요청·토큰 단위를 구분하고 배치 처리율, 기한 초과·거부, SLO 안에 완료한 goodput을 하나의 운영 결과로 비교한다. | [[A Proof for the Queuing Formula L = λW]], [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]] |

## 출처

- [[Orca - A Distributed Serving System for Transformer-Based Generative Models]]
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]
- [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]
- [[MLPerf Inference Benchmark]]
- [[The Tail at Scale]]
- [[A Proof for the Queuing Formula L = λW]]
- [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]]

## 관련 항목

- [[LLM 추론 서비스 지표]] — 토큰률을 보완하는 지연·유효 처리량·자원 조건을 체계화한다.
- [[프리필과 디코드]] — 입력·출력 토큰 처리의 실행 단계와 간섭을 구분한다.
- [[KV 캐시는 왜 LLM 추론 처리량을 제한하는가]] — 캐시 수용량과 동적 배칭이 원시 처리량을 만드는 경로를 분석한다.
- [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]] — 평균과 원시 처리량의 한계를 일반 서비스 경계로 확장한다.
- [[컴퓨팅 능력이란 무엇인가]] — 작업·결과 계약·시스템 경계·고정 조건을 포함한 상위 비교 틀이다.
