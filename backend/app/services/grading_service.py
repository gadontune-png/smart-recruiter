import subprocess
import tempfile
import os
import signal
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, List
from dataclasses import dataclass, field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_aware(dt: datetime) -> datetime:
    if dt is None:
        return utc_now()
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def is_expired(attempt, time_limit_minutes: int) -> bool:
    """Return True if the attempt has exceeded its time limit."""
    if attempt.started_at is None:
        return False
    elapsed = (utc_now() - as_aware(attempt.started_at)).total_seconds()
    return elapsed > time_limit_minutes * 60


def finalize_attempt(db, attempt, time_limit_minutes: int):
    """Mark the attempt as submitted/auto-submitted and compute its score."""
    from app.models.answers.answer import Answer
    from app.models.questions.question import Question
    from app.models.questions.option import QuestionOption
    from app.models.results.result import Result
    from app.models.attempts.attempt import AttemptStatus

    if attempt.score is None:
        total = 0.0
        earned = 0.0
        answers = (
            db.query(Answer).filter(Answer.attempt_id == attempt.attempt_id).all()
        )
        for answer in answers:
            question = (
                db.query(Question)
                .filter(Question.question_id == answer.question_id)
                .first()
            )
            if not question:
                continue
            qpoints = float(question.points or 0)
            total += qpoints
            if answer.selected_option_id is not None:
                option = (
                    db.query(QuestionOption)
                    .filter(QuestionOption.option_id == answer.selected_option_id)
                    .first()
                )
                if option and option.is_correct:
                    answer.score = qpoints
                    earned += qpoints
                else:
                    answer.score = 0.0
            elif answer.answer_text and question.question_type == "MULTIPLE_CHOICE":
                answer.score = 0.0
            elif answer.code_submission and answer.programming_language:
                result = execute_code(answer.code_submission, answer.programming_language)
                answer.score = qpoints if result.status == "ok" else 0.0
                earned += float(answer.score)
            else:
                answer.score = 0.0
            db.add(answer)

        attempt.score = earned if total else 0.0
        attempt.submitted_at = utc_now()
        attempt.status = AttemptStatus.AUTO_SUBMITTED if is_expired(attempt, time_limit_minutes) else AttemptStatus.SUBMITTED
        db.commit()
        db.refresh(attempt)

        existing = (
            db.query(Result)
            .filter(Result.submission_id == attempt.attempt_id)
            .first()
        )
        if existing is None:
            result = Result(
                submission_id=attempt.attempt_id,
                assessment_id=attempt.assessment_id,
                interviewee_id=attempt.interviewee_id,
                total_score=attempt.score,
                grade_released=False,
            )
            db.add(result)
            db.commit()
            db.refresh(result)

    return attempt


@dataclass
class TestCase:
    input_data: str = ""
    expected_output: str = ""
    is_hidden: bool = False


@dataclass
class ExecutionResult:
    status: str = "pending"
    stdout: str = ""
    stderr: str = ""
    exit_code: int = -1
    execution_time: float = 0.0
    memory_used: int = 0
    passed_tests: int = 0
    total_tests: int = 0
    hidden_passed: int = 0
    hidden_total: int = 0
    error: Optional[str] = None
    compilation_output: str = ""


