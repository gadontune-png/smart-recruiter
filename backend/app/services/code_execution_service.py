import subprocess
import tempfile
import os
import signal
from typing import Dict, Optional


class CodeExecutor:
    _instance = None
    _running_processes: Dict[str, subprocess.Popen] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def execute(self, code: str, language: str, timeout: int = 10) -> Dict:
        if language.lower() in ("javascript", "node", "js"):
            return self._run_javascript(code, timeout)
        elif language.lower() in ("python", "py"):
            return self._run_python(code, timeout)
        else:
            return {"status": "error", "stdout": "", "stderr": f"Unsupported language: {language}"}

    def _run_javascript(self, code: str, timeout: int) -> Dict:
        try:
            with tempfile.NamedTemporaryFile(suffix=".js", mode="w", delete=False) as f:
                f.write(code)
                f.flush()
                temp_path = f.name

            proc = subprocess.Popen(
                ["node", temp_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid,
            )
            try:
                stdout, stderr = proc.communicate(timeout=timeout)
                return {
                    "status": "ok" if proc.returncode == 0 else "error",
                    "stdout": stdout,
                    "stderr": stderr,
                    "exit_code": proc.returncode,
                }
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                proc.communicate()
                return {"status": "timeout", "stdout": "", "stderr": "Execution timed out"}
        except FileNotFoundError:
            return {"status": "error", "stdout": "", "stderr": "Node.js not found"}
        finally:
            if "temp_path" in dir():
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass

    def _run_python(self, code: str, timeout: int) -> Dict:
        try:
            with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
                f.write(code)
                f.flush()
                temp_path = f.name

            proc = subprocess.Popen(
                ["python3", temp_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=os.setsid,
            )
            try:
                stdout, stderr = proc.communicate(timeout=timeout)
                return {
                    "status": "ok" if proc.returncode == 0 else "error",
                    "stdout": stdout,
                    "stderr": stderr,
                    "exit_code": proc.returncode,
                }
            except subprocess.TimeoutExpired:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                proc.communicate()
                return {"status": "timeout", "stdout": "", "stderr": "Execution timed out"}
        except FileNotFoundError:
            return {"status": "error", "stdout": "", "stderr": "Python3 not found"}
        finally:
            if "temp_path" in dir():
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass


def run_code_execution(code: str, language: str, timeout: int = 10) -> Dict:
    executor = CodeExecutor()
    return executor.execute(code, language, timeout)