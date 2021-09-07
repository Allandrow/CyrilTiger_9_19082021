import { screen } from '@testing-library/dom'
import '@testing-library/jest-dom'
import BillsUI from '../views/BillsUI'
import { bills } from '../fixtures/bills'
import Bills from '../containers/Bills'
import { ROUTES } from '../constants/routes'
import userEvent from '@testing-library/user-event'
import firebase from '../__mocks__/firebase'

describe('Given I am connected as an employee', () => {
  // Integration test for GET
  describe('When I navigate to Bills', () => {
    test('fetches bills from mock API GET', async () => {
      const getSpy = jest.spyOn(firebase, 'get')
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test('fetches bills from an API and fails with 404 message error', async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 404')))
      const html = BillsUI({ error: 'Erreur 404' })
      document.body.innerHTML = html
      expect(screen.getByText(/Erreur 404/)).toBeInTheDocument()
    })
    test('fetches messages from an API and fails with 500 message error', async () => {
      firebase.get.mockImplementationOnce(() => Promise.reject(new Error('Erreur 500')))
      const html = BillsUI({ error: 'Erreur 500' })
      document.body.innerHTML = html
      expect(screen.getByText(/Erreur 500/)).toBeInTheDocument()
    })
  })

  describe('When I arrive on Bills Page', () => {
    describe('When a paramater other than bills is given to the UI', () => {
      test('if a loading parameter is given, then the page should display a loading text', () => {
        const html = BillsUI({ loading: true })
        document.body.innerHTML = html
        expect(screen.getByText(/Loading.../)).toBeInTheDocument()
      })
      test('if an error parameter is given, then the page should display an error element', () => {
        const html = BillsUI({ error: 'some error message' })
        document.body.innerHTML = html
        expect(screen.getByText(/some error message/)).toBeInTheDocument()
      })
    })
    describe('When the page is rendered with bills', () => {
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
      test('Then I can click on new bill button to render a form', () => {
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const billsInstance = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: null
        })
        const spy = jest.spyOn(billsInstance, 'handleClickNewBill')
        const newBillBtn = screen.getByTestId('btn-new-bill')
        userEvent.click(newBillBtn)
        expect(spy).toHaveBeenCalled()
        expect(screen.getByTestId('form-new-bill')).toBeInTheDocument()
      })
      test('Then I can click on an eye icon to show a modal', () => {
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const billsInstance = new Bills({
          document,
          onNavigate,
          firestore: null,
          localStorage: null
        })

        $.fn.modal = jest.fn()
        const spy = jest.spyOn(billsInstance, 'handleClickIconEye')
        const eyeIcons = screen.getAllByTestId('icon-eye')
        userEvent.click(eyeIcons[0])
        expect(spy).toHaveBeenCalled()
        const dialog = screen.getByRole('dialog', { hidden: true })
        expect(dialog).toBeVisible()
      })
    })
  })
})
