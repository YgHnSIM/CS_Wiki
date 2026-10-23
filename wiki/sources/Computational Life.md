---
schema_version: 2
id: ref-148
kind: reference
title: Computational Life
aliases:
  - Computational Life - How Well-formed, Self-replicating Programs Emerge from Simple Interaction
  - arXiv 2406.19108
  - BFF 논문
summary: 무작위 프로그램의 원시 수프에서 적합도 함수 없이 자기복제 프로그램이 나타남을 보인 2024년 논문. Brainfuck 변형(BFF)과 Forth, Z80 등을 사용했다.
domains:
  - computer-science
  - machine-learning
editorial_status: draft
publication_visibility: unlisted
graph_visibility: public
created: 2026-10-19
updated: 2026-10-23
review:
  mode: pending
  revision: sha256:a9d05f7da17479d66dde3bacc288ffe937df2692f815dfac843a9a16e26097e8
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
history:
  publication_year: 2024
  layer: theory
origin: external
works:
  primary:
    - citation: Blaise Agüera y Arcas, Jyrki Alakuijala, James Evans, Ben Laurie 외, Computational Life — How Well-formed, Self-replicating Programs Emerge from Simple Interaction, arXiv:2406.19108v2 [cs.NE], 2 Aug 2024
      genre: primary-literature
      identifiers:
        - type: arxiv
          value: "2406.19108"
      edition: null
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://arxiv.org/abs/2406.19108
    retrieved: 2026-10-19
    version: v2
---

## 개요

[[Computational Life]]는 무작위이고 자기복제하지 않는 프로그램을 적합도 지형이 없는 환경에 두면 자기복제자가 나타난다는 것을 여러 계산 기질(substrate)에서 보인 논문이다. 인터뷰와 해설 페이지의 "BFF 수프" 이야기의 1차 근거다.

## 확인한 내용

이 문서는 arXiv v2 PDF의 본문을 텍스트로 추출해 읽고 다음을 확인했다.

- **기질**: Brainfuck을 확장한 BFF가 주된 기질이다. 명령어와 데이터가 같은 테이프에 있어 프로그램이 스스로를 고칠 수 있다. 같은 현상을 Forth와 Z80 명령어 집합에서도 보인다.
- **수프 구성**: 튜링 기체(Turing gas)의 변형이다. 보통 2^17개의 프로그램이 "원시 수프"를 이루며, 각 프로그램은 균일 분포로 초기화한 64바이트 길이다. 에폭마다 무작위 순서쌍(A, B)을 골라 이어 붙여 실행하고, 결과를 다시 둘로 나눠 수프에 돌려놓는다. 새 프로그램은 생기거나 사라지지 않는다. 변화는 자기수정이나 배경 무작위 돌연변이로만 일어난다.
- **결과**: 배경 돌연변이가 있든 없든 자기복제자가 나타난다. 자기복제자는 보통 64바이트 창보다 훨씬 작다. 그 뒤에도 더 복잡한 동역학이 이어진다. 자기복제자가 가능하지만 아직 자발적으로 나타나는 것이 관찰되지 않은 최소 언어(SUBLEQ 계열)를 반례로 제시한다. 이 언어에서 직접 만든 가장 작은 복제자는 60바이트다.
- **논문이 쓰는 해석**: 두 프로그램의 상호작용을 화학 반응으로 해석한다. Z80 실험에서는 일부 복제자가 "공생적 생태계"를 이룬다고 쓴다.

## 인터뷰와의 차이

인터뷰는 "4바이트 무작위 프로그램 1,000개"와 "최소 복제자 약 6바이트"로 설명한다. 논문 본문에서는 이 설정을 찾지 못했다. 논문은 "란다우어", "포식자", "빛 추적" 같은 표현도 쓰지 않는다. 또 논문 본문에 "symbiogenesis"라는 용어는 없다. 두 프로그램이 이어져 실행되는 상호작용을 공생발생으로 해석하는 것은 인터뷰의 해석이다. 자세한 대조는 [[생명은 계산이며 공생발생으로 진화한다]]에 있다.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- arXiv:2406.19108v2, <https://arxiv.org/abs/2406.19108>

## 관련 항목

- [[계산적 인공생명]] — 이 논문의 실험을 개념으로 정리하고 인터뷰의 설명과 구분한 문서다.
- [[Blaise Agüera y Arcas Big Think 인터뷰 원문]] — 같은 실험을 4바이트 수프로 쉽게 풀어 설명한 인터뷰다.
- [[자기복제 오토마타]] — 이 논문이 계산 기질에서 다시 구현해 보인 자기복제의 이론적 배경이다.
