"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import {
  Wallet,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Copy,
  ExternalLink,
  X,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded text-sm font-mono font-semibold transition-all"
            style={{
              background: "rgba(240,185,11,0.1)",
              border: "1px solid rgba(240,185,11,0.35)",
              color: "#f0b90b",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "#0ecb81" }}
              />
              <span className="truncate text-xs">
                {truncateAddress(address)}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-60 p-0 rounded"
          style={{
            background: "#1e2329",
            border: "1px solid #2b3139",
            borderRadius: "4px",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid #2b3139" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3 h-3" style={{ color: "#0ecb81" }} />
              <span
                className="text-[10px] font-mono uppercase tracking-widest"
                style={{ color: "#0ecb81" }}
              >
                Connected
              </span>
            </div>
            <div className="font-mono text-xs" style={{ color: "#eaecef" }}>
              {truncateAddress(address)}
            </div>
          </div>

          <div className="p-1.5 space-y-0.5">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(address);
                toast.success("Address copied!");
              }}
              className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs font-mono transition-colors"
              style={{ color: "#848e9c" }}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Address
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => window.open("https://bscscan.com", "_blank")}
              className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs font-mono transition-colors"
              style={{ color: "#848e9c" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View on Explorer
            </DropdownMenuItem>

            <div
              style={{ height: "1px", background: "#2b3139", margin: "4px 0" }}
            />

            <DropdownMenuItem
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xs font-mono transition-colors"
              style={{ color: "#f6465d" }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsConnectModalOpen(true)}
        className="bnb-btn-primary w-full"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>

      <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[380px] p-0 rounded"
          style={{
            background: "#1e2329",
            border: "1px solid #2b3139",
            borderRadius: "8px",
          }}
        >
          {/* Modal Header */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #2b3139" }}
          >
            <div>
              <DialogTitle
                className="text-base font-display font-black tracking-wide"
                style={{ color: "#eaecef" }}
              >
                Connect Wallet
              </DialogTitle>
              <p
                className="text-[11px] font-mono mt-0.5"
                style={{ color: "#848e9c" }}
              >
                Choose your provider
              </p>
            </div>
            <button
              onClick={() => setIsConnectModalOpen(false)}
              className="p-1.5 rounded transition-colors hover:bg-white/5"
              style={{ color: "#848e9c" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Connectors */}
          <div className="p-4 space-y-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  setIsConnectModalOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded transition-all group"
                style={{ background: "#2b3139", border: "1px solid #2b3139" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(240,185,11,0.5)";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(240,185,11,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "#2b3139";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#2b3139";
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{
                      background: "#1e2329",
                      border: "1px solid #2b3139",
                    }}
                  >
                    {connector.icon ? (
                      <img
                        src={connector.icon}
                        alt={connector.name}
                        className="w-5 h-5"
                      />
                    ) : (
                      <Wallet
                        className="w-4 h-4"
                        style={{ color: "#848e9c" }}
                      />
                    )}
                  </div>
                  <span
                    className="font-mono text-sm font-semibold"
                    style={{ color: "#eaecef" }}
                  >
                    {connector.name}
                  </span>
                </div>
                <Zap
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#f0b90b" }}
                />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-3 text-center"
            style={{ borderTop: "1px solid #2b3139" }}
          >
            <p className="text-[10px] font-mono" style={{ color: "#474d57" }}>
              Secured by end-to-end encryption
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
