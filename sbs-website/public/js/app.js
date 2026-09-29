const CATS=["All","Electronics & Parts","Mobiles & Accessories","Clothing","Hardware & Tools","Home & Kitchen","Auto Parts","Other"];
const CATS_UR={"All":"تمام","Electronics & Parts":"الیکٹرانکس اور پرزے","Mobiles & Accessories":"موبائل اور لوازمات","Clothing":"کپڑے","Hardware & Tools":"ہارڈویئر اور اوزار","Home & Kitchen":"گھر اور باورچی خانہ","Auto Parts":"گاڑیوں کے پرزے","Other":"دیگر"};
const MARKETS=[
  {key:"All",en:"All markets",ur:"تمام مارکیٹیں",d_en:"Browse everything",d_ur:"سب کچھ دیکھیں"},
  {key:"Shershah",en:"Shershah",ur:"شیرشاہ",d_en:"Auto parts & industrial",d_ur:"گاڑیوں کے پرزے اور صنعتی سامان"},
  {key:"Bolton Market",en:"Bolton Market",ur:"بولٹن مارکیٹ",d_en:"Electronics & wholesale",d_ur:"الیکٹرانکس اور تھوک"},
  {key:"Saddar",en:"Saddar",ur:"صدر",d_en:"Clothing & everyday goods",d_ur:"کپڑے اور روزمرہ اشیاء"}
];
const I18N={
en:{topbar:"Order by phone or WhatsApp:",tagline:"Karachi's markets, one storefront",searchPh:"Search products…",myOrders:"My orders",cart:"Cart",installApp:"⬇ Install App",
 eyebrow:"Direct from Karachi's markets",heroTitle:"Shershah, Bolton & Saddar — now in one place.",
 heroSub:"We source products from three of Karachi's biggest markets and bring them to you. Browse, order online, or call us.",
 shopNow:"Shop now",orderWa:"Order on WhatsApp",
 t1h:"Sourced from 3 markets",t1p:"Shershah, Bolton Market and Saddar",t2h:"Online or in person",t2p:"Order here or visit our shop",t3h:"Easy payment",t3p:"Pay on delivery or by bank transfer",
 latest:"Latest products",items:"products",addToCart:"Add to cart",emptyGrid:"No products found.",
 yourCart:"Your cart",total:"Total",emptyCart:"Your cart is empty.",lblCustName:"Your name",lblCustPhone:"Phone number",lblCustAddr:"Delivery address",
 placeOrder:"Place order",codNote:"Pay on delivery or by bank transfer — we'll call you to confirm.",fill:"Please fill in your name, phone and address.",
 orderOk:"Thank you! Your order was received. Order number:",myOrdersTitle:"My orders",lblPhoneLookup:"Phone number you ordered with",find:"Find my orders",noOrders:"No orders found.",
 footAbout:"Products from Karachi's Shershah, Bolton Market and Saddar — online and in person.",footMarkets:"Markets",footContact:"Contact",rights:"All rights reserved."},
ur:{topbar:"فون یا واٹس ایپ پر آرڈر کریں:",tagline:"کراچی کی مارکیٹیں، ایک ہی دکان",searchPh:"مصنوعات تلاش کریں…",myOrders:"میرے آرڈرز",cart:"کارٹ",installApp:"⬇ ایپ انسٹال کریں",
 eyebrow:"براہ راست کراچی کی مارکیٹوں سے",heroTitle:"شیرشاہ، بولٹن اور صدر — اب ایک ہی جگہ۔",
 heroSub:"ہم کراچی کی تین بڑی مارکیٹوں سے مصنوعات لا کر آپ تک پہنچاتے ہیں۔ دیکھیں، آن لائن آرڈر کریں، یا ہمیں کال کریں۔",
 shopNow:"خریداری کریں",orderWa:"واٹس ایپ پر آرڈر کریں",
 t1h:"تین مارکیٹوں سے",t1p:"شیرشاہ، بولٹن مارکیٹ اور صدر",t2h:"آن لائن یا خود آ کر",t2p:"یہاں آرڈر کریں یا ہماری دکان پر آئیں",t3h:"آسان ادائیگی",t3p:"ڈیلیوری پر یا بینک ٹرانسفر",
 latest:"تازہ ترین مصنوعات",items:"مصنوعات",addToCart:"کارٹ میں شامل کریں",emptyGrid:"کوئی پروڈکٹ نہیں ملی۔",
 yourCart:"آپ کا کارٹ",total:"کل رقم",emptyCart:"آپ کا کارٹ خالی ہے۔",lblCustName:"آپ کا نام",lblCustPhone:"فون نمبر",lblCustAddr:"ڈیلیوری کا پتہ",
 placeOrder:"آرڈر دیں",codNote:"ڈیلیوری پر یا بینک ٹرانسفر سے ادائیگی — تصدیق کے لیے ہم آپ کو کال کریں گے۔",fill:"براہ کرم نام، فون اور پتہ درج کریں۔",
 orderOk:"شکریہ! آپ کا آرڈر مل گیا۔ آرڈر نمبر:",myOrdersTitle:"میرے آرڈرز",lblPhoneLookup:"وہ فون نمبر جس سے آرڈر کیا",find:"میرے آرڈرز تلاش کریں",noOrders:"کوئی آرڈر نہیں ملا۔",
 footAbout:"کراچی کی شیرشاہ، بولٹن مارکیٹ اور صدر سے مصنوعات — آن لائن اور دکان پر۔",footMarkets:"مارکیٹیں",footContact:"رابطہ",rights:"جملہ حقوق محفوظ ہیں۔"}
};
let lang="en",cat="All",market="All",products=[],cart=[];
try{cart=JSON.parse(localStorage.getItem("sbs_cart")||"[]");}catch(e){}
const $=id=>document.getElementById(id);
const t=k=>I18N[lang][k]||k;
const esc=s=>{const d=document.createElement("div");d.innerText=String(s??"");return d.innerHTML;};
const pkr=n=>"PKR "+Number(n).toLocaleString();
const saveCart=()=>{try{localStorage.setItem("sbs_cart",JSON.stringify(cart));}catch(e){}};

