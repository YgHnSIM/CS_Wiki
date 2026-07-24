---
title: 같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가
aliases: [LLM SLO resource cost analysis, LLM 유효 요청당 비용, LLM 추론 자원 회계]
summary: "같은 모델 품질과 TTFT·TPOT SLO를 만족한 LLM 서비스를 에너지·가속기 시간·유휴 용량·실패 요청까지 포함한 유효 요청당 물리 자원 비용으로 비교하는 분석."
tags: [type/analysis, domain/machine-learning, domain/performance, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
historical_layer: measurement
capability_layers: [realized-performance, scalability, resource-efficiency, reliable-results]
sources: ["TokenPowerBench - Benchmarking the Power Consumption of LLM Inference", "MLPerf Inference Power Measurement", "MLPerf Inference Benchmark", "The Case for Energy-Proportional Computing", "A Proof for the Queuing Formula L = λW", "Serving DNNs like Clockwork Performance Predictability from the Bottom Up"]
status: active
graph_id: analysis-llm-slo-resource-cost
graph_visibility: public
---

## 문제 제기

두 LLM 서비스가 같은 출력 토큰/초를 보고해도 사용자가 받은 결과와 운영자가 소비한 자원은 다를 수 있다. 한 서비스는 첫 토큰이 늦거나 일부 요청을 거부할 수 있고, 다른 서비스는 더 많은 가속기를 대기시켜 같은 지연을 유지할 수 있다. 따라서 비용 비교의 첫 단계는 가격표를 붙이는 일이 아니라 **같은 결과 계약을 만족한 요청 하나에 실제 물리 자원이 얼마나 들었는지** 세는 일이다.

이 분석은 공급자별 요금, 환율이나 감가상각처럼 시점·계약에 따라 달라지는 화폐 가격을 다루지 않는다. 대신 [[LLM 추론 에너지 지표]]의 J와 가속기 시간, [[LLM 추론 서비스 지표]]의 품질·TTFT·TPOT·goodput을 같은 측정 구간과 분모에 맞춘다.

## 1. 먼저 good request를 고정한다

`good request`는 정한 모델·토크나이저와 품질·출력 길이 조건을 통과하고, TTFT·TPOT 또는 종단 지연 SLO를 만족해 완전한 결과를 반환한 요청이다. SLO 수치와 달성 목표, 요청 혼합이 다르면 good request의 의미도 달라진다.

원시 완료 요청이나 출력 토큰을 분모로 두면 결과를 짧게 만들거나 지연된 요청을 완료로 세고, 어려운 요청을 거부하는 시스템이 유리해질 수 있다. 비교 전에 입력·출력 길이 분포, 종료 규칙, 품질 평가와 실패 처리 규칙을 고정해야 한다.

대기열의 관점에서는 평균 활성 작업 수·유효 처리율·체류 시간이 같은 요청 경계에 있어야 한다. [[리틀의 법칙]]은 이 평균 관계를 점검하게 하지만, 거부·시간 초과가 있는 서비스에서 도착률, 승인률과 완료률은 다를 수 있다. 따라서 [[대기열과 부하 제어]]의 보고에는 각 유량과 거부된 요청이 사용한 자원을 별도로 남긴다. Clockwork가 SLO 안에 끝난 요청만 goodput으로 셌듯, 실패 요청을 good request 분모에서 빼더라도 그 작업이 사용한 에너지와 장비 시간은 분자에서 사라지지 않는다.

## 2. 에너지와 가속기 시간을 같은 분모로 둔다

최소 자원 벡터는 다음 두 값을 포함한다.

`J/good request = 측정 구간 전체 시스템 에너지 / good requests`

`accelerator-hour/good request = (가속기 수 × 측정 시간[h]) / good requests`

첫 값은 [[MLPerf Inference Power Measurement]]처럼 성능 실행과 같은 구간에서 측정한 전체 시스템 에너지를 쓰는 것이 비교에 유리하다. 둘째 값은 전력이 다른 장치에서도 제한된 가속기 점유를 드러낸다. 에너지가 낮지만 더 많은 장비를 오래 묶는 구성과, 장비 시간은 적지만 높은 전력을 쓰는 구성을 한 숫자로 숨기지 않는다.

## 3. 유휴 전력은 0건의 요청에도 발생한다

낮은 부하의 LLM 서비스는 모델 복제, 메모리 상주, 네트워크 연결과 장애 여유를 유지한다. [[에너지 비례 컴퓨팅]]이 보여주듯 실제 전력은 작업량과 완전히 비례하지 않으며, 요청이 적어도 기저 전력이 남는다.

측정 구간 전체의 **총량 에너지**에는 이 대기 비용을 포함한다. 최적화가 추가한 동적 비용만 알고 싶다면 유휴 기준선을 뺀 **증분 에너지**를 함께 보고할 수 있지만 총량을 삭제하지 않는다. 통합으로 유휴 전력을 줄이는 대신 꼬리 지연·가용성이 나빠져 더 많은 재시도나 복제가 필요하다면 서비스 전체 비용은 다시 늘 수 있다.

## 4. 길이와 단계가 에너지 귀속을 바꾼다

[[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]]가 구분하듯 긴 입력은 주로 프리필을, 긴 출력은 디코드 반복을 늘린다. 합계 토큰당 J는 입력과 출력의 서로 다른 작업을 섞으므로 최소한 `J/input token`과 `J/output token`을 분리한다.

공배치에서는 여러 요청의 프리필·디코드가 겹친다. 단계별 에너지는 전력 샘플과 실행 이벤트를 맞춘 귀속값이며 완전히 독립된 계량기 값이 아닐 수 있다. 단계 합계와 전체 시스템 총량이 일치하는지, 공유 유휴·네트워크·CPU 비용을 어떤 규칙으로 나눴는지 밝혀야 한다.

## 5. 실패한 요청의 자원은 사라지지 않는다

거부, 시간 초과, 오류, 취소와 재시도는 good request 분모에는 들어가지 않지만 이미 사용한 큐·프리필·디코드·네트워크 자원은 분자에 남긴다. 이 규칙은 시스템이 실패 요청을 통계에서 지워 효율을 높여 보이는 일을 막는다.

품질 문턱을 통과하지 못한 결과도 같은 원칙을 적용한다. 더 낮은 정밀도나 공격적인 종료로 에너지를 줄였더라도 결과 계약을 깨면 유효 능력의 개선이 아니다. 모든 요청 수, 처리 시도 수, good request 수와 실패 유형을 나란히 보고해야 분모 선택을 감사할 수 있다.

## 6. GPU 센서와 서비스 전체 비용을 구분한다

GPU 텔레메트리는 단계별 변화를 보기 좋지만 CPU·DRAM·네트워크·전원 변환을 빠뜨린다. 노드 계측은 서버 내부를 넓게 포함하지만 분산 추론의 스위치·로드밸런서와 시설 경계는 별도일 수 있다.

비교 표에는 적어도 다음을 함께 둔다.

| 범주 | 보고할 값 |
|---|---|
| 결과 계약 | 모델·정밀도·품질, 입력/출력 길이, TTFT·TPOT·종단 SLO |
| 수요 | 도착 과정, 동시성, 부하 구간, 측정 시간 |
| 결과 수 | 전체·완료·good request, 거부·시간 초과·오류·재시도 |
| 사용자 성능 | TTFT·TPOT·종단 지연 백분위, 요청·입력/출력 토큰 goodput |
| 에너지 | 전체 시스템 총 J, 평균·첨두 W, J/good request, 입력/출력 J/token |
| 제한 자원 | 가속기 종류·수, accelerator-hour/good request, 메모리와 네트워크 |
| 경계 | GPU·노드·전체 SUT·벽면 AC, 유휴·워밍업·시설 포함 여부 |

## 결론

같은 SLO의 LLM 서비스 비용은 토큰 가격이나 GPU 전력 한 값이 아니라 **품질과 사용자 지연을 만족한 요청당 전체 시스템 에너지와 제한 자원 시간**의 벡터다. 유휴 전력과 실패·재시도 비용은 분자에 남기고, 입력·출력 길이와 프리필·디코드 귀속을 분리하며, GPU 센서와 벽면 AC 경계를 명시해야 비교가 재현 가능하다.

이 물리 자원 회계를 먼저 만들면 이후 지역별 전력 믹스나 실제 계약 가격을 별도 층으로 결합할 수 있다. 반대로 가격부터 비교하면 하드웨어 이용률, 시스템 경계와 SLO 위반이 숨겨져 기술적 개선의 원인을 재사용하기 어렵다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[LLM 추론 에너지 지표]] | 전체 시스템 J와 가속기 시간을 품질·SLO를 만족한 요청이라는 같은 분모로 결합한다. | [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]] |
| synthesizes | [[LLM 추론 서비스 지표]] | TTFT·TPOT·품질을 통과한 good request를 자원 회계의 유효 작업 단위로 사용한다. | [[MLPerf Inference Power Measurement]] |
| synthesizes | [[에너지 비례 컴퓨팅]] | 총량과 증분 에너지를 구분하고 낮은 부하의 유휴 전력을 서비스 용량 비용에 남긴다. | [[The Case for Energy-Proportional Computing]] |
| constrains | [[컴퓨팅 능력이란 무엇인가]] | 같은 작업·결과 계약·시스템 경계에서 측정한 자원만 LLM 서비스 능력 비교에 사용하게 한다. | [[MLPerf Inference Benchmark]] |
| synthesizes | [[대기열과 부하 제어]] | 승인·거부·시간 초과가 있는 부하에서 유효 요청 분모와 이미 소비한 자원 분자를 함께 보존한다. | [[A Proof for the Queuing Formula L = λW]], [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]] |

## 출처

- [[TokenPowerBench - Benchmarking the Power Consumption of LLM Inference]]
- [[MLPerf Inference Power Measurement]]
- [[MLPerf Inference Benchmark]]
- [[The Case for Energy-Proportional Computing]]
- [[A Proof for the Queuing Formula L = λW]]
- [[Serving DNNs like Clockwork Performance Predictability from the Bottom Up]]

## 관련 항목

- [[LLM 추론 에너지 지표]] — 분석에 사용하는 단위·분모·계측 경계를 정의한다.
- [[LLM 추론 서비스 지표]] — good request를 판정하는 품질·지연·처리량 계약을 제공한다.
- [[에너지 비례 컴퓨팅]] — 낮은 부하와 유휴 상태의 기저 전력을 설명한다.
- [[프리필과 디코드]] — 입력·출력 길이가 에너지에 기여하는 실행 단계를 구분한다.
- [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]] — 자원 비용과 SLO를 숨기는 원시 토큰률의 한계를 분석한다.
