# CS Wiki

원본 문헌을 바탕으로 컴퓨터 과학의 역사, 인물, 개념, 분석을 연결하는 위키입니다. `wiki/`의 Obsidian Markdown을 정적 웹사이트로 변환하고 GitHub Pages로 배포합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:4173`을 열면 됩니다.

## 빌드

```bash
npm run build
```

결과물은 `dist/`에 생성됩니다. `main` 브랜치에 푸시하면 `.github/workflows/pages.yml`이 빌드와 GitHub Pages 배포를 수행합니다.

## 웹 탐색

- 정규 소스와 참고 자료를 분리해 자료 성격과 검증 수준을 바로 확인할 수 있습니다.
- 10개의 학습 경로가 핵심 문서를 읽는 순서와 현재 위치를 안내합니다.
- 제목·별칭·태그·본문·출처 ID를 통합 검색하며 자료 유형과 검증 상태로 좁힐 수 있습니다.
- 각 문서의 근거 추적 영역에서 직접 근거, 보조 근거, 로컬 보존 여부와 원문 URL을 확인할 수 있습니다.
- 목록 페이지는 주제·상태 필터와 제목·수정일 정렬을 제공하며 선택값을 URL에 보존합니다.

## 콘텐츠 운영

- 원본은 `raw/`에 보존하며 수정하지 않습니다.
- 위키 문서는 `wiki/`에서 관리합니다.
- 내부 링크는 Obsidian의 `[[위키링크]]` 문법을 그대로 사용합니다.
- 콘텐츠 작업 규칙과 검증 절차는 `AGENTS.md`를 따릅니다.

점검과 안전한 유지보수 확인은 저장소 루트에서 실행합니다.

```bash
npm run lint:wiki
python scripts/wiki_maintenance.py --check
```

## 글꼴

본문에는 네이버의 [D2Coding Ver 1.3.2](https://github.com/naver/d2codingfont/releases/tag/VER1.3.2)를 사용합니다. D2Coding은 OFL(Open Font License)로 배포됩니다. 원본 WOFF2는 `site/font-sources/`에 보관하고, 실제 배포 파일은 현재 위키 말뭉치에 맞춰 경량화합니다.

```bash
pip install fonttools brotli
npm run fonts:subset
```

위키에 새 문자권이나 특수 기호가 추가되면 서브셋을 다시 만든 뒤 `npm run build`를 실행합니다.
