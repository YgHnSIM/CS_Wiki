---
schema_version: 2
id: ref-102
kind: reference
title: Implementing Remote Procedure Calls
aliases:
  - RPC 원 논문
  - Birrell Nelson 1984
  - Cedar RPC
  - 원격 프로시저 호출 구현
summary: 클라이언트와 서버 사이의 원격 연산을 로컬 프로시저 호출과 유사한 인터페이스로 제공하기 위해 스텁, 바인딩, 메시지 전송, 재전송과 중복 호출 처리를 구성한 Birrell과 Nelson의 1984년 논문.
domains:
  - software-engineering
  - distributed-systems
  - systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:10502a3762b15488c21232b513754c01e0e44c136a1a21ae9164ef165a1b448d
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - programmability
  - realized-performance
history:
  publication_year: 1984
  layer: system
redirect_from:
  - /references/implementing-remote-procedure-calls/
  - /sources/implementing-remote-procedure-calls/
origin: external
works:
  primary:
    - citation: Andrew D. Birrell and Bruce Jay Nelson, Implementing Remote Procedure Calls, ACM Transactions on Computer Systems 2(1), February 1984, pp. 39–59
      genre: other
      identifiers: []
      edition: ACM Transactions on Computer Systems 2(1), February 1984, pp. 39–59
  supporting:
    - citation: Andrew Birrell author-hosted paper PDF
      genre: primary-literature
      identifiers: []
      edition: null
    - citation: ACM DOI record
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://birrell.org/andrew/papers/ImplementingRPC.pdf
    retrieved: 2026-07-25
    version: ACM Transactions on Computer Systems 2(1), February 1984, pp. 39–59
  - kind: url
    role: doi
    url: https://doi.org/10.1145/2080.357392
    retrieved: 2026-07-25
    version: ACM Transactions on Computer Systems 2(1), February 1984, pp. 39–59
---

## 개요

[[Implementing Remote Procedure Calls]]은 Andrew D. Birrell과 Bruce Jay Nelson이 1984년에 발표한 논문으로, 다른 컴퓨터에서 실행되는 절차를 로컬 프로시저 호출과 비슷한 형태로 호출할 수 있게 하는 RPC의 구현을 설명한다. 논문은 호출자 스텁, 서버 스텁, 인터페이스 바인딩, 인수·결과의 직렬화, 요청·응답 메시지, 재전송과 중복 억제를 하나의 런타임 계층으로 다룬다.

RPC의 목적은 네트워크를 없애는 것이 아니라, 프로그램이 원격 서비스를 호출할 때 인터페이스와 공통 런타임을 제공하는 것이다. 호출 구문이 비슷해져도 실제 실행에는 두 주소 공간, 메시지 전송, 이름·바인딩, 원격 서버의 처리, 응답 대기와 실패 처리가 포함된다.

## 호출 경계의 구성

클라이언트는 로컬 스텁을 호출하고, 스텁은 인수를 메시지 표현으로 변환해 RPC 런타임에 넘긴다. 서버 쪽 런타임은 요청을 수신해 서버 스텁으로 전달하고, 서버 스텁은 이를 실제 구현 절차의 호출로 바꾼다. 결과는 반대 방향으로 다시 변환된다.

이 구조는 인터페이스 정의와 구현 위치를 분리해 프로그래밍을 단순화하지만, 호출의 비용·실패·관찰 가능성을 로컬 호출과 같게 만들지는 않는다. 논문은 요청의 재전송, 중복 패킷·중복 호출의 구분, 서버가 재시작될 때의 상태, 바인딩과 통신 문제를 명시적인 런타임 문제로 다룬다.

## 성공의 의미

원격 호출의 응답을 받지 못했을 때 호출자는 서버가 요청을 받지 못했는지, 처리 중 실패했는지, 처리했지만 응답만 유실됐는지 즉시 구분할 수 없다. 재전송은 요청 손실을 완화하지만, 작업이 중복 실행될 수 있는 가능성까지 자동으로 없애지는 않는다. 따라서 호출자와 서버는 연산의 멱등성, 요청 식별자, 재시도 한계, 오류 응답, 외부 부작용의 중복 처리를 별도 계약으로 정해야 한다.

이 논문은 특정 환경의 구현과 측정 결과를 보고한다. 제시된 지연 수치와 통신 환경을 오늘날의 네트워크·언어·서비스에 일반화할 수는 없지만, 호출 추상화 아래에 어떤 런타임 비용과 실패 경계가 남는지는 여전히 분명하게 보여 준다.

## 인용할 만한 구절

> “The communication is hidden by the stub”
<!-- wiki-v2:quote-locator evidence="ref-102" locator="wiki/sources/Implementing Remote Procedure Calls.md:line-21#인용할-만한-구절" status="recorded" -->

스텁이 통신 절차를 감추지만, 통신으로 생기는 결과 계약까지 사라지는 것은 아니라는 점을 드러낸다.

## 위키 반영

이 자료는 [[원격 프로시저 호출]]의 직접 근거다. [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]]에서는 로컬 호출과 같은 문법이 원격 실행의 지연·중복·서버 재시작·응답 손실을 제거하지 않는다는 사례로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[원격 프로시저 호출]] | 스텁·바인딩·메시지 교환·재전송과 중복 호출 처리를 포함하는 RPC 런타임의 구현 구조를 제공한다. | [[Implementing Remote Procedure Calls]] |
| enables | [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]] | 로컬 호출과 유사한 인터페이스가 원격 통신·재시작·응답 손실의 관찰 불가능성을 없애지 않는 사례를 제공한다. | [[Implementing Remote Procedure Calls]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Andrew Birrell, [paper PDF](https://birrell.org/andrew/papers/ImplementingRPC.pdf)
- ACM, [DOI: 10.1145/2080.357392](https://doi.org/10.1145/2080.357392)

## 관련 항목

- [[원격 프로시저 호출]] — 원격 실행을 절차 호출로 드러내는 인터페이스와 실패 경계를 다룬다.
- [[시스템 호출]] — 하나의 운영체제 안에서 커널 기능을 요청하는 호출 경계와 비교할 수 있다.
- [[부분 실패]] — 응답 부재만으로 요청의 실행 여부를 판단할 수 없는 조건을 설명한다.
- [[종단 간 원칙]] — 전송·수신 확인과 응용 작업의 성공을 구분하는 설계 기준이다.
