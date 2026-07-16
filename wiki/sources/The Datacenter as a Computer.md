---
title: The Datacenter as a Computer
aliases: [Warehouse-Scale Computing, WSC book, 데이터센터를 하나의 컴퓨터로]
summary: "대규모 인터넷 서비스의 데이터센터를 독립 서버들의 모음이 아니라 하드웨어와 소프트웨어가 공동 설계된 하나의 창고 규모 컴퓨터로 다룬 2009년 저작."
tags: [type/reference, domain/computer-architecture, domain/systems, status/active]
created: 2026-07-16
updated: 2026-07-16
sources: ["The Datacenter as a Computer, 1st edition, 2009", "Google Research publication page"]
source_id: ref-041
source_kind: external
primary_sources: ["The Datacenter as a Computer, 1st edition, 2009"]
supporting_sources: ["Google Research publication page"]
source_urls: ["https://doi.org/10.2200/S00193ED1V01Y200905CAC006", "https://research.google/pubs/the-datacenter-as-a-computer-an-introduction-to-the-design-of-warehouse-scale-machines/"]
retrieved: 2026-07-16
version: "First edition, 2009"
snapshot_status: external-only
status: active
---

## 개요

[[The Datacenter as a Computer]]는 Luiz André Barroso와 Urs Hölzle가 2009년에 발표한 창고 규모 컴퓨팅(warehouse-scale computing) 입문서다. 대규모 인터넷 서비스를 운영하는 데이터센터를 독립 서버의 집합이 아니라 하나의 통합된 컴퓨터로 다뤄야 한다는 관점을 제시한다.

이 관점에서 컴퓨팅 능력의 단위는 단일 프로세서나 서버가 아니다. 수천 대의 서버, 네트워크, 저장 장치, 전력 공급과 냉각, 장애 복구, 자원 배치 소프트웨어가 하나의 서비스 목표를 위해 협력한다. 따라서 처리량과 지연 시간, 가용성, 에너지와 총소유비용을 시스템 전체 경계에서 측정해야 한다.

일반적인 데이터센터와 창고 규모 컴퓨터의 차이는 규모만이 아니다. WSC는 상대적으로 동질적인 하드웨어와 공통 관리 계층을 특정 서비스군에 맞추고, 기계 고장을 예외가 아니라 정상적인 운영 조건으로 다룬다. 개별 노드의 최고 성능보다 많은 노드의 효율적 활용과 데이터 배치가 중요해진다.

이 자료는 21세기 컴퓨팅 능력의 확장이 칩 수준 병렬성에서 시설 수준의 분산 자원으로 이어졌음을 보여준다. 동시에 시스템 경계를 넓힐수록 네트워크, 전력, 냉각, 장애와 소프트웨어 운영이 성능의 일부가 된다는 점을 강조한다.

## 주요 인사이트

- 대규모 서비스용 데이터센터는 조정된 하나의 컴퓨터로 분석할 수 있다.
- 시스템 경계에는 서버뿐 아니라 네트워크, 저장 장치, 전력과 냉각이 포함된다.
- 대규모에서는 개별 고장을 피하는 것보다 고장을 전제로 서비스를 유지하는 설계가 중요하다.
- 성능, 에너지, 가용성과 비용은 서로 분리된 최적화 목표가 아니다.
- 컴퓨팅 능력은 단일 칩 지표에서 서비스 전체의 유효 작업량으로 확장된다.

## 인용할 만한 구절

> 창고 규모 컴퓨터는 서버의 모음이 아니라 하나의 거대한 컴퓨팅 플랫폼이다.

저작의 핵심 관점을 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[컴퓨팅 능력이란 무엇인가]]의 시스템 경계를 시설과 서비스 수준으로 확장한다. [[컴퓨팅 능력의 발달사]]에서는 멀티코어 이후 병렬성이 여러 칩과 서버로 확장되고, 처리량·[[꼬리 지연 시간]]·에너지·가용성이 함께 중요한 지표가 된 흐름을 설명하는 근거다. 이 경계에서 평균과 종단 응답 분포가 달라지는 문제는 [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]에서 분석한다.

## 출처

- Morgan & Claypool, [DOI record](https://doi.org/10.2200/S00193ED1V01Y200905CAC006)
- Google Research, [publication page](https://research.google/pubs/the-datacenter-as-a-computer-an-introduction-to-the-design-of-warehouse-scale-machines/)

## 관련 항목

- [[도메인 특화 가속기]]
- [[The Tail at Scale]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
- [[꼬리 지연 시간]]
- [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]
