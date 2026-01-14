import base64
import json
import re

from openai import OpenAI

from app.schemas import InstrumentDescription
from app.settings import get_settings
from app.vlm.prompts import DESCRIPTION_PROMPT


def _extract_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in VLM response")
    return json.loads(match.group(0))


def describe_instrument(image_bytes: bytes, mime_type: str) -> InstrumentDescription:
    settings = get_settings()
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not set")

    client = OpenAI(api_key=settings.openai_api_key)
    encoded = base64.b64encode(image_bytes).decode("utf-8")

    response = client.responses.create(
        model=settings.openai_vlm_model,
        input=[
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": DESCRIPTION_PROMPT},
                    {
                        "type": "input_image",
                        "image_url": f"data:{mime_type};base64,{encoded}",
                    },
                ],
            }
        ],
    )

    data = _extract_json(response.output_text)
    return InstrumentDescription.model_validate(data)
