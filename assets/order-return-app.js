const shop = "edit-watches.myshopify.com"
const app = document.querySelector('.order-return-app')
const returnBtn = document.querySelector('.card__btn button')
const backBtn = document.querySelector('.action__btns .back-btn')
const nextBtn = document.querySelector('.action__btns .next-btn')
const productCard = document.querySelectorAll('.order__card')
const returnSteps = document.querySelector('.return-steps')
const parentStep = document.querySelectorAll('.parent-step')
const firstStep = document.querySelectorAll('.first-step')
const secondStep = document.querySelectorAll('.second-step') 
const bothSteps = document.querySelectorAll('.both-steps')
const pickupAddress = document.querySelector('.pickup__address')
const reasonField = document.querySelector('.reason__field')
const orderNo = app.querySelector('.return-app-header').getAttribute('data-order')
const loader = document.querySelector('.app-ajax-loader')
var selected = false

function getReturnRequestDetails(req){
    var url = `https://sims-backend.alche.cloud/sims_integrations/get_order_details?order_name=${orderNo}`
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer c33987546011hgby35d650cf4fc78f84',
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const statusDetails = req
        const res = data
        if(res.return_payload.store_url){
            if(statusDetails == 'Return in process'){
                app.querySelector('.StepProgress .return-in-process').classList.add('is-done')
            }
            if(statusDetails == 'Returned'){
                app.querySelector('.pro-card-wrapper .sub__title').innerText = `Your order is successfully returned`
                app.querySelector('.pro-card-wrapper .return-status-badge').classList.add('completed')
                app.querySelector('.pro-card-wrapper .return-status-badge').innerText = `Returned`
                app.querySelector('.StepProgress .return-in-process').classList.add('is-done')
                app.querySelector('.StepProgress .returned-successfully').classList.add('is-done')
            }
            else{
                app.querySelector('.pro-card-wrapper .sub__title').innerText = `Your return request is under process`
                app.querySelector('.pro-card-wrapper .return-status-badge').classList.add('pending')
                app.querySelector('.pro-card-wrapper .return-status-badge').innerText = `Pending`
            }
            app.querySelector('.pro-card-wrapper .info__text').innerText = `Requested on ${res.return_payload.request_date}`

            app.querySelector('.after-return-request-details .request-date .info__text').innerText = res.return_payload.request_date
            app.querySelector('.after-return-request-details .refund-mode .info__text').innerText = res.return_payload.refund_mode
            app.querySelector('.after-return-request-details .return-address address').innerText = res.return_payload.address
            app.querySelector('.after-return-request-details .return-reason .info__text').innerText = res.return_payload.reason_for_refund[0].title
            var line_items = []
            res.return_payload.line_items.forEach(item => {
                var lineItem = `<div class="order__wrapper" data-id="${item.id}" data-sku="${item.sku}">
                <div class="order__desc">
                    <h4 class="item-title">${item.title} ${item.variant}</h4><h4 class="item-price">${item.price}</h4>
                    <h4 class="item-quantity">Return Qty  - ${item.quantity}</h4>
                </div>
                <div class="order__img">
                    <img src="${item.image}" alt="img">
                </div>
                </div>`
                line_items.push(lineItem)
            })
            app.querySelector('.after-return-request-details .items-returned .flex__two').innerHTML = line_items.join('')
        }
    })
    .finally(() => {
    })
}

function getReturnRequest(){
    loader.classList.remove('hidden')
    var url = `https://reverselogistics-be.ginkgoretail.net/orderManagement/orderStatus?shop=${shop}&order_name=${orderNo}`
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const res = data
        if(!res.status){
            app.querySelector('.before-return-request').classList.remove('hidden')
        }
        else{
            app.querySelector('.after-return-request').classList.remove('hidden')
            getReturnRequestDetails(res)
        }
    })
    .finally(() => {
        loader.classList.add('hidden')
    })
}
getReturnRequest()

