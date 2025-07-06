// cstmFunctionLoadMore
function loadMoreCstm() {
  // Load More functionality on collection page and search page
  var products_on_page = document.querySelector("#product-grid");
  var loadmore_btn = document.querySelector(".load-more-cstm-btn");
  var loadmore_spinner = document.querySelector(".load-more-spinner");
  var no_more = document.querySelector(".no-more-cstm");
  if (no_more) {
    no_more.style.display = "none";
  }
  if (loadmore_spinner) {
    loadmore_spinner.style.display = "none";
  }
  var next_url = products_on_page.getAttribute('data-next-url');
  sessionStorage.setItem('nextUrl', next_url)
  if(sessionStorage.getItem('nextUrl') == next_url){
    if (next_url) {
      function loadMoreProducts() {
  
        fetch(next_url)
          .then((response) => {
            loadmore_btn.style.display = "none";
            loadmore_spinner.style.display = "inline-block";
            return response.text();
          })
          .then((data) => {
            var parser = new DOMParser();
            var doc = parser.parseFromString(data, 'text/html');
            var return_html = doc.body;
            var main_html = return_html.querySelector('#product-grid');
            var main_four_html = return_html.querySelector('#product-grid');
            if (main_four_html) {
              var main_four_html_child = main_four_html.querySelectorAll('.grid__item');
            }
            var main_html_child = main_html.querySelectorAll('.grid__item');
            var new_url = main_html.getAttribute('data-next-url');
            loadmore_spinner.style.display = "none";
            if (new_url) {
              loadmore_spinner.style.display = "inline-block";
              loadmore_btn.style.display = "none";
            }
            next_url = new_url;
            sessionStorage.setItem('nextUrl', next_url)
            setTimeout(() => {
              main_html_child.forEach(function (value, index) {
                document.querySelector('.main-product-grids-wrapper').append(value)
              })
              if (main_four_html_child) {
                main_four_html_child.forEach(function (data, index) {
                  document.querySelector('#product-grid').append(data)
                })
              }
              loadmore_spinner.style.display = "none";
              if (new_url) {
                loadmore_btn.style.display = "block";
              }
              else {
                try{products_on_page.setAttribute('data-next-url', '')
                loadmore_btn.classList.remove('load-more-cstm-btn');
                loadmore_btn = '';
                next_url = ''
                no_more.style.display = "block";}
                catch(err){
                    console.log("no btn found")
                }
               
              }
            }, 600)
          })
          .catch((err) => {
            console.log(err);
          })
      }
  
      if (document.querySelectorAll('#load-more-cstm-btn').length > 0) {
        document.querySelector('.load-more-cstm-btn').addEventListener('click', () => {
          loadMoreProducts()
        });
      }
    }
    else{
  try{
   console.log("empty");
       no_more.style.display = "block";
      loadmore_btn.style.display = "none";
        loadmore_spinner.style.display = "none";
  }
  catch(err){
  console.log("no btn found")
  }
     
    }
  }
   let btnClick = new Event('click');
   document.addEventListener('scroll', function () {
     var collectionTplElm = document.querySelector('.collection_top-wrapper');
      	let loadmorebtn =  document.querySelector(".load-more-cstm-btn");
     var collectionTop = window.innerHeight;
     var collectionHeight = collectionTplElm.clientHeight;
     var posTop = collectionTop + collectionHeight - window.innerHeight;
      		console.log("collectionTop = " + collectionTop + 'collectionHeight = ' + collectionHeight + 'posTop=' + posTop + 'WindowScroll' + window.pageYOffset)

     if (window.pageYOffset > posTop - 5000 && window.pageYOffset < (posTop + 10000)) {
       if (loadmore_btn) {
         if (loadmore_btn.classList.contains('btn-disabled')) {
                        	console.log('this')  
         }
         else {
           loadmore_btn.dispatchEvent(btnClick);
           loadmore_btn.classList.add('btn-disabled')
           setTimeout(function () {
             if (loadmore_btn) {
               loadmore_btn.classList.remove('btn-disabled')
             }
           }, 3000)
         }
       }
     };
   }

   );
}

