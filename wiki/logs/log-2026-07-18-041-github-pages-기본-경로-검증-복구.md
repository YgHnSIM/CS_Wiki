---
schema_version: 2
id: log-2026-07-18-041
kind: meta
title: 2026-07-18 update | GitHub Pages 기본 경로 검증 복구
aliases: []
summary: 2026-07-18에 수행한 update 작업의 변경 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-07-18
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:782c7eb8dc16b825f8d9b4508784cdfc146dc7baf4248c628d44cf87edbf5c10
  reviewed_at: null
  reviewed_by: migration:v2
evidence_ids: []
capability_layers: []
---

GitHub Pages 배포 환경의 `SITE_BASE=/CS_Wiki`를 반영해 생성된 역사 렌즈 정적 경로를 산출물 검증기가 기본 경로 없이 비교하던 불일치를 수정했다. 생성기의 공개 URL 계약은 유지하고, 검증기 역시 공통 `withBase` 규칙으로 시대·조각 복원 경로를 확인하도록 통일했다.

변경된 페이지와 코드:

- Pages 산출물 경로 검증: `site/verify-build.mjs`
- 운영 기록: [[log]]

### 검증

- GitHub Pages와 같은 `SITE_BASE=/CS_Wiki`, `SITE_URL=https://YgHnSIM.github.io/CS_Wiki` 환경에서 전체 검사와 정적 빌드·산출물 검증
- 기본 경로가 없는 로컬 환경에서 전체 검사와 정적 빌드·산출물 검증
- `raw/` 원본 변경 없음

### 출처

- `.github/workflows/pages.yml`
- `site/build.mjs`
- `site/verify-build.mjs`

### 관련 항목

- [[overview]]
- [[지식 그래프 관계 스키마]]
