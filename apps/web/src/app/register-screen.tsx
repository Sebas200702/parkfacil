import { useAuth } from '@context/AuthContext'
import { Button } from '@shared/ui/button'
import { Field, Input } from '@shared/ui/field'
import { Notice } from '@shared/ui/notice'
import { translateCognitoError } from '@shared/utils/cognito-errors'
import { type FormEvent, useState } from 'react'

export interface RegisterScreenProps {
  onNavigate?: (route: string) => void
}

export const RegisterScreen = ({ onNavigate }: RegisterScreenProps) => {
  const { register, confirmCode, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'register' | 'confirm'>('register')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      await register(email, password)
      setStep('confirm')
      setSuccessMessage(
        '¡Registro iniciado! Hemos enviado un código de 6 dígitos a tu correo electrónico.',
      )
    } catch (err: unknown) {
      setErrorMessage(translateCognitoError(err))
    }
  }

  const handleConfirmSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await confirmCode(email, code)
      onNavigate?.('/login')
    } catch (err: unknown) {
      setErrorMessage(translateCognitoError(err))
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-6">
      <div className="grid gap-6 rounded-plate border-2 border-asphalt-200 bg-paper p-6 shadow-sm">
        <div>
          <h1 className="text-display font-extrabold tracking-tight text-asphalt-950">
            {step === 'confirm' ? 'Confirma tu correo' : 'Crear cuenta'}
          </h1>
          <p className="mt-1 text-body text-asphalt-600">
            {step === 'confirm'
              ? `Ingresa el código de 6 dígitos que enviamos a ${email}`
              : 'Regístrate en ParkFácil para encontrar y reservar cupos de parqueo al instante.'}
          </p>
        </div>

        {errorMessage ? (
          <Notice tone="error" title="Error">
            {errorMessage}
          </Notice>
        ) : null}

        {successMessage ? (
          <Notice tone="ok" title="Verifica tu correo">
            {successMessage}
          </Notice>
        ) : null}

        {step === 'confirm' ? (
          <form
            onSubmit={handleConfirmSubmit}
            className="grid gap-4"
            aria-label="Confirmar registro"
          >
            <Field label="Código de 6 dígitos" htmlFor="register-confirm-code">
              <Input
                id="register-confirm-code"
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
              Confirmar y continuar al inicio de sesión
            </Button>

            <Button
              variant="quiet"
              block
              onClick={() => {
                setStep('register')
                setErrorMessage(null)
              }}
            >
              Volver a editar correo
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="grid gap-4" aria-label="Crear cuenta">
            <Field label="Correo electrónico" htmlFor="register-email">
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field label="Contraseña" htmlFor="register-password">
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <Button submit block loading={isLoading} loadingLabel="Registrando">
              Crear cuenta
            </Button>
          </form>
        )}

        {step === 'register' ? (
          <div className="pt-2 text-center text-label text-asphalt-600">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={() => onNavigate?.('/login')}
              className="font-bold text-brand-600 underline decoration-2 underline-offset-4 focus-visible:outline-focus"
            >
              Inicia sesión aquí
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
