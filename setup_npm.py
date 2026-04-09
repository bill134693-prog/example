#!/usr/bin/env python3
import subprocess
import os
import sys

frontend_path = r'c:\Users\notebiz\Desktop\example\frontend'

print("\n" + "="*60)
print("📦 npm 모듈 설치 시작...")
print("="*60 + "\n")

os.chdir(frontend_path)

# npm install 실행
result = subprocess.run(
    ['npm', 'install'],
    shell=True,
    cwd=frontend_path,
    capture_output=False,
    text=True
)

if result.returncode == 0:
    print("\n✓ npm 설치 완료!")
    print("\n다음 명령어를 실행하세요:")
    print("  python run_system.py")
else:
    print("\n✗ npm 설치 실패!")
    print("수동으로 다음을 실행하세요:")
    print(f"  cd {frontend_path}")
    print("  npm install")
    sys.exit(1)