function postReturnRequestDetails(){
    var url = 'https://sims-backend.alche.cloud/sims_integrations/get_order_details'
    var lineItems = [], reasonDetails = []
    productCard.forEach(item => {
        if(item.classList.contains('selected')){
            var sku = item.getAttribute('data-sku')
            var id = item.getAttribute('data-id')
            var quantity = item.getAttribute('data-quantity')
            var url = item.getAttribute('data-url')
            var title = item.getAttribute('data-title')
            var image = item.getAttribute('data-image')
            var variant = item.getAttribute('data-variant')
            var price = item.getAttribute('data-price')
            lineItems.push(
                {
                    "url": url,
                    "id": id,
                    "title": title,
                    "image": image,
                    "variant": variant,
                    "price": price,
                    "quantity": quantity,
                    "sku": sku
                }
            )
        }
    })
    var reasonTitle = reasonField.querySelector('select').value
    var description = app.querySelector('.quality-not-satisfactory textarea').innerText
    var reasonImage = ""
    if(reasonTitle == 'Damaged'){
        reasonImage = app.querySelector('.damaged input').value
    }
    else if(reasonTitle == 'Wrong item'){
        app.querySelector('.wrong-item input').value
    }
    reasonDetails.push(
        {
            "title": reasonTitle,
            "description": description,
            "image": reasonImage
        }
    )

    var addressElements = ['.Name', '.Address', '.Appartment', '.City', '.State', '.Country', '.Zipcode', '.Phonenumber']

    var address = addressElements.map(function(selector) {
      var input = app.querySelector('.edit-address-form ' + selector + ' input').value
      return input.trim() // Remove leading/trailing spaces
    }).filter(Boolean).join(', ')

    const date = new Date().toLocaleDateString()

    var data = {
        "store_url": shop,
        "order_id" : orderNo, 
        "reason_for_refund": reasonDetails,
        "refund_mode": "Original",
        "request_date": date,
        "address": address,
        "line_items": lineItems
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer c33987546011hgby35d650cf4fc78f84',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        const res = data
        if(res.return_payload != ""){
            app.querySelector('.request-submitted').classList.remove('hidden')
            app.querySelector('.before-return-request').classList.add('hidden')
            app.scrollIntoView({ behavior: 'smooth' })
        }
    })
    .finally(() => {
    })
}

function postReturnRequest(){
    var url = 'https://reverselogistics-be.ginkgoretail.net/orderManagement/publicReturnOrder'
    var lineItems = []
    productCard.forEach(item => {
        if(item.classList.contains('selected')){
            var sku = item.getAttribute('data-sku')
            var id = item.getAttribute('data-id')
            var quantity = item.getAttribute('data-quantity')
            lineItems.push(
                { 
                    "line_id": id,
                    "sku": sku, 
                    "quantity": quantity
                }
            )
        }
    })
    var data = {
        "shop": shop,
        "order_id": orderNo,
        "line_items": lineItems
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        const res = data
        if(res.detail == 'Return order created successfully'){
            postReturnRequestDetails()
        }
    })
    .finally(() => {
        loader.classList.add('hidden')
    })
}

// Selecting of product for return
if(productCard){
    productCard.forEach(card => {
        card.querySelector('input.select-item.parent-step').addEventListener('change', (e)=> {
            app.querySelector('p.p-error.selected-p-error').classList.add('hidden')
            if(e.target.checked){
                card.classList.add('selected')
            }else{
                card.classList.remove('selected')
            }
        })
    })  
}

// when return button is triggered
if(returnBtn){
    returnBtn.addEventListener('click', () => {
        var selected = false
        if(productCard){
            productCard.forEach(card => {
                if(card.classList.contains('selected')){
                    selected = true
                }
            })  
        }
        if(selected){
            app.querySelector('p.p-error.selected-p-error').classList.add('hidden')
            if(parentStep){
                parentStep.forEach(parent => {
                    parent.classList.add('hidden')
                })
            }
            if(firstStep){
                firstStep.forEach(first => {
                    first.classList.remove('hidden')
                })
            }
            if(bothSteps){
                bothSteps.forEach(both => {
                    both.classList.remove('hidden')
                })
            }
            app.classList.add('step-1-start')
            app.querySelectorAll('.reason-description').forEach(item => {
                item.classList.add('hidden')
            })
            if(reasonField){
                var reason = reasonField.querySelector('select').value
                if(reason == 'Quality not satisfactory'){
                    app.querySelector('.quality-not-satisfactory').classList.remove('hidden')
                }
                else if(reason == 'Damaged'){
                    app.querySelector('.damaged').classList.remove('hidden')
                }
                else if(reason == 'Wrong item'){
                    app.querySelector('.wrong-item').classList.remove('hidden')
                }
            }
        }
        else{
            app.querySelector('p.p-error.selected-p-error').classList.remove('hidden')
        }
    })
}

