---
title: Cramming More Components onto Integrated Circuits
aliases: [Moore 1965, 무어의 법칙 원 논문, Cramming More Components]
summary: "Gordon Moore가 집적 회로의 최소 비용 지점에서 부품 수가 빠르게 증가할 것이라고 관찰하고 집적도의 경제적·기술적 효과를 전망한 1965년 논문."
tags: [type/reference, domain/computer-history, domain/computer-architecture, status/active]
created: 2026-07-16
updated: 2026-07-18
publication_year: 1965
historical_layer: architecture
capability_layers: [realized-performance, scalability]
sources: ["Electronics 38(8), 19 April 1965", "Carnegie Mellon University access copy", "Intel Moore's Law retrospective"]
source_id: ref-037
source_kind: external
primary_sources: ["Electronics 38(8), 19 April 1965"]
supporting_sources: ["Carnegie Mellon University access copy", "Intel Moore's Law retrospective"]
source_urls: ["https://www.cs.cmu.edu/afs/cs/academic/class/15740-f18/www/papers/moore.pdf", "https://www.intel.com/content/www/us/en/history/virtual-vault/articles/moores-law.html"]
retrieved: 2026-07-16
version: "Electronics 38(8), 19 April 1965"
snapshot_status: external-only
status: active
---

## 개요

[[Cramming More Components onto Integrated Circuits]]는 Fairchild Semiconductor의 Gordon E. Moore가 1965년 《Electronics》에 발표한 글이다. Moore는 집적 회로가 더 많은 부품을 한 칩에 넣으면서 비용, 신뢰성, 성능 면에서 이점을 얻을 것이라고 전망했다. 이 글은 훗날 [[무어의 법칙]]이라 불린 경험적 추세의 출발점이다.

논문의 핵심 변수는 단순한 트랜지스터 크기가 아니라 **부품당 비용을 최소화하는 집적 회로의 복잡도**다. 집적도가 너무 낮으면 칩 제조와 패키징의 고정비가 충분히 분산되지 않고, 너무 높으면 수율 저하가 비용을 올린다. Moore는 이 최소 비용 지점의 부품 수가 당시 해마다 약 두 배로 증가했다고 보았다.

Moore는 이 추세가 1965년 약 60개 부품에서 1975년 약 65,000개 부품으로 이어질 수 있다고 전망했다. 더 높은 집적도는 같은 기능을 더 적은 외부 연결로 구현하고, 회로 치수를 줄여 신호 이동 시간을 단축하며, 시스템 구성을 더 큰 기능 블록 중심으로 바꾸는 효과를 낳는다.

이 글은 물리 법칙이나 영구 불변의 주기를 증명한 논문이 아니다. 관측된 제조 경제성과 기술 진보를 바탕으로 한 전망이며, 이후 널리 쓰인 “18개월마다 두 배”라는 표현도 1965년 원문 그대로가 아니다. 따라서 무어의 법칙은 시대와 측정 대상, 주기를 명시해 해석해야 한다.

## 주요 인사이트

- 집적도 증가는 회로 밀도뿐 아니라 부품당 비용, 신뢰성, 성능을 함께 변화시킨다.
- 원 논문에서 두 배 증가의 대상은 최소 비용 지점의 집적 회로 부품 수다.
- Moore의 1975년 전망은 약 10년 동안의 지수적 증가를 구체적인 수치로 제시했다.
- 회로 축소는 신호 이동 거리와 시스템 구성 방식에도 영향을 준다.
- 경험적 산업 추세와 물리적 스케일링 규칙은 구분해야 한다.

## 인용할 만한 구절

> 최소 비용 지점의 복잡도는 당시 대략 해마다 두 배로 증가했다.

원문의 핵심 관찰을 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[무어의 법칙]]의 원래 범위와 후대의 단순화된 표현을 구분하는 직접 근거다. [[컴퓨팅 능력의 발달사]]에서는 집적도 증가가 범용 프로세서 성능을 떠받친 기술·경제적 배경이었다는 점과, 이것만으로 실제 응용 성능을 설명할 수 없다는 점을 함께 다룬다.

## 출처

- Carnegie Mellon University, [access copy](https://www.cs.cmu.edu/afs/cs/academic/class/15740-f18/www/papers/moore.pdf)
- Intel, [Moore's Law retrospective](https://www.intel.com/content/www/us/en/history/virtual-vault/articles/moores-law.html)

## 관련 항목

- [[무어의 법칙]]
- [[Dennard 스케일링]]
- [[컴퓨팅 능력이란 무엇인가]]
- [[컴퓨팅 능력의 발달사]]
