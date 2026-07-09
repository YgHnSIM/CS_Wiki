---
title: EDSAC
aliases: [Electronic Delay Storage Automatic Calculator]
tags: [type/concept, domain/computer-history, domain/software-engineering, status/active]
created: 2026-05-04
updated: 2026-07-10
sources: ["초기 소프트웨어의 탄생.md", "초기 소프트웨어의 탄생_해설.md", "EDSAC과 Initial Orders.md", "EDSAC과 Initial Orders_해설.md", "서브루틴과 스택(Stack)의 원리.md", "폐쇄형 서브루틴과 Wheeler Jump.md", "The Preparation of Programs for an Electronic Digital Computer", "First Draft of a Report on the EDVAC", "The Manchester Small Scale Experimental Machine - The Baby"]
status: active
---

## 개요

[[EDSAC]](Electronic Delay Storage Automatic Calculator)은 케임브리지 대학에서 구축된 초기 [[저장 프로그램 컴퓨터]]다. 이 위키에서 EDSAC은 초기 소프트웨어가 입력 체계, 적재 절차, 디버깅, 서브루틴, 라이브러리, 언어 설계로 층을 이루기 시작한 핵심 사례로 정리된다.

EDSAC의 역사적 지위는 절대적 "최초 컴퓨터"가 아니라, 실용적 범용 저장 프로그램 전자식 컴퓨터라는 기준에서 이해하는 편이 정확하다. [[Manchester Baby]]가 1948년에 저장 프로그램을 실행했고 [[EDVAC]]이 먼저 현대적 저장 프로그램 컴퓨터로 설계되었다면, EDSAC은 1949년부터 실제 연구 계산 서비스와 소프트웨어 실천을 축적한 사례다.

## 시스템 구조

EDSAC의 메모리는 512개의 35비트 word를 1024개의 17비트 half-word로 나누어 다룰 수 있었고, 명령어는 대체로 `[opcode][address][S/L]` 형식의 half-word 단위로 표현되었다. 이 구조 때문에 [[Initial Orders]]는 종이 테이프의 문자 명령을 읽어 opcode, 주소, 길이 정보를 조립하고 정확한 메모리 위치에 저장해야 했다.

## 설계 철학

[[모리스 윌크스]]는 이론적 성능보다 안정적으로 작동하는 기계를 우선했다. 수은 지연선 메모리와 보수적 동작 속도 선택은 당시 더 야심찬 설계보다 실용성을 중시한 결정이었다. 이 안정성이 있었기 때문에 프로그램의 구조, 오류, 재사용, 추상화 같은 문제가 독립적인 소프트웨어 문제로 떠오를 수 있었다.

Wilkes의 EDSAC 설계는 [[First Draft of a Report on the EDVAC]]와 Moore School을 통해 확산된 저장 프로그램 개념의 영향을 받았다. 하지만 EDSAC의 고유한 의미는 그 개념을 보수적이고 안정적인 기계, 입력 절차, 사용자 공동체, 프로그램 라이브러리로 묶어 실용화했다는 데 있다.

## 소프트웨어사적 의미

- [[Initial Orders]]를 통해 종이 테이프 프로그램을 읽고 메모리에 적재하는 초기 [[로더]]와 [[어셈블러]] 계층을 만들었다.
- [[디버깅]] 루틴을 통해 프로그램 내부 상태를 관찰하고 오류를 국소화하는 실천을 발전시켰다.
- [[데이비드 휠러]]의 [[Wheeler Jump]]와 폐쇄형 [[서브루틴]]을 통해 함수 호출과 모듈화의 초기 형태를 보여주었다.
- 검증된 서브루틴을 [[라이브러리]]와 카탈로그로 관리해 소프트웨어를 개인 기술에서 집단적 자산으로 전환했다.
- [[The Preparation of Programs for an Electronic Digital Computer]]를 통해 EDSAC의 라이브러리, 오류 진단, [[자동 프로그래밍]] 경험이 저장 프로그램 컴퓨터 일반을 위한 프로그래밍 지식으로 정리되었다.

## 출처

- [[초기 소프트웨어의 탄생]]
- [[EDSAC과 Initial Orders]]
- [[서브루틴과 스택(Stack)의 원리]]
- [[폐쇄형 서브루틴과 Wheeler Jump]]
- [[The Preparation of Programs for an Electronic Digital Computer]]
- [[First Draft of a Report on the EDVAC]]
- [[The Manchester Small Scale Experimental Machine - The Baby]]

## 관련 항목

- [[저장 프로그램 컴퓨터]]
- [[EDVAC]]
- [[Manchester Baby]]
- [[폰 노이만 구조]]
- [[모리스 윌크스]]
- [[Initial Orders]]
- [[로더]]
- [[어셈블러]]
- [[디버깅]]
- [[서브루틴]]
- [[Wheeler Jump]]
- [[라이브러리]]
- [[라이브러리 카탈로그]]
- [[API]]
- [[자동 프로그래밍]]
- [[포스트모템 루틴]]
- [[초기 소프트웨어의 계층화]]
- [[서브루틴 라이브러리에서 API로]]
- [[저장 프로그램 개념의 여러 기원]]
- [[EDSAC은 무엇의 최초인가]]
