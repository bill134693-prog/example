#!/usr/bin/env python3
"""백엔드/프론트 동시 실행 스크립트."""

import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"


def main():
    backend_proc = subprocess.Popen([sys.executable, "run.py"], cwd=BACKEND)
    time.sleep(2)
    frontend_proc = subprocess.Popen(["npm", "start"], cwd=FRONTEND)

    print("Frontend: http://localhost:3000")
    print("Backend : http://localhost:5000")
    print("종료: Ctrl+C")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        for proc in [frontend_proc, backend_proc]:
            if proc.poll() is None:
                proc.terminate()


if __name__ == "__main__":
    main()
