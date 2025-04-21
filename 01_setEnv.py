import subprocess
import sys

# 推荐通过 sys.executable 调用 pip，确保使用当前 Python 环境
cmd = [
    sys.executable, "-m", "pip",
    "install",
    "pyjwt",
    "fastapi[standard]",
    "sqlmodel",
    "passlib[bcrypt]",
    "requests",
    "pypinyin",
    "pandas",
    "openpyxl",
]

# 执行命令，遇到非零退出码会抛出 CalledProcessError
subprocess.run(cmd, check=True)
