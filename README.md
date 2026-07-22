# CS Wiki

원본 문헌을 바탕으로 컴퓨터 과학의 역사, 인물, 개념, 분석을 연결하는 위키입니다. `wiki/`의 Obsidian Markdown을 정적 웹사이트로 변환하고 GitHub Pages로 배포합니다.

## 로컬 실행

Node.js 22 이상과 Python 3.12 이상을 사용합니다. 저장소의 잠금 파일과 동일한 의존성을 설치한 뒤 개발 서버를 시작합니다.

```bash
npm ci
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
- 17개의 학습 경로와 컴퓨팅 능력 독서 지도가 핵심 문서를 읽는 순서, 현재 위치와 경로 간 연결을 안내합니다.
- 제목·별칭·태그·본문·출처 ID를 통합 검색하며 자료 유형과 검증 상태로 좁힐 수 있습니다.
- 각 문서의 근거 추적 영역에서 직접 근거, 보조 근거, 로컬 보존 여부와 원문 URL을 확인할 수 있습니다.
- 목록 페이지는 주제·상태 필터와 제목·수정일 정렬을 제공하며 선택값을 URL에 보존합니다.

## 콘텐츠 운영

- 원본은 `raw/`에 보존하며 수정하지 않습니다.
- 위키 문서는 `wiki/`에서 관리합니다.
- 내부 링크는 Obsidian의 `[[위키링크]]` 문법을 그대로 사용합니다.
- 콘텐츠 작업 규칙과 검증 절차는 `AGENTS.md`를 따릅니다.

전체 검증은 저장소 루트에서 한 번에 실행합니다. 위키 구조 검사, 유지보수 dry-run, 사이트·Python 테스트와 정적 사이트 빌드를 순서대로 수행합니다.

```bash
npm run check
```

개별 검증이 필요할 때는 다음 스크립트를 사용할 수 있습니다.

```bash
npm run lint:wiki
npm run maintenance:check
npm run test:site
npm run test:python
npm test
npm run check:links
```

외부 링크 검사는 네트워크가 필요한 별도 점검이며 매주 GitHub Actions에서도 실행됩니다. 404·410은 깨진 링크로 실패시키고, 출판사 봇 차단과 속도 제한은 별도 상태로 보고합니다.

Windows PowerShell에서 로컬 실행 정책이 `npm.ps1`을 막는 경우 같은 명령을 `npm.cmd run check`처럼 실행할 수 있습니다.

Pull request에서는 같은 통합 검증을 실행하되 배포하지 않으며, `main` 브랜치 푸시와 수동 실행에서만 GitHub Pages 배포를 이어서 수행합니다.

실브라우저 검사는 Chromium에서 검색, 모바일 탐색, 지식 렌즈 초기화, 키보드 입력, 무자바스크립트 탐색과 주요 접근성 규칙을 확인합니다. 처음 실행하는 환경에서는 브라우저 런타임을 설치합니다.

```bash
npm run test:browser:install
npm run test:browser
```

사이트 CSS는 `site/styles/`의 기능별 모듈로 관리하고 빌드 때 단일 `dist/assets/site.css`로 결합합니다. 따라서 소스 변경 충돌을 줄이면서 배포 요청 수는 늘리지 않습니다.

## 글꼴

본문에는 네이버의 [D2Coding Ver 1.3.2](https://github.com/naver/d2codingfont/releases/tag/VER1.3.2)를 사용합니다. D2Coding은 OFL(Open Font License)로 배포됩니다. 원본 WOFF2는 `site/font-sources/`에 보관하고, 실제 배포 파일은 현재 위키 말뭉치에 맞춰 경량화합니다.

```bash
pip install fonttools brotli
npm run fonts:subset
```

위키에 새 문자권이나 특수 기호가 추가되면 서브셋을 다시 만든 뒤 `npm run build`를 실행합니다.
