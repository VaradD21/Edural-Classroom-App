class ApiConstants {
  // Base URL - Update this to your backend IP if testing on physical device
  static const String baseUrl = 'http://localhost:5001';
  
  // Authentication endpoints
  static const String studentSignup = '/auth/student/signup';
  static const String studentLogin = '/auth/student/login';
  static const String verifyOtp = '/auth/student/verify-otp';
  static const String resendOtp = '/auth/student/resend-otp';
  
  // Teacher endpoints
  static const String teacherUpload = '/teacher/upload';
  
  // Student endpoints
  static const String studentResources = '/student/resources';
  static const String studentVideos = '/student/videos';
  
  // Live class endpoints
  static const String liveStart = '/live/start';
  static const String liveJoin = '/live/join';
}

class AppStrings {
  // English strings (Hindi will be added in Prompt 4)
  static const String appName = 'Rural Classroom';
  static const String selectRole = 'Select Your Role';
  static const String teacher = 'Teacher';
  static const String student = 'Student';
  static const String dashboard = 'Dashboard';
  static const String uploadLecture = 'Upload Lecture';
  static const String uploadResource = 'Upload Resource';
  static const String watchLive = 'Watch Live';
  static const String recordedLectures = 'Recorded Lectures';
  static const String resources = 'Resources';
  static const String settings = 'Settings';
  static const String subject = 'Subject';
  static const String topic = 'Topic';
  static const String selectFile = 'Select File';
  static const String upload = 'Upload';
  static const String uploading = 'Uploading...';
  static const String success = 'Success';
  static const String error = 'Error';
  static const String noDataAvailable = 'No data available';
  static const String download = 'Download';
  static const String play = 'Play';
  static const String loading = 'Loading...';
  
  // Authentication strings
  static const String login = 'Login';
  static const String signup = 'Sign Up';
  static const String username = 'Username';
  static const String password = 'Password';
  static const String name = 'Full Name';
  static const String phone = 'Phone Number';
  static const String email = 'Email';
  static const String verifyEmail = 'Verify Email';
  static const String enterOtp = 'Enter OTP';
  static const String verify = 'Verify';
  static const String resendOtp = 'Resend OTP';
  static const String alreadyHaveAccount = 'Already have an account?';
  static const String dontHaveAccount = "Don't have an account?";
  static const String createAccount = 'Create Account';
}
