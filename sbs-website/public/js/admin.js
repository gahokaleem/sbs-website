const $=id=>document.getElementById(id);
const esc=s=>{const d=document.createElement("div");d.innerText=String(s??"");return d.innerHTML;};
const pkr=n=>"PKR "+Number(n).toLocaleString();

async function init(){
  const r=await fetch("/api/auth/me");const d=await r.json();
  adminName=d.username||"";$("newUser").value=adminName;
  d.isAdmin?showApp():showLogin();
}
function showLogin(){$("loginView").hidden=false;$("appView").hidden=true;}
let adminName="";
function showApp(){$("loginView").hidden=true;$("appView").hidden=false;loadOrders();loadProducts();}

$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();const err=$("loginError");err.hidden=true;
  const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username:$("loginUser").value.trim(),password:$("loginPass").value})});
  if(!r.ok){err.textContent="Wrong username or password.";err.hidden=false;return;}
  $("loginPass").value="";showApp();
});
$("logoutBtn").onclick=async()=>{await fetch("/api/auth/logout",{method:"POST"});showLogin();};

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));
  ["orders","products","add","account"].forEach(n=>$("tab-"+n).hidden=(n!==b.dataset.tab));
});

async function loadOrders(){
  const r=await fetch("/api/orders");if(r.status===401)return showLogin();
  const orders=await r.json();const f=$("statusFilter").value;
  $("newCount").textContent=orders.filter(o=>o.status==="New").length;
  const box=$("ordersList");box.innerHTML="";
  const list=orders.filter(o=>!f||o.status===f);
  if(!list.length){box.innerHTML='<p class="muted">No orders yet.</p>';return;}
  list.forEach(o=>{const d=document.createElement("div");d.className="order";
    d.innerHTML=`<div class="top"><b>#${o.id} · ${esc(o.customer_name)}</b><span class="st">${esc(o.status)}</span></div>
    <div class="muted">${esc(o.phone)} · ${esc(o.address)}</div>
    <p style="margin:.5rem 0">${o.items.map(i=>esc(i.name)+" × "+i.qty).join(", ")}</p>
    <b>${pkr(o.total)}</b> <span class="muted">· ${esc(o.created_at)}</span><br>
    <select>${["New","Processing","Delivered","Cancelled"].map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select>`;
    d.querySelector("select").onchange=async ev=>{
      await fetch("/api/orders/"+o.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:ev.target.value})});
      loadOrders();};
    box.appendChild(d);});
}
$("statusFilter").onchange=loadOrders;

async function loadProducts(){
  const r=await fetch("/api/products");const list=await r.json();
  $("prodCount").textContent=list.length+" products";
  const box=$("productsList");box.innerHTML="";
  list.forEach(p=>{const d=document.createElement("div");d.className="prow";
    d.innerHTML=`${p.image_data?`<img src="${p.image_data}" alt="">`:'<div class="ph">🛍️</div>'}
    <div class="info"><b>${esc(p.name)}</b><br><small>${esc(p.market)} · ${esc(p.category)} · ${pkr(p.price)}</small></div>
    <button class="btn danger">Delete</button>`;
    d.querySelector("button").onclick=async()=>{
      if(!confirm("Delete “"+p.name+"”?"))return;
      await fetch("/api/products/"+p.id,{method:"DELETE"});loadProducts();};
    box.appendChild(d);});
}

// Shrink big phone photos before upload so the database stays small and pages load fast
function resizeImage(file,max=900){
  return new Promise(res=>{
    const img=new Image();img.onload=()=>{
      const s=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      c.toBlob(b=>res(b),"image/jpeg",0.82);};
    img.onerror=()=>res(file);img.src=URL.createObjectURL(file);});
}
$("pImage").onchange=()=>{const f=$("pImage").files[0];const p=$("preview");
  if(f){p.src=URL.createObjectURL(f);p.hidden=false;}else p.hidden=true;};

$("addForm").addEventListener("submit",async e=>{
  e.preventDefault();$("addError").hidden=true;$("addOk").hidden=true;
  const fd=new FormData();
  fd.append("name",$("pName").value.trim());fd.append("price",$("pPrice").value);
  fd.append("market",$("pMarket").value);fd.append("category",$("pCategory").value);
  const f=$("pImage").files[0];
  if(f){const blob=await resizeImage(f);fd.append("image",blob,"photo.jpg");}
  const r=await fetch("/api/products",{method:"POST",body:fd});
  if(!r.ok){const d=await r.json().catch(()=>({}));$("addError").textContent=d.error||"Could not add product.";$("addError").hidden=false;return;}
  $("addForm").reset();$("preview").hidden=true;$("addOk").hidden=false;loadProducts();
});

$("pwForm").addEventListener("submit",async e=>{
  e.preventDefault();$("pwError").hidden=true;$("pwOk").hidden=true;
  const r=await fetch("/api/auth/change-password",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({currentPassword:$("curPass").value,newPassword:$("newPass").value,newUsername:$("newUser").value})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){$("pwError").textContent=d.error||"Could not save.";$("pwError").hidden=false;return;}
  $("curPass").value="";$("newPass").value="";$("pwOk").hidden=false;
});

init();
