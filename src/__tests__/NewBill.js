import { screen } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { ROUTES } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import userEvent from '@testing-library/user-event'

describe('Given I am connected as an employee', () => {
  let newBill
  beforeAll(() => {
    const html = NewBillUI()
    document.body.innerHTML = html

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'cedric.hiely@billed.com'
      })
    )
    newBill = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage
    })
  })

  describe('When I am on NewBill Page', () => {
    test('Then i can attach a jpg/jpeg/png file to the form via an input', () => {
      // TODO : reassess what the test should do
      const file = new File(['test'], 'test.png', { type: 'image/png' })
      const input = screen.getByTestId('file')
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      input.addEventListener('change', handleChangeFile)
      userEvent.upload(input, file, true)
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})
