import { useState } from "react";
import { codewarsService } from "../../services/codewarsService";

export default function CodewarsImport({ onImport }) {
  const [kataId, setKataId] = useState("");
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleFetch = async () => {
    const trimmed = kataId.trim();
    if (!trimmed) {
      setError("Enter a Codewars kata ID first");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const question = await codewarsService.importKataAsQuestion(trimmed);
      setPreview(question);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Could not find that kata");
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onImport(preview);
      setPreview(null);
      setKataId("");
    }
  };

  return (
    <div className="codewars-import">
      <label htmlFor="kata-id">Codewars kata ID</label>
      <div className="codewars-import-row">
        <input
          id="kata-id"
          type="text"
          value={kataId}
          onChange={(e) => setKataId(e.target.value)}
          placeholder="e.g. 5900901f4f0c05de490000ea"
        />
        <button type="button" onClick={handleFetch} disabled={status === "loading"}>
          {status === "loading" ? "Fetching…" : "Fetch kata"}
        </button>
      </div>

      {error && <p className="codewars-import-error">{error}</p>}

      {preview && (
        <div className="codewars-import-preview">
          <h4>{preview.title}</h4>
          <p>Difficulty: {preview.difficulty}</p>
          <p>Languages: {preview.languages.join(", ") || "n/a"}</p>
          <button type="button" onClick={handleConfirm}>
            Add as question
          </button>
        </div>
      )}
    </div>
  );
}
