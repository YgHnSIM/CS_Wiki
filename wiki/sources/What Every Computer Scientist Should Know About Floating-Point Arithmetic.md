---
title: What Every Computer Scientist Should Know About Floating-Point Arithmetic
aliases: [Goldberg 1991, What Every Computer Scientist Should Know About Floating Point Arithmetic, 모든 컴퓨터 과학자가 부동소수점 연산에 대해 알아야 할 것]
summary: "부동소수점의 표현·반올림 오차·상쇄·정확한 반올림과 IEEE 754-1985의 시스템적 의미를 연결한 David Goldberg의 1991년 해설 논문."
tags: [type/reference, domain/computer-architecture, domain/mathematics, status/active]
created: 2026-07-16
updated: 2026-07-18
publication_year: 1991
historical_layer: measurement
capability_layers: [reliable-results]
sources: ["David Goldberg, What Every Computer Scientist Should Know About Floating-Point Arithmetic, ACM Computing Surveys 23(1), 1991, pp. 5-48", "Corrigendum, ACM Computing Surveys 23(3), 1991, p. 413", "Internet Archive access copy of the corrigendum", "Oracle Numerical Computation Guide edited reprint", "IEEE 754 Working Group background addendum on implementation differences"]
source_id: ref-050
source_kind: external
primary_sources: ["David Goldberg, What Every Computer Scientist Should Know About Floating-Point Arithmetic, ACM Computing Surveys 23(1), 1991, pp. 5-48", "Corrigendum, ACM Computing Surveys 23(3), 1991, p. 413"]
supporting_sources: ["ACM DOI record", "Internet Archive access copy of the corrigendum", "Oracle Numerical Computation Guide edited reprint", "IEEE 754 Working Group background addendum on implementation differences"]
source_urls: ["https://doi.org/10.1145/103162.103163", "https://archive.org/details/sim_acm-computing-surveys_1991-09_23_3/page/n150/mode/1up", "https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html", "https://grouper.ieee.org/groups/msc/ANSI_IEEE-Std-754-2019/background/addendum.html"]
retrieved: 2026-07-16
version: "ACM Computing Surveys 23(1), March 1991, pp. 5-48; corrigendum 23(3), September 1991, p. 413"
snapshot_status: external-only
status: active
---

## 개요

[[What Every Computer Scientist Should Know About Floating-Point Arithmetic]]은 David Goldberg가 1991년 《ACM Computing Surveys》에 발표한 해설 논문이다. 유한한 비트로 실수를 근사하는 표현에서 출발해 반올림 오차, 가드 숫자(guard digit), 상쇄(cancellation), 정확한 반올림(exact rounding), 예외 처리와 컴파일러·운영체제 지원을 하나의 시스템 문제로 연결한다.

부동소수점 형식은 밑(base), 유효숫자 정밀도와 지수 범위로 표현 가능한 수의 유한 집합을 만든다. 어떤 실수는 그 집합의 두 수 사이에 놓이고, 어떤 값은 표현 범위를 벗어난다. 예를 들어 유한한 십진 표현 `0.1`은 이진수에서는 무한히 반복되므로 유한 정밀도의 이진 부동소수점으로 정확히 나타낼 수 없다. 이 경우 저장과 연산에는 반올림이 들어가며, 오차가 생겼다는 사실보다 오차를 어떻게 제한하고 추론할 수 있는지가 중요해진다.

논문은 1985년판 IEEE 부동소수점 표준을 다룬다. 따라서 역사적으로 표준화가 연산 의미와 이식성을 어떻게 바꿨는지를 이해하는 원전이지만, 현행 [[IEEE 754-2019 Standard for Floating-Point Arithmetic|IEEE 754-2019]]의 전체 내용을 대신하지 않는다. 현재 판본과 개정 상태는 IEEE 공식 기록을 별도로 따라야 한다.

## 오차를 말하는 여러 척도

