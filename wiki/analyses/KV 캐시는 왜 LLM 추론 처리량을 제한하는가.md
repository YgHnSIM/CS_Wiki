---
title: KV 캐시는 왜 LLM 추론 처리량을 제한하는가
aliases: [KV cache throughput bottleneck, LLM 캐시와 배치 처리량, KV 캐시 병목]
summary: "KV 캐시가 과거 토큰의 재계산을 줄이면서도 GPU 메모리 수용량·단편화·동적 할당을 통해 활성 배치와 LLM 서비스 처리량을 제한하는 과정을 연속 배칭과 PagedAttention의 관계로 분석한다."
tags: [type/analysis, domain/machine-learning, domain/systems, domain/computer-architecture, status/active]
created: 2026-07-24
updated: 2026-07-24
historical_layer: system
capability_layers: [realized-performance, scalability, resource-efficiency]
sources: ["Attention Is All You Need", "FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness", "Orca - A Distributed Serving System for Transformer-Based Generative Models", "Efficient Memory Management for Large Language Model Serving with PagedAttention"]
status: active
graph_id: analysis-kv-cache-throughput
graph_visibility: public
---

## 문제 제기

[[KV 캐시]]는 자동회귀 LLM 추론을 빠르게 하는가, 느리게 하는가. 두 문장 모두 조건부로 맞다. 캐시는 이전 토큰의 키와 값을 재사용해 반복 계산을 줄인다. 동시에 요청마다 GPU 메모리를 점유해 한 번에 실행할 수 있는 요청 수를 제한한다. 토큰 하나의 실행 시간이 줄어도 활성 배치가 작아지면 서비스 전체 처리량은 낮아질 수 있다.

이 문제를 보려면 [[Attention Is All You Need]]의 [[Transformer]] 계산 구조, [[Orca - A Distributed Serving System for Transformer-Based Generative Models]]의 [[연속 배칭]], [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]의 동적 메모리 관리를 한 경계 안에서 읽어야 한다. 커널, 요청 스케줄러와 GPU 메모리를 서로 독립된 최적화로 보면 처리량이 어디서 막히는지 설명할 수 없다.

## 1. 한 요청의 계산을 줄이면 요청별 상태가 남는다

자동회귀 생성에서 새 토큰은 이전 토큰 전체의 문맥을 참조한다. 과거 위치의 키·값을 매번 다시 계산하는 대신 캐시에 보존하면 새 토큰에 필요한 중복 연산을 줄일 수 있다. 이때 사라진 것은 과거 키·값의 **재계산**이지, 과거 문맥을 참조하는 어텐션 자체와 그 상태의 저장이 아니다.

캐시 크기는 층 수, 저장한 토큰 수, KV head와 head 차원, 정밀도에 비례한다. 한 요청이 길어질수록 캐시는 커지고, 동시 요청 수가 늘면 요청별 캐시가 합쳐진다. 따라서 모델 가중치를 적재한 뒤 남은 GPU 메모리가 활성 요청과 토큰의 상한을 만든다.

## 2. 연속 배칭의 선택지는 메모리에 들어오는 요청으로 제한된다

Orca는 요청 단위의 고정 배치를 모델 반복 단위 스케줄링으로 바꿨다. 짧은 요청이 끝나면 즉시 자리를 비우고 새 요청이 다음 반복에 합류할 수 있어, 서로 다른 도착 시점과 생성 길이에서도 배치가 비는 시간을 줄인다.

그러나 스케줄러가 요청을 선택할 수 있다는 사실과 그 요청의 상태를 GPU에 수용할 수 있다는 사실은 다르다. 새 요청의 프롬프트와 이후 생성 토큰을 위한 캐시 공간이 없다면 빈 연산 슬롯이 있어도 승인할 수 없다. 실행 중 요청을 선점할 수는 있지만, 캐시를 옮기거나 버린 뒤 재계산하는 비용이 생긴다. 따라서 최대 요청 수가 아니라 **동시에 살아 있는 토큰 상태의 총량**이 실제 배치 경계가 된다.

## 3. 최대 길이 선예약은 불확실성을 메모리 낭비로 바꾼다

요청의 최종 출력 길이는 시작할 때 알기 어렵다. 최대 길이만큼 연속 공간을 미리 예약하면 주소 계산은 단순하지만, 일찍 끝난 요청의 미사용 슬롯은 실행 중에 다른 요청이 쓰기 어렵다. 크기가 다른 연속 구역이 할당·해제되면 전체 여유 공간은 충분해도 큰 연속 구역을 찾지 못하는 외부 단편화도 생긴다.

PagedAttention 논문은 평가한 기존 방식에서 실제 토큰 상태가 예약 KV 공간의 일부만 차지하는 조건을 보였다. 이 낭비는 단지 메모리 사용률 수치의 문제가 아니다. 들어갈 수 있었던 요청이 큐에 남고 배치가 작아지므로 GPU 행렬 연산의 이용률과 동일 지연 목표에서의 처리량으로 전파된다.

## 4. 페이징은 캐시를 없애지 않고 배치 가능한 상태를 늘린다

PagedAttention은 논리 KV 캐시를 고정 크기 블록으로 나누고 물리 GPU 블록과 간접 매핑한다. 요청이 실제로 성장할 때만 새 블록을 할당하고 완료 시 블록을 바로 재사용한다. 공통 접두사나 빔은 물리 블록을 공유하고 분기에서 쓰기가 생길 때 복사할 수 있다.

