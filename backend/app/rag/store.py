from dataclasses import dataclass
from pathlib import Path
from typing import Sequence
import uuid

from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings


@dataclass
class RagResult:
    document: Document
    score: float


class RagStore:
    def __init__(
        self,
        embeddings: OpenAIEmbeddings,
        persist_dir: Path,
        collection_name: str = "instruments",
    ) -> None:
        self.vectorstore = Chroma(
            collection_name=collection_name,
            embedding_function=embeddings,
            persist_directory=str(persist_dir),
        )

    def add_documents(self, documents: Sequence[Document]) -> None:
        if not documents:
            return

        ids = []
        for document in documents:
            doc_id = document.metadata.get("id")
            ids.append(str(doc_id) if doc_id else str(uuid.uuid4()))

        existing_ids = set(self.vectorstore.get(include=[]).get("ids") or [])
        new_documents = []
        new_ids = []
        for document, doc_id in zip(documents, ids):
            if doc_id in existing_ids:
                continue
            new_documents.append(document)
            new_ids.append(doc_id)

        if not new_documents:
            return

        self.vectorstore.add_documents(new_documents, ids=new_ids)
        self.vectorstore.persist()

    def query(self, text: str, k: int) -> list[RagResult]:
        if k <= 0:
            return []

        results = self.vectorstore.similarity_search_with_score(text, k=k)
        return [
            RagResult(document=document, score=float(score))
            for document, score in results
        ]
