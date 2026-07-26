---
schema_version: 2
id: log-2026-07-11-017
kind: meta
title: 2026-07-11 create | CS Wiki 웹사이트와 GitHub Pages 배포 구성
aliases: []
summary: 2026-07-11에 수행한 create 작업의 변경 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-07-11
updated: 2026-07-26
review:
  mode: legacy-baseline
  revision: sha256:ab131635364c6ccfe13d67d597995962cac85ebdac35b14e6fdf457d1b8f7898
  reviewed_at: null
  reviewed_by: migration:v2
evidence_ids: []
capability_layers: []
---

`wiki/`의 Markdown 문서를 정적 웹사이트로 변환하는 빌드 시스템과 GitHub Pages 배포 워크플로를 추가했다. 전체 문서 검색, Obsidian 위키링크 변환, 카테고리별 탐색, 관련 문서 표시, 실제 링크 관계 기반 지식 연결망을 제공한다. 화면은 Retro-Futuristic 기술 문헌 보관소 방향으로 설계하고 데스크톱·모바일 반응형 레이아웃을 적용했다.

변경된 페이지 및 파일:

- 갱신: [[log]]
- 생성: `package.json`, `package-lock.json`, `README.md`
- 생성: `site/build.mjs`, `site/serve.mjs`
- 생성: `site/assets/site.css`, `site/assets/site.js`, `site/assets/favicon.svg`
- 생성: `.github/workflows/pages.yml`
- 갱신: `.gitignore`

### 출처

- `wiki/`의 161개 위키 페이지
- `AGENTS.md`

### 관련 항목

- [[overview]]
- [[index]]
