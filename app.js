(() => {
  "use strict";

  const KEY = "adart_albrg_subscribers_v2";

  const $ = (id) => document.getElementById(id);

  let data = [];

  // تحميل البيانات من الجهاز
  function load() {
    try {
      const saved = localStorage.getItem(KEY);
      data = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(data)) {
        data = [];
      }
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
      data = [];
    }

    render();
  }

  // حفظ البيانات في الجهاز
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));

      // التأكد أن البيانات انحفظت فعلاً
      const check = localStorage.getItem(KEY);

      if (check === JSON.stringify(data)) {
        return true;
      }

      return false;
    } catch (error) {
      console.error("خطأ في الحفظ:", error);
      return false;
    }
  }

  // رسالة للمستخدم
  function show(message) {
    let box = $("messageBox");

    if (!box) {
      box = document.createElement("div");
      box.id = "messageBox";

      box.style.position = "fixed";
      box.style.top = "20px";
      box.style.left = "20px";
      box.style.right = "20px";
      box.style.zIndex = "99999";
      box.style.padding = "15px";
      box.style.borderRadius = "12px";
      box.style.textAlign = "center";
      box.style.fontSize = "18px";
      box.style.fontWeight = "bold";
      box.style.background = "#d1fae5";
      box.style.color = "#065f46";
      box.style.boxShadow = "0 5px 20px rgba(0,0,0,.15)";

      document.body.appendChild(box);
    }

    box.textContent = message;
    box.style.display = "block";

    clearTimeout(box._timer);

    box._timer = setTimeout(() => {
      box.style.display = "none";
    }, 2500);
  }

  // حماية النصوص
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // عرض الحالة
  function statusOf(item) {
    if (item.paid) {
      return `<span class="badge paid">تم التسديد ✅</span>`;
    }

    return `<span class="badge unpaid">غير مسدد 🔴</span>`;
  }

  // رسم قائمة المشتركين
  function render() {
    const search = $("search")
      ? $("search").value.trim().toLowerCase()
      : "";

    const rows = data.filter((x) => {
      const text = [
        x.name,
        x.phone,
        x.account,
        x.plan
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(search);
    });

    if ($("total")) {
      $("total").textContent = data.length;
    }

    if ($("paid")) {
      $("paid").textContent =
        data.filter((x) => x.paid).length;
    }

    if ($("unpaid")) {
      $("unpaid").textContent =
        data.filter((x) => !x.paid).length;
    }

    if ($("list")) {
      $("list").innerHTML = rows
        .map(
          (x) => `
          <div class="item">
            <div>
              <strong>${esc(x.name)}</strong>

              <div class="meta">
                📱 ${esc(x.phone || "-")}<br>
                👤 ${esc(x.account || "-")}<br>
                📦 ${esc(x.plan || "-")}<br>
                💰 ${esc(x.amount || "0")} د.ع<br>
                📅 ${esc(x.dueDate || "-")}<br>
                ${statusOf(x)}
              </div>
            </div>

            <div class="actions">
              <button
                class="pay"
                onclick="togglePaid('${x.id}')">
                ${x.paid ? "إلغاء التسديد" : "تسديد"}
              </button>

              <button
                class="edit"
                onclick="editItem('${x.id}')">
                تعديل
              </button>

              <button
                class="del"
                onclick="removeItem('${x.id}')">
                حذف
              </button>
            </div>
          </div>
        `
        )
        .join("");
    }

    if ($("empty")) {
      $("empty").style.display =
        rows.length ? "none" : "block";
    }
  }

  // إضافة / تعديل مشترك
  if ($("form")) {
    $("form").addEventListener("submit", (e) => {
      e.preventDefault();

      const id = $("id") ? $("id").value : "";

      const obj = {
        name: $("name") ? $("name").value.trim() : "",
        phone: $("phone") ? $("phone").value.trim() : "",
        account: $("account")
          ? $("account").value.trim()
          : "",
        plan: $("plan")
          ? $("plan").value.trim()
          : "",
        amount: $("amount")
          ? $("amount").value.trim()
          : "",
        dueDate: $("dueDate")
          ? $("dueDate").value
          : "",
        paid: false
      };

      // الاسم ورقم الهاتف مطلوبان
      if (!obj.name || !obj.phone) {
        show("يرجى إدخال اسم المشترك ورقم الهاتف");
        return;
      }

      // تعديل مشترك موجود
      if (id) {
        const old = data.find((x) => x.id === id);

        if (!old) {
          show("المشترك غير موجود");
          return;
        }

        obj.id = id;
        obj.paid = old.paid;

        const index = data.findIndex(
          (x) => x.id === id
        );

        data[index] = obj;
      }

      // إضافة مشترك جديد
      else {
        obj.id =
          Date.now().toString() +
          "-" +
          Math.random().toString(36).substring(2, 9);

        data.push(obj);
      }

      // الحفظ الفعلي
      const saved = persist();

      if (saved) {
        show("تم الحفظ بنجاح ✅");

        $("form").reset();

        if ($("id")) {
          $("id").value = "";
        }

        if ($("formTitle")) {
          $("formTitle").textContent =
            "إضافة مشترك";
        }

        render();
      } else {
        show("تعذر حفظ البيانات ❌");
      }
    });
  }

  // تسديد / إلغاء التسديد
  window.togglePaid = (id) => {
    const item = data.find((x) => x.id === id);

    if (!item) {
      show("المشترك غير موجود");
      return;
    }

    item.paid = !item.paid;

    if (persist()) {
      show(
        item.paid
          ? "تم تسجيل التسديد ✅"
          : "تم إلغاء التسديد"
      );

      render();
    } else {
      show("تعذر حفظ حالة التسديد ❌");
    }
  };

  // تعديل
  window.editItem = (id) => {
    const item = data.find((x) => x.id === id);

    if (!item) {
      show("المشترك غير موجود");
      return;
    }

    if ($("id")) $("id").value = item.id;
    if ($("name")) $("name").value = item.name || "";
    if ($("phone")) $("phone").value = item.phone || "";
    if ($("account")) {
      $("account").value = item.account || "";
    }
    if ($("plan")) {
      $("plan").value = item.plan || "";
    }
    if ($("amount")) {
      $("amount").value = item.amount || "";
    }
    if ($("dueDate")) {
      $("dueDate").value = item.dueDate || "";
    }

    if ($("formTitle")) {
      $("formTitle").textContent =
        "تعديل المشترك";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // حذف
  window.removeItem = (id) => {
    const item = data.find((x) => x.id === id);

    if (!item) {
      show("المشترك غير موجود");
      return;
    }

    if (
      !confirm(
        `هل تريد حذف المشترك "${item.name}"؟`
      )
    ) {
      return;
    }

    data = data.filter((x) => x.id !== id);

    if (persist()) {
      show("تم حذف المشترك ✅");
      render();
    } else {
      show("تعذر حفظ عملية الحذف ❌");
    }
  };

  // زر إلغاء التعديل
  if ($("cancel")) {
    $("cancel").onclick = () => {
      if ($("form")) $("form").reset();

      if ($("id")) {
        $("id").value = "";
      }

      if ($("formTitle")) {
        $("formTitle").textContent =
          "إضافة مشترك";
      }
    };
  }

  // البحث
  if ($("search")) {
    $("search").addEventListener(
      "input",
      render
    );
  }

  // تشغيل البرنامج
  load();
})();
