---
title: Dark Silicon and the End of Multicore Scaling
aliases: [Esmaeilzadeh et al. 2011, ISCA dark silicon paper, 다크 실리콘 논문]
summary: "전압과 전력의 축소가 트랜지스터 면적 축소를 따라가지 못할 때 고정된 칩 전력 안에서 일부 영역을 동시에 활용할 수 없게 된다는 다크 실리콘 문제를 2011년의 기술 세대·멀티코어 모델로 전망한 논문."
tags: [type/reference, domain/computer-architecture, domain/computer-history, status/active]
created: 2026-07-16
updated: 2026-07-16
sources: ["Proceedings of ISCA 2011", "UW-Madison Vertical Research Group author copy", "UW-Madison publication record", "ISCA@50 author retrospective"]
source_id: ref-048
source_kind: external
primary_sources: ["Esmaeilzadeh et al., Proceedings of ISCA 2011, pp. 365–376", "Esmaeilzadeh et al., ISCA@50 author retrospective, 2023"]
supporting_sources: ["UW-Madison Vertical Research Group author copy", "UW-Madison publication record"]
source_urls: ["https://doi.org/10.1145/2000064.2000108", "https://research.cs.wisc.edu/vertical/papers/2011/isca11-darksilicon.pdf", "https://research.cs.wisc.edu/vertical/wiki/index.php/Pubs2/B2hd-isca11darksilicon", "https://www.microsoft.com/en-us/research/publication/retrospective-dark-silicon-and-the-end-of-multicore-scaling/"]
retrieved: 2026-07-16
version: "ISCA '11, June 4–8, 2011, pp. 365–376"
snapshot_status: external-only
status: active
---

## 개요

[[Dark Silicon and the End of Multicore Scaling]]은 Hadi Esmaeilzadeh, Emily Blem, Renée St. Amant, Karthikeyan Sankaralingam과 Doug Burger가 ISCA 2011에서 발표한 논문이다. [[Dennard 스케일링]]의 약화 뒤에도 트랜지스터 수가 증가하면 코어 수를 같은 비율로 늘려 성능 향상을 이어갈 수 있는지 묻고, 고정된 칩 면적과 전력 예산에서는 일부 실리콘을 동시에 활용하지 못하는 [[다크 실리콘]](dark silicon)이 생긴다고 전망했다.

여기서 다크 실리콘은 제조 결함이나 영구적으로 쓸모없는 트랜지스터가 아니다. 칩에 구현할 수 있는 회로 면적보다 전력·열 예산 안에서 **동시에 활성화할 수 있는 면적**이 작아져, 특정 시점에는 사용하지 못하는 회로가 생기는 현상이다. 전력 차단, 낮은 주파수 동작, 시간 분할과 작업별 특화로 어느 영역을 사용할지는 바꿀 수 있다.

## 세 모델의 결합

논문은 45nm에서 8nm까지의 미래를 예측하기 위해 세 층위의 모델을 결합했다.

1. 소자 스케일링 모델은 공정 세대별 면적·주파수·전력 변화를 ITRS 로드맵과 더 보수적인 Borkar 계수로 각각 전망한다.
2. 코어 모델은 150개가 넘는 프로세서의 SPEC 성능, 면적과 전력을 사용해 단일 코어의 면적/성능·전력/성능 파레토 경계를 만든다.
3. 멀티코어 모델은 PARSEC의 12개 병렬 작업, CPU형·GPU형 코어와 대칭·비대칭·동적·조합형 토폴로지를 결합해 최적 코어 수, 가속과 비활성 면적을 찾는다.

기준 시스템은 45nm의 쿼드코어 Nehalem이며, 코어 면적 111mm²와 전력 125W의 예산을 고정한다. 이 결과는 실제 8nm 칩을 측정한 값이 아니라 당시의 공정 전망, 과거 프로세서 자료와 병렬 작업 모델을 조합한 역사적 예측이다.

## 최종 논문의 예측

