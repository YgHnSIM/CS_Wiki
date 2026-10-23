---
schema_version: 3
id: ref-145
kind: reference
title: Explication de l'Arithmétique Binaire
aliases:
  - 이진 산술의 해설
  - Leibniz 1703
  - 이진법 논문
summary: 라이프니츠가 0과 1 두 개의 숫자만으로 모든 수의 표현과 사칙연산의 규칙을 설명하고 창조의 신학적 비유와 연관 지은 1703년 왕립과학원 논문.
domains:
  - computer-history
  - computer-science
  - mathematics
publication_visibility: unlisted
graph_visibility: public
created: 2026-10-18
updated: 2026-10-24
evidence_ids: []
capability_layers: []
history:
  publication_year: 1703
  layer: theory
origin: external
works:
  primary:
    - citation: G. W. Leibniz, Explication de l'Arithmétique Binaire, Histoire de l'Académie Royale des Sciences (1703)
      genre: primary-literature
      identifiers: []
      edition: "1703"
  supporting: []
access:
  - kind: url
    role: canonical
    url: https://gallica.bnf.fr/ark:/12148/bpt6k34882
    retrieved: 2026-10-18
    version: null
---

## 개요

[[Explication de l'Arithmétique Binaire]](단지 0과 1 두 부호만을 사용하는 이진 산술의 해설과 그 유용성, 그리고 그것이 고대 중국 복희씨 도형의 의미를 밝혀준다는 것에 관한 논평)는 고트프리트 빌헬름 라이프니츠가 1703년 프랑스 파리 왕립과학원(Académie Royale des Sciences)의 연례 회보에 게재한 수학 논문이다.

라이프니츠는 이 논문에서 0과 1이라는 두 개의 기호만으로 모든 자연수를 자릿값 체계로 표기하는 방법과 사칙연산(덧셈, 뺄셈, 곱셈, 나눗셈)의 규칙을 제시했다. 또한 이진법을 만물이 무(0)에서 신(1)에 의해 창조되었다는 기독교 신학의 상징으로 해석하는 한편, 중국 고대 주역(周易)의 64괘 도상이 이진 산술 체계와 완벽히 부합함을 밝혀 서구 사상사와 컴퓨터 역사에 거대한 족적을 남겼다.

## 이진 산술 체계와 연산 규칙

라이프니츠는 10진법이 인간의 손가락이 10개라는 해부학적 우연에 기초한 것일 뿐, 수의 본질적 구조를 탐구하는 데는 2진법(Arithmétique Binaire)이 훨씬 우월하다고 주장했다.

- **자릿값의 원리**: 10진법에서 각 자리가 10의 거듭제곱($10^0, 10^1, 10^2, \dots$)을 뜻하듯, 2진법의 각 자리는 2의 거듭제곱($2^0=1, 2^1=2, 2^2=4, 2^3=8, 2^4=16, \dots$)을 나타낸다. 예를 들어 $1001_{(2)}$는 $8 + 0 + 0 + 1 = 9$가 된다.
- **연산의 극단적 단순화**: 10진 산술에서 인간을 괴롭히는 복잡한 구구단 곱셈표가 이진법에서는 완전히 사라진다.
  - 덧셈: $0 + 0 = 0$, $0 + 1 = 1$, $1 + 1 = 10_{(2)}$ (자리올림 발생)
  - 곱셈: $0 \times 0 = 0$, $0 \times 1 = 0$, $1 \times 1 = 1$
  - 곱셈은 단순한 자리이동(shift)과 덧셈으로 환원되며, 뺄셈과 나눗셈 역시 같은 방식으로 기계화될 수 있다.

라이프니츠는 이러한 산술의 단순성이 인간 암산뿐 아니라 기계식 연산 장치를 구현하는 데 결정적인 이점을 제공한다고 보았다.

## 창조의 신학적 비유와 복희씨 괘상

논문에서 라이프니츠는 이진 산술을 단순한 계산 기술에 머무르게 하지 않고 형이상학과 비교 문명사적 차원으로 확장했다.

- **무로부터의 창조(Creatio ex nihilo)**: 라이프니츠는 1을 절대적 존재이자 창조주인 신(God), 0을 아무것도 없는 허무(Nothingness)로 대응시켰다. 신(1)이 무(0)로부터 모든 만물(수)을 질서정연하게 창조해 내는 신비가 이진법의 수열 속에 수학적으로 완벽하게 드러난다고 보았다.
- **주역 64괘의 해독**: 북경에 파견되어 있던 프랑스 예수회 선교사 조아킴 부베(Joachim Bouvet) 신부와의 서신 교환을 통해, 라이프니츠는 고대 중국의 복희씨(伏羲氏)가 만들었다고 전해지는 64괘 도상을 접했다. 라이프니츠는 끊어진 음효(--)를 0으로, 이어진 양효(—)를 1로 치환하면 복희 괘상의 배열이 `000000(2)`(0)부터 `111111(2)`(63)까지 정확히 이진 산술의 증가 순서와 일치함을 발견했다. 그는 이를 인류 지혜의 보편성을 증명하는 결정적 증거로 논문에 소개했다.

## 컴퓨터 과학적 의의

라이프니츠의 1703년 이진법 논문은 현대 디지털 컴퓨팅 하드웨어의 직접적인 이론적 기초를 놓았다.

1. **디지털 물리 구현의 이상적 토대**: 10단계의 서로 다른 물리적 상태를 정밀하게 판별해야 하는 10진 계산 장치와 달리, 2진법은 전압의 높고 낮음(High/Low), 스위치의 켜짐과 꺼짐(ON/OFF)처럼 두 가지 안정적인 물리 상태만으로 모든 연산과 데이터를 표현할 수 있게 한다.
2. **불 대수와 스위칭 회로의 교량**: 19세기 [[조지 불]]은 이진 체계에 기반하여 논리적 참·거짓을 연산하는 [[불 대수]]를 정립했고, 20세기 [[클로드 섀넌]]은 이것이 전기 릴레이 회로와 1:1로 대응함을 증명했다.
3. **산술 논리 연산 장치(ALU)의 원형**: 오늘날 모든 컴퓨터 프로세서의 핵심 부품인 가산기와 레지스터의 비트 단위 연산 메커니즘은 라이프니츠가 1703년에 해설한 이진 덧셈과 자리올림 규칙의 직접적 구현체다.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- G. W. Leibniz, *Explication de l'Arithmétique Binaire, qui se sert des seuls caractères 0 & 1; avec des remarques sur son utilité, & sur ce qu'elle donne le sens des anciennes figures Chinoises de Fohy*, *Histoire de l'Académie Royale des Sciences*, Année 1703 (Paris, 1705), pp. 85–89, [Gallica BnF](https://gallica.bnf.fr/ark:/12148/bpt6k34882)

## 관련 항목

- [[고트프리트 빌헬름 라이프니츠]] — 0과 1의 자릿값 체계와 이진 산술 규칙을 정식화한 17세기 철학자이자 수학자.
- [[이진법]] — 0과 1 두 기호를 자릿값 원리로 조직해 수와 데이터를 나타내는 컴퓨팅의 기본 체계.
- [[논리 회로와 이진 표현]] — 0과 1 표현이 물리적 스위치, 논리식, 산술 회로로 결합되는 구조를 분석한 문서.
- [[이진 덧셈 회로]] — 이진수의 덧셈과 자리올림을 전기적 논리 게이트로 구현한 연산 장치.
- [[불 대수]] — 두 논리값(0과 1)에 대한 연산 법칙으로 디지털 회로 설계의 언어가 된 대수 체계.
