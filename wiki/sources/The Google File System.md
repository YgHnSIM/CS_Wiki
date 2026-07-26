---
schema_version: 2
id: ref-103
kind: reference
title: The Google File System
aliases:
  - GFS 논문
  - Google File System
  - Ghemawat Gobioff Leung 2003
  - 구글 파일 시스템
summary: 대규모 데이터 집약 작업에서 빈번한 구성 요소 고장을 전제로, 마스터·청크 서버·복제·임대와 확장된 파일 인터페이스를 결합한 Google의 2003년 분산 파일 시스템 연구.
domains:
  - distributed-systems
  - operating-systems
  - systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-25
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:be84adf73e8ded0e5ecf830111426676dec63087c62542b2d98e879fea2954a6
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers:
  - scalability
  - reliable-results
  - realized-performance
history:
  publication_year: 2003
  layer: system
redirect_from:
  - /references/the-google-file-system/
  - /sources/the-google-file-system/
origin: external
works:
  primary:
    - citation: Sanjay Ghemawat, Howard Gobioff, and Shun-Tak Leung, The Google File System, Proceedings of the 19th ACM Symposium on Operating Systems Principles, 2003, pp. 20–43
      genre: primary-literature
      identifiers: []
      edition: SOSP 2003 proceedings, pp. 20–43
  supporting:
    - citation: Google Research publication record
      genre: official-record
      identifiers: []
      edition: null
access:
  - kind: url
    role: canonical
    url: https://research.google/pubs/the-google-file-system/
    retrieved: 2026-07-25
    version: SOSP 2003 proceedings, pp. 20–43
---

## 개요

[[The Google File System]]은 Sanjay Ghemawat, Howard Gobioff, Shun-Tak Leung이 2003년에 발표한 Google File System(GFS) 연구다. GFS는 대규모 데이터 집약 응용을 위한 확장 가능한 분산 파일 시스템으로, 값싼 범용 하드웨어 위에서 장애 허용과 높은 총 처리량을 함께 목표로 한다.

논문은 구성 요소의 고장이 예외가 아니라 정상 운영의 일부라는 가정에서 시작한다. 대용량 파일, 대규모 순차 읽기, 대규모 데이터셋을 대상으로 한 순차 쓰기와 동시 추가, 비교적 적은 수의 거대한 파일이 당시 응용 부하의 중요한 특징으로 제시된다. 이 가정은 전통적인 파일 시스템의 작은 파일·낮은 지연·강한 일관성 기대를 그대로 옮기지 않는 이유다.

## 구조와 인터페이스

GFS는 파일을 고정 크기의 청크로 나누고, 청크를 여러 청크 서버에 복제한다. 마스터는 파일 이름공간, 파일과 청크의 대응, 복제본 위치와 임대 같은 메타데이터를 관리한다. 클라이언트는 마스터로부터 메타데이터를 얻은 뒤 실제 데이터 전송을 청크 서버와 직접 수행해, 마스터가 모든 데이터 경로의 병목이 되는 일을 피한다.

논문은 일반 읽기·쓰기 외에 대규모 분산 작업에 맞춘 record append와 snapshot을 설명한다. 특히 record append는 여러 클라이언트가 동시에 추가하는 환경을 지원하지만, 각 레코드가 정확히 한 번만 추가되거나 응용의 전체 작업이 자동으로 원자적이라는 뜻은 아니다. 실패·재시도·중복을 견디기 위한 응용 수준의 식별과 검증은 여전히 필요하다.

## 성능과 정확성의 경계

GFS가 제시한 높은 처리량은 당시의 작업 부하, 파일 크기, 청크 크기, 네트워크·디스크 환경, 복제 및 일관성 모델을 함께 둔 결과다. 이를 어떤 저장 시스템의 일반적인 지연·가용성 수치로 읽어서는 안 된다. 설계의 중요한 전환은 “로컬 파일 API를 그대로 복제”하는 것이 아니라, 실패가 잦고 데이터가 큰 분산 작업에 맞춰 파일 의미와 시스템 경계를 재설계한 데 있다.

이 사례는 파일 이름과 읽기·쓰기가 보인다고 해서 파일이 한 장치에 안정적으로 존재한다는 뜻은 아님을 보여 준다. 원격 파일의 성공은 메타데이터 조회, 복제본 선택, 네트워크 전달, 청크 서버 상태, 쓰기 순서화, 복구 정책을 거쳐야 해석할 수 있다.

## 인용할 만한 구절

> “component failures are the norm rather than the exception”
<!-- wiki-v2:quote-locator evidence="ref-103" locator="wiki/sources/The Google File System.md:line-21#인용할-만한-구절" status="recorded" -->

고장을 복구 절차의 예외가 아니라 저장 시스템의 기본 가정으로 두는 설계 전환을 압축한다.

## 위키 반영

이 자료는 [[분산 파일 시스템]]에서 파일 API와 복제·메타데이터·장애 복구 계층을 구분하는 직접 근거다. [[부분 실패]]에는 일부 청크 서버·네트워크·메타데이터 경로가 실패해도 전체 서비스가 즉시 한 가지 상태로 무너지지 않는 환경의 사례를 제공한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[분산 파일 시스템]] | 마스터·청크 서버·복제·임대와 데이터 직접 경로를 결합한 대규모 분산 파일 시스템 사례를 제공한다. | [[The Google File System]] |
| exemplifies | [[부분 실패]] | 일부 구성 요소의 고장을 정상 조건으로 두고 복제·검출·복구를 설계에 포함한 저장 시스템 사례를 제공한다. | [[The Google File System]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- Google Research, [publication record and paper download](https://research.google/pubs/the-google-file-system/)

## 관련 항목

- [[분산 파일 시스템]] — 파일 이름·읽기·쓰기의 외관 뒤에 있는 복제·메타데이터·장애 처리를 설명한다.
- [[파일 시스템]] — 단일 운영체제의 파일 추상화와 분산 저장의 차이를 비교한다.
- [[부분 실패]] — 구성 요소별 실패를 전체 결과 계약 안에서 해석한다.
- [[로컬 호출과 파일은 원격 상태가 될 때 무엇을 잃는가]] — 로컬 파일 의미가 원격 저장에서 달라지는 과정을 종합한다.
