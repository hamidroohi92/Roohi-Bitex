"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/types/state";

export default function ConnectionStatus() {
  const { socketStatus } = useSelector((state: RootState) => state.app);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "reconnecting":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "reconnecting":
        return "Reconnecting...";
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return "●";
      case "reconnecting":
        return "⟳";
      case "disconnected":
        return "●";
      default:
        return "?";
    }
  };

  const isAnyReconnecting =
    socketStatus.orderBook === "reconnecting" ||
    socketStatus.trade === "reconnecting";
  const isAnyDisconnected =
    socketStatus.orderBook === "disconnected" ||
    socketStatus.trade === "disconnected";
  const isAllConnected =
    socketStatus.orderBook === "connected" &&
    socketStatus.trade === "connected";

  // Determine overall status
  let overallStatus = "connected";
  if (isAnyReconnecting) {
    overallStatus = "reconnecting";
  } else if (isAnyDisconnected) {
    overallStatus = "disconnected";
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Connection Status
          </span>
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor(overallStatus)}`}
          />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Order Book:
            </span>
            <div className="flex items-center space-x-1">
              <span
                className={`text-xs ${getStatusColor(
                  socketStatus.orderBook
                )} text-white rounded-full w-1.5 h-1.5 flex items-center justify-center`}
              >
                {getStatusIcon(socketStatus.orderBook)}
              </span>
              <span
                className={`text-xs ${
                  socketStatus.orderBook === "connected"
                    ? "text-green-600 dark:text-green-400"
                    : socketStatus.orderBook === "reconnecting"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {getStatusText(socketStatus.orderBook)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Trade Data:
            </span>
            <div className="flex items-center space-x-1">
              <span
                className={`text-xs ${getStatusColor(
                  socketStatus.trade
                )} text-white rounded-full w-1.5 h-1.5 flex items-center justify-center`}
              >
                {getStatusIcon(socketStatus.trade)}
              </span>
              <span
                className={`text-xs ${
                  socketStatus.trade === "connected"
                    ? "text-green-600 dark:text-green-400"
                    : socketStatus.trade === "reconnecting"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {getStatusText(socketStatus.trade)}
              </span>
            </div>
          </div>
        </div>

        {/* Overall status indicator */}
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Overall:
            </span>
            <span
              className={`text-xs font-medium ${
                overallStatus === "connected"
                  ? "text-green-600 dark:text-green-400"
                  : overallStatus === "reconnecting"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {getStatusText(overallStatus)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
