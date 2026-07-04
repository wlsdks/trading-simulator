import PortfolioScreen from '../../src/screens/PortfolioScreen';
import { useTradeSheet } from '../../src/navigation/tradeSheet';

export default function PortfolioRoute() {
  const { openTradeSheet } = useTradeSheet();

  return <PortfolioScreen onSelect={openTradeSheet} />;
}
