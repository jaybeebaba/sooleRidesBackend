import { DriverHomeScreen } from '../driver/DriverHomeScreen';
import { PassengerHomeScreen } from '../passenger/PassengerHomeScreen';
import { useAppModeStore } from '../../store/appMode.store';

export function HomeScreen() {
  const activeMode = useAppModeStore((state) => state.activeMode);

  if (activeMode === 'DRIVER') {
    return <DriverHomeScreen />;
  }

  return <PassengerHomeScreen />;
}