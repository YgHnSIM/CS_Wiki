---
schema_version: 2
id: ref-096
kind: reference
title: "LLVM: A Compilation Framework for Lifelong Program Analysis & Transformation"
aliases:
  - "LLVM: A Compilation Framework for Lifelong Program Analysis & Transformation"
  - LLVM
  - Lattner and Adve 2004
  - LLVM IR
summary: 정적·링크·실행·유휴 단계에서 프로그램 분석과 변환을 이어 갈 수 있도록 SSA 기반의 저수준 공통 표현과 컴파일러 프레임워크를 제안한 2004년 LLVM 논문.
domains:
  - software-engineering
  - programming-languages
  - computer-architecture
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:182d1dc9eea69f7dd6143f1d1aa6b5a8b9f654d49c8b0050faf9fd8e5a7f4cc8
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - programmability
  - realized-performance
history:
  publication_year: 2004
  layer: software
redirect_from:
  - /references/llvm-a-compilation-framework-for-lifelong-program-analysis-transformation/
  - /sources/llvm-a-compilation-framework-for-lifelong-program-analysis-transformation/
origin: external
works:
  primary:
    - citation: "Chris Lattner and Vikram Adve, LLVM: A Compilation Framework for Lifelong Program Analysis & Transformation, CGO 2004"
      genre: other
      identifiers: []
      edition: CGO '04, pp. 75–88
  supporting:
    - citation: LLVM project publication page and author-hosted conference paper PDF
      genre: primary-literature
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://llvm.org/pubs/2004-01-30-CGO-LLVM.html
    retrieved: 2026-07-25
    version: CGO '04, pp. 75–88
  - kind: url
    role: mirror
    url: https://llvm.org/pubs/2004-01-30-CGO-LLVM.pdf
    retrieved: 2026-07-25
    version: CGO '04, pp. 75–88
---

## 개요

[[LLVM - A Compilation Framework for Lifelong Program Analysis and Transformation|LLVM]]은 Chris Lattner와 Vikram Adve가 2004년 CGO에서 발표한 컴파일러 프레임워크 논문이다. 논문은 소스 언어와 특정 기계 사이에 정적 단일 대입(SSA) 형식의 저수준 공통 표현을 두고, 컴파일 시점뿐 아니라 링크·실행 시점과 실행 사이의 유휴 시간에도 분석과 변환을 이어 갈 수 있게 하려 했다.

핵심은 하나의 표현이 모든 언어의 고수준 구조를 그대로 보존한다는 데 있지 않다. LLVM의 표현은 언어 독립적인 형식·명시적인 제어 흐름·무한 가상 레지스터를 제공하면서도 목적 기계 코드로 낮출 수 있도록 설계되었다. 이 균형은 언어별 프런트엔드, 공통 최적화, 기계별 백엔드를 느슨하게 분리하는 기반이 된다.

## 표현의 수명과 변환 범위

논문이 말하는 lifelong analysis는 프로그램이 설치된 뒤에도 프로파일 정보와 공통 표현을 이용해 분석·변환할 수 있다는 설계 방향이다. 이때 정적 코드 생성, 링크 시점 전역 최적화, 제한된 실행 시점 최적화는 같은 프로그램 표현을 다른 비용·시간 예산에서 이용한다.

LLVM의 SSA 표현은 값의 정의와 사용 관계를 명시해 데이터 흐름 분석에 유리하다. 다만 이 논문은 LLVM IR이 모든 언어의 의미를 완전하게 담는 보편 중간 언어이거나, 특정 실행 환경의 객체 모델·메모리 안전성을 자동으로 제공한다고 주장하지 않는다. 어떤 소스 의미를 어느 수준까지 보존할지는 프런트엔드, 언어 규칙, 최적화 옵션과 런타임 계약이 함께 정한다.

## 위키 반영

이 자료는 [[중간 표현]]이 단순한 임시 파일 형식이 아니라, 여러 단계의 분석과 최적화가 만나는 프로그램 표현임을 뒷받침한다. 또한 [[컴파일러 최적화]]를 소스에서 기계어로 한 번 내리는 과정에 한정하지 않고, 링크·프로파일·실행 단계와 연결해 읽게 한다. [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning|TVM]]은 이 공통 표현의 생각을 계산 그래프와 텐서 연산, 이기종 가속기 배치로 확장하는 후대 사례다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[중간 표현]] | 언어 독립적 SSA 기반의 저수준 코드 표현을 여러 분석·변환 단계가 공유하도록 설계했다. | [[LLVM - A Compilation Framework for Lifelong Program Analysis and Transformation]] |
| enables | [[컴파일러 최적화]] | 정적·링크·실행 시점에 데이터 흐름과 형식 정보를 이용할 수 있는 공통 변환 기반을 제공한다. | [[LLVM - A Compilation Framework for Lifelong Program Analysis and Transformation]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- LLVM Project, [publication page](https://llvm.org/pubs/2004-01-30-CGO-LLVM.html)
- LLVM Project, [conference paper PDF](https://llvm.org/pubs/2004-01-30-CGO-LLVM.pdf)

## 관련 항목

- [[중간 표현]] — 소스 언어와 기계별 코드 생성 사이에서 분석·변환을 가능하게 하는 표현 계층을 정리한다.
- [[컴파일러]] — LLVM이 확장하는 번역·분석·코드 생성 도구의 기본 역할을 설명한다.
- [[컴파일러 최적화]] — 공통 표현 위에서 수행되는 변환의 성능·정확성 조건을 다룬다.
- [[성능 이식성]] — 같은 프로그램 의미를 서로 다른 대상에서 경쟁력 있는 실행으로 옮기는 더 강한 목표를 구분한다.
- [[TVM - An Automated End-to-End Optimizing Compiler for Deep Learning|TVM]] — 계산 그래프와 연산자 수준 최적화를 이기종 백엔드로 연결한 후대 사례다.
