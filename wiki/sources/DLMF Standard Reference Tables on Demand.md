---
title: DLMF Standard Reference Tables on Demand
aliases: [DLMF Tables, DLMF 표준 참조표, DLMF on-demand tables]
summary: "NIST가 특수함수 값을 요청 시 생성하고 보증된 오차 경계와 비교 기능을 제공해 수치 소프트웨어의 시험 기준으로 삼으려 한 DLMF Tables 프로젝트를 정리한 공식 보고서 자료."
tags: [type/reference, domain/mathematics, domain/software-engineering, status/active]
created: 2026-07-20
updated: 2026-07-25
publication_year: 2015
historical_note: "NISTIR 8056은 2013년 10월–2014년 12월의 활동을 정리해 2015년 4월 발행됐으며, 본문은 당시 베타 단계의 DLMF Tables 설계를 보고한다."
historical_layer: measurement
capability_layers: [reliable-results]
sources: ["NISTIR 8056 - Applied and Computational Mathematics Division Summary of Activities for Fiscal Year 2014", "NIST publication record for NISTIR 8056", "DLMF - Possible Errors in DLMF"]
source_id: ref-060
source_kind: external
primary_sources: ["NISTIR 8056 - Applied and Computational Mathematics Division Summary of Activities for Fiscal Year 2014"]
supporting_sources: ["NIST publication record for NISTIR 8056", "DLMF - Possible Errors in DLMF"]
source_urls: ["https://www.nist.gov/publications/applied-and-computational-mathematics-division-summary-activities-fiscal-year-2014-0", "https://dlmf.nist.gov/help/errors"]
retrieved: 2026-07-25
version: "NISTIR 8056, April 2015; supporting DLMF error page Version 1.2.7, 2026-06-15"
snapshot_status: external-only
status: active
---

## 자료 개요

[[DLMF Standard Reference Tables on Demand]]는 NIST Applied and Computational Mathematics Division의 2014 회계연도 활동 보고서에 실린 프로젝트 설명이다. NIST와 University of Antwerp 연구진은 특수함수 값을 요청 시 계산하고, 그 결과를 수치 소프트웨어 시험의 표준 비교값으로 제공하는 웹 서비스를 설계했다.

이 자료의 역사적 중요성은 인쇄된 [[수학 표]]의 역할이 사라진 것이 아니라 달라졌음을 보여주는 데 있다. 사용자가 일상 계산을 위해 책에서 값을 찾는 방식은 함수 라이브러리와 온라인 계산으로 옮겨갔지만, 신뢰할 수 있는 고정밀 참조값은 다른 프로그램의 결과를 시험하는 기준으로 계속 필요했다.

## 값과 함께 오차 경계를 제공하다

보고서가 설명한 기본 출력 모드는 각 함수값을 하한과 상한 사이에 엄밀하게 포함하는 구간 방식이었다. 사용자는 요구 자릿수를 정하고, 출력된 추가 자릿수와 오차 경계를 바탕으로 원하는 반올림·절단 규칙을 선택할 수 있었다. 또는 최근접 짝수, 양·음의 무한대 방향, 0 방향 등 명시된 반올림 모드를 요청할 수 있었다.

이 구조에서 참조값은 단일한 숫자 문자열만이 아니다. 함수 정의, 입력, 정밀도, 반올림 방식과 오차 경계가 함께 있어야 다른 결과가 허용 범위 안인지 판단할 수 있다. 이는 “정답표”를 **결과 계약**으로 확장한 사례다.

## 수치 소프트웨어의 시험 기준

비교 모드에서는 사용자가 함수값 파일을 올리면 시스템이 계산한 참조값과 번갈아 표시하고 근사 상대 오차를 제시했다. 이때 원래의 엄밀한 참조 구간은 업로드 값에 적용됐을 수 있는 반올림·절단을 수용하도록 요청 자릿수에서 바깥쪽으로 확장됐다. 업로드한 값이 이 확장 구간 밖이면 오류로, 구간 안이지만 최근접 짝수 반올림값과 다르면 경고로 구분했다.

따라서 표는 더 이상 사람의 계산을 생략하는 조회 도구에만 머물지 않는다. 프로그램이 계산한 결과를 독립적인 고정밀 값과 비교하는 시험 오라클(test oracle)에 가까운 역할을 맡는다. 다만 참조 시스템과 시험 대상이 같은 알고리즘·구현 결함을 공유하면 비교만으로 오류를 발견하지 못할 수 있으므로, 계산 방법과 오류 경계의 독립적인 분석이 중요하다.

## 수정 가능한 디지털 참고 체계

DLMF의 오류 안내 페이지는 내부·외부 전문가 검토를 거쳤더라도 오류가 남을 수 있음을 인정하고, 인쇄 편람의 오류가 온라인 판에서 수정됐을 가능성과 별도 정오표를 안내한다. 디지털 참고 체계는 오류를 완전히 없애기보다 발견된 오류를 판본에 반영하고 사용자가 보고할 수 있는 수정 경로를 제공한다.

이 변화에는 새 책임도 생긴다. 온라인 값이 수정될 수 있으므로 결과를 재현하려면 서비스나 데이터의 판본, 접근 시점과 계산 조건을 기록해야 한다. 최신 값이라는 사실과 과거 계산을 재현할 수 있다는 사실은 서로 다른 품질이다.

## 해석상 주의점

- NISTIR 8056은 2014년 무렵 베타 서비스의 설계와 동작을 보고한다. 이를 2026년 현재 동일한 주소와 기능이 그대로 운영된다는 근거로 사용하지 않는다.
- 보증된 오차 경계는 보고서가 설명한 대상 함수와 계산 조건 안의 보장이다. 모든 수치 프로그램의 정확성을 자동으로 인증하지 않는다.
- DLMF의 정오표와 피드백 체계는 오류가 없다는 선언이 아니라 오류를 발견·수정·판본화하는 관리 절차다.

## 위키 반영

이 자료는 [[검산]]이 독립 재계산과 교정에서 고정밀 참조값·오차 경계·자동 비교로 확장된 사례다. [[수학 표의 검산에서 수치 결과 계약으로]]에서는 표가 일상 계산의 대체물에서 수치 소프트웨어를 시험하는 기준으로 역할을 바꾼 전환을 뒷받침한다.

## 보존 점검

이전의 소문자 NIST PDF 경로는 2026-07-25 링크 점검에서 404였다. 원자료의 식별자와 발행 정보를 보존하는 NIST 출판물 레코드를 새 접근 경로로 등록했다. 이는 2014년 활동 보고서가 설명한 베타 단계의 프로젝트 범위를 바꾸지 않으며, 현재 DLMF 오류·정오표 안내는 별도 보조 자료로 유지한다.

## 출처

- NIST, [NIST IR 8056 publication record](https://www.nist.gov/publications/applied-and-computational-mathematics-division-summary-activities-fiscal-year-2014-0), NISTIR 8056, April 2015, pp. 38–40.
- NIST Digital Library of Mathematical Functions, [Possible Errors in DLMF](https://dlmf.nist.gov/help/errors), Version 1.2.7.

## 관련 항목

- [[Handbook of Mathematical Functions with Formulas, Graphs, and Mathematical Tables]]
- [[Excel formula recalculation and dependencies]]
