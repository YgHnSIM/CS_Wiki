---
title: 위키 개요
aliases: [overview, 홈페이지, 전체 개요]
tags: [type/meta, status/active]
created: 2026-05-03
updated: 2026-07-10
sources: []
status: active
---

## 현재 상태

이 위키는 컴퓨터 과학과 컴퓨팅사 지식을 원본 소스 기반으로 정리한다. 현재 정규 소스는 6개 묶음, 참고 자료는 29개이며, 주요 주제는 19세기 기계식 계산 장치에서 계산 가능성과 기계 계산의 이론적 의미, 20세기 초기 저장 프로그램 컴퓨터의 계보, 로더, 어셈블러, 서브루틴, 스택 기반 호출 구조, `goto`와 구조적 프로그래밍, Fortran과 컴파일러, Unix와 C, 서브루틴 라이브러리와 API적 사고, 소프트웨어 재사용의 역사, 논리 회로와 이진 표현, 디지털 데이터 표현과 메모리 안전성, 그리고 유니코드 기반 텍스트 인코딩 심화로 이어지는 컴퓨팅 개념의 형성이다.


<!-- wiki-maintenance: status-summary -->
운영 상태: 전체 161개 페이지 중 active 146개, draft 15개, review 0개, archived 0개다.

## 주요 주제

### 컴퓨팅의 기원

[[컴퓨팅의 기원 - 배비지와 러브레이스]]는 [[찰스 배비지]]와 [[에이다 러브레이스]]를 중심으로 계산 자동화, 범용 프로그램 가능성, 기호 조작의 출발점을 다룬다. 이 주제의 핵심 페이지는 [[차분 기관]], [[해석 기관]], [[유한 차분법]], [[알고리즘적 사고]], [[기호 조작]]이다.

### 계산 가능성과 기계 계산

[[On Computable Numbers with an Application to the Entscheidungsproblem]]와 [[An Unsolvable Problem of Elementary Number Theory]]는 "기계가 계산한다"는 말을 형식화하는 이론적 축이다. 이 주제는 [[계산 가능성]], [[튜링 기계]], [[보편 튜링 기계]], [[정지 문제]], [[Entscheidungsproblem]], [[처치-튜링 논제]]를 통해 계산 가능한 절차와 계산 불가능한 문제의 경계를 정리한다. 핵심 분석은 [[기계가 계산한다는 말의 이론적 의미]]에 모았다.

### 저장 프로그램 컴퓨터의 계보

[[First Draft of a Report on the EDVAC]]와 [[The Manchester Small Scale Experimental Machine - The Baby]]는 [[저장 프로그램 컴퓨터]]의 최초성 기준을 정밀하게 나누는 데 쓰인다. [[EDVAC]]은 설계와 문서화, [[폰 노이만 구조]]는 논리 구조의 표준 이름, [[Manchester Baby]]는 저장 프로그램 실행 증명, [[EDSAC]]은 실용적 운영의 사례로 정리된다. [[Cambridge Computer Laboratory - The History of the Computer Lab]]는 EDSAC I과 마이크로프로그램 방식의 후속 EDSAC II를 구분한다. 이 구분은 [[저장 프로그램 개념의 여러 기원]]과 [[EDSAC은 무엇의 최초인가]]에서 분석한다.

### 초기 소프트웨어

[[초기 소프트웨어의 탄생]]과 [[EDSAC과 Initial Orders]]는 [[EDSAC]]을 중심으로 [[저장 프로그램 컴퓨터]], [[Initial Orders]], [[부트스트랩]], [[로더]], [[어셈블러]], [[자기 수정 코드]], [[재배치]], [[링커]]가 어떻게 초기 소프트웨어의 계층을 형성했는지 다룬다. 이 주제는 [[소프트웨어 공학]]의 역사적 기원을 이해하는 핵심 축이다.

### 서브루틴과 호출 구조

[[서브루틴과 스택(Stack)의 원리]]와 [[폐쇄형 서브루틴과 Wheeler Jump]]는 [[서브루틴]]의 본질을 [[복귀 주소]] 관리 문제로 설명한다. [[Wheeler Jump]]는 스택 없는 환경에서 복귀 점프를 만들어낸 초기 기법이고, [[스택]]과 [[스택 프레임]]은 중첩 호출과 재귀 호출을 가능하게 한 다음 단계로 정리된다.

### goto와 구조적 프로그래밍

[[A Case against the GO TO Statement]], [[Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules]], [[Structured Programming]], [[Structured Programming with go to Statements]]는 [[GOTO 문]]과 [[구조적 프로그래밍]]의 논쟁을 정리하는 참고 자료다. 이 축은 [[제어 흐름]], [[제어 구조]], [[구조화 프로그램 정리]], [[단계적 정제]]를 통해, 기계적 점프가 고급 언어에서 사람이 추적 가능한 실행 구조로 정리되는 과정을 다룬다. 핵심 분석은 [[goto와 점프에서 구조적 프로그래밍으로]]에 모았다.

### 서브루틴 라이브러리와 API

