---
title: Implications of Historical Trends in the Electrical Efficiency of Computing
aliases: [Koomey et al. 2011, Koomey의 법칙 원전, Computing energy efficiency trends]
summary: "1946–2009년 여러 종류의 컴퓨터에서 최고 부하의 계산량을 전력으로 나눈 장기 자료를 분석해 계산의 전기 효율이 약 1.57년마다 배가했다는 역사적 추세를 보고한 논문."
tags: [type/reference, domain/computer-history, domain/computer-architecture, status/active]
created: 2026-07-16
updated: 2026-07-25
publication_year: 2011
event_start: 1946
event_end: 2009
historical_layer: measurement
historical_note: "1946–2009년 표본을 분석한 2011년 출판물이다. 관측 기간과 출판 시점을 구분한다."
capability_layers: [resource-efficiency]
sources: ["IEEE Annals of the History of Computing 33(3), 2011", "Web Extra Appendix", "koomeycomputertrendsreleaseversion-v36.xlsx", "Gwern access copy"]
source_id: ref-047
source_kind: external
primary_sources: ["Jonathan G. Koomey, Stephen Berard, Marla Sanchez, and Henry Wong, IEEE Annals of the History of Computing 33(3), 2011, pp. 46–54", "Web Extra Appendix", "koomeycomputertrendsreleaseversion-v36.xlsx"]
supporting_sources: ["IEEE DOI record", "Gwern access copy"]
source_urls: ["https://doi.org/10.1109/MAHC.2010.28", "https://ieeexplore.ieee.org/document/5440129/", "https://gwern.net/doc/cs/hardware/2011-koomey.pdf", "https://www.researchgate.net/publication/236758748_Web_Extra_Appendix_Implications_of_Historical_Trends_in_the_Electrical_Efficiency_of_Computing", "https://github.com/AABoyles/AIPredict/blob/master/data-raw/koomeycomputertrendsreleaseversion-v36.xlsx"]
retrieved: 2026-07-16
version: "IEEE Annals of the History of Computing 33(3), July–September 2011, pp. 46–54"
snapshot_status: external-only
status: active
---

## 개요

[[Implications of Historical Trends in the Electrical Efficiency of Computing]]은 Jonathan G. Koomey, Stephen Berard, Marla Sanchez와 Henry Wong이 2011년에 발표한 논문이다. 1946년 ENIAC에서 2009년의 컴퓨터까지 장기간의 성능과 소비 전력 자료를 결합해, 최고 부하에서 단위 전력·에너지로 수행할 수 있는 계산량이 어떻게 변했는지를 분석했다.

