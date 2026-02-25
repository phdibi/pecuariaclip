import { Component } from 'react';
import { theme } from '../../styles/theme';

/**
 * Error Boundary: Captura erros React e mostra UI de fallback.
 * Previne que um erro em um componente derrube o app inteiro.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          margin: '20px',
          background: theme.colors.bg.secondary,
          border: `1px solid rgba(139,0,0,0.3)`,
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            ⚠️
          </div>
          <div style={{
            fontFamily: theme.fonts.heading,
            fontSize: '18px',
            letterSpacing: '2px',
            color: '#CC4444',
            marginBottom: '8px',
          }}>
            ALGO DEU ERRADO
          </div>
          <div style={{
            fontFamily: theme.fonts.body,
            fontSize: '12px',
            color: theme.colors.text.muted,
            lineHeight: 1.6,
            marginBottom: '16px',
          }}>
            {this.state.error?.message || 'Ocorreu um erro inesperado.'}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: '6px',
              background: 'transparent',
              color: theme.colors.text.secondary,
              fontFamily: theme.fonts.heading,
              fontSize: '12px',
              letterSpacing: '1.5px',
              cursor: 'pointer',
            }}
          >
            TENTAR NOVAMENTE
          </button>
          {this.props.showDetails && this.state.errorInfo && (
            <details style={{
              marginTop: '16px',
              textAlign: 'left',
              padding: '10px',
              background: theme.colors.bg.tertiary,
              borderRadius: '6px',
            }}>
              <summary style={{
                fontFamily: theme.fonts.body,
                fontSize: '11px',
                color: theme.colors.text.dim,
                cursor: 'pointer',
              }}>
                Detalhes técnicos
              </summary>
              <pre style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                color: theme.colors.text.dim,
                whiteSpace: 'pre-wrap',
                marginTop: '8px',
                maxHeight: '200px',
                overflow: 'auto',
              }}>
                {this.state.error?.stack}
                {'\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