[[The Preparation of Programs for an Electronic Digital Computer]]는 EDSAC의 서브루틴 체계를 [[라이브러리]], [[라이브러리 카탈로그]], [[API]], [[자동 프로그래밍]], [[포스트모템 루틴]]으로 확장해 보여준다. [[서브루틴 라이브러리에서 API로]]는 내부 구현을 모두 알지 않아도 문서화된 명세와 호출 규약을 통해 루틴을 사용할 수 있었다는 점을 현대 API의 전사로 분석한다.

### 소프트웨어 재사용

[[Mass Produced Software Components]], [[On the Criteria To Be Used in Decomposing Systems into Modules]], [[Software Reuse]], [[Sixteen Questions about Software Reuse]]는 [[소프트웨어 재사용]]이 서브루틴 보관을 넘어 컴포넌트 제품군, [[모듈화]], [[정보 은닉]], 추상화, 검색, 특수화, 조직적 실천의 문제로 확장되는 과정을 다룬다. 이 축은 [[소프트웨어 컴포넌트]], [[더글러스 매킬로이]], [[데이비드 파나스]], [[찰스 W. 크루거]]를 통해 정리하며, 핵심 분석은 [[소프트웨어 재사용의 역사]]에 모았다.

### Fortran과 컴파일러

[[FORTRAN Automatic Coding System for the IBM 704 EDPM]], [[The FORTRAN Automatic Coding System]], [[The History of FORTRAN I, II, and III]]는 [[Fortran]]을 고급 언어와 [[컴파일러]]가 결합된 시스템으로 정리하는 참고 자료다. 이 축은 [[IBM 704]], [[소스 프로그램]], [[목적 프로그램]], [[컴파일러 최적화]], [[존 배커스]]를 통해, 사람이 쓰는 수학적 표기가 실행 가능한 기계어 프로그램으로 바뀌는 과정을 다룬다. 핵심 분석은 [[Fortran과 컴파일러]]에 모았다.

### Unix와 C

[[The UNIX Time-Sharing System]], [[The Development of the C Language]], [[The Evolution of the Unix Time-sharing System]], [[Portability of C Programs and the UNIX System]]는 [[Unix]]와 [[C 언어]]가 함께 형성된 과정을 정리하는 참고 자료다. 이 축은 [[데니스 리치]], [[켄 톰프슨]], [[PDP-11]], [[운영체제]], [[파일 시스템]], [[시스템 호출]], [[유닉스 파이프]], [[시스템 프로그래밍]], [[이식성]]을 통해 운영체제와 언어가 서로를 강화한 과정을 다룬다. 핵심 분석은 [[Unix와 C]]에 모았다.

### 데이터 표현과 안전성

[[데이터 표현과 인코딩]]은 [[인코딩]], [[이진법]], [[비트와 바이트]], [[ASCII]], [[비트 연산]]을 통해 디지털 데이터가 어떻게 표현되고 해석되는지 설명한다. [[C Integer and Shift Semantics]]는 시프트와 정수 오버플로의 언어별 조건을 보강한다. 이 주제는 [[C 문자열]], [[정수 오버플로]], [[메모리 안전성]]을 통해 낮은 수준의 표현 규칙이 시스템 안정성과 보안으로 이어짐을 보여준다. [[비트 패턴과 해석 규칙]]은 이 관점을 인코딩, 타입, 경계 조건, 텍스트 처리 오류까지 확장한다.

### 인코딩과 유니코드 심화

[[The Unicode Standard 17.0.0]], [[RFC 3629 UTF-8]], [[Unicode Normalization Forms]], [[Unicode Text Segmentation]], [[WHATWG Encoding Standard]], [[Unicode Security Mechanisms]]는 텍스트 인코딩의 세부 층위를 보강하는 참고 자료다. 이 축은 [[유니코드]], [[코드 포인트]], [[Unicode scalar value]], [[코드 유닛]], [[UTF-8]], [[UTF-16]], [[바이트 순서 표식]], [[유니코드 정규화]], [[그래핌 클러스터]], [[인코딩 오류]], [[동형이의 문자]]를 통해 "문자"가 단일 단위가 아니라는 점을 정리한다. 핵심 분석은 [[인코딩 심화]]에 모았다.

### 논리 회로와 이진 표현

[[A Symbolic Analysis of Relay and Switching Circuits]]는 [[클로드 섀넌]]이 [[릴레이 회로]]와 [[스위칭 회로]]를 [[불 대수]]로 분석한 참고 자료다. 이 축은 [[이진법]]의 0과 1이 단순한 수 표기만이 아니라 물리적 두 상태, [[논리 게이트]], [[이진 덧셈 회로]], [[비트 연산]]으로 이어지는 회로적 기반임을 정리한다. 핵심 분석은 [[논리 회로와 이진 표현]]에 모았다.

### 핵심 분석

