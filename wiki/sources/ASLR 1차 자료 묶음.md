---
schema_version: 2
id: ref-137
kind: reference
title: ASLR 1차 자료 묶음
aliases:
  - ASLR primary sources
  - 주소 공간 배치 무작위화 1차 자료
summary: PaX 설계 문서와 Linux 커널 공식 문서를 바탕으로 ASLR의 대상, 프로세스 배치, PIE·KASLR의 연결과 한계를 정리한 1차 자료 묶음.
domains:
  - security
  - operating-systems
  - software-engineering
editorial_status: draft
publication_visibility: unlisted
graph_visibility: context
created: 2026-08-24
updated: 2026-08-24
review:
  mode: pending
  revision: sha256:e0de24643cca5cd003e465bc673252732bb6d27abe9bca1bedcc41487e0a4263
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
origin: external
works:
  primary:
    - citation: PaX Team, Address Space Layout Randomization (ASLR), 2003-03-15.
      genre: manual
      identifiers: []
      edition: 2003-03-15
    - citation: The Linux Kernel Documentation, Documentation for /proc/sys/kernel/ — randomize_va_space.
      genre: manual
      identifiers: []
      edition: null
    - citation: The Linux Kernel Documentation, Kernel Self-Protection — Kernel Address Space Layout Randomization (KASLR).
      genre: manual
      identifiers: []
      edition: null
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://pax.grsecurity.net/docs/aslr.txt
    retrieved: 2026-08-24
    version: 2003-03-15
  - kind: url
    role: canonical
    url: https://docs.kernel.org/admin-guide/sysctl/kernel.html#randomize-va-space
    retrieved: 2026-08-24
    version: null
  - kind: url
    role: canonical
    url: https://docs.kernel.org/security/self-protection.html#kernel-address-space-layout-randomization-kaslr
    retrieved: 2026-08-24
    version: null
---

## 개요

[[ASLR 1차 자료 묶음]]은 ASLR의 설계와 실제 운영체제 적용을 직접 설명하는 1차 자료 묶음이다. PaX Team 문서는 사용자 공간의 주소 배치를 여러 영역으로 나누고 실행 시점에 기준 위치를 달리하는 설계를 설명한다. Linux 커널 문서는 프로세스 주소 공간에서 선택적으로 무작위화되는 영역과 커널 주소 공간에 적용되는 KASLR을 각각 설명한다.

이 자료 묶음은 ASLR의 목적을 “메모리 오류를 없애는 것”이 아니라 “중요한 주소의 예측 가능성을 낮추는 것”으로 한정해 설명하는 데 사용한다. 따라서 ASLR, `PIE`, `DEP/NX`, KASLR, 메모리 안전성을 같은 기법으로 뭉뚱그리지 않고 서로 다른 방어 계층으로 구분한다.

## 자료별 핵심

### PaX ASLR 설계 문서

PaX Team의 2003년 문서는 프로세스의 사용자 주소 공간을 실행 파일 영역, 매핑 영역, 스택 영역으로 나누어 설명하고 각 영역의 기준 위치에 무작위 오프셋을 적용하는 설계를 기록한다. 이 자료는 ASLR이 단일 주소 하나를 숨기는 기법이 아니라, 여러 메모리 영역의 배치를 예측하기 어렵게 만드는 기법이라는 설명의 직접 근거다.

이 문서는 또한 ASLR이 다른 메모리 보호 기법과 함께 사용되는 보안 완화 계층이라는 점을 보여 준다. 구체적인 우회 절차나 공격 코드는 위키 문서의 범위에 포함하지 않는다.

### Linux 프로세스 주소 공간 무작위화

Linux 커널 문서의 `randomize_va_space` 설명은 프로세스의 `mmap` 기준 위치, 스택, VDSO 페이지, 공유 라이브러리, PIE로 연결된 실행 파일의 코드 시작 위치, 힙이 정책에 따라 무작위화될 수 있음을 정리한다. 동시에 모든 영역이 항상 같은 방식으로 무작위화되는 것은 아니며, 아키텍처와 호환성 설정에 따라 정책이 달라질 수 있음을 보여 준다.

이 자료는 ASLR을 “실행마다 모든 주소가 완전히 새로워진다”라고 단순화하지 않도록 하는 근거로 사용한다. 실제 배치는 주소 범위, 정렬, 운영체제 정책과 같은 제약 안에서 선택된다.

### Linux 커널 자기 보호와 KASLR

Linux 커널 자기 보호 문서는 KASLR을 부팅 시 커널의 물리·가상 기준 주소를 옮기는 기법으로 설명한다. 이는 사용자 프로세스의 주소 배치를 다루는 일반적인 ASLR과 적용 대상과 시점이 다른 변형이다.

같은 문서는 KASLR이 확률적 방어라는 점과 정보 노출이 무작위화된 위치를 알아내는 데 사용될 수 있다는 점도 명시한다. 이 관찰은 ASLR을 완전한 비밀 보장이나 메모리 안전성의 대체물로 설명하지 않기 위한 근거가 된다.

## 위키 반영

이 자료는 [[ASLR]]의 정의, 무작위화 대상, PIE·KASLR과의 구분, 엔트로피와 정보 노출을 통한 한계 설명에 사용한다. 저장소의 로컬 원본인 [[서브루틴과 스택(Stack)의 원리]]는 ASLR이 코드와 스택 주소를 예측하기 어렵게 한다는 직접 언급을 보강하고, [[재배치]]와 [[로더]]는 코드가 실제 적재 위치에 맞춰 준비되는 맥락을 제공한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[ASLR]] | ASLR의 사용자 공간·커널 공간 적용과 확률적 방어 한계를 설명하는 1차 자료 묶음이다. | PaX Team, Linux Kernel Documentation |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- PaX Team, [Address Space Layout Randomization (ASLR)](https://pax.grsecurity.net/docs/aslr.txt)
- The Linux Kernel Documentation, [Documentation for /proc/sys/kernel/ — randomize_va_space](https://docs.kernel.org/admin-guide/sysctl/kernel.html#randomize-va-space)
- The Linux Kernel Documentation, [Kernel Self-Protection — Kernel Address Space Layout Randomization (KASLR)](https://docs.kernel.org/security/self-protection.html#kernel-address-space-layout-randomization-kaslr)

## 관련 항목

- [[ASLR]] — 이 자료 묶음의 주장과 근거를 반영한 개념 문서다.
- [[스택]] — 프로세스 주소 공간에서 무작위화될 수 있는 대표적인 영역과 호출 상태를 설명한다.
- [[재배치]] — 코드가 실제 적재 위치에 맞춰 주소를 보정하는 원리를 설명한다.
- [[로더]] — 실행 파일과 공유 라이브러리를 메모리에 배치하는 소프트웨어 계층이다.
- [[메모리 안전성]] — ASLR이 메모리 오류를 제거하는 기법이 아니라는 구분을 제공한다.
