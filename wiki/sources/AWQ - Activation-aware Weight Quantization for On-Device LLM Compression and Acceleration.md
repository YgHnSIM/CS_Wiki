---
title: "AWQ: Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration"
aliases: [AWQ paper, Activation-aware Weight Quantization, Lin et al. 2024]
summary: "보정 입력의 활성값으로 중요한 가중치 채널을 식별하고 채널별 스케일을 조정해 양자화 오차를 줄이며, 가중치 전용 저비트 커널로 데스크톱·모바일 GPU 추론을 가속한 2024년 MLSys 연구."
tags: [type/reference, domain/machine-learning, domain/computer-architecture, domain/edge-computing, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2024
historical_layer: system
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["AWQ: Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration"]
source_id: ref-082
source_kind: external
primary_sources: ["Ji Lin et al., AWQ: Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration, MLSys 2024"]
supporting_sources: ["MLSys 2024 proceedings abstract record"]
source_urls: ["https://proceedings.mlsys.org/paper_files/paper/2024/hash/42a452cbafa9dd64e9ba4aa95cc1ef21-Abstract-Conference.html", "https://proceedings.mlsys.org/paper_files/paper/2024/file/42a452cbafa9dd64e9ba4aa95cc1ef21-Paper-Conference.pdf"]
retrieved: 2026-07-25
version: "Proceedings of Machine Learning and Systems 6"
snapshot_status: external-only
status: active
graph_id: reference-awq
graph_visibility: public
---

## 개요

[[AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration]]는 LLM의 모든 가중치가 양자화 오차에 같은 영향을 주지 않는다는 관찰에서 출발한 가중치 전용 사후 학습 양자화 연구다. 보정 입력의 활성값 크기로 중요한 채널을 찾고, 채널별 스케일을 검색해 중요한 가중치가 양자화 격자에서 더 잘 보존되도록 한다.

논문은 중요한 약 1%의 가중치를 보호하면 오차를 크게 줄일 수 있다고 보고한다. 여기서 보호는 그 가중치를 무조건 고정된 고정밀 형식으로 따로 저장한다는 뜻이 아니다. AWQ의 핵심은 활성값을 관찰해 채널별 스케일을 조정하고, 같은 저비트 가중치 형식 안에서 중요한 값의 상대적 양자화 오차를 줄이는 것이다.

AWQ는 역전파나 가중치 재구성 최적화를 사용하지 않아 작은 보정 집합에 과적합될 위험을 줄이려 한다. 저자는 언어 모델링, 지시 튜닝 모델과 다중 모달 모델에서 비교 방법보다 나은 양자화 품질을 보고했다. 다만 보정 데이터와 평가 과업이 달라질 때의 일반화는 모델·도메인별로 다시 확인해야 한다.

함께 제시한 추론 프레임워크는 데스크톱과 모바일 GPU에서 Hugging Face FP16 구현보다 3배 이상의 속도 향상을 보고한다. 이 결과도 AWQ 스케일링만의 보편 배수가 아니라, 낮은 비트 가중치 패킹, 온더플라이 역양자화와 장치별 커널을 결합한 시스템 결과다.

## 주요 인사이트

- 활성값 통계는 어떤 가중치 채널의 양자화 오차가 출력에 크게 전파되는지 찾는 신호다.
- 채널별 스케일은 중요한 가중치를 같은 저비트 표현 안에서 상대적으로 보호한다.
- 역전파·재구성 없이 수행하는 PTQ는 보정 비용과 과적합 위험을 줄이지만 보정 데이터 선택은 여전히 중요하다.
- 모델 압축률과 perplexity만으로 실제 과업 품질이나 생성 안정성을 보장할 수 없다.
- 모바일·데스크톱 가속은 메모리 절감과 저비트 전용 커널·하드웨어 지원의 결합 결과다.

## 인용할 만한 구절

> “weights are not equally important”

균일한 비트 수를 사용하더라도 채널별 스케일과 보정 통계가 품질을 크게 바꿀 수 있음을 압축한다.

## 위키 반영

이 자료는 [[LLM 가중치 양자화]]의 활성값 인지 보정, 채널별 스케일과 중요한 가중치 보호를 뒷받침한다. [[낮은 비트는 왜 LLM 추론 속도를 보장하지 않는가]]에서는 압축 형식이 실제 모바일·GPU 커널에서 속도로 전환되는 조건을 GPTQ와 비교한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[LLM 가중치 양자화]] | 보정 활성값으로 중요한 채널을 찾고 채널별 스케일을 조정하는 가중치 전용 PTQ를 구현한다. | [[AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration]] |
| responds_to | [[메모리 장벽]] | 낮은 비트 가중치와 전용 커널을 결합해 장치 메모리 용량과 가중치 대역폭 제약에 대응한다. | [[AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration]] |
| exemplifies | [[혼합 정밀도]] | 저비트 가중치와 높은 정밀도의 활성값·누산을 역할별로 배치하고 채널별 스케일로 오차를 조절한다. | [[AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration]] |

## 출처

- MLSys, [abstract and proceedings record](https://proceedings.mlsys.org/paper_files/paper/2024/hash/42a452cbafa9dd64e9ba4aa95cc1ef21-Abstract-Conference.html)
- MLSys, [open-access paper PDF](https://proceedings.mlsys.org/paper_files/paper/2024/file/42a452cbafa9dd64e9ba4aa95cc1ef21-Paper-Conference.pdf)

## 관련 항목

- [[LLM 가중치 양자화]] — AWQ의 활성값 인지 스케일링을 일반 양자화 설계 요소 안에 배치한다.
- [[혼합 정밀도]] — 역할별 수치 형식과 품질 보존의 상위 관점을 제공한다.
- [[메모리 장벽]] — 온디바이스 추론에서 모델 용량과 가중치 대역폭이 만드는 제약을 설명한다.
- [[낮은 비트는 왜 LLM 추론 속도를 보장하지 않는가]] — 전용 커널이 없는 낮은 비트 표현의 한계를 분석한다.
