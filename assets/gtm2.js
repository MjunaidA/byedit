function listenerForAtcAndWichlist(){
  
  let timeInterval = setInterval(() => {
    
    let wislistArray = document.querySelectorAll('.swym-button.swym-add-to-wishlist-view-product svg, .swym-button.swym-add-to-wishlist svg');
    
    let quicAddToCartArray = document.querySelectorAll('.addCartCstm:not(.active-event)');
    
    if(wislistArray.length > 0){
      clearInterval(timeInterval);
      // console.log(wislistArray)
      wislistArray.forEach(item => {
        if (!item.classList.contains('active-event')) {
          item.classList.add('active-event');
          if (item.closest('.product__info-wrapper'))
          {
            item.addEventListener('click', function(e) {
              let gtmPayload = this.closest('.product__info-wrapper').querySelector('.gtmPayload').value;
              
              gtmPayload = JSON.parse(gtmPayload)
              window.dataLayer.push({ ecommerce: null });
              window.dataLayer.push(gtmPayload);
            })
          } else {
          item.addEventListener('click', function(e) {
            // console.log(this)
            
            let gtmPayload = this.closest('.product-card-wrapper').querySelector('.gtmPayload').value;
            gtmPayload = JSON.parse(gtmPayload)
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push(gtmPayload);
          })
            
          }
          
        }
      })
    }

  
    if(quicAddToCartArray.length > 0){
      clearInterval(timeInterval);
      quicAddToCartArray.forEach(item => {
        if (!item.classList.contains('active-event')) {
          item.classList.add('active-event');
          item.addEventListener('click', function(e) {
            
            // console.log(this)
            let gtmPayload = this.closest('.product-card-wrapper').querySelector('.gtmPayload').value;
            gtmPayload = JSON.parse(gtmPayload)
            if(gtmPayload){
              gtmPayload.event = 'add_to_cart';
              window.dataLayer.push({ ecommerce: null });
              window.dataLayer.push(gtmPayload);
            }
          })
        }
      })
    }
  }, 300)
  
}
window.listenerForAtcAndWichlist = listenerForAtcAndWichlist

document.addEventListener("DOMContentLoaded", (event) => {
  listenerForAtcAndWichlist()

  let productPageATC = document.querySelector('[data-type="add-to-cart-form"]');
  if (productPageATC){
    productPageATC.addEventListener('submit', function(e) {
      let gtmPayload = document.querySelector('.form-wrapper-product-page .gtmPayload')?.value;
      gtmPayload = JSON.parse(gtmPayload)
      if(gtmPayload){
        gtmPayload.event = 'add_to_cart';
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push(gtmPayload);
      }
    })
  }

  // let mainCartRemoveButtonArray = document.querySelectorAll('#main-cart-items .deleteIconCart a');
  // mainCartRemoveButtonArray.forEach(item => {
  //   item.addEventListener('click', function(e) {
  //     let gtmPayload = this.closest('tr')?.querySelector('.gtmPayload')?.value;
  //     console.log('remove', gtmPayload)
  //     if(gtmPayload){
  //       gtmPayload = JSON.parse(gtmPayload)
  //       console.log('remove', gtmPayload)
  //       gtmPayload.event = 'remove_from_cart';
  //       window.dataLayer.push({ ecommerce: null });
  //       window.dataLayer.push(gtmPayload);
  //     }
  //   })
  // })

  function gtmClickCard() {
    // console.log('Click GTM Card')
    let productCardList = document.querySelectorAll('.product-card-wrapper');
    productCardList.forEach(item => {
      if (!item.classList.contains('active-event')) {
        item.classList.add('active-event');
        item.querySelectorAll('a.product-link-main').forEach(aEL => {
          aEL.addEventListener('click', (e) => {
            e.preventDefault();
            let redirectURL = aEL.href
            try {
              let redirectURL = aEL.href
              let rawPayload = JSON.parse(aEL.closest('.product-card-wrapper').querySelector('.gtmPayload').value)
              let deblicatePayload = Object.assign({}, rawPayload);
              deblicatePayload.event = "select_item",
                
              delete deblicatePayload.ecommerce.currency
              delete deblicatePayload.ecommerce.value
  
              deblicatePayload.ecommerce['item_list_id'] = rawPayload.ecommerce.items[0].item_list_id
              deblicatePayload.ecommerce['item_list_name'] = rawPayload.ecommerce.items[0].item_list_name
  
              // console.log(deblicatePayload)
              window.dataLayer.push({ ecommerce: null });
              window.dataLayer.push(deblicatePayload);
              window.location.href = redirectURL
            } catch (error) {
              // console.log('gtmClickCard Error:', error)
              window.location.href = redirectURL;
            }
            
          })
        })
      }
    })
  }

  gtmClickCard();
  window.gtmClickCard = gtmClickCard;
});

function gtm_removeFromMainCart(e){
  let gtmPayload = e.closest('tr')?.querySelector('.gtmPayload')?.value;
  
  
  if(gtmPayload){
    gtmPayload = JSON.parse(gtmPayload)
    // console.log('remove', gtmPayload)
    gtmPayload.event = 'remove_from_cart';
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(gtmPayload);
  }
}

window.gtm_removeFromMainCart = gtm_removeFromMainCart;

function gtm_removeFromCart(e) {
  
  let gtmPayload = e.closest('li')?.querySelector('.gtmPayload')?.value
  if (gtmPayload){
    gtmPayload = JSON.parse(gtmPayload)
    gtmPayload.event = 'remove_from_cart';
    // console.log('remove', gtmPayload)
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push(gtmPayload);
  }
  // console.log('trigger remove from cart');
}

window.gtm_removeFromCart = gtm_removeFromCart;



