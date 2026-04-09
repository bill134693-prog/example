const CENTRAL_RULES = {
  '기획재정부': {
    legalReference: '기획재정부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['기재부'],
    departmentKeywords: ['예산', '세금', '세제', '재정', '물가'],
    subDepartments: {
      '세제실 조세정책과': {
        keywords: ['소득세', '법인세', '부가가치세', '세액공제', '세제개편', '조세'],
        reason: '조세제도 기획·운영 및 세법 정책 총괄',
      },
      '재정관리국 재정관리과': {
        keywords: ['국가채무', '재정집행', '국고', '재정수지', '예산집행'],
        reason: '국가재정 운용 및 재정관리 정책',
      },
      '경제정책국 경제분석과': {
        keywords: ['경기', '경제전망', '물가상승', '생활물가', '경제정책'],
        reason: '거시경제 동향 분석 및 경제정책 지원',
      },
    },
  },
  '교육부': {
    legalReference: '교육부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['학교', '교원', '대학', '학생', '교육'],
    subDepartments: {
      '학교교수학습혁신과': {
        keywords: ['학교', '수업', '교실', '학습', '학사', '교원'],
        reason: '초중등 학교 운영 및 교수학습 정책',
      },
      '대학규제혁신과': {
        keywords: ['대학', '등록금', '학자금', '휴학', '편입', '학사행정'],
        reason: '대학 제도 및 규제개선 정책',
      },
      '특수교육정책과': {
        keywords: ['특수교육', '장애학생', '통합교육', '특수학급', '개별화교육'],
        reason: '특수교육 지원 및 정책 총괄',
      },
    },
  },
  '과학기술정보통신부': {
    legalReference: '과학기술정보통신부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['과기정통부'],
    departmentKeywords: ['통신', '인터넷', '데이터', '인공지능', '연구개발'],
    subDepartments: {
      '정보통신정책관 통신정책기획과': {
        keywords: ['통신요금', '통신사', '번호이동', '인터넷 품질', '5g', '통신장애'],
        reason: '통신정책 및 이용자 보호 제도 기획',
      },
      '인공지능기반정책관 인공지능정책과': {
        keywords: ['인공지능', 'ai', '데이터', '알고리즘', '디지털전환'],
        reason: 'AI 산업·기반 정책 및 거버넌스',
      },
      '연구개발정책실 연구성과확산촉진과': {
        keywords: ['국가연구개발', '연구비', '기술이전', '성과확산', '국책과제'],
        reason: '국가 R&D 성과관리·확산 지원',
      },
    },
  },
  '외교부': {
    legalReference: '외교부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['여권', '재외국민', '비자', '영사'],
    subDepartments: {
      '영사안전국 영사서비스과': {
        keywords: ['영사', '재외국민', '해외사고', '여권', '해외안전'],
        reason: '영사민원 서비스 및 재외국민 보호',
      },
      '재외동포정책국 재외동포정책과': {
        keywords: ['재외동포', '동포', '국적', '해외체류', '동포지원'],
        reason: '재외동포 정책 및 지원업무',
      },
      '조약국 조약과': {
        keywords: ['국제협약', '조약', '국제법', '외교협정'],
        reason: '조약 체결 및 국제법 검토',
      },
    },
  },
  '통일부': {
    legalReference: '통일부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['남북', '이산가족', '북한', '통일'],
    subDepartments: {
      '정책기획관 정책총괄과': {
        keywords: ['통일정책', '남북관계', '대북정책', '남북협력'],
        reason: '통일·남북관계 정책 총괄',
      },
      '인도협력국 인도지원과': {
        keywords: ['이산가족', '인도지원', '대북지원', '인도적 지원'],
        reason: '남북 인도협력 및 지원정책',
      },
      '정착지원과': {
        keywords: ['북한이탈주민', '정착지원', '하나원', '탈북민'],
        reason: '북한이탈주민 정착지원 정책',
      },
    },
  },
  '법무부': {
    legalReference: '법무부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['출입국', '교정', '범죄', '법률'],
    subDepartments: {
      '출입국정책단 체류관리과': {
        keywords: ['비자', '체류자격', '외국인등록', '출입국', '국적'],
        reason: '출입국·체류 제도 운영',
      },
      '교정정책단 교정기획과': {
        keywords: ['교정', '수용', '교도소', '가석방'],
        reason: '교정행정 정책 총괄',
      },
      '범죄예방정책국 보호관찰과': {
        keywords: ['보호관찰', '사회봉사', '범죄예방', '소년보호'],
        reason: '보호관찰 및 범죄예방 정책',
      },
    },
  },
  '국방부': {
    legalReference: '국방부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['병역', '군', '장병', '국방'],
    subDepartments: {
      '군인복지과': {
        keywords: ['군인복지', '장병복지', '군 숙소', '급식', '복지시설'],
        reason: '장병 복지정책 및 복지사업',
      },
      '인력정책과': {
        keywords: ['군인사', '병사', '장교', '부사관', '복무'],
        reason: '군 인력 운영 및 복무정책',
      },
      '동원기획과': {
        keywords: ['예비군', '동원', '훈련', '민방위'],
        reason: '예비전력·동원정책 기획',
      },
    },
  },
  '행정안전부': {
    legalReference: '행정안전부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['행안부'],
    departmentKeywords: ['주민등록', '지방자치', '재난', '행정'],
    subDepartments: {
      '지방행정정책과': {
        keywords: ['지방자치', '행정서비스', '민원제도', '정부24', '지방행정'],
        reason: '지방행정 제도 및 민원행정 정책',
      },
      '주민과': {
        keywords: ['주민등록', '등본', '초본', '전입신고', '주민번호'],
        reason: '주민등록 제도 및 주민민원 총괄',
      },
      '재난관리정책과': {
        keywords: ['재난', '재해', '침수', '산불', '대피', '안전점검'],
        reason: '재난·안전관리 정책 총괄',
      },
    },
  },
  '국가보훈부': {
    legalReference: '국가보훈부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['보훈부'],
    departmentKeywords: ['보훈', '국가유공자', '보상'],
    subDepartments: {
      '보훈보상정책과': {
        keywords: ['국가유공자', '보훈보상', '보상금', '상이', '유족'],
        reason: '보훈보상 및 지원제도 운영',
      },
      '생활안정과': {
        keywords: ['생활지원', '의료지원', '교육지원', '대부', '취업지원'],
        reason: '보훈대상자 생활안정 지원',
      },
      '보훈예우정책과': {
        keywords: ['보훈행사', '예우', '현충', '추모'],
        reason: '보훈예우 및 선양사업 정책',
      },
    },
  },
  '문화체육관광부': {
    legalReference: '문화체육관광부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['문체부'],
    departmentKeywords: ['문화', '관광', '체육', '콘텐츠'],
    subDepartments: {
      '문화정책과': {
        keywords: ['문화예술', '문화시설', '공연', '전시', '문화지원'],
        reason: '문화정책 및 문화예술 지원',
      },
      '관광정책과': {
        keywords: ['관광', '관광지', '숙박', '여행', '관광불편'],
        reason: '관광정책 및 관광서비스 제도',
      },
      '체육정책과': {
        keywords: ['체육시설', '체육행사', '스포츠', '생활체육'],
        reason: '체육정책 및 생활체육 진흥',
      },
    },
  },
  '농림축산식품부': {
    legalReference: '농림축산식품부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['농식품부'],
    departmentKeywords: ['농업', '축산', '식품', '농지'],
    subDepartments: {
      '농업정책과': {
        keywords: ['농지', '농업보조', '직불금', '농업정책', '농민'],
        reason: '농업정책 및 농업인 지원',
      },
      '축산정책과': {
        keywords: ['축산', '가축', '사육', '축산업', '축산환경'],
        reason: '축산정책 및 축산업 관리',
      },
      '식품산업정책과': {
        keywords: ['식품산업', '원산지', '농식품', '식품유통'],
        reason: '농식품 산업 및 유통정책',
      },
    },
  },
  '산업통상자원부': {
    legalReference: '산업통상자원부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['산업부'],
    departmentKeywords: ['산업', '수출', '에너지', '전기'],
    subDepartments: {
      '산업정책과': {
        keywords: ['산업정책', '제조업', '공장', '산단', '산업지원'],
        reason: '산업정책 기획 및 제조업 경쟁력 강화',
      },
      '무역정책과': {
        keywords: ['수출', '수입', '통상', 'FTA', '무역'],
        reason: '무역·통상 정책 및 수출입 제도',
      },
      '전력정책과': {
        keywords: ['전기요금', '전력', '전력수급', '전기사업', '한전'],
        reason: '전력산업 정책 및 전력시장 제도',
      },
    },
  },
  '보건복지부': {
    legalReference: '보건복지부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['복지부'],
    departmentKeywords: ['복지', '의료', '연금', '돌봄'],
    subDepartments: {
      '의료정책과': {
        keywords: ['병원', '진료', '응급실', '의료비', '약국', '의료서비스'],
        reason: '의료정책 및 의료서비스 제도',
      },
      '기초연금과': {
        keywords: ['기초연금', '연금수급', '노인연금', '수급자격'],
        reason: '기초연금 제도 운영',
      },
      '노인정책과': {
        keywords: ['노인', '요양', '돌봄', '장기요양', '경로당'],
        reason: '노인복지 및 돌봄정책',
      },
    },
  },
  '환경부': {
    legalReference: '환경부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['환경', '대기', '수질', '폐기물'],
    subDepartments: {
      '대기환경과': {
        keywords: ['미세먼지', '악취', '매연', '대기오염', '소각'],
        reason: '대기환경 보전 및 배출관리',
      },
      '수질정책과': {
        keywords: ['수질', '폐수', '하천오염', '방류', '지하수', '녹조'],
        reason: '수질보전 및 수생태 관리',
      },
      '자원순환정책과': {
        keywords: ['폐기물', '재활용', '분리배출', '생활쓰레기', '불법투기'],
        reason: '폐기물·자원순환 정책',
      },
    },
  },
  '고용노동부': {
    legalReference: '고용노동부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['고용부', '노동부'],
    departmentKeywords: ['근로', '노동', '임금', '퇴직금', '고용'],
    subDepartments: {
      '퇴직연금복지과': {
        keywords: ['퇴직금', '퇴직연금', '퇴직급여', '퇴직금 요건', '1년 근속', '계속근로', '주 15시간', '360일', '365일'],
        reason: '퇴직급여 보장 및 퇴직연금 제도 운영·해석 소관',
      },
      '고객상담센터 인터넷상담과': {
        keywords: ['상담', '인터넷 상담', '온라인 상담', '문의', '질의', '답변 요청', '해석 문의'],
        reason: '국민 대상 인터넷 노동행정 상담 및 민원응대 소관',
      },
      '근로감독기획과': {
        keywords: ['임금체불', '근로계약', '해고', '부당해고', '직장내괴롭힘', '최저임금'],
        reason: '근로감독 및 노동관계법 집행 소관',
      },
      '고용서비스기반과': {
        keywords: ['고용센터', '취업지원', '구직', '직업상담', '워크넷'],
        reason: '고용서비스 기반 구축 및 전달체계 운영 소관',
      },
      '감사담당관': {
        keywords: ['감사', '징계', '복무', '근무태만', '비위', '감찰'],
        reason: '공직자 복무·감사·징계 검토 소관',
      },
    },
  },
  '여성가족부': {
    legalReference: '여성가족부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['여가부'],
    departmentKeywords: ['청소년', '가족', '성폭력', '가정폭력'],
    subDepartments: {
      '가족정책과': {
        keywords: ['가족', '한부모', '다문화', '가족지원'],
        reason: '가족정책 및 가족지원 서비스',
      },
      '권익지원과': {
        keywords: ['성폭력', '가정폭력', '디지털성범죄', '피해자 지원'],
        reason: '여성·청소년 권익보호 및 피해자 지원',
      },
      '청소년정책과': {
        keywords: ['청소년', '청소년시설', '학교밖청소년', '청소년상담'],
        reason: '청소년 정책 및 보호사업',
      },
    },
  },
  '국토교통부': {
    legalReference: '국토교통부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['국토부'],
    departmentKeywords: ['도로', '주택', '교통', '건축'],
    subDepartments: {
      '도로과': {
        keywords: ['포트홀', '도로파손', '보도', '도로공사', '가로등'],
        reason: '도로시설 유지관리 및 도로정책',
      },
      '교통안전과': {
        keywords: ['교통사고', '횡단보도', '신호체계', '교통안전', '과속'],
        reason: '교통안전 정책 및 사고예방',
      },
      '주택정책과': {
        keywords: ['주택', '임대', '분양', '전세', '월세', '주거'],
        reason: '주택정책 및 주거안정 제도',
      },
    },
  },
  '해양수산부': {
    legalReference: '해양수산부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['해수부'],
    departmentKeywords: ['어업', '항만', '해양', '수산'],
    subDepartments: {
      '수산정책과': {
        keywords: ['어업', '어선', '수산업', '어획', '수산물'],
        reason: '수산정책 및 어업제도 운영',
      },
      '항만운영과': {
        keywords: ['항만', '부두', '선박', '항만시설', '항만이용'],
        reason: '항만 운영 및 항만서비스 정책',
      },
      '해양환경정책과': {
        keywords: ['해양오염', '해양쓰레기', '해양환경', '연안'],
        reason: '해양환경 보전 및 관리',
      },
    },
  },
  '중소벤처기업부': {
    legalReference: '중소벤처기업부와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['중기부'],
    departmentKeywords: ['중소기업', '창업', '소상공인'],
    subDepartments: {
      '소상공인정책과': {
        keywords: ['소상공인', '자영업', '점포', '상권', '폐업'],
        reason: '소상공인 지원 정책 총괄',
      },
      '창업정책과': {
        keywords: ['창업', '벤처', '스타트업', '창업지원', '투자'],
        reason: '창업·벤처 생태계 조성',
      },
      '기업금융과': {
        keywords: ['정책자금', '보증', '대출', '기업금융', '자금지원'],
        reason: '중소기업 금융지원 정책',
      },
    },
  },
  '식품의약품안전처': {
    legalReference: '식품의약품안전처와 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: ['식약처'],
    departmentKeywords: ['식품', '의약품', '위생', '부작용'],
    subDepartments: {
      '식품관리총괄과': {
        keywords: ['식중독', '식품위생', '불량식품', '유통기한', '이물질'],
        reason: '식품안전 및 식품위생 정책·관리',
      },
      '의약품안전평가과': {
        keywords: ['의약품', '부작용', '의약품 허가', '안전성', '약물'],
        reason: '의약품 안전성 평가 및 위해관리',
      },
      '바이오의약품정책과': {
        keywords: ['백신', '바이오의약품', '임상', '허가심사'],
        reason: '바이오의약품 정책 및 안전관리',
      },
    },
  },
  '개인정보보호위원회': {
    legalReference: '개인정보 보호 관련 중앙행정기관 소관 규정',
    category: 'central',
    aliases: ['개보위'],
    departmentKeywords: ['개인정보', '유출', '동의', '보호'],
    subDepartments: {
      '개인정보정책과': {
        keywords: ['개인정보', '처리방침', '동의', '열람', '정정'],
        reason: '개인정보 보호정책·제도 총괄',
      },
      '조사총괄과': {
        keywords: ['개인정보 유출', '신고', '침해', '조사'],
        reason: '개인정보 침해 조사 및 대응',
      },
    },
  },
  '공정거래위원회': {
    legalReference: '공정거래위원회 직제',
    category: 'central',
    aliases: ['공정위'],
    departmentKeywords: ['공정거래', '담합', '불공정', '하도급'],
    subDepartments: {
      '경쟁정책과': {
        keywords: ['담합', '시장지배', '경쟁제한', '공정거래'],
        reason: '경쟁정책 및 경쟁제한행위 대응',
      },
      '소비자정책과': {
        keywords: ['소비자피해', '표시광고', '약관', '환불', '청약철회'],
        reason: '소비자정책 및 소비자권익 보호',
      },
      '하도급조사과': {
        keywords: ['하도급', '대금', '납품', '갑질', '불공정거래'],
        reason: '하도급 거래 공정성 확보',
      },
    },
  },
  '국민권익위원회': {
    legalReference: '부패방지 및 국민권익위원회의 설치와 운영에 관한 법률',
    category: 'central',
    aliases: ['권익위'],
    departmentKeywords: ['부패', '청렴', '고충', '행정심판'],
    subDepartments: {
      '고충민원심의관': {
        keywords: ['고충민원', '권익침해', '시정권고', '민원조정'],
        reason: '고충민원 조사·조정 및 권고',
      },
      '부패방지국': {
        keywords: ['부패', '청렴', '공익신고', '부정청탁'],
        reason: '부패방지 정책·신고제도 운영',
      },
      '행정심판총괄과': {
        keywords: ['행정심판', '처분 취소', '이의신청', '재결'],
        reason: '행정심판 제도 운영 및 심판지원',
      },
    },
  },
  '경찰청': {
    legalReference: '경찰청과 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['치안', '교통', '수사', '신고'],
    subDepartments: {
      '교통과': {
        keywords: ['불법주정차', '음주운전', '신호위반', '교통단속', '면허'],
        reason: '교통단속 및 교통질서 확립',
      },
      '수사과': {
        keywords: ['폭행', '사기', '협박', '절도', '고소', '고발'],
        reason: '범죄수사 및 사건처리',
      },
      '생활안전과': {
        keywords: ['치안', '순찰', '생활안전', '범죄예방'],
        reason: '생활안전 및 지역치안 업무',
      },
    },
  },
  '소방청': {
    legalReference: '소방청과 그 소속기관 직제 시행규칙',
    category: 'central',
    aliases: [],
    departmentKeywords: ['화재', '구급', '구조', '소방'],
    subDepartments: {
      '화재예방총괄과': {
        keywords: ['화재', '소방점검', '소방시설', '화재예방'],
        reason: '화재예방 정책 및 안전관리',
      },
      '119구급과': {
        keywords: ['119', '구급', '응급이송', '구조'],
        reason: '119 구급서비스 정책 운영',
      },
      '소방분석제도과': {
        keywords: ['소방제도', '소방통계', '안전지표', '소방정책'],
        reason: '소방정책 분석 및 제도개선',
      },
    },
  },
};