절대 오차, 상대 오차와 마지막 자리 단위(unit in the last place, ulp)는 같은 질문에 답하지 않는다. 절대 오차는 값의 단위에 의존하고, 상대 오차는 참값에 대한 비율을 보며, ulp는 해당 크기 구간에서 인접한 표현 가능 수의 간격을 기준으로 삼는다. Goldberg는 ulp 오차와 상대 오차의 크기가 밑에 따라 흔들릴 수 있음을 보인다. 따라서 “몇 ulp”와 “상대 오차 몇”을 정의 없이 같은 정밀도 주장으로 바꾸면 안 된다.

반올림 모드도 결과를 바꾼다. 가장 가까운 두 수의 정확한 중간값에서 짝수 쪽을 택하는 round-to-even은 중간값을 언제나 올리는 규칙과 다르다. Goldberg는 특정한 반복 덧셈·뺄셈 식에서 항상 올리는 규칙이 값을 떠돌게 할 수 있지만 round-to-even은 반복 뒤 값을 안정적으로 되돌리는 Reiser–Knuth 결과를 소개한다. 이는 모든 알고리즘이 무편향이라는 보장이 아니다. 문제의 조건, 식의 형태와 오차가 전파되는 경로를 함께 분석해야 한다.

## 가드 숫자와 정확한 반올림

뺄셈 또는 반대 부호의 덧셈에서 두 피연산자의 자릿수를 맞출 때 낮은 자릿수를 모두 버리면 큰 상대 오차가 생길 수 있다. 한 자리의 가드 숫자를 더 사용하면 이 오차를 크게 제한할 수 있고, Goldberg가 다룬 여러 식을 안정적으로 계산하는 데 충분한 조건이 된다.

그러나 **가드 숫자 하나를 쓰는 것**과 **정확하게 반올림하는 것**은 같은 보장이 아니다. 정확한 반올림은 수학적으로 정확한 연산 결과를 먼저 구했다고 가정한 뒤 목적 형식에서 요구하는 값으로 한 번 반올림한 것과 같은 결과를 내는 성질이다. 한 가드 숫자는 상대 오차를 제한해도 항상 그 결과와 같지는 않다. 이 구분은 빠른 근사 구현과 연산 의미의 표준화를 혼동하지 않게 한다.

## 상쇄는 언제 위험한가

서로 가까운 수를 빼면 유효숫자가 많이 사라져 결과가 불안정해 보인다. 하지만 상쇄 자체가 항상 새 오차를 만드는 것은 아니다. 입력이 이미 정확한 부동소수점 수이고 두 수의 크기가 충분히 가까운 조건에서는 뺄셈이 정확할 수 있다. 이 경우 사라진 앞자리는 두 입력이 공유하던 정보다.

위험한 상쇄(catastrophic cancellation)는 입력이 앞선 계산이나 변환에서 이미 근사된 값일 때 두드러진다. 큰 공통 부분이 지워지면 그동안 작게 보이던 입력 오차가 작은 결과에 비해 크게 드러난다. 반대로 정확히 알려진 양의 차를 취하는 양성 상쇄(benign cancellation)는 유용한 계산 단계가 될 수 있다. 따라서 해결책은 뺄셈을 무조건 피하는 것이 아니라, 입력 오차와 식의 변형이 최종 상대 오차를 어떻게 바꾸는지 분석하는 것이다.

## 산술에서 시스템으로

정확한 연산 의미는 하드웨어 한 장치의 문제가 아니다. 중간 결과를 어느 정밀도에 저장하는지, 예외와 기본값을 어떻게 전달하는지, 컴파일러가 연산 순서를 바꾸는지, 운영체제가 부동소수점 상태를 어떻게 보존하는지가 프로그램의 결과에 관여한다. Goldberg는 이 때문에 부동소수점 지원을 명령어 집합, 컴파일러와 운영체제를 아우르는 시스템 설계 문제로 다룬다.

