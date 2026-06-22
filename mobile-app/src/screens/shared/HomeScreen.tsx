import { DriverHomeScreen } from '../driver/DriverHomeScreen';
import { PassengerHomeScreen } from '../passenger/PassengerHomeScreen';
import { useAuthStore } from '../../store/auth.store';

export function HomeScreen() {
  const user = useAuthStore((state) => state.user);
console.log('user', user);
  // const isApprovedDriver = user?.driverStatus === 'APPROVED';
  // const isDriverMode = user?.activeMode === 'DRIVER';

  // if (isApprovedDriver && isDriverMode) {
  //   return <DriverHomeScreen />;
  // }

  return <PassengerHomeScreen />;
}