class CodeExecutor:
    def __init__(self, timeout: int = 10):
        self.timeout = min(timeout, 30)  # hard cap at 30s

    def execute(self, code: str, language: str, test_cases: Optional[List[TestCase]] = None) -> ExecutionResult:
        result = ExecutionResult()
        result.total_tests = len(test_cases) if test_cases else 0

        if language.lower() in ("javascript", "node", "js"):
            return self._execute_javascript(code, test_cases, result)
        elif language.lower() in ("python", "py"):
            return self._execute_python(code, test_cases, result)
        else:
            result.status = "error"
            result.stderr = f"Unsupported language: {language}"
            return result

    def _execute_javascript(self, code: str, test_cases: Optional[List[TestCase]], result: ExecutionResult) -> ExecutionResult:
        try:
            with tempfile.NamedTemporaryFile(suffix=".js", mode="w", delete=False) as f:
                f.write(code)
                f.flush()
                temp_path = f.name

            all_stdout = []
            passed = 0
            total = len(test_cases) if test_cases else 0

            if test_cases:
                for i, tc in enumerate(test_cases):
                    if tc.is_hidden:
                        result.hidden_total += 1
                        continue
                    test_input = f"\n// Test {i+1}: {tc.input_data}\n" if tc.input_data else ""
                    full_code = test_input + "\n" + code
                    with tempfile.NamedTemporaryFile(suffix=".js", mode="w", delete=False) as tf:
                        tf.write(full_code)
                        tf.flush()
                        test_path = tf.name

                    try:
                        proc = subprocess.Popen(
                            ["node", test_path],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True,
                            preexec_fn=os.setsid,
                        )
                        stdout, stderr = proc.communicate(timeout=self.timeout)
                        all_stdout.append(stdout.strip())
                        if proc.returncode == 0:
                            passed += 1
                            result.passed_tests += 1
                        else:
                            result.stderr += f"Test {i+1} failed: {stderr}\n"
                    except subprocess.TimeoutExpired:
                        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                        proc.communicate()
                        result.stderr += f"Test {i+1} timed out\n"
                    finally:
                        try:
                            os.unlink(test_path)
                        except OSError:
                            pass
            else:
                proc = subprocess.Popen(
                    ["node", temp_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    preexec_fn=os.setsid,
                )
                stdout, stderr = proc.communicate(timeout=self.timeout)
                all_stdout.append(stdout.strip())
                if proc.returncode == 0:
                    passed += 1
                    result.passed_tests += 1

            result.stdout = "\n".join(all_stdout)
            result.stderr = result.stderr or ""
            result.status = "ok" if passed == total else "partial"
            return result
        except FileNotFoundError:
            result.status = "error"
            result.stderr = "Node.js not found"
            return result
        finally:
            if "temp_path" in dir():
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass

    def _execute_python(self, code: str, test_cases: Optional[List[TestCase]], result: ExecutionResult) -> ExecutionResult:
        try:
            with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
                f.write(code)
                f.flush()
                temp_path = f.name

            all_stdout = []
            passed = 0
            total = len(test_cases) if test_cases else 0

            if test_cases:
                for i, tc in enumerate(test_cases):
                    if tc.is_hidden:
                        result.hidden_total += 1
                        continue
                    test_input = f"\n# Test {i+1}: {tc.input_data}\n" if tc.input_data else ""
                    full_code = test_input + "\n" + code
                    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as tf:
                        tf.write(full_code)
                        tf.flush()
                        test_path = tf.name

                    try:
                        proc = subprocess.Popen(
                            ["python3", test_path],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True,
                            preexec_fn=os.setsid,
                        )
                        stdout, stderr = proc.communicate(timeout=self.timeout)
                        all_stdout.append(stdout.strip())
                        if proc.returncode == 0:
                            passed += 1
                            result.passed_tests += 1
                        else:
                            result.stderr += f"Test {i+1} failed: {stderr}\n"
                    except subprocess.TimeoutExpired:
                        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                        proc.communicate()
                        result.stderr += f"Test {i+1} timed out\n"
                    finally:
                        try:
                            os.unlink(test_path)
                        except OSError:
                            pass
            else:
                proc = subprocess.Popen(
                    ["python3", temp_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    preexec_fn=os.setsid,
                )
                stdout, stderr = proc.communicate(timeout=self.timeout)
                all_stdout.append(stdout.strip())
                if proc.returncode == 0:
                    passed += 1
                    result.passed_tests += 1

            result.stdout = "\n".join(all_stdout)
            result.stderr = result.stderr or ""
            result.status = "ok" if passed == total else "partial"
            return result
        except FileNotFoundError:
            result.status = "error"
            result.stderr = "Python3 not found"
            return result
        finally:
            if "temp_path" in dir():
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass


executor = CodeExecutor()


def execute_code(code: str, language: str, test_cases: Optional[List[TestCase]] = None, timeout: int = 10) -> ExecutionResult:
    e = CodeExecutor(timeout=timeout)
    return e.execute(code, language, test_cases)