const LOCAL_GOVERNMENT_ENTITIES = [
  { name: '서울특별시', aliases: ['서울', '서울시'] },
  { name: '부산광역시', aliases: ['부산', '부산시'] },
  { name: '대구광역시', aliases: ['대구', '대구시'] },
  { name: '인천광역시', aliases: ['인천', '인천시'] },
  { name: '광주광역시', aliases: ['광주', '광주시'] },
  { name: '대전광역시', aliases: ['대전', '대전시'] },
  { name: '울산광역시', aliases: ['울산', '울산시'] },
  { name: '세종특별자치시', aliases: ['세종', '세종시'] },
  { name: '경기도', aliases: ['경기', '경기도청'] },
  { name: '강원특별자치도', aliases: ['강원', '강원도'] },
  { name: '충청북도', aliases: ['충북'] },
  { name: '충청남도', aliases: ['충남'] },
  { name: '전북특별자치도', aliases: ['전북', '전라북도'] },
  { name: '전라남도', aliases: ['전남'] },
  { name: '경상북도', aliases: ['경북'] },
  { name: '경상남도', aliases: ['경남'] },
  { name: '제주특별자치도', aliases: ['제주', '제주도'] },
];

const LOCAL_COMMON_SUB_DEPARTMENTS = {
  '민원여권과': {
    keywords: ['주민등록', '등본', '초본', '전입신고', '인감', '여권', '가족관계증명'],
    reason: '주민민원·여권·제증명 민원 처리',
  },
  '복지정책과': {
    keywords: ['기초생활', '복지급여', '긴급복지', '한부모', '돌봄', '복지상담'],
    reason: '지역 복지정책 및 복지급여 지원',
  },
  '환경정책과': {
    keywords: ['생활쓰레기', '불법투기', '분리수거', '악취', '소음', '청소'],
    reason: '생활환경 및 청소행정 민원 처리',
  },
  '교통행정과': {
    keywords: ['불법주정차', '주차단속', '버스정류장', '마을버스', '교통민원'],
    reason: '생활교통·주차·교통민원 처리',
  },
  '도시계획과': {
    keywords: ['재개발', '재건축', '도시계획', '불법건축', '건축허가', '용도지역'],
    reason: '도시계획·건축 관련 민원 처리',
  },
  '감사담당관': {
    keywords: ['공무원 비위', '징계', '감사', '복무', '직무태만', '갑질'],
    reason: '지자체 소속 공직자 감사·징계 관련 업무',
  },
};

