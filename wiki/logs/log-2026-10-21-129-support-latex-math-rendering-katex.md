---
schema_version: 2
id: log-2026-10-21-129
kind: meta
title: "2026-10-21 update | KaTeX 기반 수식 정적 빌드 렌더링 파이프라인 구축"
aliases: []
summary: 정적 사이트 렌더러에서 원문 문자열로 노출되던 LaTeX 블록($$) 및 인라인($) 수식을 KaTeX를 통해 접근성 표준 MathML 및 경량 HTML/CSS로 사전 컴파일하도록 파이프라인을 구축한 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-21
updated: 2026-10-21
review:
  mode: legacy-baseline
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

## 작업 배경 및 목적

- 사용자의 요청:
  - `https://yghnsim.github.io/CS_Wiki/docs/analysis-analytic-geometry-to-pixels-and-maps/` 페이지의 수식 렌더링 점검 및 권장 해결 방안 적용.
- 현황 분석:
  - 사이트 배포본 및 로컬 빌드 엔진(`site/build.mjs`)에 수식 파싱/렌더링 라이브러리가 없어, 페이지 내 블록 수식 12개와 인라인 수식 43개가 원본 LaTeX 문자열(`$$...$$`, `$...$`) 그대로 일반 텍스트 문단으로 노출되고 있었음.
  - 마크다운 파서(`markdown-it`)가 수식을 인식하지 못해 역슬래시 이스케이프(`\{`, `\,` 등)를 마크다운 이스케이프로 취급하여 기호가 누락되거나 왜곡되는 부작용 발생.
  - 해당 분석 페이지 외에도 위키 내 24개 이상의 문서에서 총 27개 블록 수식과 258개 인라인 수식이 동일하게 미렌더링 상태였음.

## 작업 범위

1. **KaTeX 의존성 추가 및 빌드 타임 플러그인 구현 (`site/math.mjs`)**:
   - `katex` 패키지 추가 (`package.json`, `package-lock.json`).
   - Pandoc 및 GFM 표준 수식 델리미터 규칙을 준수하는 `mathPlugin` 구현:
     - 인라인 수식(`$...$`): 공백/숫자 후속 규칙 준수, 일반 통화 기호(`$100`) 오인 방지, 이스케이프(`\$`) 지원.
     - 블록 수식(`$$...$$`): 단일 행 및 다중 행 수식 지원, 연속된 블록 분리 보장.
     - 렌더링 시 스크린 리더용 MathML과 시각 렌더링용 HTML을 동시 생성하고, 가로 스크롤 가능한 반응형 컨테이너(`<div class="math-block" tabindex="0" role="region" aria-label="수식">`)로 감싸 모바일 레이아웃 보호.
2. **반응형 수식 스타일 및 폰트 에셋 통합**:
   - KaTeX 웹폰트(`site/assets/fonts/KaTeX_*.woff2`, 20종) 로컬 에셋 배치.
   - `site/styles/50-katex.css` 모듈을 생성하고 `site/styles/index.mjs`의 `STYLE_PARTS`에 등록하여 `site.css`로 일원화(추가 HTTP 라운드트립 없음).
   - 키보드 포커스 링은 사이트 공통 테마 토큰(`var(--phosphor)`)에 정렬.
3. **빌드 파이프라인 및 테스트 연동**:
   - `site/build.mjs`에 `mathPlugin` 등록.
   - `tests/markdown-rendering.test.mjs`에 수식 렌더링 단위 테스트 추가.
   - 전체 단위 테스트(153건), 브라우저 E2E/접근성 테스트(21건), 빌드 산출물 검증(`verify:site`) 통과 확인.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- [[17세기 해석기하학은 어떻게 디스플레이 픽셀과 지도가 되었는가]]
- [[프레임버퍼 메모리 사상]]

## 관련 항목

- [[17세기 해석기하학은 어떻게 디스플레이 픽셀과 지도가 되었는가]] — 본 작업의 계기가 된 GPU 래스터라이저, 뉴턴-랩슨, 웹 메르카토르 수식 분석 문서.
- [[프레임버퍼 메모리 사상]] — 2D 화면 좌표와 1D 선형 VRAM 주소 변환 수식이 KaTeX로 렌더링되는 개념 문서.
- [[위키 개요]] — 전체 운영 페이지 규모 및 검증 상태를 확인한다.
