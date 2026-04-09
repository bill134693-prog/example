from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Tuple

class DuplicateDetector:
    """유사 민원 감지 엔진 - 반복민원 검토 알림 시스템"""
    
    def __init__(self, similarity_threshold: float = 0.6):
        """
        Args:
            similarity_threshold: 유사도 임계값 (0-1)
                - 0.6-0.8: 중간 유사도 (의도 유사)
                - 0.8 이상: 높은 유사도 (매우 유사)
        """
        self.similarity_threshold = similarity_threshold
        self.vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2), 
                                         min_df=1, max_df=1.0)
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """두 텍스트의 유사도 계산 (0-1)"""
        try:
            texts = [text1, text2]
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except Exception as e:
            print(f"유사도 계산 오류: {e}")
            return 0.0
    
    def find_similar_complaints(self, current_complaint: dict, historical_complaints: List[dict]) -> List[dict]:
        """
        현재 민원과 유사한 과거 민원 찾기
        
        Args:
            current_complaint: 현재 민원 {'title', 'content', 'citizen_id', 'id'}
            historical_complaints: 과거 민원 목록
            
        Returns:
            유사한 민원 리스트 [{'id', 'similarity_score', 'complaint_content'}, ...]
        """
        similar_complaints = []
        current_text = f"{current_complaint.get('title', '')} {current_complaint.get('content', '')}"
        current_citizen_id = current_complaint.get('citizen_id', '')
        
        for complaint in historical_complaints:
            hist_text = f"{complaint.get('title', '')} {complaint.get('content', '')}"
            hist_citizen_id = complaint.get('citizen_id', '')
            
            # 동일인 확인
            if current_citizen_id == hist_citizen_id:
                similarity = self.calculate_similarity(current_text, hist_text)
                
                if similarity >= self.similarity_threshold:
                    similar_complaints.append({
                        'id': complaint.get('id'),
                        'similarity_score': similarity,
                        'title': complaint.get('title'),
                        'content': complaint.get('content'),
                        'created_at': complaint.get('created_at'),
                        'department': complaint.get('department'),
                        'sub_department': complaint.get('sub_department')
                    })
        
        # 유사도 점수로 내림차순 정렬
        similar_complaints.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return similar_complaints
    
    def get_duplicate_alert_message(self, similarity_score: float, similar_count: int) -> dict:
        """반복민원 알림 메시지 생성"""
        if similarity_score >= 0.8:
            level = "높음"
            message = f"매우 유사한 민원이 {similar_count}건 발견되었습니다. 반복민원에 해당합니다."
        elif similarity_score >= 0.6:
            level = "중간"
            message = f"유사한 민원이 {similar_count}건 발견되었습니다. 반복민원 검토가 필요합니다."
        else:
            level = "낮음"
            message = f"약간 유사한 민원이 {similar_count}건 발견되었습니다."
        
        return {
            'alert_level': level,
            'message': message,
            'requires_review': similarity_score >= 0.6
        }
    
    def batch_find_duplicates(self, new_complaint: dict, historical_complaints: List[dict]) -> dict:
        """
        배치로 중복 검사를 수행하고 상세한 결과 반환
        
        Returns:
            {
                'is_duplicate': bool,
                'alert_level': str ('높음', '중간', '낮음'),
                'similar_complaints': [{...}],
                'alert_message': str,
                'requires_immediate_action': bool
            }
        """
        similar = self.find_similar_complaints(new_complaint, historical_complaints)
        
        is_duplicate = len(similar) > 0
        alert_info = None
        
        if similar:
            max_similarity = similar[0]['similarity_score']
            alert_info = self.get_duplicate_alert_message(max_similarity, len(similar))
        else:
            alert_info = {
                'alert_level': '없음',
                'message': '유사한 민원이 발견되지 않았습니다.',
                'requires_review': False
            }
        
        return {
            'is_duplicate': is_duplicate,
            'alert_level': alert_info['alert_level'],
            'similar_complaints': similar,
            'alert_message': alert_info['message'],
            'requires_immediate_action': alert_info.get('requires_review', False),
            'similarity_details': {
                'threshold': self.similarity_threshold,
                'top_score': similar[0]['similarity_score'] if similar else 0.0,
                'similar_count': len(similar)
            }
        }

# 전역 중복 감지기 인스턴스
duplicate_detector = DuplicateDetector(similarity_threshold=0.6)
