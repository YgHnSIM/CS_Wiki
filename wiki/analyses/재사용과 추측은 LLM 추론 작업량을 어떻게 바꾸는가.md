---
title: 재사용과 추측은 LLM 추론 작업량을 어떻게 바꾸는가
aliases: [LLM reuse and speculation analysis, LLM 작업량 재사용, 캐싱과 추측 디코딩 비교]
summary: "요청 내부 KV 재사용, 요청·호출 사이 접두사 KV 캐싱과 드래프트–타깃 추측 디코딩을 비교해, 각각 피한 타깃 작업과 추가 캐시·검증 작업이 지연·메모리·에너지에 미치는 영향을 분석한다."
tags: [type/analysis, domain/machine-learning, domain/systems, domain/performance, status/active]
created: 2026-07-25
updated: 2026-07-25
historical_layer: service
capability_layers: [realized-performance, scalability, resource-efficiency, reliable-results]
sources: ["Attention Is All You Need", "Efficient Memory Management for Large Language Model Serving with PagedAttention", "SGLang - Efficient Execution of Structured Language Model Programs", "Fast Inference from Transformers via Speculative Decoding", "DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving"]
status: active
graph_id: analysis-llm-reuse-speculation-work
graph_visibility: public
---

## 문제 제기

LLM 추론 최적화는 흔히 “계산을 줄인다”라고 묶이지만 [[KV 캐시]], [[접두사 KV 캐싱]], [[추측 디코딩]]은 작업량을 서로 다른 방식으로 바꾼다. 첫째는 같은 요청의 과거 상태를 보존하고, 둘째는 여러 요청·호출의 동일 토큰 접두사를 공유하며, 셋째는 작은 모델과 추가 검증 계산을 투입해 큰 모델의 직렬 호출을 줄인다.

비교의 핵심은 최종 지연만 보는 것이 아니라 **어떤 타깃 작업을 피했고 어떤 새 작업을 추가했는가**를 같은 시스템 경계에서 세는 것이다.

## 1. 요청 내부 KV 재사용

표준 자동회귀 디코딩은 이전 토큰의 키·값을 [[KV 캐시]]에 보존한다. 새 토큰마다 과거 위치의 키·값 투영을 다시 계산하지 않지만, 캐시를 읽고 새 상태를 쓰며 과거 문맥에 어텐션하는 일은 남는다.

이 방식은 거의 모든 생성 토큰에서 적중하지만 요청 수명 동안 GPU 메모리를 점유한다. 절감된 과거 키·값 재계산과 추가된 캐시 저장·읽기·할당을 함께 세어야 한다. 캐시가 활성 배치를 줄이면 한 요청의 계산 절감이 서비스 처리량 감소로 이어질 수도 있다.

## 2. 교차 요청·호출 접두사 재사용

[[접두사 KV 캐싱]]은 동일한 모델 실행 조건과 토큰 접두사에서 이전 프리필 상태를 찾아 재사용한다. 시스템 프롬프트나 few-shot 예시가 반복되면 접두사 길이만큼의 타깃 프리필 계산을 피할 수 있다. 적중하지 않은 접미사와 이후 디코드는 그대로 수행한다.

대신 완료 뒤에도 KV 상태를 보존할 메모리, 접두사 검색과 트리 메타데이터, LRU 퇴거와 캐시 인지 스케줄링이 추가된다. 보존 공간을 늘리면 적중률은 오를 수 있지만 실행 중 요청의 배치 공간이 줄 수 있다. 접두사 일치가 없는 부하에서는 관리 오버헤드만 남는다.

## 3. 드래프트–타깃 추측 실행

[[추측 디코딩]]은 저장된 타깃 작업을 재사용하지 않는다. 작은 드래프트 모델이 미래 후보를 만들고, 타깃 모델이 여러 후보 위치를 병렬 검증한다. 후보가 수락되면 한 번의 타깃 직렬 실행으로 여러 출력 토큰을 확정한다.

절감되는 것은 출력 토큰당 **타깃 직렬 실행 횟수**다. 추가되는 것은 드래프트 생성, 더 넓은 타깃 검증과 거부된 후보 작업이다. 따라서 벽시계 지연이 줄면서 총 산술량이나 에너지가 늘 수 있다. 정확한 수락·보정 절차가 없으면 타깃 분포 보존이라는 결과 계약도 깨진다.

## 세 방법의 비교

