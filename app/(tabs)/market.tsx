import MarketScreen from '../../src/screens/MarketScreen';
import { useTradeSheet } from '../../src/navigation/tradeSheet';

export default function MarketRoute() {
  const { openTradeSheet } = useTradeSheet();

  return <MarketScreen onSelect={openTradeSheet} />;
}
