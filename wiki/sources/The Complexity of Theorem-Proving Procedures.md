---
title: The Complexity of Theorem-Proving Procedures
aliases: [Cook 1971, Cook's theorem, 정리 증명 절차의 복잡도]
summary: "다항 시간 비결정적 튜링 기계가 푸는 인식 문제를 명제 논리의 항진식 판정 문제로 환원해 다항 환원과 완전 문제의 틀을 제시한 Stephen A. Cook의 1971년 논문."
tags: [type/reference, domain/computer-science, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 1971
historical_layer: theory
capability_layers: [complexity]
sources: ["The Complexity of Theorem-Proving Procedures"]
source_id: ref-066
source_kind: external
primary_sources: ["Stephen A. Cook, The Complexity of Theorem-Proving Procedures, Proceedings of the Third Annual ACM Symposium on Theory of Computing, 1971, pp. 151–158"]
supporting_sources: ["ACM DOI record", "CMU transcript of the 1971 typewritten paper", "MIT Press classic-paper record"]
source_urls: ["https://doi.org/10.1145/800157.805047", "https://www.cs.cmu.edu/~15455/resources/Cook1971-complx-thm-proof.pdf", "https://direct.mit.edu/books/edited-volume/5003/chapter/2657057/The-Complexity-of-Theorem-Proving-Procedures-1971"]
retrieved: 2026-07-24
version: "Proceedings of the Third Annual ACM Symposium on Theory of Computing, 1971, pp. 151–158"
snapshot_status: external-only
status: active
graph_id: reference-cook-theorem-proving-procedures
graph_visibility: public
---

## 개요

[[The Complexity of Theorem-Proving Procedures]]는 Stephen A. Cook이 1971년에 발표한 논문으로, 다항 시간 안에 동작하는 비결정적 튜링 기계가 인식하는 임의의 문제를 명제 논리의 항진식 판정 문제에 다항 시간으로 환원할 수 있음을 보인다. 이 결과는 계산 가능 여부와 별도로, 문제들 사이의 상대적 난이도를 환원으로 비교하는 틀을 만든다.

논문은 `P-reducible`을 질의 테이프와 오라클을 가진 질의 기계(query machine)가 다항 시간 안에 동작하는 방식으로 정의한다. 이 정의는 뒤에 널리 쓰인 하나의 입력을 하나의 출력으로 보내는 다항 시간 다대일 환원과 같은 말이 아니다. 따라서 현대 교재의 SAT·NP-완전성 용어를 사용할 때도 이 논문이 실제로 둔 환원 모형과 문제 표현을 구분해야 한다.

Cook은 다항 시간 비결정적 튜링 기계의 계산 과정을 명제 변수와 제약으로 인코딩해, 입력이 받아들여질 때에만 만족 가능한 식을 구성한다. 논문은 이를 DNF 항진식 문제의 형태로 서술한다. 핵심은 특정 정리 증명 알고리즘의 실행 시간이 아니라, 여러 문제의 어려움이 다항 시간 변환을 통해 한 대표 문제에 모일 수 있다는 구조다.

## 주요 인사이트

- 계산 가능성과 다항 시간 안에 처리 가능한지는 서로 다른 질문이다.
- 환원은 한 문제의 빠른 해법이 다른 문제들의 빠른 해법에 어떤 함의를 주는지 보이는 비교 언어다.
- 원 논문의 `P-reducible`은 오라클 질의 기계를 사용하므로, 다대일 변환만을 뜻하는 후대의 Karp 환원과 구분해야 한다.
- 계산 과정을 논리식으로 표현하는 구성은 비결정적 계산의 존재를 유한한 제약 충족 조건으로 바꾼다.
- 완전 문제의 결과는 어려운 문제가 실제 데이터에서 항상 느리다는 성능 측정이 아니라, 지정된 계산 모형 안의 조건부 난이도 관계다.

## 인용할 만한 구절

> “a polynomial time-bounded nondeterministic Turing machine”

논문은 이 모형이 인식하는 문제와 항진식 판정 문제의 환원 관계를 연결한다.

## 위키 반영

이 자료는 [[다항 시간 환원]]과 [[NP-완전]]의 역사적 출발점이며, [[계산 복잡도]]를 계산 가능성과 실제 실행 성능 사이의 독립 층위로 설명하는 근거다. [[더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가]]에서는 하드웨어의 상수배 향상과 문제 사이의 다항 환원 관계가 답하는 질문이 다름을 분석한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[다항 시간 환원]] | 질의 기계가 다항 시간 안에 한 문제를 다른 문제의 오라클로 푸는 P-환원 정의를 제시한다. | [[The Complexity of Theorem-Proving Procedures]] |
| enables | [[NP-완전]] | 다항 시간 비결정적 계산과 대표적인 어려운 문제를 연결하는 완전성 틀을 제공한다. | [[The Complexity of Theorem-Proving Procedures]] |

## 출처

- ACM, [DOI record](https://doi.org/10.1145/800157.805047)
- Carnegie Mellon University, [1971 typewritten-paper transcript](https://www.cs.cmu.edu/~15455/resources/Cook1971-complx-thm-proof.pdf)
- MIT Press, [classic-paper record](https://direct.mit.edu/books/edited-volume/5003/chapter/2657057/The-Complexity-of-Theorem-Proving-Procedures-1971)

## 관련 항목

- [[다항 시간 환원]] — 원 논문의 질의 기계 환원과 후대의 다대일 환원을 구분한다.
- [[NP-완전]] — 환원 관계로 정의되는 완전 문제의 조건을 정리한다.
- [[Reducibility Among Combinatorial Problems]] — 조합적 결정 문제로 환원 기법을 넓힌 후속 고전이다.
- [[계산 복잡도]] — 계산 가능성과 자원 증가율을 분리하는 이론 층위를 정리한다.
