import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './store'
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="267345888264-u1d4e3ubsefs9ithqsecd6pkeec37ka5.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>,
)
