// TrackingForm.jsx
import React, { useState } from "react";
import "./TrackingForm.css";

function TrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tracking/${trackingNumber.trim()}`);
      if (!res.ok) {
        setError("❌ Tracking number not found.");
        return;
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("⚠️ Something went wrong. Please try again.");
    }
  };

  // last done stage index
  const getCurrentStageIndex = (stages) => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stages[i].done) return i;
    }
    return -1;
  };

  return (
    <div className="tracking-container">
      <form className="tracking-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Tracking Number"
          className="tracking-input"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <button type="submit" className="tracking-button">Track Now</button>
      </form>

      {error && <p className="tracking-error">{error}</p>}

      {result && (
        <div className="tracking-result">
          <h3>📦 Shipment Info</h3>
          <p><strong>Name:</strong> {result.name}</p>
          <p><strong>Transport:</strong> {result.transport}</p>
          <p><strong>Last Updated:</strong> {new Date(result.lastUpdated).toLocaleString()}</p>

          <h4>Tracking Progress:</h4>
          <div className="stages-container">
            {result.stages.map((stage, idx) => {
              const currentStageIndex = getCurrentStageIndex(result.stages);
              const isDone = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={idx}
                  className={`stage-card ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}
                >
                  <span className="stage-emoji">{stage.emoji}</span>
                  {isDone && <span className="stage-checkmark">✔️</span>}
                  <span className="stage-name">{stage.name}</span>
                  {idx < result.stages.length - 1 && <div className="stage-connector"></div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackingForm;
