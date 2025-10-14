import 'package:flutter/foundation.dart';
import '../models/resource_model.dart';
import '../models/live_class_model.dart';
import '../services/api_service.dart';

class ResourceProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<ResourceModel> _resources = [];
  List<ResourceModel> _videos = [];
  List<LiveClassModel> _liveClasses = [];

  bool _isLoading = false;
  String? _error;

  List<ResourceModel> get resources => _resources;
  List<ResourceModel> get videos => _videos;
  List<LiveClassModel> get liveClasses => _liveClasses;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Fetch all resources
  Future<void> fetchResources({String? subject}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _resources = await _apiService.getResources(subject: subject);
      _error = null;
    } catch (e) {
      _error = e.toString();
      _resources = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch videos only
  Future<void> fetchVideos({String? subject}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _videos = await _apiService.getVideos(subject: subject);
      _error = null;
    } catch (e) {
      _error = e.toString();
      _videos = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch live classes
  Future<void> fetchLiveClasses({String? subject}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _liveClasses = await _apiService.getLiveClasses(subject: subject);
      _error = null;
    } catch (e) {
      _error = e.toString();
      _liveClasses = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Upload file
  Future<bool> uploadFile({
    required String filePath,
    required String subject,
    required String topic,
    Function(int, int)? onProgress,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.uploadFile(
        filePath: filePath,
        subject: subject,
        topic: topic,
        onProgress: onProgress,
      );
      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Start live class
  Future<bool> startLiveClass({
    required String subject,
    required String topic,
    required String joinLink,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.startLiveClass(
        subject: subject,
        topic: topic,
        joinLink: joinLink,
      );
      _error = null;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
