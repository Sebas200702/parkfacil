const COGNITO_ERROR_MAP: Record<string, string> = {
  NotAuthorizedException: 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
  UsernameExistsException: 'Ya existe una cuenta registrada con este correo electrónico.',
  InvalidPasswordException:
    'La contraseña debe tener al menos 8 caracteres y contener números, mayúsculas y minúsculas.',
  CodeMismatchException:
    'El código de verificación es incorrecto. Verifica el código e intenta de nuevo.',
  ExpiredCodeException: 'El código de verificación ha expirado. Por favor solicita uno nuevo.',
  UserNotFoundException: 'No existe una cuenta registrada con este correo electrónico.',
  UserNotConfirmedException:
    'Tu cuenta aún no ha sido confirmada. Ingresa el código de 6 dígitos que enviamos a tu correo.',
}

export const translateCognitoError = (error: unknown): string => {
  if (!error) return ''

  const errorObj = typeof error === 'object' && error !== null ? error : null
  const code =
    errorObj && 'name' in errorObj
      ? String((errorObj as { name: unknown }).name)
      : errorObj && 'code' in errorObj
        ? String((errorObj as { code: unknown }).code)
        : ''

  if (code && COGNITO_ERROR_MAP[code]) {
    return COGNITO_ERROR_MAP[code]
  }

  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('Incorrect username or password')) {
    return COGNITO_ERROR_MAP.NotAuthorizedException ?? 'Correo o contraseña incorrectos.'
  }
  if (message.includes('User already exists')) {
    return (
      COGNITO_ERROR_MAP.UsernameExistsException ??
      'Ya existe una cuenta registrada con este correo electrónico.'
    )
  }
  if (message.includes('Password did not conform')) {
    return COGNITO_ERROR_MAP.InvalidPasswordException ?? 'La contraseña no cumple los requisitos.'
  }
  if (message.includes('Invalid code')) {
    return COGNITO_ERROR_MAP.CodeMismatchException ?? 'El código de verificación es incorrecto.'
  }

  return message || 'Ocurrió un error inesperado al procesar la solicitud.'
}
