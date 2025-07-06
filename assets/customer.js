const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]'
};

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message'
};
 
class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container ? {
      container,
      addressContainer: container.querySelector(selectors.addressContainer),
      toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
      cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
      deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
      countrySelects: container.querySelectorAll(selectors.addressCountrySelect)
    } : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener('click', this._handleCancelButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  } 

  _toggleExpanded(target) {
    target.setAttribute(
      attributes.expanded,
      (target.getAttribute(attributes.expanded) === 'false').toString()
    );
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  }

  _handleCancelButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(
      currentTarget
        .closest(selectors.addressContainer)
        .querySelector(`[${attributes.expanded}]`)
    )
  }

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  }
}

/* Custom Account Page */

const mobileTab = document.querySelector('.mobile-tab-header .tab-title')

// Search functionality on orders
const searchInput = document.querySelector('.search-orders input')
if(searchInput){
  searchInput.addEventListener('change', (e) => {
    var search = e.target.value.toLowerCase()
    document.querySelectorAll('.order-history tbody tr').forEach(item => {
      item.style.display = 'none'
      var orderNo = item.getAttribute('data-order')
      orderNo.includes(search) ? item.style.display = 'table-row' : null    
    })
  })
}

// Tabs
const tabsMain = document.querySelectorAll('.edit-account-page .tab-header')
if(tabsMain){
  tabsMain.forEach(item => {
    item.addEventListener('click', (e) => {
        item.closest('.edit-account-page').querySelectorAll('.tab-header').forEach(a => {
          a.classList.remove('active')
        })
        item.classList.add('active')
        mobileTab ? mobileTab.innerText = item.innerText : null
        if(window.innerWidth < 768){
          item.closest('.side-bar').classList.add('hidden')
          item.closest('.side-bar').classList.contains('active') ? item.closest('.side-bar').classList.remove('active'): null
          mobileTab.closest('.mobile-tab-header').classList.contains('active') ? mobileTab.closest('.mobile-tab-header').classList.remove('active') : null
        }
        var tabHeader = item.getAttribute('data-title')
        sessionStorage.setItem('active-tab', `?tab=${tabHeader}`)
        window.history.pushState(window.location.href ,'new', `?tab=${tabHeader}`)
  
        document.querySelectorAll('.edit-account-page .tab-details').forEach(tab => {
          tab.classList.add('hidden')
        })
        document.querySelector(`.${tabHeader}`).classList.remove('hidden')
    })
  })
}

// Tabs Mobile
if(window.innerWidth < 768){
  if(mobileTab){
    mobileTab.closest('.mobile-tab-header').addEventListener('click', (e) => {
      e.target.classList.toggle('active')
      if(document.querySelector('.side-bar')){
        document.querySelector('.side-bar').classList.toggle('active')
        document.querySelector('.side-bar').classList.contains('hidden') ? document.querySelector('.side-bar').classList.remove('hidden') : null
      }
    })
  }
}

// if page is address
if(window.location.href.includes('/account/addresses')){
  if(sessionStorage.getItem('active-tab') != null || sessionStorage.getItem('active-tab') != ""){
    window.history.pushState(window.location.href, 'new', sessionStorage.getItem('active-tab'))
  }else{
    window.history.pushState(window.location.href, 'new', '?tab=my-address')
  }
}

// if page is order details and download invoice session is active
if(window.location.href.includes('/account/orders/')){
  if(window.location.href.includes('?view=download-invoice')){
    window.print()
  }
}

// if page is order details and return order session is active
if(window.location.href.includes('/account/orders/')){
  if(window.location.href.includes('?view=return-order-app')){
    document.querySelector('.main-order-details-wrap').classList.add('hidden')
    document.querySelector('.main-order-return-wrap').classList.remove('hidden')
  }
}

// Tab active on pageload
if(window.location.search.includes('?tab=')){
  var tab = window.location.search.split('?tab=')[1]
  document.querySelectorAll('.edit-account-page .tab-header').forEach(item => {
    var tabHeader = item.getAttribute('data-title')
    item.classList.remove('active')
    if(tab == tabHeader){
      item.classList.add('active')
      mobileTab ? mobileTab.innerText = item.innerText : null
    }
    document.querySelectorAll('.edit-account-page .tab-details').forEach(tab => {
      tab.classList.add('hidden')
    })
    document.querySelector(`.${tab}`).classList.remove('hidden')
  })
}

// Add address button action
const addButton = document.querySelector('li.add-new-address button')
if(addButton){
  addButton.addEventListener('click', (e) => {
    document.querySelector('#AddAddress').classList.toggle('hidden')
    document.querySelector('#AddAddress').classList.contains('hidden') ? null : window.scrollTo({ top: document.querySelector('#AddAddress').offsetHeight, behavior: 'smooth' })
  })
}

// Cancel address button action
const cancelButton = document.querySelectorAll('.address-form-actions .cancel-button')
if(cancelButton){
  cancelButton.forEach(item => {
    item.addEventListener('click', (e) => {
      item.closest('.address-form-wrapper').classList.add('hidden')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  })
}

// Edit address button action
const editButton = document.querySelectorAll('.address-actions .edit-btn')
if(editButton){
  editButton.forEach(item => {
    item.addEventListener('click', (e) => {
      const addressId = item.closest('li').getAttribute('data-id')
      document.querySelector(`#${addressId}`).classList.toggle('hidden')
      document.querySelector(`#${addressId}`).classList.contains('hidden') ? null : window.scrollTo({ top: document.querySelector(`#${addressId}`).offsetHeight, behavior: 'smooth' })
    })
  })
}

// Delete address button action
const deleteButton = document.querySelectorAll('.address-actions .delete-btn')
if(deleteButton){
  deleteButton.forEach(item => {
    item.addEventListener('click', (e) => {
      const addressId = item.closest('li').getAttribute('data-id')
      document.querySelector(`.${addressId}.address-delete-form button`).click()
    })
  })
}

/* Custom Account Page (end) */
