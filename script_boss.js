import { baseURL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search); // ดึง URL query string
    const jobID = urlParams.get('job_id'); // ดึงค่า user_id
    console.log(jobID)

    // ตรวจสอบค่า user_id
    if (!jobID) {
        // หากไม่มี user_id แสดงข้อความเตือนและบล็อคการใช้งาน
        document.getElementById('lockScreen').style.display = 'flex';  // แสดงล็อคหน้าจอ
        document.body.style.pointerEvents = 'none';
        return;
    }
    try {
        // เรียก API เพื่อเช็คสถานะ
        const response = await fetch(`${baseURL}/repairs/${jobID}`, {headers: {'Content-Type': 'application/json',"ngrok-skip-browser-warning": "69420"}});
        
        if (!response.ok) {
            document.getElementById('lockScreen').style.display = 'flex';
            document.body.style.pointerEvents = 'none';
            document.querySelector('.message h2').textContent = 'ไม่สามารถโหลดข้อมูลได้';
        }

        const data = await response.json();
        const repairStatus = data.repair.status; // ดึงค่า repair_status จาก API

        // ตรวจสอบสถานะ repair_status
        if (repairStatus !== 'รอผจกอนุมัติ') {
            document.getElementById('lockScreen').style.display = 'flex';
            document.body.style.pointerEvents = 'none';
            document.querySelector('.message h2').textContent = 'งานนี้ถูกดำเนินการไปแล้ว';
            return
        }
    } catch (error) {
        document.getElementById('lockScreen').style.display = 'flex';
        document.body.style.pointerEvents = 'none';
        document.querySelector('.message h2').textContent = 'ไม่สามารถโหลดข้อมูลได้';
    }

    const statusRadios = document.getElementsByName('boss_status');
    const reasonGroup = document.getElementById('reason-group');
    const form = document.getElementById('approval-form');
  
    // แสดง/ซ่อนช่องเหตุผลเมื่อเลือก "ไม่อนุมัติ"
    statusRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'ผจกไม่อนุมัติ') {
          reasonGroup.classList.remove('hidden');
        } else {
          reasonGroup.classList.add('hidden');
        }
      });
    });
  
    // จัดการการส่งฟอร์ม
    form.addEventListener('submit', (e) => {
      e.preventDefault();
            // ดึงค่าจากฟอร์ม
            const approverName = document.getElementById('approver-name').value;
            const status = document.querySelector('input[name="boss_status"]:checked').value;
            const reason = document.getElementById('reason').value;

            // สร้างอ็อบเจกต์สำหรับส่ง API
            const data = {
                job_id: jobID,
                approverName: approverName,
                status: status || null,
                reason: reason || 'เทส', // เพิ่ม null ถ้าไม่มีเหตุผล
                boss_approves_date_time : getFormattedDateTime()
            };
        
            send_line_mechanic(data)
            savedata(data)
    });
    function savedata(data) {
        fetch(`${baseURL}/editrepairs/${jobID}`, {
            method: "PUT",
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
            // alert("Request sent successfully!");

            // เมื่อการส่งข้อมูลสำเร็จ ให้เรียกฟังก์ชัน API อีกอันหนึ่ง
        })
        .catch((error) => {
            console.error("Error:", error);
            // alert("Failed to send request.");
        });
    }

    function send_line_mechanic(data) {
        console.log(data)
        fetch(`${baseURL}/line/mechanic/boss_option`, {
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
            // alert("Second request sent successfully!");
        })
        .catch((error) => {
            console.error("Error:", error);
            // alert("Failed to send second request.");
        });
    }

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
  });
  