function applyI18n(){
  document.body.classList.toggle("urdu",lang==="ur");
  $("htmlRoot").dir=lang==="ur"?"rtl":"ltr";$("htmlRoot").lang=lang;
  $("langBtn").textContent=lang==="en"?"اردو":"English";
  document.querySelectorAll("[data-i18n]").forEach(el=>el.textContent=t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>el.placeholder=t(el.dataset.i18nPh));
  renderCats();renderMarkets();renderGrid();renderCart();
}
function renderCats(){
  const nav=$("categoryNav");nav.innerHTML="";
  CATS.forEach(c=>{const b=document.createElement("button");b.className="chip"+(c===cat?" active":"");
    b.textContent=lang==="ur"?CATS_UR[c]:c;b.onclick=()=>{cat=c;renderCats();load();};nav.appendChild(b);});
}
function renderMarkets(){
  const box=$("marketCards");box.innerHTML="";
  MARKETS.forEach(m=>{const b=document.createElement("button");b.className="mcard"+(m.key===market?" active":"");
    b.innerHTML=`<div><b>${lang==="ur"?m.ur:m.en}</b><span>${lang==="ur"?m.d_ur:m.d_en}</span></div><i>›</i>`;
    b.onclick=()=>{market=m.key;renderMarkets();renderGrid();document.getElementById("products").scrollIntoView();};box.appendChild(b);});
}
async function load(){
  const p=new URLSearchParams();if(cat!=="All")p.set("category",cat);
  const q=$("searchBox").value.trim();if(q)p.set("q",q);
  try{const r=await fetch("/api/products?"+p);products=await r.json();}catch(e){products=[];}
  renderGrid();
}
function renderGrid(){
  const list=products.filter(p=>market==="All"||p.market===market);
  const g=$("productGrid");g.innerHTML="";
  $("resultCount").textContent=list.length+" "+t("items");
  if(!list.length){g.innerHTML=`<div class="empty">${t("emptyGrid")}</div>`;return;}
  list.forEach(p=>{const c=document.createElement("article");c.className="card";
    c.innerHTML=`<div class="img">${p.image_data?`<img loading="lazy" alt="${esc(p.name)}" src="${p.image_data}">`:"🛍️"}</div>
    <div class="body"><span class="tag">${esc(p.market)}</span><h3>${esc(p.name)}</h3><div class="price">${pkr(p.price)}</div>
    <button class="btn primary">${t("addToCart")}</button></div>`;
    c.querySelector("button").onclick=()=>addToCart(p);g.appendChild(c);});
}
function addToCart(p){const e=cart.find(x=>x.id===p.id);if(e)e.qty++;else cart.push({id:p.id,name:p.name,price:p.price,qty:1});
  saveCart();renderCart();openCart();}
