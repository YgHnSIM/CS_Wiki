---
title: The Tail at Scale
aliases: [Dean and Barroso 2013, Tail at Scale, 규모에서의 꼬리 지연]
summary: "대규모 온라인 서비스에서 드문 구성요소 지연이 모든 응답을 기다리는 팬아웃을 통해 흔한 서비스 지연으로 증폭되는 원리와 꼬리 내성 기법을 정리한 2013년 논문."
tags: [type/reference, domain/systems, status/active]
created: 2026-07-16
updated: 2026-07-16
sources: ["Jeffrey Dean and Luiz André Barroso, The Tail at Scale, Communications of the ACM 56(2), 2013, pp. 74-80", "Google Research publication page", "University of Utah access copy"]
source_id: ref-049
source_kind: external
primary_sources: ["Jeffrey Dean and Luiz André Barroso, The Tail at Scale, Communications of the ACM 56(2), 2013, pp. 74-80"]
supporting_sources: ["Google Research publication page", "University of Utah access copy"]
source_urls: ["https://doi.org/10.1145/2408776.2408794", "https://research.google/pubs/the-tail-at-scale/", "https://cacm.acm.org/research/the-tail-at-scale/", "https://users.cs.utah.edu/~stutsman/cs6450/public/papers/tail-at-scale.pdf"]
retrieved: 2026-07-16
version: "Communications of the ACM 56(2), February 2013, pp. 74-80"
snapshot_status: external-only
status: active
---

## 개요

[[The Tail at Scale]]은 Jeffrey Dean과 Luiz André Barroso가 2013년 《Communications of the ACM》에 발표한 글이다. 대규모 대화형 서비스에서 평균 응답 시간이 아니라 지연 시간 분포의 [[꼬리 지연 시간|느린 꼬리]]가 사용자에게 보이는 응답성을 결정할 수 있다는 문제를 다룬다.

논문의 출발점은 구성요소의 드문 지연이 규모와 함께 증폭된다는 점이다. 공유 CPU·캐시·메모리·네트워크의 경합, 백그라운드 데몬과 유지보수, 여러 층의 큐, 전력·열 조절, 저장장치의 가비지 컬렉션과 절전 상태 전환은 개별 요청에 일시적인 지연을 만든다. 한 요청을 여러 서버에 팬아웃(fan-out)하고 모든 결과를 모아야 하는 서비스에서는 그중 하나의 지연도 종단 간 응답을 늦출 수 있다.

각 하위 요청이 임계 시간을 넘을 확률이 각각 `q`이고 그 지연 사건이 서로 독립인 하위 요청이 `N`개라면 다음과 같다.

`P(적어도 하나가 임계 시간 초과) = 1 - (1 - q)^N`

논문의 가상 사례는 서버가 보통 10ms에 응답하지만 99번째 백분위 지연이 1초인 분포를 둔다. 그림에서 서버별 1초 초과 이상값의 빈도를 100번 중 한 번으로 단순화하면, 100대의 응답을 모두 모으는 요청의 약 63%가 1초를 넘는다. 서버 하나의 1초 초과가 10,000번 중 한 번뿐이어도 2,000대에 팬아웃하면 사용자 요청의 약 18%에서 적어도 하나가 1초를 넘는다. 이는 모든 분산 서비스에 그대로 적용되는 상수가 아니라 독립 지연과 전부 대기라는 조건을 둔 증폭 예시다.

실제 Google 서비스의 표 1에서도 측정 경계에 따라 분포가 크게 달랐다. 서비스 트리의 루트에서 관측한 임의의 리프 하나의 99백분위 완료 시간은 10ms였지만, 루트가 모든 리프의 완료를 관측한 시간의 99백분위는 140ms였다. 리프의 95%가 끝날 때까지의 값은 70ms였으므로 가장 느린 5%를 기다리는 구간이 루트 관측 99백분위 시간의 절반을 차지했다. 다만 논문은 이 서비스의 팬아웃 수·표본 수·측정 기간을 공개하지 않으므로, 10ms와 140ms의 비율을 다른 서비스의 일반 법칙으로 옮길 수는 없다.

## 두 종류의 대응

논문은 지연 변동의 원인을 줄이는 일과 남은 변동을 견디는 일을 구분한다. 서비스 등급별 큐, 짧은 하위 큐, 긴 요청의 시간 분할, 백그라운드 작업의 제한·분할·조정은 개별 구성요소의 변동을 줄인다. 캐시는 평균 지연을 낮출 수 있지만 전체 작업 집합이 캐시에 상주한다고 보장되지 않는 한 꼬리 지연을 직접 해결하지는 못한다고 저자들은 구분한다. 그러나 공유 환경과 큰 시스템에서 모든 변동 원인을 제거하기는 어렵기 때문에, 저자들은 덜 예측 가능한 구성요소로 예측 가능한 전체를 만드는 꼬리 내성(tail-tolerant) 기법을 제안한다.