| 방법 | 재사용·추측 단위 | 피하는 타깃 작업 | 추가 비용 | 주요 실패 조건 |
|---|---|---|---|---|
| 요청 내부 KV 재사용 | 같은 요청의 과거 토큰 | 과거 위치의 K·V 재계산 | KV 읽기·쓰기·요청 수명 메모리 | 긴 문맥과 많은 동시 요청으로 배치 수용량 감소 |
| 접두사 KV 캐싱 | 호출 사이의 동일 토큰 접두사 | 적중 접두사의 프리필 | 캐시 보존·검색·퇴거·스케줄링 | 낮은 적중률, 설정 불일치, 캐시 스래싱·기아 |
| 추측 디코딩 | 드래프트가 제안한 미래 후보 | 타깃 모델의 직렬 디코드 반복 | 드래프트 실행·병렬 검증·거부 작업 | 낮은 수락률, 비싼 드래프트, 비효율적 검증 커널 |

## 같은 분모로 측정하기

세 방법을 비교하려면 기준 실행과 최적화 실행에서 다음 항등식을 추적하는 편이 유용하다.

`순 타깃 작업 변화 = 기준 타깃 작업 - 피한 타깃 작업 + 추가 타깃 검증 작업`

여기에 드래프트 모델 작업, 캐시 메모리·조회·퇴거, 데이터 전송과 유휴 전력을 별도 항으로 더한다. FLOP만으로는 메모리 대역폭과 직렬 경로를 설명할 수 없으므로 벽시계 가속과 자원 절감을 따로 보고한다.

최소 비교 단위는 동일 모델·토크나이저·품질·입출력 길이 분포와 동일한 [[LLM 추론 서비스 지표|TTFT·TPOT SLO]]를 만족한 요청이다. 다음 값을 함께 기록한다.

1. 피한 프리필 토큰과 피한 과거 K·V 재계산
2. 접두사 적중률·퇴거·캐시 점유와 활성 배치
3. 추측 후보 길이·수락률·반복당 확정 토큰
4. 드래프트·타깃 검증의 시간·연산·메모리 트래픽
5. 요청/출력 토큰 goodput, 높은 백분위 지연과 분포·품질 검증

## 결론

재사용은 이전 계산의 결과를 저장해 같은 상태에서 다시 쓰고, 추측은 미래에 필요할 가능성이 있는 계산을 먼저 수행해 비싼 직렬 경로를 줄인다. 둘 다 처리 시간을 줄일 수 있지만 저장 공간, 추가 계산과 스케줄링 비용의 위치가 다르다. “몇 배 빨라졌다”보다 피한 타깃 작업과 추가 작업, 결과 계약과 SLO를 함께 보고해야 어떤 시스템에서 이득이 재현되는지 알 수 있다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[KV 캐시]] | 요청 내부 재계산 절감과 요청 수명 동안의 메모리 점유를 하나의 작업량 교환으로 정리한다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| synthesizes | [[접두사 KV 캐싱]] | 호출 사이에서 피한 프리필과 캐시 보존·검색·퇴거 비용을 같은 경계에서 센다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |
| synthesizes | [[추측 디코딩]] | 줄어든 타깃 직렬 실행과 추가 드래프트·검증·거부 작업, 분포 보존 계약을 함께 비교한다. | [[Fast Inference from Transformers via Speculative Decoding]] |
| measures | [[LLM 추론 서비스 지표]] | 작업량 변화가 TTFT·TPOT·goodput과 결과 품질로 이어지는지를 동일 SLO에서 평가한다. | [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]] |

## 출처

- [[Attention Is All You Need]]
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]
- [[SGLang - Efficient Execution of Structured Language Model Programs]]
- [[Fast Inference from Transformers via Speculative Decoding]]
- [[DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving]]

## 관련 항목

- [[KV 캐시]] — 한 요청 안에서 재사용하는 과거 토큰 상태와 메모리 비용의 출발점이다.
- [[접두사 KV 캐싱]] — 여러 호출의 동일 토큰 접두사를 재사용하는 조건과 정책을 설명한다.
- [[추측 디코딩]] — 추가 계산으로 타깃 모델의 직렬 실행을 줄이는 절차와 결과 계약을 설명한다.
- [[프리필과 디코드]] — 캐싱과 추측이 각각 줄이는 실행 단계를 구분한다.
- [[초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가]] — 작업량 절감이 사용자 SLO의 유효 처리량인지 검증한다.
