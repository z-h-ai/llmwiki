import React, { useEffect, useState } from "react";
import { getMode, setMode, getLocalUrl, setLocalUrl, type Mode } from "@/lib/settings";

interface Props {
  onBack: () => void;
  onModeChange: (mode: Mode) => void;
}

export default function Settings({ onBack, onModeChange }: Props) {
  const [mode, setModeState] = useState<Mode>("cloud");
  const [localUrl, setLocalUrlState] = useState("http://localhost:8000");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMode().then(setModeState);
    getLocalUrl().then(setLocalUrlState);
  }, []);

  async function handleModeChange(newMode: Mode) {
    setModeState(newMode);
    await setMode(newMode);
    onModeChange(newMode);
    flash();
  }

  async function handleUrlSave() {
    await setLocalUrl(localUrl);
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        &larr; 返回
      </button>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">模式</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange("cloud")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "cloud"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            云端
          </button>
          <button
            onClick={() => handleModeChange("local")}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "local"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            本地
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          {mode === "cloud"
            ? "保存到 llmwiki.app，需要登录"
            : "保存到你的本地 LLM Wiki 实例，无需登录"}
        </p>
      </div>

      {mode === "local" && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            API URL
          </label>
          <div className="flex gap-2">
            <input
              value={localUrl}
              onChange={(e) => setLocalUrlState(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleUrlSave(); }}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm
                         text-gray-900 shadow-sm focus:border-gray-900 focus:ring-1
                         focus:ring-gray-900 outline-none font-mono text-xs"
              placeholder="http://localhost:8000"
            />
            <button
              onClick={handleUrlSave}
              className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md
                         hover:bg-gray-800 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {saved && (
        <p className="text-xs text-green-600">设置已保存</p>
      )}
    </div>
  );
}
