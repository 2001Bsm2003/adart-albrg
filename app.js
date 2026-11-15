const KEY="adart_albrg_subscribers_v1";
let subscribers=JSON.parse(localStorage.getItem(KEY)||"[]");

const $=id=>document.getElementById(id);
const form=$("subscriberForm");

function saveData(){localStorage.setItem(KEY,JSON.stringify(subscribers));}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function statusOf(s){
  return s.paid ? '<span class="badge paid">تم التسديد</span>' : '<span class="badge unpaid">غير مسدد</span>';
}
function render(){
  const q=$("search").value.trim().toLowerCase();
  const rows=subscribers.filter(s=>
    [s.name,s.phone,s.account,s.plan].join(" ").toLowerCase().includes(q)
  );
  $("subscriberTable").innerHTML=rows.map(s=>`
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td dir="ltr">${escapeHtml(s.phone)}</td>
      <td>${escapeHtml(s.account)}</td>
      <td>${escapeHtml(s.plan)}</td>
      <td>${escapeHtml(s.amount)}</td>
      <td>${escapeHtml(s.dueDate)}</td>
      <td>${statusOf(s)}</td>
      <td>
        <button class="small pay" onclick="togglePaid('${s.id}')">${s.paid?"إلغاء التسديد":"تسديد"}</button>
        <button class="small edit" onclick="editSubscriber('${s.id}')">تعديل</button>
        <button class="small delete" onclick="deleteSubscriber('${s.id}')">حذف</button>
      </td>
    </tr>`).join("");
  $("emptyState").style.display=rows.length?"none":"block";
  $("totalSubscribers").textContent=subscribers.length;
  $("paidCount").textContent=subscribers.filter(s=>s.paid).length;
  $("unpaidCount").textContent=subscribers.filter(s=>!s.paid).length;
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("subscriberId").value;
  const data={
    name:$("name").value.trim(),
    phone:$("phone").value.trim(),
    account:$("account").value.trim(),
    plan:$("plan").value.trim(),
    amount:$("amount").value,
    dueDate:$("dueDate").value,
    paid:id ? (subscribers.find(s=>s.id===id)?.paid||false) : false
  };
  if(!data.name || !data.phone){alert("يرجى إدخال اسم المشترك ورقم الهاتف.");return;}
  if(id){
    const i=subscribers.findIndex(s=>s.id===id);
    subscribers[i]={...subscribers[i],...data,id};
  }else{
    subscribers.push({id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(),...data});
  }
  saveData(); form.reset(); $("subscriberId").value=""; $("formTitle").textContent="إضافة مشترك";
  $("saveBtn").textContent="حفظ المشترك"; $("cancelBtn").classList.add("hidden"); render();
  alert("تم حفظ بيانات المشترك.");
});

window.editSubscriber=id=>{
  const s=subscribers.find(x=>x.id===id); if(!s)return;
  $("subscriberId").value=s.id;$("name").value=s.name;$("phone").value=s.phone;
  $("account").value=s.account;$("plan").value=s.plan;$("amount").value=s.amount;$("dueDate").value=s.dueDate;
  $("formTitle").textContent="تعديل المشترك";$("saveBtn").textContent="حفظ التعديل";$("cancelBtn").classList.remove("hidden");
  scrollTo({top:0,behavior:"smooth"});
};
window.deleteSubscriber=id=>{
  if(!confirm("هل تريد حذف هذا المشترك؟"))return;
  subscribers=subscribers.filter(s=>s.id!==id);saveData();render();
};
window.togglePaid=id=>{
  const s=subscribers.find(x=>x.id===id);if(!s)return;
  s.paid=!s.paid;saveData();render();
};
$("cancelBtn").onclick=()=>{form.reset();$("subscriberId").value="";$("formTitle").textContent="إضافة مشترك";$("saveBtn").textContent="حفظ المشترك";$("cancelBtn").classList.add("hidden");};
$("search").addEventListener("input",render);

$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(subscribers,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="adart-albrg-data.json";a.click();
  URL.revokeObjectURL(a.href);
};
render();
