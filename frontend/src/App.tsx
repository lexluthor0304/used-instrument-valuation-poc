import { useEffect, useMemo, useState } from "react";
import {
  describeInstrument,
  estimateValue,
  InstrumentDescription,
  ValuationResult,
} from "./api";

const emptyDescription: InstrumentDescription = {
  category: "",
  brand: "",
  model: "",
  year: null,
  condition: "",
  materials: [],
  features: [],
  notes: "",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<InstrumentDescription>(
    emptyDescription,
  );
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [status, setStatus] = useState<"idle" | "describing" | "estimating">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const updateField = <K extends keyof InstrumentDescription>(
    key: K,
    value: InstrumentDescription[K],
  ) => {
    setDescription((prev) => ({ ...prev, [key]: value }));
  };

  const handleDescribe = async () => {
    if (!file) {
      setError("画像を選択してください。");
      return;
    }

    setStatus("describing");
    setError(null);
    setValuation(null);

    try {
      const result = await describeInstrument(file);
      setDescription(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析に失敗しました。");
    } finally {
      setStatus("idle");
    }
  };

  const handleEstimate = async () => {
    setStatus("estimating");
    setError(null);

    try {
      const result = await estimateValue(description);
      setValuation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "見積もりに失敗しました。");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Used Instrument Valuation</p>
        <h1>中古楽器 価格査定AIエージェント</h1>
        <p className="lead">
          画像から特徴を抽出し、市場データに基づいた参考価格を提示します。
        </p>
      </header>

      <main className="content">
        <section className="panel">
          <div className="panel-header">
            <h2>1. 画像をアップロード</h2>
            <p>楽器全体が写る画像を推奨します。</p>
          </div>
          <label className="upload">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
              }}
            />
            <span>画像を選択</span>
          </label>
          {previewUrl ? (
            <div className="preview">
              <img src={previewUrl} alt="アップロード画像" />
            </div>
          ) : (
            <div className="preview placeholder">プレビューがここに表示されます。</div>
          )}
          <button
            className="primary"
            onClick={handleDescribe}
            disabled={status !== "idle" || !file}
          >
            {status === "describing" ? "解析中..." : "画像から特徴を抽出"}
          </button>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>2. 特徴を確認</h2>
            <p>必要に応じて編集してください。</p>
          </div>
          <div className="grid">
            <label>
              カテゴリ
              <input
                value={description.category}
                onChange={(event) => updateField("category", event.target.value)}
                placeholder="例: アコースティックギター"
              />
            </label>
            <label>
              ブランド
              <input
                value={description.brand}
                onChange={(event) => updateField("brand", event.target.value)}
                placeholder="例: Yamaha"
              />
            </label>
            <label>
              モデル
              <input
                value={description.model}
                onChange={(event) => updateField("model", event.target.value)}
                placeholder="例: FG-180"
              />
            </label>
            <label>
              年式
              <input
                value={description.year ?? ""}
                onChange={(event) =>
                  updateField("year", event.target.value || null)
                }
                placeholder="例: 1974"
              />
            </label>
            <label>
              状態
              <input
                value={description.condition}
                onChange={(event) => updateField("condition", event.target.value)}
                placeholder="例: 目立つ傷なし"
              />
            </label>
            <label>
              素材
              <input
                value={description.materials.join(", ")}
                onChange={(event) =>
                  updateField(
                    "materials",
                    event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="例: スプルース, ローズウッド"
              />
            </label>
          </div>
          <label className="stack">
            特徴
            <textarea
              value={description.features.join("\n")}
              onChange={(event) =>
                updateField(
                  "features",
                  event.target.value
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
              placeholder="特徴を箇条書きで入力"
              rows={4}
            />
          </label>
          <label className="stack">
            メモ
            <textarea
              value={description.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="付属品、修理歴、シリアルなど"
              rows={3}
            />
          </label>
          <button
            className="primary"
            onClick={handleEstimate}
            disabled={status !== "idle"}
          >
            {status === "estimating" ? "算出中..." : "参考価格を見積もる"}
          </button>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>3. 見積もり結果</h2>
            <p>RAGの取得結果とLLM推論に基づく参考値です。</p>
          </div>
          {valuation ? (
            <div className="result">
              <div>
                <span className="label">想定価格</span>
                <strong>{formatCurrency(valuation.price_jpy)}</strong>
              </div>
              <div>
                <span className="label">レンジ</span>
                <strong>
                  {formatCurrency(valuation.range_jpy[0])} -{" "}
                  {formatCurrency(valuation.range_jpy[1])}
                </strong>
              </div>
              <div>
                <span className="label">信頼度</span>
                <strong>{Math.round(valuation.confidence * 100)}%</strong>
              </div>
              <div className="detail">
                <span className="label">根拠</span>
                <p>{valuation.rationale}</p>
              </div>
              <div className="detail">
                <span className="label">参照情報</span>
                <ul>
                  {valuation.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="result placeholder">
              解析後に見積もり結果が表示されます。
            </div>
          )}
          {error ? <p className="error">{error}</p> : null}
        </section>
      </main>
    </div>
  );
}
