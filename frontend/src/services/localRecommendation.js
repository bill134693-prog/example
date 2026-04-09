export const LEGAL_RULES = {
  '고용노동부': {
    legalReference: '고용노동부와 그 소속기관 직제 시행규칙',
    subDepartments: {
      '퇴직연금복지과': {
        keywords: ['퇴직금', '퇴직연금', '퇴직급여', '퇴직금 요건', '1년 근속', '계속근로', '주 15시간', '360일', '365일'],
        reason: '퇴직급여 보장 및 퇴직연금 제도 운영·해석 소관',
      },
      '고객상담센터 인터넷상담과': {
        keywords: ['상담', '인터넷 상담', '온라인 상담', '문의', '질의', '답변 요청', '해석 문의', '가능한지'],
        reason: '국민 대상 인터넷 노동행정 상담 및 민원응대 소관',
      },
      '감사담당관': {
        keywords: ['감사', '징계', '복무', '근무태만', '비위', '공직기강', '주무관', '감찰'],
        reason: '공직자 복무·감사·징계 검토 소관',
      },
      '고용서비스기반과': {
        keywords: ['고용서비스', '고용센터', '취업지원', '구직', '직업상담', '워크넷', '취업알선'],
        reason: '고용서비스 기반 구축 및 전달체계 운영 소관',
      },
      '근로감독기획과': {
        keywords: ['근로감독', '임금체불', '노동법', '근로기준법', '산재', '직장내괴롭힘'],
        reason: '근로감독 및 노동관계법 집행 소관',
      },
    },
  },
  '행정안전부': {
    legalReference: '행정안전부와 그 소속기관 직제 시행규칙',
    subDepartments: {
      '지방행정정책과': {
        keywords: ['지방행정', '주민자치', '지방자치', '행정서비스', '민원창구'],
        reason: '지방행정 제도 및 민원행정 정책 소관',
      },
      '재난관리정책과': {
        keywords: ['재난', '안전점검', '침수', '화재', '재해', '대피', '재난문자'],
        reason: '재난 안전관리 정책 소관',
      },
    },
  },
  '국토교통부': {
    legalReference: '국토교통부와 그 소속기관 직제 시행규칙',
    subDepartments: {
      '도로과': {
        keywords: ['포트홀', '도로', '아스팔트', '보도블록', '가로등', '인도', '도로공사'],
        reason: '도로 유지보수 및 시설 관리 소관',
      },
      '대중교통과': {
        keywords: ['버스', '지하철', '배차', '정류장', '노선', '환승', '요금'],
        reason: '대중교통 운영 및 정책 소관',
      },
      '교통안전과': {
        keywords: ['신호등', '교통사고', '횡단보도', '과속', '교통안전', '단속카메라'],
        reason: '교통안전 및 사고예방 소관',
      },
    },
  },
  '보건복지부': {
    legalReference: '보건복지부와 그 소속기관 직제 시행규칙',
    subDepartments: {
      '의료정책과': {
        keywords: ['병원', '진료', '응급실', '약국', '의료비', '의약품', '수술'],
        reason: '의료서비스 및 의약품 정책 소관',
      },
      '질병정책과': {
        keywords: ['감염병', '백신', '격리', '검사', '방역', '코로나', '역학'],
        reason: '감염병 대응 및 방역 정책 소관',
      },
      '노인정책과': {
        keywords: ['노인', '요양', '기초연금', '돌봄', '장기요양', '경로당'],
        reason: '노인복지 및 돌봄정책 소관',
      },
    },
  },
  '환경부': {
    legalReference: '환경부와 그 소속기관 직제 시행규칙',
    subDepartments: {
      '대기환경과': {
        keywords: ['미세먼지', '악취', '대기', '배출', '공기', '소각', '매연'],
        reason: '대기환경 및 배출 관리 소관',
      },
      '수질정책과': {
        keywords: ['수질', '하천', '폐수', '오염수', '방류', '지하수', '녹조'],
        reason: '수질 및 수생태 관리 소관',
      },
    },
  },
  '교육부': {
    legalReference: '교육부와 그 소속기관 직제 시행규칙',
    subDepartments: {
      '학교교수학습혁신과': {
        keywords: ['학교', '급식', '등록금', '장학금', '교실', '교복', '학사'],
        reason: '학교 운영 및 학습지원 정책 소관',
      },
      '특수교육정책과': {
        keywords: ['특수교육', '장애학생', '통합교육', '보조기기', '개별화교육'],
        reason: '특수교육 지원정책 소관',
      },
    },
  },
  '경찰청': {
    legalReference: '경찰청과 그 소속기관 직제 시행규칙',
    subDepartments: {
      '교통과': {
        keywords: ['불법주정차', '교통법규', '음주운전', '면허', '신호위반', '중앙선'],
        reason: '교통단속 및 교통법규 집행 소관',
      },
      '수사과': {
        keywords: ['폭행', '사기', '협박', '절도', '고소', '고발', '피해신고'],
        reason: '범죄 수사 및 사건처리 소관',
      },
    },
  },
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

export function getLocalRecommendation(title, content) {
  const text = normalize(`${title} ${content}`);

  let best = {
    department: DEFAULT_RESULT.department,
    sub_department: DEFAULT_RESULT.sub_department,
    scoreCount: 0,
    matchedKeywords: [],
    reason: DEFAULT_RESULT.reason,
    legal_basis: DEFAULT_RESULT.legal_basis,
  };

  Object.entries(LEGAL_RULES).forEach(([department, deptMeta]) => {
    Object.entries(deptMeta.subDepartments).forEach(([subDepartment, subMeta]) => {
      const matched = (subMeta.keywords || []).filter((kw) => text.includes(String(kw).toLowerCase()));
      let score = matched.length * 2;

      // Intent-style weighted scoring for natural-language labor questions.
      if (department === '고용노동부' && subDepartment === '퇴직연금복지과') {
        if (['퇴직금', '퇴직연금', '퇴직급여'].some((kw) => text.includes(kw))) score += 4;
        if (['요건', '조건', '자격', '받을 수', '가능', '해당'].some((kw) => text.includes(kw))) score += 3;
        if (['1년', '12개월', '365일', '360일', '계속근로', '근속'].some((kw) => text.includes(kw))) score += 3;
        if (['주 15시간', '소정근로시간'].some((kw) => text.includes(kw))) score += 2;
      }

      if (department === '고용노동부' && subDepartment === '고객상담센터 인터넷상담과') {
        if (['문의', '상담', '질문', '알려주세요', '답변'].some((kw) => text.includes(kw))) score += 3;
        if (['온라인', '인터넷', '홈페이지'].some((kw) => text.includes(kw))) score += 2;
      }

      if (score > best.scoreCount) {
        best = {
          department,
          sub_department: subDepartment,
          scoreCount: score,
          matchedKeywords: matched,
          reason: subMeta.reason,
          legal_basis: deptMeta.legalReference,
        };
      }
    });
  });

  const base = 0.40;
  const confidence = Math.min(0.95, base + best.scoreCount * 0.05);

  return {
    success: true,
    department: best.department,
    sub_department: best.sub_department,
    confidence: {
      department: confidence,
      sub_department: confidence,
      overall: confidence,
    },
    classification_basis: {
      keywords: best.matchedKeywords,
      legal_basis: best.legal_basis,
      policy_basis: best.reason,
      reason: `${best.legal_basis} 기준으로 키워드 매칭 결과를 반영했습니다.`,
    },
    fallback_local: true,
  };
}
