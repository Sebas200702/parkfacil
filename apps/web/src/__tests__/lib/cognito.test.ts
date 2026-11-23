import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetJwtTokenId,
  mockGetJwtTokenAccess,
  mockSession,
  mockCurrentUser,
  mockSignUp,
  mockGetCurrentUser,
} = vi.hoisted(() => {
  const mockGetJwtTokenId = vi.fn().mockReturnValue('mock-id-token-12345')
  const mockGetJwtTokenAccess = vi.fn().mockReturnValue('mock-access-token-99999')

  const mockSession = {
    isValid: vi.fn().mockReturnValue(true),
    getIdToken: vi.fn().mockReturnValue({
      getJwtToken: mockGetJwtTokenId,
    }),
    getAccessToken: vi.fn().mockReturnValue({
      getJwtToken: mockGetJwtTokenAccess,
    }),
  }

  const mockCurrentUser = {
    getSession: vi.fn((callback) => callback(null, mockSession)),
    signOut: vi.fn(),
    confirmRegistration: vi.fn((_code, _force, callback) => callback(null, 'SUCCESS')),
    authenticateUser: vi.fn((_details, callbacks) => callbacks.onSuccess(mockSession)),
    setAuthenticationFlowType: vi.fn(),
  }

  const mockSignUp = vi.fn((_username, _password, _attrs, _val, callback) =>
    callback(null, {
      user: mockCurrentUser,
      userConfirmed: false,
      userSub: 'sub-user-123',
    }),
  )

  const mockGetCurrentUser = vi.fn().mockReturnValue(mockCurrentUser)

  return {
    mockGetJwtTokenId,
    mockGetJwtTokenAccess,
    mockSession,
    mockCurrentUser,
    mockSignUp,
    mockGetCurrentUser,
  }
})

vi.mock('amazon-cognito-identity-js', () => {
  class MockCognitoUserPool {
    signUp = mockSignUp
    getCurrentUser = mockGetCurrentUser
  }

  class MockCognitoUser {
    getSession = mockCurrentUser.getSession
    signOut = mockCurrentUser.signOut
    confirmRegistration = mockCurrentUser.confirmRegistration
    authenticateUser = mockCurrentUser.authenticateUser
    setAuthenticationFlowType = mockCurrentUser.setAuthenticationFlowType
  }

  class MockAuthenticationDetails {
    details: unknown
    constructor(details: unknown) {
      this.details = details
    }
  }

  class MockCognitoUserAttribute {
    attr: { Name: string; Value: string }
    constructor(attr: { Name: string; Value: string }) {
      this.attr = attr
    }
    getName = () => this.attr.Name
    getValue = () => this.attr.Value
  }

  return {
    CognitoUserPool: MockCognitoUserPool,
    CognitoUser: MockCognitoUser,
    AuthenticationDetails: MockAuthenticationDetails,
    CognitoUserAttribute: MockCognitoUserAttribute,
  }
})

import {
  confirmSignUp,
  getCurrentIdToken,
  getCurrentUser,
  getUserPool,
  signIn,
  signOut,
  signUp,
} from '@lib/cognito'

