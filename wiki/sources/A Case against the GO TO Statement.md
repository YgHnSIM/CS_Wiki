---
title: A Case against the GO TO Statement
aliases: [Go To Statement Considered Harmful, EWD215, GOTO Considered Harmful]
tags: [type/reference, domain/software-engineering, domain/programming-languages, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["EWD Archive EWD215", "Communications of the ACM 1968"]
source_id: ref-011
source_kind: external
primary_sources: ["Communications of the ACM 1968"]
supporting_sources: ["EWD Archive EWD215", "PDF copy"]
source_urls: ["https://www.cs.utexas.edu/~EWD/transcriptions/EWD02xx/EWD215.html", "https://dl.acm.org/doi/10.1145/362929.362947", "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[A Case against the GO TO Statement]]는 [[에츠허르 데이크스트라]]가 1968년에 발표한 짧은 글로, Communications of the ACM에는 `Go To Statement Considered Harmful`이라는 제목으로 실렸다. 이 글은 [[GOTO 문]] 자체의 문법보다, 프로그램 텍스트와 실행 중인 과정 사이의 대응 관계가 무너지면 프로그램을 이해하고 검증하기 어렵다는 점을 문제 삼는다.

Dijkstra의 핵심 논점은 프로그래머가 실제로 다루는 대상이 정적인 코드 텍스트만이 아니라, 그 코드가 기계에 위임한 동적인 실행 과정이라는 데 있다. [[제어 흐름]]을 설명할 수 있는 좌표가 단순하고 독립적이어야 실행 중 어느 지점에서 변수의 의미를 해석할 수 있다.

## 주요 인사이트

- 순차 실행과 조건 선택만 있다면 실행 진행은 프로그램 텍스트상의 한 위치로 설명할 수 있다.
- 절차 호출은 호출 깊이에 따라 텍스트 위치들의 열이 필요하고, 반복은 반복 횟수를 나타내는 동적 지표를 필요로 한다.
- 이러한 지표는 프로그래머가 임의로 조작하는 값이 아니라 프로그램 구조와 실행 과정에서 생기는 독립적 좌표다.
- 무제한 `goto`는 실행 진행을 설명할 의미 있는 좌표계를 찾기 어렵게 만든다.
- Dijkstra는 [[구조화 프로그램 정리]]가 `goto`의 논리적 불필요성을 보여준다고 보면서도, 임의 흐름도를 기계적으로 점프 없는 형태로 바꾸는 작업이 프로그램을 더 투명하게 만들지는 않는다고 경고했다.

## 위키 반영

이 자료는 [[Wheeler Jump]] 같은 저수준 점프 기법과 고급 언어의 무제한 `goto`를 구분하는 데 쓰인다. 기계 수준의 점프는 실행을 구현하는 장치지만, 고급 언어의 제어 구조는 사람이 프로그램을 추적할 수 있도록 실행 경로를 제한하고 이름 붙이는 장치다. 이 관점은 [[goto와 점프에서 구조적 프로그래밍으로]]에서 분석한다.

## 출처

- E.W. Dijkstra Archive, [A Case against the GO TO Statement](https://www.cs.utexas.edu/~EWD/transcriptions/EWD02xx/EWD215.html)
- ACM Digital Library, [Letters to the editor: go to statement considered harmful](https://dl.acm.org/doi/10.1145/362929.362947)
- PDF copy, [Go To Statement Considered Harmful](https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf)

## 관련 항목

- [[에츠허르 데이크스트라]]
- [[GOTO 문]]
- [[제어 흐름]]
- [[제어 구조]]
- [[구조적 프로그래밍]]
- [[구조화 프로그램 정리]]
- [[goto와 점프에서 구조적 프로그래밍으로]]
