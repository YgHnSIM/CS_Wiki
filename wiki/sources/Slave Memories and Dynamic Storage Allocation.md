---
title: Slave Memories and Dynamic Storage Allocation
aliases: [Wilkes 1965, 초기 캐시 메모리 논문, slave memory paper]
summary: "빠른 소용량 기억장치에 최근 사용한 명령과 데이터를 자동으로 축적해 느린 주기억장치의 접근 비용을 줄이는 초기 캐시 구조를 제안한 1965년 논문."
tags: [type/reference, domain/computer-architecture, domain/computer-history, status/active]
created: 2026-07-16
updated: 2026-07-18
publication_year: 1965
historical_layer: architecture
capability_layers: [realized-performance]
sources: ["IEEE Transactions on Electronic Computers EC-14(2), 1965", "University of Cambridge access copy"]
source_id: ref-043
source_kind: external
primary_sources: ["IEEE Transactions on Electronic Computers EC-14(2), 1965"]
supporting_sources: ["University of Cambridge access copy"]
source_urls: ["https://doi.org/10.1109/PGEC.1965.264263", "https://www.cl.cam.ac.uk/teaching/2324/P56/files/wilkes1965cache.pdf"]
retrieved: 2026-07-16
version: "IEEE Transactions on Electronic Computers EC-14(2), April 1965"
snapshot_status: external-only
status: active
---

## 개요

[[Slave Memories and Dynamic Storage Allocation]]은 Maurice V. Wilkes가 1965년에 발표한 두 쪽짜리 설계 논문이다. 논문은 느리고 큰 주기억장치와 빠르고 작은 기억장치를 결합하고, 실제로 요구된 단어의 사본을 빠른 층에 자동으로 축적하면 이후 재참조의 대기 시간을 줄일 수 있다고 설명한다. 오늘날에는 이런 빠른 기억장치를 [[캐시 메모리]]라고 부른다.

논문 제목의 *slave memory*는 당시 사용된 역사적 용어다. Wilkes는 이 아이디어를 무에서 처음 발명했다고 주장하지 않고, ETL Mk-6와 Atlas 2의 선행 설계와 동료들의 제안을 언급한다. 따라서 이 문헌은 “캐시의 단독 최초 발명”보다 **현대 캐시의 핵심 메커니즘을 이른 시기에 명시적으로 정리한 기초 문헌**으로 보는 편이 정확하다.

## 작은 고속 기억장치

첫 번째 예는 32단어짜리 고속 명령 기억장치다. 주기억장치의 주소 `r`에 있는 명령은 고속 기억장치의 `r mod 32` 위치에 놓이고, 함께 저장한 태그가 현재 그 위치에 어떤 주기억장치 주소의 사본이 있는지를 식별한다. 주소와 태그가 맞으면 빠른 층에서 명령을 읽고, 맞지 않으면 주기억장치에서 읽은 뒤 해당 위치를 덮어쓴다.

이 방식은 오늘날의 직접 사상(direct-mapped) 캐시와 유사하다. 작은 반복문처럼 같은 명령을 짧은 간격으로 다시 참조하는 프로그램은 빠른 층을 반복해서 이용할 수 있다. 그러나 이점은 참조 통계에 달려 있다. 서로 다른 주소가 같은 위치를 계속 밀어내거나 재사용이 적으면 빠른 기억장치가 있어도 기대한 이득을 얻지 못한다.

이 작은 예의 쓰기에서는 해당 단어가 고속 기억장치에 있을 때 빠른 층과 주기억장치를 함께 갱신하는 방식을 설명한다. 현대 용어로는 쓰기 동시 반영(write-through)에 가까운 선택이다.

## 큰 2계층 기억장치

두 번째 예는 시분할 환경에서 큰 저속 기억장치와 더 작은 고속 기억장치를 블록 단위로 결합하는 구상이다. 프로그램이 요구한 블록을 고속 기억장치로 가져오고, 공간이 필요하면 기존 블록을 교체한다. 변경 여부를 표시하는 태그를 두어 수정된 블록만 주기억장치로 되돌릴 수 있는데, 이는 쓰기 지연(write-back)과 유사하다.

Wilkes는 빠른 층의 용량, 주소 변환, 교체할 블록의 선택, 변경된 내용의 일관성 유지가 모두 설계 문제임을 보여준다. 빠른 부품 하나를 추가하는 것만으로는 충분하지 않고, 어떤 단위를 언제 가져오고 내보낼지 정하는 정책이 실현 성능을 좌우한다.

## 주요 인사이트

- 기억장치 계층은 빠른 소용량 장치와 느린 대용량 장치의 장점을 참조 패턴을 통해 결합한다.
- 성능 이득은 반복 참조와 재사용에 달려 있으며 모든 프로그램에 자동으로 보장되지 않는다.
- 주소 사상과 태그는 빠른 층의 내용이 어느 주기억장치 위치를 대표하는지 판별한다.
- 교체 정책과 쓰기 정책은 속도뿐 아니라 데이터 일관성과 전송량을 결정한다.
- 이 논문은 설계 제안과 분석이며, 실제 시스템의 성능 벤치마크를 보고한 문헌은 아니다.

## 인용할 만한 구절

> 빠른 기억장치는 주기억장치에서 실제로 요구된 단어를 자동으로 축적하고, 다시 요구될 때 주기억장치 접근의 불이익을 피한다.

논문의 중심 메커니즘을 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[캐시 메모리]]가 단순히 “더 빠른 메모리”가 아니라 참조 패턴, 주소 사상, 교체와 쓰기 정책으로 작동하는 계층임을 설명하는 직접 근거다. [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]에서는 빠른 부품의 잠재력이 실제 프로그램의 재사용 패턴을 만날 때만 달성 성능으로 전환된다는 사례로 사용한다.

## 관계

| 관계 | 대상 | 설명 | 근거 |
|---|---|---|---|
| responds_to | [[메모리 장벽]] | ‘메모리 장벽’이라는 후대 명칭보다 앞선 제안이지만, 프로세서와 주기억장치의 속도 격차라는 같은 구조적 제약을 완화한다. | [[Slave Memories and Dynamic Storage Allocation]] |
| enables | [[캐시 메모리]] | 최근 요구된 단어를 빠른 소용량 기억장치에 유지해 계층적 기억장치의 실용 설계 공간을 연다. | [[Slave Memories and Dynamic Storage Allocation]] |

## 출처

- IEEE, [DOI record](https://doi.org/10.1109/PGEC.1965.264263)
- University of Cambridge, [access copy](https://www.cl.cam.ac.uk/teaching/2324/P56/files/wilkes1965cache.pdf)

## 관련 항목

- [[캐시 메모리]]
- [[메모리 장벽]]
- [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]
