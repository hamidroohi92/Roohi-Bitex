# Bitex Trading Interface

A real-time cryptocurrency trading interface built with Next.js, featuring live order book data, candlestick charts, and simulated trading functionality.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm i

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

**Note**: Test framework is not currently configured. To add testing:

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom

# Add test script to package.json
"test": "jest"
```

## 📊 Features

### Real-time Data

- **Live Order Book**: Real-time bid/ask updates with 100ms refresh rate
- **Candlestick Charts**: Interactive price charts with historical data
- **Trade Streams**: Live trade execution data
- **Connection Status**: WebSocket connection monitoring with latency tracking

### Trading Interface

- **Order Ticket**: Buy/sell order placement with quantity and cost inputs
- **Balance Management**: Simulated USD and BTC balance tracking
- **Price Validation**: Real-time price and balance validation
- **PnL Estimation**: Profit/loss calculation for 0.5% price movements

### User Experience

- **Dark/Light Mode**: Theme switching with system preference detection
- **Keyboard Navigation**: Power user shortcuts (Ctrl+B/S, Arrow keys, Ctrl+Enter)
- **Responsive Design**: Optimized for desktop trading workflows
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Frontend**: React 19.2.0 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **State Management**: Redux Toolkit with React Redux
- **Charts**: Lightweight Charts library
- **Real-time**: WebSocket connections to Binance API

### Project Structure

```
bitex-test/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── homePage/          # Main trading interface
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   ├── trade/             # Trading components
│   └── ui/                # Reusable UI components
├── lib/                   # Business logic
│   ├── binanceApi.ts      # Binance API integration
│   ├── orderBook.ts       # Order book WebSocket service
│   ├── trade.ts           # Trade data management
│   └── risk.ts            # Risk management utilities
├── redux/                 # State management
│   ├── slices/            # Redux slices
│   └── store.ts           # Store configuration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🔌 Exchange Integration

### Binance API

**Why Binance?**

- World's largest cryptocurrency exchange by volume
- Comprehensive REST and WebSocket APIs
- High-frequency data with 100ms update intervals
- Free public market data endpoints
- Excellent documentation and reliability

### API Endpoints Used

- `GET /api/v3/klines` - Historical candlestick data
- `GET /api/v3/ticker/price` - Current price information
- `GET /api/v3/depth` - Order book snapshot
- `WSS /ws/{symbol}@depth@100ms` - Real-time order book updates
- `WSS /ws/{symbol}@trade` - Live trade execution stream

### Data Flow

1. **Initial Load**: Fetch historical data and order book snapshot
2. **WebSocket Connection**: Establish real-time data streams
3. **State Updates**: Redux store manages all application state
4. **UI Rendering**: React components display live data with optimizations

## ⚖️ Tradeoffs & Assumptions

### Technical Decisions

#### Simulated Trading

- **Tradeoff**: No real order execution, only simulated balance updates
- **Reason**: Avoids API authentication complexity and real money risk
- **Impact**: Demo-focused, no actual trading capability

#### Single Symbol Support

- **Tradeoff**: Only BTC/USDT trading pair supported
- **Reason**: Simplified implementation for demonstration
- **Impact**: Limited scope but easier maintenance

#### Client-Side State

- **Tradeoff**: All state managed in Redux (client-side only)
- **Reason**: No backend database required
- **Impact**: Data lost on refresh, but simpler architecture

#### Manual WebSocket Management

- **Tradeoff**: Custom reconnection logic with exponential backoff
- **Reason**: Ensures reliable real-time data connection
- **Impact**: More complex code, but better user experience

### Business Logic Assumptions

- **Order Execution**: Market orders execute at best bid/ask prices
- **PnL Calculation**: 0.5% price movement for profit/loss estimation
- **Starting Balance**: $10,000 USD and 0.1 BTC simulation balance
- **Price Validation**: Real-time balance and price validation
- **Data Retention**: 60 candles + current candle for charting

### Performance Considerations

- **Update Frequency**: 100ms order book updates for trading precision
- **Memory Usage**: Limited to 60 historical candles in memory
- **Network Reliability**: Assumes stable internet for WebSocket streams
- **Browser Compatibility**: Modern browsers with WebSocket support

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Key Dependencies

```json
{
  "@reduxjs/toolkit": "^2.9.2",
  "lightweight-charts": "^5.0.9",
  "next": "16.0.0",
  "react": "19.2.0",
  "react-redux": "^9.2.0",
  "tailwindcss": "^4"
}
```

## 🔒 Security Notes

- **Public Data Only**: No authentication required for market data
- **No Sensitive Storage**: No personal or financial data persistence
- **CORS Handling**: Browser CORS policies allow Binance API calls
- **Simulated Environment**: No real money or API keys involved

## 📈 Performance Features

- **Optimized Rendering**: React.memo and useMemo for expensive calculations
- **Efficient Updates**: Redux state updates with minimal re-renders
- **WebSocket Optimization**: Connection pooling and automatic reconnection
- **Chart Performance**: Lightweight Charts library for smooth animations
- **Latency Monitoring**: Real-time connection latency tracking

## 🎯 Future Enhancements

- [ ] Multi-symbol support
- [ ] Real trading integration with API keys
- [ ] Advanced order types (limit, stop-loss)
- [ ] Portfolio management
- [ ] Trading history and analytics
- [ ] Mobile responsive optimization
- [ ] Unit and integration tests
- [ ] Error boundary implementation
- [ ] Offline mode support

## 📝 License

This project is for demonstration purposes. Please ensure compliance with Binance API terms of service for any production use.

---

**Built with ❤️ using Next.js, React, and Binance API**
