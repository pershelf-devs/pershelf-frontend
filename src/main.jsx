import { LocalizationProvider } from '@mui/x-date-pickers'
import ReactDOM from 'react-dom/client'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import App from './App.jsx'
import './index.css'
import { NotificationProvider } from './components/elements/NotificationContext.jsx'
import { SnackbarProvider } from 'notistack'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <LocalizationProvider dateAdapter={AdapterDayjs} >
    <Provider store={store}>
      <SnackbarProvider maxSnack={4}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </SnackbarProvider>
    </Provider>
  </LocalizationProvider>
)
