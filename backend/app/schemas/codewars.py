from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CodewarsKataImport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    kata_id: str
    name: str
    description: str
    difficulty: str
    tags: List[str] = []
    languages: List[str] = []
    url: str


class CodewarsChallengeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    challenge_id: int
    external_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None
    url: Optional[str] = None
    created_at: datetime