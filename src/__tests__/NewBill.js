import { screen } from '@testing-library/dom'
import '@testing-library/jest-dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'
import { ROUTES } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import userEvent from '@testing-library/user-event'

describe('Given I am connected as an employee', () => {
  // Setup newBill instance
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

  describe('When i navigate to NewBill Page', () => {
    test('Then it should render the page', () => {
      expect(screen.getByText(/Envoyer une note de frais/i)).toBeInTheDocument()
      expect(screen.getByRole('form')).toBeInTheDocument()
    })
  })

  describe('When I am on NewBill Page', () => {
    describe('When I attach a file to the form', () => {
      test('if it is an image it should be in the file handler', () => {
        const file = new File(['test'], 'test.png', { type: 'image/png' })
        const spy = jest.spyOn(newBill, 'handleChangeFile')
        const input = screen.getByTestId('file')
        userEvent.upload(input, file)
        expect(spy).toHaveBeenCalled()
        expect(input.files[0]).toStrictEqual(file)
        expect(input.files).toHaveLength(1)
      })
      test('if it is not an image it should display an error message', () => {
        const file = new File(['wrongTest'], 'wrongfile.pdf', { type: 'application/pdf' })
        const spy = jest.spyOn(newBill, 'handleChangeFile')
        const input = screen.getByTestId('file')
        userEvent.upload(input, file)
        expect(spy).toHaveBeenCalled()
        expect(input.value).toBe('')
        expect(
          screen.getByText(/Votre justificatif doit être de type jpg, jpeg ou png/)
        ).toBeVisible()
      })
    })
    describe('When I submit a correctly filled form', () => {
      test('Then it should create a new bill', () => {
        const email = JSON.parse(localStorage.getItem('user')).email
        newBill.createBill = (bill) => bill
        const validBill = {
          email,
          type: 'Transports',
          name: 'test',
          amount: 500,
          date: '2021-08-31',
          vat: '70',
          pct: 20,
          commentary: '',
          fileUrl: 'https://test.com/test.png',
          fileName: 'test.png',
          status: 'pending'
        }

        screen.getByTestId('expense-type').value = validBill.type
        screen.getByTestId('expense-name').value = validBill.name
        screen.getByTestId('datepicker').value = validBill.date
        screen.getByTestId('amount').value = `${validBill.amount}`
        screen.getByTestId('vat').value = `${validBill.vat}`
        screen.getByTestId('pct').value = `${validBill.pct}`
        newBill.fileName = 'test.png'
        newBill.fileUrl = 'https://test.com/test.png'

        const btn = screen.getByRole('button')
        const spy = jest.spyOn(newBill, 'handleSubmit')
        const spyCreateBill = jest.spyOn(newBill, 'createBill')
        userEvent.click(btn)
        expect(spy).toHaveBeenCalled()
        expect(spyCreateBill).toHaveBeenCalledWith(validBill)
      })
    })
  })
})