요청 내부의 수십 밀리초 규모에서는 지연된 1차 요청 뒤 다른 복제본에 보조 요청을 보내 먼저 온 결과를 쓰는 헤지 요청(hedged request), 두 서버의 큐에 요청을 넣되 한쪽이 실행을 시작하면 다른 쪽을 취소하는 결합 요청(tied request)을 사용한다. 논문의 BigTable 벤치마크에서는 100대에 분산된 1,000개 키를 읽을 때 10ms 뒤 헤지 요청을 보내 99.9백분위 지연을 1,800ms에서 74ms로 줄였고, 추가 요청 수는 2%였다. 이는 해당 벤치마크와 정책의 결과이지 모든 복제 서비스의 보편적 개선율이 아니다. 캐시되지 않은 작은 BigTable 읽기에서 1ms 뒤 보낸 결합 요청은 p99.9를 거의 유휴인 클러스터에서 98ms에서 61ms로, 동시 TeraSort 환경에서 159ms에서 108ms로 줄였으며 두 경우 모두 추가 디스크 사용률은 1% 미만이었다.

여러 요청에 걸친 수십 초에서 수분의 적응 규모에서는 기계 수보다 훨씬 많은 미세 파티션을 만들고 동적으로 재배치하거나, 인기 항목을 선택적으로 복제하고, 일시적으로 느린 서버를 서비스 경로에서 제외하면서 그림자 요청으로 회복을 확인한다. 대규모 정보 검색에서는 충분한 리프가 응답했을 때 드물게 불완전하지만 기한을 지킨 결과를 내는 ‘충분히 좋은 결과’와, 위험한 요청을 먼저 한두 서버에서 시험하는 카나리아 요청도 다룬다.

## 비용과 적용 경계

- 헤지·결합 요청은 복제 자원과 빠른 취소가 필요하며, 잘못 사용하면 부하를 늘려 꼬리를 더 길게 만들 수 있다.
- 복제본들이 같은 장애·네트워크 혼잡·코드 경로의 영향을 함께 받으면 독립 변동을 이용하는 기법의 효과가 줄어든다.
- 논문의 주요 사례는 읽기 중심이거나 느슨한 일관성을 허용하는 대규모 데이터 서비스다. 상태 변경, 강한 일관성, 다른 비용 구조를 가진 시스템에 수치를 그대로 옮길 수 없다.
- ‘충분히 좋은 결과’는 지연을 줄이는 대신 결과 완전성이나 부가 기능을 포기할 수 있으므로, 정확성·품질 조건을 성능과 함께 기록해야 한다.
- 100ms라는 상호작용 기준은 논문이 인용한 인간–컴퓨터 상호작용 연구와 당시 서비스의 문제 설정이지 모든 사용자·작업에 적용되는 보편적 경계가 아니다.

## 주요 인사이트

- 평균 지연은 드물지만 사용자에게 반복적으로 나타나는 느린 요청을 숨길 수 있다.
- 모든 응답을 기다리고 하위 지연 사건이 충분히 비상관적인 팬아웃에서는, 구성요소의 작은 이상 확률이 종단 서비스의 큰 이상 확률로 증폭된다.
- 서비스 능력의 측정 경계는 리프 요청에 그치지 않고 사용자가 기다리는 종단 요청까지 포함해야 한다.
- 꼬리 내성은 모든 변동을 제거하는 대신 복제, 취소, 분할과 적응으로 변동의 영향을 제한한다.
- 처리량·활용률을 높이는 일과 꼬리 지연을 짧게 유지하는 일은 함께 측정해야 한다.

## 인용할 만한 구절

> “predictably responsive whole out of less-predictable parts”

덜 예측 가능한 부분들로부터 예측 가능하게 응답하는 전체를 만든다. (번역)

## 위키 반영

이 자료는 [[꼬리 지연 시간]]을 평균과 분리된 서비스 성능 개념으로 정리하는 직접 근거다. [[The Datacenter as a Computer]]가 컴퓨팅의 경계를 시설과 서비스로 넓혔다면, 이 논문은 그 경계에서 구성요소의 분포가 어떻게 종단 능력으로 합성되는지를 보여준다. [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]에서는 팬아웃, 백분위, 품질·자원 조건을 함께 분석한다.

## 출처

- ACM, [DOI record](https://doi.org/10.1145/2408776.2408794)
- Google Research, [The Tail at Scale](https://research.google/pubs/the-tail-at-scale/)
- Communications of the ACM, [The Tail at Scale](https://cacm.acm.org/research/the-tail-at-scale/)
- University of Utah, [Communications of the ACM access copy](https://users.cs.utah.edu/~stutsman/cs6450/public/papers/tail-at-scale.pdf)

## 관련 항목

- [[꼬리 지연 시간]]
- [[The Datacenter as a Computer]]
- [[In-Datacenter Performance Analysis of a Tensor Processing Unit]]
- [[에너지 비례 컴퓨팅]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
- [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]
