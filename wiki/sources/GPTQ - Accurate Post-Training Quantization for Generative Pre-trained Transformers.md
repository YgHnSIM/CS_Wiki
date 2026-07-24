---
title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers"
aliases: [GPTQ paper, Frantar et al. 2023, GPTQ]
summary: "대규모 생성 Transformer의 가중치를 재학습 없이 한 번에 3–4비트까지 줄이기 위해 근사 2차 정보를 사용하고, 압축된 가중치용 커널에서 메모리 이동 감소를 추론 가속으로 연결한 2023년 ICLR 연구."
tags: [type/reference, domain/machine-learning, domain/computer-architecture, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2023
historical_note: "arXiv 초판은 2022년에 제출되었고, ICLR 2023에 출판되었다."
historical_layer: system
capability_layers: [realized-performance, resource-efficiency, reliable-results]
sources: ["GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers"]
source_id: ref-081
source_kind: external
primary_sources: ["Elias Frantar, Saleh Ashkboos, Torsten Hoefler, and Dan Alistarh, GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers, ICLR 2023"]
supporting_sources: ["ETH Zurich Research Collection bibliographic record"]
source_urls: ["https://arxiv.org/abs/2210.17323", "https://www.research-collection.ethz.ch/items/00736213-37b2-4e99-b015-141349b71413"]
retrieved: 2026-07-25
version: "arXiv v2, ICLR 2023"
snapshot_status: external-only
status: active
graph_id: reference-gptq
graph_visibility: public
---

## 개요

[[GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers]]는 대규모 GPT·OPT 계열 모델의 가중치를 재학습 없이 낮은 비트로 바꾸는 사후 학습 양자화(post-training quantization, PTQ) 연구다. 모델의 층을 순서대로 처리하면서 소규모 보정 데이터에서 얻은 입력 활성값으로 근사 2차 정보를 구성하고, 일부 가중치를 양자화할 때 생긴 오차를 아직 처리하지 않은 가중치에 보상한다.

핵심 대상은 **가중치 전용(weight-only) 양자화**다. 가중치를 3비트나 4비트로 압축해 저장·전송하고, 활성값과 누산은 더 높은 정밀도에서 처리한다. 따라서 모든 연산이 낮은 비트 정수로 바뀌는 완전 정수 양자화와 다르며, 활성값 양자화나 [[KV 캐시]] 양자화의 품질·커널 문제를 직접 해결하지 않는다.

논문은 175B 매개변수 모델을 약 네 GPU 시간에 양자화하고, 평가 조건에서 3–4비트 가중치로도 원 모델 대비 작은 정확도 저하를 보고했다. 또한 압축된 가중치 전용 행렬–벡터 커널을 사용해 FP16 대비 A100에서 약 3.25배, A6000에서 약 4.5배의 종단 추론 가속을 보고했다.

이 배수는 비트 수만의 결과가 아니다. 가중치가 메모리 대역폭 병목인 작은 배치 생성에서 압축 이득을 활용하는 전용 커널, 패킹·언패킹과 역양자화, GPU 세대와 모델 크기가 함께 만든 결과다. 범용 행렬 곱이 낮은 비트 형식을 직접 지원하지 않거나 배치가 커서 계산 병목이 되면 같은 가속을 기대할 수 없다.

## 주요 인사이트

- PTQ는 학습 완료 뒤 작은 보정 데이터와 모델 통계를 사용해 양자화 파라미터를 정한다.
- GPTQ는 층별 근사 2차 정보를 이용해 순차 양자화 오차를 보상한다.
- 가중치 전용 3–4비트는 모델 저장량과 가중치 메모리 트래픽을 줄이지만 활성값·KV 상태는 별도다.
- 정확도 평가는 perplexity뿐 아니라 모델·데이터·생성 설정과 실제 과업 품질을 함께 봐야 한다.
- 추론 가속은 압축 형식을 효율적으로 읽고 역양자화·곱셈하는 커널과 하드웨어에 달려 있다.

## 인용할 만한 구절

> “one-shot weight quantization method”

GPTQ가 학습 중 정밀도를 혼합하는 방법이 아니라, 이미 학습된 모델의 가중치를 한 번의 후처리로 압축하는 방법임을 보여준다.

## 위키 반영

이 자료는 [[LLM 가중치 양자화]]의 PTQ·가중치 전용 양자화·근사 2차 오차 보상의 직접 근거다. [[낮은 비트는 왜 LLM 추론 속도를 보장하지 않는가]]에서는 모델 용량과 메모리 트래픽 이득이 패킹·역양자화·커널 지원과 만나는 조건을 분석한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[LLM 가중치 양자화]] | 근사 2차 정보를 사용해 대규모 Transformer 가중치를 재학습 없이 낮은 비트로 압축한다. | [[GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers]] |
| responds_to | [[메모리 장벽]] | 모델 가중치의 저장량과 추론 시 메모리 전송량을 줄여 대규모 모델의 적재·생성 병목에 대응한다. | [[GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers]] |
| exemplifies | [[혼합 정밀도]] | 낮은 비트 가중치와 더 높은 정밀도의 활성값·누산을 역할별로 조합한다. | [[GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers]] |

## 출처

- arXiv, [paper record and version history](https://arxiv.org/abs/2210.17323)
- ETH Zurich Research Collection, [ICLR 2023 bibliographic record](https://www.research-collection.ethz.ch/items/00736213-37b2-4e99-b015-141349b71413)

## 관련 항목

- [[LLM 가중치 양자화]] — GPTQ가 구현하는 PTQ와 가중치 전용 양자화의 공통 구조를 설명한다.
- [[혼합 정밀도]] — 가중치·활성값·누산에 서로 다른 형식을 배정하는 상위 원리다.
- [[메모리 장벽]] — 압축된 가중치가 줄이는 저장량과 데이터 이동의 병목을 설명한다.
- [[낮은 비트는 왜 LLM 추론 속도를 보장하지 않는가]] — 비트 수와 실제 지연 사이의 커널·하드웨어 조건을 분석한다.
