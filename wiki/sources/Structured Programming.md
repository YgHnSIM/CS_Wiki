---
title: Structured Programming
aliases: [Dahl Dijkstra Hoare 1972, Notes on Structured Programming]
summary: "Dahl, Dijkstra, Hoare의 1972년 책을 바탕으로 구조적 프로그래밍, 단계적 정제, 데이터 구조화의 방법론을 정리한 참고 자료."
tags: [type/reference, domain/software-engineering, domain/programming-languages, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["Academic Press 1972", "Internet Archive: Structured_Programming__Dahl_Dijkstra_Hoare"]
source_id: ref-013
source_kind: external
primary_sources: ["Academic Press 1972"]
supporting_sources: ["Internet Archive: Structured_Programming__Dahl_Dijkstra_Hoare", "ACM Guide record", "PDF copy"]
source_urls: ["https://archive.org/details/Structured_Programming__Dahl_Dijkstra_Hoare", "https://dl.acm.org/doi/book/10.5555/1243380", "https://www.dcs.gla.ac.uk/~pat/cpM/choco4/nqueens/cb-sp-dahl.pdf"]
retrieved: 2026-07-10
version: null
snapshot_status: external-only
status: active
---

## 개요

[[Structured Programming]]은 [[올레요한 달]], [[에츠허르 데이크스트라]], [[토니 호어]]의 글을 묶은 1972년 책이다. 첫 부분의 Dijkstra `Notes on Structured Programming`은 프로그램을 이해하고 증명하고 단계적으로 구성하는 방법을 다루며, Hoare의 글은 데이터 구조화, Dahl과 Hoare의 글은 계층적 프로그램 구조를 다룬다.

이 책에서 [[구조적 프로그래밍]]은 단순히 `goto`를 쓰지 않는 규칙이 아니다. 프로그램을 인간이 감당할 수 있는 작은 구조로 나누고, 그 구조들이 어떤 조건에서 올바른지 추론할 수 있게 만드는 설계 방법이다.

## 주요 인사이트

- 프로그램 설계는 인간의 제한된 이해 능력을 보완하는 정신적 도구를 필요로 한다.
- 프로그램은 먼저 올바르고 이해 가능한 구조로 구성되어야 하며, 이후 필요하면 세부 구현과 효율을 다듬을 수 있다.
- Dijkstra의 논의는 프로그램 이해, 정당성 증명, 단계별 프로그램 구성, 그룹화와 순서화 같은 주제를 중심으로 전개된다.
- 구조적 프로그래밍은 제어 흐름만이 아니라 데이터 구조와 프로그램 구조의 대응도 함께 다룬다.
- 반복 구조와 절차 호출은 실행 상태를 추적할 수 있는 규칙적 구조를 제공하며, 이는 [[스택]]과도 연결된다.

## 위키 반영

이 자료는 [[단계적 정제]], [[제어 구조]], [[프로그래밍 언어]], [[소프트웨어 공학]]을 연결하는 데 쓰인다. [[goto와 점프에서 구조적 프로그래밍으로]]는 이 책을 바탕으로 구조적 프로그래밍을 문법 금지가 아니라 프로그램을 이해 가능한 단위로 구성하는 공학적 전환으로 정리한다.

## 출처

- Internet Archive, [Structured Programming](https://archive.org/details/Structured_Programming__Dahl_Dijkstra_Hoare)
- ACM Digital Library, [Structured programming: Guide books](https://dl.acm.org/doi/book/10.5555/1243380)
- PDF copy, [Structured Programming](https://www.dcs.gla.ac.uk/~pat/cpM/choco4/nqueens/cb-sp-dahl.pdf)

## 관련 항목

- [[올레요한 달]]
- [[에츠허르 데이크스트라]]
- [[토니 호어]]
- [[구조적 프로그래밍]]
- [[제어 구조]]
- [[단계적 정제]]
- [[스택]]
- [[소프트웨어 공학]]
- [[goto와 점프에서 구조적 프로그래밍으로]]
