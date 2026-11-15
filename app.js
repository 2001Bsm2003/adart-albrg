(() => {
"use strict";
const KEY="adart_albrg_new_v2";
let data=[];

const $=id=>document.getElementById(id);
function show(msg,ok=true){const el=$("message");el.textContent=msg;el.className="message "+(ok?"ok":"err");setTimeout(()=>{el.textContent="";el.className="message"},2500)}
function load(){
  try{const raw=localStorage.getItem(KEY);data=raw?JSON.parse(raw):[];if(!Array.isArray(data))data=[]}
  catch(e){data=[];show("تعذر قراءة التخزين المحلي.",false)}
  render();
}
function persist(){
  try{
    localStorage.setItem(KEY,JSON.stringify(data));
    const check=localStorage.getItem(KEY);
    if(check===null)throw new Error("storage");
    return true;
  }catch(e){show("المتصفح منع الحفظ المحلي. جرّب فتح الموقع في Safari مباشرة.",false);return false}
}
function render(){
  const q=$("search").value.trim().toLowerCase();
  const rows=data.filter(x=>[x.name,x.phone,x.account,x.plan].join(" ").toLowerCase().includes(q));
  $("total").textContent=data.length;
  $("paid").textContent=data.filter(x=>x.paid).length;
  $("unpaid").textContent=data.filter(x=>!x.paid).length;
  $("list").innerHTML=rows.map(x=>`
  <div class="item">
    <div>
      <strong>${esc(x.name)}</strong>
      <div class="meta">📱 ${esc(x.phone)}<br>👤 ${esc(x.account)} · 📡 ${esc(x.plan)} · 💰 ${esc(x.amount)}<br>📅 ${esc(x.due||"غير محدد")} ${x.paid?'<span class="badge paid">تم التسديد</span>':'<span class="badge unpaid">غير مسدد</span>'}</div>
    </div>
    <div class="actions">
      <button class="pay" onclick="togglePaid('${x.id}')">${x.paid?"إلغاء التسديد":"تسديد"}</button>
      <button class="edit" onclick="editItem('${x.id}')">تعديل</button>
      <button class="del" onclick="removeItem('${x.id}')">حذف</button>
    </div>
  </div>`).join("");
  $("empty").style.display=rows.length?"none":"block";
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("form").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("id").value;
  const obj={name:$("name").value.trim(),phone:$("phone").value.trim(),account:$("account").value.trim(),plan:$("plan").value.trim(),amount:$("amount").value.trim(),due:$("due").value,paid:false};
  if(!obj.name||!obj.phone){show("أدخل اسم المشترك ورقم الهاتف.",false);return}
  if(id){const old=data.find(x=>x.id===id);obj.id=id;obj.paid=old?old.paid:false;data=data.map(x=>x.id===id?obj:x)}
  else{obj.id=String(Date.now())+"-"+Math.random().toString(16).slice(2);data.push(obj)}
  if(persist()){show("تم الحفظ بنجاح ✅");$("form").reset();$("id").value="";$("title").textContent="إضافة مشترك جديد";$("cancel").classList.add("hidden");render()}
});
window.togglePaid=id=>{const x=data.find(x=>x.id===id);if(!x)return;x.paid=!x.paid;if(persist())render()};
window.editItem=id=>{const x=data.find(x=>x.id===id);if(!x)return;$("id").value=x.id;$("name").value=x.name;$("phone").value=x.phone;$("account").value=x.account;$("plan").value=x.plan;$("amount").value=x.amount;$("due").value=x.due;$("title").textContent="تعديل المشترك";$("cancel").classList.remove("hidden");scrollTo({top:0,behavior:"smooth"})};
window.removeItem=id=>{if(!confirm("حذف المشترك؟"))return;data=data.filter(x=>x.id!==id);if(persist())render()};
$("cancel").onclick=()=>{$("form").reset();$("id").value="";$("title").textContent="إضافة مشترك جديد";$("cancel").classList.add("hidden")};
$("search").addEventListener("input",render);
load();
})();