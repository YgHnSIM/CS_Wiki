---
title: 위키 개요
aliases: [overview, 홈페이지, 전체 개요]
summary: "CS Wiki의 지식 범위, 검증 상태, 핵심 주제와 웹 탐색 방법을 한눈에 보여주는 홈페이지."
tags: [type/meta, status/active]
created: 2026-05-03
updated: 2026-07-20
sources: []
status: active
---

## 현재 상태

이 위키는 컴퓨터 과학과 컴퓨팅사 지식을 원본 소스 기반으로 정리한다. 현재 정규 소스는 6개 묶음, 참고 자료는 60개이며, 주요 주제는 수학 표와 인간 계산 조직, 검산과 수치 결과 계약, 19세기 기계식 계산 장치에서 계산 가능성과 계산 복잡도, 범용성과 프로그래밍 가능성, 기계 계산의 이론적 의미, 20세기 초기 저장 프로그램 컴퓨터의 계보, 로더, 어셈블러, 서브루틴, 스택 기반 호출 구조, `goto`와 구조적 프로그래밍, Fortran과 컴파일러, Unix와 C, 서브루틴 라이브러리와 API적 사고, 소프트웨어 재사용의 역사, 집적도·소자 축소에서 캐시·RISC와 메모리 장벽, 부동소수점 표준화와 수치 정확성, 고정 크기와 확대 크기의 병렬 확장, 장기 환산 계산량/에너지·부하별 전력·활성 면적으로 나뉜 전력 장벽, 팬아웃과 꼬리 지연을 포함한 서비스 성능, 분산·도메인 특화 구조로 이어진 컴퓨팅 능력의 발달, 논리 회로와 이진 표현, 디지털 데이터 표현과 메모리 안전성, 그리고 유니코드 기반 텍스트 인코딩 심화로 이어지는 컴퓨팅 개념의 형성이다.


<!-- wiki-maintenance: status-summary -->
운영 상태: 전체 222개 페이지 중 active 192개, draft 30개, review 0개, archived 0개다.

## 웹 탐색 구조

웹사이트는 정규 소스와 참고 자료를 분리하고, 개념·인물·분석 문서를 자료 유형별로 탐색할 수 있게 구성한다. 검색은 제목뿐 아니라 별칭, 태그, 본문, 출처 ID를 함께 대상으로 삼고, 자료 유형과 검증 상태 필터를 제공한다. 빌드는 [[지식 그래프 관계 스키마]]에 따라 본문 언급, 관련 항목, 근거, 학습 순서와 편집 관계를 하나의 정규화 데이터로 만든다. 각 지식 문서에는 직접 이웃을 최대 12개로 압축한 1홉 관계 지도와 관계 문장 해설기가 있으며, 전체 이웃은 대표 관계별 목록에서 빠짐없이 탐색할 수 있다. 지식 지도의 두 문서 연결 탐색기는 임의의 출발·도착 문서 사이에서 최대 세 경로를 찾아 각 중간 문서, 관계 이유와 기록 방향을 설명한다. 학습 노선 지도는 17개 경로의 고유 문서 168개를 순서가 있는 역으로, 여러 경로에 등장하는 52개 문서를 환승역으로 보여 준다. 역을 선택하면 그 문서를 공유하는 모든 노선이 동시에 켜지고 같은 역을 유지한 채 다른 질문으로 갈아탈 수 있다.

전체 의미 지도는 218개 공개 문서를 처음부터 한 화면에 흩뿌리지 않고 8개 의미 군집과 20개 군집 회랑으로 압축한다. 군집을 열면 그 안의 문서와 경계 맥락, 회랑을 열면 실제 문서 관계와 방향·종류·본문 문맥, 문서를 열면 1·2홉 이웃을 단계적으로 불러온다. Canvas와 같은 내용을 텍스트 목록으로 함께 제공하고 군집별 정적 주소에 모든 문서 링크를 보존한다. 새 문서는 공개 범위와 첫 도메인 태그에 따라 의미 지도·검색·군집 통계에 자동으로 들어가며, `context` 문서는 전역 탐색에서 제외하고 공개 문서와 직접 연결된 초점 맥락에서만 보여 준다. 문서별 초점 조각을 따로 생성하므로 전체 문서 수가 늘어나도 한 요청의 크기는 제한된다.

