---
schema_version: 2
id: log-2026-10-20-124
kind: meta
title: "2026-10-20 fix | 배포 변경 집합의 raw 복원과 검토 승격"
aliases: []
summary: c983876 배포가 raw 불변 규칙과 active 페이지의 갱신일·검토 기록 때문에 실패한 원인과 복구를 남긴 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-20
updated: 2026-10-20
review:
  mode: pending
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

GitHub Actions `Deploy CS Wiki` 실행 [39273835630](https://github.com/YgHnSIM/CS_Wiki/actions/runs/39273835630)이 커밋 `c983876`에서 약 19초 만에 `Validate change set` 단계에서 실패했다. 사이트 빌드와 브라우저 검사는 시작되지 않았다.

## 증상

`scripts/validate_change_set.mjs`가 `BASE_SHA=75dd400`과 `HEAD` 사이를 검사해 세 종류의 오류를 냈다.

- `raw.immutable` 6건. 영어 병기를 굵게 표시 밖으로 빼면서 `raw/` 원본도 같이 수정했다.
- `updated.required` 11건. 본문이 바뀐 `active` 페이지의 `updated`가 변경일 2026-10-19가 아니었다.
- `review.attestation` 4건. `review.mode: legacy-baseline`인 소스 페이지를 `attested`로 올리지 않았다.
- `log.coverage` 1건. 그 문서 변경을 설명하는 `wiki/logs/` 항목이 없었다.

로컬 `npm run lint:wiki`는 리비전 해시를 맞춘 뒤 통과했다. 배포 게이트는 그 검사와 다른 규칙을 본다.

## 해결

1. 여섯 `raw/` 파일을 `c983876` 직전인 `75dd400`의 내용으로 되돌렸다. 원본은 추가된 뒤 내용이 달라지면 안 된다.
2. 변경 집합 검사는 그 복원만 허용한다. `HEAD`의 blob이 파일을 처음 추가한 커밋의 blob과 같을 때 `raw.immutable`를 내지 않는다. 다른 수정·삭제·이동은 그대로 거절한다.
3. 복원된 원본을 가리키는 소스 페이지의 `sha256`과 `bytes`를 다시 맞췄다.
4. 게이트가 지적한 `active` 페이지 11개의 `updated`를 2026-10-20으로 고쳤다. `legacy-baseline` 4개는 `attested`로 승격했다.
5. 이 로그로 `log.coverage`를 충족한다.

## 검증

- `node --test tests/validate-change-set.test.mjs`
- 커밋 뒤 `BASE_SHA=c983876`로 `npm run validate:changes`
- `npm run lint:wiki`
- `npm run maintenance:check`

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- `scripts/validate_change_set.mjs`
- `.github/workflows/pages.yml`
- https://github.com/YgHnSIM/CS_Wiki/actions/runs/39273835630

## 관련 항목

- [[위키 개요]] — 운영 규모와 검토 상태를 확인한다.
- [[작업 로그]] — 이전 배포 실패 기록과 함께 읽는다.