function varientQuickView2(){
  // add to cart Card
let optionSize = document.querySelectorAll('.card-wrapper .card__content .card-information .optionSize');
for (let j = 0; j < optionSize.length; j++) {
  let firstChild = optionSize[j].querySelector(':first-child');
  firstChild.classList.add('bgwhite');
}
let addCartCstm = document.querySelectorAll('.cardIconCstm .addCartCstm');
let varientIdMain = 0;
let optionSizeObject = document.querySelectorAll('.optionSizeObject');

for(let i = 0; i<optionSizeObject.length;i++){
optionSizeObject[i].onclick = function () {
  try {
    let closetParent = this.closest('.optionSize')
    let bgWhite = closetParent.querySelectorAll('.optionSizeObject');
    for(let k=0;k<bgWhite.length;k++){
      bgWhite[k].classList.remove('bgwhite')
    }
  }
  catch(err) {
    console.log("no bg white")
  }
varientIdMain =  optionSizeObject[i].getAttribute('data-variant-id');
optionSizeObject[i].classList.add("bgwhite")

//show variant details
var price = optionSizeObject[i].getAttribute('data-price')
this.closest('.card__content').querySelector('.price-item--regular').innerText = price
var image = optionSizeObject[i].getAttribute('data-image')
if(image){
  optionSizeObject[i].closest('.card-wrapper').querySelector('.media img.first-image').setAttribute('src', image)
  optionSizeObject[i].closest('.card-wrapper').querySelector('.media img.first-image').setAttribute('srcset', image)
}
var title = optionSizeObject[i].getAttribute('data-title')
if(title){
  this.closest('.card__content').querySelectorAll('.card__heading.h5 a').forEach(item => {
    item.innerText = title
  })
}else{
  this.closest('.card__content').querySelectorAll('.card__heading.h5 a').forEach(item => {
    item.innerText = item.getAttribute('data-title')
  })
}

}
}
for (let i = 0; i < addCartCstm.length; i++) {
   addCartCstm[i].onclick = function () {
    var maxQuantity = addCartCstm[i].closest('.mn_pro-main').getAttribute('max-quantity')
  if(varientIdMain !=0){
  addToCart(varientIdMain, maxQuantity);
varientIdMain=0;
}
else{
  let varientIdMain2 =   addCartCstm[i].getAttribute('variablefirst')
  addToCart(varientIdMain2, maxQuantity)
}
    //  addToCart(varientIdMain)
   
   }
  }
  // endcart
  let quickAddCstm = document.querySelectorAll('.cardIconCstm .quickCstm');
  for (let i = 0; i < quickAddCstm.length; i++) {
    quickAddCstm[i].onclick = function () {
      let btnOpenQuick = quickAddCstm[i].closest('.quickPlacementDiv');
      let btnOpenQuick2 = btnOpenQuick.closest('.card-wrapper');
      let btnToClick = btnOpenQuick2.querySelector('.card__content .quick-add__submit.button');
      btnToClick.click();
    };
  }
  }
function handleInputChangeFacets2() {
  const inputFields = document.querySelectorAll('.facets__item input');
  inputFields.forEach((input) => {
    const closestFacetItem = input.closest('.facets__item');
    const svgChecked = closestFacetItem.querySelector('.svgChecked');
    const svgChecked2 = closestFacetItem.querySelector('.svgChecked2');
    if (input.checked) {
      svgChecked.style.backgroundColor = '#44AC34';
      svgChecked2.style.backgroundColor = '#44AC34';
      svgChecked2.style.color = 'white';
    }
    input.addEventListener('change', () => {
      if (input.checked) {
        svgChecked.style.backgroundColor = '#44AC34';
        svgChecked2.style.backgroundColor = '#44AC34';
        svgChecked2.style.color = 'white';
      } else {
        svgChecked.style.backgroundColor = '';
        svgChecked2.style.backgroundColor = '';
        svgChecked2.style.color = '';
      }
    });
  });
}



class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
      document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer){
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop){
      countContainerDesktop.classList.add('loading');
    }
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;
      FacetFiltersForm.filterData.some(filterDataUrl) ?
      FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
      FacetFiltersForm.renderSectionFromFetch(url, event);
    });
    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
  document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
  landingProductOnCollPage()
   varientQuickView2();
   backToTopCollection()
  //  For swym wishlist loading
   document.dispatchEvent(new CustomEvent("swym:collections-loaded"));
   
   var products_on_page = document.querySelector("#product-grid");
var next_url = products_on_page.getAttribute('data-next-url');
sessionStorage.setItem('nextUrl', next_url)

var loadmore_btn = document.querySelector(".load-more-cstm-btn");
var loadmore_spinner = document.querySelector(".load-more-spinner");

