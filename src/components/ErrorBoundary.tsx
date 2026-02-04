import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white p-10 overflow-auto">
                    <div className="max-w-4xl w-full">
                        <h1 className="text-4xl text-red-500 font-bold mb-4">Something went wrong.</h1>
                        <h2 className="text-xl mb-4">Application Crash Error:</h2>
                        <pre className="bg-gray-900 p-4 rounded text-sm mb-6 text-red-300 whitespace-pre-wrap font-mono border border-red-900">
                            {this.state.error?.toString()}
                        </pre>
                        <h3 className="text-lg mb-2">Component Stack:</h3>
                        <pre className="bg-gray-800 p-4 rounded text-xs text-gray-300 whitespace-pre-wrap font-mono">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                        <button
                            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
