class LiveClassModel {
  final int id;
  final String subject;
  final String topic;
  final String joinLink;
  final String startTime;
  final String status;

  LiveClassModel({
    required this.id,
    required this.subject,
    required this.topic,
    required this.joinLink,
    required this.startTime,
    required this.status,
  });

  factory LiveClassModel.fromJson(Map<String, dynamic> json) {
    return LiveClassModel(
      id: json['id'] as int,
      subject: json['subject'] as String,
      topic: json['topic'] as String,
      joinLink: json['join_link'] as String,
      startTime: json['start_time'] as String,
      status: json['status'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'subject': subject,
      'topic': topic,
      'join_link': joinLink,
      'start_time': startTime,
      'status': status,
    };
  }

  String get formattedTime {
    try {
      final date = DateTime.parse(startTime);
      final hour = date.hour > 12 ? date.hour - 12 : date.hour;
      final period = date.hour >= 12 ? 'PM' : 'AM';
      return '${date.day}/${date.month}/${date.year} $hour:${date.minute.toString().padLeft(2, '0')} $period';
    } catch (e) {
      return startTime;
    }
  }
}
