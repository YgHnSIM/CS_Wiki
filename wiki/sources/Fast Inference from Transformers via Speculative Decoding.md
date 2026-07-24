---
title: Fast Inference from Transformers via Speculative Decoding
aliases: [Speculative Decoding paper, Leviathan et al. 2023, 추측 디코딩 논문]
summary: "작은 근사 모델이 제안한 여러 토큰을 큰 타깃 모델이 병렬 검증하고 수락·보정해, 타깃 모델의 출력 분포를 유지하면서 자동회귀 디코딩의 직렬 실행 횟수를 줄이는 2023년 연구."
tags: [type/reference, domain/machine-learning, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2023
historical_layer: system
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["Fast Inference from Transformers via Speculative Decoding"]
source_id: ref-079
source_kind: external
primary_sources: ["Yaniv Leviathan, Matan Kalman, and Yossi Matias, Fast Inference from Transformers via Speculative Decoding, ICML 2023"]
supporting_sources: ["PMLR volume 202 bibliographic record"]
source_urls: ["https://proceedings.mlr.press/v202/leviathan23a.html", "https://proceedings.mlr.press/v202/leviathan23a/leviathan23a.pdf"]
retrieved: 2026-07-25
version: "PMLR 202, pp. 19274-19286"
snapshot_status: external-only
status: active
graph_id: reference-speculative-decoding
graph_visibility: public
---

## 개요

[[Fast Inference from Transformers via Speculative Decoding]]는 Leviathan, Kalman, Matias가 ICML 2023에서 발표한 자동회귀 추론 가속 연구다. 표준 디코딩은 출력 토큰마다 큰 모델을 한 번씩 직렬 실행한다. 논문은 더 작은 근사 모델(draft model)이 여러 후보 토큰을 먼저 생성하고, 큰 타깃 모델(target model)이 후보 위치들의 확률을 한 번의 병렬 실행으로 평가하도록 바꾼다.

후보가 타깃 분포와 맞으면 연속으로 수락한다. 처음 거부된 위치에서는 근사 분포와 타깃 분포의 차이를 반영한 보정 분포에서 다시 표본을 뽑는다. 이 수락·보정 규칙 때문에 최종 표본의 확률 분포는 타깃 모델을 단독으로 실행했을 때와 같다. 논문이 특정 실험에서 보고한 “동일한 출력”을 모든 구현의 비트 단위 동일성으로 넓혀서는 안 된다. 핵심 계약은 같은 샘플링 변환과 난수 조건에서 **타깃 출력 분포를 정확히 보존**하는 것이다.

한 번의 타깃 실행이 최대 여러 출력 토큰을 확정할 수 있지만, 이득은 공짜가 아니다. 작은 모델의 순차 제안 비용, 타깃 모델의 여러 위치 병렬 검증, 거부된 후보에 쓴 계산이 추가된다. 논문은 수락률과 작은 모델/큰 모델 실행 시간 비율로 예상 벽시계 이득을 분석하며, 타깃 실행을 병렬화할 계산 자원이 충분하다는 조건을 둔다.

T5-XXL 평가에서 표준 T5X 구현보다 2–3배의 지연 단축을 보고했지만, 이 수치는 논문의 모델·작업·하드웨어·구현 조건에 속한다. 실제 효과는 후보 길이, 수락률, 드래프트 비용, 타깃 검증 커널과 메모리 대역폭, 배칭 정책에 따라 달라진다.

## 주요 인사이트

- 자동회귀 의존성을 없애는 것이 아니라 큰 타깃 모델의 **직렬 호출 횟수**를 줄인다.
- 드래프트 모델이 타깃 모델을 잘 근사할수록 연속 후보 수락률이 높아진다.
- 정확한 수락·보정 표본화는 타깃 분포를 보존하며, 단순히 드래프트 출력을 채택하는 근사 디코딩과 다르다.
- 벽시계 가속은 수락률뿐 아니라 드래프트 비용과 타깃 병렬 검증의 하드웨어 효율에 달려 있다.
- 거부된 후보와 추가 모델 실행은 총 산술량·에너지를 늘릴 수 있으므로 지연 단축과 자원 절감을 같은 말로 취급할 수 없다.

## 인용할 만한 구절

> “without changing the distribution”

이 표현은 논문의 결과 계약을 압축한다. 추측 실행의 목적은 큰 모델과 비슷한 텍스트를 더 빨리 만드는 것이 아니라, 정해진 샘플링 규칙 아래 타깃 모델의 분포를 유지하면서 직렬 경로를 줄이는 것이다.

## 위키 반영

이 자료는 [[추측 디코딩]]의 드래프트–타깃 실행과 수락·보정 계약을 직접 뒷받침한다. [[재사용과 추측은 LLM 추론 작업량을 어떻게 바꾸는가]]에서는 접두사 KV 재사용과 달리 추측 실행이 추가 계산을 투입해 타깃 직렬 실행을 줄인다는 점을 비교한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[추측 디코딩]] | 근사 모델의 후보 생성과 타깃 모델의 병렬 검증·수락·보정을 하나의 정확한 표본화 알고리즘으로 제시한다. | [[Fast Inference from Transformers via Speculative Decoding]] |
| responds_to | [[프리필과 디코드]] | 토큰마다 큰 모델을 직렬 호출해야 하는 디코드 단계의 지연을 여러 후보 위치의 병렬 검증으로 줄인다. | [[Fast Inference from Transformers via Speculative Decoding]] |
| exemplifies | [[LLM 추론 서비스 지표]] | 지연 가속과 출력 분포 보존을 함께 요구해 원시 토큰률과 결과 계약을 분리한다. | [[Fast Inference from Transformers via Speculative Decoding]] |

## 출처

- PMLR, [paper and bibliographic record](https://proceedings.mlr.press/v202/leviathan23a.html)
- PMLR, [open-access paper PDF](https://proceedings.mlr.press/v202/leviathan23a/leviathan23a.pdf)

## 관련 항목

- [[추측 디코딩]] — 논문의 후보 생성, 검증, 수락과 보정 절차를 개념으로 정리한다.
- [[프리필과 디코드]] — 최적화가 겨냥하는 자동회귀 디코드의 직렬 경로를 설명한다.
- [[LLM 추론 서비스 지표]] — 속도 이득을 TTFT·TPOT·품질·자원 조건 안에서 측정한다.
- [[재사용과 추측은 LLM 추론 작업량을 어떻게 바꾸는가]] — 추가 계산과 절감된 타깃 작업을 같은 경계에서 비교한다.