이 설계는 캐시의 의미나 토큰당 상태 크기를 없애지 않는다. 줄이는 것은 최대 길이 선예약, 단편화와 중복 복사다. 같은 GPU 메모리에 실제 토큰 상태를 더 많이 넣어 더 큰 활성 배치를 유지하는 것이 처리량 향상의 핵심 경로다.

| 경계 | 기존 연속 선예약 | 블록 기반 관리 | 남는 비용 |
|---|---|---|---|
| 성장 | 최대 길이 공간을 먼저 확보 | 실제 토큰 증가에 맞춰 블록 할당 | 새 블록 승인·메타데이터 |
| 배치 수용량 | 미사용 예약과 단편화가 감소시킴 | 실제 상태 중심으로 수용량 증가 | 마지막 블록 내부 빈 공간 |
| 공유 | 시퀀스별 연속 캐시 복제 | 블록 참조와 쓰기 시 복사 | 참조 관리·분기 복사 |
| 커널 | 연속 주소 접근이 단순 | 블록 표로 비연속 주소 해석 | 조회·분기·불규칙 접근 |

## 5. 더 높은 메모리 효율이 항상 더 낮은 지연은 아니다

PagedAttention 논문의 미세 벤치마크에서는 블록 표 접근 때문에 어텐션 커널 자체가 비교 대상보다 느린 조건도 있었다. 그럼에도 종단 처리량이 높아진 것은 더 많은 요청을 함께 실행한 이익이 커널 오버헤드를 상쇄했기 때문이다. 캐시 여유가 충분하고 시퀀스가 짧아 계산 병목이 된 조건에서는 Orca 기준선과의 차이가 작아졌다.

따라서 “PagedAttention이 빠르다”는 문장은 불완전하다. 비교 가능한 문장은 **어떤 모델·요청 길이 분포·GPU 메모리·블록 크기에서, 같은 지연 조건을 지키며 얼마만큼 더 많은 요청 또는 토큰을 완료했는가**를 포함해야 한다. [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]이 한 어텐션 연산의 HBM 이동을 줄이는 반면, PagedAttention은 여러 요청의 수명에 걸친 캐시 배치와 수용량을 다룬다는 경계도 구분해야 한다.

## 최소 측정 벡터

1. 모델 구조, 정밀도, GPU 종류·수와 모델 병렬화 방식을 기록한다.
2. 입력·출력 길이 분포, 요청 도착률과 디코딩 방법을 고정한다.
3. 활성 요청 수뿐 아니라 활성 토큰 수, KV 캐시 유효 점유량과 단편화를 측정한다.
4. 캐시 블록 할당·해제·공유, 선점·교환·재계산 횟수를 보고한다.
5. 같은 지연 조건에서 요청/초와 토큰/초를 비교하고 지연 분포를 함께 제시한다.

## 결론

KV 캐시는 계산을 저장 공간으로 바꾸는 최적화다. 한 요청에서는 과거 키·값의 재계산을 피하지만, 서비스에서는 그 저장 공간이 동시 요청 수와 배치 크기를 제한한다. 연속 배칭은 요청의 완료와 도착에 맞춰 계산 슬롯을 재사용하고, PagedAttention은 실제 토큰 상태에 맞춰 메모리 슬롯을 재사용한다. LLM 추론 처리량은 두 재사용 체계가 같은 요청 길이 분포와 지연 목표에서 얼마나 잘 맞물리는지에 달려 있다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[KV 캐시]] | 과거 토큰 재계산 절감과 요청별 GPU 상태 증가를 하나의 계산–메모리 교환으로 종합한다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| synthesizes | [[연속 배칭]] | 반복마다 계산 슬롯을 재사용하는 스케줄링이 캐시 수용량 안에서만 활성 요청을 늘릴 수 있음을 설명한다. | [[Orca - A Distributed Serving System for Transformer-Based Generative Models]] |
| responds_to | [[메모리 장벽]] | GPU 메모리 용량·단편화·배치 수용량을 LLM 서비스 처리량의 직접 병목으로 다룬다. | [[Efficient Memory Management for Large Language Model Serving with PagedAttention]] |
| synthesizes | [[입출력 인지 어텐션]] | 한 연산의 HBM 이동 최적화와 여러 요청 수명에 걸친 KV 캐시 배치 최적화의 경계를 구분한다. | [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]] |

## 출처

- [[Attention Is All You Need]]
- [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]
- [[Orca - A Distributed Serving System for Transformer-Based Generative Models]]
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]

## 관련 항목

- [[KV 캐시]] — 토큰별 계산 절감과 요청별 메모리 증가의 기본 구조를 설명한다.
- [[연속 배칭]] — 반복마다 완료·신규 요청을 반영해 계산 슬롯을 재사용한다.
- [[입출력 인지 어텐션]] — 단일 어텐션 연산의 데이터 이동 최적화와 비교할 수 있다.
- [[메모리 장벽]] — 연산량보다 데이터 저장·이동이 처리량을 제한하는 일반 원리를 제공한다.
- [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]] — 학습 병렬성, 생성 순차성과 커널 수준 메모리 이동에서 출발한다.
