import type { PropsWithChildren, ReactNode } from "react"
import { Component } from "react"

interface Props {
  fallback?: (error: Error) => ReactNode
}

interface State {
  error: Error | null
}

const initialState = { error: null } as State

class ErrorBoundary extends Component<PropsWithChildren<Props>, State> {
  state = initialState

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    const { fallback, children } = this.props
    const { error } = this.state
    if (!error) return children
    if (fallback) return fallback(error)
    return <>{error.message}</>
  }
}

export default ErrorBoundary
