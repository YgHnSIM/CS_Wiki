---
title: Decoupling Algorithms from Schedules for Easy Optimization of Image Processing Pipelines
aliases: [Halide, "Decoupling Algorithms from Schedules for Easy Optimization of Image Processing Pipelines", "Ragan-Kelley et al. 2012", Halide schedule paper]
summary: "영상 처리 파이프라인의 계산 정의와 저장·계산 순서·타일링·병렬화 선택을 분리해 가독성·이식성·고성능을 함께 추구한 Halide의 2012년 논문."
tags: [type/reference, domain/software-engineering, domain/programming-languages, domain/performance, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2012
historical_layer: software
capability_layers: [programmability, realized-performance, resource-efficiency]
sources: [Decoupling Algorithms from Schedules for Easy Optimization of Image Processing Pipelines]
source_id: ref-098
source_kind: external
primary_sources: ["Jonathan Ragan-Kelley et al., Decoupling Algorithms from Schedules for Easy Optimization of Image Processing Pipelines, ACM Transactions on Graphics, SIGGRAPH 2012"]
supporting_sources: ["MIT CSAIL author-hosted paper page and conference paper PDF"]
source_urls: ["https://people.csail.mit.edu/jrk/halide12/", "https://people.csail.mit.edu/jrk/halide12/halide12.pdf"]
retrieved: 2026-07-25
version: "ACM Transactions on Graphics 31(4), SIGGRAPH 2012"
snapshot_status: external-only
status: active
graph_id: reference-halide-schedule-separation-2012
graph_visibility: public
---

## 개요

[[Decoupling Algorithms from Schedules for Easy Optimization of Image Processing Pipelines]]는 Jonathan Ragan-Kelley 등 연구진이 2012년 SIGGRAPH에서 발표한 Halide 논문이다. 저자들은 고성능 영상 처리 코드를 작성할 때 계산이 무엇을 하는지와, 중간값을 어디에 두고 어떤 순서로 계산할지를 같은 코드에 섞는 관행이 가독성·이식성·모듈성을 해친다고 보았다.

Halide는 알고리즘을 함수들의 조합으로 표현하고, 스케줄로 저장 위치, 계산 순서, 타일링, 융합, 재계산 또는 저장, 벡터화와 병렬화 방식을 지정한다. 같은 알고리즘에 여러 스케줄을 적용해 ARM, x86, GPU 같은 서로 다른 대상에 맞는 실행을 탐색할 수 있게 한 것이 핵심이다.

## 계산 정의와 실행 배치의 분리

이 분리는 성능을 무시한 추상화가 아니다. 오히려 성능에 필요한 선택을 명시적이면서 교체 가능한 대상으로 만든다. 알고리즘 코드를 바꾸지 않고도 캐시 크기, 벡터 폭, 병렬 실행 단위와 메모리 계층에 맞춰 타일 크기·루프 순서·중간 버퍼의 물질화를 바꿀 수 있다.

논문은 그 결과가 모든 프로그램과 장치에서 자동으로 최적이라는 주장을 하지 않는다. 대상 기계, 입력 크기, 데이터 배치, 사용 가능한 병렬성에 따라 적절한 스케줄은 달라진다. 분리의 가치는 하나의 수치가 아니라, 동일한 계산 정의 아래에서 이 선택을 비교·수정할 수 있게 하는 데 있다.

## 위키 반영

이 자료는 [[알고리즘과 스케줄 분리]]의 직접 근거이며, [[컴파일러 최적화]]에서 컴파일러가 암묵적으로 수행하던 배치 선택을 프로그래머와 탐색 도구가 다룰 수 있는 인터페이스로 바꾼 사례다. [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning|TVM]]은 이 생각을 텐서 연산자와 계산 그래프, 자동 탐색으로 확장한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[알고리즘과 스케줄 분리]] | 계산 함수와 저장·순서·타일링·병렬화 선택을 별도 표현으로 두는 언어와 컴파일 방식을 제시한다. | [[Decoupling Algorithms from Schedules for Easy Optimization of Image Processing Pipelines]] |
| enables | [[성능 이식성]] | 하나의 영상 처리 알고리즘에 대상별 스케줄을 적용해 ARM, x86, GPU를 위한 실행을 탐색하게 한다. | [[Decoupling Algorithms from Schedules for Easy Optimization of Image Processing Pipelines]] |

## 출처

- MIT CSAIL, [paper page](https://people.csail.mit.edu/jrk/halide12/)
- MIT CSAIL, [conference paper PDF](https://people.csail.mit.edu/jrk/halide12/halide12.pdf)

## 관련 항목

- [[알고리즘과 스케줄 분리]] — 계산 정의와 실행 배치를 분리하는 설계 원리를 정리한다.
- [[컴파일러 최적화]] — 프로그램 의미를 유지하는 조건에서 코드 구조와 자원 배치를 바꾸는 작업을 다룬다.
- [[성능 이식성]] — 대상별 스케줄 선택을 실제 비교 가능한 성능으로 연결하는 목표를 설명한다.
- [[이기종 실행 모델]] — 병렬 실행 단위와 메모리 계층의 차이가 스케줄 선택을 바꾸는 이유를 다룬다.
- [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning|TVM]] — Halide의 분리 관점을 딥러닝 연산자와 자동 탐색에 적용한 사례다.