최종 ISCA 논문은 낙관적인 ITRS 스케일링에서도 캐시·언코어를 제외한 111mm² 코어 면적 예산 가운데 22nm에서 21%를 끄고, 8nm에서는 50% 넘는 면적을 사용하지 못할 것으로 예측했다. 2008년 기준에서 다섯 세대가 지난 2024년까지 PARSEC 병렬 작업의 평균 가속은 7.9배로 전망했다. 세대마다 성능이 두 배라면 목표는 32배이므로 가속 배수 기준 `32 - 7.9 = 24.1`의 산술 격차가 난다. 이를 “24배 느리다”거나 성능 비율이 24 대 1이라고 해석하면 안 된다.

저자들은 ITRS 전망 자체가 지나치게 낙관적이라고 보았다. 더 보수적인 스케일링에서는 8nm까지의 최선 평균 가속이 3.7배, 연평균 약 14%로 낮아졌고, 실제 반환은 이보다 더 낮을 것이라고 명시했다. 두 수치 모두 고도로 병렬적인 코드에 작업별 최적 코어 수와 구성을 선택한 모델 결과다.

> [!WARNING] 모순 발견
> UW-Madison 연구그룹의 서지 페이지 초록은 22nm에서 25%, 8nm에서 70% 넘는 다크 실리콘을 적지만, 그 페이지가 연결하는 최종 ISCA proceedings PDF의 초록과 본문은 각각 21%, 50% 초과로 기록한다. 이 페이지는 DOI와 쪽수 365–376이 확인되는 최종 PDF를 직접 근거로 사용한다. 또한 논문의 표 2와 서술 사이에도 ITRS·보수적 시나리오의 노드별 예상 연도가 일관되지 않으므로, 공정 노드와 연도를 보편적으로 대응시키지 않는다.

> [!WARNING] 모순 발견
> 모델 설명과 검증 절은 실제형 모델이 대체로 성능을 낙관적으로 과대예측한다고 설명하지만, 제한점 절의 마지막 문장은 모델이 항상 과소예측한다고 적는다. 앞선 검증 도표와도 충돌하므로 이 페이지는 예측 오차의 방향을 “항상” 한쪽이라고 일반화하지 않는다.

## 왜 코어 수만 늘려서는 부족한가

트랜지스터의 면적은 계속 줄어도 공급 전압과 소자당 전력이 같은 속도로 낮아지지 않으면, 같은 칩 전력에서 켤 수 있는 코어 수는 면적이 허용하는 코어 수보다 적어진다. 병렬화 가능한 작업의 비율도 무한하지 않으므로 더 많은 코어가 있어도 암달식 순차 부분과 메모리·통신 비용이 가속을 제한한다.

논문의 민감도 분석은 전력 예산을 크게 늘려도 많은 PARSEC 작업에서 병렬성 자체가 추가 가속을 제한하고, 병렬성을 이상적으로 높여도 고정 전력이 제한할 수 있음을 보여준다. 다크 실리콘은 하나의 원인만 가리키는 표어가 아니라 전력, 작업의 병렬성, 코어 효율과 메모리 시스템이 결합해 나타나는 사용률 차이다.

## 모델의 낙관적 가정과 범위

- 성능이 주파수에 선형으로 비례한다고 두어 공정 축소 때의 메모리 지연·대역폭 영향을 충분히 반영하지 않는다.
- 병렬 구간의 작업이 균일하고, 운영체제 직렬화·스레드 동기화·교환 비용과 직렬 데이터 공유가 없다는 낙관적 가정을 포함한다.
- CPU형·GPU형 멀티코어와 PARSEC 12개 작업을 평가하므로 모든 응용과 가속기 구조를 대표하지 않는다.
- 다크 실리콘 비율은 캐시와 언코어가 아니라 코어에 할당한 면적 예산을 대상으로 보고한다.
- 각 벤치마크에 이상적인 코어 수와 세분성을 선택하므로 실제 범용 제품의 평균 결과보다 유리하다.
- 2011년의 공정 노드 명칭과 일정은 오늘날 제조 세대의 이름이나 실제 물리 치수와 직접 대응하지 않는다.

