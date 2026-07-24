---
title: MLPerf Training Benchmark
aliases: [Mattson et al. 2020, MLPerf Training, MLPerf 학습 벤치마크]
summary: "서로 다른 하드웨어·소프트웨어 구성의 기계 학습 학습 성능을 정해진 품질 목표까지의 시간으로 비교하기 위해 규칙과 작업 부하를 정의한 2020년 MLSys 논문."
tags: [type/reference, domain/machine-learning, domain/computer-architecture, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2020
historical_layer: measurement
capability_layers: [realized-performance, scalability, reliable-results]
sources: ["MLPerf Training Benchmark"]
source_id: ref-070
source_kind: external
primary_sources: ["Peter Mattson et al., MLPerf Training Benchmark, Proceedings of Machine Learning and Systems 2, 2020"]
supporting_sources: ["MLSys 2020 proceedings landing page"]
source_urls: ["https://proceedings.mlsys.org/paper_files/paper/2020/hash/411e39b117e885341f25efb8912945f7-Abstract.html", "https://proceedings.mlsys.org/paper_files/paper/2020/file/411e39b117e885341f25efb8912945f7-Paper.pdf"]
retrieved: 2026-07-24
version: "Proceedings of Machine Learning and Systems 2, 2020"
snapshot_status: external-only
status: active
graph_id: reference-mlperf-training-benchmark
graph_visibility: public
---

## 개요

[[MLPerf Training Benchmark]]은 Peter Mattson 등 연구진이 2020년에 발표한 기계 학습 학습 벤치마크 논문이다. 이 벤치마크는 서로 다른 하드웨어와 소프트웨어 스택을 비교할 때 단순 처리량이 아니라, 규정된 과업 품질 목표에 도달하는 데 걸린 시간을 성능 결과로 삼는다.

논문은 학습 벤치마크에 세 가지 난점이 있다고 지적한다. 처리량을 높이는 최적화가 해결 시간은 오히려 늘릴 수 있고, 확률적인 학습은 해결 시간의 분산이 크며, 다양한 시스템을 같은 이진 파일·코드·하이퍼파라미터로 공정하게 비교하기 어렵다. 따라서 비교에는 작업 정의뿐 아니라 품질 문턱, 학습 규칙과 보고 조건이 필요하다.

이 자료가 제시하는 핵심은 특정 제출 결과의 우열이 아니라, 학습 성능이 “초당 처리한 예제 수”만으로 완결되지 않는다는 점이다. 모델 품질, 데이터, 허용된 최적화, 확장 구성과 반복 측정 규칙을 고정하거나 명시해야 시간 결과가 비교 가능한 주장으로 바뀐다.

## 주요 인사이트

- 학습 처리량이 높아도 목표 품질 도달 시간이 짧아진다고 자동으로 결론낼 수 없다.
- 확률적 학습은 실행마다 도달 시간이 달라질 수 있으므로 분산과 규칙을 함께 다뤄야 한다.
- 공정한 비교에는 같은 코드만 강제하는 대신, 과업과 품질 목표·허용된 구현 변화의 경계를 명시할 수 있다.
- 품질 목표는 속도 뒤에 붙는 부가 조건이 아니라, 무엇을 완료로 셀지 정하는 측정 계약이다.
- 벤치마크 결과는 지정한 모델·데이터·규칙·시스템 구성에 한정해 읽어야 한다.

## 인용할 만한 구절

> “some optimizations that improve training throughput actually increase time to solution”

논문 초록은 처리량과 해결 시간의 방향이 항상 같지 않다는 벤치마크 설계상의 난점을 지적한다.

## 위키 반영

이 자료는 [[목표 품질 도달 시간]]의 직접 근거이며, [[낮은 정밀도는 AI의 컴퓨팅 능력을 어떻게 바꾸는가]]에서 낮은 정밀도의 성능을 모델 품질과 함께 읽는 기준을 제공한다. 일반적인 결과 계약 논의인 [[더 빠른 계산은 같은 답을 내는가]]를 확률적 학습의 측정 경계로 확장한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[목표 품질 도달 시간]] | 학습 성능을 규정한 품질 목표에 도달하는 시간으로 비교하는 벤치마크 규칙을 제시한다. | [[MLPerf Training Benchmark]] |
| constrains | [[낮은 정밀도는 AI의 컴퓨팅 능력을 어떻게 바꾸는가]] | 처리량만으로 학습 성능을 판단하지 않고 목표 품질까지의 시간과 규칙을 함께 보고하게 한다. | [[MLPerf Training Benchmark]] |

## 출처

- MLSys Proceedings, [abstract and metadata](https://proceedings.mlsys.org/paper_files/paper/2020/hash/411e39b117e885341f25efb8912945f7-Abstract.html)
- MLSys Proceedings, [paper PDF](https://proceedings.mlsys.org/paper_files/paper/2020/file/411e39b117e885341f25efb8912945f7-Paper.pdf)

## 관련 항목

- [[목표 품질 도달 시간]] — 학습 완료의 기준과 시간 측정의 관계를 정리한다.
- [[혼합 정밀도]] — 정밀도 변경이 학습 시간과 품질에 미치는 조건을 다룬다.
- [[낮은 정밀도는 AI의 컴퓨팅 능력을 어떻게 바꾸는가]] — 처리량과 목표 품질 도달 시간의 차이를 분석한다.
- [[더 빠른 계산은 같은 답을 내는가]] — 결과 계약을 성능 비교의 전제로 다룬다.
