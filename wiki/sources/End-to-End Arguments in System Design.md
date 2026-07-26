---
title: End-to-End Arguments in System Design
aliases: [Saltzer Reed Clark 1984, SRC84, 종단간 논증 원 논문]
summary: "통신·저장 하위 계층이 제공하는 신뢰성 기능만으로는 응용의 정확성 요구를 완결할 수 없으며, 필요한 보장은 종단 응용이 확인해야 한다는 설계 원칙을 정리한 1984년 논문."
tags: [type/reference, domain/computer-science, domain/distributed-systems, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 1984
historical_layer: architecture
capability_layers: [reliable-results, programmability]
sources: [End-to-End Arguments in System Design]
source_id: ref-101
source_kind: external
primary_sources: ["J. H. Saltzer, David P. Reed, and David D. Clark, End-to-End Arguments in System Design, ACM Transactions on Computer Systems 2(4), November 1984, pp. 277–288"]
supporting_sources: ["MIT author-hosted ACM-permitted PDF", "ACM DOI record"]
source_urls: ["https://web.mit.edu/saltzer/www/publications/endtoend/endtoendA4.pdf", "https://doi.org/10.1145/357401.357402"]
retrieved: 2026-07-25
version: "ACM Transactions on Computer Systems 2(4), November 1984, pp. 277–288"
snapshot_status: external-only
status: active
graph_id: reference-end-to-end-arguments
graph_visibility: public
---

## 개요

[[End-to-End Arguments in System Design]]은 J. H. Saltzer, David P. Reed, David D. Clark이 1984년에 정리한 설계 원칙이다. 논문은 통신 시스템의 낮은 계층에 기능을 넣을지, 종단 응용이 책임질지를 판단할 때 응용의 정확성 요구를 기준으로 삼아야 한다고 주장한다.

핵심 논지는 낮은 계층의 전송·오류 검출·재시도·확인은 유용할 수 있어도, 응용이 실제로 원하는 결과가 달성됐는지를 완전히 판정할 수는 없다는 것이다. 따라서 그 결과를 보장해야 하는 응용은 종단에서 자체 검사와 복구 계획을 남겨야 한다. 하위 계층의 기능은 이를 대체하기보다 보통 성능·비용을 개선하는 역할을 한다.

## 파일 전송과 확인 응답

논문의 대표 사례는 두 시스템 사이의 신중한 파일 전송이다. 패킷이 손상되지 않고 네트워크를 통과했더라도, 양쪽의 운영체제·메모리·저장 장치·응용 처리에서 오류가 생길 수 있다. 따라서 네트워크의 전달 확인은 “목적지 응용이 요청한 작업을 올바르게 수행했다”는 확인과 다르다.

이 구분은 중복 메시지 억제, 메시지 순서, 크래시 복구, 수신 확인, 암호화에도 적용된다. 예를 들어 중간 계층이 메시지를 수신했다고 알려도, 목표 응용이 요청을 거절했거나 이후 실패했을 수 있다. 응용이 원하는 성공은 종단의 의미와 상태를 알아야 판정할 수 있다.

## 원칙의 범위

종단 간 논증은 하위 계층 기능을 제거하라는 규칙이 아니다. 낮은 계층의 오류 검출·재시도·캐시·중복 억제는 실패 빈도나 지연을 줄이는 성능 향상이 될 수 있다. 다만 그러한 기능을 “응용의 정확성 보증”으로 과대 해석해서는 안 된다.

또한 종단은 항상 물리적으로 가장 먼 두 호스트를 뜻하지 않는다. 어떤 상태, 작업, 복구 책임을 하나의 응용 계약으로 묶는지가 종단을 결정한다. 이 때문에 원격 프로시저 호출의 성공 응답이나 분산 파일 시스템의 쓰기 완료도 패킷 전달·서버 수신·지속 저장·사용자 작업 완료 중 어느 층의 사실을 뜻하는지 명시해야 한다.

## 인용할 만한 구절

> “only with the knowledge and help of the application”

완전하고 올바른 구현에 필요한 의미는 응용 종단이 가장 잘 안다는 원리를 간결하게 보여 준다.

## 위키 반영

이 자료는 [[종단 간 원칙]]의 직접 근거다. [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]]에서는 전송 계층의 성공과 응용 작업의 성공을 분리하고, 재시도·중복·복구를 종단 계약으로 다시 묻는 기준으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[종단 간 원칙]] | 응용이 필요한 정확성 보장을 종단에서 확인하고 하위 계층 기능을 성능 향상과 구분해야 한다는 설계 논증을 제공한다. | [[End-to-End Arguments in System Design]] |
| constrains | [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]] | 패킷·호스트·중간 저장소의 확인만으로는 응용 작업의 성공을 확정할 수 없다는 해석 경계를 제공한다. | [[End-to-End Arguments in System Design]] |

## 출처

- MIT, [ACM-permitted paper PDF](https://web.mit.edu/saltzer/www/publications/endtoend/endtoendA4.pdf)
- ACM, [DOI: 10.1145/357401.357402](https://doi.org/10.1145/357401.357402)

## 관련 항목

- [[종단 간 원칙]] — 기능 배치와 결과 확인을 응용 계약에서 판단하는 설계 원칙이다.
- [[원격 프로시저 호출]] — 로컬 호출처럼 보이는 인터페이스에도 종단의 응답 의미가 남는 사례다.
- [[분산 파일 시스템]] — 파일 전송·저장·복구의 종단 검증이 필요한 저장 계층 사례다.
- [[부분 실패]] — 중간 계층의 부분적 성공이 응용 결과의 성공을 뜻하지 않는 조건을 설명한다.
