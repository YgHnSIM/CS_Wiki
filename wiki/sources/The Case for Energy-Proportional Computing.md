---
schema_version: 2
id: ref-046
kind: reference
title: The Case for Energy-Proportional Computing
aliases:
  - Barroso-Hölzle 2007
  - Energy-proportional computing paper
  - 에너지 비례 컴퓨팅 논문
summary: 서버가 자주 머무는 중간 부하에서 전력 효율이 가장 낮았던 2007년의 불일치를 분석하고, 작업 부하에 따라 소비 전력을 조절하는 에너지 비례 컴퓨팅을 설계 목표로 제안한 논문.
domains:
  - computer-architecture
  - computer-history
editorial_status: active
publication_visibility: public
graph_visibility: public
created: 2026-07-16
updated: 2026-08-29
review:
  mode: attested
  revision: sha256:e2d951472d83b23b301858d4c2bbe00892bab65e13aca1f17e682bb4f94a13a6
  reviewed_at: 2026-08-29
  reviewed_by: codex
evidence_ids: []
capability_layers:
  - resource-efficiency
history:
  publication_year: 2007
  layer: system
redirect_from:
  - /references/the-case-for-energy-proportional-computing/
  - /sources/the-case-for-energy-proportional-computing/
origin: external
works:
  primary:
    - citation: Barroso and Hölzle, Computer 40(12), 2007
      genre: other
      identifiers: []
      edition: Computer 40(12), December 2007, pp. 33–37
  supporting:
    - citation: Google Research publication record
      genre: official-record
      identifiers: []
      edition: null
    - citation: Google Research author copy
      genre: other
      identifiers: []
      edition: null
access:
  - kind: url
    role: doi
    url: https://doi.org/10.1109/MC.2007.443
    retrieved: 2026-07-16
    version: Computer 40(12), December 2007, pp. 33–37
  - kind: url
    role: mirror
    url: https://research.google/pubs/the-case-for-energy-proportional-computing/
    retrieved: 2026-07-16
    version: Computer 40(12), December 2007, pp. 33–37
  - kind: url
    role: mirror
    url: https://research.google.com/pubs/archive/33387.pdf
    retrieved: 2026-07-16
    version: Computer 40(12), December 2007, pp. 33–37
---

## 개요

[[The Case for Energy-Proportional Computing]]은 Luiz André Barroso와 Urs Hölzle가 2007년 《Computer》에 발표한 논문이다. 당시 서버의 가장 흔한 운영 구간이 오히려 에너지 효율이 가장 낮은 구간이라는 불일치를 분석하고, 작업 부하가 줄면 소비 전력도 줄고 부하가 늘면 전력도 함께 늘어나는 [[에너지 비례 컴퓨팅]](energy-proportional computing)을 주요 설계 목표로 제안했다.

논문의 직접 근거는 대규모 인터넷 서비스용 서버다. 저자들은 모바일 장치처럼 부하가 거의 없는 긴 구간과 최대 성능의 짧은 구간을 오가는 사용 방식이 서버에는 잘 맞지 않는다고 보았다. 데이터와 백그라운드 작업이 여러 장비에 분산되고, 트래픽 변동·장애·유지보수를 견딜 여유 용량이 필요하기 때문에 서버는 완전히 잠들기보다 낮거나 중간인 부하에서 계속 동작하는 경우가 많았다.

## 서버가 머무는 부하 구간

그림 1은 5,000대가 넘는 서버의 CPU 활용률을 6개월 동안 관찰한 분포다. 서비스에 따라 분포 모양은 크게 달랐지만, 저자들이 일반화한 특징은 부하가 거의 없는 상태와 높은 활용률 부근이 모두 드물고 10–50% 활용률에서 동작하는 시간이 많다는 점이다.

![[figure_01_cpu_utilization_distribution.svg|그림 1. 5,000대가 넘는 서버를 6개월 동안 관찰한 평균 CPU 활용률 분포 — 원문 Figure 1 재작성]]

> [!NOTE] 원문 도표 재작성
> 논문에 원자료의 개별 관측값이 제공되지 않으므로, 원문 Figure 1의 축과 막대 분포 형태를 기준으로 재작성했다. 이 그림은 논문의 핵심 관찰인 10–50% 주요 부하 구간을 읽기 위한 시각화이며, 원자료의 정밀한 재분석용 데이터셋은 아니다.

