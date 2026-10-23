# CS Wiki 스키마 v3

`wiki-page.schema.json`은 모든 `wiki/**/*.md` 페이지의 정규 frontmatter 계약이다. `vocabulary.json`은 유형·도메인·접근 수단·역사 계층·컴퓨팅 능력 층위·관계 종류의 허용값을 한 곳에서 관리한다.

그래프에 공개하는 개념·개체·분석 문서는 빈 `capability_layers`와 빈 `history.layer`를 허용하지 않는다. 연도는 원전 대조 없이 추정하지 않으며, 층위만 있는 문서는 역사 렌즈의 `undated` 구간에 남는다.

`publication_visibility: public` 문서만 목록·검색·사이트맵·홈·그래프 렌즈·학습 경로에 노출한다. `unlisted` 문서는 URL과 직접 링크로 접근할 수 있도록 빌드하되 `noindex`를 붙이고 위 발견 경로에서 제외한다. `private`는 지원하지 않으며, 진짜 비공개 문서는 공개 저장소에 두지 않는다. 대체된 문서는 `unlisted`와 선택적 `superseded_by`로 표시한다.

## 검증과 생성

```powershell
npm run manifest
npm run lint:wiki
npm run maintenance:check
npm run build
```

문서 ID는 변경하지 않는 안정 slug이며 사이트 주소는 `/docs/{id}/`다. 이전 주소는 각 페이지의 `redirect_from`으로 생성된다. 소스·참고 자료는 `works.primary/supporting`에 문헌을, `access`에 URL·로컬 snapshot을 기록한다. 로컬 snapshot은 SHA-256과 바이트 수가 린트에서 재검증된다.

`scripts/migrate_wiki_v3.mjs`는 v2 페이지에서 `review`·`editorial_status`를 제거하고 `schema_version: 3`으로 변환한다. 원본 `raw/`는 읽지 않으며, 로그(`wiki/logs/`)는 당시 형식의 역사 기록으로 남긴다.
