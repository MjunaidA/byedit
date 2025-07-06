// page global
  // function heightCalulator() {
  //   console.log("calc height")
  //   document.addEventListener("DOMContentLoaded", function() {
  //     if (window.innerWidth <= 800) { // If the device width is less than or equal to 767px, exit the function
  //       return;
  //     }
  //     var childDivs = document.querySelectorAll(".contentHeight");
  //     var maxHeight = 0;
  //     for (var i = 0; i < childDivs.length; i++) {
  //       var height = childDivs[i].offsetHeight;
  //       if (height > maxHeight) {
  //         maxHeight = height;
  //       }
  //     }
  //     for (var i = 0; i < childDivs.length; i++) {
  //       childDivs[i].style.height = maxHeight + "px";
  //     }
  //   });
  // }
  // heightCalulator();

// global
  function mobileCaret() {
    console.log("mobile click");
    let navWrapper = document.querySelector('.meniItemWrapper');
    let navWrapper2 = document.querySelector('.navigationPageTemp');
    let iconHeader = document.querySelector('.iconHeader')
    navWrapper.classList.toggle('mobileActive');
    navWrapper2.classList.toggle('mobileActive');
    iconHeader.classList.toggle('mobileActive')
  }