var loadprev_btn = document.querySelector(".load-prev-cstm-btn")
var loadprev_spinner = document.querySelector(".load-prev-spinner")
var prev_url = products_on_page.getAttribute('data-prev-url')

var no_more = document.querySelector(".no-more-cstm");
if (no_more) {
  no_more.style.display = "none";
}
if (loadmore_spinner) {
  loadmore_spinner.style.display = "none";
}

function loadPreviousProducts(){ 
 if(prev_url){
     fetch(prev_url)
     .then((response)=>{
         loadprev_spinner.style.display = "inline-block"
         loadprev_btn.style.display = "none"
         return response.text()
     })
     .then((data)=>{
     var parser = new DOMParser()
     var doc = parser.parseFromString(data, 'text/html')
     var return_html = doc.body
     var main_html = return_html.querySelector('#product-grid')
     var main_html_child = main_html.querySelector('#product-grid')
    var main_html_child = main_html.querySelectorAll('.grid__item');
     var new_prev_url = main_html.getAttribute('data-prev-url')
     if(new_prev_url){
         loadprev_spinner.style.display = "inline-block"
         loadprev_btn.style.display = "none"
     }
     prev_url = new_prev_url
     setTimeout(()=>{
         main_html_child.forEach(function(value, index){
             document.querySelector('.main-product-grids-wrapper').prepend(value)	
         })
         
         loadprev_spinner.style.display = "none"
         if(new_prev_url){
             loadprev_btn.style.display = "inline-flex"
         }
         else{
             products_on_page.setAttribute('data-prev-url','')
             loadprev_btn.style.display = "none"
             prev_url = ''
             loadprev_btn.closest('.loadprev-cstm').remove()
         }
         varientQuickView()
          landingProductOnCollPage()
          //  For swym wishlist loading
   document.dispatchEvent(new CustomEvent("swym:collections-loaded"));
     },100) 
     })
     .catch((err)=>{
       console.log(err)
     })
  }
}

if(document.querySelectorAll('#load-prev-cstm-btn').length > 0){
 document.querySelector('#load-prev-cstm-btn').addEventListener('click', ()=>{
   loadPreviousProducts()
 })
}

  function loadMoreProducts() {
    if(sessionStorage.getItem('nextUrl') == next_url){
      if (next_url) {
      fetch(next_url)
        .then((response) => {
          loadmore_btn.style.display = "none";
          loadmore_spinner.style.display = "inline-block";
          return response.text();
        })
        .then((data) => {
          var parser = new DOMParser();
          var doc = parser.parseFromString(data, 'text/html');
          var return_html = doc.body;
          var main_html = return_html.querySelector('#product-grid');
          var main_four_html = return_html.querySelector('#product-grid');
          if (main_four_html) {
            var main_four_html_child = main_four_html.querySelectorAll('.grid__item');
          }
          var main_html_child = main_html.querySelectorAll('.grid__item');
          var new_url = main_html.getAttribute('data-next-url');
          if (new_url) {
            loadmore_spinner.style.display = "inline-block";
            loadmore_btn.style.display = "none";
          }
          next_url = new_url;
          sessionStorage.setItem('nextUrl', next_url)
          setTimeout(() => {
            main_html_child.forEach(function (value, index) {
              document.querySelector('.main-product-grids-wrapper').append(value)
            })
            if (main_four_html_child) {
              main_four_html_child.forEach(function (data, index) {
                document.querySelector('#product-grid').append(data)
              })
            }
            loadmore_spinner.style.display = "none";
            if (new_url) {
              loadmore_btn.style.display = "block";
            } else {
              products_on_page.setAttribute('data-next-url', '')
              loadmore_btn.classList.remove('load-more-cstm-btn');
              loadmore_btn = '';
              next_url = '';
              no_more.style.display = "block";
            }
            varientQuickView()
            landingProductOnCollPage()
            //  For swym wishlist loading
   document.dispatchEvent(new CustomEvent("swym:collections-loaded"));
          }, 100)
          
        })
        .catch((err) => {
          console.log(err);
        })
      }
    }
  }

