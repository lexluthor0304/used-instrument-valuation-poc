from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_vlm_model: str = Field(default="gpt-4o-mini", alias="OPENAI_VLM_MODEL")
    openai_embed_model: str = Field(
        default="text-embedding-3-large", alias="OPENAI_EMBED_MODEL"
    )
    openai_rag_model: str = Field(default="gpt-4o-mini", alias="OPENAI_RAG_MODEL")
    rag_top_k: int = Field(default=4, alias="RAG_TOP_K")
    rag_persist_dir: str = Field(default=".rag_store", alias="RAG_PERSIST_DIR")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
