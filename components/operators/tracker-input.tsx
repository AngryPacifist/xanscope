"use client";

import { useState } from "react";
import { getTrackedNodes, saveTrackedNodes } from "./tracker-storage";

type TrackerInputProps = {
  className?: string;
};

export function TrackerInput({ className }: TrackerInputProps) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTrack = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setFeedback("Provide a valid node id");
      return;
    }

    const current = getTrackedNodes();
    if (current.includes(trimmed)) {
      setFeedback("Already tracking this node");
      setValue("");
      return;
    }

    const updated = [...current, trimmed];
    saveTrackedNodes(updated);
    setFeedback("Node saved to cockpit");
    setValue("");
  };

  return (
    <div
      className={`rounded-3xl border border-cyan-400/20 bg-[#051236]/80 p-6 shadow-2xl backdrop-blur ${
        className ?? ""
      }`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">
        Operator cockpit
      </p>
      <h3 className="mt-2 text-lg font-semibold text-white">
        Track a pNode ID
      </h3>
      <p className="text-sm text-slate-300">
        Stored locally. Your cockpit view will pick it up instantly.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="node-berlin-01"
          className="w-full rounded-2xl border border-white/20 bg-[#030a2a]/80 px-4 py-3 text-sm text-white outline-none ring-cyan-400/40 focus:ring"
        />
        <button
          onClick={handleTrack}
          className="rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
        >
          Save node
        </button>
      </div>
      {feedback && (
        <p className="mt-2 text-xs font-semibold text-cyan-200">{feedback}</p>
      )}
    </div>
  );
}
