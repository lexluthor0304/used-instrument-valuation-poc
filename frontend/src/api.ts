export type InstrumentDescription = {
  category: string;
  brand: string;
  model: string;
  year: string | null;
  condition: string;
  materials: string[];
  features: string[];
  notes: string;
};

export type ValuationResult = {
  price_jpy: number;
  range_jpy: [number, number];
  confidence: number;
  rationale: string;
  evidence: string[];
};

async function handleJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "API error");
  }
  return response.json() as Promise<T>;
}

export async function describeInstrument(file: File): Promise<InstrumentDescription> {
  const form = new FormData();
  form.append("image", file);

  const response = await fetch("/api/describe", {
    method: "POST",
    body: form,
  });

  return handleJson<InstrumentDescription>(response);
}

export async function estimateValue(
  description: InstrumentDescription,
): Promise<ValuationResult> {
  const response = await fetch("/api/estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(description),
  });

  return handleJson<ValuationResult>(response);
}
