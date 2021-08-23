import { ROUTES_PATH } from '../constants/routes.js';
import { formatDate, formatStatus } from '../app/format.js';
import Logout from './Logout.js';

export default class {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.firestore = firestore;
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener('click', (e) => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = (e) => {
    this.onNavigate(ROUTES_PATH['NewBill']);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute('data-bill-url');
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5);
    $('#modaleFile')
      .find('.modal-body')
      .html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`);
    $('#modaleFile').modal('show');
  };

  sortByDate = (a, b) => {
    let dateA = new Date(a.date);
    let dateB = new Date(b.date);
    let isDateAValid = isFinite(dateA.getTime());
    let isDateBValid = isFinite(dateB.getTime());

    // both dates are valid - return comparison
    if (isDateAValid && isDateBValid) return dateB - dateA;

    // date A invalid
    if (!isDateAValid) {
      // can be fixed
      if (a.date.includes('/')) {
        const dateSplit = a.date.split('/');
        const fixedDate = `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`;
        dateA = new Date(fixedDate);
      } else {
        return -1;
      }
    }
    // date B invalid
    if (!isDateBValid) {
      // can be fixed
      if (b.date.includes('/')) {
        const dateSplit = b.date.split('/');
        const fixedDate = `${dateSplit[2]}-${dateSplit[1]}-${dateSplit[0]}`;
        dateB = new Date(fixedDate);
      } else {
        return 1;
      }
    }
    return dateB - dateA;
  };

  // not need to cover this function by tests
  getBills = () => {
    const userEmail = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user')).email
      : '';
    if (this.firestore) {
      return this.firestore
        .bills()
        .get()
        .then((snapshot) => {
          const bills = snapshot.docs
            .map((doc) => doc.data())
            .sort(this.sortByDate)
            .map((bill) => {
              try {
                return {
                  ...bill
                  // date: formatDate(bill.date),
                  // status: formatStatus(bill.status)
                };
              } catch (e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                // console.log(e, 'for', bill);
                return {
                  ...bill,
                  date: bill.date,
                  status: formatStatus(bill.status)
                };
              }
            });
          // .filter((bill) => bill.email === userEmail);
          console.log('length', bills.length);
          return bills;
        })
        .catch((error) => error);
    }
  };
}
