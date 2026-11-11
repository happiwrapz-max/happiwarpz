"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || "An unexpected rendering error occurred",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Component Error Boundary Caught]:", error, errorInfo);

    // Asynchronously report component crash
    if (typeof window !== "undefined") {
      fetch("/api/monitoring/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: errorInfo.componentStack,
          route: window.location.pathname,
          severity: "MEDIUM",
        }),
      }).catch(() => {});
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#EFEAE2] text-center space-y-3 my-4">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 text-[#E10600] flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-semibold text-[#1E1E1E]">
              {this.props.fallbackTitle || "Unable to display this section"}
            </h3>
            <p className="text-xs text-[#666] mt-0.5 max-w-sm mx-auto">
              {this.props.fallbackMessage ||
                "A temporary glitch occurred while loading this element. The rest of the site remains operational."}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1E1E1E] hover:bg-black text-white text-xs font-serif font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3 h-3 text-[#FFE082]" />
            <span>Try Reloading Section</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

