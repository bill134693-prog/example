#!/usr/bin/env python
"""Flask 애플리케이션 메인 진입점"""
import os
from app import create_app, db

# 환경 변수에서 설정 선택
config_name = os.getenv('FLASK_ENV', 'development')

# Flask 앱 생성
app = create_app(config_name)

if __name__ == '__main__':
    with app.app_context():
        # 데이터베이스 테이블 생성
        db.create_all()
        print("✓ 데이터베이스 초기화 완료")
    
    # 개발 서버 실행
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    )
