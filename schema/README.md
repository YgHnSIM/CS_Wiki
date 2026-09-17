# CS Wiki 스키마 v2

`wiki-page.schema.json`은 모든 `wiki/**/*.md` 페이지의 정규 frontmatter 계약이다. `vocabulary.json`은 상태·유형·도메인·접근 수단·역사 계층·컴퓨팅 능력 층위·관계 종류의 허용값을 한 곳에서 관리한다.

그래프에 공개하는 개념·개체·분석 문서는 빈 `capability_layers`와 빈 `history.layer`를 허용하지 않는다. 연도는 원전 대조 없이 추정하지 않으며, 층위만 있는 문서는 역사 렌즈의 `undated` 구간에 남는다.

## 검증과 생성

```powershell
npm run manifest
npm run lint:wiki
npm run maintenance:check
npm run build
```

문서 ID는 변경하지 않는 안정 slug이며 사이트 주소는 `/docs/{id}/`다. 이전 주소는 각 페이지의 `redirect_from`으로 생성된다. 소스·참고 자료는 `works.primary/supporting`에 문헌을, `access`에 URL·로컬 snapshot을 기록한다. 로컬 snapshot은 SHA-256과 바이트 수가 린트에서 재검증된다.

`scripts/migrate_wiki_v2.mjs`는 v1 페이지를 한 번에 변환하고, `output/wiki-v2-migration-report.json`에 근거 미해결 항목·인용 위치 표식·로그 분할 결과를 남긴다. 원본 `raw/`는 이 과정에서 읽기만 한다.