// When back step button is triggered
if(backBtn){
    backBtn.addEventListener('click', () => {
        if(app.classList.contains('step-1-start')){
            app.classList.remove('step-1-start')
            if(parentStep){
                parentStep.forEach(parent => {
                    parent.classList.remove('hidden')
                })
            }
            if(firstStep){
                firstStep.forEach(first => {
                    first.classList.add('hidden')
                })
            }
            if(bothSteps){
                bothSteps.forEach(both => {
                    both.classList.add('hidden')
                })
            }
        }
        else{
            app.classList.remove('step-2-start')
            app.classList.add('step-1-start')
            if(firstStep){
                firstStep.forEach(first => {
                    first.classList.remove('hidden')
                })
            }
            if(secondStep){
                secondStep.forEach(second => {
                    second.classList.add('hidden')
                })
            }
            returnSteps.querySelector('.step-1').classList.remove('hidden')
            returnSteps.querySelector('.step-1-completed').classList.add('hidden')
            returnSteps.querySelector('.step-2').classList.remove('active')
            app.querySelectorAll('.reason-description').forEach(item => {
                item.classList.add('hidden')
            })
            if(reasonField){
                var reason = reasonField.querySelector('select').value
                if(reason == 'Quality not satisfactory'){
                    app.querySelector('.quality-not-satisfactory').classList.remove('hidden')
                }
                else if(reason == 'Damaged'){
                    app.querySelector('.damaged').classList.remove('hidden')
                }
                else if(reason == 'Wrong item'){
                    app.querySelector('.wrong-item').classList.remove('hidden')
                }
            }
        }
        nextBtn.innerText = 'NEXT'
    })
}
// When next step button is triggered
if(nextBtn){
    nextBtn.addEventListener('click', () => {
        if(app.classList.contains('step-1-start')){
            app.classList.remove('step-1-start')
            app.classList.add('step-2-start')
            if(firstStep){
                firstStep.forEach(first => {
                    first.classList.add('hidden')
                })
            }
            if(secondStep){
                secondStep.forEach(second => {
                    second.classList.remove('hidden')
                })
            }
            returnSteps.querySelector('.step-1').classList.add('hidden')
            returnSteps.querySelector('.step-1-completed').classList.remove('hidden')
            returnSteps.querySelector('.step-2').classList.add('active')
            nextBtn.innerText = 'SUBMIT'
        }
        else{
            loader.classList.remove('hidden')
            postReturnRequest()
        }
    })
}

// Reason selection
if(reasonField){
    reasonField.querySelector('select').addEventListener('change', (e) => {
        app.querySelectorAll('.reason-description').forEach(item => {
            item.classList.add('hidden')
        })
        var reason = e.target.value
        if(reason == 'Quality not satisfactory'){
            app.querySelector('.quality-not-satisfactory').classList.remove('hidden')
        }
        else if(reason == 'Damaged'){
            app.querySelector('.damaged').classList.remove('hidden')
        }
        else if(reason == 'Wrong item'){
            app.querySelector('.wrong-item').classList.remove('hidden')
        }
    })
}
// When change address button is triggerd
if(pickupAddress){
    pickupAddress.querySelector('.change__address').addEventListener('click', () => {
        pickupAddress.querySelector('address').classList.toggle('hidden')
        pickupAddress.querySelector('.edit-address-form').classList.toggle('hidden')
    })
}
// When returned item button is triggered
const returnedItemBtn = document.querySelector('.view-returned-item')
if(returnedItemBtn){
    returnedItemBtn.addEventListener('click', () => {
        returnedItemBtn.closest('.after-return-request').classList.add('hidden')
        returnedItemBtn.closest('.order-return-app').querySelector('.after-return-request-details').classList.remove('hidden')
    })
}
// When back to retutned item button is triggered
const backReturnBtn = document.querySelector('.back-button .back-Icon')
if(backReturnBtn){
    backReturnBtn.addEventListener('click', () => {
        backReturnBtn.closest('.after-return-request-details').classList.add('hidden')
        backReturnBtn.closest('.order-return-app').querySelector('.after-return-request').classList.remove('hidden')
    })
}