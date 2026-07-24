export const categoryMeta = Object.freeze({
  sources: { label: "정규 소스", description: "raw에 보존한 원본을 직접 처리한 정규 소스 노트" },
  references: { label: "참고 자료", description: "논문·표준·공식 기록으로 기존 지식을 보강한 외부 참고 자료" },
  entities: { label: "인물", description: "컴퓨터 과학의 형성에 관여한 연구자와 설계자" },
  concepts: { label: "개념", description: "컴퓨팅의 원리, 구조, 언어를 연결하는 핵심 개념" },
  analyses: { label: "분석", description: "여러 소스와 개념을 비교하고 연결한 종합 분석" },
  meta: { label: "메타", description: "위키의 운영 상태와 전체 지식 구조" }
});

export const navCategories = Object.freeze(["sources", "references", "concepts", "entities", "analyses"]);

export const statusMeta = {
  active: { label: "검증됨", description: "원문 대조와 링크 검사를 통과한 문서" },
  draft: { label: "초안", description: "근거 또는 교차 검토를 보강하는 문서" },
  review: { label: "검토 중", description: "본문과 출처 매핑을 원문과 대조하는 문서" },
  archived: { label: "보관", description: "현재 지식에서는 대체되었지만 이력을 보존하는 문서" }
};

export const domainMeta = {
  "domain/computer-history": "컴퓨팅사",
  "domain/software-engineering": "소프트웨어 공학",
  "domain/computer-science": "컴퓨터 과학",
  "domain/programming-languages": "프로그래밍 언어",
  "domain/computer-architecture": "컴퓨터 구조",
  "domain/text-processing": "텍스트 처리",
  "domain/operating-systems": "운영체제",
  "domain/security": "보안",
  "domain/systems": "시스템",
  "domain/internet": "인터넷",
  "domain/mathematics": "수학",
  "domain/machine-learning": "기계 학습",
  "domain/web": "웹"
};

// Editorial periods for the historical lens. Numeric boundaries are stable
// data contracts; titles and questions may evolve without changing URLs.
export const historyPeriods = [
  {
    id: "before-1800",
    start: null,
    end: 1799,
    title: "1800년 이전 · 형식화의 전사",
    question: "수와 규칙을 반복 가능한 기호 절차로 어떻게 고정했는가?"
  },
  {
    id: "1800-1935",
    start: 1800,
    end: 1935,
    title: "1800–1935 · 기계와 기호",
    question: "계산 절차를 기계와 논리 기호로 어떻게 옮겼는가?"
  },
  {
    id: "1936-1945",
    start: 1936,
    end: 1945,
    title: "1936–1945 · 계산 가능성과 저장 구상",
    question: "기계적 절차의 경계와 프로그램 저장을 어떻게 정의했는가?"
  },
  {
    id: "1946-1959",
    start: 1946,
    end: 1959,
    title: "1946–1959 · 작동하는 기계와 자동 프로그래밍",
    question: "범용 설계를 반복 가능한 프로그램 작성 능력으로 어떻게 바꿨는가?"
  },
  {
    id: "1960-1979",
    start: 1960,
    end: 1979,
    title: "1960–1979 · 집적, 복잡도와 시스템",
    question: "늘어난 회로와 자원을 실제 프로그램 능력으로 어떻게 전환했는가?"
  },
  {
    id: "1980-1999",
    start: 1980,
    end: 1999,
    title: "1980–1999 · 아키텍처와 결과 계약",
    question: "잠재 성능, 데이터 이동과 같은 답의 조건을 어떻게 함께 다뤘는가?"
  },
  {
    id: "2000-2014",
    start: 2000,
    end: 2014,
    title: "2000–2014 · 병렬성, 전력과 서비스 규모",
    question: "코어와 서버를 늘릴 때 전력·통신·꼬리 지연을 어떻게 통제했는가?"
  },
  {
    id: "2015-plus",
    start: 2015,
    end: null,
    title: "2015+ · 특화와 조건부 성능",
    question: "범용성을 조절하면서 특정 작업의 성능과 효율을 어떻게 높였는가?"
  },
  {
    id: "undated",
    start: null,
    end: null,
    title: "연도 미상 · 배치 대기와 시대 횡단",
    question: "연도를 추정하지 않고 어떤 층위와 질문에 연결해 읽을 수 있는가?",
    undated: true
  }
];

