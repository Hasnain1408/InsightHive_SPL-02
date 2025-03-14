import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/forgot_password_provider.dart';
import '../ResetAndUpdatePassword/ForgotPasswordScreen.dart';

class UpdatePasswordScreen extends ConsumerStatefulWidget {
  final String userEmail;

  const UpdatePasswordScreen({super.key, required this.userEmail});

  @override
  ConsumerState<UpdatePasswordScreen> createState() => _UpdatePasswordScreenState();
}

class _UpdatePasswordScreenState extends ConsumerState<UpdatePasswordScreen> {
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmNewPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String? _currentPasswordError;
  String? _confirmPasswordError;
  bool _isLoading = false;

  bool _isCurrentPasswordVisible = false;
  bool _isNewPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  // Define colors to match ResetPasswordScreen
  final Color _primaryColor = const Color(0xFF2563EB); // Blue 600
  final Color _secondaryColor = const Color(0xFF7C3AED); // Purple 600
  final Color _accentColor = const Color(0xFF14B8A6); // Teal 500
  final Color _bgColor = const Color(0xFFF9FAFB); // Gray 50
  final Color _cardColor = Colors.white;
  final Color _textColor = const Color(0xFF1F2937); // Gray 800
  final Color _subtextColor = const Color(0xFF6B7280); // Gray 500

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmNewPasswordController.dispose();
    super.dispose();
  }

  Future<void> _updatePassword() async {
    if (_formKey.currentState?.validate() ?? false) {
      String currentPassword = _currentPasswordController.text;
      String newPassword = _newPasswordController.text;

      setState(() {
        _currentPasswordError = null;
        _confirmPasswordError = null;
        _isLoading = true;
      });

      try {
        final forgotPasswordNotifier = ref.read(forgotPasswordProvider.notifier);

        final response = await forgotPasswordNotifier.updatePassword(
            widget.userEmail, currentPassword, newPassword);

        if (response.statusCode == 200) {
          _showMessage('Password updated successfully!');
          Navigator.pop(context);
        } else if (response.statusCode == 401) {
          setState(() {
            _currentPasswordError = 'Current password is incorrect';
          });
        } else {
          _showMessage('Failed to update password');
        }
      } catch (error) {
        _showMessage('An error occurred: $error');
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: message.contains('successful') ? _accentColor : _secondaryColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgColor, // Use the same background color
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Custom back button
                  InkWell(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    borderRadius: BorderRadius.circular(50),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        border: Border.all(color: _subtextColor.withOpacity(0.5)),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      child: Icon(
                        Icons.arrow_back_ios_new_rounded,
                        size: 20,
                        color: _primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Screen title
                  Text(
                    'Update Password',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: _textColor,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Header text
                  Text(
                    'Change Your Password',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: _textColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create a strong password that you haven\'t used before',
                    style: TextStyle(
                      fontSize: 14,
                      color: _subtextColor,
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Current Password Field
                  Text(
                    'Current Password',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _textColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _currentPasswordController,
                    obscureText: !_isCurrentPasswordVisible,
                    decoration: InputDecoration(
                      hintText: 'Enter current password',
                      hintStyle: TextStyle(color: _subtextColor),
                      errorText: _currentPasswordError,
                      prefixIcon: Icon(Icons.lock_outline, color: _primaryColor),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isCurrentPasswordVisible
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: _primaryColor,
                        ),
                        onPressed: () {
                          setState(() {
                            _isCurrentPasswordVisible = !_isCurrentPasswordVisible;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _subtextColor.withOpacity(0.5)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _subtextColor.withOpacity(0.5)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _primaryColor, width: 2),
                      ),
                      fillColor: _cardColor,
                      filled: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter your current password';
                      }
                      return null;
                    },
                  ),

                  // Forgot Password Button
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
                        );
                      },
                      child: Text(
                        'Forgot Password?',
                        style: TextStyle(
                          color: _primaryColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // New Password Field
                  Text(
                    'New Password',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _textColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _newPasswordController,
                    obscureText: !_isNewPasswordVisible,
                    decoration: InputDecoration(
                      hintText: 'Enter new password',
                      hintStyle: TextStyle(color: _subtextColor),
                      prefixIcon: Icon(Icons.lock_outline, color: _primaryColor),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isNewPasswordVisible
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: _primaryColor,
                        ),
                        onPressed: () {
                          setState(() {
                            _isNewPasswordVisible = !_isNewPasswordVisible;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _subtextColor.withOpacity(0.5)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _subtextColor.withOpacity(0.5)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _primaryColor, width: 2),
                      ),
                      fillColor: _cardColor,
                      filled: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a new password';
                      }
                      if (value.length < 8) {
                        return 'Password must be at least 8 characters long';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 24),

                  // Confirm New Password Field
                  Text(
                    'Confirm New Password',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _textColor,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _confirmNewPasswordController,
                    obscureText: !_isConfirmPasswordVisible,
                    decoration: InputDecoration(
                      hintText: 'Confirm your password',
                      hintStyle: TextStyle(color: _subtextColor),
                      errorText: _confirmPasswordError,
                      prefixIcon: Icon(Icons.lock_outline, color: _primaryColor),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isConfirmPasswordVisible
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                          color: _primaryColor,
                        ),
                        onPressed: () {
                          setState(() {
                            _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _subtextColor.withOpacity(0.5)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _subtextColor.withOpacity(0.5)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: _primaryColor, width: 2),
                      ),
                      fillColor: _cardColor,
                      filled: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
                    ),
                    validator: (value) {
                      if (value != _newPasswordController.text) {
                        return 'Passwords do not match';
                      }
                      return null;
                    },
                  ),

                  const SizedBox(height: 40),

                  // Update Password Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _updatePassword,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      child: _isLoading
                          ? SizedBox(
                        height: 24,
                        width: 24,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                          : const Text(
                        'Update Password',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}