역사·인과 렌즈는 같은 218개 공개 문서를 연도 목록이 아니라 **한계 → 대응 → 새 능력 → 다음 제약**의 변화로 읽게 한다. 현재 원전 대조로 연도가 기록된 문서는 36개이고, 그중 사건 시점을 가진 문서 8개와 출판 시점을 가진 문서 28개를 1800년 이전부터 2015년 이후까지 여덟 시대에 배치한다. 연도를 확인하지 못한 182개는 제목이나 작성일로 추정하지 않고 별도 `연도 미상` 시대에 보존한다. 편집자가 직접 기록한 `responds_to`, `enables`, `precedes`, `constrains`만 합성한 검토 전환은 17개이며 완전 전환 9개와 부분 전환 8개를 구분해 보여 준다.

아홉 시대는 10개 정적 조각으로 제공된다. 한 조각은 최대 120개 문서와 96개 전환 요약만 담고, 첫 화면은 manifest와 시대별 대표 문서만 받는다. 직접 선택은 안정 ID를 해시한 최대 96레코드 조회 버킷 하나와 해당 시대 조각만 불러오며, 전체 검색도 네 개의 작은 버킷을 병렬로 읽는다. 전환 하나가 관계를 매우 많이 가져도 시대 조각에는 최대 6개 대표 간선·32KiB 요약만 두고, 전체 관계는 최대 48레코드·64KiB 상세 쪽으로 나눠 사용자가 한 쪽씩 지연 로드한다. 새 공개 문서는 자동으로 정확히 한 시대에 들어가며 역사 메타데이터가 없으면 `연도 미상`·`층위 미분류`에 안전하게 수용된다. 시대 문서나 고차수 관계가 늘면 새 정적 조각만 생기므로 한 번의 요청과 화면 표시량은 전체 문서 수와 함께 커지지 않는다.

근거 계보 렌즈는 152개 공개 지식 문서, 66개 정규 소스·참고 자료와 558개 문서–근거 연결을 **원자료·재현 정보 → 정규 소스·참고 자료 → 지식 문서·검토 관계**의 3레일로 펼친다. 프론트매터 `sources`는 문서 전체의 등록 근거 묶음으로, 설명과 직접 근거가 붙은 편집 관계 39개는 별도의 검토 관계로 구분한다. 근거 수를 신뢰도·진실도 점수로 만들지 않고, 같은 자료를 쓰는 문서도 공통 자료를 등록했다는 사실만 보여 준다. 근거 문서의 로컬 원본 6개, 보존 스냅샷 7개, 외부 링크 의존 53개는 품질 순위가 아니라 재현 조건으로 표시한다.

첫 화면은 전체 문서–근거 행렬을 받지 않는다. 직접 조회, 제목·별칭 앞 2–4글자 prefix 검색, 문서·관계 초점과 근거 역색인은 모두 레코드 수와 64KiB 상한을 가진 조각으로 나뉜다. 문서나 자료 하나가 수백·수천 연결을 가져도 미리보기는 최대 8개·32KiB, 전체 상세는 최대 48레코드·64KiB씩만 제공한다. 정적 화면의 자료·하류 문서·검토 관계도 12개씩 나뉘고 쪽 이동은 현재 주변과 양 끝만 표시해 연결 수의 제곱으로 HTML이 커지지 않는다. 모든 공개 문서·자료·검토 관계에는 정적 주소와 실제 문서 링크가 있어 자바스크립트 없이도 계보와 다음 쪽을 읽을 수 있다. 직접 사용된 `context` 자료는 해당 초점의 정적 주소에서만 따라가며 전역 검색·통계·사이트맵에는 나타나지 않는다. 새 공개 문서와 자료는 별도 목록 편집 없이 자동 편입되고, 문서 수가 늘면 조각 수만 늘어난다.

처음 읽는 사용자는 17개의 학습 경로에서 컴퓨팅의 기원, 계산 가능성, 저장 프로그램 컴퓨터, 초기 소프트웨어, 구조적 프로그래밍, Fortran과 컴파일러, Unix와 C, 재사용과 API, 논리 회로, 유니코드, 컴퓨팅 능력 발달, 범용 기계와 프로그래밍 가능성, 더 빠른 프로세서의 조건, 부동소수점 성능과 정확성, 병렬 확장성의 두 질문, 전력 장벽과 에너지 효율, 서비스 성능과 꼬리 지연을 순서대로 따라갈 수 있다. [[컴퓨팅 능력 독서 지도]]는 이 경로들을 빠른 진입, 핵심 분석 시리즈와 일곱 층위별 원전 심화로 다시 조합해 중복 없이 읽게 한다. 개별 문서의 근거 추적 영역은 문서 단위 근거와 자료 페이지가 기록한 원자료 및 보조·접근 자료, 원본 보존 상태와 원문 URL을 한 흐름으로 연결한다.

## 주요 주제

