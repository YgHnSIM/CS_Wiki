# CS_Wiki 프로젝트 지식 기반

**언어:** 한국어 기본, 고유명사·전문용어는 원어를 병기한다.
**범위:** 이 문서는 저장소 전체에 적용되며, 하위 `AGENTS.md`는 해당 디렉터리의 추가 규칙만 정의한다.

## 개요

CS_Wiki는 컴퓨터 과학 역사·이론·시스템 자료를 원본과 위키 문서로 분리해 관리하고, Node.js 기반 매니페스트·린트·정적 사이트 도구로 검증·게시하는 지식 저장소다. Node.js 22와 Python 3.12를 기준으로 한다.

## 구조

```text
raw/       불변 원본과 첨부 자료
wiki/      schema v2 위키 문서 및 생성 운영 페이지
scripts/   매니페스트·린트·유지보수·링크 검사 도구
site/      정적 사이트 생성·그래프·서버·산출물 검증
schema/    페이지 스키마와 어휘
tests/     Node/Python/Playwright 검증
```

## 먼저 볼 곳

| 작업 | 위치 |
|---|---|
| 문서 스키마·출처·관계 규칙 | `AGENTS.md`, `schema/` |
| 소스·참고 자료 페이지 | `wiki/sources/` |
| 개념·개체·분석 페이지 | `wiki/concepts/`, `wiki/entities/`, `wiki/analyses/` |
| 생성 목록과 작업 기록 | `wiki/index.md`, `wiki/overview.md`, `wiki/log.md`, `wiki/logs/` |
| 매니페스트·린트·생성 블록 | `scripts/wiki_manifest.mjs`, `scripts/wiki_lint.mjs`, `scripts/wiki_maintenance.mjs` |
| 사이트 출력과 그래프 | `site/` |
| 변경 검증 | `scripts/validate_change_set.mjs`, `tests/` |

## 문서 계약

- 모든 위키 페이지는 `schema_version: 2`와 고유한 소문자 ASCII `id`를 가진다.
- 공통 상태는 `editorial_status`, 공개 범위는 `publication_visibility`, 그래프 노출은 `graph_visibility`로 분리한다.
- 일반 지식 문서는 `evidence_ids`와 하단 `## 출처`, 마지막 `## 관련 항목`을 가진다.
- 의미 관계는 본문의 `## 관계` 표에 방향·대상·설명·근거를 함께 기록한다. 대상은 위키링크여야 한다.
- 관련 항목은 다음 읽을거리 추천이며 이유를 붙여 최대 5개만 둔다.
- 새 문서는 원칙적으로 `draft → review → active` 순서로 승격한다.
- `raw/`의 원본은 절대 수정하지 않는다. 줄바꿈은 LF, 텍스트는 UTF-8을 사용한다.
- `index.md`, `overview.md`, `log.md`의 생성 블록은 유지보수 도구를 기준으로 갱신한다.

### 문서군별 초점

- `wiki/sources/`: `source/reference`, `works`, `access`, raw snapshot provenance를 엄격히 관리한다.
- `wiki/concepts/`: 정의·역사 메타데이터·의미 관계와 최대 5개 추천을 관리한다.
- `wiki/analyses/`: 비교 기준·종합 근거·모순과 불확실성을 명시한다.
- `wiki/logs/`: 항목별 원 기록이며 `wiki/log.md`는 생성 목록이다.
- `wiki/meta/`: 운영·스키마 문서이며 공개 지식 문서와 그래프 노출을 구분한다.

`wiki/` 하위에는 별도 `AGENTS.md`를 만들지 않는다. 모든 Markdown을 위키 페이지로 파싱하는 manifest/lint 계약과 충돌하기 때문이다.

## 검증 명령

```bash
npm ci
npm run lint:wiki
npm run maintenance:check
npm run validate:changes
npm test
npm run build
npm run verify:site
npm run test:browser
```

콘텐츠 수정의 최소 검증은 `npm run lint:wiki && npm run maintenance:check`다. 전체 통합 검증은 `npm run check`이며, 외부 URL은 별도로 `npm run check:links`로 점검한다. Chromium이 없으면 먼저 `npm run test:browser:install`을 실행한다.

## 운영 규칙

- 작업 전 원본·기존 페이지·생성 블록을 읽고, 큰 변경은 사용자에게 범위를 알린다.
- 모든 작업은 `wiki/logs/`에 원 기록을 남기고 생성 목록을 재생성한다.
- 소스 페이지는 문헌 계보(`works`)와 접근 수단(`access`)을 분리한다.
- 모순은 숨기지 말고 `> [!WARNING] 모순 발견`으로 기록한다.
- 커밋 메시지는 영어로 `ingest: number_title` 또는 `reference: short_title` 형식을 따른다.

## 금지 사항

- `raw/` 파일을 수정하거나 원본을 위키 산출물로 덮어쓰지 않는다.
- 생성 페이지를 수동 목록으로 대체하지 않는다.
- 근거 없는 주장, 중복 관계 행, 이유 없는 관련 항목을 추가하지 않는다.
- Python 도구를 Node 매니페스트의 대체 기준으로 사용하지 않는다.
