---
schema_version: 2
id: src-004
kind: source
title: 서브루틴과 스택(Stack)의 원리
aliases:
  - 서브루틴과 스택
  - Subroutine and Stack
summary: 서브루틴의 본질을 복귀 주소 관리로 설명하고 Wheeler Jump에서 스택 프레임까지의 발전을 정리한 소스.
domains:
  - software-engineering
  - computer-architecture
  - computer-history
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-05-04
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:0314a9f1306c5f28266967685caee4fdb2e9368c01666c151bf9439f9a1b9617
  reviewed_at: null
  reviewed_by: legacy-baseline
evidence_ids: []
capability_layers: []
redirect_from:
  - /sources/서브루틴과-스택-stack-의-원리/
origin: local
works:
  primary:
    - citation: 서브루틴과 스택(Stack)의 원리.md
      genre: raw-note
      identifiers: []
      edition: null
  supporting: []
access:
  - kind: local
    role: original
    path: raw/서브루틴과 스택(Stack)의 원리.md
    retrieved: 2026-07-10
    version: null
    sha256: 543cd233a03d8e8f15cf91f3eecebdf3ca15c69ad0febf5052d4745f36f858f3
    media_type: text/markdown
    bytes: 20586
---

## 핵심 요약

이 소스는 [[서브루틴]]의 본질을 반복 코드 분리가 아니라 [[복귀 주소]] 관리 문제로 설명한다. 서브루틴 호출은 단순 점프와 달리 작업이 끝난 뒤 호출 지점 다음으로 돌아와야 하며, 컴퓨터 구조와 프로그래밍 언어는 이 복귀 경로를 저장하고 복원하는 방향으로 발전했다.

초기 [[EDSAC]] 환경에는 현대적 `CALL`, `RET`, [[스택]] 포인터가 없었다. 따라서 [[Wheeler Jump]] 같은 자기 수정 코드 기법이 사용되었다. 호출부의 명령을 재료로 삼아 서브루틴 끝에 복귀 점프를 만들어 넣는 방식은 같은 서브루틴을 여러 위치에서 호출할 수 있게 했지만, 중첩 호출과 재귀에는 취약했다.

스택은 이 한계를 해결한 핵심 구조다. 호출될 때마다 복귀 주소를 LIFO 순서로 쌓고, 반환 시 가장 최근의 복귀 주소를 꺼내면 중첩 호출과 재귀 호출을 자연스럽게 처리할 수 있다. 이후 [[스택 프레임]]은 복귀 주소뿐 아니라 매개변수, 지역 변수, 저장 레지스터까지 담는 함수 실행 환경으로 확장되었다.

소스는 이 흐름을 보안 문제까지 연결한다. 복귀 주소가 스택에 저장되기 때문에 스택 버퍼 오버플로우는 실행 흐름을 바꿀 수 있고, 현대 시스템은 stack canary, NX bit, ASLR, shadow stack 같은 방어 기법을 사용한다.

## 주요 인사이트

- 서브루틴의 역사적 핵심은 "어디로 돌아갈지"를 기억하는 방법의 변화다.
- Wheeler Jump는 복귀 주소를 서브루틴 내부의 명령으로 만들어 넣어 재사용을 가능하게 했다.
- 스택은 복귀 주소 저장 공간을 호출 깊이만큼 확장하여 중첩 호출과 재귀를 가능하게 했다.
- 스택 프레임은 복귀 주소 관리에서 함수 실행 환경 전체의 구조화로 발전한 개념이다.
- 스택은 제어 흐름을 기억하기 때문에, 현대 보안에서도 중요한 공격 표면이 된다.

## 인용할 만한 구절

> 서브루틴의 역사는 곧 복귀 주소(return address)를 어떻게 기억하고 복원할 것인가의 역사라고 볼 수 있다.
<!-- wiki-v2:quote-locator evidence="src-004" locator="wiki/sources/서브루틴과 스택(Stack)의 원리.md:line-21#인용할-만한-구절" status="recorded" -->

> 스택은 복귀 주소를 하나만 기억하는 구조에서, 호출 깊이만큼 여러 개 기억하는 구조로의 전환이다.
<!-- wiki-v2:quote-locator evidence="src-004" locator="wiki/sources/서브루틴과 스택(Stack)의 원리.md:line-23#인용할-만한-구절" status="recorded" -->

> 결국 스택은 다음 질문에 대한 역사적 답이다.
<!-- wiki-v2:quote-locator evidence="src-004" locator="wiki/sources/서브루틴과 스택(Stack)의 원리.md:line-25#인용할-만한-구절" status="recorded" -->

## 관련 위키 페이지

- [[서브루틴]]
- [[복귀 주소]]
- [[Wheeler Jump]]
- [[자기 수정 코드]]
- [[스택]]
- [[스택 프레임]]
- [[소프트웨어 공학]]

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- `raw/서브루틴과 스택(Stack)의 원리.md`

## 관련 항목

- [[폐쇄형 서브루틴과 Wheeler Jump]]
- [[EDSAC과 Initial Orders]]
- [[라이브러리]]