이 수치는 모든 시대와 모든 서버의 정상 활용률을 규정하는 법칙이 아니다. 당시 조사한 대규모 인터넷 서비스에서 관찰한 운영 패턴이다. 평균 부하를 100%에 가깝게 만들지 않은 이유도 단순한 낭비가 아니라 처리량·지연 시간, 서비스 수준, 장애 복구와 유지보수를 위한 여유를 확보하기 위해서였다.

## 전력 곡선과 상대 효율

논문은 그림 2의 활용률을 요청/초와 같은 유효 처리량을 최대 부하의 처리량으로 나눈 값으로 느슨하게 정의하고, 서버 전력을 최대 전력에 대해 정규화한다. 활용률을 `u`, 정규화한 전력을 `p(u)`라 하면 그림 2의 상대 효율은 다음 비율이다.

`상대 효율 = u / p(u)`

![[figure_02_server_power_and_efficiency.svg|그림 2. 활용률에 따른 서버 전력 사용량과 상대 효율 — 원문 Figure 2 재작성]]

> [!NOTE] 원문 도표 재작성
> 논문에 원자료의 개별 관측값이 제공되지 않으므로, 원문 Figure 2의 축과 대표 곡선 형태를 기준으로 재작성했다. `p(u)`는 유휴 전력이 최대 전력의 약 50%인 대표 서버의 개념 곡선이며, 상대 효율은 `u / p(u)`를 최대 부하 기준으로 정규화해 표시했다.

저자들이 제시한 당시의 전력 효율이 비교적 좋은 대표 서버는 거의 일을 하지 않을 때도 최대 전력의 약 절반을 소비했다. 그 결과 서버가 자주 머무는 20–30% 활용률에서 상대 효율은 최대 부하 효율의 절반 미만이었다. 최대 부하의 전력당 성능이 좋아도 실제 운영 구간 전체가 효율적이라고 단정할 수 없다는 뜻이다.

그림 1은 CPU 활용률 분포를, 그림 2와 그림 4는 정규화한 유효 처리량을 사용한다. 두 가로축을 완전히 같은 측정값으로 해석하면 안 된다.

## 에너지 비례성이라는 설계 목표

이상적인 에너지 비례 시스템은 부하가 거의 없는 상태에서 거의 전력을 소비하지 않고, 작업 부하가 작을 때는 매우 적은 전력으로 계속 동작하며, 유효 처리량이 증가할수록 소비 전력을 점진적으로 높인다. 정규화한 이상 곡선은 대략 `p(u) = u`다. 핵심은 최대 전력을 무조건 낮추는 것이 아니라 부하가 거의 없는 상태부터 최대 부하까지 **동적 전력 범위**를 넓히는 데 있다.

제목은 에너지 비례성을 말하지만 그림이 직접 나타내는 것은 순간 전력과 활용률의 관계다. 이 전력 곡선을 운영 시간에 걸쳐 적분하면 소비 에너지가 된다. 낮은 절대 전력, 낮은 최대 전력, 높은 에너지 비례성은 서로 관련되지만 같은 속성이 아니다.

논문은 최대 전력을 그대로 두고 유휴 전력을 최대치의 10%로 낮춘 90% 동적 전력 범위의 서버를 모형화했다. 당시 실제 데이터센터 작업 부하를 사용한 시뮬레이션에서는 운영 에너지를 약 절반 줄이고 시설 수준의 최대 전력을 30% 넘게 낮출 잠재력이 나타났다. 이는 이미 모든 서버에서 실측한 보편적 개선율이 아니라 특정 전력 곡선과 작업 부하를 둔 조건부 전망이다.

![[figure_04_energy_proportional_server.svg|그림 4. 에너지 비례 서버의 전력 사용량과 상대 효율 — 원문 Figure 4 재작성]]

> [!NOTE] 원문 도표 재작성
> 논문에 원자료의 개별 관측값이 제공되지 않으므로, 원문 Figure 4의 축·곡선과 90% 동적 전력 범위, 10% 활용률에서 50% 초과·30% 이상에서 80% 초과라는 설명을 기준으로 재작성했다. 이 그림은 특정 서버의 실측 결과가 아니라 논문이 제안한 모형을 보여준다.

## CPU 밖의 구성요소

