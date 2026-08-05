---
schema_version: 2
id: concept-dependency-provenance
kind: concept
title: dependency provenance와 registry identity
aliases:
  - dependency provenance
  - package provenance
  - 의존성 provenance와 registry identity
summary: 의존성의 내용 digest, registry 위치, publisher identity, 빌드 생성 경로를 분리해 소비자가 동일성과 신뢰 정책을 검증하게 하는 공급망 개념.
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
  revision: sha256:18afa8fdffa0b3ea5787cf20a9297647a9e442432001761ab15cb194aff7dc35
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

## 개요

[[dependency provenance와 registry identity]]는 “어떤 패키지를 받았는가”와 “그 패키지를 누가·어떤 과정으로 만들었다고 주장하는가”를 하나의 이름이나 tag에 맡기지 않는 개념이다. 의존성의 content digest, registry URI, version/tag, publisher identity, build provenance와 소비자 검증 정책을 서로 다른 필드로 다룬다.

## 네 가지 identity

| 층위 | 질문 | 대표 근거 |
|---|---|---|
| 내용 identity | 받은 bytes가 기대한 것과 같은가? | OCI digest, lockfile hash |
| 위치 identity | 어느 registry·namespace·repository에서 왔는가? | package/image URI |
| 게시자 identity | 어떤 계정·workflow·signer가 게시했는가? | npm publish attestation, GitHub identity |
| 생성 provenance | source revision·build instructions·dependencies를 추적할 수 있는가? | SLSA/in-toto attestation |

이 네 층위는 서로 대체하지 않는다. digest가 같아도 악성 내용일 수 있고, provenance가 있어도 소비자가 정책을 검증하지 않으면 신뢰 결론이 나오지 않는다. 반대로 registry 위치만 같다고 mutable tag가 같은 bytes를 계속 가리킨다는 보장도 없다.

## 소비자 검증 계약

1. lockfile 또는 manifest에서 허용할 URI·version·digest를 고정한다.
2. registry가 반환한 manifest/blob digest가 기대한 내용과 일치하는지 확인한다.
3. provenance attestation의 subject digest가 실제 소비할 artifact와 같은지 확인한다.
4. publisher·builder·source repository를 조직 정책과 대조한다.
5. 허용되지 않은 registry, signer, dependency update는 설치·배포 단계에서 거부한다.

[[OCI Distribution Specification]]은 content-addressable blob과 registry API의 경계를 제공한다. [[npm Package Provenance Statements]]와 [[GitHub Artifact Attestations]]는 source·workflow·publisher와 artifact를 연결하지만, 각각 소비자 검증이 필요하다는 한계를 남긴다. 이 개념은 [[재현 가능한 빌드]]가 정의한 산출물 동일성 위에 “어떤 dependency가 그 산출물에 들어갔는가”를 추가하는 다음 단계다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| synthesizes | [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] | digest·URI·publisher·provenance를 소비자 검증 흐름으로 묶는다. | [[OCI Distribution Specification]], [[SLSA Build Provenance Specification]] |
| constrains | [[재현 가능한 빌드]] | 재현성의 build inputs에 registry dependency identity와 digest를 포함시킨다. | [[SLSA Build Provenance Specification]] |
| constrains | [[StableHLO·MLIR·ABI 경계]] | compiler artifact에 포함되는 외부 dependency의 identity를 별도 추적하게 한다. | [[SLSA Build Provenance Specification]] |
| exemplifies | [[OCI Distribution Specification]] | content address와 registry location을 분리한 표준 사례를 연결한다. | [[OCI Distribution Specification]] |

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

- [[재현 가능한 빌드]] — build artifact의 bit-by-bit 동일성 계약을 정의한다.
- [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] — identity 층위를 소비자 정책으로 분석한다.
- [[StableHLO·MLIR·ABI 경계]] — compiler representation으로 넘어가는 다음 경계다.
- [[SLSA Build Provenance Specification]] — buildDefinition과 resolvedDependencies를 제공한다.
- [[OCI Distribution Specification]] — registry content identity를 표준화한다.
