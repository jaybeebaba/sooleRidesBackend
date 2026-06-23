import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { HomeScreen } from '../screens/shared/HomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { VerifyResetOtpScreen } from '../screens/auth/VerifyResetOtpScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';
import { PhoneVerificationScreen } from '../screens/auth/PhoneVerificationScreen';
import { AuthStatusScreen } from '../screens/auth/AuthStatusScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { RideDetailsScreen } from '../screens/passenger/RideDetailsScreen';
import { BookingConfirmationScreen } from '../screens/passenger/BookingConfirmationScreen';
import { EmergencyContactsScreen } from '../screens/passenger/EmergencyContactsScreen';
import { PaymentScreen } from '../screens/passenger/PaymentScreen';
import { PersonalInformationScreen } from '../screens/shared/PersonalInformationScreen';
import { VerificationScreen } from '../screens/verification/VerificationScreen';
import {LeaveReviewScreen } from "../screens/passenger/LeaveReviewScreen"

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ForgotPassword: undefined;

  VerifyResetOtp: {
    email: string;
  };

  ResetPassword: {
    email: string;
    otp: string;
  };

  EmailVerification: undefined;
  PhoneVerification: undefined;

  AuthStatus: {
    type: 'success' | 'error';
    title: string;
    message: string;
    buttonText: string;
    action:
    | 'goHome'
    | 'goLogin'
    | 'goEmailVerification'
    | 'goPhoneVerification'
    | 'goForgotPassword'
    | 'goVerifyResetOtp'
    | 'goTrips';
    email?: string;
  };
  RideDetails: {
  rideId: string;
  bookingId?: string;
  bookingStatus?: string;
  totalAmount?: number;

  review?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  } | null;
};

  Payment: {
    bookingId: string;
    amount: number;
  };
  

  BookingConfirmation: {
    rideId: string;
  };
  PersonalInformation: undefined;
  Verification: undefined;
  LeaveReview: {
    bookingId: string;
    revieweeId: string;
    revieweeName?: string;
  };
  
  EmergencyContacts: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyResetOtp" component={VerifyResetOtpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AuthStatus" component={AuthStatusScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={MainTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PersonalInformation"
          component={PersonalInformationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Verification"
          component={VerificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}