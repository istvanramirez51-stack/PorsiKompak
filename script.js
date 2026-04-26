document.addEventListener("DOMContentLoaded", () => {
  // GSAP Loading Animation
  gsap.to("#loader", {
    y: "-100%",
    duration: 0.8,
    ease: "power2.inOut",
    delay: 0.6
  });

  AOS.init({
    duration: 800,
    once: true,
    offset: 100
  });

  const USE_VIDEO = false; 
  const heroMedia = document.getElementById("heroMedia");
  if (heroMedia) {
    if (USE_VIDEO) {
      heroMedia.innerHTML = `
        <video class="hero-video" autoplay muted loop playsinline poster="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-friends-toasting-with-beers-and-eating-fries-at-a-bar-43703-large.mp4" type="video/mp4">
        </video>
      `;
    } else {
      heroMedia.innerHTML = `
        <img src="img/masak1.jpeg" class="hero-img" alt="PorsiKompak Hero">
      `;
    }
  }

  let cartDetails = [];
  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const cartCountEl = document.getElementById('cartCount');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalValEl = document.getElementById('cartTotalVal');
  const addToCartBtns = document.querySelectorAll('.add-to-cart');

  function getCartMarkup() {
    if (cartDetails.length === 0) {
      return `
        <div class="text-center mt-5 mb-5 h-100 d-flex flex-column align-items-center justify-content-center opacity-50 text-uppercase">
           <i class="ph-fill ph-empty ms-0 mb-3" style="font-size: 5rem;"></i>
           <div class="fw-bold fs-4 text-dark">Keranjang masih sepi.</div>
           <p class="fw-semibold">Yuk tambah menu kebangsaan dulu.</p>
        </div>
      `;
    }

    let markup = '';
    cartDetails.forEach((item, index) => {
      let extraPrice = 0;
      let toppingName = item.topping;
      if (item.topping && item.topping.includes('(+Rp')) {
        const match = item.topping.match(/\(\+Rp(\d+)k\)/);
        if (match && match[1]) {
          extraPrice = parseInt(match[1]) * 1000;
        }
      }
      const totalItemPrice = (item.price + extraPrice) * item.quantity;
      markup += `
        <div class="d-flex justify-content-between mb-2 p-3 bg-white border border-3 border-dark position-relative hover-highlight" style="transition: transform 0.2s;" onmouseenter="this.style.transform='translateX(5px)'" onmouseleave="this.style.transform='translateX(0)'">
          <div style="padding-right: 40px;">
             <h5 class="fw-bold mb-1 text-uppercase display-heading" style="line-height:1;">${item.name}</h5>
             <div class="text-dark fw-bold mb-1">${formatIDR(item.price + extraPrice)} <span class="text-muted small">x ${item.quantity}</span></div>
             ${toppingName ? `<div class="badge bg-warning text-dark border border-dark border-1 rounded-0 fw-bold mt-1 shadow-none">${toppingName}</div>` : ''}
          </div>
          <div class="fw-bold fs-5 text-dark d-flex align-items-center">
             ${formatIDR(totalItemPrice)}
          </div>
          <button class="btn btn-danger brutalist-btn position-absolute top-0 end-0 translate-middle border-2 text-white p-0 d-flex align-items-center justify-content-center" onclick="window.removeCartItem(${index})" style="width: 25px; height: 25px;">
             <i class="ph-bold ph-x fs-6"></i>
          </button>
        </div>
      `;
    });
    return markup;
  }

  function updateCartUI() {
    let grandTotal = 0;
    cartDetails.forEach(item => {
      let extraPrice = 0;
      if (item.topping && item.topping.includes('(+Rp')) {
        const match = item.topping.match(/\(\+Rp(\d+)k\)/);
        if (match && match[1]) {
          extraPrice = parseInt(match[1]) * 1000;
        }
      }
      grandTotal += (item.price + extraPrice) * item.quantity;
    });

    cartItemsContainer.innerHTML = getCartMarkup();
    cartTotalValEl.innerText = formatIDR(grandTotal);
    const totalQty = cartDetails.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.innerText = totalQty;
    gsap.fromTo(cartCountEl, { scale: 1.5, color: '#FFD600' }, { scale: 1, color: "inherit", duration: 0.3 });
  }

  window.removeCartItem = function(index) {
    cartDetails.splice(index, 1);
    updateCartUI();
  };

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'));
      const parentCard = btn.closest('.card-body');
      const selectEl = parentCard.querySelector('.topping-select');
      const topping = selectEl ? selectEl.value : '';

      const existItem = cartDetails.find(item => item.id === id && item.topping === topping);
      if (existItem) {
        existItem.quantity += 1;
      } else {
        cartDetails.push({ id, name, price, topping, quantity: 1 });
      }

      gsap.fromTo(parentCard, { scale: 0.98 }, { scale: 1, duration: 0.2, ease: "back.out(1.7)" });
      updateCartUI();
      
      if(window.bootstrap) {
          const bsOffcanvas = new bootstrap.Offcanvas(document.getElementById('cartSidebar'));
          bsOffcanvas.show();
          setTimeout(() => bsOffcanvas.hide(), 2000);
      }
    });
  });

