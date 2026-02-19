import { http, createConfig } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [bscTestnet],
  connectors: [
    injected(),
    walletConnect({
      projectId: "3b836f7430fb59383702eef2ed4ab028",
      showQrModal: true,
    }),
  ],
  ssr: true,
  transports: {
    [bscTestnet.id]: http(),
  },
});