### 컴퓨팅의 기원

[[컴퓨팅의 기원 - 배비지와 러브레이스]]는 19세기의 계산 자동화, 범용 프로그램 가능성과 기호 조작의 출발점을 다룬다. [[The History of Mathematical Tables: From Sumer to Spreadsheets]]는 그보다 앞선 계산 결과의 저장·배포를, [[인간 계산자]]는 반복 산술을 작업표·[[검산]]·편집으로 조직한 노동 체계를 보강한다. 이 주제의 핵심 페이지는 [[수학 표]], [[인간 계산자와 계산 공장]], [[수학 표의 검산에서 수치 결과 계약으로]], [[찰스 배비지]], [[에이다 러브레이스]], [[차분 기관]], [[해석 기관]], [[유한 차분법]], [[알고리즘적 사고]], [[기호 조작]]이다.

### 인간 계산자와 계산 조직

[[The computation factory: de Prony's project for making tables in the 1790s]]와 [[Prehistory: The Math Tables Project]]는 대규모 계산이 문제 설계, 작업 분해, 반복 연산, 검산, 편집·출판과 배포의 생산 체계였음을 보여준다. [[Human Computer Project]]는 이 체계의 여성 노동과 ENIAC 운영·프로그래밍으로 이어진 일부 경로를 복원하며, [[Standards Eastern Automatic Computer]]는 같은 NBS에서 수학 표와 수치 알고리즘이 저장 프로그램 기계의 작업으로 이어진 사례를 제공한다. 핵심 분석은 이를 사람의 단순 교체가 아니라 계산 노동의 단위와 책임 경계가 재배치된 역사로 읽는다.

### 검산과 신뢰 가능한 결과

인쇄 표에서는 산술·전사·조판 오류를 독립 재계산과 교정으로 찾았고, 배비지는 계산 결과를 활자에 직접 연결해 오류 접점을 줄이려 했다. Mathematical Tables Project는 검산을 조직의 역할과 작업 경로에 넣었다. [[DLMF Standard Reference Tables on Demand]]는 이 흐름을 사용자 지정 정밀도, 보증된 오차 경계와 자동 비교로 확장한다. 핵심 분석은 자동화가 오류를 없앤 것이 아니라 오류 경계를 프로그램·입력·반올림·판본으로 이동시켰으며, 신뢰가 명시적인 결과 계약에 달리게 됐음을 보여준다.

### 계산 가능성과 기계 계산

[[On Computable Numbers with an Application to the Entscheidungsproblem]]와 [[An Unsolvable Problem of Elementary Number Theory]]는 "기계가 계산한다"는 말을 형식화하는 이론적 축이다. 이 주제는 [[계산 가능성]], [[튜링 기계]], [[보편 튜링 기계]], [[정지 문제]], [[Entscheidungsproblem]], [[처치-튜링 논제]]를 통해 계산 가능한 절차와 계산 불가능한 문제의 경계를 정리한다. 핵심 분석은 [[기계가 계산한다는 말의 이론적 의미]]에 모았다.

### 저장 프로그램 컴퓨터의 계보

[[First Draft of a Report on the EDVAC]]와 [[The Manchester Small Scale Experimental Machine - The Baby]]는 [[저장 프로그램 컴퓨터]]의 최초성 기준을 정밀하게 나누는 데 쓰인다. [[EDVAC]]은 설계와 문서화, [[폰 노이만 구조]]는 논리 구조의 표준 이름, [[Manchester Baby]]는 저장 프로그램 실행 증명, [[EDSAC]]은 실용적 운영의 사례로 정리된다. [[Cambridge Computer Laboratory - The History of the Computer Lab]]는 EDSAC I과 마이크로프로그램 방식의 후속 EDSAC II를 구분한다. 이 구분은 [[저장 프로그램 개념의 여러 기원]]과 [[EDSAC은 무엇의 최초인가]]에서 분석한다.

### 초기 소프트웨어

[[초기 소프트웨어의 탄생]]과 [[EDSAC과 Initial Orders]]는 [[EDSAC]]을 중심으로 [[저장 프로그램 컴퓨터]], [[Initial Orders]], [[부트스트랩]], [[로더]], [[어셈블러]], [[자기 수정 코드]], [[재배치]], [[링커]]가 어떻게 초기 소프트웨어의 계층을 형성했는지 다룬다. 이 주제는 [[소프트웨어 공학]]의 역사적 기원을 이해하는 핵심 축이다.

### 서브루틴과 호출 구조

[[서브루틴과 스택(Stack)의 원리]]와 [[폐쇄형 서브루틴과 Wheeler Jump]]는 [[서브루틴]]의 본질을 [[복귀 주소]] 관리 문제로 설명한다. [[Wheeler Jump]]는 스택 없는 환경에서 복귀 점프를 만들어낸 초기 기법이고, [[스택]]과 [[스택 프레임]]은 중첩 호출과 재귀 호출을 가능하게 한 다음 단계로 정리된다.

### goto와 구조적 프로그래밍

[[A Case against the GO TO Statement]], [[Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules]], [[Structured Programming]], [[Structured Programming with go to Statements]]는 [[GOTO 문]]과 [[구조적 프로그래밍]]의 논쟁을 정리하는 참고 자료다. 이 축은 [[제어 흐름]], [[제어 구조]], [[구조화 프로그램 정리]], [[단계적 정제]]를 통해, 기계적 점프가 고급 언어에서 사람이 추적 가능한 실행 구조로 정리되는 과정을 다룬다. 핵심 분석은 [[goto와 점프에서 구조적 프로그래밍으로]]에 모았다.

### 서브루틴 라이브러리와 API

[[The Preparation of Programs for an Electronic Digital Computer]]는 EDSAC의 서브루틴 체계를 [[라이브러리]], [[라이브러리 카탈로그]], [[API]], [[자동 프로그래밍]], [[포스트모템 루틴]]으로 확장해 보여준다. [[서브루틴 라이브러리에서 API로]]는 내부 구현을 모두 알지 않아도 문서화된 명세와 호출 규약을 통해 루틴을 사용할 수 있었다는 점을 현대 API의 전사로 분석한다.

### 계산 결과와 실행 절차의 재사용

[[계산 결과에서 실행 가능한 절차로]]는 [[수학 표]]에 저장된 계산 결과, 라이브러리의 실행 절차, [[저장 프로그램 컴퓨터]]의 명령과 [[캐시 메모리]]의 사본을 비교한다. 이들을 하나의 직접 계보로 동일시하지 않고, 무엇을 언제 저장하고 다시 사용하느냐에 따라 계산 시간·공간·노동과 신뢰 비용이 다른 층으로 이동한다는 공통 질문으로 묶는다.

### 소프트웨어 재사용

[[Mass Produced Software Components]], [[On the Criteria To Be Used in Decomposing Systems into Modules]], [[Software Reuse]], [[Sixteen Questions about Software Reuse]]는 [[소프트웨어 재사용]]이 서브루틴 보관을 넘어 컴포넌트 제품군, [[모듈화]], [[정보 은닉]], 추상화, 검색, 특수화, 조직적 실천의 문제로 확장되는 과정을 다룬다. 이 축은 [[소프트웨어 컴포넌트]], [[더글러스 매킬로이]], [[데이비드 파나스]], [[찰스 W. 크루거]]를 통해 정리하며, 핵심 분석은 [[소프트웨어 재사용의 역사]]에 모았다.

### Fortran과 컴파일러

[[FORTRAN Automatic Coding System for the IBM 704 EDPM]], [[The FORTRAN Automatic Coding System]], [[The History of FORTRAN I, II, and III]]는 [[Fortran]]을 고급 언어와 [[컴파일러]]가 결합된 시스템으로 정리하는 참고 자료다. 이 축은 [[IBM 704]], [[소스 프로그램]], [[목적 프로그램]], [[컴파일러 최적화]], [[존 배커스]]를 통해, 사람이 쓰는 수학적 표기가 실행 가능한 기계어 프로그램으로 바뀌는 과정을 다룬다. 핵심 분석은 [[Fortran과 컴파일러]]에 모았다.

### Unix와 C

[[The UNIX Time-Sharing System]], [[The Development of the C Language]], [[The Evolution of the Unix Time-sharing System]], [[Portability of C Programs and the UNIX System]]는 [[Unix]]와 [[C 언어]]가 함께 형성된 과정을 정리하는 참고 자료다. 이 축은 [[데니스 리치]], [[켄 톰프슨]], [[PDP-11]], [[운영체제]], [[파일 시스템]], [[시스템 호출]], [[유닉스 파이프]], [[시스템 프로그래밍]], [[이식성]]을 통해 운영체제와 언어가 서로를 강화한 과정을 다룬다. 핵심 분석은 [[Unix와 C]]에 모았다.

### 범용 기계와 프로그래밍 가능성

[[프로그래밍 가능성]]은 계산 절차를 물리적 기계의 재설계 없이 표현·변경·실행·재사용할 수 있는 정도를 다룬다. [[범용성은 어떻게 컴퓨팅 능력이 되었는가]]는 [[해석 기관]]과 보편 기계의 개념, 저장 프로그램, EDSAC의 로더·라이브러리, Fortran의 컴파일러와 Unix/C의 이식 가능한 운영 환경을 하나의 변화로 연결한다. 핵심은 범용성이 처음부터 완성된 속성이 아니라 기계에 새 계산을 부여하고 축적된 소프트웨어를 다음 기계로 옮기는 비용을 낮춘 계층의 역사라는 점이다.

### 더 빠른 프로세서의 조건

[[Slave Memories and Dynamic Storage Allocation]]은 [[캐시 메모리]]의 효과가 빠른 기억장치 자체보다 프로그램의 재참조 패턴, 주소 사상·교체·쓰기 정책에 달려 있음을 보여준다. [[Design and Implementation of RISC I]]은 [[축소 명령어 집합 컴퓨터|RISC]]를 단순한 명령어 수의 축소가 아니라 VLSI 제약에서 ISA·레지스터·컴파일러와 메모리 사이에 복잡성을 재배분한 설계로 설명한다. [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]는 두 흐름을 직접 계보로 묶지 않고, 작업 부하·컴파일러·ISA·마이크로아키텍처·메모리 계층이 하드웨어 잠재력을 달성 성능으로 바꾸는 조건으로 종합한다.

### 병렬 확장성의 두 질문

[[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]에서 유래한 암달의 고정 크기 모델은 같은 문제의 실행 시간이 순차 부분 때문에 어떻게 포화하는지 묻는다. [[Reevaluating Amdahl's Law]]의 확대 크기 모델은 실행 시간을 고정하고 병렬 자원에 맞춰 문제 규모를 키울 때 같은 시간에 얼마나 더 큰 계산을 수행하는지 묻는다. [[병렬 확장성]]은 두 모델의 고정 조건과 순차 비율의 분모를 구분하며, [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]는 시간 단축과 문제 규모 확대를 서로 다른 컴퓨팅 능력으로 분석한다.

### 전력 장벽과 에너지 효율

[[Implications of Historical Trends in the Electrical Efficiency of Computing]]은 1946–2009년 최고 부하의 환산 계산량/에너지 장기 추세를, [[The Case for Energy-Proportional Computing]]은 실제 서버의 유휴–첨두 전력 곡선을, [[Dark Silicon and the End of Multicore Scaling]]은 고정 전력 칩의 동시 활성 면적을 각각 다룬다. [[Koomey의 법칙]], [[에너지 비례 컴퓨팅]]과 [[다크 실리콘]]은 이 세 측정 경계를 분리하며, [[전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가]]는 성능 향상이 높은 클럭에서 작업당 에너지·부하 관리·선택적 활성화의 공동 문제로 이동한 과정을 분석한다.

### 부동소수점 성능과 정확성

[[What Every Computer Scientist Should Know About Floating-Point Arithmetic]]은 유한 정밀도 표현, 반올림, 상쇄와 시스템 지원을 1991년의 IEEE 754-1985 맥락에서 설명하고, [[IEEE 754-2019 Standard for Floating-Point Arithmetic]]은 현행 표준의 공개 범위와 진행 중인 P754 개정 상태를 구분한다. [[부동소수점 정확성]]은 정확한 반올림, 비트 재현성, 수치 오차와 과업 검증을 서로 다른 계약으로 정리한다. [[더 빠른 계산은 같은 답을 내는가]]는 컴파일러·병렬 실행이 연산 순서를 바꿀 때 LINPACK·SPEC의 검증을 통과한 성능만 같은 계산의 향상으로 셀 수 있음을 분석한다.

### 서비스 성능과 꼬리 지연

[[The Datacenter as a Computer]]는 성능의 경계를 칩과 서버에서 창고 규모 서비스로 넓히고, [[The Tail at Scale]]은 드문 구성요소 지연이 모든 응답을 기다리는 큰 팬아웃에서 흔한 서비스 지연으로 증폭되는 원리를 보여준다. [[꼬리 지연 시간]]은 평균과 백분위, 리프와 종단, 처리량과 기한 초과를 구분한다. [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]는 복제·여유 용량·결과 생략이 지연을 줄이는 대신 자원·에너지·품질과 교환되는 과정을 분석한다.

### 컴퓨팅 능력과 성능 측정

[[컴퓨팅 능력의 발달사]]는 기계 이전의 계산 조직과 배포 인프라를 출발점으로 추가해, 장치의 연산률만이 아니라 작업 분해·검산·출판 가능성도 각 시대의 계산 능력을 규정했다는 관점을 제시한다.

[[컴퓨팅 능력이란 무엇인가]]는 컴퓨팅 능력을 계산 가능성, 알고리즘 복잡도, 프로그래밍 가능성, 실제 성능, 확장성, 자원 효율, 신뢰 가능한 결과의 일곱 층위로 종합하고 비교 가능한 측정 조건을 정리한다. 컴퓨팅 능력 독서 지도는 정의 허브에서 일곱 편의 핵심 분석을 거쳐 [[컴퓨팅 능력의 발달사]]에 도달하는 순서와 17개 원전 코어를 안내한다. 발달사는 계산 가능성과 저장 프로그램·라이브러리·컴파일러·운영체제가 만든 프로그래밍 가능성에서 집적·축소와 수치 표준화, 메모리·전력 장벽, 병렬·분산·특화 구조로 층위가 늘어난 과정을 분석한다. [[Cramming More Components onto Integrated Circuits]]와 [[Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions]]는 [[무어의 법칙]]과 [[Dennard 스케일링]]을 구분해 집적도 증가와 소자 축소의 결합을 설명하고, 캐시와 RISC 원전은 늘어난 잠재 자원이 실제 프로그램 성능으로 전환되는 조건을 보강한다. Goldberg와 IEEE 754는 더 빠른 연산이 같은 계산이 되기 위한 표현·반올림·결과 계약을 보강한다. [[Hitting the Memory Wall]]과 [[The Landscape of Parallel Computing Research - A View from Berkeley]]는 [[메모리 장벽]], 전력 제약과 멀티코어 전환을 연결한다. Amdahl과 Gustafson은 고정된 작업의 시간 단축과 고정된 시간의 문제 규모 확대를 서로 다른 병렬 성능으로 나눈다. [[The Datacenter as a Computer]], [[The Tail at Scale]]과 [[In-Datacenter Performance Analysis of a Tensor Processing Unit]]은 시스템 경계가 창고 규모 서비스, 종단 지연 분포와 [[도메인 특화 가속기]]로 확장된 흐름을 보여준다. [[SPEC CPU 2026 Overview]], [[The Linpack Benchmark]], [[Roofline An Insightful Visual Performance Model]], [[Power Measurement Tutorial for the Green500 List]]는 검증된 작업별 성능·데이터 이동·에너지 효율을 측정하는 기준을 제공한다.

### 데이터 표현과 안전성

[[데이터 표현과 인코딩]]은 [[인코딩]], [[이진법]], [[비트와 바이트]], [[ASCII]], [[비트 연산]]을 통해 디지털 데이터가 어떻게 표현되고 해석되는지 설명한다. [[C Integer and Shift Semantics]]는 시프트와 정수 오버플로의 언어별 조건을 보강한다. 이 주제는 [[C 문자열]], [[정수 오버플로]], [[메모리 안전성]]을 통해 낮은 수준의 표현 규칙이 시스템 안정성과 보안으로 이어짐을 보여준다. [[비트 패턴과 해석 규칙]]은 이 관점을 인코딩, 타입, 경계 조건, 텍스트 처리 오류까지 확장한다.

### 인코딩과 유니코드 심화

[[The Unicode Standard 17.0.0]], [[RFC 3629 UTF-8]], [[Unicode Normalization Forms]], [[Unicode Text Segmentation]], [[WHATWG Encoding Standard]], [[Unicode Security Mechanisms]]는 텍스트 인코딩의 세부 층위를 보강하는 참고 자료다. 이 축은 [[유니코드]], [[코드 포인트]], [[Unicode scalar value]], [[코드 유닛]], [[UTF-8]], [[UTF-16]], [[바이트 순서 표식]], [[유니코드 정규화]], [[그래핌 클러스터]], [[인코딩 오류]], [[동형이의 문자]]를 통해 "문자"가 단일 단위가 아니라는 점을 정리한다. 핵심 분석은 [[인코딩 심화]]에 모았다.

### 논리 회로와 이진 표현

[[An Investigation of the Laws of Thought]]는 [[조지 불]]이 논리를 기호와 연산의 체계로 다룬 역사적 출발점을 보여주고, [[A Symbolic Analysis of Relay and Switching Circuits]]는 [[클로드 섀넌]]이 그 대수적 논리를 [[릴레이 회로]]와 [[스위칭 회로]] 분석에 연결한 과정을 보여준다. 이 축은 [[불 대수]]의 명칭과 법칙에서 시작해 [[이진법]]의 0과 1이 물리적 두 상태, [[논리 게이트]], [[이진 덧셈 회로]], [[비트 연산]]으로 이어지는 회로적 기반을 정리한다. 핵심 분석은 [[논리 회로와 이진 표현]]에 모았다.

### 핵심 분석

[[인간 계산자와 계산 공장]]은 드 프로니의 표 제작, 배비지의 기계화, Mathematical Tables Project와 ENIAC·SEAC를 비교해 조직도 계산의 실행 구조였음을 분석한다.

[[수학 표의 검산에서 수치 결과 계약으로]]는 인쇄 표의 산술·전사·조판 오류에서 조직적 검산, 수정 가능한 디지털 판본, 고정밀 참조값과 IEEE 754의 결과 계약으로 이동한 신뢰 체계를 분석한다.

[[계산기와 컴퓨터의 차이]]는 차분 기관, 해석 기관, EDSAC을 비교해 특정 계산 장치와 저장 프로그램 기반 범용 컴퓨터의 차이를 정리한다. [[기계가 계산한다는 말의 이론적 의미]]는 계산을 유한한 규칙에 따른 기호 상태 변환으로 보고, 보편 기계와 계산 불가능성의 의미를 연결한다. [[저장 프로그램 개념의 여러 기원]]은 EDVAC, Manchester Baby, EDSAC을 설계·실행·실용 운영 기준으로 나누어 분석한다. [[EDSAC은 무엇의 최초인가]]는 EDSAC의 고유한 최초성을 "실용적 범용 저장 프로그램 전자식 컴퓨터"라는 기준으로 제한한다. [[초기 소프트웨어의 계층화]]는 입력, 번역, 적재, 재배치, 호출 상태, 관찰, 재사용, 제어, 언어 설계가 소프트웨어 스택으로 쌓이는 과정을 분석한다. [[goto와 점프에서 구조적 프로그래밍으로]]는 점프와 `goto`를 구분하고 제어 흐름이 사람이 추적 가능한 구조로 제한되는 과정을 분석한다. [[Fortran과 컴파일러]]는 고급 언어가 실용화되려면 소스 프로그램을 효율적 목적 프로그램으로 바꾸는 컴파일러가 필요했다는 점을 분석한다. [[Unix와 C]]는 운영체제와 시스템 프로그래밍 언어가 이식성, 도구 조합, 파일·프로세스 모델 안에서 서로를 강화한 과정을 분석한다. [[범용성은 어떻게 컴퓨팅 능력이 되었는가]]는 이 흐름을 기계에 새 계산을 부여하는 변경 비용이 낮아진 역사로 종합한다. [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]는 하드웨어 잠재력이 작업 부하와 소프트웨어·메모리 계층을 거쳐 실현되는 조건을 분석한다. [[더 빠른 계산은 같은 답을 내는가]]는 수치 결과 계약을 지킨 실행만 같은 계산의 성능 향상으로 셀 수 있음을 분석한다. [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]는 병렬 자원이 동일 작업의 지연을 줄이는 능력과 같은 시간에 더 큰 계산을 수행하는 능력을 구분한다. [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]는 평균이 숨기는 팬아웃의 꼬리, 기한·가용성·품질과 자원 비용을 사용자 경계에서 분석한다. [[서브루틴 라이브러리에서 API로]]는 재사용 코드가 문서화된 인터페이스와 비용 정보를 요구하게 되는 과정을 분석한다. [[소프트웨어 재사용의 역사]]는 서브루틴, 라이브러리, API, 컴포넌트, 모듈화, 이식성, 재사용 연구가 재사용 가능한 소프트웨어를 공학 체계로 만드는 과정을 분석한다. [[계산 결과에서 실행 가능한 절차로]]는 결과·절차·명령·사본이라는 서로 다른 재사용 단위가 계산 비용을 어느 시점과 계층으로 옮기는지 비교한다. [[컴퓨팅 능력의 발달사]]는 이론적 한계와 프로그래밍 가능성에서 집적·축소, 수치 표준화, 메모리·전력 장벽, 병렬·분산·특화 구조로 이어진 변화를 분석한다. [[논리 회로와 이진 표현]]은 비트가 물리적 스위치 상태와 논리식 사이에서 어떻게 생성되고 조작되는지 정리한다. [[비트 패턴과 해석 규칙]]은 비트 자체가 아니라 인코딩, 타입, 경계 조건이 데이터 의미와 보안성을 결정한다는 관점을 정리한다. [[인코딩 심화]]는 이 관점을 텍스트 처리 내부의 코드 포인트, 코드 유닛, 정규화, 그래핌 클러스터, 보안 식별자 문제로 확장한다.

## 운영 메모

- `raw/` 원본은 수정하지 않는다.
- 새 페이지를 만들거나 갱신하면 [[index]]와 [[log]]를 함께 갱신한다.
- 일반 주장은 프론트매터의 `sources`와 각 페이지의 `## 출처` 섹션에 근거를 남긴다.

## 출처

- `AGENTS.md`
- `wiki/index.md`

## 관련 항목

- [[index]]
- [[log]]
- [[컴퓨팅 능력 독서 지도]]
- [[지식 그래프 관계 스키마]]
- [[컴퓨팅의 기원 - 배비지와 러브레이스]]
- [[초기 소프트웨어의 탄생]]
- [[EDSAC과 Initial Orders]]
- [[First Draft of a Report on the EDVAC]]
- [[The Manchester Small Scale Experimental Machine - The Baby]]
- [[On Computable Numbers with an Application to the Entscheidungsproblem]]
- [[An Unsolvable Problem of Elementary Number Theory]]
- [[기계가 계산한다는 말의 이론적 의미]]
- [[저장 프로그램 개념의 여러 기원]]
- [[EDSAC은 무엇의 최초인가]]
- [[서브루틴과 스택(Stack)의 원리]]
- [[폐쇄형 서브루틴과 Wheeler Jump]]
- [[A Case against the GO TO Statement]]
- [[Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules]]
- [[Structured Programming]]
- [[Structured Programming with go to Statements]]
- [[goto와 점프에서 구조적 프로그래밍으로]]
- [[The Preparation of Programs for an Electronic Digital Computer]]
- [[서브루틴 라이브러리에서 API로]]
- [[Mass Produced Software Components]]
- [[On the Criteria To Be Used in Decomposing Systems into Modules]]
- [[Software Reuse]]
- [[Sixteen Questions about Software Reuse]]
- [[소프트웨어 재사용의 역사]]
- [[계산 결과에서 실행 가능한 절차로]]
- [[인간 계산자]]
- [[인간 계산자와 계산 공장]]
- [[검산]]
- [[수학 표의 검산에서 수치 결과 계약으로]]
- [[DLMF Standard Reference Tables on Demand]]
- [[FORTRAN Automatic Coding System for the IBM 704 EDPM]]
- [[The FORTRAN Automatic Coding System]]
- [[The History of FORTRAN I, II, and III]]
- [[Fortran과 컴파일러]]
- [[The UNIX Time-Sharing System]]
- [[The Development of the C Language]]
- [[The Evolution of the Unix Time-sharing System]]
- [[Portability of C Programs and the UNIX System]]
- [[Unix와 C]]
- [[A Symbolic Analysis of Relay and Switching Circuits]]
- [[논리 회로와 이진 표현]]
- [[데이터 표현과 인코딩]]
- [[The Unicode Standard 17.0.0]]
- [[RFC 3629 UTF-8]]
- [[Unicode Normalization Forms]]
- [[Unicode Text Segmentation]]
- [[WHATWG Encoding Standard]]
- [[Unicode Security Mechanisms]]
- [[인코딩 심화]]
- [[On the Computational Complexity of Algorithms]]
- [[SPEC CPU 2026 Overview]]
- [[The Linpack Benchmark]]
- [[Roofline An Insightful Visual Performance Model]]
- [[What Every Computer Scientist Should Know About Floating-Point Arithmetic]]
- [[IEEE 754-2019 Standard for Floating-Point Arithmetic]]
- [[부동소수점 정확성]]
- [[더 빠른 계산은 같은 답을 내는가]]
- [[Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities]]
- [[Power Measurement Tutorial for the Green500 List]]
- [[Cramming More Components onto Integrated Circuits]]
- [[Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions]]
- [[Hitting the Memory Wall]]
- [[The Landscape of Parallel Computing Research - A View from Berkeley]]
- [[The Datacenter as a Computer]]
- [[In-Datacenter Performance Analysis of a Tensor Processing Unit]]
- [[컴퓨팅 능력의 발달사]]
- [[무어의 법칙]]
- [[Dennard 스케일링]]
- [[메모리 장벽]]
- [[도메인 특화 가속기]]
- [[프로그래밍 가능성]]
- [[범용성은 어떻게 컴퓨팅 능력이 되었는가]]
- [[Slave Memories and Dynamic Storage Allocation]]
- [[Design and Implementation of RISC I]]
- [[캐시 메모리]]
- [[축소 명령어 집합 컴퓨터]]
- [[더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가]]
- [[Reevaluating Amdahl's Law]]
- [[병렬 확장성]]
- [[병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가]]
- [[The Tail at Scale]]
- [[꼬리 지연 시간]]
- [[평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가]]
