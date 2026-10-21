---
schema_version: 2
id: log-2026-10-19-122
kind: meta
title: "2026-10-19 ingest | 생명은 계산이며 공생발생으로 진화한다 (아구에라 이 아르카스 해설) 보강"
aliases: []
summary: 블레즈 아구에라 이 아르카스의 Big Think 인터뷰 해설 페이지를 정규 소스로 등록하고, 인터뷰 원문·논문 대조로 자기복제·공생발생·기질 독립성·AGI 판정 논점을 개념·분석 문서로 분리한 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-10-19
updated: 2026-10-19
review:
  mode: pending
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

## 작업 범위

- **불변 원본 및 스냅샷 보존 (`raw/`, 모두 신규 파일)**:
  - `raw/생명은 계산이며 공생발생으로 진화한다.md` (페이지 본문 텍스트 추출, 65,878 바이트, sha256 `a87608b9…3b5801`)
  - `raw/assets/life_computation_symbiogenesis_agi.html` (웹페이지 원본 스냅샷, 168,204 바이트, sha256 `f0b9a540…9005b9f`)
  - `raw/Blaise_transcript.md` (사용자 제공 인터뷰 원문 복사본, 77,509 바이트, sha256 `fad23c88…baec1`). 저장소 루트의 원본 `Blaise_transcript.md`는 이동하지 않고 복사만 했다. 복사본은 저장소 규칙(LF)에 맞춰 파일 끝의 CRLF 한 쌍만 LF로 바꿨고, 그 밖의 내용은 루트 원본과 같다.
- **근거 문헌 등록 (`wiki/sources/`, 9종)**:
  - `src-008`: [[생명은 계산이며 공생발생으로 진화한다]] (정규 소스, 인터뷰·논문 대조표와 모순 경고 포함)
  - `ref-147`: [[Blaise Agüera y Arcas Big Think 인터뷰 원문]]
  - `ref-148`: [[Computational Life]] (arXiv 2406.19108v2, 본문 대조)
  - `ref-149`: [[On the Origin of Mitosing Cells]] (Sagan 1967, DOI 확인)
  - `ref-150`: [[Irreversibility and Heat Generation in the Computing Process]] (Landauer 1961, DOI 확인)
  - `ref-151`: [[Artificial General Intelligence Is Already Here]] (Noema 2023)
  - `ref-152`: [[Theory of Self-Reproducing Automata]] (서지 정보만, 검토 대기)
  - `ref-153`: [[The Major Transitions in Evolution]] (서지 정보만, 검토 대기)
  - `ref-154`: [[Absent Qualia, Fading Qualia, Dancing Qualia]] (Chalmers 1995)
- **인물 문서 신규 생성 (`wiki/entities/`, 2종)**: [[블레즈 아구에라 이 아르카스]], [[린 마굴리스]] (그래프 `context`)
- **개념 문서 신규 생성 (`wiki/concepts/`, 5종)**: [[자기복제 오토마타]], [[공생발생]], [[기질 독립성과 기능주의]], [[계산적 인공생명]], [[란다우어 원리]]
- **분석 문서 신규 생성 (`wiki/analyses/`, 3종)**: [[계산은 발명인가 자연 현상인가]], [[기능주의와 중국어 방은 어디서 갈라지는가]], [[AGI 판정 기준은 누가 옮기는가]]
- **기존 위키 문서 보강 (4종)**: [[보편 튜링 기계]], [[존 폰 노이만]], [[저장 프로그램 컴퓨터]], [[중국어 방과 구문-의미 간극]]
- **학습 경로 갱신 (`site/catalog.mjs`)**: `computability` 노선에 신규 5개 문서 추가. 새 노선은 만들지 않았다.

## 대조에서 확인한 사항

- 해설 페이지와 인터뷰의 BFF 수치(4바이트, 1,000개 테이프, 약 6바이트 복제자)는 논문의 주요 설정(2^17개 64바이트 프로그램, 쌍 연결 후 실행·분리)과 일치하지 않는다.
- 논문에는 랜다우어, 포식자·피식자, 열역학, "공생발생"이라는 단어가 없다.
- 해설 페이지는 인터뷰보다 과장한 대목(고비율 junk DNA 단정, 8개 전환 전부 공생발생, 교과서 수용 범위, 랜다우어 연결, "AI = 새 미토콘드리아")이 있고 인터뷰의 단서(튜링 기계와 노이만 구성자의 구분, 현재 AI의 자기구성 부재)를 생략했다.
- 위 내용은 `src-008`에만 기록하고, 1차 문헌으로 확인되지 않은 생물학 주장은 개념 문서에 사실로 옮기지 않았다.
- 모순 경고는 [[생명은 계산이며 공생발생으로 진화한다]]와 [[중국어 방과 구문-의미 간극]]에 기록했다.

## 주요 생성 및 수정 파일

- `raw/생명은 계산이며 공생발생으로 진화한다.md`
- `raw/assets/life_computation_symbiogenesis_agi.html`
- `raw/Blaise_transcript.md`
- `wiki/sources/` 하위 위 9종
- `wiki/entities/` 하위 위 2종
- `wiki/concepts/` 하위 위 5종 및 수정 3종
- `wiki/analyses/` 하위 위 3종
- `wiki/entities/존 폰 노이만.md`
- `site/catalog.mjs`
- `wiki/logs/log-2026-10-19-122-life-computation-symbiogenesis-agi.md`

## 검증 계획

- `npm run maintenance:updated`
- `npm run maintenance:generate`
- `npm run lint:wiki`
- `npm run maintenance:check`
- `npm test`
- `npm run build`
- `npm run verify:site`

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

## 관련 항목

- [[생명은 계산이며 공생발생으로 진화한다]]
- [[공생발생]]
- [[자기복제 오토마타]]
- [[기질 독립성과 기능주의]]
- [[AGI 판정 기준은 누가 옮기는가]]
