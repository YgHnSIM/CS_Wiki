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

## 콘텐츠 운영

- 원본은 `raw/`에 보존하며 수정하지 않습니다.
- 위키 문서는 `wiki/`에서 관리합니다.
- 내부 링크는 Obsidian의 `[[위키링크]]` 문법을 그대로 사용합니다.
- 콘텐츠 작업 규칙과 검증 절차는 `AGENTS.md`를 따릅니다.

## 글꼴

본문에는 네이버의 [D2Coding Ver 1.3.2](https://github.com/naver/d2codingfont/releases/tag/VER1.3.2)를 사용합니다. D2Coding은 OFL(Open Font License)로 배포됩니다.
