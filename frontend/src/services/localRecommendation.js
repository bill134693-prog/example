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
  '식품의약품안전처': {
    legalReference: '식품의약품안전처와 그 소속기관 직제 시행규칙',
    subDepartments: {
      '식품관리총괄과': {
        keywords: ['식중독', '유통기한', '식품위생', '이물질', '불량식품', '위생점검'],
        reason: '식품안전 및 식품위생 정책·관리 소관',
      },
      '의약품안전평가과': {
        keywords: ['의약품 부작용', '약 부작용', '허가', '안전성', '약물', '의약품'],
        reason: '의약품 안전성 평가 및 위해관리 소관',
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
  '지방자치단체': {
    legalReference: '지방자치단체 행정기구 설치 조례 및 시행규칙',
    subDepartments: {
      '민원여권과': {
        keywords: ['주민등록', '등본', '초본', '인감', '여권', '민원실', '전입신고', '가족관계증명'],
        reason: '지자체 민원행정·여권 업무 소관',
      },
      '도시정비과': {
        keywords: ['재개발', '재건축', '도시계획', '불법건축물', '노점', '가로정비'],
        reason: '지자체 도시정비·도시계획 소관',
      },
      '복지정책과': {
        keywords: ['기초생활', '복지급여', '한부모', '긴급복지', '복지상담'],
        reason: '지자체 생활복지·급여 지원 소관',
      },
      '환경관리과': {
        keywords: ['생활쓰레기', '불법투기', '분리수거', '소음', '악취', '청소행정'],
        reason: '생활환경 관리 및 생활민원 처리 소관',
      },
      '교통행정과': {
        keywords: ['불법주정차', '주차단속', '버스정류장', '마을버스', '교통민원', '주차구역'],
        reason: '생활교통 행정 및 교통민원 처리 소관',
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

export function summarizeComplaintContent(title, content) {
  const text = String(content || '').replace(/\s+/g, ' ').trim();
  if (!text) return `[${title}] 내용 없음`;
  const parts = text.split(/[.!?\n]|다\./).map((s) => s.trim()).filter(Boolean);
  const rawIssue = parts[0] || text;
  const issue = rawIssue.length > 80 ? `${rawIssue.slice(0, 80)}...` : rawIssue;
  const marker = ['요청', '처리', '검토', '확인', '조치', '바랍니다', '해주세요'].find((m) => text.includes(m));
  let request = '';
  if (marker) {
    const idx = text.indexOf(marker);
    request = text.slice(Math.max(0, idx - 20), Math.min(text.length, idx + 36)).trim();
  }
  const summary = request ? `[${title}] 핵심: ${issue} / 요청: ${request}` : `[${title}] 핵심: ${issue}`;
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

function hasAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
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
    if (hasAny(text, ['퇴직금', '퇴직연금', '퇴직급여'])) score += 4;
    if (hasAny(text, ['요건', '조건', '자격', '받을 수', '가능', '해당'])) score += 3;
    if (hasAny(text, ['1년', '12개월', '365일', '360일', '계속근로', '근속'])) score += 3;
    if (hasAny(text, ['주 15시간', '소정근로시간'])) score += 2;
  }

  if (department === '고용노동부' && subDepartment === '근로감독기획과') {
    if (hasAny(text, ['임금', '체불', '야근수당', '연장수당', '최저임금'])) score += 4;
    if (hasAny(text, ['근로계약서', '해고', '부당해고', '직장내괴롭힘'])) score += 3;
  }

  if (department === '고용노동부' && subDepartment === '고객상담센터 인터넷상담과') {
    if (hasAny(text, ['문의', '상담', '질문', '알려주세요', '답변'])) score += 3;
    if (hasAny(text, ['온라인', '인터넷', '홈페이지'])) score += 2;
  }

  if (department === '보건복지부' && subDepartment === '의료정책과') {
    if (hasAny(text, ['병원', '진료거부', '진료', '응급실', '의료비', '약국'])) score += 3;
  }

  if (department === '환경부' && ['대기환경과', '수질정책과'].includes(subDepartment)) {
    if (hasAny(text, ['악취', '미세먼지', '매연', '폐수', '하천오염', '방류'])) score += 3;
  }

  if (department === '국토교통부' && ['도로과', '교통안전과'].includes(subDepartment)) {
    if (hasAny(text, ['포트홀', '도로파손', '신호체계', '횡단보도', '교통사고'])) score += 3;
  }

  if (department === '지방자치단체') {
    if (hasAny(text, ['시청', '구청', '군청', '주민센터', '동사무소', '우리 동네', '우리동네'])) score += 4;
    if (subDepartment === '민원여권과' && hasAny(text, ['등본', '초본', '전입신고', '인감', '가족관계증명'])) score += 3;
    if (subDepartment === '교통행정과' && hasAny(text, ['불법주정차', '주차단속', '마을버스'])) score += 3;
    if (subDepartment === '환경관리과' && hasAny(text, ['생활쓰레기', '불법투기', '분리수거'])) score += 3;
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
    Object.entries(deptMeta.subDepartments).forEach(([subDepartment, subMeta]) => {
      const matched = (subMeta.keywords || []).filter((kw) => text.includes(String(kw).toLowerCase()));
      let score = matched.length * 2;
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
    const base = 0.40;
    const confidence = Math.min(0.95, base + item.scoreCount * 0.05);
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
        keywords: item.matchedKeywords,
        legal_basis: item.legal_basis,
        policy_basis: item.reason,
        reason: `${item.legal_basis} 기준으로 키워드 매칭 결과를 반영했습니다.`,
      },
      fallback_local: true,
    };
  });
}
