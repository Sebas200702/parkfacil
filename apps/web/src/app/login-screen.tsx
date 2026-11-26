import { useAuth } from '@context/AuthContext'
import { Button } from '@shared/ui/button'
import { Field, Input } from '@shared/ui/field'
import { Illustration } from '@shared/ui/illustration'
import { Notice } from '@shared/ui/notice'
import { translateCognitoError } from '@shared/utils/cognito-errors'
import { type FormEvent, useState } from 'react'
import { GoogleSignIn } from './google-sign-in'

export interface LoginScreenProps {
  onNavigate?: (route: string) => void
}

export const LoginScreen = ({ onNavigate }: LoginScreenProps) => {
  const { login, confirmCode, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await login(email, password)
      onNavigate?.('/')
    } catch (err: unknown) {
      const errorObj = typeof err === 'object' && err !== null ? err : null
      const errorName =
        errorObj && 'name' in errorObj
          ? String((errorObj as { name: unknown }).name)
          : errorObj && 'code' in errorObj
            ? String((errorObj as { code: unknown }).code)
            : ''

      if (errorName === 'UserNotConfirmedException') {
        setNeedsConfirmation(true)
        setErrorMessage(
          'Tu cuenta aún no está confirmada. Ingresa el código de 6 dígitos que enviamos a tu correo.',
        )
      } else {
        setErrorMessage(translateCognitoError(err))
      }
    }
  }

  const handleConfirmSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await confirmCode(email, code)
      setNeedsConfirmation(false)
      setSuccessMessage('¡Cuenta confirmada con éxito! Ahora puedes iniciar sesión.')
    } catch (err: unknown) {
      setErrorMessage(translateCognitoError(err))
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <div className="grid gap-6 rounded-plate border-2 border-asphalt-200 bg-paper p-6 shadow-sm">
        {needsConfirmation ? null : <Illustration name="welcome" className="mx-auto" />}
        <div>
          <h1 className="text-display font-extrabold tracking-tight text-asphalt-950">
            {needsConfirmation ? 'Confirma tu cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="mt-1 text-body text-asphalt-600">
            {needsConfirmation
              ? `Ingresa el código de 6 dígitos enviado a ${email}`
              : 'Ingresa a tu cuenta de ParkFácil para gestionar tus reservas.'}
          </p>
        </div>

        {errorMessage ? (
          <Notice tone="error" title="Atención">
            {errorMessage}
          </Notice>
        ) : null}

        {successMessage ? (
          <Notice tone="ok" title="Operación exitosa">
            {successMessage}
          </Notice>
        ) : null}

        {needsConfirmation ? (
          <form onSubmit={handleConfirmSubmit} className="grid gap-4" aria-label="Confirmar cuenta">
            <Field label="Código de verificación" htmlFor="confirm-code">
              <Input
                id="confirm-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="123456"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Field>

            <Button submit block loading={isLoading} loadingLabel="Confirmando">
              Confirmar cuenta
            </Button>

            <Button
              variant="quiet"
              block
              onClick={() => {
                setNeedsConfirmation(false)
                setErrorMessage(null)
              }}
            >
              Volver a intentar inicio de sesión
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="grid gap-4" aria-label="Iniciar sesión">
            <Field label="Correo electrónico" htmlFor="login-email">
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Contraseña" htmlFor="login-password">
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button submit block loading={isLoading} loadingLabel="Iniciando sesión">
              Iniciar sesión
            </Button>
          </form>
        )}

        {!needsConfirmation ? <GoogleSignIn /> : null}

        {!needsConfirmation ? (
          <div className="pt-2 text-center text-label text-asphalt-600">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => onNavigate?.('/registro')}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-plate px-1 font-bold text-brand-600 underline decoration-2 underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Regístrate aquí
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
