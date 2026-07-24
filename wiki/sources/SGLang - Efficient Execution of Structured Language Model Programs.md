---
title: "SGLang: Efficient Execution of Structured Language Model Programs"
aliases: [SGLang paper, RadixAttention paper, Zheng et al. 2024]
summary: "여러 LLM 호출과 제어 흐름을 가진 프로그램을 위한 언어·런타임을 공동 설계하고, RadixAttention의 radix tree·LRU·캐시 인지 스케줄링으로 호출 사이의 동일 접두사 KV 상태를 재사용한 2024년 연구."
tags: [type/reference, domain/machine-learning, domain/systems, domain/software-engineering, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2024
historical_layer: system
capability_layers: [programmability, realized-performance, scalability, resource-efficiency]
sources: ["SGLang: Efficient Execution of Structured Language Model Programs"]
source_id: ref-080
source_kind: external
primary_sources: ["Lianmin Zheng et al., SGLang: Efficient Execution of Structured Language Model Programs, NeurIPS 2024"]
supporting_sources: ["NeurIPS 2024 proceedings abstract record"]
source_urls: ["https://proceedings.nips.cc/paper_files/paper/2024/hash/724be4472168f31ba1c9ac630f15dec8-Abstract-Conference.html", "https://proceedings.nips.cc/paper_files/paper/2024/file/724be4472168f31ba1c9ac630f15dec8-Paper-Conference.pdf"]
retrieved: 2026-07-25
version: "NeurIPS 2024 proceedings, volume 37"
snapshot_status: external-only
status: active
graph_id: reference-sglang
graph_visibility: public
---

## 개요

[[SGLang - Efficient Execution of Structured Language Model Programs]]은 여러 생성 호출, 분기·병합, 구조화 입력과 출력을 가진 언어 모델 프로그램을 효율적으로 표현하고 실행하기 위한 2024년 NeurIPS 연구다. 프런트엔드는 Python에 포함된 도메인 특화 언어로 생성·선택·병렬 제어 원시 연산을 제공하고, 런타임은 프로그램 구조에서 드러나는 재사용과 병렬성 기회를 활용한다.

이 위키에서 핵심인 기법은 **RadixAttention**이다. 런타임은 토큰 시퀀스와 해당 [[KV 캐시]] 텐서를 radix tree에 연결하고, 완료된 요청의 캐시를 즉시 폐기하지 않고 LRU 캐시로 관리한다. 새 호출의 토큰 접두사가 트리의 경로와 일치하면 그 위치까지의 KV 상태를 재사용해 중복 프리필 계산을 피한다. 다중 턴 대화, 공통 시스템 프롬프트, few-shot 예시, 한 상태에서 갈라지는 여러 생성 호출처럼 여러 수준의 공유를 같은 구조로 다룬다.

캐시 공간과 실행 중 요청은 같은 메모리 풀을 공유한다. 메모리가 부족하면 사용 중이 아닌 최근 최소 사용 잎부터 제거하고, 대기 요청이 많을 때는 더 긴 공통 접두사를 가진 요청을 먼저 실행해 적중률을 높인다. 이 정책은 처리량을 높일 수 있지만 온라인 부하에서는 공정성과 지연을 해칠 수 있어, 논문도 기아 방지를 후속 과제로 남긴다.

재사용 조건은 의미 유사성이 아니다. 같은 모델·토크나이저·가중치·어댑터·실행 설정 아래 **토큰 단위로 동일한 접두사**만 같은 KV 상태를 갖는다. 의미가 비슷한 문장을 검색해 답이나 임베딩 결과를 재사용하는 시맨틱 캐시와 RadixAttention은 결과 계약과 오류 모형이 다르다.

논문은 여러 작업에서 기존 시스템보다 최대 6.4배의 처리량 향상과 최대 3.7배의 지연 감소를 보고했다. 이 최대값은 RadixAttention만의 보편 배수가 아니라 KV 재사용, 프로그램 내 병렬성, 구조화 출력 디코딩을 합친 평가 조건의 결과다.

## 주요 인사이트

- KV 캐시는 한 요청의 디코드 상태일 뿐 아니라, 동일 토큰 접두사를 가진 여러 호출이 재사용할 수 있는 프리필 결과다.
- radix tree는 다단계 접두사 공유를 표현하고 LRU 잎 제거는 공통 조상 상태를 더 오래 보존한다.
- 캐시 적중률은 요청 순서에 따라 달라지므로 스케줄링과 캐시 관리를 독립 최적화로 볼 수 없다.
- 적중률이 높으면 프리필 계산과 캐시 중복을 줄이고 더 큰 배치를 수용할 수 있지만, 캐시 메타데이터·조회·퇴거와 공정성 비용이 남는다.
- 논문의 속도 향상 수치는 모델·작업·GPU와 결합된 런타임 최적화에 한정해야 한다.

## 인용할 만한 구절

> “requests with the same prompt prefix can reuse the KV cache”

재사용의 안전한 단위를 의미가 아니라 토큰 접두사와 그 접두사로부터 계산된 모델 상태로 한정하는 문장이다.

## 위키 반영

이 자료는 [[접두사 KV 캐싱]]의 교차 호출 재사용, radix tree, LRU 퇴거와 캐시 인지 스케줄링의 직접 근거다. [[재사용과 추측은 LLM 추론 작업량을 어떻게 바꾸는가]]에서는 한 요청 안의 KV 재사용, 호출 사이 접두사 재사용과 드래프트–타깃 추측 실행을 구분한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| implements | [[접두사 KV 캐싱]] | 동일 토큰 접두사의 KV 상태를 radix tree와 LRU 정책으로 호출 사이에 보존·검색·퇴거한다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |
| enables | [[프리필과 디코드]] | 적중한 접두사의 프리필 계산을 생략하고 일치 지점 이후의 토큰만 처리하게 한다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |
| constrains | [[연속 배칭]] | 긴 접두사 적중을 우선하는 순서가 캐시 적중률과 처리량을 높이는 대신 공정성·대기 지연과 충돌할 수 있다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |

## 출처

- NeurIPS, [abstract and proceedings record](https://proceedings.nips.cc/paper_files/paper/2024/hash/724be4472168f31ba1c9ac630f15dec8-Abstract-Conference.html)
- NeurIPS, [open-access paper PDF](https://proceedings.nips.cc/paper_files/paper/2024/file/724be4472168f31ba1c9ac630f15dec8-Paper-Conference.pdf)

## 관련 항목

- [[접두사 KV 캐싱]] — RadixAttention의 안전한 재사용 조건과 캐시 정책을 개념으로 정리한다.
- [[KV 캐시]] — 재사용되는 키·값 상태의 계산·메모리 교환을 설명한다.
- [[프리필과 디코드]] — 접두사 적중이 줄이는 프리필 작업과 남는 디코드 작업을 구분한다.
- [[연속 배칭]] — 캐시 적중률과 요청 지연이 함께 영향을 받는 스케줄링 계층이다.
- [[재사용과 추측은 LLM 추론 작업량을 어떻게 바꾸는가]] — 캐싱과 추측 실행이 바꾸는 작업량을 비교한다.
