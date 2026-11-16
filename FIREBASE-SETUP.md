# تفعيل لوحة إدارة أبو جبير

1. في Firebase فعّل Email/Password من Authentication → Sign-in method.
2. أنشئ مستخدمًا في Authentication → Users بالبريد الداخلي التالي:

```text
admin@abu-jubair-298f0.firebaseapp.com
```

3. اضبط كلمة مرور هذا الحساب على **المقاول**؛ هذه هي كلمة الدخول التي سيكتبها أبو جبير في الموقع.
4. فعّل Firestore Database وStorage.
5. طبّق القواعد الموجودة في `firestore.rules` و`storage.rules` من Firebase Console.
6. افتح `/admin.html`، واكتب رمز الدخول فقط. لن يظهر البريد الداخلي في واجهة الموقع.
7. أضف الصورة والوصف. الحفظ الأول يكون مسودة مخفية، أو اختر الحفظ والنشر مباشرة.

لا تضع كلمة مرور Google أو Service Account داخل ملفات الموقع. لا تستخدم رمزًا قصيرًا؛ اختر رمزًا طويلًا يصعب تخمينه.