export const learningPaths = [
  {
    slug: "computing-origins",
    title: "컴퓨팅의 기원",
    description: "수학 표와 인간 계산 조직의 제작·검산에서 기계식 자동화, 범용 프로그램 가능성과 기호 조작의 발상까지 따라간다.",
    pages: [
      "컴퓨팅의 기원 - 배비지와 러브레이스",
      "수학 표",
      "인간 계산자",
      "인간 계산자와 계산 공장",
      "검산",
      "수학 표의 검산에서 수치 결과 계약으로",
      "찰스 배비지",
      "유한 차분법",
      "차분 기관",
      "해석 기관",
      "에이다 러브레이스",
      "알고리즘적 사고",
      "기호 조작",
      "계산기와 컴퓨터의 차이"
    ]
  },
  {
    slug: "computability",
    title: "계산 가능성과 한계",
    description: "계산 절차의 형식화에서 보편 기계와 계산 불가능성의 경계까지 읽는다.",
    pages: [
      "On Computable Numbers with an Application to the Entscheidungsproblem",
      "An Unsolvable Problem of Elementary Number Theory",
      "계산 가능성",
      "튜링 기계",
      "보편 튜링 기계",
      "Entscheidungsproblem",
      "정지 문제",
      "처치-튜링 논제",
      "기계가 계산한다는 말의 이론적 의미"
    ]
  },
  {
    slug: "stored-program",
    title: "저장 프로그램 컴퓨터",
    description: "EDVAC의 설계, Manchester Baby의 실행, EDSAC의 실용 운영을 구분해 살핀다.",
    pages: [
      "First Draft of a Report on the EDVAC",
      "The Manchester Small Scale Experimental Machine - The Baby",
      "EDVAC",
      "폰 노이만 구조",
      "Manchester Baby",
      "EDSAC",
      "저장 프로그램 컴퓨터",
      "저장 프로그램 개념의 여러 기원",
      "EDSAC은 무엇의 최초인가"
    ]
  },
  {
    slug: "early-software",
    title: "초기 소프트웨어와 호출 구조",
    description: "입력·적재·재배치·서브루틴·복귀 주소가 소프트웨어 계층으로 분화되는 과정을 읽는다.",
    pages: [
      "초기 소프트웨어의 탄생",
      "EDSAC과 Initial Orders",
      "Initial Orders",
      "부트스트랩",
      "로더",
      "어셈블러",
      "서브루틴과 스택(Stack)의 원리",
      "폐쇄형 서브루틴과 Wheeler Jump",
      "서브루틴",
      "Wheeler Jump",
      "복귀 주소",
      "스택",
      "초기 소프트웨어의 계층화"
    ]
  },
  {
    slug: "structured-programming",
    title: "goto와 구조적 프로그래밍",
    description: "기계적 점프와 고급 언어의 goto를 구분하고 이해 가능한 제어 구조의 형성을 추적한다.",
    pages: [
      "A Case against the GO TO Statement",
      "Flow Diagrams, Turing Machines and Languages with Only Two Formation Rules",
      "Structured Programming",
      "Structured Programming with go to Statements",
      "GOTO 문",
      "제어 흐름",
      "제어 구조",
      "구조화 프로그램 정리",
      "단계적 정제",
      "구조적 프로그래밍",
      "goto와 점프에서 구조적 프로그래밍으로"
    ]
  },
  {
    slug: "fortran-compiler",
    title: "Fortran과 컴파일러",
    description: "수학적 표기를 효율적인 기계어로 번역하는 고급 언어와 컴파일러의 결합을 살핀다.",
    pages: [
      "FORTRAN Automatic Coding System for the IBM 704 EDPM",
      "The FORTRAN Automatic Coding System",
      "The History of FORTRAN I, II, and III",
      "IBM 704",
      "존 배커스",
      "Fortran",
      "소스 프로그램",
      "목적 프로그램",
      "컴파일러",
      "컴파일러 최적화",
      "Fortran과 컴파일러"
    ]
  },
  {
    slug: "unix-c",
    title: "Unix와 C",
    description: "운영체제와 시스템 프로그래밍 언어가 이식성과 도구 조합 안에서 함께 발전한 과정을 읽는다.",
    pages: [
      "The UNIX Time-Sharing System",
      "The Development of the C Language",
      "The Evolution of the Unix Time-sharing System",
      "Portability of C Programs and the UNIX System",
      "Unix",
      "C 언어",
      "PDP-11",
      "운영체제",
      "파일 시스템",
      "시스템 호출",
      "유닉스 파이프",
      "이식성",
      "Unix와 C"
    ]
  },
  {
    slug: "reuse-api",
    title: "라이브러리에서 API와 재사용으로",
    description: "계산 결과와 실행 절차의 재사용을 구분하고, 서브루틴 카탈로그에서 컴포넌트·모듈화·정보 은닉으로 확장된 역사를 읽는다.",
    pages: [
      "The Preparation of Programs for an Electronic Digital Computer",
      "Mass Produced Software Components",
      "On the Criteria To Be Used in Decomposing Systems into Modules",
      "Software Reuse",
      "Sixteen Questions about Software Reuse",
      "라이브러리",
      "라이브러리 카탈로그",
      "API",
      "소프트웨어 컴포넌트",
      "모듈화",
      "정보 은닉",
      "서브루틴 라이브러리에서 API로",
      "소프트웨어 재사용의 역사",
      "계산 결과에서 실행 가능한 절차로",
      "스프레드시트",
      "수학 표에서 스프레드시트로"
    ]
  },
  {
    slug: "logic-binary",
    title: "논리 회로와 이진 표현",
    description: "불의 기호 논리에서 스위칭 회로와 논리 게이트, 이진 데이터 표현으로 이어지는 연결을 살핀다.",
    pages: [
      "An Investigation of the Laws of Thought",
      "A Symbolic Analysis of Relay and Switching Circuits",
      "조지 불",
      "클로드 섀넌",
      "불 대수",
      "릴레이 회로",
      "스위칭 회로",
      "논리 게이트",
      "이진법",
      "이진 덧셈 회로",
      "논리 회로와 이진 표현"
    ]
  },
  {
    slug: "unicode-text",
    title: "데이터 표현과 유니코드",
    description: "비트와 바이트에서 코드 포인트·정규화·그래핌 클러스터·텍스트 보안까지 층위별로 읽는다.",
    pages: [
      "데이터 표현과 인코딩",
      "The Unicode Standard 17.0.0",
      "RFC 3629 UTF-8",
      "Unicode Normalization Forms",
      "Unicode Text Segmentation",
      "Unicode Security Mechanisms",
      "데이터 표현",
      "인코딩",
      "유니코드",
      "코드 포인트",
      "Unicode scalar value",
      "코드 유닛",
      "UTF-8",
      "UTF-16",
      "유니코드 정규화",
      "그래핌 클러스터",
      "동형이의 문자",
      "비트 패턴과 해석 규칙",
      "인코딩 심화"
    ]
  },
  {
    slug: "computing-capability-history",
    title: "컴퓨팅 능력의 발달사",
    description: "독서 지도에서 출발해 기계 이전의 계산 조직, 계산 가능성과 프로그래밍 가능성, 집적과 축소, 수치 정확성, 메모리·전력 장벽, 병렬·분산 서비스와 도메인 특화로 이어진 흐름을 읽는다.",
    pages: [
      "컴퓨팅 능력 독서 지도",
      "On Computable Numbers with an Application to the Entscheidungsproblem",
      "On the Computational Complexity of Algorithms",
      "프로그래밍 가능성",
      "범용성은 어떻게 컴퓨팅 능력이 되었는가",
      "No Silver Bullet—Essence and Accidents of Software Engineering",
      "본질적 복잡성과 부수적 복잡성",
      "The SPACE of Developer Productivity",
      "개발자 생산성",
      "코드 생산량은 왜 개발 생산성을 설명하지 못하는가",
      "계산 결과에서 실행 가능한 절차로",
      "인간 계산자와 계산 공장",
      "수학 표에서 스프레드시트로",
      "Cramming More Components onto Integrated Circuits",
      "Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions",
      "무어의 법칙",
      "Dennard 스케일링",
      "What Every Computer Scientist Should Know About Floating-Point Arithmetic",
      "IEEE 754-2019 Standard for Floating-Point Arithmetic",
      "부동소수점 정확성",
      "Mixed Precision Training",
      "혼합 정밀도",
      "GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers",
      "AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration",
      "LLM 가중치 양자화",
      "MLPerf Training Benchmark",
      "목표 품질 도달 시간",
      "Hitting the Memory Wall",
      "메모리 장벽",
      "Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities",
      "Reevaluating Amdahl's Law",
      "The Landscape of Parallel Computing Research - A View from Berkeley",
      "Roofline An Insightful Visual Performance Model",
      "전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가",
      "TokenPowerBench - Benchmarking the Power Consumption of LLM Inference",
      "MLPerf Inference Power Measurement",
      "LLM 추론 에너지 지표",
      "같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가",
      "The Datacenter as a Computer",
      "The Tail at Scale",
      "꼬리 지연 시간",
      "In-Datacenter Performance Analysis of a Tensor Processing Unit",
      "도메인 특화 가속기",
      "컴퓨팅 능력이란 무엇인가",
      "더 빠른 계산은 같은 답을 내는가",
      "평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가",
      "컴퓨팅 능력의 발달사"
    ]
  },
  {
    slug: "generality-programmability",
    title: "범용 기계와 프로그래밍 가능성",
    description: "특수 목적 계산 장치에서 보편 기계, 저장 프로그램, 라이브러리·컴파일러와 이식 가능한 운영 환경으로 이어진 흐름을 읽는다.",
    pages: [
      "컴퓨팅의 기원 - 배비지와 러브레이스",
      "해석 기관",
      "계산기와 컴퓨터의 차이",
      "On Computable Numbers with an Application to the Entscheidungsproblem",
      "보편 튜링 기계",
      "기계가 계산한다는 말의 이론적 의미",
      "First Draft of a Report on the EDVAC",
      "저장 프로그램 컴퓨터",
      "저장 프로그램 개념의 여러 기원",
      "EDSAC과 Initial Orders",
      "Initial Orders",
      "The Preparation of Programs for an Electronic Digital Computer",
      "초기 소프트웨어의 계층화",
      "FORTRAN Automatic Coding System for the IBM 704 EDPM",
      "The FORTRAN Automatic Coding System",
      "컴파일러",
      "컴파일러 최적화",
      "Fortran과 컴파일러",
      "Unix와 C",
      "프로그래밍 가능성",
      "컴퓨팅 능력이란 무엇인가",
      "범용성은 어떻게 컴퓨팅 능력이 되었는가"
    ]
  },
  {
    slug: "faster-processor-conditions",
    title: "더 빠른 프로세서의 조건",
    description: "트랜지스터와 클럭의 잠재력이 메모리 계층, 명령어 집합, 컴파일러와 작업 부하를 거쳐 실제 프로그램 성능으로 전환되는 조건을 읽는다.",
    pages: [
      "Cramming More Components onto Integrated Circuits",
      "무어의 법칙",
      "Slave Memories and Dynamic Storage Allocation",
      "캐시 메모리",
      "Design and Implementation of RISC I",
      "축소 명령어 집합 컴퓨터",
      "컴파일러 최적화",
      "Hitting the Memory Wall",
      "메모리 장벽",
      "SPEC CPU 2026 Overview",
      "Roofline An Insightful Visual Performance Model",
      "컴퓨팅 능력이란 무엇인가",
      "더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가"
    ]
  },
  {
    slug: "floating-point-correctness",
    title: "부동소수점 성능과 정확성",
    description: "수학 표의 검산과 고정밀 참조값에서 IEEE 754의 연산 규범, 컴파일러 최적화, LINPACK·SPEC의 결과 검증까지 따라가며 정확성 계약을 읽는다.",
    pages: [
      "What Every Computer Scientist Should Know About Floating-Point Arithmetic",
      "IEEE 754-2019 Standard for Floating-Point Arithmetic",
      "DLMF Standard Reference Tables on Demand",
      "검산",
      "부동소수점 정확성",
      "The FORTRAN Automatic Coding System",
      "컴파일러 최적화",
      "Fortran과 컴파일러",
      "SPEC CPU 2026 Overview",
      "The Linpack Benchmark",
      "Roofline An Insightful Visual Performance Model",
      "더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가",
      "컴퓨팅 능력이란 무엇인가",
      "컴퓨팅 능력의 발달사",
      "수학 표의 검산에서 수치 결과 계약으로",
      "더 빠른 계산은 같은 답을 내는가"
    ]
  },
  {
    slug: "parallel-scalability",
    title: "병렬 확장성의 두 질문",
    description: "고정된 문제의 시간 단축과 고정된 시간의 문제 규모 확대를 암달과 Gustafson의 원전, 현대 병렬 공동 설계 맥락으로 비교한다.",
    pages: [
      "Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities",
      "Reevaluating Amdahl's Law",
      "병렬 확장성",
      "The Landscape of Parallel Computing Research - A View from Berkeley",
      "컴퓨팅 능력이란 무엇인가",
      "컴퓨팅 능력의 발달사",
      "병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가"
    ]
  },
  {
    slug: "power-energy-barrier",
    title: "전력 장벽과 에너지 효율",
    description: "집적도와 소자 축소의 결합이 약해진 뒤 성능 향상이 세대 간 계산량/에너지, 부하별 전력과 활성 면적에서 LLM의 단계별·전체 시스템 유효 요청당 자원까지 확장된 과정을 읽는다.",
    pages: [
      "Cramming More Components onto Integrated Circuits",
      "무어의 법칙",
      "Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions",
      "Dennard 스케일링",
      "The Landscape of Parallel Computing Research - A View from Berkeley",
      "Implications of Historical Trends in the Electrical Efficiency of Computing",
      "Koomey의 법칙",
      "The Case for Energy-Proportional Computing",
      "에너지 비례 컴퓨팅",
      "Dark Silicon and the End of Multicore Scaling",
      "다크 실리콘",
      "도메인 특화 가속기",
      "Power Measurement Tutorial for the Green500 List",
      "TokenPowerBench - Benchmarking the Power Consumption of LLM Inference",
      "MLPerf Inference Power Measurement",
      "LLM 추론 에너지 지표",
      "같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가",
      "컴퓨팅 능력이란 무엇인가",
      "컴퓨팅 능력의 발달사",
      "전력 장벽은 성능 향상의 의미를 어떻게 바꾸었는가"
    ]
  },
  {
    slug: "algorithmic-complexity-practicality",
    title: "알고리즘 복잡도와 실용성",
    description: "계산 가능성에서 시간 자원, 다항 시간 환원과 NP-완전성을 거쳐 알고리즘 개선과 하드웨어 개선을 실제 성능 조건에서 비교한다.",
    pages: [
      "On Computable Numbers with an Application to the Entscheidungsproblem",
      "계산 가능성",
      "On the Computational Complexity of Algorithms",
      "계산 복잡도",
      "The Complexity of Theorem-Proving Procedures",
      "다항 시간 환원",
      "Reducibility Among Combinatorial Problems",
      "NP-완전",
      "There's Plenty of Room at the Top",
      "더 빠른 하드웨어는 더 나은 알고리즘을 대신할 수 있는가",
      "더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가",
      "컴퓨팅 능력이란 무엇인가",
      "컴퓨팅 능력의 발달사"
    ]
  },
  {
    slug: "mixed-precision-ml-quality",
    title: "혼합 정밀도와 AI 품질",
    description: "낮은 정밀도의 메모리·가속기 이득을 수치 안정성, 모델 품질 문턱과 목표 품질 도달 시간의 조건에서 읽는다.",
    pages: [
      "What Every Computer Scientist Should Know About Floating-Point Arithmetic",
      "IEEE 754-2019 Standard for Floating-Point Arithmetic",
      "부동소수점 정확성",
      "Mixed Precision Training",
      "혼합 정밀도",
      "MLPerf Training Benchmark",
      "목표 품질 도달 시간",
      "In-Datacenter Performance Analysis of a Tensor Processing Unit",
      "도메인 특화 가속기",
      "낮은 정밀도는 AI의 컴퓨팅 능력을 어떻게 바꾸는가",
      "낮은 비트는 왜 LLM 추론 속도를 보장하지 않는가",
      "더 빠른 계산은 같은 답을 내는가",
      "컴퓨팅 능력이란 무엇인가"
    ]
  },
  {
    slug: "llm-inference-systems",
    title: "LLM 추론 시스템과 서비스 품질",
    description: "Transformer의 생성 순차성에서 출발해 어텐션 데이터 이동, 동적 배칭·KV 캐시, 대기열·승인 제어, TTFT·TPOT SLO와 유효 요청당 에너지가 실제 LLM 서비스 능력을 만드는 과정을 읽는다.",
    pages: [
      "Attention Is All You Need",
      "Transformer",
      "자기 주의",
      "FlashAttention - Fast and Memory-Efficient Exact Attention with IO-Awareness",
      "입출력 인지 어텐션",
      "Orca - A Distributed Serving System for Transformer-Based Generative Models",
      "연속 배칭",
      "A Proof for the Queuing Formula L = λW",
      "리틀의 법칙",
      "Efficient Memory Management for Large Language Model Serving with PagedAttention",
      "KV 캐시",
      "SGLang - Efficient Execution of Structured Language Model Programs",
      "접두사 KV 캐싱",
      "DistServe - Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving",
      "프리필과 디코드",
      "Serving DNNs like Clockwork Performance Predictability from the Bottom Up",
      "대기열과 부하 제어",
      "Fast Inference from Transformers via Speculative Decoding",
      "추측 디코딩",
      "GPTQ - Accurate Post-Training Quantization for Generative Pre-trained Transformers",
      "AWQ - Activation-aware Weight Quantization for On-Device LLM Compression and Acceleration",
      "LLM 가중치 양자화",
      "MLPerf Inference Benchmark",
      "LLM 추론 서비스 지표",
      "TokenPowerBench - Benchmarking the Power Consumption of LLM Inference",
      "MLPerf Inference Power Measurement",
      "LLM 추론 에너지 지표",
      "Transformer 추론은 왜 연산량만으로 설명되지 않는가",
      "KV 캐시는 왜 LLM 추론 처리량을 제한하는가",
      "재사용과 추측은 LLM 추론 작업량을 어떻게 바꾸는가",
      "낮은 비트는 왜 LLM 추론 속도를 보장하지 않는가",
      "초당 토큰 수는 왜 LLM 서비스 능력을 설명하지 못하는가",
      "같은 SLO의 LLM 서비스는 무엇을 비용으로 세어야 하는가",
      "LLM 서빙에서 처리량과 지연은 왜 함께 움직이는가",
      "꼬리 지연 시간",
      "컴퓨팅 능력이란 무엇인가"
    ]
  },
  {
    slug: "developer-productivity",
    title: "개발자 생산성과 측정",
    description: "언어·컴파일러·재사용이 줄인 표현 비용을 본질적 설계 부담과 구분하고, 코드량 대신 성과·협업·흐름·웰빙을 함께 측정한다.",
    pages: [
      "The FORTRAN Automatic Coding System",
      "프로그래밍 가능성",
      "Software Reuse",
      "소프트웨어 재사용",
      "No Silver Bullet—Essence and Accidents of Software Engineering",
      "본질적 복잡성과 부수적 복잡성",
      "The SPACE of Developer Productivity",
      "개발자 생산성",
      "소프트웨어 공학",
      "코드 생산량은 왜 개발 생산성을 설명하지 못하는가",
      "범용성은 어떻게 컴퓨팅 능력이 되었는가",
      "컴퓨팅 능력이란 무엇인가"
    ]
  },
  {
    slug: "fault-tolerance-availability",
    title: "결함 허용과 가용성",
    description: "꼬리 지연의 종단 측정에서 출발해 실패 모형, 공통 원인, 탐지·복구 시간과 안전한 서비스 회복을 함께 읽는다.",
    pages: [
      "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services",
      "CAP 정리",
      "The Byzantine Generals Problem",
      "비잔틴 장애",
      "Why Do Internet Services Fail and What Can Be Done About It",
      "Recovery-Oriented Computing (ROC)",
      "결함 허용",
      "In Search of an Understandable Consensus Algorithm",
      "복제 로그와 합의",
      "Spanner - Google's Globally-Distributed Database",
      "외부 일관성과 시간 불확실성",
      "가용성과 복구",
      "The Tail at Scale",
      "꼬리 지연 시간",
      "빠른 서비스는 왜 가용한 서비스를 보장하지 않는가",
      "분산 서비스는 빠른 응답과 같은 상태를 어떻게 함께 보장하는가",
      "평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가",
      "컴퓨팅 능력이란 무엇인가",
      "컴퓨팅 능력의 발달사"
    ]
  },
  {
    slug: "service-tail-latency",
    title: "서비스 성능과 꼬리 지연",
    description: "단일 작업의 시간·처리량에서 창고 규모 서비스의 팬아웃과 종단 백분위로 측정 경계를 넓히고, 짧은 꼬리와 자원·에너지·결과 품질의 교환을 읽는다.",
    pages: [
      "SPEC CPU 2026 Overview",
      "더 빠른 프로세서는 왜 더 빠른 프로그램을 보장하지 않는가",
      "The Datacenter as a Computer",
      "The Tail at Scale",
      "꼬리 지연 시간",
      "Spanner - Google's Globally-Distributed Database",
      "외부 일관성과 시간 불확실성",
      "The Case for Energy-Proportional Computing",
      "에너지 비례 컴퓨팅",
      "In-Datacenter Performance Analysis of a Tensor Processing Unit",
      "도메인 특화 가속기",
      "컴퓨팅 능력이란 무엇인가",
      "컴퓨팅 능력의 발달사",
      "평균 성능은 왜 서비스의 컴퓨팅 능력을 설명하지 못하는가",
      "분산 서비스는 빠른 응답과 같은 상태를 어떻게 함께 보장하는가"
    ]
  }
];
