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
  "domain/web": "웹"
};

export const learningPaths = [
  {
    slug: "computing-origins",
    title: "컴퓨팅의 기원",
    description: "기계식 계산 장치에서 범용 프로그램 가능성과 기호 조작의 발상까지 따라간다.",
    pages: [
      "컴퓨팅의 기원 - 배비지와 러브레이스",
      "찰스 배비지",
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
    description: "서브루틴 카탈로그에서 컴포넌트·모듈화·정보 은닉으로 확장된 재사용의 역사를 읽는다.",
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
      "소프트웨어 재사용의 역사"
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
    description: "계산 가능성에서 집적과 축소, 메모리·전력 장벽, 병렬·분산 시스템과 도메인 특화 가속기로 이어진 흐름을 읽는다.",
    pages: [
      "On Computable Numbers with an Application to the Entscheidungsproblem",
      "On the Computational Complexity of Algorithms",
      "Cramming More Components onto Integrated Circuits",
      "Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions",
      "무어의 법칙",
      "Dennard 스케일링",
      "Hitting the Memory Wall",
      "메모리 장벽",
      "Validity of the Single Processor Approach to Achieving Large Scale Computing Capabilities",
      "The Landscape of Parallel Computing Research - A View from Berkeley",
      "Roofline An Insightful Visual Performance Model",
      "The Datacenter as a Computer",
      "In-Datacenter Performance Analysis of a Tensor Processing Unit",
      "도메인 특화 가속기",
      "컴퓨팅 능력이란 무엇인가",
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
  }
];
