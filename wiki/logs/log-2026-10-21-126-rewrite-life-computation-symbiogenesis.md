---
schema_version: 2
id: log-2026-10-21-126
kind: meta
title: "2026-10-21 refactor | 생명은 계산이며 공생발생으로 진화한다 심층 지식 종합 재작성"
aliases: []
summary: src-008 문서를 두 아티클의 비평·대조 형식에서 벗어나, 튜링 계산·폰 노이만 자기복제·마굴리스 공생발생·기능주의·인공생명·AGI를 아우르는 단일한 자기완결적 심층 지식 문서로 전면 재작성한 기록.
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

사용자 요청에 따라, 기존 `wiki/sources/생명은 계산이며 공생발생으로 진화한다.md`(`src-008`)가 두 개의 아티클(Big Think 인터뷰 전사본 및 해설 아티클)을 대조·비평하는 형식으로 구성되어 지식 본문의 전달력이 저하되었던 한계를 전면 개선했다. 두 텍스트가 전하는 사상사적 통찰과 과학적 지식을 하나의 **자기완결적 심층 지식 문서**(Self-contained Deep Knowledge Document)로 유기적으로 종합했다.

## 작업 범위

- **소스 문서 전면 재작성 (`wiki/sources/생명은 계산이며 공생발생으로 진화한다.md`)**:
  - 기존의 12개 항목 사실 대조표 및 방어적 비평 위주 구성을 해체.
  - 8개 장으로 구성된 유기적 심층 지식 체계 수립:
    1. **개요**: "생명은 공생발생을 통해 복잡해지는 자기구성 계산이다"라는 핵심 명제와 통합 프레임워크 제시.
    2. **1945년을 넘어선 기초과학으로서의 계산과 엔트로피**: 튜링의 보편 기계(UTM) 메타 도약, 시간의 화살, 엔트로피($S = k_B \ln \Omega$), 인과율 원자로서의 `if-then` 조건문.
    3. **폰 노이만의 자기복제 오토마타와 생명의 기원**: 뮌히하우젠 부트스트랩 역설 해체, 기계 A(보편 구성자)와 기계 B(복사기)의 논리 분할, 지침 테이프의 이중성(코드 vs 데이터), 분자생물학 이전 순수 연역의 의의, 컴퓨트로늄과 인공 컴퓨터.
    4. **적자생존의 한계를 넘어서: 공생발생과** ‘**뒤엉킨 덤불**’: 신다윈주의 종합설 한계, 린 마굴리스의 세포내 공생설, 《The Major Transitions in Evolution》의 주요 전이, 98.5% 비암호화 유전체와 고대 레트로바이러스 유산(Arc 유전자와 Syncytin), 동적 적합도 지형과 행위성의 귀환.
    5. **관계적 기능주의와 기질 독립성**: 돌과 콩팥의 차이(기능들의 생태계), 튜링의 기질 독립성과 인공 투석기의 튜링 테스트, 테세우스의 뇌 사고실험, 생물학적 습식 기질의 에너지 효율과 회복탄력성 맥락.
    6. **계산적 인공생명 실험과 지능의 군비 경쟁**: BFF 원시 수프 실험에서의 자발적 복제자 창발, 임계 복잡도 돌파를 이끄는 결합(계산적 공생발생), 란다우어 원리($\Delta Q \ge k_B T \ln 2$), 자원 제약과 영양 단계 분화, 상호 모델링 군비 경쟁으로서의 지능.
    7. **AGI와의 공존: 인류의 새로운 미토콘드리아**: 언어/텍스트의 일반성, AGI 골대 옮기기 비판, 증기기관(외재화된 대사 작용)과 AI(외재화된 신경조직), 철학적 좀비의 조합 폭발 불가능성, 마음 이론(Theory of Mind)과 재귀적 반사.
    8. **결론: 인간-기계 인지 공생과 진화의 다음 장**: 코모도어 64에서 현대 기술권으로의 진화, 탈숙련화(Deskilling) 경고 vs 지적 제트팩(Cognitive Jetpack), 대우주적 진화의 새로운 도약.
- **스키마 및 규약 정합성**:
  - `schema_version: 2` 및 `schema/wiki-page.schema.json` 준수.
  - `scripts/update_wiki_updated.mjs`를 통해 갱신 일자 및 SHA-256 리비전 해시 재계산.
  - 관련 항목(최대 5개, 추천 이유 명시) 및 출처 섹션 완비.

## 검증 결과

- `node scripts/update_wiki_updated.mjs`: `wiki/sources/생명은 계산이며 공생발생으로 진화한다.md` 해시 및 날짜 정상 동기화.
- `npm run lint:wiki`: 0 errors, 0 warnings.
- `npm run maintenance:check`: 0 issues.
- `npm run maintenance:generate`: 색인 및 목록 자동 생성 갱신 완료.

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- [[생명은 계산이며 공생발생으로 진화한다]]
- [[Blaise Agüera y Arcas Big Think 인터뷰 원문]]
- [[Computational Life]]

## 관련 항목

- [[생명은 계산이며 공생발생으로 진화한다]] — 전면 재작성된 소스 심층 지식 문서.
- [[블레즈 아구에라 이 아르카스]] — 해당 사유의 중심 연구자.
- [[자기복제 오토마타]] — 폰 노이만의 복제 논리를 다룬 개념 문서.
- [[공생발생]] — 세포내 공생설과 계산적 결합을 다룬 개념 문서.
- [[기질 독립성과 기능주의]] — 기능주의와 기질 독립성을 다룬 개념 문서.