[[계산기와 컴퓨터의 차이]]는 차분 기관, 해석 기관, EDSAC을 비교해 특정 계산 장치와 저장 프로그램 기반 범용 컴퓨터의 차이를 정리한다. [[기계가 계산한다는 말의 이론적 의미]]는 계산을 유한한 규칙에 따른 기호 상태 변환으로 보고, 보편 기계와 계산 불가능성의 의미를 연결한다. [[저장 프로그램 개념의 여러 기원]]은 EDVAC, Manchester Baby, EDSAC을 설계·실행·실용 운영 기준으로 나누어 분석한다. [[EDSAC은 무엇의 최초인가]]는 EDSAC의 고유한 최초성을 "실용적 범용 저장 프로그램 전자식 컴퓨터"라는 기준으로 제한한다. [[초기 소프트웨어의 계층화]]는 입력, 번역, 적재, 재배치, 호출 상태, 관찰, 재사용, 제어, 언어 설계가 소프트웨어 스택으로 쌓이는 과정을 분석한다. [[goto와 점프에서 구조적 프로그래밍으로]]는 점프와 `goto`를 구분하고 제어 흐름이 사람이 추적 가능한 구조로 제한되는 과정을 분석한다. [[Fortran과 컴파일러]]는 고급 언어가 실용화되려면 소스 프로그램을 효율적 목적 프로그램으로 바꾸는 컴파일러가 필요했다는 점을 분석한다. [[Unix와 C]]는 운영체제와 시스템 프로그래밍 언어가 이식성, 도구 조합, 파일·프로세스 모델 안에서 서로를 강화한 과정을 분석한다. [[서브루틴 라이브러리에서 API로]]는 재사용 코드가 문서화된 인터페이스와 비용 정보를 요구하게 되는 과정을 분석한다. [[소프트웨어 재사용의 역사]]는 서브루틴, 라이브러리, API, 컴포넌트, 모듈화, 이식성, 재사용 연구가 재사용 가능한 소프트웨어를 공학 체계로 만드는 과정을 분석한다. [[논리 회로와 이진 표현]]은 비트가 물리적 스위치 상태와 논리식 사이에서 어떻게 생성되고 조작되는지 정리한다. [[비트 패턴과 해석 규칙]]은 비트 자체가 아니라 인코딩, 타입, 경계 조건이 데이터 의미와 보안성을 결정한다는 관점을 정리한다. [[인코딩 심화]]는 이 관점을 텍스트 처리 내부의 코드 포인트, 코드 유닛, 정규화, 그래핌 클러스터, 보안 식별자 문제로 확장한다.

## 운영 메모

- `raw/` 원본은 수정하지 않는다.
- 새 페이지를 만들거나 갱신하면 [[index]]와 [[log]]를 함께 갱신한다.
- 일반 주장은 프론트매터의 `sources`와 각 페이지의 `## 출처` 섹션에 근거를 남긴다.

## 출처

- `AGENTS.md`
- `wiki/index.md`

## 관련 항목

- [[index]]
- [[log]]
- [[컴퓨팅의 기원 - 배비지와 러브레이스]]
- [[초기 소프트웨어의 탄생]]
- [[EDSAC과 Initial Orders]]
- [[First Draft of a Report on the EDVAC]]
- [[The Manchester Small Scale Experimental Machine - The Baby]]
- [[On Computable Numbers with an Application to the Entscheidungsproblem]]
- [[An Unsolvable Problem of Elementary Number Theory]]
- [[기계가 계산한다는 말의 이론적 의미]]
- [[저장 프로그램 개념의 여러 기원]]
- [[EDSAC은 무엇의 최초인가]]
- [[서브루틴과 스택(Stack)의 원리]]
- [[폐쇄형 서브루틴과 Wheeler Jump]]
- [[A Case against the GO TO Statement]]
- [[Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules]]
- [[Structured Programming]]
- [[Structured Programming with go to Statements]]
- [[goto와 점프에서 구조적 프로그래밍으로]]
- [[The Preparation of Programs for an Electronic Digital Computer]]
- [[서브루틴 라이브러리에서 API로]]
- [[Mass Produced Software Components]]
- [[On the Criteria To Be Used in Decomposing Systems into Modules]]
- [[Software Reuse]]
- [[Sixteen Questions about Software Reuse]]
- [[소프트웨어 재사용의 역사]]
- [[FORTRAN Automatic Coding System for the IBM 704 EDPM]]
- [[The FORTRAN Automatic Coding System]]
- [[The History of FORTRAN I, II, and III]]
- [[Fortran과 컴파일러]]
- [[The UNIX Time-Sharing System]]
- [[The Development of the C Language]]
- [[The Evolution of the Unix Time-sharing System]]
- [[Portability of C Programs and the UNIX System]]
- [[Unix와 C]]
- [[A Symbolic Analysis of Relay and Switching Circuits]]
- [[논리 회로와 이진 표현]]
- [[데이터 표현과 인코딩]]
- [[The Unicode Standard 17.0.0]]
- [[RFC 3629 UTF-8]]
- [[Unicode Normalization Forms]]
- [[Unicode Text Segmentation]]
- [[WHATWG Encoding Standard]]
- [[Unicode Security Mechanisms]]
- [[인코딩 심화]]