function changeQty(id,d){const e=cart.find(x=>x.id===id);if(!e)return;e.qty+=d;if(e.qty<=0)cart=cart.filter(x=>x.id!==id);saveCart();renderCart();}
function renderCart(){
  $("cartCount").textContent=cart.reduce((s,c)=>s+c.qty,0);
  const box=$("cartItems");box.innerHTML="";
  const has=cart.length>0;
  $("orderForm").hidden=!has;$("cartTotalRow").hidden=!has;
  if(!has&&$("orderSuccess").hidden)box.innerHTML=`<p class="note">${t("emptyCart")}</p>`;
  let total=0;
  cart.forEach(c=>{total+=c.price*c.qty;const r=document.createElement("div");r.className="cart-item";
    r.innerHTML=`<div class="nm">${esc(c.name)}<div class="qty"><button>−</button><span>${c.qty}</span><button>+</button></div></div><b>${pkr(c.price*c.qty)}</b>`;
    const [m,p]=r.querySelectorAll("button");m.onclick=()=>changeQty(c.id,-1);p.onclick=()=>changeQty(c.id,1);box.appendChild(r);});
  $("cartTotal").textContent=pkr(total);
}
function openCart(){$("cartPanel").classList.add("show");$("overlay").classList.add("show");}
function closeCart(){$("cartPanel").classList.remove("show");$("overlay").classList.remove("show");}
$("orderForm").addEventListener("submit",async e=>{
  e.preventDefault();const err=$("orderError");err.hidden=true;
  const customerName=$("custName").value.trim(),phone=$("custPhone").value.trim(),address=$("custAddr").value.trim();
  if(!customerName||!phone||!address){err.textContent=t("fill");err.hidden=false;return;}
  try{
    const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({customerName,phone,address,items:cart.map(c=>({productId:c.id,qty:c.qty}))})});
    if(!r.ok)throw 0;const d=await r.json();
    cart=[];saveCart();renderCart();$("orderForm").reset();
    const s=$("orderSuccess");s.hidden=false;s.textContent=t("orderOk")+" #"+d.orderId;
  }catch(x){err.textContent=t("fill");err.hidden=false;}
});
$("lookupBtn").onclick=async()=>{
  const phone=$("lookupPhone").value.trim();const list=$("myOrdersList");list.innerHTML="";if(!phone)return;
  const r=await fetch("/api/orders?phone="+encodeURIComponent(phone));const o=r.ok?await r.json():[];
  if(!o.length){list.innerHTML=`<p class="note">${t("noOrders")}</p>`;return;}
  o.forEach(x=>{const d=document.createElement("div");d.className="order-row";
    d.innerHTML=`<span class="status">${esc(x.status)}</span><br>#${x.id} · ${esc(x.created_at)}<br>${x.items.map(i=>esc(i.name)+" × "+i.qty).join(", ")}<br><b>${pkr(x.total)}</b>`;list.appendChild(d);});
};
$("cartBtn").onclick=()=>{$("orderSuccess").hidden=true;renderCart();openCart();};
$("closeCart").onclick=closeCart;$("overlay").onclick=closeCart;
$("myOrdersBtn").onclick=()=>$("myOrdersModalBg").classList.add("show");
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).classList.remove("show"));
$("langBtn").onclick=()=>{lang=lang==="en"?"ur":"en";applyI18n();};
let st;$("searchBox").addEventListener("input",()=>{clearTimeout(st);st=setTimeout(load,250);});
$("year").textContent=new Date().getFullYear();
applyI18n();load();
if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("/service-worker.js").catch(()=>{}));}

// Custom "Install App" button — shows only once Chrome confirms the site
// meets its installability rules (manifest + service worker + HTTPS).
let deferredInstallPrompt=null;
window.addEventListener("beforeinstallprompt",(e)=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  $("installBtn").hidden=false;
});
$("installBtn").addEventListener("click",async()=>{
  if(!deferredInstallPrompt)return;
  $("installBtn").hidden=true;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt=null;
});
window.addEventListener("appinstalled",()=>{$("installBtn").hidden=true;deferredInstallPrompt=null;});
