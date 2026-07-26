---
schema_version: 2
id: log-2026-07-24-065
kind: meta
title: 2026-07-24 reference | Transformer와 입출력 인지 어텐션
aliases: []
summary: 2026-07-24에 수행한 reference 작업의 변경 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-07-24
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:2810b177c9690e69f7e4b9bd08147ccda5c8cc0053300443d544cba696f02f3e
  reviewed_at: null
  reviewed_by: migration:v2
evidence_ids: []
capability_layers: []
---

Transformer의 자기 주의 구조와 FlashAttention의 GPU 메모리 계층 최적화를 참고 자료로 추가하고, 학습 위치의 병렬 계산·자동회귀 생성 순차성·이차 산술량·HBM 이동을 서로 다른 성능 조건으로 구분했다.

변경된 페이지와 코드:

- 참고 자료: [[Attention Is All You Need]], [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]
- 개념: [[Transformer]], [[자기 주의]], [[입출력 인지 어텐션]]
- 분석: [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]]
- 보강: [[메모리 장벽]], [[컴퓨팅 능력이란 무엇인가]], [[컴퓨팅 능력의 발달사]], [[컴퓨팅 능력 독서 지도]]
- 탐색·운영: [[index]], [[overview]], `site/catalog.mjs`

### 검증

- Transformer의 학습 시 위치 병렬성을 자동회귀 생성의 토큰 순차성 제거로 일반화하지 않았다.
- FlashAttention의 정확성을 비트 단위 동일성과 혼동하지 않고, 이차 산술량과 선형 부가 메모리를 구분했다.
- 논문의 A100·모델별 속도 배수를 다른 가속기와 작업의 보편적 성능으로 일반화하지 않았다.
- `raw/` 원본 변경 없음

### 출처

- [[Attention Is All You Need]]
- [[FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness]]

### 관련 항목

- [[Transformer]]
- [[입출력 인지 어텐션]]
- [[Transformer 추론은 왜 연산량만으로 설명되지 않는가]]
