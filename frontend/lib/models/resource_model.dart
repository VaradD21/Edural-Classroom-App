class ResourceModel {
  final int id;
  final String fileName;
  final String fileType;
  final String subject;
  final String topic;
  final String uploadDate;
  final String compressedUrl;
  final int? originalSize;
  final int? compressedSize;

  ResourceModel({
    required this.id,
    required this.fileName,
    required this.fileType,
    required this.subject,
    required this.topic,
    required this.uploadDate,
    required this.compressedUrl,
    this.originalSize,
    this.compressedSize,
  });

  factory ResourceModel.fromJson(Map<String, dynamic> json) {
    return ResourceModel(
      id: json['id'] as int,
      fileName: json['file_name'] as String,
      fileType: json['file_type'] as String,
      subject: json['subject'] as String,
      topic: json['topic'] as String,
      uploadDate: json['upload_date'] as String,
      compressedUrl: json['compressed_url'] as String,
      originalSize: json['original_size'] as int?,
      compressedSize: json['compressed_size'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'file_name': fileName,
      'file_type': fileType,
      'subject': subject,
      'topic': topic,
      'upload_date': uploadDate,
      'compressed_url': compressedUrl,
      'original_size': originalSize,
      'compressed_size': compressedSize,
    };
  }

  String get fullUrl => 'http://localhost:5001$compressedUrl';
  
  String get formattedDate {
    try {
      final date = DateTime.parse(uploadDate);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return uploadDate;
    }
  }

  String get fileSizeFormatted {
    if (compressedSize == null) return '';
    final kb = compressedSize! / 1024;
    if (kb < 1024) {
      return '${kb.toStringAsFixed(1)} KB';
    }
    final mb = kb / 1024;
    return '${mb.toStringAsFixed(1)} MB';
  }
}
