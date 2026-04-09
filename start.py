#!/usr/bin/env python3
"""프로젝트 원클릭 실행 스크립트."""

import os
import subprocess
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
BACKEND_PATH = PROJECT_ROOT / "backend"
FRONTEND_PATH = PROJECT_ROOT / "frontend"


def run_command(command, cwd=None):
    return subprocess.run(command, cwd=cwd, capture_output=True, text=True)


def check_python():
    result = run_command([sys.executable, "--version"])
    print(result.stdout.strip() or result.stderr.strip())
    return result.returncode == 0


def check_node():
    node_ok = run_command(["node", "--version"])
    npm_ok = run_command(["npm", "--version"])
    if node_ok.returncode == 0 and npm_ok.returncode == 0:
        print(f"Node.js: {node_ok.stdout.strip()}")
        print(f"npm: {npm_ok.stdout.strip()}")
        return True
    return False


def install_backend_deps():
    print("[1/4] backend 의존성 설치")
    result = run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], cwd=BACKEND_PATH)
    if result.returncode != 0:
        print(result.stderr)
        return False
    return True


def install_frontend_deps():
    print("[2/4] frontend 의존성 설치")
    result = run_command(["npm", "install"], cwd=FRONTEND_PATH)
    if result.returncode != 0:
        print(result.stderr or result.stdout)
        return False
    return True


def start_servers():
    print("[3/4] 서버 실행")
    backend_proc = subprocess.Popen([sys.executable, "run.py"], cwd=BACKEND_PATH)
    time.sleep(2)
    frontend_proc = subprocess.Popen(["npm", "start"], cwd=FRONTEND_PATH)
    print("Frontend: http://localhost:3000")
    print("Backend : http://localhost:5000")
    return backend_proc, frontend_proc


def main():
    print("민원 자동분류 시스템 실행")
    if not check_python():
        print("Python 실행 환경을 확인해주세요.")
        return 1
    if not check_node():
        print("Node.js / npm 실행 환경을 확인해주세요.")
        return 1

    if not install_backend_deps():
        return 1
    if not install_frontend_deps():
        return 1

    backend_proc, frontend_proc = start_servers()

    print("[4/4] 실행 완료 (종료: Ctrl+C)")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        for proc in [frontend_proc, backend_proc]:
            if proc and proc.poll() is None:
                proc.terminate()
        print("종료되었습니다.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())
