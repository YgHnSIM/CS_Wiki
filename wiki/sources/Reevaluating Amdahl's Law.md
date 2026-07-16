---
title: Reevaluating Amdahl's Law
aliases: [Gustafson 1988, Gustafson's law paper, Gustafson-Barsis law, 구스타프슨 법칙 논문]
summary: "고정된 문제를 더 빨리 푸는 대신 병렬 자원에 맞춰 문제 크기를 늘리면 같은 시간에 더 많은 계산을 수행할 수 있다는 확대 크기 가속 관점을 제시한 1988년 논문."
tags: [type/reference, domain/computer-architecture, domain/computer-history, status/active]
created: 2026-07-16
updated: 2026-07-16
sources: ["Communications of the ACM 31(5), 1988", "Carnegie Mellon University access copy", "John L. Gustafson author retrospective"]
source_id: ref-045
source_kind: external
primary_sources: ["Communications of the ACM 31(5), 1988"]
supporting_sources: ["Carnegie Mellon University access copy", "John L. Gustafson author retrospective"]
source_urls: ["https://doi.org/10.1145/42411.42415", "https://course.ece.cmu.edu/~ece600/fall16/references/gustafson.pdf", "https://www.johngustafson.net/glaw.html"]
retrieved: 2026-07-16
version: "Communications of the ACM 31(5), May 1988, pp. 532–533"
snapshot_status: external-only
status: active
---

## 개요

[[Reevaluating Amdahl's Law]]은 John L. Gustafson이 1988년 《Communications of the ACM》에 발표한 짧은 논문이다. [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]에서 유래한 암달의 고정 문제 크기 가속 관점이 당시의 대규모 병렬 과학 계산을 충분히 설명하지 못한다고 주장하고, 실행 시간을 일정하게 두면서 병렬 부분의 문제 크기를 늘리는 확대 크기 가속(scaled speedup)을 제시한다.

논문의 출발점은 Sandia National Laboratories의 1024프로세서 하이퍼큐브였다. Gustafson은 병렬 실행 시간 기준의 순차 비율이 약 0.4–0.8%인 빔 응력 분석, 표면파 시뮬레이션, 불안정 유체 흐름의 세 응용에서 각각 1021배, 1020배, 1016배의 가속을 달성했다고 보고했다. 이 수치는 대규모 병렬성이 불가능하다는 보편적 결론에 대한 반례로 제시됐지만, 세 과학 계산과 당시의 시스템·측정 방식에 한정된 결과다.

## 암달의 고정 크기 모델

Gustafson은 암달의 법칙을 먼저 다음과 같이 정리한다. `N`은 프로세서 수, `s`와 `p`는 직렬 프로세서에서 각각 순차 부분과 병렬화 가능한 부분에 드는 시간이며 `s + p = 1`이다.

`S_fixed(N) = (s + p) / (s + p/N) = 1 / (s + p/N)`

이 모델은 전체 작업량을 고정하고 병렬 부분만 `N`개 프로세서에 나눌 때 실행 시간이 얼마나 줄어드는지를 묻는다. `N`이 커져도 `s`는 줄지 않으므로 순차 부분이 고정 크기 가속의 상한을 만든다.

## 확대 크기 모델

Gustafson은 실제 사용자가 더 강한 컴퓨터를 얻으면 같은 문제를 반복하기보다 격자 해상도, 시간 단계 수와 연산자의 복잡도를 늘리는 경우가 많다고 보았다. 따라서 문제 크기보다 병렬 시스템의 실행 시간을 일정하게 놓는 편이 현실적일 수 있다고 주장했다.

병렬 시스템에서 측정한 순차 시간과 병렬 시간을 `s'`, `p'`라 하고 `s' + p' = 1`로 정규화한다. 병렬 부분의 총 작업이 프로세서 수에 비례해 늘어난다고 가정하면, 같은 큰 문제를 직렬 프로세서 한 개로 수행할 가상 시간은 `s' + Np'`다. 원문은 이 대안식을 Sandia의 E. Barsis가 제안했다고 밝히므로 Gustafson–Barsis 법칙이라고도 부른다.

`S_scaled(N) = s' + Np' = N + (1 - N)s' = N - (N - 1)s'`

이 값은 같은 입력의 실행 시간이 몇 배 줄었는지가 아니라, 같은 병렬 실행 시간에 처리한 확대된 작업량을 직렬 실행과 비교한 비율이다. 이때 직렬 기준선은 확대된 문제의 병렬 작업을 프로세서 한 개가 차례로 수행한다고 구성한 가상 시간이지, 논문에서 직접 실행한 작은 원래 문제의 시간이 아니다. 순차 시간이 거의 일정하고 병렬 작업만 자원 수에 맞춰 늘면 프로세서 수에 가까운 확대 크기 가속이 가능하다.

## 두 모델의 관계

두 식은 같은 질문에 상반된 답을 주는 법칙이 아니다. 암달 모델은 **문제 크기를 고정**하고 시간을 줄이며, Gustafson 모델은 **병렬 실행 시간을 고정**하고 문제 크기를 키운다. 또한 `s`는 직렬 실행 시간에서 순차 부분이 차지하는 비율이고, `s'`는 병렬 실행 시간에서 측정한 순차 비율이므로 두 기호를 같은 값처럼 대입하면 안 된다.

Gustafson은 원문에서 암달 식의 오용이 대규모 병렬성에 대한 심리적 장벽을 만들었다고 강하게 비판했다. 저자의 후대 설명은 확대 크기 모델이 암달의 수학을 반박한다기보다, 암달이 둔 고정 문제 크기 가정이 사람들이 병렬 컴퓨터를 사용하는 방식과 맞지 않을 수 있다는 관찰이라고 정리한다.

## 가정과 한계

- 순차 시작 비용, 프로그램 적재, 입출력과 병목 시간이 문제 크기가 커져도 거의 일정하다고 가정한다.
- 병렬 또는 벡터 부분의 작업량이 프로세서 수에 거의 선형으로 비례해 늘어난다는 첫 근사를 사용한다.
- 통신, 동기화, 메모리와 입출력 비용이 문제 크기와 함께 증가하면 이상적인 확대 크기 가속보다 낮아진다.
- 모든 작업이 더 큰 입력이나 높은 해상도에서 추가 가치를 얻는 것은 아니다.
- 논문의 세 응용 결과는 대규모 병렬성의 가능성을 보여주는 사례이지 모든 프로그램의 확장성을 보장하지 않는다.
- 두 쪽짜리 논문은 세 응용의 상세 측정 절차를 별도의 Sandia 보고서에 맡기므로 수치를 다른 작업으로 일반화하기 어렵다.

## 주요 인사이트

- 병렬 가속을 말하려면 먼저 문제 크기와 실행 시간 중 무엇을 고정했는지 밝혀야 한다.
- 고정 크기 가속과 확대 크기 가속은 서로 다른 컴퓨팅 능력을 측정한다.
- 확대 크기 가속은 같은 문제의 지연 시간 감소가 아니라 같은 시간에 수행한 더 큰 계산의 비율이다.
- 순차 비율은 어느 실행을 분모로 삼았는지에 따라 값과 의미가 달라진다.
- 자원 증가가 가치 있는 문제 규모 증가로 이어질 수 있을 때 병렬 컴퓨팅의 능력은 속도 이상으로 확장된다.

## 인용할 만한 구절

> 병렬 가속은 문제 크기를 고정할 때와 자원 수에 맞춰 키울 때 서로 다른 질문이 된다.

논문의 두 모델을 한국어로 요약한 문장이다.

## 위키 반영

이 자료는 [[병렬 확장성]]을 자원 수와 가속비 하나로 설명하지 않고 고정한 조건에 따라 나누는 직접 근거다. [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]에서는 암달과 Gustafson을 승패 관계가 아니라 고정 작업량과 고정 시간이라는 두 반사실적 비교로 해석한다.

## 출처

- ACM, [DOI record](https://doi.org/10.1145/42411.42415)
- Carnegie Mellon University, [access copy](https://course.ece.cmu.edu/~ece600/fall16/references/gustafson.pdf)
- John L. Gustafson, [Gustafson's Law](https://www.johngustafson.net/glaw.html)

## 관련 항목

- [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]
- [[병렬 확장성]]
- [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]
