

async function hashEmail(email) {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedEmail = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashedEmail;
}

/* define events */
async function gtmPageLoad(data){
  
  if (data.hashedEmail){
    data.hashedEmail = await hashEmail(data.hashedEmail)
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

async function gtm_event_push(data) {
  console.log('gtm push function')
  dataLayer.push({ ecommerce: null }); // Clear the previous ecommerce object.
  dataLayer.push(data)
}

async function gtm_productCardImpressions(sectionName, sectionID, data){
  
  
  console.log("gtm_productCardImpressions---------------------", sectionName, sectionID, data)

  let tempPayload = {
    event: "view_item_list",
    ecommerce: {
      item_list_id: sectionID,
      item_list_name: sectionName,
      items: []
    }
  } 

  let tempItemData = data.map((item, i) => {
    let item_id = item.id;
    let item_name = item.title;
    let coupon = item.coupon;
    let index = i;
    let item_brand = item.vendor;
    let item_category = item.type;
    let item_category2 = item.collections[0].title;
    let item_category3 = item.collections[1].title;
    let item_category4 = item.collections[2].title;
    let item_category5 = item.collections[3].title;
    let item_list_id = sectionID; //product list id, if applicable
    let item_list_name = sectionName; //product list name, if applicable
    let item_variant = item.variant.title; //product variant
    let price = item.variant.price; //product price
    let quantity = "1"; //product quantity
    let sale_status = item.variant.sale_status; // Sale status (On Offer / No Offer)
    let stock_status = item.variant.stock_status; // stock status (In Stock / Out of Stock)
    let discount_percent = item.variant.discount_percent // discounted percentage of product (50% / 30%)
    let product_gender = ''; // product gender (Men / Women / Kids)

    return { item_id, item_name, coupon, index, item_brand, item_category, item_category2, item_category3, item_category4, item_category5, item_list_id, item_list_name, item_variant, price, quantity, sale_status, stock_status, discount_percent, product_gender }
  })

  console.log(tempItemData)
  
  // await gtm_event_push(data);
  // {
  // event: "view_item_list",
  //   ecommerce: {
  //   item_list_id: "",
  //   item_list_name: "",
  //   items: [
  //     {
  //      item_id: "222-0087MNT02", //product sku
  //      item_name: "Men Legacy Quartz Watch", //product name
  //      coupon: "", //coupon code
  //      index: 1, //product position in the list
  //      item_brand: "GC", //product brand
  //      item_category: "Watch", //product category
  //      item_category2: "", //product category 2
  //      item_category3: "", //product category 3
  //      item_category4: "", //product category 4
  //      item_category5: "", //product category 5
  //      item_list_id: "", //product list id, if applicable
  //      item_list_name: "", //product list name, if applicable
  //      item_variant: "44mm / Green / Silver", //product variant
  //      price: 9.99, //product price
  //      quantity: 1, //product quantity
  //      'sale_status': '', // Sale status (On Offer / No Offer)
  //      'stock_status': '', // stock status (In Stock / Out of Stock)
  //      'discount_percent': '', // discounted percentage of product (50% / 30%)
  //      'product_gender': '' // product gender (Men / Women / Kids)
  //     }
  //   ]
  // }
}




/* bind functions with window object */
window.gtmPageLoad = gtmPageLoad;