function buildLocalGovernmentRules() {
  return LOCAL_GOVERNMENT_ENTITIES.reduce((acc, entity) => {
    const subDepartments = Object.entries(LOCAL_COMMON_SUB_DEPARTMENTS).reduce((subAcc, [subName, subMeta]) => {
      subAcc[subName] = {
        keywords: [...subMeta.keywords, entity.name, ...(entity.aliases || [])],
        reason: subMeta.reason,
      };
      return subAcc;
    }, {});

    acc[entity.name] = {
      legalReference: '지방자치단체 행정기구 설치 조례 및 시행규칙',
      category: 'local',
      aliases: entity.aliases || [],
      departmentKeywords: ['시청', '도청', '군청', '구청', '주민센터', ...(entity.aliases || [])],
      subDepartments,
    };
    return acc;
  }, {});
}

export const LEGAL_RULES = {
  ...CENTRAL_RULES,
  ...buildLocalGovernmentRules(),
};

const DEFAULT_RESULT = {
  department: '고용노동부',
  sub_department: '고용서비스기반과',
  score: 0.51,
  reason: '기본 추천값(분석 API 미연결 시 로컬 규칙으로 보강)',
  legal_basis: '고용노동부와 그 소속기관 직제 시행규칙',
  keywords: [],
};