// --- BAGIAN KALKULATOR ANTI RIBET (FIXED) ---
  const btnCalculate = document.getElementById('btnCalculate');
  const calcTotal = document.getElementById('calcTotal');
  const calcPeople = document.getElementById('calcPeople');
  const calcResultBox = document.getElementById('calcResultBox');
  const calcResultVal = document.getElementById('calcResultVal');
  const btnCheckoutCalc = document.getElementById('btnCheckoutCalc');

  if (btnCalculate) {
    btnCalculate.addEventListener('click', () => {
      // Ambil nilai dan pastikan dikonversi ke angka
      const total = parseFloat(calcTotal.value);
      const people = parseInt(calcPeople.value);

      if (total > 0 && people > 0) {
        // Hitung hasil bagi murni
        const rawPerPerson = total / people;
        
        // Menampilkan hasil dengan format IDR yang rapi (Tanpa pembulatan paksa ke ribuan)
        calcResultVal.innerText = formatIDR(rawPerPerson);
        
        // Munculkan box hasil dengan animasi
        calcResultBox.classList.remove('d-none');
        btnCheckoutCalc.classList.remove('d-none');
        gsap.fromTo(calcResultBox, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)" }
        );
      } else {
        alert("Masukin data yang bener dong! Jumlah uang dan orang harus lebih dari 0.");
      }
    });
  }
  // --- END OF FIX ---

  const waNumber = '6281234567890';
  const checkoutWaBtn = document.getElementById('checkoutWaBtn');
  if (checkoutWaBtn) {
    checkoutWaBtn.addEventListener('click', () => {
      if (cartDetails.length === 0) {
        alert('Keranjangnya masih kosong bos, beli dulu gih!');
        return;
      }
      let textLine = 'Halo Admin PorsiKompak, mau order nih buat rombongan:%0A%0A';
      let grandTotal = 0;
      cartDetails.forEach((item, idx) => {
        let extraPrice = 0;
        if (item.topping && item.topping.includes('(+Rp')) {
          const match = item.topping.match(/\(\+Rp(\d+)k\)/);
          if (match && match[1]) { extraPrice = parseInt(match[1]) * 1000; }
        }
        const subTotal = (item.price + extraPrice) * item.quantity;
        grandTotal += subTotal;
        textLine += idx + 1 + '. *' + item.name + '* (x' + item.quantity + ')%0A';
        if(item.topping) textLine += '   - Topping: ' + item.topping + '%0A';
      });
      textLine += '%0A*TOTAL TAGIHAN EST: ' + formatIDR(grandTotal) + '*%0A%0A';
      textLine += 'Kirim ke kosan gw ya min, thx!';
      window.open('https://wa.me/' + waNumber + '?text=' + textLine, '_blank');
    });
  }

  if (btnCheckoutCalc) {
    btnCheckoutCalc.addEventListener('click', () => {
      const total = calcTotal.value;
      const people = calcPeople.value;
      const text = 'Halo Admin, kita rombongan ' + people + ' orang mau order menu PorsiKompak. Total budget kita sekitar Rp' + total + '. Boleh minta rekomendasi / lanjut order?';
      window.open('https://wa.me/' + waNumber + '?text=' + text, '_blank');
    });
  }
});
