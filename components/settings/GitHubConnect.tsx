"use client";

import { FiGithub, FiCheck, FiExternalLink } from "react-icons/fi";
import { useConnectGithub, useDisconnectGithub } from "@/hooks/useProfile";

interface GitHubConnectProps {
  isConnected: boolean;
  githubUsername: string | null;
}

export default function GitHubConnect({
  isConnected,
  githubUsername,
}: GitHubConnectProps) {
  const connectGithub = useConnectGithub();
  const disconnectGithub = useDisconnectGithub();

  const handleConnect = () => {
    connectGithub.mutate();
  };

  const handleDisconnect = () => {
    if (
      confirm(
        "Are you sure you want to disconnect GitHub? This will remove access to your repositories for evidence."
      )
    ) {
      disconnectGithub.mutate();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-900 rounded-lg">
            <FiGithub className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              GitHub Connection
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Connect your GitHub account to use repositories as evidence
            </p>
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <FiCheck className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Connected to GitHub
              </p>
              {githubUsername && (
                <p className="text-sm text-green-700 mt-1">
                  @{githubUsername}
                </p>
              )}
            </div>
            <a
              href={`https://github.com/${githubUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnectGithub.isPending}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {disconnectGithub.isPending ? "Disconnecting..." : "Disconnect GitHub"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              Connect your GitHub account to:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Use repositories as skill evidence</li>
              <li>• Automatically fetch repo summaries</li>
              <li>• Display commit history and stats</li>
            </ul>
          </div>

          <button
            onClick={handleConnect}
            disabled={connectGithub.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiGithub className="w-4 h-4" />
            {connectGithub.isPending ? "Connecting..." : "Connect GitHub"}
          </button>
        </div>
      )}
    </div>
  );
}
