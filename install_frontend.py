import subprocess
from pathlib import Path

frontend = Path(__file__).resolve().parent / 'frontend'
print('Frontend npm install 시작...')
subprocess.run(['npm', 'install'], cwd=frontend, check=False)
print('Frontend 설치 완료')