if (document.querySelectorAll('#load-more-cstm-btn').length > 0) {
  document.querySelector('.load-more-cstm-btn').addEventListener('click', () => {
    loadMoreProducts()
  });
}
 let btnClick = new Event('click');
 document.addEventListener('scroll', function () {
   var collectionTplElm = document.querySelector('.collection_top-wrapper');
   let loadmorebtn = document.querySelector(".load-more-cstm-btn");
   var collectionTop = window.innerHeight;
   var collectionHeight = collectionTplElm.clientHeight;
   var posTop = collectionTop + collectionHeight - window.innerHeight;

   if (window.pageYOffset > posTop - 5000 && window.pageYOffset < (posTop + 10000)) {
     if (loadmore_btn) {
       if (loadmore_btn.classList.contains('btn-disabled')) {
       } else {
         loadmore_btn.dispatchEvent(btnClick);
         loadmore_btn.classList.add('btn-disabled')
         setTimeout(function () {
           if (loadmore_btn) {
             loadmore_btn.classList.remove('btn-disabled')
           }
         }, 3000)
       }
     }
   }
  
 });


    // loadMoreCstm();

    // active facets
let activeFacetDiv = document.querySelectorAll('.active-facets .toCountFilters');
let counter = document.querySelectorAll('.Filters-selected')
let valuetoadd = activeFacetDiv.length;
for(let i=0;i<counter.length;i++){
let counter2 = counter[i].querySelector('.counter')
counter2.setAttribute("value", valuetoadd);
counter2.innerHTML = valuetoadd;
}
try {
 let conterMobileFilterMain = document.querySelector(".filtersDiv .filterActiveCounter");
  let conterMobileFilter = document.querySelector(".filtersDiv .filterActiveCounter .counterTxtfilter");
  conterMobileFilter.setAttribute("value", valuetoadd);
  conterMobileFilter.innerHTML = valuetoadd;
if(valuetoadd == 0){
conterMobileFilterMain.style.display ="none";
}
else{
conterMobileFilterMain.style.display ="block";
}
}
catch(e) {
  console.log(e);
  console.log("filters div not found")
}
// active facets end

//grid view
    let threeGridDesktop = document.querySelector('.gridViewChangeCstm .threegrid');
    let threeGridDesktopSvg = document.querySelector('.gridViewChangeCstm .threegrid svg');
    let fourGridDesktop = document.querySelector('.gridViewChangeCstm .fourgrid');
    let fourGridDesktopSvg = document.querySelector('.gridViewChangeCstm .fourgrid svg');
    let productGrid =document.getElementById('product-grid');
    let desktopInitialGrid = productGrid.getAttribute("desktoplayout")
    let mobileInitialGrid = productGrid.getAttribute("mobilelayout")
    fourGridDesktopSvg.classList.remove("stokeon")
    threeGridDesktopSvg.classList.remove("stokeon2")

    if(desktopInitialGrid == 4){
    fourGridDesktopSvg.classList.add("stokeon")
      threeGridDesktopSvg.classList.remove("stokeon2")
    }
    if(desktopInitialGrid == 3){
    fourGridDesktopSvg.classList.remove("stokeon");
      threeGridDesktopSvg.classList.add("stokeon2")
    }

    threeGridDesktop.onclick = function(){
      console.log("three")
      productGrid.classList.add('grid--3-col-desktop')
      productGrid.classList.remove('grid--4-col-desktop')
      fourGridDesktopSvg.classList.remove("stokeon");
      threeGridDesktopSvg.classList.add("stokeon2")
      desktopInitialGrid =3;

    }
      fourGridDesktop.onclick = function(){
        console.log("four")
        productGrid.classList.remove('grid--3-col-desktop');
        productGrid.classList.add('grid--4-col-desktop')
        fourGridDesktopSvg.classList.add("stokeon")
        threeGridDesktopSvg.classList.remove("stokeon2")
        desktopInitialGrid =4;
      }

            //mobile
      let ondGridMobile = document.querySelector('.gridViewChangeMobile .singleViewMobile');
      let ondGridMobileSvg = document.querySelector('.gridViewChangeMobile .singleViewMobile svg');
      let twoGridMobile = document.querySelector('.gridViewChangeMobile .TwoViewMobile');
      let twoGridMobileSvg = document.querySelector('.gridViewChangeMobile .TwoViewMobile svg');
      let productMobile =document.getElementById('product-grid');
      let actualInitialGrid = productMobile.getAttribute("mobilelayout")

      twoGridMobileSvg.classList.remove("stokeon")
      ondGridMobileSvg.classList.remove("stokeon2")

      if(actualInitialGrid == 2){
      twoGridMobileSvg.classList.add("stokeon")
        ondGridMobileSvg.classList.remove("stokeon2")
      }
      if(actualInitialGrid == 1){
      twoGridMobileSvg.classList.remove("stokeon");
        ondGridMobileSvg.classList.add("stokeon2")
      }

      ondGridMobile.onclick = function(){
        console.log("one")
        productMobile.classList.add('grid--1-col-tablet-down')
        productMobile.classList.remove('grid--2-col-tablet-down')
        twoGridMobileSvg.classList.remove("stokeon");
        ondGridMobileSvg.classList.add("stokeon2")
        actualInitialGrid =1;
      }
      twoGridMobile.onclick = function(){
        console.log("two")
        productMobile.classList.remove('grid--1-col-tablet-down');
        productMobile.classList.add('grid--2-col-tablet-down')
        twoGridMobileSvg.classList.add("stokeon")
        ondGridMobileSvg.classList.remove("stokeon2")
        actualInitialGrid =2;
      }


      let facetIconsCollection = document.querySelectorAll(".cstm-facets");
      for(let i = 0; i < facetIconsCollection.length;i++){
      facetIconsCollection[i].onclick = function(){
      this.classList.toggle("active");
}
}

