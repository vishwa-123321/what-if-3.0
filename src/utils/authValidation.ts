export interface AuthValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Please enter your email address.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Please enter a valid email address (for example, reader@domain.com).';
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Please enter a password.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  return undefined;
}

export function validateLoginForm(email: string, password: string): AuthValidationErrors {
  const errors: AuthValidationErrors = {};
  const emailErr = validateEmail(email);
  const passwordErr = validatePassword(password);
  if (emailErr) errors.email = emailErr;
  if (passwordErr) errors.password = passwordErr;
  return errors;
}

export function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): AuthValidationErrors {
  const errors = validateLoginForm(email, password);
  if (!name.trim() || name.trim().length < 2) {
    errors.name = 'Please enter a display name of at least 2 characters.';
  }
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}
