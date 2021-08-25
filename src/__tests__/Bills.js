import { screen } from '@testing-library/dom'
import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { Bills } from '../containers/Bills.js'
import { ROUTES } from '../constants/routes'

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
      test('Then a from should be displayed', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
      })
    })
  })
})
