import { baseURL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search); // ดึง URL query string
    const userId = urlParams.get('user_id'); // ดึงค่า user_id


    // ตรวจสอบค่า user_id
    if (!userId) {
        // หากไม่มี user_id แสดงข้อความเตือนและบล็อคการใช้งาน
        document.getElementById('lockScreen').style.display = 'flex';  // แสดงล็อคหน้าจอ
        document.body.style.pointerEvents = 'none';
    } else {
        console.log('User ID:', userId); // แสดงค่าของ user_id ใน console
    }

    // กำหนดค่าให้กับ zone และ repairType
    const zones = ["หนองกระทุ่ม 1", "หนองกระทุ่ม 2", "หนองขอน", "กิโลแปด", "เขาประทุน", 
        "เขาแหลม", "ทัพผึ้งน้อย", "หนองยายเงิน", "ทัพหลวง", "หนองขาม", "หนองแก", 
        "สระบัวก่ำ", "ดงเชือก", "หนองกระทิง", "สามชุก", "ทุ่งโป่ง", "ลำอีซู", "หนองปรือ", "หนองมะค่า"];
    const repairTypes = ["อาคารสิ่งปลูกสร้าง", "เครื่องจักร-อุปกรณ์", "ยานพาหนะ", "เครื่องใช้ สนง.", "อุปกรณ์ระบบน้ำ-ระบบไฟ"];

    const zoneSelect = document.getElementById('zone');
    zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        zoneSelect.appendChild(option);
    });

    const repairTypeSelect = document.getElementById('repairType');
    repairTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        repairTypeSelect.appendChild(option);
    });

    // ฟังค์ชันสำหรับส่งข้อมูล
    document.getElementById('repairForm').addEventListener('submit', function (e) {
        e.preventDefault(); // ป้องกันการรีเฟรชหน้า
        console.log(getFormattedDateTime());

        const data = {
            user_id: userId,
            full_name: document.getElementById('fullName').value,
            phone_number: document.getElementById('phoneNumber').value,
            zone: document.getElementById('zone').value,
            repair_type: document.getElementById('repairType').value,
            details: document.getElementById('details').value,
            urgency: document.querySelector('input[name="urgency"]:checked').value,
            start_date_time : getFormattedDateTime()
        };

        // แปลงภาพเป็น Base64
        const imageFile = document.getElementById('imageUpload').files[0];
        if (imageFile) {
            const reader = new FileReader();

            reader.onload = function (e) {
                data.image = e.target.result; // เพิ่ม Base64 ลงใน data
                savedata(data); // ส่งข้อมูล
            };

            reader.onerror = function (error) {
                console.error("Error converting image to Base64:", error);
            };

            reader.readAsDataURL(imageFile); // แปลงภาพเป็น Base64
        } else {
            data.image = null; // ไม่มีการเลือกภาพ
            savedata(data); // ส่งข้อมูล
        }
    });

    function getFormattedDateTime() {
        const now = new Date(); // เวลาปัจจุบัน

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0
        const year = String(now.getFullYear() + 543).slice(-2); // เอาเฉพาะสองหลักสุดท้าย

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        // จัดรูปแบบเป็น "dd/mm/yy - h:m"
        return `${day}/${month}/${year} - ${hours}:${minutes}`;
    }

    // ฟังก์ชันสำหรับส่งข้อมูลไปยัง API แรก
    function savedata(data) {
        fetch(`${baseURL}/repairs/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((responseData) => {
            console.log("Success:", responseData);
            send_line_mechanic(data); // ส่งข้อมูลไปยัง API อันที่สอง

            // แสดงข้อความแจ้งเตือนว่า ส่งแจ้งซ่อมสำเร็จ
            alert('ส่งแจ้งซ่อมสำเร็จ!');
        })
        .catch((error) => {
            console.error("Error:", error);
            // แสดงข้อความแจ้งเตือนในกรณีที่มีข้อผิดพลาด
            alert('เกิดข้อผิดพลาดในการส่งข้อมูล');
        });
    }

    // ฟังก์ชันสำหรับส่งข้อมูลไปยัง API อันที่สอง
    function send_line_mechanic(data) {
        console.log(data);
        fetch(`${baseURL}/line/mechanic`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((secondResponseData) => {
            console.log("Second request success:", secondResponseData);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }
});
