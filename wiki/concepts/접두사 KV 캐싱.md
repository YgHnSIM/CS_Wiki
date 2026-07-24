---
title: 접두사 KV 캐싱
aliases: [prefix KV caching, prefix caching, prompt KV cache reuse, RadixAttention]
summary: "같은 모델 실행 조건에서 토큰 단위로 동일한 프롬프트 접두사의 KV 상태를 요청·호출 사이에 보존하고 재사용해 중복 프리필 계산을 줄이는 캐시 방법."
tags: [type/concept, domain/machine-learning, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2024
historical_layer: system
capability_layers: [realized-performance, scalability, resource-efficiency]
sources: ["SGLang - Efficient Execution of Structured Language Model Programs", "Efficient Memory Management for Large Language Model Serving with PagedAttention"]
status: active
graph_id: concept-prefix-kv-caching
graph_visibility: public
---

## 개요

[[접두사 KV 캐싱]](prefix KV caching)은 프롬프트 접두사를 처리해 만든 [[KV 캐시]]를 요청이나 생성 호출이 끝난 뒤에도 보존하고, 이후 호출이 같은 토큰 접두사를 가질 때 재사용하는 방법이다. 한 요청의 디코드가 자기 과거 상태를 재사용하는 일반 KV 캐시보다 수명이 길고, 여러 요청·호출 사이의 중복 [[프리필과 디코드|프리필]] 작업을 줄인다.

안전한 적중에는 적어도 다음 조건이 필요하다.

- 모델 가중치와 토크나이저가 같아야 한다.
- LoRA 같은 어댑터와 모델 구성, 위치·어텐션 관련 설정이 같아야 한다.
- 채팅 템플릿·특수 토큰 처리를 마친 **실제 토큰 접두사**가 동일해야 한다.
- 캐시 텐서의 정밀도·레이아웃과 런타임 호환 조건이 맞아야 한다.

문자열이 비슷하거나 의미가 같다는 사실은 KV 상태의 동일성을 보장하지 않는다. 접두사 KV 캐싱은 의미 유사도를 검색해 과거 답변이나 결과를 재사용하는 **시맨틱 캐싱**이 아니다.

## RadixAttention

SGLang의 RadixAttention은 토큰 시퀀스와 KV 페이지를 radix tree에 연결한다. 공통 시스템 프롬프트, few-shot 예시, 다중 턴 대화 기록과 한 호출에서 분기한 여러 생성은 공통 경로를 공유하고, 다른 접미사만 별도 노드로 확장한다.

완료된 요청의 KV를 즉시 버리지 않고 LRU 캐시로 남기되, 메모리가 부족하면 현재 요청이 참조하지 않는 최근 최소 사용 잎부터 제거한다. 잎을 먼저 제거하면 여러 경로가 공유하는 조상 접두사를 더 오래 보존할 수 있다. 캐시와 실행 중 요청이 같은 GPU 메모리 풀을 쓰므로, 적중을 위해 남긴 상태가 새 배치 수용량을 줄이는 교환이 생긴다.

## 적중률과 스케줄링

접두사 적중률은 `재사용한 프리필 토큰 수 / 전체 프리필 토큰 수`로 볼 수 있다. 대기 요청이 많을 때 긴 공통 접두사를 가진 요청을 연속 처리하면 캐시 퇴거와 재계산을 줄일 수 있다. 반대로 서로 무관한 요청 사이를 자주 오가면 캐시 스래싱이 일어난다.

캐시 인지 순서는 처리량을 높일 수 있지만 먼저 도착한 요청을 뒤로 미뤄 기아나 꼬리 지연을 만들 수 있다. 따라서 적중률만 최대화하지 말고 TTFT·대기 시간·공정성, 활성 배치와 메모리 점유를 함께 측정해야 한다.

## 측정 체크리스트

| 범주 | 기록할 값 |
|---|---|
| 적중 조건 | 모델·토크나이저·어댑터·템플릿·정밀도·런타임 버전 |
| 작업 | 요청/호출 수, 접두사 길이 분포, 동일 토큰 접두사 비율 |
| 캐시 | 유효 KV 바이트, 적중·미스, 퇴거, 유지 시간, 메타데이터 |
| 절감 | 재사용한 프리필 토큰 수와 피한 프리필 시간·연산 |
| 서비스 | TTFT·종단 지연·goodput, 배치 크기, 공정성·기아 |
| 메모리 | 캐시와 실행 중 요청의 점유, 퇴거 뒤 재계산·전송 비용 |

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| narrower | [[KV 캐시]] | 한 요청 내부 상태 재사용을 넘어 동일 토큰 접두사의 KV 상태를 요청·호출 사이에 보존한다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |
| enables | [[프리필과 디코드]] | 적중한 접두사의 키·값을 다시 계산하지 않고 불일치 접미사부터 프리필을 이어 간다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |
| constrains | [[연속 배칭]] | 캐시 적중을 높이는 요청 순서가 활성 배치·공정성·대기 지연과 함께 결정되어야 한다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |
| implements | [[메모리 장벽]] | 중복 프리필 계산과 KV 메모리를 줄이는 대신 캐시 점유·조회·퇴거 비용을 추가한다. | [[SGLang - Efficient Execution of Structured Language Model Programs]] |

## 출처

- [[SGLang - Efficient Execution of Structured Language Model Programs]]
- [[Efficient Memory Management for Large Language Model Serving with PagedAttention]]

## 관련 항목

- [[KV 캐시]] — 접두사 캐시에 저장되는 토큰별 키·값 상태의 기본 구조다.
- [[프리필과 디코드]] — 캐시 적중이 생략하는 입력 처리와 남는 생성 단계를 구분한다.
- [[연속 배칭]] — 적중률과 요청 대기·배치 수용량을 함께 조정하는 스케줄링 계층이다.
- [[추측 디코딩]] — 저장된 작업을 재사용하는 방식과 추가 계산으로 직렬 실행을 줄이는 방식을 비교한다.
- [[재사용과 추측은 LLM 추론 작업량을 어떻게 바꾸는가]] — 세 종류의 재사용·추측 경계를 종합한다.
