from functools import lru_cache
from typing import Annotated
from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    clerk_secret_key: str
    clerk_jwt_key: str | None = None
    clerk_authorized_parties: Annotated[list[str], NoDecode] = []
    clerk_webhook_signing_secret: str | None = None
    supabase_url: str
    supabase_secret_key: str

    @field_validator("clerk_authorized_parties", mode="before")
    @classmethod
    def _split_csv(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [p.strip() for p in v.split(",") if p.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()