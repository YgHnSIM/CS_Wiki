---
schema_version: 2
id: analysis-dependency-provenance-registry
kind: analysis
title: registry는 의존성의 출처와 동일성을 어떻게 증명하는가
aliases:
  - dependency provenance registry analysis
  - registry identity analysis
summary: package registry와 OCI registry 사례를 비교해 content digest, location, publisher, build provenance가 어떤 검증을 제공하고 무엇을 보장하지 않는지 분석한다.
domains:
  - software-engineering
  - security
  - systems
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:6073918d49892ecb142539338d439baa66ea8960f724b638331a4176a32675c5
  reviewed_at: 2026-08-05
  reviewed_by: codex-research-097
evidence_ids:
  - ref-125
  - ref-127
  - ref-128
  - ref-129
capability_layers:
  - reliable-results
---

## 분석 질문

registry는 dependency를 찾아 내려받는 장소지만, 그 자체가 모든 신뢰 판단을 끝내지는 않는다. 이 분석은 같은 패키지 이름이나 tag가 아니라, 소비자가 실제로 검증할 수 있는 identity와 provenance의 연결을 비교한다.

## identity 비교

| 검사 | 해결하는 질문 | 남는 위험 |
|---|---|---|
| URI·namespace | 어느 registry와 repository에서 왔는가? | dependency confusion, registry takeover |
| version·tag | 어떤 릴리스 이름을 요청했는가? | mutable tag, republish ambiguity |
| content digest | 받은 bytes가 어떤 내용인가? | 악성 내용도 고정된 digest를 가질 수 있음 |
| publisher identity | 누가 게시했는가? | 탈취된 계정, 허용 정책 부재 |
| build provenance | source·workflow·builder가 무엇인가? | 불완전한 attestation, 소비자 미검증 |

[[OCI Distribution Specification]]은 registry API와 digest로 주소 지정되는 content를 표준화한다. 이는 location과 content identity를 분리하지만, content가 안전하다는 정책까지 제공하지 않는다. npm provenance는 source와 build instructions를 package에 연결하고도 악성 코드 부재 보장은 아니라고 명시한다. GitHub artifact attestations도 subject digest와 workflow를 연결하지만, attestation을 생성하는 것만으로 보안 이득이 생기지 않고 검증해야 한다.

## 검증 순서

검증 가능한 소비자는 먼저 lockfile의 URI·version·digest를 기준으로 resolved artifact를 고정한다. 그 다음 registry가 반환한 bytes의 digest, attestation subject, signer/builder, source revision을 차례로 비교한다. 하나라도 정책과 맞지 않으면 “provenance가 있다”는 이유로 설치를 허용하지 않는다.

이 흐름은 [[재현 가능한 빌드]]와 연결되지만 같은 질문은 아니다. 재현 가능한 빌드는 지정 산출물이 독립 재빌드와 동일한지를 확인하고, dependency provenance는 그 산출물이 어떤 외부 입력과 생성 주체를 사용했는지를 추적한다.

## 기존 문서와의 중복 경계

이 pair는 [[AI 컴퓨팅 병목]]·[[계산-통신 중첩]]·[[메모리 이동과 병목 이동]]의 실행 중 자원 병목을 다루지 않는다. 또한 C18의 재현 가능한 빌드를 반복하지 않고, C18이 고정해야 할 외부 dependency identity와 verifier policy를 확장한다.

## 미해결 사항

- ecosystem별 lockfile·registry·publisher identity의 강제 수준은 npm과 OCI 사례만으로 일반화할 수 없다.
- attestation의 signer와 builder를 조직 정책에 매핑하는 운영 절차는 구현별 검증이 필요하다.
- registry mirror와 cache가 digest 불변성을 어떻게 보존하는지 별도 실행 검증이 필요하다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[dependency provenance와 registry identity]] | 네 가지 identity를 소비자 검증 순서로 정리한다. | [[OCI Distribution Specification]], [[npm Package Provenance Statements]] |
| precedes | [[StableHLO·MLIR·ABI 경계]] | compiler artifact가 의존하는 package·toolchain identity를 먼저 고정한다. | [[SLSA Build Provenance Specification]] |
| constrains | [[재현 가능한 빌드는 무엇을 같게 만드는가]] | build input의 외부 dependency를 digest와 provenance로 관찰 가능하게 한다. | [[SLSA Build Provenance Specification]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- `ref-125`
- `ref-127`
- `ref-128`
- `ref-129`
<!-- wiki-v2:evidence-end -->

- [[SLSA Build Provenance Specification]]
- [[npm Package Provenance Statements]]
- [[GitHub Artifact Attestations]]
- [[OCI Distribution Specification]]

## 관련 항목

- [[dependency provenance와 registry identity]] — 개념과 검증 항목을 정의한다.
- [[재현 가능한 빌드]] — 산출물 동일성과 dependency identity의 선행 계약이다.
- [[StableHLO·MLIR·ABI 경계]] — provenance가 고정된 compiler 경계를 분석한다.
- [[OCI Distribution Specification]] — digest-based registry identity의 표준이다.
