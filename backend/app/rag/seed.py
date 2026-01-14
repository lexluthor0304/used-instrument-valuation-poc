import json
from pathlib import Path

from langchain_core.documents import Document


def load_seed_documents(path: Path) -> list[Document]:
    if not path.exists():
        return []

    documents: list[Document] = []
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        record = json.loads(line)
        description = record.pop("description", "")
        documents.append(Document(page_content=description, metadata=record))

    return documents
