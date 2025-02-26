import 'package:http/http.dart' as http;
import 'dart:convert';

class AuthProvider {
  final String baseUrl = 'http://localhost:3005'; // Replace with your backend URL

  // Register User
  Future<Map<String, dynamic>> registerUser(
      String name, String email, String password, String role) async {
    final url = Uri.parse('$baseUrl/auth/registration/');
    try { //Aa!12345 mdrakibul11611@gmail.com
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': role,
        }),
      );

      // print(response.body);

      print(jsonDecode(response.body));

      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        final responseBody = jsonDecode(response.body);
        throw Exception(responseBody['message'] ?? 'Registration failed');
      }
    } catch (error) {
      throw Exception('Failed to register user: $error');
    }
  }

  // Verify Registration OTP
  Future<Map<String, dynamic>> verifyRegistrationOTP(
      {required String email, required String otp}) async {
    final url = Uri.parse('$baseUrl/auth/verify-registration-otp/');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final responseBody = jsonDecode(response.body);
        throw Exception(responseBody['message'] ?? 'Failed to verify registration OTP');
      }
    } catch (error) {
      throw Exception('Failed to verify registration OTP: $error');
    }
  }

  // Login User
  Future<Map<String, dynamic>> loginUser(String email, String password) async {
    final url = Uri.parse('$baseUrl/auth/login/');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      print(jsonDecode(response.body));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final responseBody = jsonDecode(response.body);
        throw Exception(responseBody['message'] ?? 'Login failed');
      }
    } catch (error) {
      throw Exception('Failed to login user: $error');
    }
  }

  // Verify Login OTP
  Future<Map<String, dynamic>> verifyLoginOTP(
      {required String email, required String otp}) async {
    final url = Uri.parse('$baseUrl/auth/verify-login-otp/');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp}),
      );

      print('Verify Login OTP: ');
      print(response.body);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        final responseBody = jsonDecode(response.body);
        throw Exception(responseBody['message'] ?? 'Failed to verify login OTP');
      }
    } catch (error) {
      throw Exception('Failed to verify login OTP: $error');
    }
  }
}