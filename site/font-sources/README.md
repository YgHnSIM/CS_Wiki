# D2Coding source fonts

이 디렉터리에는 웹용 서브셋을 다시 만들기 위한 D2Coding 원본 WOFF2 파일을 보관합니다.
`npm run fonts:subset`은 위키와 사이트 코드에 실제로 등장하는 글자를 수집해
`site/assets/fonts/`에 배포용 서브셋을 생성합니다.

- 원본: D2Coding Ver 1.3.2
- 라이선스: SIL Open Font License 1.1
- 배포 페이지: https://github.com/naver/d2codingfont/releases/tag/VER1.3.2

원본 글꼴을 갱신할 때는 `D2Coding.woff2`와 `D2Coding-Bold.woff2`를 함께 교체한 뒤
서브셋 명령과 사이트 빌드를 다시 실행합니다.
