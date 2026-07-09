---
title: The Preparation of Programs for an Electronic Digital Computer
aliases: [WWG, Preparation of Programs, 프로그램 준비, EDSAC programming textbook]
tags: [type/reference, domain/computer-history, domain/software-engineering, status/active]
created: 2026-07-09
updated: 2026-07-09
sources: ["Internet Archive: programsforelect00wilk"]
status: active
---

## 개요

[[The Preparation of Programs for an Electronic Digital Computer]]는 [[모리스 윌크스]], [[데이비드 휠러]], [[스탠리 길]]이 쓴 초기 프로그래밍 문헌이다. 1951년 초판은 [[EDSAC]] 경험을 바탕으로 했고, 여기서 참고한 Internet Archive 판본은 1957년 제2판이다. 이 책은 특정 기계의 명령어 설명을 넘어 [[서브루틴]], [[라이브러리]], 오류 진단, [[자동 프로그래밍]]을 실무 체계로 정리한다.

이 참고 자료의 핵심은 서브루틴을 단순한 코드 조각이 아니라 문서화되고 검증되며 반복 사용되는 인터페이스 단위로 다룬다는 점이다. EDSAC의 [[라이브러리 카탈로그]]는 각 루틴의 동작, 사용 방법, 실행 시간, 정밀도, 저장 공간을 명시했고, 사용자는 내부 구현을 모두 알지 않아도 그 명세에 기대어 프로그램을 구성할 수 있었다.

책의 라이브러리 관점은 현대 [[API]] 문서와 직접 연결된다. 이름 붙은 기능, 호출 규약, 전제 조건, 비용 정보, 구현 은닉, 버전 교체 가능성은 모두 현대 API 설계의 핵심 요소다. 다만 EDSAC의 라이브러리는 종이 테이프, 메모리 위치, 수작업 입력, 기계별 명령어에 강하게 묶여 있었기 때문에 현대 API와 동일시하기보다는 API적 사고의 전사로 보는 편이 정확하다.

## 주요 인사이트

- EDSAC의 서브루틴 라이브러리는 반복 계산 루틴뿐 아니라 완성 프로그램과 [[포스트모템 루틴]]까지 포함한 공유 작업 자산이었다.
- 라이브러리 카탈로그는 루틴의 내부 코드 전체와 별도로, 사용자가 알아야 할 동작 명세와 비용 정보를 제공했다.
- 같은 기능을 하는 루틴도 실행 시간, 저장 공간, 정밀도, 매개변수 유연성에 따라 여러 버전으로 제공될 수 있었다.
- 자동 프로그래밍은 기계가 프로그램 작성의 사무적 작업, 특히 조립, 상호 참조, 부동 주소 해석, 서브루틴 삽입을 돕게 하는 시도였다.
- 디버깅 루틴은 라이브러리의 일부로 다뤄졌으며, 프로그램 실패 뒤 메모리 상태를 출력하는 포스트모템 방식은 현대 장애 분석과 덤프 분석의 초기 형태로 볼 수 있다.

## 위키 반영

이 자료는 기존 [[서브루틴]], [[Wheeler Jump]], [[라이브러리]], [[디버깅]] 페이지를 현대 [[API]] 개념과 연결하는 데 쓰인다. 새 분석 페이지 [[서브루틴 라이브러리에서 API로]]는 이 자료를 중심으로, EDSAC의 서브루틴 체계가 어떻게 구현 은닉, 문서화, 호출 규약, 비용 정보, 오류 관찰성으로 확장되는지 정리한다.

## 출처

- Internet Archive, [The Preparation of Programs for an Electronic Digital Computer](https://archive.org/details/programsforelect00wilk)
- Internet Archive, [Full text OCR](https://archive.org/stream/programsforelect00wilk/programsforelect00wilk_djvu.txt)

## 관련 항목

- [[EDSAC]]
- [[모리스 윌크스]]
- [[데이비드 휠러]]
- [[스탠리 길]]
- [[서브루틴]]
- [[라이브러리]]
- [[라이브러리 카탈로그]]
- [[API]]
- [[자동 프로그래밍]]
- [[포스트모템 루틴]]
- [[서브루틴 라이브러리에서 API로]]
