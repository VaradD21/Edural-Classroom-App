import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:media_kit/media_kit.dart';
import 'providers/resource_provider.dart';
import 'screens/login_screen.dart';
import 'screens/teacher/teacher_home_screen.dart';
import 'screens/student/student_home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize MediaKit (uses FFmpeg for video playback)
  MediaKit.ensureInitialized();
  
  runApp(const RuralClassroomApp());
}

class RuralClassroomApp extends StatelessWidget {
  const RuralClassroomApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ResourceProvider()),
      ],
      child: MaterialApp(
        title: 'Rural Classroom',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
          useMaterial3: true,
          // Large fonts for rural users
          textTheme: const TextTheme(
            displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
            displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
            titleLarge: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
            bodyLarge: TextStyle(fontSize: 16),
            bodyMedium: TextStyle(fontSize: 14),
          ),
        ),
        initialRoute: LoginScreen.routeName,
        routes: {
          LoginScreen.routeName: (context) => const LoginScreen(),
          TeacherHomeScreen.routeName: (context) => const TeacherHomeScreen(),
          StudentHomeScreen.routeName: (context) => const StudentHomeScreen(),
        },
      ),
    );
  }
}