2007년 당시 저자들의 경험에서 데스크톱·서버 CPU는 매우 낮은 부하에서 최대 전력의 3분의 1 미만을 소비해 70%가 넘는 동적 범위를 보였다. 반면 다른 구성요소의 동적 범위는 DRAM이 50% 미만, 디스크 드라이브가 약 25%, 네트워크 스위치가 약 15%로 더 좁았다. 이 수치는 오늘날 장치의 현재 특성이 아니라 당시 시스템의 역사적 기준선이다.

CPU는 전압과 주파수를 낮춘 상태에서도 명령을 수행하는 작업 중 저전력 상태(활성 저전력)를 제공했다. 당시의 메모리와 디스크는 대체로 장치를 깨워야 작업할 수 있는 깊은 절전 상태(비활성 절전)에 의존했고, 상태 전환의 지연·에너지 비용이 컸다. 서버에는 긴 부하 공백보다 낮은 부하 구간이 더 흔하므로, 저자들은 메모리·저장장치·네트워크에도 작업 가능한 저전력 상태와 넓은 동적 범위가 필요하다고 주장했다.

## 측정에 주는 교훈

이 논문의 지속되는 기여는 최대 부하의 한 지점에서 얻은 효율을 시스템 전체의 효율로 오해하지 말아야 한다는 데 있다. 에너지 효율 벤치마크는 부하가 거의 없는 상태(유휴), 중간 부하와 최대 부하에서 처리량과 전력을 함께 보고하고, 메모리·저장장치·네트워크를 포함한 측정 경계를 밝혀야 한다.

[[Power Measurement Tutorial for the Green500 List]]가 동일한 LINPACK 구간의 달성 성능과 평균 시스템 전력을 결합한다면, 이 논문은 실제 서비스가 머무는 **부하 곡선 전체**를 평가해야 한다고 요구한다. 두 자료는 서로 다른 작업과 운영 조건을 측정하므로 하나의 효율 수치로 대체할 수 없다.

## 주요 인사이트

- 에너지 비례성은 소비 전력이 유효 작업량에 맞춰 변하는 정도다.
- 당시 조사한 서버는 부하가 거의 없는 상태나 최대 부하로 동작하기보다 10–50% 활용률에서 머무는 시간이 많았다.
- 최대 부하 효율이 좋아도 높은 유휴 전력이 있으면 흔한 중간 부하에서 상대 효율이 낮을 수 있다.
- 시스템 효율은 CPU뿐 아니라 메모리·저장장치·네트워크의 전력 곡선에 달려 있다.
- 효율 두 배 또는 에너지 절반은 90% 동적 범위와 당시 작업 부하 시뮬레이션에 대한 잠재치다.

## 인용할 만한 구절

> 서버의 가장 흔한 운영 구간과 가장 낮은 에너지 효율 구간이 겹쳤다.
<!-- wiki-v2:quote-locator evidence="ref-046" locator="wiki/sources/The Case for Energy-Proportional Computing.md:line-53#인용할-만한-구절" status="recorded" -->

논문의 문제 설정을 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[컴퓨팅 능력이란 무엇인가|컴퓨팅 능력]]의 자원 효율을 최대 부하의 전력당 성능 한 지점이 아니라 실제 부하 곡선과 시스템 구성요소의 속성으로 확장하는 근거다. [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]에서는 환산 계산량/에너지의 장기 추세와 칩의 활성 면적 제약 사이에 서버 운영의 중간 부하 문제를 놓는다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| responds_to | [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]] | 낮은 활용률에서도 높은 기저 전력을 쓰는 서버의 운영 제약에 부하에 맞춰 전력을 조절하는 목표로 대응한다. | [[The Case for Energy-Proportional Computing]] |
| enables | [[에너지 비례 컴퓨팅]] | 부하가 거의 없는 상태부터 최대 부하까지 유효 처리량에 맞춰 전력이 변하는지를 시스템 능력의 평가 기준으로 만든다. | [[The Case for Energy-Proportional Computing]] |

## 출처

<!-- wiki-v2:evidence-start -->
### 근거 ID
- 없음
<!-- wiki-v2:evidence-end -->

- IEEE, [DOI record](https://doi.org/10.1109/MC.2007.443)
- Google Research, [publication record](https://research.google/pubs/the-case-for-energy-proportional-computing/)
- Google Research, [author copy](https://research.google.com/pubs/archive/33387.pdf)

## 관련 항목

- [[에너지 비례 컴퓨팅]]
- [[Power Measurement Tutorial for the Green500 List]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]
