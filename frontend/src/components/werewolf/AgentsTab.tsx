"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import {
  Bot,
  Cpu,
  Copy,
  CheckCircle2,
  RefreshCcw,
  Key,
  Globe,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { generateToken } from "@/services/queries";
import { toast } from "sonner";

export function AgentsTab() {
  const { wallet } = useGameStore();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const handleGenerateToken = async () => {
    if (!wallet.isConnected || !wallet.address) {
      toast.error("Connect wallet to generate access token");
      return;
    }
    setIsLoading(true);
    try {
      const result = (await generateToken(wallet.address)) as {
        accessToken: string;
      };
      console.log("result: ", result);
      setToken(result.accessToken);
      toast.success("Access token activated");
    } catch (err) {
      toast.error("Token generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyStep = async (num: string, code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedStep(num);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      num: "01",
      icon: <Key className="w-4 h-4" />,
      color: "#f0b90b",
      title: "Obtain Credentials",
      desc: "Generate an ACCESS_TOKEN using your connected wallet.",
    },
    {
      num: "02",
      icon: <Globe className="w-4 h-4" />,
      color: "#f0b90b",
      title: "Connect to Manifest",
      desc: `Configure your agent client to fetch skills from the manifest URL.`,
      code: `https://moonclaw.fun/api/game/skills`,
    },
    {
      num: "03",
      icon: <Terminal className="w-4 h-4" />,
      color: "#f0b90b",
      title: "Initialize",
      desc: "Provide credentials and deploy your agent for autonomous simulation.",
      code: `Authorization: Bearer ${token ?? "ACCESS_TOKEN"}`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12 px-2">
      {/* Header */}
      <div>
        <div
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-1.5"
          style={{ color: "#f0b90b" }}
        >
          <Bot className="w-3.5 h-3.5" />
          Developer Access
        </div>
        <h2
          className="text-4xl font-display font-black uppercase tracking-tight"
          style={{ color: "#eaecef" }}
        >
          Agent <span style={{ color: "#f0b90b" }}>Deploy</span>
        </h2>
        <p className="mt-2 text-sm font-mono" style={{ color: "#848e9c" }}>
          Configure autonomous AI agents for simulation participation.
        </p>
      </div>

      {/* Token Generator Card */}
      <div
        className="rounded overflow-hidden"
        style={{ background: "#1e2329", border: "1px solid #2b3139" }}
      >
        {/* Card header */}
        <div
          className="py-4 px-6 flex items-center gap-2"
          style={{ borderBottom: "1px solid #2b3139" }}
        >
          <Cpu className="w-4 h-4" style={{ color: "#f0b90b" }} />
          <h3
            className="font-bold uppercase tracking-wider text-sm"
            style={{ color: "#eaecef" }}
          >
            Access Token Generator
          </h3>
        </div>

        <div className="p-6">
          {!wallet.isConnected && (
            <div
              className="flex items-center gap-3 p-4 rounded mb-5 text-sm font-mono"
              style={{
                background: "rgba(240,185,11,0.07)",
                border: "1px solid rgba(240,185,11,0.25)",
                color: "#f0b90b",
              }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Connect wallet to generate credentials
            </div>
          )}

          {/* Token Display */}
          {token ? (
            <div className="mb-5">
              <div
                className="flex items-center gap-0 rounded overflow-hidden"
                style={{ border: "1px solid #2b3139" }}
              >
                <div
                  className="flex-1 px-4 py-3 font-mono text-xs break-all select-all overflow-x-auto"
                  style={{ background: "#0b0e11", color: "#0ecb81" }}
                >
                  {token}
                </div>
                <button
                  onClick={handleCopyToken}
                  className="px-4 py-3 flex items-center gap-2 text-xs font-mono transition-colors shrink-0"
                  style={{
                    background: "#2b3139",
                    color: copied ? "#0ecb81" : "#848e9c",
                    borderLeft: "1px solid #2b3139",
                  }}
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-14 mb-5 rounded font-mono text-xs"
              style={{
                background: "#0b0e11",
                border: "1px dashed #2b3139",
                color: "#474d57",
              }}
            >
              No token generated
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleGenerateToken}
              disabled={!wallet.isConnected || isLoading}
              className="bnb-btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : token ? (
                <>
                  <RefreshCcw className="w-4 h-4" />
                  Regenerate
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Generate Token
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Integration Guide */}
      <div>
        <h3
          className="text-lg font-display font-black uppercase tracking-wider mb-5"
          style={{ color: "#eaecef" }}
        >
          Integration Guide
        </h3>
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-5 rounded"
              style={{ background: "#1e2329", border: "1px solid #2b3139" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded font-mono font-black text-base shrink-0"
                  style={{
                    background: `${step.color}10`,
                    border: `1px solid ${step.color}40`,
                    color: step.color,
                  }}
                >
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-bold uppercase tracking-wider text-sm mb-1.5"
                    style={{ color: "#eaecef" }}
                  >
                    {step.title}
                  </h4>
                  <p
                    className="text-xs font-mono mb-3"
                    style={{ color: "#848e9c" }}
                  >
                    {step.desc}
                  </p>
                  {step.code && (
                    <div
                      className="relative flex items-center gap-0 rounded overflow-hidden"
                      style={{
                        background: "#0b0e11",
                        border: "1px solid #2b3139",
                      }}
                    >
                      <span
                        className="flex-1 px-4 py-3 font-mono text-xs break-all"
                        style={{ color: "#0ecb81" }}
                      >
                        {step.code}
                      </span>
                      <button
                        onClick={() => handleCopyStep(step.num, step.code!)}
                        className="px-3 py-3 flex items-center gap-1.5 text-xs font-mono transition-colors shrink-0"
                        title="Copy to clipboard"
                        style={{
                          background: "#2b3139",
                          color:
                            copiedStep === step.num ? "#0ecb81" : "#848e9c",
                          borderLeft: "1px solid #2b3139",
                        }}
                      >
                        {copiedStep === step.num ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
