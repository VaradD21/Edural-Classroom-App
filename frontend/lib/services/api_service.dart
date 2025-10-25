import 'package:dio/dio.dart';
import '../models/resource_model.dart';
import '../models/live_class_model.dart';
import '../utils/constants.dart';

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    ),
  );

  // Teacher: Upload file (video/PDF/DOCX/PPT)
  Future<Map<String, dynamic>> uploadFile({
    required String filePath,
    required String subject,
    required String topic,
    Function(int, int)? onProgress,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath),
        'subject': subject,
        'topic': topic,
      });

      final response = await _dio.post(
        ApiConstants.teacherUpload,
        data: formData,
        onSendProgress: (sent, total) {
          if (onProgress != null) {
            onProgress(sent, total);
          }
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Student: Fetch all resources
  Future<List<ResourceModel>> getResources({String? subject}) async {
    try {
      final queryParams = subject != null ? {'subject': subject} : null;
      final response = await _dio.get(
        ApiConstants.studentResources,
        queryParameters: queryParams,
      );

      final data = response.data as Map<String, dynamic>;
      final resources = data['resources'] as List;
      return resources.map((json) => ResourceModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Student: Fetch video resources only
  Future<List<ResourceModel>> getVideos({String? subject}) async {
    try {
      final queryParams = subject != null ? {'subject': subject} : null;
      final response = await _dio.get(
        ApiConstants.studentVideos,
        queryParameters: queryParams,
      );

      final data = response.data as Map<String, dynamic>;
      final videos = data['videos'] as List;
      return videos.map((json) => ResourceModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Live class: Start new live class
  Future<Map<String, dynamic>> startLiveClass({
    required String subject,
    required String topic,
    required String joinLink,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.liveStart,
        data: {
          'subject': subject,
          'topic': topic,
          'join_link': joinLink,
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Live class: Get active live classes
  Future<List<LiveClassModel>> getLiveClasses({String? subject}) async {
    try {
      final queryParams = subject != null ? {'subject': subject} : null;
      final response = await _dio.get(
        ApiConstants.liveJoin,
        queryParameters: queryParams,
      );

      final data = response.data as Map<String, dynamic>;
      final liveClasses = data['live_classes'] as List;
      return liveClasses.map((json) => LiveClassModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Authentication: Student signup
  Future<Map<String, dynamic>> studentSignup({
    required String username,
    required String password,
    required String name,
    required String phone,
    required String email,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.studentSignup,
        data: {
          'username': username,
          'password': password,
          'name': name,
          'phone': phone,
          'email': email,
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Authentication: Verify OTP
  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.verifyOtp,
        data: {
          'email': email,
          'otp': otp,
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Authentication: Resend OTP
  Future<Map<String, dynamic>> resendOtp({
    required String email,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.resendOtp,
        data: {
          'email': email,
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Authentication: Student login
  Future<Map<String, dynamic>> studentLogin({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.studentLogin,
        data: {
          'username': username,
          'password': password,
        },
      );

      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Connection timeout. Please check your internet connection.';
    } else if (e.type == DioExceptionType.connectionError) {
      return 'Cannot connect to server. Please check if backend is running.';
    } else if (e.response != null) {
      final data = e.response!.data;
      if (data is Map && data.containsKey('error')) {
        return data['error'] as String;
      }
      return 'Server error: ${e.response!.statusCode}';
    }
    return 'An unexpected error occurred: ${e.message}';
  }
}
