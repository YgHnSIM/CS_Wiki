---
schema_version: 2
id: ref-128
kind: reference
title: GitHub Artifact Attestations
aliases:
  - GitHub artifact attestation
  - GitHub 아티팩트 증명
summary: GitHub Actions가 바이너리·컨테이너 이미지의 subject digest와 workflow provenance를 연결하고 CLI로 검증하는 공식 문서.
domains:
  - software-engineering
  - security
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-08-05
updated: 2026-08-05
review:
  mode: attested
  revision: sha256:26513deac373e008c977abd43de89dd0519e280b25b93ddf9649e2a5788bb7dc
  reviewed_at: 2026-08-05
  reviewed_by: codex-research-097
evidence_ids: []
capability_layers:
  - reliable-results
origin: external
works:
  primary:
    - citation: GitHub Docs, Using artifact attestations to establish provenance for builds
      genre: web
      identifiers: []
      edition: current documentation, accessed 2026-08-05
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations
    retrieved: 2026-08-05
    version: current page at access time
---

## 개요

GitHub artifact attestations는 바이너리와 컨테이너 이미지의 subject digest를 workflow와 연결하고, GitHub CLI로 attestation을 검증하는 배포 구현이다. 이미지의 경우 이름과 tag가 아니라 fully-qualified subject name과 `sha256` digest를 attestation에 넘긴다.

## 위키 반영

이 자료는 [[dependency provenance와 registry identity]]에서 registry location, immutable digest, build workflow와 verifier 정책을 따로 기록하는 구현 근거다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| exemplifies | [[dependency provenance와 registry identity]] | subject digest와 workflow provenance를 함께 검증하는 CI 구현 사례다. | [[GitHub Artifact Attestations]] |
| constrains | [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] | attestation 생성만으로 보안 이득이 생기지 않고 소비자 검증이 필요함을 명시한다. | [[GitHub Artifact Attestations]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- GitHub Docs, [Using artifact attestations to establish provenance for builds](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations)

## 관련 항목

- [[dependency provenance와 registry identity]] — digest와 provenance의 결합을 설명한다.
- [[registry는 의존성의 출처와 동일성을 어떻게 증명하는가]] — 검증 정책의 경계를 분석한다.
