import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:rural_classroom/main.dart';

void main() {
  testWidgets('Rural Classroom app loads', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const RuralClassroomApp());

    // Verify that the app initializes correctly
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
