---
schema_version: 2
id: log-2026-08-29-106
kind: meta
title: "2026-08-29 update | The Case Figures 2·4 시각화 삽입"
aliases: []
summary: The Case for Energy-Proportional Computing이 언급한 Figure 2와 Figure 4를 원문 도표 기준의 읽기 쉬운 SVG로 재작성하고 참고 자료 페이지에 삽입한 작업 기록.
domains: []
editorial_status: active
publication_visibility: unlisted
graph_visibility: hidden
created: 2026-08-29
updated: 2026-08-29
review:
  mode: pending
  revision: null
  reviewed_at: null
  reviewed_by: null
evidence_ids: []
capability_layers: []
---

## 작업 범위

- Google Research author copy의 원문 Figure 2와 Figure 4를 확인하고, 각 그림의 축·범례·주 운용 구간·캡션과 본문 설명을 대조했다.
- 원문 Figure 2를 유휴 전력이 최대 전력의 약 50%인 대표 서버의 개념 곡선으로 재작성했다. 전력 곡선과 u / p(u) 상대 효율 곡선을 함께 표시하고, 20–30% 활용률에서 상대 효율이 최대 부하의 절반 미만이라는 관찰을 강조했다.
- 원문 Figure 4를 유휴 전력이 최대치의 10%인 90% 동적 전력 범위의 모형 서버로 재작성했다. 10% 활용률에서 상대 효율이 50%를 넘고, 30% 이상에서 80%를 넘는 기준을 표시했다.
- raw/assets/figure_02_server_power_and_efficiency.svg와 raw/assets/figure_04_energy_proportional_server.svg를 생성하고, wiki/sources/The Case for Energy-Proportional Computing.md의 해당 본문 아래에 삽입했다.
- 원문 PDF와 기존 raw/ 파일은 수정하지 않았다.

## 주요 수정 및 생성 파일

- raw/assets/figure_02_server_power_and_efficiency.svg (신규)
- raw/assets/figure_04_energy_proportional_server.svg (신규)
- wiki/sources/The Case for Energy-Proportional Computing.md (수정)
- wiki/logs/log-2026-08-29-106-The-Case-Figures-2-4-시각화-삽입.md (신규)

## 근거와 한계

- 원문 Figure 2는 대표적인 에너지 효율형 서버도 거의 일을 하지 않을 때 최대 전력의 약 절반을 소비하며, 20–30% 활용률에서 에너지 효율이 최대 부하 기준의 절반 미만으로 떨어진다고 설명한다.
- 원문 Figure 4는 유휴 전력을 최대 전력의 10%로 낮춘 서버를 예시로 들며, 90% 동적 전력 범위와 10%·30% 활용률에서의 상대 효율 기준을 제시한다.
- 두 SVG는 author copy의 축·곡선 형태와 본문에 명시된 기준을 읽기 쉽게 재작성한 것이다. 논문에 곡선을 생성한 원자료가 제공되지 않으므로, 그림의 개별 좌표를 새로운 실측 데이터셋으로 해석하지 않는다.

## 검증

- Google Research author copy PDF의 Figure 2·4가 있는 페이지를 렌더링해 원문 곡선과 캡션을 대조했다.
- 두 SVG를 독립 이미지로 렌더링해 한글 제목·축·범례·10–50% 강조 영역·주석·캡션의 잘림 여부를 확인했다.
- raw/의 기존 파일은 수정하지 않았다.

## 출처

- [[The Case for Energy-Proportional Computing]]
- Google Research, [publication record](https://research.google/pubs/the-case-for-energy-proportional-computing/)
- Google Research, [author copy](https://research.google.com/pubs/archive/33387.pdf)

## 관련 항목

- [[에너지 비례 컴퓨팅]]
- [[작업 로그]]
