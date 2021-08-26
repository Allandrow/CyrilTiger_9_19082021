import { screen } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import Bills from '../containers/Bills.js'
import { ROUTES } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import userEvent from '@testing-library/user-event'

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', () => {
      const html = BillsUI({ data: [] })
      document.body.innerHTML = html
      // to-do write expect expression
    })
    test('Then bills should be ordered from earliest to latest', () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen
        .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
        .map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test('if a loading parameter is given, then the page should display a loading text', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      const loading = screen.getByText(/Loading.../)
      expect(loading).toBeTruthy()
    })
    test('if an error parameter is given, then the page should display an error element', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      const error = screen.getByTestId('error-message')
      expect(error).toBeTruthy()
    })
    describe('When I click on the new bill button', () => {
      test('Then it should render a new bill form', () => {
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee'
          })
        )
        const billsObj = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage
        })

        const newBillBtn = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn((e) => billsObj.handleClickNewBill(e))
        newBillBtn.addEventListener('click', handleClickNewBill)
        userEvent.click(newBillBtn)
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      })
    })
    describe('When i click on an eye icon', () => {
      test('Then it should render a modal', () => {
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee'
          })
        )
        const billsObj = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage
        })

        $.fn.modal = jest.fn()

        const eyeIcons = screen.getAllByTestId('icon-eye')
        const handleClickIconEye = jest.fn((e) => billsObj.handleClickIconEye)
        eyeIcons.forEach((icon) => icon.addEventListener('click', () => handleClickIconEye(icon)))
        userEvent.click(eyeIcons[0])
        expect(handleClickIconEye).toHaveBeenCalled()
        const dialogText = screen.getByText('Justificatif')
        expect(dialogText).toBeTruthy()
      })
    })
  })
})
