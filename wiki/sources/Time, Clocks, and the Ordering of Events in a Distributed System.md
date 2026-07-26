---
schema_version: 2
id: ref-100
kind: reference
title: Time, Clocks, and the Ordering of Events in a Distributed System
aliases:
  - Lamport 논리 시계 원 논문
  - Time, Clocks
  - Lamport 1978
  - 논리 시계
summary: 분산 시스템에서 사건의 인과적 선행 관계와 논리 시계를 정의하고, 인과 순서를 보존하는 전체 순서를 만드는 방법을 제시한 Leslie Lamport의 1978년 논문.
domains:
  - computer-science
  - distributed-systems
  - systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:daf42e753c3bad7db36a31e3784aeeec323853ff81e851229afa45871c587845
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - scalability
  - reliable-results
history:
  publication_year: 1978
  layer: theory
redirect_from:
  - /references/time-clocks-and-the-ordering-of-events-in-a-distributed-system/
  - /sources/time-clocks-and-the-ordering-of-events-in-a-distributed-system/
origin: external
works:
  primary:
    - citation: Leslie Lamport, Time, Clocks, and the Ordering of Events in a Distributed System, Communications of the ACM 21(7), July 1978, pp. 558–565
      genre: other
      identifiers: []
      edition: Communications of the ACM 21(7), July 1978, pp. 558–565
  supporting:
    - citation: Microsoft Research publication record
      genre: official-record
      identifiers: []
      edition: null
    - citation: ACM DOI record
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: publisher
    url: https://www.microsoft.com/en-us/research/publication/time-clocks-ordering-events-distributed-system/
    retrieved: 2026-07-25
    version: Communications of the ACM 21(7), July 1978, pp. 558–565
  - kind: url
    role: doi
    url: https://doi.org/10.1145/359545.359563
    retrieved: 2026-07-25
    version: Communications of the ACM 21(7), July 1978, pp. 558–565
---

## 개요

[[Time, Clocks, and the Ordering of Events in a Distributed System]]은 Leslie Lamport가 1978년에 발표한 논문으로, 여러 프로세서가 독립적으로 실행되는 환경에서는 모든 사건을 하나의 실제 시간축에 놓을 수 없다는 점에서 출발한다. 논문은 한 사건이 다른 사건에 원인으로 영향을 줄 수 있을 때의 선행 관계를 정의하고, 그 관계를 보존하는 논리 시계를 제시한다.

이 결과의 핵심은 “분산 시스템에 시간 순서가 없다”는 주장이 아니다. 메시지 전송과 수신, 한 프로세스 안의 실행 순서처럼 인과적으로 연결된 사건에는 순서가 있고, 인과 관계가 없는 사건은 동시에 일어난 것으로 취급할 수 있다. 설계자는 이 부분 순서와 시스템이 필요로 하는 전체 순서를 구분해야 한다.

## 인과 순서와 전체 순서

논문이 정의한 happened-before 관계는 같은 프로세스 안의 실행 순서, 메시지 전송에서 수신으로 향하는 순서, 그리고 그 추이적 결합으로 만들어진다. 두 사건 가운데 어느 쪽도 다른 쪽보다 먼저 일어나지 않았다면, 그 사건들은 논문의 의미에서 동시적이다.

논리 시계는 인과 선행이면 시계 값도 증가하도록 만든다. 다만 시계 값이 작다고 해서 반드시 인과적으로 먼저 일어났다는 역방향 결론은 낼 수 없다. 프로세스 식별자 등을 함께 사용하면 인과 관계와 모순되지 않는 전체 순서를 정할 수 있지만, 그것은 관찰된 실제 시간의 복원이나 모든 상태의 정확성을 자동으로 보장하지 않는다.

Lamport는 이 전체 순서를 이용해 분산된 프로세서 네트워크가 순차 상태 기계를 구현하는 관점도 제시했다. 따라서 논리 시계는 단순한 타임스탬프 기술이 아니라, 원인·순서·상태 변경을 분리해 설계하는 출발점이다.

## 해석 경계

이 논문은 메시지 순서와 상태 변경의 순서를 다루지만, 재시도의 멱등성, 복제본의 내구성, 사용자에게 보이는 성공 응답, 실제 시계 오차의 경계까지 한꺼번에 해결하지는 않는다. 특히 논리 시계의 전체 순서는 [[외부 일관성과 시간 불확실성]]이 다루는 실제 시간 순서 계약과 다르다.

따라서 원격 호출이나 분산 저장을 설계할 때 “타임스탬프를 붙였으니 순서 문제가 해결됐다”고 말해서는 안 된다. 먼저 어떤 사건의 원인 관계를 보존할지, 같은 키의 갱신을 누가 순서화할지, 동시 갱신을 어떻게 드러내거나 병합할지, 그리고 성공 응답의 의미를 무엇으로 정할지를 별도로 명시해야 한다.

## 인용할 만한 구절

> “There is only a partial order”
<!-- wiki-v2:quote-locator evidence="ref-100" locator="wiki/sources/Time, Clocks, and the Ordering of Events in a Distributed System.md:line-23#인용할-만한-구절" status="recorded" -->

분산 사건의 순서는 모든 사건을 하나의 자연스러운 전역 시간축에 올려놓는 문제가 아니라, 인과 관계와 동시성을 구분하는 문제라는 점을 압축한다.

## 위키 반영

이 자료는 [[복제 로그와 합의]]에서 명령 순서와 상태 기계의 관계를 이해하는 이론적 출발점이며, [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]]에서는 로컬 실행의 단일 순서가 네트워크를 넘을 때 인과 순서·전체 순서·실제 시간 순서로 분리되는 이유를 뒷받침한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[복제 로그와 합의]] | 인과 관계를 보존하는 전체 순서가 분산 프로세서 네트워크에서 순차 상태 기계를 구현하는 논리적 바탕을 제공한다. | [[Time, Clocks, and the Ordering of Events in a Distributed System]] |
| enables | [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]] | 로컬의 단일 실행 순서가 원격 환경에서는 인과적 부분 순서와 선택된 전체 순서로 분리된다는 분석의 근거를 제공한다. | [[Time, Clocks, and the Ordering of Events in a Distributed System]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Microsoft Research, [publication record](https://www.microsoft.com/en-us/research/publication/time-clocks-ordering-events-distributed-system/)
- ACM, [DOI: 10.1145/359545.359563](https://doi.org/10.1145/359545.359563)

## 관련 항목

- [[복제 로그와 합의]] — 여러 복제본의 상태 변경 순서를 확정하는 계층을 다룬다.
- [[외부 일관성과 시간 불확실성]] — 논리적 전체 순서와 실제 시간 순서 계약을 구분한다.
- [[부분 실패]] — 일부 프로세스·통신 경로만 실패할 때 순서와 관찰이 갈라지는 조건을 설명한다.
- [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]] — 순서·실패·응답 의미가 원격 경계에서 어떻게 달라지는지 종합한다.