이 한계들은 논문의 정성적 문제 제기를 없애지 않지만, 특정 연도·노드의 수치를 현재 하드웨어의 실측 사실로 옮기는 일을 막는다.

## 후대의 회고

저자들은 2023년 ISCA@50 회고에서 2011년 예측을 후대 칩의 실측 사실로 재서술하지 않았다. 넓은 면적이 물리적으로 완전히 꺼진 모습이 보편화되기보다, 큰 캐시, 공격적인 동적 전압·주파수 조정(DVFS), 낮은 평균 활동률을 가진 “딤 실리콘”(dim silicon), 이기종 구조와 특화 가속기가 전력 제약을 흡수했다고 평가했다.

따라서 원 논문의 역사적 의미는 특정 다크 면적 비율을 정확히 예언했다는 데 있지 않다. 트랜지스터의 보유량과 동시에 유용하게 활성화할 수 있는 용량이 분리되고, 성능 향상이 활동률·전력 관리와 전문화의 문제가 된다는 전환을 일찍 정량화한 데 있다.

## 컴퓨팅 능력에 주는 의미

다크 실리콘은 트랜지스터 수와 동시에 사용할 수 있는 계산 자원이 같은 양이 아님을 보여준다. 전력 장벽 이후 설계 문제는 “얼마나 많은 회로를 집적할 수 있는가”에서 “제한된 전력으로 어떤 회로를 언제 켜 가장 가치 있는 작업을 수행할 것인가”로 이동한다.

[[도메인 특화 가속기]]는 이 제약에 대한 한 대응이다. 모든 기능을 동시에 활성화하기보다 특정 데이터 경로를 높은 작업/J로 실행하고 필요할 때만 선택해 사용한다. 다만 특화는 지원하지 않는 작업, 데이터 이동과 소프트웨어 매핑 비용을 만들므로 다크 실리콘을 자동으로 제거하는 해법은 아니다.

## 주요 인사이트

- 집적 가능한 트랜지스터 수와 동시에 활성화할 수 있는 트랜지스터 수는 다르다.
- 다크 실리콘은 결함 면적이 아니라 고정된 전력에서 활용하지 못하는 회로 자원의 비율이다.
- 21%, 50% 초과와 7.9배는 2011년 ITRS 기반의 미래 예측이지 후대 칩의 실측값이 아니다.
- 전력과 병렬성은 함께 멀티코어의 실현 성능을 제한한다.
- 성능 향상은 코어 수 증가보다 전력/성능 파레토 경계를 바꾸는 구조·소프트웨어 공동 설계에 달려 있다.

## 인용할 만한 구절

> 더 많은 트랜지스터가 곧 더 많은 동시 계산 자원을 뜻하지는 않는다.

논문의 역사적 문제 제기를 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[무어의 법칙]]이 제공한 집적도 증가와 실제 활성 계산 자원 사이의 간극을 설명한다. [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]에서는 [[Koomey의 법칙]]의 장기 환산 계산량/에너지 개선, 서버의 [[에너지 비례 컴퓨팅]]과 구분해 칩 내부의 순간 전력·활성 면적 제약으로 사용한다.

## 출처

- ACM, [DOI record](https://doi.org/10.1145/2000064.2000108)
- UW-Madison Vertical Research Group, [author copy](https://research.cs.wisc.edu/vertical/papers/2011/isca11-darksilicon.pdf)
- UW-Madison Vertical Research Group, [publication record](https://research.cs.wisc.edu/vertical/wiki/index.php/Pubs2/B2hd-isca11darksilicon)
- Microsoft Research, [ISCA@50 author retrospective](https://www.microsoft.com/en-us/research/publication/retrospective-dark-silicon-and-the-end-of-multicore-scaling/)

## 관련 항목

- [[다크 실리콘]]
- [[Dennard 스케일링]]
- [[무어의 법칙]]
- [[도메인 특화 가속기]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]
