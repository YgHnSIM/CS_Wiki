---
title: Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules
aliases: [Böhm-Jacopini 1966]
summary: "Böhm-Jacopini의 흐름도 정규화와 구조화 프로그램 정리를 바탕으로 `goto` 없는 표현 가능성을 정리한 참고 자료."
tags: [type/reference, domain/computer-science, domain/programming-languages, status/active]
created: 2026-07-10
updated: 2026-07-22
sources: ["Communications of the ACM 1966"]
source_id: ref-012
source_kind: external
primary_sources: ["Communications of the ACM 1966"]
supporting_sources: ["ACM DOI", "PDF copy"]
source_urls: ["https://cacm.acm.org/research/flow-diagrams-turing-machines-and-languages-with-only-two-formation-rules/", "https://dl.acm.org/doi/10.1145/355592.365646", "https://www.cs.unibo.it/~martini/PP/bohm-jac.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
publication_year: 1966
---

## 개요

[[Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules]]는 [[코라도 뵘]]과 [[주세페 야코피니]]가 1966년에 발표한 논문이다. 이 문헌은 흐름도(flow diagram)를 수학적으로 정규화하고, 계산 절차가 합성과 반복이라는 제한된 형성 규칙으로 표현될 수 있음을 보이는 데 초점을 둔다.

이 논문은 흔히 [[구조화 프로그램 정리]]의 근거로 인용된다. 중요한 점은 이 정리가 좋은 프로그램 작성법을 직접 제시한 것이 아니라, 임의의 계산 흐름을 구조화된 형식으로 표현할 수 있다는 표현 가능성의 결과라는 점이다.

## 주요 인사이트

- 흐름도는 초기 자동 계산에서 프로그램과 기계 동작을 나타내는 2차원적 프로그래밍 언어처럼 쓰였다.
- 논문은 흐름도를 기초 도식들로 분해하는 정규화 방법을 제시한다.
- 첫 번째 정규화 방법은 세 종류의 기초 도식을 사용하고, 두 번째 방법은 더 제한된 두 형성 규칙을 사용한다.
- Turing machine의 동작도 특정 의미에서 합성과 반복으로 생성되는 언어의 프로그램으로 환원될 수 있음을 보인다.
- 이 결과는 `goto`가 계산 능력 자체를 위해 필수라는 주장을 약화시키지만, 기계적 변환 결과가 반드시 읽기 쉬운 프로그램이라는 뜻은 아니다.

## 위키 반영

이 자료는 [[구조적 프로그래밍]]을 이론과 방법론으로 나누어 설명하는 데 쓰인다. 표현 가능성의 정리는 [[GOTO 문]] 없이도 계산을 표현할 수 있음을 보여주지만, 실제 프로그래밍 방법론은 [[제어 구조]], [[단계적 정제]], 검증 가능한 프로그램 구성 문제를 별도로 다룬다.

## 출처

- Communications of the ACM, [Flow diagrams, turing machines and languages with only two formation rules](https://cacm.acm.org/research/flow-diagrams-turing-machines-and-languages-with-only-two-formation-rules/)
- ACM Digital Library, [DOI 10.1145/355592.365646](https://dl.acm.org/doi/10.1145/355592.365646)
- PDF copy, [Flow Diagrams, Turing Machines And Languages With Only Two Formation Rules](https://www.cs.unibo.it/~martini/PP/bohm-jac.pdf)

## 관련 항목

- [[코라도 뵘]]
- [[주세페 야코피니]]
- [[구조화 프로그램 정리]]
- [[구조적 프로그래밍]]
- [[제어 흐름]]
- [[튜링 기계]]
- [[계산 가능성]]
- [[goto와 점프에서 구조적 프로그래밍으로]]
