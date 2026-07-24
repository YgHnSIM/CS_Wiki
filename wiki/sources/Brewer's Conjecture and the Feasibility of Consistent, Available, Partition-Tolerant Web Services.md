---
title: "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"
aliases: [CAP 원 논문, Gilbert Lynch 2002, CAP theorem paper]
summary: "비동기 네트워크 분할 모형에서 원자적 일관성, 가용성, 분할 허용성을 동시에 보장할 수 없음을 보인 Gilbert와 Lynch의 2002년 CAP 정리 논문."
tags: [type/reference, domain/computer-science, domain/distributed-systems, domain/systems, status/active]
created: 2026-07-25
updated: 2026-07-25
publication_year: 2002
historical_layer: theory
capability_layers: [scalability, reliable-results]
sources: ["Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"]
source_id: ref-087
source_kind: external
primary_sources: ["Seth Gilbert and Nancy Lynch, Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services, SIGACT News 33(2), 2002, pp. 51–59"]
supporting_sources: ["Princeton COS 418 course copy of the paper PDF", "ACM DOI record"]
source_urls: ["https://www.cs.princeton.edu/courses/archive/fall19/cos418/papers/cap.pdf", "https://doi.org/10.1145/564585.564601"]
retrieved: 2026-07-25
version: "SIGACT News 33(2), 2002, pp. 51–59"
snapshot_status: external-only
status: active
graph_id: reference-cap-feasibility
graph_visibility: public
---

## 개요

[[Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services]]는 Seth Gilbert와 Nancy Lynch가 2002년에 발표한 논문으로, 네트워크가 비동기적이고 메시지가 임의로 유실될 수 있는 분할 모형에서 원자적 일관성(atomic consistency), 가용성, 분할 허용성을 동시에 만족하는 구현이 없음을 보인다. 이 결과는 통상 [[CAP 정리]]라 불린다.

논문에서 원자적 일관성은 선형화 가능성(linearizability)으로 설명된다. 각 연산은 호출과 응답 사이의 한 시점에 일어난 것처럼 보이고, 실제 시간 순서를 보존해야 한다. 가용성은 고장 나지 않은 노드에 도착한 요청이 결국 응답을 받는 성질이며, 응답 시간이 어떤 상한 안에 들어야 한다는 뜻은 아니다. 분할 허용성은 메시지 유실 때문에 네트워크가 임의로 갈라질 수 있는 모형을 뜻한다.

## 결과의 해석 경계

이 논문은 흔히 “세 가지 중 둘을 고른다”는 고정 메뉴로 요약되지만, 그 표현은 너무 거칠다. 핵심은 **분할이 존재하는 동안** 해당 모형의 원자적 일관성과 가용성을 동시에 보장할 수 없다는 불가능성이다. 분할이 없을 때의 지연, 재시도, 복제 지연, 사용자 SLO를 직접 산출하지는 않는다.

또한 이 논문의 가용성은 운영 대시보드의 월간 가동률이나 “99.9% uptime”과 같은 측정값과 다르다. 어떤 요청·노드·응답 의미를 가정하는지, 분할을 감지할 수 있는지, 일관성을 얼마나 약화하는지가 먼저 고정돼야 한다. 이 때문에 CAP은 서비스 성적표가 아니라 복제된 상태 변경의 설계 가정을 점검하는 이론적 경계로 읽어야 한다.

## 분산 서비스에 주는 질문

분할 중에 쓰기 요청을 즉시 성공으로 응답시키는 정책은 원자적 일관성을 약화할 수 있고, 원자적 일관성을 지키기 위해 정족수나 리더와의 통신을 기다리는 정책은 일부 요청을 끝없이 대기시키거나 실패로 돌려야 할 수 있다. 어떤 선택도 자동으로 “더 좋은 가용성”을 뜻하지 않는다. 사용자가 허용하는 오래된 읽기, 충돌 해결, 거부·재시도, 데이터 손실·중복의 의미를 명시해야 한다.

[[복제 로그와 합의]]는 정지·재시작을 중심으로 한 합의 프로토콜이 어떤 상태 순서를 유지하는지 설명하고, [[외부 일관성과 시간 불확실성]]은 전역 순서가 필요할 때 시간 불확실성과 대기 비용을 어떻게 드러내는지를 보강한다. 둘 모두 CAP의 세 단어를 실제 시스템의 완전한 설계 명세로 바꾸지 않는다.

## 인용할 만한 구절

> “consistent, available, partition-tolerant web services”

논문 제목의 세 성질은 구호가 아니라, 명시된 네트워크 모형 아래 함께 만족할 수 있는지를 묻는 형식적 대상이다.

## 위키 반영

이 자료는 [[CAP 정리]]에서 원자적 일관성·가용성·분할 허용성의 정의와 해석 경계를 직접 뒷받침한다. [[분산 서비스는 빠른 응답과 같은 상태를 어떻게 함께 보장하는가]]에서는 꼬리 지연·운영 가용성 지표가 CAP의 이론적 가용성과 다른 이유를 설명하는 출발점으로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[CAP 정리]] | 비동기 네트워크 분할 모형에서 원자적 일관성과 가용성을 동시에 보장할 수 없다는 정리를 제공한다. | [[Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services]] |
| constrains | [[가용성과 복구]] | 서비스 가용성 주장을 복제 상태의 일관성·분할·응답 의미와 분리하지 않도록 이론적 경계를 제공한다. | [[Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services]] |

## 출처

- Princeton COS 418, [paper PDF](https://www.cs.princeton.edu/courses/archive/fall19/cos418/papers/cap.pdf)
- ACM, [DOI: 10.1145/564585.564601](https://doi.org/10.1145/564585.564601)

## 관련 항목

- [[CAP 정리]] — 원 논문의 성질과 운영 지표를 구분해 해석한다.
- [[복제 로그와 합의]] — 정지 장애 모형에서 상태 순서를 맞추는 프로토콜 층을 다룬다.
- [[가용성과 복구]] — 사용자 품질과 탐지·복구 시간을 운영적으로 측정한다.
- [[분산 서비스는 빠른 응답과 같은 상태를 어떻게 함께 보장하는가]] — 이론적 경계와 서비스 지연·복구 비용을 종합한다.
