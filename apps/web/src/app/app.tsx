import { AppHeader } from './app-header'
import { WelcomeScreen } from './welcome-screen'

export const App = () => (
  <div className="min-h-dvh">
    <AppHeader />
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <WelcomeScreen />
    </main>
  </div>
)
