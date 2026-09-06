# MeetingScribe — Deploy บน Vercel (ให้ปุ่มสรุป AI ทำงานจริง)

Tool บันทึกเสียงประชุม / ถอดเสียง / สรุป MOM / สร้าง Process Diagram
ไฟล์เดียว + backend function เล็ก ๆ 1 ไฟล์ สำหรับให้ปุ่ม "สรุปด้วย AI" ทำงานได้ทั้งทีม

## โครงสร้างไฟล์
```
index.html          ← ตัว tool (หน้าเว็บ)
vercel.json         ← config
api/summarize.js    ← backend function เก็บ API key ไว้ฝั่ง server
```

---

## Deploy (ครั้งเดียว)

### 1. เอาโค้ดขึ้น Vercel
เลือกทางใดทางหนึ่ง:

**ทาง CLI (แนะนำ)** — เปิด Terminal ในโฟลเดอร์นี้:
```bash
npm i -g vercel
vercel login
vercel --prod
```

**ทาง GitHub** — push โฟลเดอร์นี้ขึ้น repo → Vercel → Add New → Project → Import → Deploy

### 2. ใส่ API Key (สำคัญ — ไม่ใส่ปุ่มสรุปจะไม่ทำงาน)
1. ไปที่ https://console.anthropic.com → สร้าง API Key
2. Vercel → เลือก project → **Settings → Environment Variables**
3. เพิ่ม 1 ตัว:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (key ที่ได้จากข้อ 1)
   - Environments: ติ๊กทั้ง Production / Preview / Development
4. (ถ้าต้องการ) เพิ่มอีกตัวเพื่อเปลี่ยน model:
   - **Name:** `ANTHROPIC_MODEL`  **Value:** `claude-sonnet-5` (ค่า default อยู่แล้ว ไม่ใส่ก็ได้)
5. **Redeploy** ครั้งหนึ่ง (Deployments → ⋯ → Redeploy) เพื่อให้ env var มีผล

เสร็จ — เปิด URL แล้วกด "สรุปด้วย AI (ในตัว)" ได้เลย

---

## กันคนนอกเข้า tool (ถ้ามีข้อมูลลูกค้า/NDA)
- Vercel → Settings → **Deployment Protection** → เปิด Password Protection หรือ Vercel Authentication
  (ฟีเจอร์นี้อยู่ในแพลน Pro)
- อีกทางคือ deploy บน server ภายในบริษัทแทน

---

## หมายเหตุ
- **ค่าใช้จ่าย:** ปุ่มสรุปเรียก Anthropic API ตามจริง (คิดเป็น token ต่อครั้ง) — ใช้ key ขององค์กร
- **ถ้าไม่อยากมีค่า API เลย:** ลบโฟลเดอร์ `api/` ทิ้ง → ปุ่มสรุปจะ fallback เป็นโหมด "คัดลอก Prompt → วางใน Claude" อัตโนมัติ (ฟรี ผลเหมือนกัน)
- **ไมโครโฟน:** ทำงานเฉพาะบน https (Vercel เป็น https อยู่แล้ว) และ Chrome/Edge เท่านั้น
- **ข้อมูลประชุม** เก็บในเครื่องผู้ใช้แต่ละคน ไม่ได้ขึ้น server — ส่งงานต่อกันด้วยปุ่ม Save .json / Load