describe('Cognito Auth Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockReturnValue(mockCurrentUser)
    mockSession.isValid.mockReturnValue(true)
    mockCurrentUser.getSession.mockImplementation((callback) => callback(null, mockSession))
  })

  describe('getCurrentIdToken', () => {
    it('retorna null si no hay usuario autenticado en el pool', async () => {
      mockGetCurrentUser.mockReturnValueOnce(null)
      const token = await getCurrentIdToken()
      expect(token).toBeNull()
    })

    it('extrae y devuelve OBLIGATORIAMENTE el ID Token y NUNCA el access token', async () => {
      const token = await getCurrentIdToken()

      expect(mockSession.getIdToken).toHaveBeenCalledTimes(1)
      expect(mockGetJwtTokenId).toHaveBeenCalledTimes(1)
      expect(mockSession.getAccessToken).not.toHaveBeenCalled()
      expect(mockGetJwtTokenAccess).not.toHaveBeenCalled()
      expect(token).toBe('mock-id-token-12345')
    })

    it('retorna null si la sesión no es válida', async () => {
      mockSession.isValid.mockReturnValueOnce(false)
      const token = await getCurrentIdToken()
      expect(token).toBeNull()
    })

    it('retorna null si getSession falla con error', async () => {
      mockCurrentUser.getSession.mockImplementationOnce((callback) =>
        callback(new Error('Session error'), null),
      )
      const token = await getCurrentIdToken()
      expect(token).toBeNull()
    })
  })

  describe('signUp', () => {
    it('registra al usuario llamando a userPool.signUp', async () => {
      const result = await signUp('conductor@parkfacil.com', 'Contrasena123!')

      expect(mockSignUp).toHaveBeenCalledWith(
        'conductor@parkfacil.com',
        'Contrasena123!',
        expect.any(Array),
        [],
        expect.any(Function),
      )
      expect(result.userSub).toBe('sub-user-123')
    })

    it('soporta firma de objeto con atributos adicionales', async () => {
      await signUp({
        email: 'admin@parkfacil.com',
        password: 'AdminPassword123!',
        attributes: {
          'custom:parqueaderoId': 'p-centro-01',
        },
      })

      expect(mockSignUp).toHaveBeenCalledTimes(1)
    })

    it('rechaza si userPool.signUp retorna un error', async () => {
      mockSignUp.mockImplementationOnce((_u, _p, _a, _v, callback) =>
        callback(new Error('UsernameExistsException'), null),
      )

      await expect(signUp('conductor@parkfacil.com', 'Pass123!')).rejects.toThrow(
        'UsernameExistsException',
      )
    })
  })

  describe('confirmSignUp', () => {
    it('confirma el registro con el código proporcionado', async () => {
      const result = await confirmSignUp('conductor@parkfacil.com', '654321')

      expect(mockCurrentUser.confirmRegistration).toHaveBeenCalledWith(
        '654321',
        true,
        expect.any(Function),
      )
      expect(result).toBe('SUCCESS')
    })

    it('rechaza si confirmRegistration falla', async () => {
      mockCurrentUser.confirmRegistration.mockImplementationOnce((_c, _f, callback) =>
        callback(new Error('CodeMismatchException'), null),
      )

      await expect(confirmSignUp('conductor@parkfacil.com', '000000')).rejects.toThrow(
        'CodeMismatchException',
      )
    })
  })

  describe('signIn', () => {
    it('configura el flujo USER_PASSWORD_AUTH antes de autenticar', async () => {
      const session = await signIn('conductor@parkfacil.com', 'Contrasena123!')

      expect(mockCurrentUser.setAuthenticationFlowType).toHaveBeenCalledWith('USER_PASSWORD_AUTH')
      expect(mockCurrentUser.authenticateUser).toHaveBeenCalledTimes(1)
      expect(session.idToken).toBe('mock-id-token-12345')
      expect(mockSession.getIdToken).toHaveBeenCalled()
    })

    it('rechaza si authenticateUser reporta onFailure', async () => {
      mockCurrentUser.authenticateUser.mockImplementationOnce((_details, callbacks) =>
        callbacks.onFailure(new Error('NotAuthorizedException')),
      )

      await expect(signIn('conductor@parkfacil.com', 'WrongPass')).rejects.toThrow(
        'NotAuthorizedException',
      )
    })
  })

  describe('signOut y utilidades', () => {
    it('llama a signOut sobre el usuario actual', () => {
      signOut()
      expect(mockCurrentUser.signOut).toHaveBeenCalledTimes(1)
    })

    it('getUserPool y getCurrentUser devuelven instancias válidas', () => {
      expect(getUserPool()).toBeDefined()
      expect(getCurrentUser()).toBe(mockCurrentUser)
    })
  })
})
