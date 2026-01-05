/**
 * Navigation Routes
 * Centralized route definitions
 * Follows DRY (Don't Repeat Yourself) principle
 */

export const ROUTES = {
  // Auth Routes
  AUTH: {
    WELCOME: '/welcome',
    LOGIN: '/login',
    SIGNUP: '/signup',
    ADMIN_LOGIN: '/adminlogin',
    FORGOT_PASSWORD_METHODS: '/forgotpasswordmethods',
    FORGOT_PASSWORD_EMAIL: '/forgotpasswordemail',
    FORGOT_PASSWORD_PHONE: '/forgotpasswordphonenumber',
    OTP_VERIFICATION: '/otpverification',
    CREATE_NEW_PASSWORD: '/createnewpassword',
    FILL_YOUR_PROFILE: '/fillyourprofile',
    CREATE_NEW_PIN: '/createnewpin',
    FINGERPRINT: '/fingerprint',
  },

  // Admin Routes
  ADMIN: {
    DASHBOARD: '/admindashboard',
    LOGIN: '/adminlogin',
  },

  // Main Routes
  MAIN: {
    HOME: '/(tabs)',
    NOTIFICATIONS: '/notifications',
    SEARCH: '/search',
    FAVOURITE: '/favourite',
  },

  // Doctor Routes
  DOCTOR: {
    TOP_DOCTORS: '/topdoctors',
    DETAILS: '/doctordetails',
    REVIEWS: '/doctorreviews',
  },

  // Appointment Routes
  APPOINTMENT: {
    BOOK: '/bookappointment',
    PATIENT_DETAILS: '/patientdetails',
    SELECT_PACKAGE: '/selectpackage',
    PAYMENT_METHODS: '/paymentmethods',
    ADD_NEW_CARD: '/addnewcard',
    REVIEW_SUMMARY: '/reviewsummary',
    E_RECEIPT: '/ereceipt',
    CANCEL: '/cancelappointment',
    CANCEL_PAYMENT: '/cancelappointmentpaymentmethods',
    RESCHEDULE: '/rescheduleappointment',
    SELECT_RESCHEDULE_DATE: '/selectrescheduleappointmentdate',
  },

  // Communication Routes
  COMMUNICATION: {
    CHAT: '/chat',
    VIDEO_CALL: '/videocall',
    VOICE_CALL: '/voicecall',
    MESSAGING: '/messaging',
  },

  // Settings Routes
  SETTINGS: {
    EDIT_PROFILE: '/editprofile',
    NOTIFICATIONS: '/settingsnotifications',
    PAYMENT: '/settingspayment',
    SECURITY: '/settingssecurity',
    LANGUAGE: '/settingslanguage',
    PRIVACY_POLICY: '/settingsprivacypolicy',
    HELP_CENTER: '/settingshelpcenter',
    INVITE_FRIENDS: '/settingsinvitefriends',
  },
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type AuthRouteKeys = keyof typeof ROUTES.AUTH;
export type AdminRouteKeys = keyof typeof ROUTES.ADMIN;
export type MainRouteKeys = keyof typeof ROUTES.MAIN;
