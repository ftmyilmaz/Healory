import { FONTS } from '@/constants/fonts';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

//Ignore all log notifications
LogBox.ignoreAllLogs();

export default function RootLayout() {
  const [loaded] = useFonts(FONTS);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="adminlogin" />
        <Stack.Screen name="admindashboard" />
        <Stack.Screen name="forgotpasswordmethods" />
        <Stack.Screen name="forgotpasswordemail" />
        <Stack.Screen name="forgotpasswordphonenumber" />
        <Stack.Screen name="otpverification" />
        <Stack.Screen name="createnewpassword" />
        <Stack.Screen name="fillyourprofile" />
        <Stack.Screen name="createnewpin" />
        <Stack.Screen name="fingerprint" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="search" />
        <Stack.Screen name="topdoctors" />
        <Stack.Screen name="doctordetails" />
        <Stack.Screen name="doctorreviews" />
        <Stack.Screen name="bookappointment" />
        <Stack.Screen name="patientdetails" />
        <Stack.Screen name="selectpackage" />
        <Stack.Screen name="paymentmethods" />
        <Stack.Screen name="addnewcard" />
        <Stack.Screen name="reviewsummary" />
        <Stack.Screen name="ereceipt" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="videocall" />
        <Stack.Screen name="voicecall" />
        <Stack.Screen name="messaging" />
        <Stack.Screen name="myappointmentmessaging" />
        <Stack.Screen name="myappointmentvideocall" />
        <Stack.Screen name="myappointmentvoicecall" />
        <Stack.Screen name="cancelappointment" />
        <Stack.Screen name="cancelappointmentpaymentmethods" />
        <Stack.Screen name="rescheduleappointment" />
        <Stack.Screen name="selectrescheduleappointmentdate" />
        <Stack.Screen name="sessionended" />
        <Stack.Screen name="leavereview" />
        <Stack.Screen name="videocallhistorydetails" />
        <Stack.Screen name="videocallhistorydetailsplayrecordings" />
        <Stack.Screen name="voicecallhistorydetails" />
        <Stack.Screen name="voicecallhistorydetailsplayrecordings" />
        <Stack.Screen name="articlesdetails" />
        <Stack.Screen name="articlesseeall" />
        <Stack.Screen name="trendingarticles" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="mybookmarkedarticles" />
        <Stack.Screen name="favourite" />
        <Stack.Screen name="editprofile" />
        <Stack.Screen name="settingsnotifications" />
        <Stack.Screen name="settingspayment" />
        <Stack.Screen name="addnewaddress" />
        <Stack.Screen name="address" />
        <Stack.Screen name="settingssecurity" />
        <Stack.Screen name="changepin" />
        <Stack.Screen name="enteryourpin" />
        <Stack.Screen name="changepassword" />
        <Stack.Screen name="changeemail" />
        <Stack.Screen name="settingslanguage" />
        <Stack.Screen name="settingsprivacypolicy" />
        <Stack.Screen name="settingshelpcenter" />
        <Stack.Screen name="customerservice" />
        <Stack.Screen name="settingsinvitefriends" />
        <Stack.Screen name="topupewalletamount" />
        <Stack.Screen name="topupmethods" />
        <Stack.Screen name="topupconfirmpin" />
        <Stack.Screen name="topupereceipt" />
        <Stack.Screen name="adminsettings" />
        <Stack.Screen name="clinicmanagement" />
        <Stack.Screen name="+html" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}