논문의 회귀 결과는 1946–2009년 전체 표본에서 `kWh당 계산량`이 평균 1.57년마다 두 배가 되었고, 1975–2009년 개인용 컴퓨터만 보면 1.52년마다 두 배가 되었다는 것이다. 이 역사적 추세는 뒤에 [[Koomey의 법칙]](Koomey's law)이라고 널리 불렸지만, 해당 명칭은 논문 제목이나 본문이 스스로 선언한 자연 법칙이 아니다.

## 무엇을 측정했는가

저자들은 모든 시대와 컴퓨터에 대해 일관된 성능·에너지 자료가 존재하지 않는 문제를 해결하기 위해 William Nordhaus가 구축한 장기 성능 자료에 40대의 추가 시스템을 더했다. 그림 3의 전체 회귀에는 개인용 컴퓨터, 메인프레임과 통합형 슈퍼컴퓨터를 포함한 80대가 들어간다.

각 시스템의 지표는 완전 부하에서 가능한 시간당 계산량을 같은 시간에 소비한 직접 활성 전력으로 나눈 `kWh당 계산량`이다. 에너지 단위를 줄(J)로 바꾸면 계산/J과 같은 뜻의 비율이 된다. 전력은 명판의 정격값보다 측정값을 사용했지만, 오래된 시스템의 자료에는 최대 부팅 전력이나 활성 유휴 전력으로부터 만든 근사도 있어 측정 조건이 완전히 균질하지 않다.

`전기 효율 = 완전 부하의 계산 성능 / 직접 활성 전력`

이 지표는 서로 다른 시대의 계산 장치를 하나의 장기 축에서 비교하기 위한 근사다. 성능은 주로 Nordhaus의 초당 수백만 계산(MCPS) 장기 자료를 사용했고, 일부 장비는 FLOPS, Composite Theoretical Performance와 SPEC 자료를 기준 시스템을 통해 MCPS로 환산했다. 논문은 성능 자료 자체가 논쟁적일 수 있다고 인정하며, 계산량의 정의도 오늘날 특정 응용의 완료 작업이나 동일 명령 수를 직접 재현한 값이 아니다. 따라서 회귀선은 정확히 같은 작업을 80대에서 실행한 벤치마크 결과가 아니라 이질적인 역사 자료를 정규화한 추세다.

## 역사적 결과

그림 3의 회귀는 1946–2009년 `N = 80`, 조정 결정계수 `0.983`, 평균 배가 시간 1.57년을 보고한다. 그림 4의 개인용 컴퓨터 표본은 1975–2009년 `N = 34`, 조정 결정계수 `0.970`, 배가 시간 1.52년이다.

개선 속도는 모든 시기에 완전히 같지 않았다. 진공관·다이오드에서 트랜지스터로 전환하던 초기에는 효율이 빠르게 상승했고, 이산 트랜지스터 시대에는 상대적으로 느렸다. 장기 평균 하나는 서로 다른 기술 전환과 제품군의 차이를 압축한 값이다.

저자들은 트랜지스터 치수 축소가 속도·비용과 소자당 전력을 함께 낮춘 점을 중요한 동인으로 설명한다. 그러나 이 추세를 [[무어의 법칙]]이나 [[Dennard 스케일링]]과 동일시하지 않는다. 무어의 법칙은 원래 경제적으로 유리한 집적 회로의 부품 수에 관한 경험적 관찰이고, Dennard 스케일링은 치수와 전압을 함께 줄이는 이상적인 소자 규칙이며, 이 논문의 지표는 완전 부하에서 시스템이 달성한 계산/에너지다.

## 이 결과가 말하지 않는 것

논문의 지표는 최고 성능과 그때의 전력을 사용한다. 서버·데스크톱·노트북이 실제로 대부분의 시간을 보내는 유휴 또는 부분 부하의 전력은 직접 나타내지 않는다. [[The Case for Energy-Proportional Computing]]이 다룬 부하별 전력 곡선과 결합해야 실제 운용 에너지를 해석할 수 있다.

계산 효율이 좋아져도 컴퓨터의 총 전력 소비가 자동으로 감소하지 않는다. 논문은 총 전력 사용량이 다음 요인에 함께 달렸다고 명시한다.

- 설치된 컴퓨터의 수
- 컴퓨터가 머무는 부하와 운용 시간
- 디스플레이·저장장치·네트워크 같은 다른 구성요소의 전력
- 효율 향상이 새 사용과 더 큰 작업 수요를 얼마나 늘리는가

따라서 “같은 계산을 수행하는 데 필요한 에너지”와 “사회 전체의 컴퓨팅 전력 소비”는 서로 다른 양이다. 전자는 작업당 효율이고, 후자는 장비 수·작업량·운영 방식과 시스템 경계를 포함한다.

## ‘법칙’으로 읽을 때의 한계

- 1.57년은 1946–2009년 표본에 대한 평균 회귀 결과이지 모든 구간에서 지켜진 고정 주기가 아니다.
- 표본은 서로 다른 기계와 성능 정의를 결합하므로 동일 작업의 직접 비교보다 장기 규모의 추세에 적합하다.
- 측정은 최고 부하의 직접 활성 전력을 중심으로 하며 유휴 전력, 시설 냉각과 전체 수명 주기 에너지를 포함하지 않는다.
- 논문이 미래에도 개선이 계속될 가능성을 논했더라도, 2009년 이후의 배가 속도를 이 자료만으로 확정할 수 없다.
- 물리 법칙이나 기술 보증이 아니며, 특정 아키텍처·공정·소프트웨어가 자동으로 같은 개선율을 얻는다는 뜻도 아니다.

## 주요 인사이트

- 계산 능력의 발전은 절대 성능뿐 아니라 같은 에너지로 수행할 수 있는 계산량의 증가로도 추적할 수 있다.
- 1.57년 배가 시간은 63년의 이질적 자료를 하나의 회귀선으로 요약한 역사적 결과다.
- 계산/에너지, 집적도와 전력 밀도는 서로 연관되지만 다른 지표다.
- 최고 부하 효율은 실제 부하 곡선과 시스템 전체의 전력 소비를 대신하지 않는다.
- 효율 향상과 총 전력 감소를 구분해야 컴퓨팅 능력의 환경·운영 비용을 정확히 해석할 수 있다.

## 인용할 만한 구절

> 1946–2009년 표본에서 최고 부하의 계산/에너지는 평균 1.57년마다 두 배가 되었다.

논문의 회귀 결과와 측정 경계를 함께 붙여 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[컴퓨팅 능력이란 무엇인가|컴퓨팅 능력]]의 자원 효율 층위를 역사적으로 뒷받침한다. [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]에서는 최고 부하의 환산 계산량/에너지 개선이 실제 운용의 낮은 부하 효율이나 칩의 순간 전력 한계를 자동으로 해결하지 않는다는 점을 분석하는 데 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| measures | [[Koomey의 법칙]] | 1946–2009년 컴퓨터 표본의 최고 부하 계산량과 전력을 공통 단위로 환산해 계산/에너지의 장기 추세를 측정한다. | [[Implications of Historical Trends in the Electrical Efficiency of Computing]] |
| exemplifies | [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]] | 세대 간 계산/J의 향상이 순간 전력·실제 부하 곡선과 구분되어야 하는 역사적 측정 축을 제공한다. | [[Implications of Historical Trends in the Electrical Efficiency of Computing]] |

## 출처

- IEEE, [DOI record](https://doi.org/10.1109/MAHC.2010.28)
- IEEE Xplore, [publication record](https://ieeexplore.ieee.org/document/5440129/)
- [access copy](https://gwern.net/doc/cs/hardware/2011-koomey.pdf)
- [Web Extra metadata](https://www.researchgate.net/publication/236758748_Web_Extra_Appendix_Implications_of_Historical_Trends_in_the_Electrical_Efficiency_of_Computing)
- [v36 data workbook access copy](https://github.com/AABoyles/AIPredict/blob/master/data-raw/koomeycomputertrendsreleaseversion-v36.xlsx)

## 관련 항목

- [[Koomey의 법칙]]
- [[무어의 법칙]]
- [[Dennard 스케일링]]
- [[에너지 비례 컴퓨팅]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]