function normalize(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function hasAny(text, keywords) {
  return keywords.some((kw) => text.includes(String(kw).toLowerCase()));
}

function isLocalGovernmentDepartment(department) {
  return LEGAL_RULES[department]?.category === 'local';
}

export function summarizeComplaintContent(title, content) {
  const text = String(content || '').replace(/\s+/g, ' ').trim();
  if (!text) return `[${title}] 내용 없음`;

  const clauses = text
    .split(/[.!?\n]|다\./)
    .map((s) => s.trim())
    .filter(Boolean);

  const rawIssue = clauses[0] || text;
  const issue = rawIssue.length > 65 ? `${rawIssue.slice(0, 65)}...` : rawIssue;
  const marker = ['요청', '처리', '검토', '확인', '조치', '단속', '회신', '답변', '바랍니다', '해주세요'].find((m) => text.includes(m));

  let request = '';
  if (marker) {
    const idx = text.indexOf(marker);
    request = text.slice(Math.max(0, idx - 24), Math.min(text.length, idx + 30)).trim();
  }

  const summary = request
    ? `[${title}] 핵심쟁점: ${issue} / 요청사항: ${request}`
    : `[${title}] 핵심쟁점: ${issue}`;

  return summary.length > 220 ? `${summary.slice(0, 217)}...` : summary;
}

export function estimateComplaintDueBusinessDays(title, content) {
  const text = `${title || ''} ${content || ''}`.toLowerCase();
  const proactive = ['적극행정', '적극 행정', '규제개혁신문고', '국민신청'];
  const lawQuery = ['법령', '법률', '시행령', '시행규칙', '조문', '해석', '적용', '근거법'];
  const suggestion = ['건의', '제안', '개선의견', '개선 요청', '개선요청'];
  const grievance = ['고충', '불편', '피해', '억울', '부당'];
  const general = ['문의', '질의', '확인', '알려', '가능한지', '어떻게'];

  if (proactive.some((k) => text.includes(k))) return { days: 60, type: '기타민원', basis: '적극행정 민원(예외)' };
  if (lawQuery.some((k) => text.includes(k)) || suggestion.some((k) => text.includes(k))) {
    return { days: 14, type: '법령질의/건의민원', basis: '시행령 제14조·제15조' };
  }
  if (grievance.some((k) => text.includes(k))) {
    return { days: 7, type: '고충민원', basis: '시행령 제17조' };
  }
  if (general.some((k) => text.includes(k))) {
    return { days: 7, type: '일반질의', basis: '시행령 제14조' };
  }
  return { days: 7, type: '기타민원', basis: '기관 내부 기준' };
}

function buildNonActionableRecommendation(reason, keywords = []) {
  return {
    success: true,
    department: '추천 어려움(요지 불분명 또는 민원 정의 외)',
    sub_department: '추가 사실관계 확인 필요',
    confidence: {
      department: 0,
      sub_department: 0,
      overall: 0,
    },
    classification_basis: {
      keywords,
      legal_basis: '민원 처리에 관한 법률 제2조(민원의 정의)',
      policy_basis: '행정기관 처리 대상 여부 사전 확인 필요',
      reason,
    },
    fallback_local: true,
  };
}

function checkNonActionable(text, bestScore) {
  const privateTerms = ['사인간', '개인 간', '개인사', '연인', '부부싸움', '친구와', '지인과', '채무', '돈을 빌려', '민사소송', '사적 분쟁'];
  const adminTerms = ['시청', '구청', '군청', '주민센터', '동사무소', '행정기관', '공무원', '허가', '신고', '단속', '처분'];
  const vagueTerms = ['문의', '상담', '도와주세요', '모르겠', '확인 부탁', '처리 부탁'];
  const matchedPrivate = privateTerms.filter((k) => text.includes(k));
  const hasAdminContext = hasAny(text, adminTerms);
  const wordCount = text.split(' ').filter((w) => w.trim().length > 0).length;
  const hasVagueOnlySignal = hasAny(text, vagueTerms) && bestScore <= 5 && wordCount <= 12;

  if (matchedPrivate.length > 0 && !hasAdminContext) {
    return {
      nonActionable: true,
      reason: '사인간 권리관계·민사 분쟁 성격으로 보여 민원 처리에 관한 법률상 행정기관 처리 민원에 해당하지 않을 수 있습니다.',
      keywords: matchedPrivate,
    };
  }

  if (hasVagueOnlySignal) {
    return {
      nonActionable: true,
      reason: '민원의 핵심 사실관계가 부족해 담당 부서를 특정하기 어렵습니다. 대상 기관, 발생 시점, 요청사항을 구체적으로 작성해 주세요.',
      keywords: [],
    };
  }

  if (bestScore <= 2) {
    return {
      nonActionable: true,
      reason: '민원의 요지가 불분명하여 담당 부서 자동 추천이 어렵습니다. 대상 기관·쟁점·요청사항을 구체적으로 작성해 주세요.',
      keywords: [],
    };
  }

  return { nonActionable: false, reason: '', keywords: [] };
}

function intentBoost(department, subDepartment, text) {
  let score = 0;

  if (department === '고용노동부' && subDepartment === '퇴직연금복지과') {
    if (hasAny(text, ['퇴직금', '퇴직연금', '퇴직급여'])) score += 5;
    if (hasAny(text, ['요건', '조건', '자격', '받을 수', '가능', '해당'])) score += 3;
    if (hasAny(text, ['1년', '12개월', '365일', '360일', '계속근로', '근속'])) score += 4;
    if (hasAny(text, ['주 15시간', '소정근로시간'])) score += 2;
  }

  if (department === '고용노동부' && subDepartment === '근로감독기획과') {
    if (hasAny(text, ['임금', '체불', '야근수당', '연장수당', '최저임금'])) score += 4;
    if (hasAny(text, ['근로계약서', '해고', '부당해고', '직장내괴롭힘'])) score += 4;
  }

  if (department === '고용노동부' && subDepartment === '고객상담센터 인터넷상담과') {
    if (hasAny(text, ['문의', '상담', '질문', '알려주세요', '답변', '인터넷'])) score += 3;
  }

  if (isLocalGovernmentDepartment(department)) {
    const aliases = [department, ...(LEGAL_RULES[department]?.aliases || [])];
    if (hasAny(text, aliases)) score += 5;
    if (hasAny(text, ['시청', '도청', '군청', '구청', '주민센터'])) score += 3;

    if (subDepartment === '민원여권과' && hasAny(text, ['등본', '초본', '전입신고', '인감', '가족관계증명', '여권'])) score += 4;
    if (subDepartment === '교통행정과' && hasAny(text, ['불법주정차', '주차단속', '마을버스', '교통민원'])) score += 4;
    if (subDepartment === '환경정책과' && hasAny(text, ['생활쓰레기', '불법투기', '분리수거', '악취', '소음'])) score += 4;
    if (subDepartment === '복지정책과' && hasAny(text, ['복지', '기초생활', '긴급복지', '돌봄'])) score += 4;
    if (subDepartment === '도시계획과' && hasAny(text, ['재개발', '재건축', '불법건축', '도시계획'])) score += 4;
    if (subDepartment === '감사담당관' && hasAny(text, ['공무원 비위', '징계', '감사', '복무', '직무태만'])) score += 4;
  }

  return score;
}

export function getLocalRecommendation(title, content) {
  const recs = getLocalRecommendations(title, content, 1);
  return recs[0];
}

export function getLocalRecommendations(title, content, limit = 3) {
  const text = normalize(`${title} ${content}`);
  const candidates = [];

  Object.entries(LEGAL_RULES).forEach(([department, deptMeta]) => {
    const deptMatched = (deptMeta.departmentKeywords || []).filter((kw) => text.includes(String(kw).toLowerCase()));
    const deptScore = deptMatched.length;

    Object.entries(deptMeta.subDepartments).forEach(([subDepartment, subMeta]) => {
      const matched = (subMeta.keywords || []).filter((kw) => text.includes(String(kw).toLowerCase()));
      let score = deptScore + matched.length * 2;
      score += intentBoost(department, subDepartment, text);

      candidates.push({
        department,
        sub_department: subDepartment,
        scoreCount: score,
        matchedKeywords: matched,
        reason: subMeta.reason,
        legal_basis: deptMeta.legalReference,
      });
    });
  });

  candidates.sort((a, b) => b.scoreCount - a.scoreCount);

  const best = candidates[0] || {
    department: DEFAULT_RESULT.department,
    sub_department: DEFAULT_RESULT.sub_department,
    scoreCount: 0,
    matchedKeywords: [],
    reason: DEFAULT_RESULT.reason,
    legal_basis: DEFAULT_RESULT.legal_basis,
  };

  const nonActionable = checkNonActionable(text, best.scoreCount);
  if (nonActionable.nonActionable) {
    return [buildNonActionableRecommendation(nonActionable.reason, nonActionable.keywords)];
  }

  return candidates.slice(0, Math.max(1, limit)).map((item) => {
    const confidence = Math.min(0.95, 0.38 + item.scoreCount * 0.055);
    return {
      success: true,
      department: item.department,
      sub_department: item.sub_department,
      confidence: {
        department: confidence,
        sub_department: confidence,
        overall: confidence,
      },
      classification_basis: {
        keywords: item.matchedKeywords.slice(0, 8),
        legal_basis: item.legal_basis,
        policy_basis: item.reason,
        reason: `${item.legal_basis} 및 ${item.sub_department} 소관사무를 기준으로 민원 핵심어를 매칭해 추천했습니다.`,
      },
      fallback_local: true,
    };
  });
}
