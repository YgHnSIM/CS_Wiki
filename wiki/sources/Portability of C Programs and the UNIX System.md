---
title: Portability of C Programs and the UNIX System
aliases: [C and Unix portability, Johnson Ritchie portability paper]
tags: [type/reference, domain/software-engineering, domain/programming-languages, domain/operating-systems, status/active]
created: 2026-07-10
updated: 2026-07-10
sources: ["Bell System Technical Journal 1978"]
status: active
---

## 개요

[[Portability of C Programs and the UNIX System]]은 [[스티븐 C. 존슨]]과 [[데니스 리치]]가 1978년에 발표한 논문이다. 이 문헌은 [[C 언어]] 프로그램과 [[Unix]] 시스템의 [[이식성]]을 다루며, 프로그램이 새 환경으로 옮겨질 때 다시 작성하는 것보다 훨씬 적은 노력으로 동작할 수 있어야 한다고 정의한다.

논문은 PDP-11에서 개발된 Unix 운영체제와 대부분의 소프트웨어를 Interdata 8/32로 옮긴 경험을 바탕으로, C 언어 확장과 도구, 컴파일러, 전처리기, 타입 선언, 기계 의존 코드 분리의 중요성을 설명한다.

## 주요 인사이트

- 완전한 이식성은 거의 이상에 가깝지만, 재작성보다 훨씬 적은 노력으로 옮길 수 있다면 실용적 이식성이 있다.
- 어셈블리 언어 프로그램은 거의 이식되지 않으며, 고급 언어 프로그램도 문자 크기, 워드 크기, 파일 시스템, 장치 처리 같은 기계 의존 가정에 묶일 수 있다.
- C 언어와 Unix는 같은 소스 표현을 여러 환경에서 유지하려는 방향으로 함께 발전했다.
- 전처리기의 include 기능은 기계별 선언을 표준 위치에 모아 소스의 중복과 분산된 의존성을 줄이는 데 쓰였다.
- pcc, lint 같은 도구는 C 프로그램의 이식성과 인터페이스 검사를 높이는 주변 생태계의 일부였다.

## 위키 반영

이 자료는 [[이식성]], [[C 언어]], [[컴파일러]], [[시스템 프로그래밍]], [[소프트웨어 공학]]을 보강하는 데 사용한다. [[Unix와 C]]에서는 이 논문을 통해 Unix와 C의 결합이 단지 구현 편의가 아니라, 운영체제와 도구를 다른 기계로 옮길 수 있게 한 공학적 전환으로 정리한다.

## 출처

- Nokia Bell Labs, [Portability of C Programs and the UNIX System](https://www.nokia.com/bell-labs/about/dennis-m-ritchie/portpap.pdf)
- Wiley Online Library, [Portability of C Programs and the UNIX System](https://onlinelibrary.wiley.com/doi/abs/10.1002/j.1538-7305.1978.tb02141.x)
- Bell System Technical Journal copy, [Portability of C Programs and the UNIX System](https://vtda.org/pubs/BSTJ/vol57-1978/articles/bstj57-6-2021.pdf)

## 관련 항목

- [[스티븐 C. 존슨]]
- [[데니스 리치]]
- [[Unix]]
- [[C 언어]]
- [[이식성]]
- [[컴파일러]]
- [[시스템 프로그래밍]]
- [[소프트웨어 공학]]
- [[Unix와 C]]
