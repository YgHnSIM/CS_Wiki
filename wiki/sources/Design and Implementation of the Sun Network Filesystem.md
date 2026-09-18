---
schema_version: 2
id: ref-139
kind: reference
title: Design and Implementation of the Sun Network Filesystem
aliases:
  - NFS
  - Sun NFS
  - Sandberg et al. 1985
  - Network File System
summary: 원격 프로시저 호출 위에 상태 비저장 서버 모델을 올려 이질적인 UNIX 호스트 사이에서 파일을 공유하게 만든 Sun NFS의 설계와 구현을 정리한 1985년 논문이다.
domains:
  - distributed-systems
  - operating-systems
  - systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-09-18
updated: 2026-09-18
review:
  mode: attested
  revision: sha256:3174bc7b17b3ef7736d4cccabe988189072e3a557db25d6b315738ba15f9d9dc
  reviewed_at: 2026-09-18
  reviewed_by: grok
evidence_ids: []
capability_layers:
  - scalability
  - programmability
history:
  publication_year: 1985
  layer: system
redirect_from:
  - /references/design-and-implementation-of-the-sun-network-filesystem/
  - /sources/design-and-implementation-of-the-sun-network-filesystem/
origin: external
works:
  primary:
    - citation: Russel Sandberg, David Goldberg, Steve Kleiman, Dan Walsh, and Bob Lyon, Design and Implementation of the Sun Network Filesystem, USENIX Summer 1985
      genre: other
      identifiers: []
      edition: USENIX Summer 1985 proceedings
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://www.rfc-editor.org/rfc/rfc1094
    retrieved: 2026-09-18
    version: USENIX Summer 1985 proceedings
---

## 개요

Sun Network Filesystem(NFS)은 원격 프로시저 호출을 중심 인터페이스로 두고, 서버를 상태 비저장에 가깝게 유지해 이질적인 UNIX 시스템 사이에서 파일을 공유한다. 이 문서는 NFS가 분산 파일 시스템을 실용 서비스로 만든 설계 선택—VFS 통합, 멱등적 연산, 클라이언트 캐시—을 정리한다.

## 왜 남았나

후대 분산 파일 시스템과 클라우드 객체 스토리지가 다른 일관성·성능 모델을 쓰더라도, “원격 파일을 로컬 파일 API처럼 보이게 만들기”와 RPC 기반 접근이라는 문제는 이 논문에서 뚜렷해졌다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[분산 파일 시스템]] | RPC와 상태 비저장 서버로 분산 파일 공유를 구현한 대표 사례다. | [[Design and Implementation of the Sun Network Filesystem]] |
| implements | [[원격 프로시저 호출]] | 파일 연산을 RPC 프로시저로 노출한다. | [[Design and Implementation of the Sun Network Filesystem]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-139`
<!-- wiki-v2:evidence-end -->

## 관련 항목

- [[분산 파일 시스템]] — NFS가 구현한 핵심 개념.
- [[원격 프로시저 호출]] — NFS의 원격 연산 모델.
- [[The Google File System]] — 이후 대규모 분산 파일 시스템의 다른 설계점.
