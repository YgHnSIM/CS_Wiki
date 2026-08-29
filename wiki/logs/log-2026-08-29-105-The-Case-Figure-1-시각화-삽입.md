---
schema_version: 2
id: log-2026-08-29-105
kind: meta
title: "2026-08-29 update | The Case Figure 1 시각화 삽입"
aliases: []
summary: The Case for Energy-Proportional Computing이 언급한 Figure 1을 원문 도표 기준의 읽기 쉬운 SVG로 재작성하고 참고 자료 페이지에 삽입한 작업 기록.
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

- Google Research author copy의 원문 Figure 1을 확인하고, 5,000대 이상 서버의 6개월 평균 CPU 활용률 분포라는 축·캡션·핵심 관찰을 대조했다.
- 원문 도표의 분포 형태와 축 범위를 기준으로 raw/assets/figure_01_cpu_utilization_distribution.svg를 새로 작성했다. 10–50% 구간은 주요 운용 영역으로 음영 처리하고, 원문에 없는 개별 관측값을 사실처럼 추가하지 않았다.
- wiki/sources/The Case for Energy-Proportional Computing.md의 “서버가 머무는 부하 구간”에 그림을 삽입하고, 원자료가 공개되지 않은 재작성 도표라는 한계를 기록했다.
- 원문 PDF와 기존 raw/ 파일은 수정하지 않았다.

## 주요 수정 및 생성 파일

- raw/assets/figure_01_cpu_utilization_distribution.svg (신규)
- wiki/sources/The Case for Energy-Proportional Computing.md (수정)
- wiki/logs/log-2026-08-29-105-The-Case-Figure-1-시각화-삽입.md (신규)

## 근거와 한계

- 원문 캡션은 5,000대가 넘는 서버의 6개월 평균 CPU 활용률을 보여주며, 서버가 완전 유휴나 최대 활용률보다 10–50% 구간에서 더 많은 시간을 보낸다고 설명한다.
- 재작성 도표는 author copy의 Figure 1을 판독한 막대 높이를 사용하므로, 원문 그림의 의미와 형태를 전달하는 용도다. 논문이 원자료를 제공하지 않으므로 막대 높이를 새로운 실측 데이터로 해석하지 않는다.

## 검증

- Google Research author copy PDF 2쪽을 렌더링해 원문 Figure 1의 축·범례·분포 형태를 대조했다.
- SVG를 독립 이미지로 렌더링해 한국어 제목, 축, 10–50% 강조 영역, 캡션과 주석의 잘림 여부를 확인한다.
- raw/의 기존 파일은 수정하지 않았다.

## 출처

- [[The Case for Energy-Proportional Computing]]
- Google Research, [publication record](https://research.google/pubs/the-case-for-energy-proportional-computing/)
- Google Research, [author copy](https://research.google.com/pubs/archive/33387.pdf)

## 관련 항목

- [[에너지 비례 컴퓨팅]]
- [[작업 로그]]
