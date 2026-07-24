---
title: Recovery-Oriented Computing (ROC)
aliases: ["Recovery-Oriented Computing: Motivation, Definition, Techniques, and Case Studies", 복구 지향 컴퓨팅, ROC]
summary: "하드웨어 고장, 소프트웨어 버그와 운영자 오류를 전제로 평균 고장 간격뿐 아니라 평균 복구 시간을 줄이는 시스템 설계를 제안한 2002년 Berkeley 기술 보고서."
tags: [type/reference, domain/systems, domain/software-engineering, status/active]
created: 2026-07-24
updated: 2026-07-24
publication_year: 2002
historical_layer: system
capability_layers: [reliable-results]
sources: ["Recovery-Oriented Computing (ROC)"]
source_id: ref-065
source_kind: external
primary_sources: ["David A. Patterson, Aaron Brown, Pete Broadwell, George Candea, Mike Chen, James Cutler, Patricia Enriquez, Armando Fox, Emre Kiciman, Matthew Merzbacher, David Oppenheimer, Naveen Sastry, William Tetzlaff, Jeongyeon Traupman, and Noah Treuhaft, Recovery-Oriented Computing (ROC): Motivation, Definition, Techniques, and Case Studies, Technical Report UCB/CSD-02-1175, 2002"]
supporting_sources: ["UC Berkeley technical report catalog", "Microsoft Research publication page", "Berkeley Digital Collections record"]
source_urls: ["https://www2.eecs.berkeley.edu/Pubs/TechRpts/2002/5574.html", "https://www2.eecs.berkeley.edu/Pubs/TechRpts/2002/Archive/CSD-02-1175.pdf", "https://www.microsoft.com/en-us/research/publication/recovery-oriented-computing-motivation-definition-principles-and-examples/?lang=ko-kr", "https://digicoll.lib.berkeley.edu/record/137942"]
retrieved: 2026-07-24
version: "Technical Report UCB/CSD-02-1175, 2002"
snapshot_status: external-only
status: active
graph_id: reference-recovery-oriented-computing
graph_visibility: public
---

## 개요

[[Recovery-Oriented Computing (ROC)]]은 Berkeley 연구진이 2002년에 발표한 기술 보고서로, 하드웨어 고장·소프트웨어 버그·운영자 오류를 예외가 아닌 운영 조건으로 보고 시스템 설계의 중심을 고장 예방만이 아니라 빠르고 안전한 복구에 두자고 제안한다.

보고서는 가용성을 높이는 방법으로 평균 고장 간격(mean time to failure)을 늘리는 접근과 평균 복구 시간(mean time to repair)을 줄이는 접근을 대비한다. 전자는 실패 자체를 줄이려 하고, 후자는 실패가 일어난 뒤 사용자에게 보이는 영향을 짧게 만들려 한다. ROC는 인터넷 서비스 사례와 여러 기법을 통해 후자의 설계 공간을 넓힌다.

이 관점은 서비스가 복잡해질수록 완벽한 예방만으로는 운영 목표를 달성하기 어렵다는 문제의식에 기반한다. 그러나 ROC가 특정 기법의 보편적 가용성 향상을 증명한 것은 아니다. 실제 효과는 고장 모형, 격리 범위, 상태 복구 절차, 사용자 품질 목표와 측정 경계에 따라 검증해야 한다.

## 주요 인사이트

- 하드웨어 고장, 소프트웨어 결함과 운영자 오류를 모두 운영 중 발생 가능한 사건으로 본다.
- 가용성 논의는 실패를 피하는 능력뿐 아니라 실패 뒤 서비스를 되돌리는 시간과 안전성을 포함해야 한다.
- 복구 성능은 재시작·재구성·격리·상태 점검처럼 운영 절차와 시스템 구조가 함께 만드는 속성이다.
- 복구를 빠르게 만들려면 탐지·진단·되돌리기·검증의 단계와 사용자 품질 영향을 구분해야 한다.
- 복구 시간을 줄이기 위한 자동화가 잘못된 상태를 빠르게 확산시키지 않도록, 실패 모형과 안전 경계를 명시해야 한다.

## 인용할 만한 구절

> “mean time to repair”

보고서는 평균 고장 간격만이 아니라 평균 복구 시간을 가용성 설계의 독립된 축으로 다룬다.

## 위키 반영

이 자료는 [[가용성과 복구]]에서 복구 시간을 별도 능력으로 설명하는 중심 근거다. [[결함 허용]]은 고장 예방·격리·복구가 같은 문제가 아니라는 점을, [[빠른 서비스는 왜 가용한 서비스를 보장하지 않는가]]는 빠른 정상 상태 응답과 실패 뒤 회복을 별도 지표로 기록해야 한다는 점을 이 자료와 연결한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| enables | [[가용성과 복구]] | 평균 고장 간격뿐 아니라 평균 복구 시간을 줄이는 설계·평가 관점을 제시한다. | [[Recovery-Oriented Computing (ROC)]] |
| broader | [[결함 허용]] | 고장을 견디는 설계를 예방, 격리와 복구 절차까지 포함하는 운영 문제로 확장한다. | [[Recovery-Oriented Computing (ROC)]] |

## 출처

- UC Berkeley, [technical report catalog](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2002/5574.html)
- UC Berkeley, [technical report PDF](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2002/Archive/CSD-02-1175.pdf)
- Microsoft Research, [publication page](https://www.microsoft.com/en-us/research/publication/recovery-oriented-computing-motivation-definition-principles-and-examples/?lang=ko-kr)
- Berkeley Digital Collections, [catalog record](https://digicoll.lib.berkeley.edu/record/137942)

## 관련 항목

- [[가용성과 복구]] — 복구 시간과 서비스 품질의 회복을 측정하는 개념을 정리한다.
- [[결함 허용]] — 예방·격리·중복·복구가 결합되는 시스템 설계를 설명한다.
- [[Why Do Internet Services Fail and What Can Be Done About It]] — 실제 서비스 장애 관찰에서 운영자·설정 오류와 복구 시간을 다룬다.
- [[빠른 서비스는 왜 가용한 서비스를 보장하지 않는가]] — 정상 상태의 속도와 장애 상태의 회복을 한 지표로 환원하지 않는 분석이다.
