import os
import sys
from functools import lru_cache
from typing import Annotated

from pydantic import field_validator, ValidationError
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

current_dir = os.path.dirname(os.path.abspath(__file__))
env_file_path = os.path.join(os.path.dirname(current_dir), ".env")


class Settings(BaseSettings):
    clerk_secret_key: str
    clerk_jwt_key: str | None = None
    clerk_authorized_parties: Annotated[list[str], NoDecode] = []
    clerk_webhook_signing_secret: str | None = None
    supabase_url: str
    supabase_secret_key: str
    allowed_origins: Annotated[list[str], NoDecode] = []

    @field_validator("clerk_authorized_parties", "allowed_origins", mode="before")
    @classmethod
    def _split_csv(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [p.strip() for p in v.split(",") if p.strip()]
        return v

    @field_validator("clerk_jwt_key", mode="before")
    @classmethod
    def _clean_jwt_key(cls, v: str | None) -> str | None:
        if isinstance(v, str):
            v = v.strip()
            if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                v = v[1:-1].strip()
            v = v.replace("\\n", "\n")
        return v

    model_config = SettingsConfigDict(
        env_file=env_file_path,
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as e:
        env_keys = sorted(list(os.environ.keys()))
        print(
            f"ERROR: Settings validation failed. Available environment keys: {env_keys}",
            file=sys.stderr,
        )
        raise e