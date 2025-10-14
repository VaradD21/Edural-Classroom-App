class ApiConstants {
  // Base URL - Update this to your backend IP if testing on physical device
  static const String baseUrl = 'http://localhost:5001';
  
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
}