//mobile collection filter facets
let iconBtnMobile = document.querySelectorAll('.iconChange');
for(let i=0;i<iconBtnMobile.length;i++){
iconBtnMobile[i].onclick = function(){
let wrapperBox = iconBtnMobile[i].closest(".mobile-facets__content");
wrapperBox.classList.toggle('closeWrapper')
}
}
// Price Slider Filter
    (function() {
      const parent = document.querySelector('.range-slider');
      console.log(parent,"parent")
      if (!parent) {
        return;
      }
      const rangeS = parent.querySelectorAll('input[type="range"]'),
      numberS = parent.querySelectorAll('input[type="number"]');
      console.log(rangeS)
      rangeS.forEach((el) => {
        el.oninput = () => {
          let slide1 = parseFloat(rangeS[0].value),
              slide2 = parseFloat(rangeS[1].value);

          if (slide1 > slide2) {
            [slide1, slide2] = [slide2, slide1];
          }

          numberS[0].value = slide1;
          numberS[1].value = slide2;
        }
      });

      numberS.forEach((el) => {
        el.oninput = () => {
          let number1 = parseFloat(numberS[0].value),
              number2 = parseFloat(numberS[1].value);

          if (number1 > number2) {
            let tmp = number1;
            numberS[0].value = number2;
            numberS[1].value = tmp;
          }

          rangeS[0].value = number1;
          rangeS[1].value = number2;
        }
      });
    })();
// Get all the input fields with the class "flex-sort"
const inputFields = document.querySelectorAll('.flex-sort input[type="radio"]');

// Get the div where the selected text will be appended
const selectedTextDiv = document.querySelector('.cstmAppenSelectedTxt');

// Get the icon element that triggers the toggle
const iconOnChange = document.querySelector('.iconOnChange');

// Get the nearest sortRightWrapper and wraperSortDesk elements
const sortRightWrapper = iconOnChange.closest('.sortRightWrapper');
const wraperSortDesk = sortRightWrapper.querySelector('.wraperSortDesk');

// Function to update the selected text
function updateSelectedText() {
  // Find the checked input field
  const checkedInput = document.querySelector('.flex-sort input[type="radio"]:checked');

  if (checkedInput) {
    // Get the label text associated with the checked input
    const labelText = checkedInput.nextElementSibling.textContent;

    // Set the label text to the selected text div
    selectedTextDiv.textContent = labelText;
  }
}

// Function to toggle the "active" class
function toggleActiveClass() {
  sortRightWrapper.classList.toggle('active');
  wraperSortDesk.classList.toggle('active');
}

// Check the initially selected input field on page load
updateSelectedText();

// Add event listener to each input field
inputFields.forEach(function(input) {
  input.addEventListener('change', function() {
    // Update the selected text when an input field is changed
    updateSelectedText();
  });
});

// Add event listener to the icon for toggling the class
iconOnChange.addEventListener('click', function() {
  toggleActiveClass();
});


//end div re render
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'))
      this.onSubmitForm(searchParams, event)
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            const noJsElements = document.querySelectorAll('.no-js-list');
            noJsElements.forEach((el) => el.remove());
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event)
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);