IEEE 연산이 정밀하게 규정되면 같은 입력·연산 순서·목적 형식에서 기본 연산을 추론하기 쉬워진다. 그러나 컴파일러나 병렬 실행이 연산 순서를 바꾸거나 중간 형식이 달라지면 표준을 따르는 두 실행도 전체 프로그램의 마지막 비트가 다를 수 있다. 표준 연산의 결정성과 프로그램 전체의 비트 단위 재현성은 구분해야 한다.

## 판본과 적용 경계

- 원 논문은 44쪽인 1991년 3월 게재본이며 같은 해 9월의 정오표(corrigendum)를 함께 보아야 한다.
- 정오표는 정확한 차와 계산된 차의 기호, 두 식과 한 수치 예시, 극한값, 저자명 철자와 참고문헌을 포함한 7건을 바로잡는다. 이 페이지는 정정된 의미를 따르며, 원 게재본의 식을 직접 인용할 때는 정오표를 대조해야 한다.
- Oracle의 공개 HTML은 허가를 받아 실은 **편집된 재수록본**이다. 원 게재본과 동일 판본으로 취급하지 않는다.
- Oracle판 뒤의 `Differences Among IEEE 754 Implementations`는 후대에 붙은 부록이며 Goldberg의 원 논문이나 저작이 아니다. 구현 차이의 보조 근거로만 사용한다.
- 논문의 IEEE 설명은 754-1985를 배경으로 한다. 2008년과 2019년 개정의 현행 규범은 [[IEEE 754-2019 Standard for Floating-Point Arithmetic]]에서 공식 공개 범위만 별도로 정리한다.
- 논문은 모든 수치 알고리즘의 정확성을 자동으로 증명하지 않는다. 오차 분석이 가능한 산술 기반과 시스템 지원 조건을 설명한다.

## 주요 인사이트

- 부동소수점은 실수 자체가 아니라 정해진 형식에서 표현 가능한 유한한 수와 연산 규칙이다.
- ulp, 상대 오차와 절대 오차는 서로 다른 척도이며 정의와 값의 크기를 함께 밝혀야 한다.
- 한 가드 숫자는 유용한 오차 제한이지만 정확한 반올림과 동일하지 않다.
- 상쇄는 입력에 있던 오차를 드러내는 경우와 정확한 차를 구하는 경우를 구분해야 한다.
- 부동소수점의 신뢰성은 하드웨어뿐 아니라 컴파일러, 예외 처리와 중간 정밀도에 달려 있다.
- 표준화는 기본 연산을 추론 가능하게 하지만 전체 프로그램의 정확성·비트 재현성을 단독으로 보장하지 않는다.

## 위키 반영

이 자료는 [[부동소수점 정확성]]의 표현·반올림·상쇄 개념과 [[컴파일러 최적화]]가 수치 의미에 미치는 영향을 설명하는 직접 근거다. [[더 빠른 계산은 같은 답을 내는가]]에서는 연산 속도를 높이는 변환이 어떤 결과 계약을 지켜야 같은 성능 비교가 되는지 분석한다.

## 출처

- ACM, [DOI record](https://doi.org/10.1145/103162.103163)
- Internet Archive, [corrigendum page in ACM Computing Surveys 23(3)](https://archive.org/details/sim_acm-computing-surveys_1991-09_23_3/page/n150/mode/1up)
- Oracle Numerical Computation Guide, [edited reprint](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
- IEEE 754 Working Group background, [Differences Among IEEE 754 Implementations](https://grouper.ieee.org/groups/msc/ANSI_IEEE-Std-754-2019/background/addendum.html)
- David Goldberg, “What Every Computer Scientist Should Know About Floating-Point Arithmetic,” 《ACM Computing Surveys》 23(1), 1991, pp. 5–48; corrigendum 23(3), 1991, p. 413.

## 관련 항목

- [[IEEE 754-2019 Standard for Floating-Point Arithmetic]]
- [[부동소수점 정확성]]
- [[컴파일러 최적화]]
- [[The Linpack Benchmark]]
- [[SPEC CPU 2026 Overview]]
- [[더 빠른 계산은 같은 답을 내는가]]
